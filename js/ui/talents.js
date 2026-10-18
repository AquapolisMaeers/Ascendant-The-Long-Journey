'use strict';
(function(G,D,S,U) {
  U.confirmTalent=id=>{
    const c=G.character(),node=S.talents.nodes(c).find(n=>n.id===id),rank=c.talents?.[id]||0;
    G.assert(S.talents.canLearn(c,id),'This talent cannot be learned yet.');
    const available=S.talents.available(c),effect=node.description||Object.entries(node.effects).map(([key,value])=>'+'+U.statValue(key,value)+' '+D.labels[key].replace(/ %$/,'')+' per rank.').join(' ');
    U.confirm('Spend 1 talent point?', '<div class="talent-confirm"><span class="eyebrow">'+U.e(node.path.name)+'</span><h3>'+U.e(node.name)+'</h3><p>'+U.e(effect)+'</p><dl class="preview-stats"><div><dt>Talent rank</dt><dd>'+rank+' → '+(rank+1)+' / '+D.talentRanks[node.index]+'</dd></div><div><dt>Available points</dt><dd>'+available+' → '+(available-1)+'</dd></div></dl><p class="notes">Confirm spends one earned point. Refund spent points with a Crystal of Recollection from Shop → Utility.</p></div>',()=>{
      G.assert(c===G.character()&&(c.talents?.[id]||0)===rank,'Your build changed. Review this talent again.');
      S.talents.learn(id);
      G.notify(node.name+' increased to rank '+(rank+1)+'. 1 point spent; '+S.talents.available(c)+' remaining.','success');
    });
    const button=document.querySelector('.modal [data-action="confirm"]');
    if(button)button.textContent='Spend 1 talent point';
  };
  const character=U.screens.Character;
  U.screens.Character=()=>{
    if(G.runtime.tab!=='Talents') return character();
    const c=G.character(), idle=!c.combat&&!c.activity&&!S.tutorial.active();
    return U.heading('SHAPE YOUR CLASS',c.class+' talent tree','Earn one point per combat level after Level 1. Complete each node to climb its path; mix paths to shape your build.',
      '<span class="badge">'+S.talents.available(c)+' POINTS AVAILABLE</span>')+
      U.tabs(['Equipment','Stats','Perks','Talents','Outfits & Auras','Mounts'],'Talents')+
      '<section class="panel talent-intro"><div><h3>'+S.talents.spent(c)+' / '+(c.level-1)+' points spent</h3><p class="notes">Choose Review, then confirm to spend one point. Earned points include your past levels. Reset with a Crystal of Recollection from Shop → Utility. Milestone perks stay separate.</p></div>'+
      U.btn('Reset talents','resetTalents',!idle||c.dungeon||!S.talents.spent(c)?'disabled':'','quiet')+'</section><div class="talent-tree">'+D.talents[c.class].map((path,pathIndex)=>
        '<section id="talent-'+path.id+'" class="talent-path path-'+pathIndex+'"><header><h2>'+path.name+'</h2><p>'+path.role+'</p></header>'+path.nodes.map((node,index)=>{
          const id=path.id+':'+index,rank=c.talents?.[id]||0,max=D.talentRanks[index],ready=idle&&S.talents.canLearn(c,id);
          const effects=node.description || Object.entries(node.effects).map(([key,value])=>'+'+U.statValue(key,value)+' '+D.labels[key].replace(/ %$/,'')+' per rank.').join(' ');
          return '<div class="talent-node '+(rank===max?'mastered':rank?'invested':'')+'"><span class="eyebrow">LEVEL '+D.talentLevels[index]+(index===5?' · CAPSTONE':'')+' · '+rank+' / '+max+'</span><h3>'+node.name+'</h3><p>'+effects+'</p><small>'+(index?'Requires '+path.nodes[index-1].name+' at full rank.':'Entry talent · no prerequisite.')+'</small>'+
            U.btn(rank===max?'Mastered':'Review (1 point)','learnTalent','data-id="'+id+'" '+(!ready?'disabled':''),'small '+(ready?'gold-btn':'quiet'))+'</div>';
        }).join('')+'</section>').join('')+'</div>';
  };
  const card=U.itemCard;
  U.itemCard=(item,slot='')=>{
    const html=card(item,slot);
    const required=D.secondaryClass(item.piece)||item.armorClass;
    return required?html.replace('</small>',' · '+required+'</small>'):html;
  };
  const item=U.item;
  U.item=id=>{
    item(id);
    const gear=S.items.find(id);
    if(gear?.slot==='Secondary') {
      document.querySelector('.modal .item-heading p')?.insertAdjacentHTML('beforeend',' · <strong>'+D.secondaryClass(gear.piece)+' only</strong>');
      document.querySelector('.modal .item-heading')?.insertAdjacentHTML('afterend','<p class="notes">Off-hand support: inherent stats are lower than a main-hand weapon. Prefixes and socketed gems contribute 45% of their listed bonuses.</p>');
      if(D.secondaryClass(gear.piece)!==G.character().class) {
        const equip=document.querySelector('.modal [data-action="equip"]');
        if(equip){equip.disabled=true;equip.textContent='Requires '+D.secondaryClass(gear.piece);}
      }
    }
    if(gear?.armorClass)document.querySelector('.modal .item-heading p')?.insertAdjacentHTML('beforeend',' · <strong>'+gear.armorClass+' armour</strong>');
    if(gear?.armorClass && gear.armorClass!==G.character().class) {
      const equip=document.querySelector('.modal [data-action="equip"]');
      if(equip) { equip.disabled=true; equip.textContent='Requires '+gear.armorClass; }
    }
  };
})(RPG,RPG.data,RPG.systems,RPG.ui);
