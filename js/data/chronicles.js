'use strict';
(function(D) {
  D.config.offlineFacetingMultiplier = .15;
  D.companions = [
    {id:'wolf', name:'Lantern Wolf', portrait:4, price:500, stat:'damagePct', perLevel:.005, description:'A loyal hunter. +0.5% Primary Damage per level.'},
    {id:'boar', name:'Briar Boar', portrait:5, price:500, stat:'healthPct', perLevel:.005, description:'A sturdy trail companion. +0.5% Max Health per level.'},
    {id:'golem', name:'Pebble Golem', portrait:11, price:500, stat:'defence', perLevel:.5, description:'A patient stone guardian. +0.5 Defence per level.'}
  ];
  D.companionRules = {levelCap:20, xpFactor:100, hungerPerHour:10, starvationPerHour:10, actionXp:10, victoryXp:25, revivePerLevel:100};
  D.ascendantCurrency = {perCombatLevel:2, achievement:5, prestige:50, milestones:{10:10,25:25,50:50,75:75,100:100}};
  D.leaderboards = [
    {id:'damage', name:'Primary Damage', group:'Combat', metric:c=>RPG.systems.character.stats(c).damage},
    {id:'defence', name:'Defence', group:'Combat', metric:c=>RPG.systems.character.stats(c).defence},
    {id:'health', name:'Max Health', group:'Combat', metric:c=>RPG.systems.character.stats(c).health},
    {id:'level', name:'Combat Level', group:'Combat', metric:c=>c.level, tie:c=>c.xp},
    ...D.skills.map(skill=>({id:skill, name:skill+' Level', group:'Skills', metric:c=>c.skills[skill].level, tie:c=>c.skills[skill].xp})),
    {id:'coins', name:'Richest Player', group:'Journey', metric:c=>c.coins},
    {id:'advance', name:'Most Advances', group:'Journey', metric:c=>c.stats.advance},
    {id:'creatures', name:'Creatures Defeated', group:'Journey', metric:c=>c.stats.regular+c.stats.elite+c.stats.boss},
    {id:'elite', name:'Elite Creatures Defeated', group:'Journey', metric:c=>c.stats.elite},
    {id:'dungeons', name:'Dungeons Conquered', group:'Journey', metric:c=>c.stats.dungeons}
  ];
})(RPG.data);
