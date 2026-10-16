'use strict';
(function(D) {
  D.config = {
    version: 3,
    saveMode: 'local', // Static hosting and file editions keep all saves on the player device.
    startingBronze: 50,
    restCooldownMs: 30 * 60 * 1000,
    chestChance: .05,
    mimicChance: .01,
    saveHistory: 3,
    levelCap: 100,
    slots: 3,
    advanceMs: 4000,
    afkAdvanceMs: 8000,
    actionMs: 4000,
    nodeCharges: 5,
    attackSeconds: 2,
    foodSeconds: 10,
    peaceFoodSeconds: .5,
    lootMs: 5000,
    simulations: 1000,
    offlineHours: 8,
    offlineRate: .25,
    xpFactor: 500,
    skillXp: 20,
    cookingXp: 3,
    facetingXp: 50,
    enhancementCap: 25,
    prefixSlots: 3,
    failIncrement: .01,
    bossGear: 1.15,
    enhanceStat: .01,
    inventoryStart: 50,
    inventoryMax: 160,
    storageStep: 10,
    listingDays: 7,
    maxListings: 5,
    listingFee: .01,
    saleTariff: .04,
    playerHealth: 100,
    playerHealthPerLevel: 8,
    baseCrit: .05,
    baseCritDamage: .5,
    minimumHit: 1,
    hitLevel: .005,
    minHitChance: .5,
    defenceFactor: 3
  };
  D.caps = {
    crit: .75,
    penetration: .6,
    reduction: .5,
    dodge: .5,
    lifeSteal: .2,
    double: .5,
    speed: 1,
    mitigation: .7
  };
  D.labels = {
    damage: 'Primary Damage',
    defence: 'Defence',
    health: 'Max Health',
    damagePct: 'Primary Damage %',
    defencePct: 'Defence %',
    healthPct: 'Max Health %',
    crit: 'Critical Chance',
    critDamage: 'Critical Damage',
    speed: 'Attack Speed',
    penetration: 'Penetration',
    double: 'Double Attack',
    dodge: 'Dodge',
    reduction: 'Damage Reduction',
    resistance: 'Critical Resistance',
    lifeSteal: 'Life Steal'
  };
  D.classes = ['Warrior', 'Archer', 'Mage'];
  D.primary = ['Attack', 'Ranged', 'Magic'];
  D.modes = ['Regular', 'Hardcore', 'Ironman', 'Hardcore Ironman'];
  D.rarity = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Mythical', 'Divine', 'Ascendant'];
  D.rarityMult = [1, 1.05, 1.1, 1.2, 1.3, 1.45, 1.6, 1.8];
  D.tiers = [1, 5, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
  D.tierNames = ['Worn', 'Leather', 'Iron', 'Steel', 'Hardened', 'Reinforced', 'Runed', 'Obsidian', 'Dragonbone', 'Starsteel', 'Elder', 'Ancient'];
  D.coinUnits = [20, 20, 40, 80, 150, 300, 650, 1250, 2500, 4250, 7500, 12500];
  D.storage = [1000, 2500, 5000, 10000, 25000, 50000, 100000, 250000, 500000, 1000000, 2500000];
  D.enhance = {
    chance: [1, .8, .6, .4, .2],
    coins: [1, 2, 4, 8, 16],
    bars: [1, 2, 3, 4, 5],
    secondary: [3, 6, 9, 12, 15],
    weaponLogs: [3, 6, 9, 12, 15]
  };
  D.ascend = {
    chance: [1, .8, .6, .4, .25, .1, .05],
    coins: [1, 2, 4, 8, 16, 32, 64],
    materials: [.1, .15, .2, .25, .35, .5, .75]
  };
  D.sockets = {
    regular: [5, 15, 25],
    boss: [5, 10, 15, 20, 25]
  };
  D.tuning = {
    elite: {
      health: 1.9,
      damage: 1.65,
      defence: 1.6
    },
    toolBaseMaterials: 10,
    toolBaseCoins: 20,
    productionYield: true,
    productionFortune: true,
    starterGear: 'weapon',
    respawnFull: true,
    rawGems: null,
    bossGearTiers: null,
    chiselFortune: false
  };
  D.shop = [{
    id: 'extractor',
    name: 'Gem Extractor',
    price: 2500,
    category: 'Utility',
    description: 'Safely returns one socketed gem.'
  }, {
    id: 'remover',
    name: 'Enchantment Remover',
    price: 10000,
    category: 'Utility',
    description: 'Resets + level, prefixes and sockets. Extract or destroy gems first.'
  }, {
    id: 'appearance',
    name: 'Appearance Token',
    price: 5000,
    category: 'Character',
    description: 'Change your portrait and cloak colour.'
  }, {
    id: 'rename',
    name: 'Name Change Contract',
    price: 10000,
    category: 'Character',
    description: 'Choose a new character name.'
  }, {
    id: 'eat50',
    name: 'Auto-Eat 50%',
    price: 50000,
    level: 50,
    category: 'Character',
    description: 'Permanent 50% HP threshold.'
  }, {
    id: 'eat75',
    name: 'Auto-Eat 75%',
    price: 250000,
    level: 75,
    category: 'Character',
    description: 'Permanent 75% HP threshold.'
  }];
  D.xpNext = level => D.config.xpFactor * level * level;
  D.tierFor = level => Math.max(0, D.tiers.findLastIndex(v => v <= level));
})(RPG.data);
