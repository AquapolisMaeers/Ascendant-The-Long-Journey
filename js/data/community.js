'use strict';
(function(D) {
  D.guildRules={members:50,perkCap:10,perkStep:.0025,reignBonus:.02,weekMs:7*86400000,warMemberCap:100,warParticipation:200,warWinner:1000};
  D.guildPerks=[
    {id:'might',name:'United Might',stat:'damagePct',description:'Primary damage',coins:100000,points:100},
    {id:'vitality',name:'Shared Vitality',stat:'healthPct',description:'Maximum health',coins:100000,points:100},
    {id:'guard',name:'Steadfast Guard',stat:'defencePct',description:'Defence',coins:100000,points:100}
  ];
  D.guildTasks=[
    {id:'creatures',name:'Keep the roads safe',description:'Defeat creatures',target:100,points:40,icon:'Weapon'},
    {id:'elites',name:'Hunt the dangerous',description:'Defeat elite creatures',target:15,points:60,icon:'creature'},
    {id:'gather',name:'Stock the workshops',description:'Gather materials from resource encounters',target:300,points:40,icon:'Materials'},
    {id:'craft',name:'Work the forges',description:'Complete successful crafts',target:50,points:40,icon:'Crafting'},
    {id:'quests',name:'Lend a helping hand',description:'Complete quests',target:10,points:60,icon:'Quests'},
    {id:'dungeons',name:'Conquer the depths',description:'Complete dungeons',target:5,points:80,icon:'dungeon'}
  ];
  D.chatChannels=['Location','World','Guild','Friends'];
})(RPG.data);
