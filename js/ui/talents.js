'use strict';
(function(G,D,S,U) {
  const character=U.screens.Character;
  U.screens.Character=()=>{
    if(G.runtime.tab!=='Talents') return character();
    const c=G.character(), idle=!c.combat&&!c.activity&&!S.tutorial.active();
    return U.heading('SHAPE YOUR CLASS',c.class+' talent tree','Earn one point per combat level after Level 1. Complete each node to climb its path; mix paths to shape your build.',
      '<span class="badge">'+S.talents.available(c)+' POINTS AVAILABLE</span>')+
      U.tabs(['Equipment','Stats','Perks','Talents','Outfits & Auras','Mounts'],'Talents')+
      '<section class="panel talent-intro"><div><h3>'+S.talents.spent(c)+' / '+(c.level-1)+' points spent</h3><p class="notes">Existing characters receive every earned point. Reset talents free between adventures to try another build. Milestone perks stay separate.</p></div>'+
      U.btn('Reset talents','resetTalents',!idle||c.dungeon||!S.talents.spent(c)?'disabled':'','quiet')+'</section><nav class="talent-path-links" aria-label="Jump to talent path">'+D.talents[c.class].map(path=>'<a href="#talent-'+path.id+'">'+path.name+'</a>').join('')+'</nav><div class="talent-tree">'+D.talents[c.class].map((path,pathIndex)=>
        '<section id="talent-'+path.id+'" class="talent-path path-'+pathIndex+'"><header>'+U.icon(c.class)+'<h2>'+path.name+'</h2><p>'+path.role+'</p></header>'+path.nodes.map((node,index)=>{
          const id=path.id+':'+index,rank=c.talents?.[id]||0,max=D.talentRanks[index],ready=idle&&S.talents.canLearn(c,id);
          const effects=node.description || Object.entries(node.effects).map(([key,value])=>'+'+U.statValue(key,value)+' '+D.labels[key].replace(/ %$/,'')+' per rank.').join(' ');
          return '<div class="talent-node '+(rank===max?'mastered':rank?'invested':'')+'"><span class="eyebrow">'+(index===5?'CAPSTONE':'LEVEL '+D.talentLevels[index])+' · '+rank+' / '+max+'</span><h3>'+node.name+'</h3><p>'+effects+'</p><small>'+(index?'Complete '+path.nodes[index-1].name+'. ':'')+'Requires level '+D.talentLevels[index]+'.</small>'+
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
  const art=U.itemArt;
  const shapes={
    Mage:[
      '<path d="m17 42 16-8 17 7 17-7 16 8-5 17-28 10-28-10Z"/><path d="m50 28 9 15-9 15-9-15Z" fill="#98d9ed"/>',
      '<path d="m35 15-17 9-9 30 16 6 6-20-8 48 27-9 27 9-8-48 6 20 16-6-9-30-17-9-15 10Z"/><path d="m50 25-8 49m8-49 8 49M30 59h40"/>',
      '<path d="M29 15h42l-4 30 9 40-24 3-2-44-2 44-24-3 9-40Z"/><path d="m30 25 38 8m-38 8 38 8M30 59l17 5m7 1 17 5"/>',
      '<path d="m20 22 24-5 4 24 8-9 8 5-13 23-7 23-24-5 3-30Z"/><path d="m23 62 22 4m-24 4 21 4m31-47 10 2-3 49-18 4-7-17 7-8Z"/>',
      '<path d="m21 22 25 4-4 41 8 9-6 11H15l-2-16 8-12Zm39 6 22-5-1 37 8 13-2 14H57l-4-12 10-11Z"/><path d="m19 54 23 4m20-2 19-5M18 74h25m18 1h21"/>'
    ],
    Archer:[
      '<path d="M18 64q-5-43 32-51 37 8 32 51L64 84H36Z"/><path d="M34 45q16-22 32 0v24L50 77 34 69Z" fill="#172521"/>',
      '<path d="m31 16-17 17 12 16 6-9-6 46h48l-6-46 6 9 12-16-17-17-19 9Z"/><path d="m38 21 25 65M29 59h42m-25-22 16 16"/>',
      '<path d="M27 15h46l-4 32 9 39H54l-4-41-4 41H22l9-39Z"/><path d="M28 27h44M30 56l15 5m10 0 15-5M28 74h16m12 0h16"/>',
      '<path d="m18 22 25-6 9 58-25 10Zm41-4 23 6-9 61-23-9Z"/><path d="m21 36 24-5m-21 20 24-5m-22 21 25-5m7-27 22 6m-25 9 23 6m-25 9 22 6"/>',
      '<path d="m22 15 24 3-5 46 9 13-4 10H13l-2-14 11-15Zm36 4 24-4-1 44 10 14-2 14H56l-4-12 10-12Z"/><path d="m21 37 22 3m-22 8 21 3m19-10 20-3m-20 14 20-3M15 75h29m14 0h26"/>'
    ]
  };
  U.itemArt=gear=>{
    const shape=shapes[gear.armorClass]?.[D.armorSlots.indexOf(gear.slot||D.pieces[gear.piece])];
    if(!shape)return art(gear);
    return '<span class="item-art class-armor-art" data-armor-class="'+gear.armorClass+'" style="--armor-color:hsl('+(gear.armorClass==='Mage'?265:140)+' 24% '+(38+(gear.tier||0)*2)+'%)" aria-hidden="true"><svg viewBox="0 0 100 100"><ellipse cx="50" cy="87" rx="35" ry="6" fill="#080e16"/><g fill="var(--armor-color)" stroke="#d8c4a0" stroke-width="2" stroke-linejoin="round">'+shape+'</g></svg></span>';
  };
})(RPG,RPG.data,RPG.systems,RPG.ui);
