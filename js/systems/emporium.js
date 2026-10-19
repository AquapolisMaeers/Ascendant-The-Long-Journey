'use strict';
(function(G,D,S) {
  const freshPet=type=>({type,level:1,xp:0,ascensions:0,hunger:100,health:100,updatedAt:Date.now()});
  const idle=()=>{ G.ensureProgress(); G.assert(!G.character().dungeon&&!S.tutorial.active(),'Finish the tutorial and leave the dungeon first.'); };
  S.emporium = {
    normalize(c) { c.regalia ??= {owned:[],outfit:null,aura:null}; c.regalia.mount ??= null; c.specialPets ??= []; c.petStable ??= {}; },
    bonus(c) {
      const bonus={};
      for(const kind of D.regaliaKinds) {
        const item=D.regalia.find(r=>r.id===c.regalia?.[kind]&&r.kind===kind);
        if(item&&c.regalia.owned.includes(item.id)) for(const [key,n] of Object.entries(item.stats)) bonus[key]=(bonus[key]||0)+n;
      }
      return bonus;
    },
    entry(id) { return D.regalia.find(r=>r.id===id)||D.specialCompanions.find(p=>p.id===id)||D.emporiumBoxes.find(b=>b.id===id); },
    owned(entry,c=G.character()) { return entry.special?c.specialPets.includes(entry.id):c.regalia.owned.includes(entry.id); },
    pay(c,amount) { G.assert(Number.isSafeInteger(amount)&&amount>0&&c.ascendantCoins>=amount,'Not enough Ascendant Coins.'); c.ascendantCoins-=amount; },
    buy(id) {
      idle();const c=G.character(),box=D.emporiumBoxes.find(b=>b.id===id&&b.sealed);
      G.assert(box,'Choose a sealed mystery box.');
      const stack=c.inventory.find(i=>i.kind==='stack'&&i.key===id);
      G.assert(stack||c.inventory.length<c.capacity,'Free one inventory slot before buying a mystery box.');
      G.assert(!stack||Number.isSafeInteger(stack.quantity+1),'This box stack is full.');
      this.pay(c,box.price);
      S.inventory.reward([{key:id,quantity:1}],c);
      G.notify(box.name+' added to Inventory > Mystery Boxes. Open it or list it on the Marketplace.','success');
      G.commit();return box;
    },
    equip(id) {
      idle();const c=G.character(),entry=D.regalia.find(r=>r.id===id);this.normalize(c);
      G.assert(entry&&this.owned(entry,c),'Collect this item before equipping it.');
      c.regalia[entry.kind]=id;this.changed(c);
    },
    unequip(kind) { idle();G.assert(D.regaliaKinds.includes(kind),'Unknown collection slot.');const c=G.character();this.normalize(c);c.regalia[kind]=null;this.changed(c); },
    changed(c) { if(c.appearance.outfit&&c.appearance.outfit!==c.regalia.outfit)delete c.appearance.outfit;c.hp=Math.min(c.hp,S.character.stats(c).health);G.runtime.estimate=null;G.commit(); },
    equipPet(type) {
      idle();const c=G.character();this.normalize(c);
      G.assert(D.allCompanions.some(p=>p.id===type)&&(c.specialPets.includes(type)||Object.hasOwn(c.petStable,type)),'This companion is not in your stable.');
      G.assert(c.companion?.type!==type,'This companion is already travelling with you.');
      if(c.companion){ S.companions.sync(c); c.petStable[c.companion.type]=G.clone(c.companion); }
      c.companion=c.petStable[type]||freshPet(type);delete c.petStable[type];S.companions.sync(c);this.changed(c);
    },
    outcomes(box) {
      if(D.regaliaKinds.includes(box.kind))return D.regalia.filter(r=>r.kind===box.kind).map(entry=>({entry,weight:entry.weight}));
      if(box.kind==='pet')return D.specialCompanions.map(entry=>({entry,weight:1}));
      if(box.kind==='gem')return D.gems.flatMap((gem,type)=>D.gemBoxRanks.map((rankWeight,i)=>({key:'gem:'+type+':'+(i+1),quantity:1,weight:rankWeight*(gem.boxOnly?7:90)})));
      return [{coins:500,weight:33},{coins:1000,weight:33},{coins:1500,weight:33},{stone:1,weight:1}];
    },
    open(id) {
      idle();const c=G.character(),box=D.emporiumBoxes.find(b=>b.id===id);this.normalize(c);G.assert(box,'Choose an available box.');
      if(box.sealed)G.assert(S.inventory.available(id,c)>0,'You need an unlocked '+box.name+' in your inventory.');
      if(box.kind==='gem') {
        // A guaranteed free slot covers every possible roll. Never charge, roll or discard a paid reward on overflow.
        const rows=this.outcomes(box);
        G.assert(rows.every(r=>{const stack=c.inventory.find(i=>i.kind==='stack'&&i.key===r.key);return stack?Number.isSafeInteger(stack.quantity+1):c.inventory.length<c.capacity;}),'Free one inventory slot before opening a gem box.');
      }
      // Reserve a potential stone before paying or rolling. No lost rewards or rerolls on a full bag.
      if(box.kind==='stone'){
        const stack=c.inventory.find(i=>i.kind==='stack'&&i.key==='stone');
        G.assert(c.inventory.length<c.capacity||stack,'Free one inventory slot before opening a stone box.');
        G.assert(!stack||stack.quantity<1e15,'This stone stack is full.');
        G.assert(c.coins<=1e15-1500,'Make room in your coin balance before opening a stone box.');
      }
      if(!box.sealed)G.assert(c.ascendantCoins>=box.price,'Not enough Ascendant Coins.');
      const outcomes=this.outcomes(box), result=outcomes[G.weighted(G.rng,outcomes.map(o=>o.weight))];
      if(box.sealed){
        S.inventory.take(id,1,c);c.stats.boxesOpened=(c.stats.boxesOpened||0)+1;
      }else this.pay(c,box.price);
      if(result.entry) {
        const duplicate=this.owned(result.entry,c);
        if(duplicate)c.ascendantCoins+=box.duplicate;
        else if(result.entry.special)c.specialPets.push(result.entry.id);else c.regalia.owned.push(result.entry.id);
        G.commit();return {...result,duplicate,refund:duplicate?box.duplicate:0};
      }
      if(result.key)S.inventory.reward([{key:result.key,quantity:1}]);
      else if(result.stone)S.inventory.reward([{key:'stone',quantity:1}]);else c.coins+=result.coins;
      G.commit();return result;
    }
  };
  const normalize=S.chronicles.normalize;
  S.chronicles.normalize=c=>{normalize(c);S.emporium.normalize(c);return c;};
  S.companions.release=()=>{
    const c=G.character();
    G.ensureIdle();G.assert(c.companion,'No companion is equipped.');
    S.companions.sync(c);c.petStable[c.companion.type]=G.clone(c.companion);c.companion=null;S.emporium.changed(c);
  };
})(RPG,RPG.data,RPG.systems);
