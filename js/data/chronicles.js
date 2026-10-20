'use strict';
(function(D) {
  const bestCompanion=c=>[c.companion,...Object.values(c.petStable||{})].filter(Boolean).sort((a,b)=>b.level-a.level||b.xp-a.xp)[0];
  D.config.offlineFacetingMultiplier = .075;
  D.companions = [
    {id:'wolf', name:'Lantern Wolf', portrait:4, price:500, stat:'damagePct', perLevel:.005, description:'A loyal hunter. +0.5% Primary Damage per level.'},
    {id:'boar', name:'Briar Boar', portrait:5, price:500, stat:'healthPct', perLevel:.005, description:'A sturdy trail companion. +0.5% Max Health per level.'},
    {id:'golem', name:'Pebble Golem', portrait:11, price:500, stat:'defence', perLevel:.5, description:'A patient stone guardian. +0.5 Defence per level.'},
    {id:'lynx', name:'Ember Lynx', art:0, portrait:3, price:500, stat:'crit', perLevel:.0025, description:'A watchful ambusher. +0.25% Critical Chance per level.'},
    {id:'bear', name:'Thunder Bear', art:1, portrait:6, price:500, stat:'critDamage', perLevel:.01, description:'A mighty forest guardian. +1% Critical Damage per level.'},
    {id:'spider', name:'Silkstride Spider', art:2, portrait:7, price:500, stat:'speed', perLevel:.0025, description:'A nimble weaver. +0.25% Attack Speed per level.'},
    {id:'bat', name:'Duskfang Bat', art:3, portrait:12, price:500, stat:'lifeSteal', perLevel:.001, description:'A dusk-dwelling hunter. +0.1% Lifesteal per level.'}
  ];
  D.specialCompanions = [
    {name:'Sunfire Lynx',art:0,portrait:3,description:'Planned: +0.4% Critical Chance per level.'},
    {name:'Stormcrown Bear',art:1,portrait:6,description:'Planned: +1.5% Critical Damage per level.'},
    {name:'Moonfang Wolf',portrait:4,description:'Planned: +0.75% Primary Damage per level.'}
  ];
  D.emporiumCategories = [
    {name:'Outfits',icon:'Plate',preview:'Outfit collection',description:'Additional equipment for your adventurer. Base outfits will have no Enhancement or Ascension.'},
    {name:'Auras',icon:'gem',preview:'Aura collection',description:'Surround your adventurer with an aura. Base auras will have no Enhancement or Ascension.'},
    {name:'Outfit Mystery Boxes',icon:'Inventory',preview:'Outfit Mystery Box',description:'Discover an outfit from a future collection. Contents and odds: TBD.'},
    {name:'Aura Mystery Boxes',icon:'gem',preview:'Aura Mystery Box',description:'Discover a future aura. Contents and odds: TBD.'},
    {name:'Special Companions',icon:'Companions',description:'Companions with stronger bonuses and the same feeding and upkeep. Planned previews below; availability and stats may change.'},
    {name:'Companion Mystery Boxes',icon:'Companions',preview:'Companion Mystery Box',description:'Meet a future special companion. Contents and odds: TBD.'},
    {name:'Ascendant Stone Boxes',icon:'gem',preview:'Ascendant Stone Box',description:'A future supply of stones for rarity Ascension. Quantity and price: TBD.'}
  ];
  D.companionRules = {levelCap:20, xpFactor:100, hungerPerHour:10, starvationPerHour:10, actionXp:10, victoryXp:25, revivePerLevel:100};
  D.companionRules.levelCaps = [20, 40, 50, 60, 70, 80, 90, 100];
  D.companionRules.ascensionChances = [1, .8, .6, .4, .2, .2, .2];
  D.ascendantCurrency = {perCombatLevel:2, achievement:5, prestige:50, milestones:{10:10,25:25,50:50,75:75,100:100}};
  D.leaderboards = [
    {id:'damage', name:'Primary Damage', group:'Combat', metric:c=>RPG.systems.character.stats(c).damage},
    {id:'defence', name:'Defense', group:'Combat', metric:c=>RPG.systems.character.stats(c).defence},
    {id:'health', name:'Health', group:'Combat', metric:c=>RPG.systems.character.stats(c).health},
    {id:'level', name:'Combat Level', group:'Combat', metric:c=>c.level, tie:c=>c.xp},
    ...[...D.skills].sort((a,b)=>a.localeCompare(b)).map(skill=>({id:skill, name:skill+' Level', group:'Skills', metric:c=>c.skills[skill].level, tie:c=>c.skills[skill].xp})),
    {id:'coins', name:'Richest Player', group:'Journey', metric:c=>c.coins},
    {id:'creatures', name:'Creatures Defeated', group:'Journey', metric:c=>c.stats.regular+c.stats.elite+c.stats.boss},
    {id:'elite', name:'Elite Creatures Defeated', group:'Journey', metric:c=>c.stats.elite},
    {id:'dungeons', name:'Dungeons Completed', group:'Journey', metric:c=>c.stats.dungeons},
    {id:'quests', name:'Quests Completed', group:'Journey', metric:c=>c.questCompletions ?? 0},
    {id:'advance', name:'Most Advances', group:'Journey', metric:c=>c.stats.advance},
    {id:'companion', name:'Highest Companion Level', group:'Journey', metric:c=>bestCompanion(c)?.level||0, tie:c=>bestCompanion(c)?.xp||0},
    {id:'boxes-opened',name:'Mystery Boxes Opened',group:'Journey',metric:c=>c.stats.boxesOpened||0},
    {id:'colosseum-victories',name:'Colosseum Victories',group:'Colosseum',metric:c=>c.colosseum?.victories||0},
    {id:'league-points',name:'League Points',group:'Colosseum',metric:c=>c.colosseum?.points||0}
  ];
  D.leaderboardGroups=['Combat','Skills','Journey','Colosseum'];
})(RPG.data);
