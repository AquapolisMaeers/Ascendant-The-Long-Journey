'use strict';
(function(D) {
  const focus = [
    ['damage','Duelist',1,'#ef9b88'], ['defence','Ironward',2,'#a8bfd2'], ['health','Heartkeeper',10,'#a6c98a'],
    ['damagePct','Warbringer',.04,'#e997a4'], ['defencePct','Bastion',.04,'#9cbec9'], ['healthPct','Lifebloom',.04,'#9bd3ac'],
    ['crit','Deadeye',.01,'#edb97c'], ['critDamage','Executioner',.04,'#d29bc5'], ['speed','Gale',.02,'#9dd9d6'],
    ['penetration','Riftwalker',.01,'#c4a2e6'], ['double','Echo',.01,'#aab6ee'], ['dodge','Shade',.01,'#b2abd0'],
    ['reduction','Bulwark',.005,'#b9c6ad'], ['resistance','Resolve',.01,'#dac4a3'], ['lifeSteal','Bloodmoon',.0025,'#ee8f9e']
  ];
  D.regalia = ['outfit','aura'].flatMap(kind => {
    const make = (id,name,stats,color,price,tier,weight) => ({id:kind+':'+id,kind,name:name+(kind==='outfit'?' Vestments':' Aura'),stats,color,price,tier,weight});
    return [
      ...focus.map(([stat,name,value,color])=>make(stat,name,{[stat]:value},color,125,'Focused',6)),
      make('aggressive','Crimson Requiem',{damagePct:.03,crit:.0075,critDamage:.025,speed:.01},'#f38d9d',350,'Build',3),
      make('tanky','Citadel Oath',{healthPct:.04,defencePct:.04,reduction:.005,resistance:.01},'#a7c6cf',350,'Build',3),
      make('utility','Phantom Masquerade',{speed:.025,dodge:.01,lifeSteal:.0025,double:.005,penetration:.005},'#c3aceb',350,'Build',3),
      make('sovereign','Eclipse Sovereign',Object.fromEntries(focus.map(([stat,,value])=>[stat,value])),'#f3d18e',1500,'Sovereign',1)
    ];
  });
  const names = ['Moonfang Wolf','Thorncrown Boar','Astral Golem','Sunfire Lynx','Stormcrown Bear','Voidweaver Spider','Eclipse Bat'];
  D.specialCompanions = D.companions.map((pet,i)=>({...pet,id:'special-'+pet.id,base:pet.id,name:names[i],price:300,perLevel:pet.perLevel*2,special:true,
    description:'Twice the '+pet.name+' bonus. Same rarity milestones, feeding and upkeep.'}));
  D.allCompanions = [...D.companions,...D.specialCompanions];
  D.emporiumBoxes = [
    {id:'outfit-box',name:'Outfit Mystery Box',kind:'outfit',price:75,duplicate:15},
    {id:'aura-box',name:'Aura Mystery Box',kind:'aura',price:75,duplicate:15},
    {id:'pet-box',name:'Special Pet Mystery Box',kind:'pet',price:125,duplicate:25},
    {id:'stone-box',name:'Ascendant Stone Box',kind:'stone',price:5,duplicate:0}
  ];
  D.emporiumCategories.forEach(c=>{
    c.description={Outfits:'Equip one outfit. Focus a stat, shape a build, or collect the Eclipse Sovereign.',Auras:'Equip one aura alongside your outfit. Bonuses follow the same combat caps.',
      'Special Pets':'Seven special companions, each with exactly twice its regular counterpart\'s bonus. One active pet at a time.',
      'Outfit Mystery Boxes':'All 19 outfits. Focused: 6% each; build sets: 3% each; Eclipse Sovereign: 1%.',
      'Aura Mystery Boxes':'All 19 auras. Focused: 6% each; build sets: 3% each; Eclipse Sovereign: 1%.',
      'Pet Mystery Boxes':'All seven special pets at equal odds. A lower price for a random companion.',
      'Ascendant Stone Boxes':'1%: one Ascendant Stone. Otherwise: normal coins. Every outcome is shown before opening.'}[c.name];
  });
  const add=(id,name,group,target,metric,title)=>D.achievements.push({id,name,group,target,metric,title});
  [40,50,60,70,80,90,100].forEach(n=>add('companion-level-'+n,'Companion level '+n,'Companions',n,c=>Math.max(c.companion?.level||0,...Object.values(c.petStable||{}).map(p=>p.level))));
  [1,3,5,7].forEach(n=>add('companion-bond-'+n,'Companion ascensions \u00b7 '+n,'Companions',n,c=>Math.max(c.companion?.ascensions||0,...Object.values(c.petStable||{}).map(p=>p.ascensions||0)),n===7?'Soulbound':null));
  [60,100,160].forEach(n=>add('storage-'+n,'Inventory capacity '+n,'Journey',n,c=>c.capacity));
  for(const kind of ['outfit','aura']) [1,5,19].forEach(n=>add('collection-'+kind+'-'+n,'Collect '+n+' '+(kind==='outfit'?'outfits':'auras'),'Collections',n,c=>(c.regalia?.owned||[]).filter(id=>D.regalia.some(r=>r.id===id&&r.kind===kind)).length,n===19?(kind==='outfit'?'The Wardrobe':'Radiant Soul'):null));
  add('regalia-pair','Dress for your legend','Collections',2,c=>+!!c.regalia?.outfit + +!!c.regalia?.aura);
  [1,7].forEach(n=>add('special-pets-'+n,'Befriend '+n+' special companion'+(n===1?'':'s'),'Companions',n,c=>(c.specialPets||[]).length));
  add('sovereign-pair','An eclipse, complete','Collections',2,c=>['outfit:sovereign','aura:sovereign'].filter(id=>c.regalia?.owned.includes(id)).length,'Eclipse Sovereign');
})(RPG.data);
