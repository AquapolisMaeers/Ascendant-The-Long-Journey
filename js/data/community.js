'use strict';
(function(D) {
  D.guildRules={version:3,members:50,perkCap:10,perkStep:.0025,reignBonus:.02,weekMs:7*86400000,warParticipation:200,warWinner:1000,levelCap:100,levelXp:500,taskXp:10,upgradeXp:5};
  D.guildRoles=[
    {id:'Leader',rank:4,description:'Manage all ranks, transfer leadership, buy upgrades and open Reckoning.'},
    {id:'Co-Leader',rank:3,description:'Manage lower ranks, buy upgrades and open Reckoning.'},
    {id:'Officer',rank:2,description:'Invite players and remove Members or Veterans.'},
    {id:'Veteran',rank:1,description:'An honoured member; participate and donate.'},
    {id:'Member',rank:0,description:'Participate in guild activities and donate.'}
  ];
  D.reckoning={boss:'Azhkar, the Worldbreaker',day:0,dayMs:86400000,sessionMs:3600000,stats:['damagePct','healthPct','defencePct']};
  D.guildPerks=[
    {id:'might',name:'United Might',stat:'damagePct',description:'Primary damage',step:.0025,group:'Offence',icon:'Weapon',coins:100000,points:100},
    {id:'vitality',name:'Shared Vitality',stat:'healthPct',description:'Maximum health',step:.0025,group:'Survival',icon:'food',coins:100000,points:100},
    {id:'guard',name:'Steadfast Guard',stat:'defencePct',description:'Defence',step:.0025,group:'Survival',icon:'Secondary',coins:100000,points:100},
    {id:'precision',name:'Keen Eye',stat:'crit',description:'Critical chance',step:.001,group:'Offence',icon:'Archer',coins:150000,points:150},
    {id:'ferocity',name:'Decisive Strikes',stat:'critDamage',description:'Critical damage',step:.005,group:'Offence',icon:'Weapon',coins:150000,points:150},
    {id:'haste',name:'Battle Rhythm',stat:'speed',description:'Attack speed',step:.0015,group:'Offence',icon:'clock',coins:150000,points:150},
    {id:'piercing',name:'Find the Opening',stat:'penetration',description:'Penetration',step:.001,group:'Offence',icon:'Weapon',coins:150000,points:150},
    {id:'echo',name:'Follow Through',stat:'double',description:'Double attack chance',step:.0005,group:'Offence',icon:'Weapon',coins:200000,points:200},
    {id:'evasion',name:'Light Footwork',stat:'dodge',description:'Dodge chance',step:.0005,group:'Survival',icon:'Boots',coins:200000,points:200},
    {id:'resolve',name:'Unbroken Resolve',stat:'resistance',description:'Critical resistance',step:.001,group:'Survival',icon:'Secondary',coins:150000,points:150},
    {id:'leech',name:'Second Wind',stat:'lifeSteal',description:'Life steal',step:.0005,group:'Survival',icon:'food',coins:200000,points:200},
    {id:'bulwark',name:'Hold the Line',stat:'reduction',description:'Damage reduction',step:.0005,group:'Survival',icon:'Secondary',coins:200000,points:200}
  ];
  D.guildTasks=[
    {id:'creatures',name:'Keep the roads safe',description:'Defeat creatures',target:2000,points:40,icon:'Weapon'},
    {id:'elites',name:'Hunt the dangerous',description:'Defeat elite creatures',target:200,points:60,icon:'creature'},
    {id:'gather',name:'Stock the workshops',description:'Gather materials from resource encounters',target:10000,points:40,icon:'Materials'},
    {id:'craft',name:'Work the forges',description:'Complete successful crafts',target:2000,points:40,icon:'Crafting'},
    {id:'quests',name:'Lend a helping hand',description:'Complete quests',target:100,points:60,icon:'Quests'},
    {id:'dungeons',name:'Conquer the depths',description:'Complete dungeons',target:50,points:80,icon:'dungeon'}
  ];
  D.chatChannels=['Location','World','Guild','Friends'];
})(RPG.data);
