'use strict';
(function(D) {
  // Bronze prices follow destination difficulty; distance is counted in region steps.
  D.afkMinuteRates = [10,20,40,75,125,200,350,500,750,1000,1500];
  D.travelStepPrices = [20,40,75,125,200,350,500,750,1000,1500,2500];
  D.locationWeather = ['clear','rain','wind','wind','rain','rain','clear','wind','wind','rain','wind'];
  const rows = [
    ['Weathered Crossroads', 1, 9, 'Old roads meet beneath a pale moon. Beyond the lantern light, something watches.', 'Wolf|Highwayman|Wild Boar', 'Aggressive|Balanced Melee|Tanky', 'Dire Wolf|Brigand Captain', 'Aggressive/Crit|Balanced', 15, 25],
    ['Ironwood Vale', 10, 19, 'Iron-dark branches swallow the trail. Silk glints between the ancient trunks.', 'Black Bear|Ironwood Spider|Outlaw Archer', 'Tanky|Fast/Crit|Ranged', 'Ironhide Bear|Ironfang Spider', 'Heavy Tank|Fast/High Damage', 30, 50],
    ['Steelmarch', 20, 29, 'Rusted standards mark a battlefield that has never fallen silent.', 'Mercenary|Crossbowman|Steelback Hound', 'Balanced Melee|Ranged|Aggressive', 'Veteran Mercenary|Steelclaw Hound', 'Heavy Melee|Fast/Crit', 60, 100],
    ['Stonebreak Highlands', 30, 39, 'Wind tears through broken ridgelines. Heavy footsteps answer from the mist.', 'Hill Troll|Rock Viper|Highland Raider', 'Tanky|Fast/Crit|Aggressive Melee', 'Stonehide Troll|Raider Berserker', 'Heavy Tank|High Damage', 100, 200],
    ['Bastion Reach', 40, 49, 'The black walls still stand. Their former defenders have forgotten whom they serve.', 'Deserter Knight|Siege Archer|War Mastiff', 'Defence|Ranged|Aggressive', 'Blackguard Knight|Siege Commander', 'Heavy Defence|Balanced/High Damage', 200, 400],
    ['Runefall Basin', 50, 59, 'Broken runes drift above still water, whispering the names of their makers.', 'Rune Sentinel|Mana Wraith|Runebound Stalker', 'Tanky/Magic|Magic|Fast/Crit', 'Runic Guardian|Arcane Wraith', 'Heavy Tank/Magic|High Magic Damage', 500, 800],
    ['Obsidian Hollow', 60, 69, 'Ash falls like snow. Beneath the glass-black earth, a furnace breathes.', 'Ash Fiend|Obsidian Golem|Cinder Drake', 'Aggressive|Heavy Defence|Magic/Ranged', 'Molten Golem|Infernal Drake', 'Extreme Defence|High Damage/Magic', 1000, 1500],
    ['Wyrmbone Wastes', 70, 79, 'The ribs of ancient wyrms arch over a kingdom of dust and teeth.', 'Bone Drake|Wyrm Scavenger|Bone Reaver', 'Balanced|Fast|Aggressive Melee', 'Wyrmbone Drake|Bone Tyrant', 'Tanky/High Damage|Heavy Melee', 2000, 3000],
    ['Starfall Peaks', 80, 89, 'A shattered heaven lies scattered on the mountain. Its guardians have not slept.', 'Starborn Harpy|Astral Golem|Fallen Seraph', 'Fast/Ranged|Tanky|Magic', 'Starforged Golem|Astral Seraph', 'Extreme Defence|Magic/Crit', 3500, 5000],
    ['Elderwild', 90, 99, 'Roots older than memory move beneath your feet. The forest remembers every trespass.', 'Elder Treant|Ancient Stag|Elderwood Wraith', 'Heavy Tank|Fast/Balanced|Magic', 'Elder Guardian|Primeval Treant', 'Defence/Magic|Extreme Health/Defence', 6000, 9000],
    ['The Ancient Dominion', 100, 100, 'Beyond the last gate, a ruined crown still commands the dark.', 'Ancient Revenant|Voidbound Knight|Ancient Seraph', 'Balanced|Heavy Melee|Magic', 'Ascended Revenant|Dominion Guardian', 'High Damage/Crit|Extreme Defence/Magic', 10000, 15000]
  ];
  D.locations = rows.map((r, id) => ({
    id,
    name: r[0],
    level: r[1],
    max: r[2],
    description: r[3],
    regular: r[4].split('|').map((name, i) => ({
      name,
      archetype: r[5].split('|')[i]
    })),
    elite: r[6].split('|').map((name, i) => ({
      name,
      archetype: r[7].split('|')[i]
    })),
    coins: [r[8], r[9]],
    dungeon: [2, 4, 6, 8, 10].includes(id) ? id / 2 - 1 : null
  }));
  D.dungeons = [
    ['The Ironblood Keep', 'Ironblood Warlord', 'Ironblood', ['Bloodcleaver', 'Ironspike Warbow', "Warlord's Bloodstaff"]],
    ['The Black Bastion', 'Black Bastion Tyrant', 'Black Bastion', ["Tyrant's Breaker", 'Blackbolt Arbalest', "Tyrant's Scepter"]],
    ['The Infernal Crucible', 'Crucible Behemoth', 'Crucible', ['Molten Cleaver', 'Emberbolt Crossbow', 'Flamecore Staff']],
    ['The Shattered Firmament', 'Starfallen Sovereign', 'Starfallen', ['Starbreaker', 'Astral Piercer', "Sovereign's Starstaff"]],
    ['The Dominion of Ruin', 'Ancient Dominion King', 'Ancient Dominion', ['Ruinbringer', 'Dominion Greatbow', "Ancient King's Scepter"]]
  ].map((r, id) => ({
    id,
    name: r[0],
    boss: r[1],
    prefix: r[2],
    weapons: r[3],
    level: (id + 1) * 20,
    location: (id + 1) * 2
  }));
  D.enemyBase = {
    health: 20,
    healthPerLevel: 8,
    damage: 5,
    damagePerLevel: 1.4,
    defencePerLevel: 1
  };
  // Crossroads stays unchanged. Later regions demand current-tier equipment.
  D.enemyScaling = location => ({
    health: 1 + .12 * location + .008 * location * location,
    damage: 1 + .06 * location + .003 * location * location,
    defence: 1 + .08 * location + .004 * location * location,
    penetration: location * .012,
    resistance: location * .01
  });
  D.dungeonLevels = {regular: [0, 4], elite: [5, 9], boss: [7, 9]};
  D.boss = {
    health: 7,
    damage: 2.5,
    defence: 2.25,
    penetration: .1,
    crit: .1,
    critDamage: .75
  };
  D.archetypes = {
    Balanced: {},
    'Balanced Melee': {},
    Aggressive: {
      damage: 1.15,
      health: .9
    },
    'Aggressive Melee': {
      damage: 1.15,
      health: .9
    },
    Tanky: {
      health: 1.25,
      damage: .9
    },
    Fast: {
      speed: .2,
      damage: .85
    },
    Crit: {
      crit: .1
    },
    Ranged: {
      damage: 1.05,
      defence: .9
    },
    Magic: {
      penetration: .05,
      defence: .85
    },
    Defence: {
      defence: 1.3,
      damage: .95
    },
    'Heavy Melee': {
      damage: 1.25,
      speed: -.1
    },
    'High Damage': {
      damage: 1.3,
      health: .9
    },
    'High Magic Damage': {
      damage: 1.3,
      penetration: .08
    },
    'Heavy Tank': {
      health: 1.45,
      defence: 1.2,
      damage: .85
    },
    'Heavy Defence': {
      defence: 1.6,
      damage: .9
    },
    'Extreme Defence': {
      defence: 2,
      damage: .85
    },
    'Extreme Health': {
      health: 1.7,
      damage: .85
    }
  };
  D.encounters = {
    without: [42 - D.config.chestChance * 100, 8, 10, 10, 10, 10, 10, 0, D.config.chestChance * 100],
    with: [40 - D.config.chestChance * 100, 8, 10, 10, 10, 10, 10, 2, D.config.chestChance * 100],
    types: ['regular', 'elite', 'Mining', 'Woodcutting', 'Fishing', 'Hunting', 'Farming', 'dungeon', 'treasure']
  };
  D.toolDrops = {
    weights: [1, 1, 1, 1, 1, 1, 1, 1]
  };
  D.loot = {
    regular: {
      material: .15,
      gem: .1,
      gear: .02,
      tool: .02,
      stone: .005,
      quantity: 1,
      divisor: 2,
      coins: 1,
      xp: 100,
      rarities: [65, 23, 8, 2.5, .9, .35, .15, .1]
    },
    elite: {
      material: .3,
      gem: .2,
      gear: .05,
      tool: .05,
      stone: .01,
      quantity: 2,
      divisor: 3,
      coins: 2,
      xp: 300,
      rarities: [55, 27, 11, 4.5, 1.5, .55, .25, .2]
    },
    boss: {
      material: .6,
      gem: .4,
      gear: .125,
      tool: .10,
      stone: .02,
      quantity: 3,
      divisor: 5,
      coins: 10,
      xp: 2000,
      rarities: [40, 30, 17, 8, 3, 1, .5, .5]
    }
  };
  D.gemDrops = [
    [1, [100]],
    [25, [75, 25]],
    [50, [35, 50, 15]],
    [75, [20, 25, 45, 10]],
    [100, [20, 15, 50, 10, 5]]
  ];
})(RPG.data);
