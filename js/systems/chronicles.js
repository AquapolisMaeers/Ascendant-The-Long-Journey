'use strict';
(function(G,D,S) {
  S.chronicles = {
    normalize(c) {
      c.ascendantCoins ??= 0;
      c.ascendantRewards ??= {};
      c.companion ??= null;
      if (c.companion) c.companion.ascensions ??= 0;
      c.quests ??= null;
      c.questCompletions ??= 0;
      c.afk.normals ??= true;
      c.afk.dungeons ??= false;
      return c;
    }
  };
  S.ascendant = {
    achievementReward(a) { return a.title ? D.ascendantCurrency.prestige : D.ascendantCurrency.achievement; },
    sync(c) {
      S.chronicles.normalize(c);
      let earned=0;
      const grant=(id,amount)=>{
        if(Object.hasOwn(c.ascendantRewards,id)) return;
        G.assert(Number.isSafeInteger(c.ascendantCoins+earned+amount),'Ascendant Coin balance is too large.');
        c.ascendantRewards[id]=true; earned+=amount;
      };
      for(let level=2;level<=c.level;level++) grant('combat:'+level,D.ascendantCurrency.perCombatLevel);
      for(const [level,amount] of Object.entries(D.ascendantCurrency.milestones))
        if(c.level>=Number(level)) grant('milestone:'+level,amount);
      for(const a of D.achievements)
        if(c.achievements[a.id]) grant('achievement:'+a.id,this.achievementReward(a));
      c.ascendantCoins+=earned;
      return earned;
    }
  };
  S.companions = {
    definition(p) { return D.allCompanions.find(d=>d.id===p?.type); },
    cap(p) { return D.companionRules.levelCaps[p?.ascensions || 0]; },
    name(p) { return D.rarity[p?.ascensions || 0] + ' ' + this.definition(p).name; },
    ascensionQuote(p = G.character()?.companion) {
      G.assert(p, 'Adopt a companion first.');
      const rank = p.ascensions || 0;
      return {rank, stones:rank + 1, chance:D.companionRules.ascensionChances[rank],
        cap:this.cap(p), nextCap:D.companionRules.levelCaps[rank + 1], rarity:D.rarity[rank + 1]};
    },
    ascend() {
      G.ensureIdle();
      const c = G.character(), p = c.companion, q = this.ascensionQuote(p);
      G.assert(!S.tutorial.active() && !c.dungeon, 'Finish training and leave the dungeon before ascending your companion.');
      G.assert(this.view(p).alive, 'Revive your companion first.');
      G.assert(q.nextCap !== undefined, 'Your companion has reached its final rarity.');
      G.assert(p.level === q.cap, 'Reach companion level ' + q.cap + ' before ascending.');
      G.assert(S.inventory.available('stone') >= q.stones, 'Not enough unlocked Ascendant Stones.');
      S.inventory.take('stone', q.stones);
      const success = G.rng() < q.chance;
      if (success) { p.ascensions = q.rank + 1; p.xp = 0; }
      G.notify(success ? this.name(p) + ' ascended. Level cap: ' + q.nextCap + '.' :
        'Companion ascension failed. ' + q.stones + ' stones consumed; level and rarity preserved.', success ? 'success' : 'warning');
      G.commit();
      return success;
    },
    xpNext(level) { return D.companionRules.xpFactor*level*level; },
    view(p,now=Date.now()) {
      if(!p) return null;
      const hours=Math.max(0,(now-p.updatedAt)/3600000), untilEmpty=p.hunger/D.companionRules.hungerPerHour;
      const hunger=Math.max(0,p.hunger-hours*D.companionRules.hungerPerHour);
      const health=Math.max(0,p.health-Math.max(0,hours-untilEmpty)*D.companionRules.starvationPerHour);
      return {...p,hunger,health,active:hunger>0&&health>0,alive:health>0};
    },
    rates(d) { return d?.bonusesPerLevel || (d ? {[d.stat]:d.perLevel} : {}); },
    bonus(c) {
      const p=this.view(c.companion),d=this.definition(p);
      return p?.active&&d?Object.fromEntries(Object.entries(this.rates(d)).map(([stat,rate])=>[stat,rate*p.level])):{};
    },
    sync(c,now=Date.now()) {
      if(!c.companion) return;
      const next=this.view(c.companion,now), wasAlive=c.companion.health>0, wasActive=c.companion.hunger>0&&wasAlive;
      c.companion.hunger=next.hunger;c.companion.health=next.health;
      c.companion.updatedAt=Math.max(c.companion.updatedAt,now);
      if(!c.combat) c.hp=Math.min(c.hp,S.character.stats(c).health);
      if(wasAlive&&!next.alive&&c===G.character()) G.notify('Your companion has starved. Visit Companions to revive it.','warning');
      if(c===G.character()&&(wasActive!==next.active||wasAlive!==next.alive)) G.emit('change');
    },
    adopt(type) {
      G.ensureIdle();const c=G.character(),d=D.companions.find(d=>d.id===type);
      G.assert(!S.tutorial.active(),'Finish the required tutorial before adopting a companion.');
      G.assert(!c.dungeon,'Adopt companions in the outside world.');
      G.assert(d,'Choose an available companion.');
      G.assert(c.companion?.type!==type&&!c.petStable?.[type],'You already own this companion. Choose it from your stable.');
      G.assert(c.coins>=d.price,'Insufficient coins.');
      const pet={type,level:1,xp:0,ascensions:0,hunger:100,health:100,updatedAt:Date.now()};
      c.coins-=d.price;if(c.companion)(c.petStable??={})[type]=pet;else c.companion=pet;
      G.notify(d.name+' joins your '+(c.companion===pet?'journey':'stable')+'. Only your equipped companion grants bonuses.','success');G.commit();
    },
    nutrition(key, p = G.character()?.companion) {
      const info=D.catalog[key];
      G.assert(info?.healing&&p, 'Choose cooked food for your companion.');
      // Matching levels give 10 hunger; preserve useful fractions for low-tier food.
      return Math.min(50, Math.ceil(100 * info.level / p.level) / 10);
    },
    feed(key,quantity=1) {
      G.ensureIdle();const c=G.character(),info=D.catalog[key],p=this.view(c.companion);
      G.assert(p?.alive,'Revive your companion before feeding it.');
      G.assert(info?.healing&&Number.isSafeInteger(quantity)&&quantity>0&&quantity<=1000000,'Choose cooked food and a valid quantity.');
      G.assert(S.inventory.available(key)>=quantity,'Missing unlocked food.');
      G.assert(p.hunger<100||p.health<100,'Your companion is already healthy and full.');
      if(this.rates(this.definition(p)).skillXp)S.skilling.settle(c);
      this.sync(c);
      S.inventory.take(key,quantity,c);
      const nutrition=this.nutrition(key,p)*quantity;
      c.companion.hunger=Math.min(100,c.companion.hunger+nutrition);
      c.companion.health=Math.min(100,c.companion.health+nutrition/2);
      G.notify('Companion fed. Its bonuses are active while healthy and fed.','success');G.commit();
    },
    revive() {
      G.ensureIdle();const c=G.character(),p=this.view(c.companion);
      G.assert(p&&!p.alive,'This companion does not need revival.');
      const price=p.level*D.companionRules.revivePerLevel;
      G.assert(c.coins>=price,'Insufficient coins.');
      if(this.rates(this.definition(p)).skillXp)S.skilling.settle(c);
      c.coins-=price;c.companion.health=50;c.companion.hunger=50;c.companion.updatedAt=Date.now();G.commit();
    },
    release() {
      G.ensureIdle();const c=G.character();G.assert(c.companion,'No companion to release.');
      c.companion=null;c.hp=Math.min(c.hp,S.character.stats(c).health);G.commit();
    },
    gain(c,amount) {
      if(!c.companion) return;
      this.sync(c);const p=c.companion;
      const cap = this.cap(p);
      if(!this.view(p).active||p.level>=cap) return;
      p.xp+=amount;const previous=p.level;
      while(p.level<cap&&p.xp>=this.xpNext(p.level)){p.xp-=this.xpNext(p.level);p.level++;}
      if(p.level===cap) p.xp=0;
      if(p.level>previous) G.emit('levelup', {
        characterId:c.id, characterName:c.name, kind:'companion', companionType:p.type,
        companionName:this.name(p), from:previous, to:p.level, cap
      });
    }
  };
  S.leaderboards = {
    rows(id) {
      const board=D.leaderboards.find(b=>b.id===id);G.assert(board,'Unknown leaderboard.');
      if(board.entity==='guild')return S.guilds.rankings(id);
      return G.state.slots.filter(Boolean).map(c=>({character:c,value:board.metric(c),tie:board.tie?.(c)||0}))
        .sort((a,b)=>b.value-a.value||b.tie-a.tie||a.character.name.localeCompare(b.character.name)||a.character.id.localeCompare(b.character.id));
    }
  };
})(RPG,RPG.data,RPG.systems);
