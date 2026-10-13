'use strict';
(function(D) {
  D.slots = ['Weapon', 'Helmet', 'Plate', 'Greaves', 'Gloves', 'Boots', 'Necklace', 'Ring'];
  D.pieces = ['Melee Weapon', 'Ranged Weapon', 'Magic Weapon', ...D.slots.slice(1)];
  D.weapons = [
    ['Worn Sword', 'Shortsword', 'Longsword', 'Battleaxe', 'Greataxe', 'Warhammer', 'Greatsword', 'Halberd', 'Maul', 'Glaive', 'Zweihander', 'Greatblade'],
    ['Worn Bow', 'Shortbow', 'Longbow', 'Recurve Bow', 'Composite Bow', 'Warbow', 'Crossbow', 'Heavy Crossbow', 'Greatbow', 'Arbalest', 'Siege Bow', 'Grandbow'],
    ['Worn Wand', 'Oak Wand', 'Staff', 'Runed Staff', 'Battlestaff', 'Warstaff', 'Scepter', 'Spellbook', 'Crystal Staff', 'Arcane Scepter', 'Grand Staff', 'Archstaff']
  ];
  D.itemStats = {
    Weapon: {
      damage: .75
    },
    Helmet: {
      defence: .35,
      health: .6
    },
    Plate: {
      defence: .7,
      health: 1.5
    },
    Greaves: {
      defence: .55,
      health: 1.1
    },
    Gloves: {
      damage: .15
    },
    Boots: {
      defence: .3,
      health: .5
    },
    Necklace: {
      damage: .05,
      health: .2
    },
    Ring: {
      damage: .05,
      health: .2
    }
  };
  D.equipmentRecipes = {
    Weapon: {
      bar: 15,
      logs: 30
    },
    Helmet: {
      bar: 5,
      hide: 5
    },
    Plate: {
      bar: 10,
      hide: 15
    },
    Greaves: {
      bar: 7,
      hide: 10
    },
    Gloves: {
      bar: 3,
      hide: 5
    },
    Boots: {
      bar: 4,
      hide: 5
    },
    Necklace: {
      bar: 3
    },
    Ring: {
      bar: 2
    }
  };
  D.prefixRanges = {
    damage: [1, 3],
    damagePct: [.005, .015],
    crit: [.001, .004],
    critDamage: [.005, .015],
    speed: [.002, .008],
    penetration: [.001, .005],
    double: [.001, .004],
    defence: [1, 3],
    defencePct: [.005, .015],
    health: [5, 15],
    healthPct: [.005, .015],
    resistance: [.001, .005],
    reduction: [.001, .005],
    dodge: [.001, .004],
    lifeSteal: [.0005, .002]
  };
  D.prefixPools = {
    Weapon: ['damage', 'damagePct', 'crit', 'critDamage', 'speed', 'penetration', 'double'],
    Helmet: ['defence', 'defencePct', 'health', 'healthPct', 'resistance'],
    Plate: ['defence', 'defencePct', 'health', 'healthPct', 'reduction'],
    Greaves: ['defence', 'defencePct', 'health', 'healthPct', 'dodge'],
    Gloves: ['damage', 'damagePct', 'crit', 'critDamage', 'speed'],
    Boots: ['defence', 'defencePct', 'health', 'healthPct', 'dodge'],
    Necklace: ['damagePct', 'healthPct', 'defencePct', 'crit', 'critDamage', 'penetration', 'lifeSteal'],
    Ring: ['damagePct', 'healthPct', 'defencePct', 'crit', 'critDamage', 'penetration', 'lifeSteal']
  };
  D.gems = [{
    name: 'Attack',
    stat: 'damage',
    value: 2,
    style: 0
  }, {
    name: 'Ranged',
    stat: 'damage',
    value: 2,
    style: 1
  }, {
    name: 'Magic',
    stat: 'damage',
    value: 2,
    style: 2
  }, {
    name: 'Defence',
    stat: 'defence',
    value: 4
  }, {
    name: 'Health',
    stat: 'health',
    value: 10
  }, {
    name: 'Critical Chance',
    stat: 'crit',
    value: .004
  }, {
    name: 'Critical Damage',
    stat: 'critDamage',
    value: .02
  }];
  D.gemAllowed = {
    Weapon: [0, 1, 2, 5, 6],
    Gloves: [0, 1, 2, 5, 6],
    Helmet: [3, 4],
    Plate: [3, 4],
    Greaves: [3, 4],
    Boots: [3, 4],
    Necklace: [3, 4, 5, 6],
    Ring: [3, 4, 5, 6]
  };
  D.facet = {
    levels: [1, 25, 50, 75, 100],
    chisel: [0, 3, 4, 5, 7],
    chance: [1, .8, .6, .4, .2],
    extraRarity: .05,
    inputs: 3
  };
  D.roman = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];
  D.skills = ['Mining', 'Woodcutting', 'Fishing', 'Hunting', 'Smithing', 'Cooking', 'Faceting'];
  D.tools = ['Pickaxe', 'Axe', 'Fishing Rod', 'Trap', 'Hammer', 'Frying Pan', 'Chisel'];
  D.toolLevels = [1, 5, 10, 20, 40, 60, 80, 100];
  D.toolPrefixes = {
    Efficiency: .05,
    Yield: .05,
    Fortune: .01,
    Knowledge: .05,
    Conservation: .05
  };
  D.resources = {
    ore: ['Copper Ore', 'Tin Ore', 'Iron Ore', 'Coal', 'Silver Ore', 'Gold Ore', 'Runite Ore', 'Obsidian Shard', 'Draconite Ore', 'Starsteel Ore', 'Elderstone', 'Ancient Ore'],
    logs: ['Pine Logs', 'Oak Logs', 'Birch Logs', 'Maple Logs', 'Ash Logs', 'Yew Logs', 'Runewood Logs', 'Charredwood Logs', 'Wyrmwood Logs', 'Starwood Logs', 'Elderwood Logs', 'Ancientwood Logs'],
    fish: ['Minnow', 'Trout', 'Perch', 'Salmon', 'Pike', 'Swordfish', 'Runefin', 'Obsidian Eel', 'Wyrmfin', 'Starfin', 'Elder Koi', 'Ancient Sturgeon'],
    hide: ['Rabbit Pelt', 'Fox Pelt', 'Boar Hide', 'Deer Hide', 'Bear Pelt', 'Direwolf Pelt', 'Runestag Hide', 'Obsidian Scale', 'Wyrmhide', 'Starhorn Hide', 'Elderbeast Hide', 'Ancient Beast Hide'],
    bar: ['Copper Bar', 'Tin Bar', 'Iron Bar', 'Steel Bar', 'Silver Bar', 'Gold Bar', 'Runite Bar', 'Obsidian Bar', 'Draconite Bar', 'Starsteel Bar', 'Elder Bar', 'Ancient Bar']
  };
  D.resourceKinds = ['ore', 'logs', 'fish', 'hide'];
  D.healing = [5, 10, 15, 25, 40, 50, 65, 75, 90, 100, 115, 125];
  D.coal = [0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5];
  D.catalog = {
    stone: {
      id: 'stone',
      name: 'Ascendant Stone',
      category: 'Materials',
      level: 1,
      rarity: 7
    }
  };
  Object.entries(D.resources).forEach(([kind, names]) => names.forEach((name, tier) => D.catalog[kind + ':' + tier] = {
    id: kind + ':' + tier,
    name,
    category: 'Materials',
    kind,
    tier,
    level: D.tiers[tier],
    rarity: 0
  }));
  D.resources.fish.forEach((name, tier) => D.catalog['food:' + tier] = {
    id: 'food:' + tier,
    name: 'Cooked ' + name,
    category: 'Food',
    kind: 'food',
    tier,
    level: D.tiers[tier],
    healing: D.healing[tier],
    rarity: 0
  });
  D.gems.forEach((gem, type) => {
    for (let rank = 1; rank <= 5; rank++) D.catalog['gem:' + type + ':' + rank] = {
      id: 'gem:' + type + ':' + rank,
      name: gem.name + ' Gem ' + D.roman[rank],
      category: 'Gems',
      type,
      rank,
      level: D.facet.levels[rank - 1],
      rarity: rank
    };
  });
  D.shop.filter(x => !x.level).forEach(x => D.catalog[x.id] = {
    ...x,
    category: 'Utility',
    level: 1,
    rarity: 0
  });
})(RPG.data);
