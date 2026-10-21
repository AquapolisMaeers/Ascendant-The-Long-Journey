'use strict';
(function(D) {
  const focus = [
    ['damage','Duelist',1,'#ef9b88'], ['defence','Ironward',2,'#a8bfd2'], ['health','Heartkeeper',10,'#a6c98a'],
    ['damagePct','Warbringer',.04,'#e997a4'], ['defencePct','Bastion',.04,'#9cbec9'], ['healthPct','Lifebloom',.04,'#9bd3ac'],
    ['crit','Deadeye',.01,'#edb97c'], ['critDamage','Executioner',.04,'#d29bc5'], ['speed','Gale',.02,'#9dd9d6'],
    ['penetration','Riftwalker',.01,'#c4a2e6'], ['double','Echo',.01,'#aab6ee'], ['dodge','Shade',.01,'#b2abd0'],
    ['reduction','Bulwark',.005,'#b9c6ad'], ['resistance','Resolve',.01,'#dac4a3'], ['lifeSteal','Bloodmoon',.0025,'#ee8f9e']
  ];
  D.regaliaKinds = ['outfit','aura','mount'];
  const mountNames = ['Duelist Courser','Ironward Charger','Heartkeeper Stag','Warbringer Destrier','Bastion Warhorse','Lifebloom Hart','Deadeye Strider','Executioner Nightsteed','Gale Runner','Riftwalker Kirin','Echo Courser','Shade Nightmare','Bulwark Charger','Resolve Palfrey','Bloodmoon Steed','Crimson Requiem Destrier','Citadel Oath Warhorse','Phantom Masquerade Kirin','Eclipse Sovereign','Wayfarer Packhorse'];
  // Sixteen focused rewards share the existing 90% pool. Keep old entries in order for their artwork.
  const focusedWeight=5400/(focus.length+1);
  D.regalia = D.regaliaKinds.flatMap(kind => {
    let index=0;
    const make = (id,name,stats,color,price,tier,weight) => ({id:kind+':'+id,kind,name:kind==='mount'?mountNames[index++]:name+(kind==='outfit'?' Vestments':' Aura'),stats,color,price,tier,weight,
      ...(kind==='outfit'?{avatar:'assets/art/outfits/outfit-'+(id==='skillXp'?'utility':id)+'.webp'}:{})});
    return [
      ...focus.map(([stat,name,value,color])=>make(stat,name,{[stat]:value},color,125,'Focused',focusedWeight)),
      make('aggressive','Crimson Requiem',{damagePct:.03,crit:.0075,critDamage:.025,speed:.01},'#f38d9d',350,'Build',190),
      make('tanky','Citadel Oath',{healthPct:.04,defencePct:.04,reduction:.005,resistance:.01},'#a7c6cf',350,'Build',190),
      make('utility','Phantom Masquerade',{speed:.025,dodge:.01,lifeSteal:.0025,double:.005,penetration:.005},'#c3aceb',350,'Build',190),
      make('sovereign','Eclipse Sovereign',Object.fromEntries(focus.map(([stat,,value])=>[stat,value])),'#f3d18e',1500,'Sovereign',30),
      make('skillXp','Wayfarer',{skillXp:.05},'#9ecba0',125,'Focused',focusedWeight)
    ];
  });
  const names = ['Vesperglass Kirin','Mossbell Terrapin','Cindercoil Wyrmling','Prismveil Moth','Gilded Jackalope','Starwhisker Koi','Velvet Oracle'];
  const stories = [
    'A dusk-born kirin whose glass antlers gather the last light. It charges beside those who refuse to yield.',
    'A wandering sanctuary with a moss-grown shell. The bell beneath its chin rings when danger approaches.',
    'A small ember dragon curled around an ancient iron core. Its patient vigilance hardens your resolve.',
    'A silent moth with stained-glass wings. Its shifting patterns reveal the briefest opening in an enemy guard.',
    'A fleet-footed jackalope crowned in gold. It waits for the perfect moment before striking with impossible force.',
    'A celestial koi that swims through the air. Its comet-tail traces the rhythm of your next attack.',
    'A masked night owl with a velvet mantle. Its watchful, violet eyes guide you clear of lethal blows.'
  ];
  const specialBonuses=[
    {damagePct:.01,penetration:.0005}, {healthPct:.01,reduction:.0005}, {defencePct:.01,healthPct:.002},
    {crit:.005,critDamage:.01}, {damagePct:.01,critDamage:.02}, {speed:.005,lifeSteal:.001}, {dodge:.001,resistance:.001}
  ];
  D.specialCompanions = D.companions.map((pet,i)=>{
    const bonusesPerLevel=specialBonuses[i],[stat,perLevel]=Object.entries(bonusesPerLevel)[0];
    return {...pet,id:'special-'+pet.id,base:pet.id,name:names[i],price:300,stat,perLevel,special:true,bonusesPerLevel,
      illustration:'assets/art/companions/special-'+pet.id+'-painted.webp',description:stories[i]};
  });
  D.allCompanions = [...D.companions,...D.specialCompanions];
  D.emporiumBoxes = [
    {id:'outfit-box',name:'Outfit Mystery Box',kind:'outfit',price:75,duplicate:15},
    {id:'aura-box',name:'Aura Mystery Box',kind:'aura',price:75,duplicate:15},
    {id:'mount-box',name:'Mount Mystery Box',kind:'mount',price:75,duplicate:15},
    {id:'pet-box',name:'Companion Mystery Box',kind:'pet',price:100,duplicate:25},
    {id:'stone-box',name:'Ascendant Stone Box',kind:'stone',price:5,duplicate:0},
    {id:'gem-box',name:'Gem Mystery Box',kind:'gem',price:25,duplicate:0}
  ];
  D.emporiumBoxes.forEach(box=>{
    D.itemIllustrations[box.id]={file:'assets/art/painted/mystery-'+box.kind+'.png',standalone:true,version:'boxes-20261019',name:box.name};
    box.sealed=['outfit','aura','mount','pet'].includes(box.kind);
    if(!box.sealed)return;
    D.catalog[box.id]={id:box.id,name:box.name,category:'Mystery Boxes',level:1,rarity:3,box:box.id};
  });
  D.regularGemCount = D.gems.length;
  D.gemDescriptions={
    damage:'Adds flat damage to each successful attack. Attack, Ranged and Magic gems match your weapon class.',
    defence:'Adds flat Defence, reducing incoming damage through the normal mitigation formula.',health:'Adds flat maximum health; it does not instantly heal you.',
    crit:'Raises the chance that an attack becomes a critical hit.',critDamage:'Increases the extra damage dealt by critical hits.',
    damagePct:'Increases Primary Damage by a percentage. Adds to other percentage damage bonuses.',
    defencePct:'Increases Defence by a percentage. More effective when you already have Defence.',healthPct:'Increases maximum health by a percentage; it does not instantly heal you.',
    speed:'Makes your automatic attacks happen more often.',penetration:'Ignores part of the enemy\'s Defence.',double:'Raises the chance of a second attack.',
    dodge:'Raises the chance of avoiding an enemy attack.',reduction:'Reduces incoming damage after other mitigation.',
    resistance:'Lowers the enemy\'s chance of critically hitting you.',lifeSteal:'Restores health based on actual damage dealt, without counting overkill.'
  };
  D.legacyExclusiveGemSlots={};
  const unique = [
    ['damagePct','Might',.006,'#ec94a0'],['defencePct','Bastion',.008,'#a7c8dc'],['healthPct','Vitality',.008,'#a9d698'],
    ['speed','Haste',.004,'#91d9d3'],['penetration','Piercing',.003,'#c69fe3'],['double','Echo',.003,'#b7c0ed'],
    ['dodge','Evasion',.003,'#b4a8dd'],['reduction','Warding',.002,'#c5d7b6'],['resistance','Resolve',.004,'#dfc697'],
    ['lifeSteal','Siphon',.001,'#f08a9e']
  ];
  unique.forEach(([stat,name,value,color])=>{
    const type=D.gems.length;D.gems.push({stat,name,value,color,boxOnly:true});
    for(let rank=1;rank<=5;rank++) {
      const id='gem:'+type+':'+rank;
      D.catalog[id]={id,name:name+' Gem '+D.roman[rank],category:'Gems',type,rank,level:D.facet.levels[rank-1],rarity:rank,boxOnly:true};
      D.itemIllustrations[id]={...D.itemIllustrations['gem:5:'+rank],name:D.catalog[id].name};
    }
    // Advanced gems start in boxes; fuse existing ranks using the usual rules.
    for(let rank=1;rank<5;rank++) D.recipes.push({
      id:'facet:'+type+':'+rank,name:name+' Gem '+D.roman[rank+1],skill:'Faceting',
      tier:D.tierFor(D.facet.levels[rank]),level:D.facet.levels[rank],type,rank,
      cost:{['gem:'+type+':'+rank]:D.facet.inputs},output:'gem:'+type+':'+(rank+1),
      xp:D.config.skillXp*D.facet.levels[rank]*D.config.facetingXp
    });
    const offensive=['damagePct','speed','penetration','double','lifeSteal'].includes(stat);
    D.legacyExclusiveGemSlots[type]=offensive?['Weapon','Gloves','Necklace','Ring']:['Helmet','Plate','Greaves','Boots','Necklace','Ring'];
    const slots=D.slots.filter(slot=>D.prefixPools[slot].includes(stat));
    slots.forEach(slot=>D.gemAllowed[slot].push(type));
  });
  D.facetingGroups=[
    {name:'Standard gems',types:D.gems.map((_,type)=>type).filter(type=>type<D.regularGemCount)},
    {name:'Advanced gems \u00b7 Offence',types:D.gems.map((_,type)=>type).filter(type=>type>=D.regularGemCount&&['damagePct','speed','penetration','double','lifeSteal'].includes(D.gems[type].stat))},
    {name:'Advanced gems \u00b7 Defence',types:D.gems.map((_,type)=>type).filter(type=>type>=D.regularGemCount&&!['damagePct','speed','penetration','double','lifeSteal'].includes(D.gems[type].stat))}
  ];
  D.gemBoxRanks=[600,250,100,45,5];
  D.emporiumCategories = [
    {name:'Outfit Mystery Boxes',box:'outfit-box',description:'All 20 outfits, including Wayfarer Vestments (+5% Skilling XP). Focused pool: 90%; build pool: 9.5%; Eclipse Sovereign: 0.5%.'},
    {name:'Aura Mystery Boxes',box:'aura-box',description:'All 20 auras, including Wayfarer Aura (+5% Skilling XP). Focused pool: 90%; build pool: 9.5%; Eclipse Sovereign: 0.5%.'},
    {name:'Mount Mystery Boxes',box:'mount-box',description:'All 20 mounts, including Wayfarer Packhorse (+5% Skilling XP). Focused pool: 90%; build pool: 9.5%; Eclipse Sovereign: 0.5%. Equip one mount for its bonuses.'},
    {name:'Companion Mystery Boxes',box:'pet-box',description:'Seven special companions at equal odds. Every companion starts Common and grows with you.'},
    {name:'Gem Mystery Boxes',box:'gem-box',description:'All 17 gem types, ranks I\u2013V. Regular types: 90%; exclusive stat types: 10%. Rank V: 0.5% overall.'},
    {name:'Ascendant Stone Boxes',box:'stone-box',description:'1%: one Ascendant Stone. Otherwise: normal coins. Every outcome is shown before opening.'}
  ];
  const add=(id,name,group,target,metric,title)=>D.achievements.push({id,name,group,target,metric,title});
  [40,50,60,70,80,90,100].forEach(n=>add('companion-level-'+n,'Companion level '+n,'Companions',n,c=>Math.max(c.companion?.level||0,...Object.values(c.petStable||{}).map(p=>p.level))));
  [1,3,5,7].forEach(n=>add('companion-bond-'+n,'Companion ascensions \u00b7 '+n,'Companions',n,c=>Math.max(c.companion?.ascensions||0,...Object.values(c.petStable||{}).map(p=>p.ascensions||0)),n===7?'Soulbound':null));
  [60,100,160].forEach(n=>add('storage-'+n,'Inventory capacity '+n,'Journey',n,c=>c.capacity));
  for(const kind of D.regaliaKinds) [1,5,19,20].forEach(n=>add('collection-'+kind+'-'+n,'Collect '+n+' '+kind+'s','Collections',n,c=>(c.regalia?.owned||[]).filter(id=>D.regalia.some(r=>r.id===id&&r.kind===kind)).length,n===19?({outfit:'The Wardrobe',aura:'Radiant Soul',mount:'Keeper of the Reins'}[kind]):null));
  add('regalia-pair','Dress for your legend','Collections',2,c=>+!!c.regalia?.outfit + +!!c.regalia?.aura);
  [1,7].forEach(n=>add('special-pets-'+n,'Befriend '+n+' special companion'+(n===1?'':'s'),'Companions',n,c=>(c.specialPets||[]).length));
  add('sovereign-pair','An eclipse, complete','Collections',2,c=>['outfit:sovereign','aura:sovereign'].filter(id=>c.regalia?.owned.includes(id)).length,'Eclipse Sovereign');
})(RPG.data);
