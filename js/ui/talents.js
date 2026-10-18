'use strict';
(function(G,D,S,U) {
  const character=U.screens.Character;
  U.screens.Character=()=>{
    if(G.runtime.tab!=='Talents') return character();
    const c=G.character(), idle=!c.combat&&!c.activity&&!S.tutorial.active();
    return U.heading('SHAPE YOUR CLASS',c.class+' talent tree','Earn one point per combat level after Level 1. Complete each node to climb its path; mix paths to shape your build.',
      '<span class="badge">'+S.talents.available(c)+' POINTS AVAILABLE</span>')+
      U.tabs(['Equipment','Stats','Perks','Talents','Outfits & Auras','Mounts'],'Talents')+
      '<section class="panel talent-intro"><div><h3>'+S.talents.spent(c)+' / '+(c.level-1)+' points spent</h3><p class="notes">Earned points include your past levels. Reset with a Crystal of Recollection from Shop → Utility. Milestone perks stay separate.</p></div>'+
      U.btn('Reset talents','resetTalents',!idle||c.dungeon||!S.talents.spent(c)?'disabled':'','quiet')+'</section><div class="talent-tree">'+D.talents[c.class].map((path,pathIndex)=>
        '<section id="talent-'+path.id+'" class="talent-path path-'+pathIndex+'"><header><h2>'+path.name+'</h2><p>'+path.role+'</p></header>'+path.nodes.map((node,index)=>{
          const id=path.id+':'+index,rank=c.talents?.[id]||0,max=D.talentRanks[index],ready=idle&&S.talents.canLearn(c,id);
          const effects=node.description || Object.entries(node.effects).map(([key,value])=>'+'+U.statValue(key,value)+' '+D.labels[key].replace(/ %$/,'')+' per rank.').join(' ');
          return '<div class="talent-node '+(rank===max?'mastered':rank?'invested':'')+'"><span class="eyebrow">LEVEL '+D.talentLevels[index]+(index===5?' · CAPSTONE':'')+' · '+rank+' / '+max+'</span><h3>'+node.name+'</h3><p>'+effects+'</p><small>'+(index?'Requires '+path.nodes[index-1].name+' at full rank.':'Entry talent · no prerequisite.')+'</small>'+
            U.btn(rank===max?'Mastered':'Invest 1 point','learnTalent','data-id="'+id+'" '+(!ready?'disabled':''),'small '+(ready?'gold-btn':'quiet'))+'</div>';
        }).join('')+'</section>').join('')+'</div>';
  };
  const card=U.itemCard;
  U.itemCard=(item,slot='')=>{
    const html=card(item,slot);
    return item.armorClass?html.replace('</small>',' · '+item.armorClass+'</small>'):html;
  };
  const item=U.item;
  U.item=id=>{
    item(id);
    const gear=S.items.find(id);
    if(gear?.armorClass)document.querySelector('.modal .item-heading p')?.insertAdjacentHTML('beforeend',' · <strong>'+gear.armorClass+' armour</strong>');
    if(gear?.armorClass && gear.armorClass!==G.character().class) {
      const equip=document.querySelector('.modal [data-action="equip"]');
      if(equip) { equip.disabled=true; equip.textContent='Requires '+gear.armorClass; }
    }
  };
})(RPG,RPG.data,RPG.systems,RPG.ui);
