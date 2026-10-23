'use strict';
(function(D) {
  D.slots = ['Weapon', 'Helmet', 'Plate', 'Greaves', 'Gloves', 'Boots', 'Necklace', 'Ring'];
  D.pieces = ['Melee Weapon', 'Ranged Weapon', 'Magic Weapon', ...D.slots.slice(1), 'Shield', 'Dagger', 'Grimoire'];
  D.slots.push('Secondary');
  D.pieceSlot = piece => piece < 3 ? 'Weapon' : piece >= 10 ? 'Secondary' : D.pieces[piece];
  D.secondaryClass = piece => piece >= 10 ? D.classes[piece - 10] : null;
  // Armour has three class variants; each of the 23 distinct items gets equal weight.
  D.gearWeights = [1,1,1,3,3,3,3,3,1,1,1,1,1];
  D.secondaryPower = .45; // Prefixes and socketed gems also have reduced strength.
  D.classRoles = {Warrior:'All-round bruiser: health, defence and steady damage. Shields add Defence %, damage reduction, critical resistance and Thorn Damage. Plate also reflects incoming damage through Thorn Damage.',Archer:'Ranger: attack speed, penetration and dodge. Small blades support rapid attacks.',Mage:'Critical chance, critical damage and resistance. Grimoires support spell bursts.'};
  D.weapons = [
    ['Worn Sword', 'Shortsword', 'Longsword', 'Battleaxe', 'Greataxe', 'Warhammer', 'Greatsword', 'Halberd', 'Maul', 'Glaive', 'Zweihander', 'Greatblade'],
    ['Worn Bow', 'Shortbow', 'Longbow', 'Recurve Bow', 'Composite Bow', 'Warbow', 'Crossbow', 'Heavy Crossbow', 'Greatbow', 'Arbalest', 'Siege Bow', 'Grandbow'],
    ['Worn Wand', 'Oak Wand', 'Staff', 'Runed Staff', 'Battlestaff', 'Warstaff', 'Scepter', 'Obsidian Staff', 'Crystal Staff', 'Arcane Scepter', 'Grand Staff', 'Archstaff']
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
      hide: 15
    },
    Plate: {
      bar: 10,
      hide: 45
    },
    Greaves: {
      bar: 7,
      hide: 30
    },
    Gloves: {
      bar: 3,
      hide: 15
    },
    Boots: {
      bar: 4,
      hide: 15
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
    thorns: [.001, .004],
    lifeSteal: [.0005, .002]
  };
  D.prefixPools = {
    Secondary: ['damage','defence','health','crit','critDamage','speed','penetration','dodge','resistance'],
    Weapon: ['damage', 'damagePct', 'crit', 'critDamage', 'speed', 'penetration', 'double'],
    Helmet: ['defence', 'defencePct', 'health', 'healthPct', 'resistance'],
    Plate: ['defence', 'defencePct', 'health', 'healthPct', 'reduction'],
    Greaves: ['defence', 'defencePct', 'health', 'healthPct', 'dodge'],
    Gloves: ['damage', 'damagePct', 'crit', 'critDamage', 'speed'],
    Boots: ['defence', 'defencePct', 'health', 'healthPct', 'dodge'],
    Necklace: ['damagePct', 'healthPct', 'defencePct', 'crit', 'critDamage', 'penetration', 'lifeSteal'],
    Ring: ['damagePct', 'healthPct', 'defencePct', 'crit', 'critDamage', 'penetration', 'lifeSteal']
  };
  // Base slot pools also define existing gem eligibility. Gear rolls are class-aware.
  D.prefixPool = item => D.prefixPools[item.slot].map(key=>key==='dodge'&&
    (item.slot==='Secondary'||item.armorClass==='Warrior'&&D.armorSlots.includes(item.slot))?'thorns':key);
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
    Secondary: [0,1,2,3,4,5,6],
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
    chance: [1, 1, 1, 1, 1],
    extraRarity: .05,
    inputs: 3
  };
  D.roman = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'];
  D.skills = ['Mining', 'Woodcutting', 'Fishing', 'Hunting', 'Smithing', 'Cooking', 'Faceting', 'Farming'];
  D.tools = ['Pickaxe', 'Axe', 'Fishing Rod', 'Trap', 'Hammer', 'Frying Pan', 'Chisel', 'Pruning Shears'];
  D.gatherResources = {Mining:'ore',Woodcutting:'logs',Fishing:'fish',Hunting:'hide',Farming:'fiber'};
  D.gatheringSkills = Object.keys(D.gatherResources);
  // Nominal material tiers and sale values only; tools have no use/equip level gate.
  D.toolLevels = [1, 5, 10, 20, 40, 60, 80, 100];
  D.toolSellPrices = [50, 100, 250, 500, 1000, 2500, 5000, 10000];
  D.toolPrefixDescriptions = {
    Efficiency: 'Speeds up active gathering and crafting by 5% per rank. Does not speed up offline XP.',
    Yield: 'Adds a 5% chance per rank to produce one extra item on a successful action.',
    Fortune: 'Adds a 1% chance per rank to find one resource from the next tier when gathering, cooking or smelting. Gathering caps at the current region; a top-tier node gives one extra current-tier resource. Does not apply to equipment or gems.',
    Knowledge: 'Adds 5% skill XP per rank, including offline training.',
    Conservation: 'Adds a 5% chance per rank to preserve a gathering charge or each crafting ingredient. Failed gem fusion still breaks exactly one gem.'
  };
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
  D.healing = [5, 10, 15, 25, 40, 50, 65, 75, 90, 100, 115, 125].map((healing,tier)=>{
    const body=D.config.playerHealth+D.config.playerHealthPerLevel*(D.tiers[tier]-1);
    return Math.round(healing*(body+4*D.gearPower[tier])/(body+4*D.tiers[tier]));
  });
  D.coal = [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1];
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
  const foodFlavor = [
    'A three-course meal, if you count the head and tail.',
    'Once fought the current. Now pairs nicely with sitting down.',
    'Finally lives up to its name: perched on a plate.',
    'Swam upstream for years just to end up beside a fork.',
    'All the bite, significantly fewer teeth.',
    'The only sword in your inventory that improves with butter.',
    'The runes translate to "needs more salt."',
    'Crispy outside, slippery past.',
    'Tastes like dragon. The chef has declined further questions.',
    "Five-star dining, according to the fish's own review.",
    'Wise beyond its years. Poor at spotting frying pans.',
    "Older than the kingdom. Somehow still on today's special."
  ];
  D.resources.fish.forEach((name, tier) => D.catalog['food:' + tier] = {
    id: 'food:' + tier,
    name: 'Cooked ' + name,
    category: 'Food',
    kind: 'food',
    tier,
    level: D.tiers[tier],
    healing: D.healing[tier],
    flavor: foodFlavor[tier],
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
  D.starterMaterials = D.resourceKinds.map(kind => kind + ':0');
  D.starterMaterials.forEach(id => D.shop.push({
    id, name: (D.catalog[id].kind === 'fish' ? 'Raw ' : '') + D.catalog[id].name,
    price: 10, level: 1, category: 'Materials',
    description: 'Level 1 raw material. 10 Bronze per unit.'
  }));
  D.shop.filter(x => !x.level).forEach(x => D.catalog[x.id] = {
    ...x,
    category: 'Utility',
    level: 1,
    rarity: 0
  });
})(RPG.data);
