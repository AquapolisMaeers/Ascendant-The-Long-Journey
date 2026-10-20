'use strict';
(function(D){
  D.leaderboards.push(
    {id:'guild-level',name:'Guild Level',group:'Guilds',entity:'guild'},
    {id:'guild-wealth',name:'Richest Guild',group:'Guilds',entity:'guild'}
  );
  D.leaderboardGroups.push('Guilds');
  const previous=D.achievements.length;
  const add=(id,name,group,target,metric,title=null)=>D.achievements.push({id,name,group,target,metric,title});
  const milestones=(id,name,group,targets,metric)=>targets.forEach(target=>add(id+'-'+target,name+' · '+target.toLocaleString(),group,target,metric));
  // These additions follow the captured launch IDs, preserving Completionist requirements.
  add('guild-member','Under one banner','Guilds',1,c=>+!!c.guild);
  [2,5,10,25,50,100].forEach(n=>add('guild-level-'+n,'Belong to a Level '+n+' guild','Guilds',n,c=>c.guild?RPG.systems.guilds.level(c.guild).level:0,n===100?'Keeper of the Hall':null));
  milestones('guild-tasks','Guild tasks completed','Guilds',[1,10,50,100],c=>c.guild?.progress?.totalTasks||0);
  milestones('guild-ranks','Guild perk ranks built','Guilds',[1,10,25,60,120],c=>Object.values(c.guild?.perks||{}).reduce((sum,rank)=>sum+rank,0));
  [10000,100000,1000000,10000000].forEach(n=>add('guild-donation-'+n,'Donate '+(n/10000).toLocaleString()+' Gold to guild banks','Guilds',n,c=>c.stats.guildDonated||0));
  [1,10,100,1000].forEach(n=>add('arena-victories-'+n,'Colosseum victories · '+n.toLocaleString(),'Colosseum',n,c=>c.colosseum?.victories||0,n===1000?'Arena Veteran':null));
  D.leagues.slice(1).forEach(league=>add('arena-league-'+league.id,'Reach '+league.name,'Colosseum',league.minimum,c=>c.colosseum?.points||0));
  const companions=c=>[c.companion,...Object.values(c.petStable||{})].filter(Boolean);
  for(const level of [20,50])for(const n of [3,5,10])add('stable-'+level+'-'+n,'Raise '+n+' companions to Level '+level,'Companions',n,c=>companions(c).filter(p=>p.level>=level).length,level===50&&n===10?'Keeper of Kin':null);
  [2,4,6].forEach(n=>add('companion-rarity-'+n,'Raise a '+D.rarity[n]+' companion','Companions',n,c=>Math.max(0,...companions(c).map(p=>p.ascensions||0))));
  for(const kind of ['outfit','aura','mount'])for(const n of [3,10,15].filter(n=>n<=D.regalia.filter(entry=>entry.kind===kind).length))
    add('collection-'+kind+'-'+n,'Collect '+n+' '+kind+(n===1?'':'s'),'Collections',n,c=>(c.regalia?.owned||[]).filter(id=>D.regalia.some(entry=>entry.id===id&&entry.kind===kind)).length);
  [3,5].filter(n=>n<=D.specialCompanions.length).forEach(n=>add('special-pets-'+n,'Collect '+n+' special companions','Collections',n,c=>c.specialPets?.length||0));
  milestones('presents','Mystery presents opened','Collections',[1000,10000],c=>c.stats.boxesOpened||0);
  milestones('textiles','Leather or cloth refined','Crafting',[10000,100000],c=>c.stats.textiles||0);
  milestones('secondary-craft','Secondaries smithed','Crafting',[1000,10000],c=>c.stats.secondaries||0);
  milestones('harvest','Fibres harvested','Farming',[100000,1000000],c=>c.stats.harvested||0);
  [5,10].forEach(n=>add('provisions-batch-'+n,'Unlock Eat ×'+n,'Provisions',1,c=>+(c.batchEatUnlocks||[]).includes(n)));
  add('provisions-prepared','Unlock every Auto-Eat threshold','Provisions',3,c=>[.25,.5,.75].filter(n=>c.eatUnlocks.includes(n)).length);
  for(const stat of ['listing','sale','purchase'])milestones('market-'+stat,({listing:'Marketplace listings',sale:'Marketplace sales',purchase:'Marketplace purchases'})[stat],'Marketplace',[10,100,1000],c=>c.stats[stat]||0);
  D.guildProgressionAchievements=D.achievements.slice(previous).map(achievement=>achievement.id);
})(RPG.data);
