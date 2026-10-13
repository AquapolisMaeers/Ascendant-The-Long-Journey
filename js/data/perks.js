'use strict';
(function(D) {
  D.perkLevels = [1, 25, 50, 75, 100];
  D.perkNames = {
    Warrior: [
      ['Strong Arm', 'Toughened', 'Battle Rhythm'],
      ['Brutal Precision', 'Iron Guard', 'Bloodlust'],
      ['Armor Breaker', 'Unyielding', 'Second Wind'],
      ['Executioner', 'Last Stand', 'Relentless'],
      ['Warlord', 'Juggernaut', 'Battle Master']
    ],
    Archer: [
      ['Deadeye', 'Nimble Frame', 'Quickdraw'],
      ['Eagle Eye', 'Hardened Leathers', "Hunter's Blood"],
      ['Piercing Shot', 'Evasive Discipline', 'Second Wind'],
      ['Finisher', 'Survival Instinct', 'Relentless Volley'],
      ['Master Marksman', 'Untouchable', 'Pathfinder']
    ],
    Mage: [
      ['Arcane Force', 'Mana Ward', 'Quick Casting'],
      ['Spell Precision', 'Arcane Barrier', 'Siphoning Magic'],
      ['Spell Pierce', 'Mystic Bulwark', 'Second Wind'],
      ['Annihilation', 'Last Ward', 'Arcane Rhythm'],
      ['Archmage', 'Eternal Ward', 'Spellmaster']
    ]
  };
  D.perkEffects = [
    [{
      damagePct: .1
    }, {
      healthPct: .1
    }, {
      speed: .08
    }],
    [{
      crit: .1,
      critDamage: .15
    }, {
      defencePct: .15
    }, {
      lifeSteal: .015
    }],
    [{
      penetration: .15
    }, {
      reduction: .08
    }, {
      secondWind: true
    }],
    [{
      executioner: true
    }, {
      lastStand: true
    }, {
      relentless: true
    }],
    [{
      damagePct: .12,
      double: .05
    }, {
      healthPct: .12,
      defencePct: .1,
      reduction: .04
    }, {
      speed: .1,
      penetration: .08,
      lifeSteal: .015
    }]
  ];
  D.perkConditional = {
    secondWind: {
      threshold: .35,
      heal: .1
    },
    executioner: {
      threshold: .3,
      damage: .2
    },
    lastStand: {
      threshold: .3,
      reduction: .2
    },
    relentless: {
      hits: 8,
      heal: .02
    }
  };
  D.perkDescriptions = [
    ['+10% Primary Damage', '+10% Max Health', '+8% Attack Speed'],
    ['+10% Crit Chance · +15% Crit Damage', '+15% Defence', '+1.5% Life Steal'],
    ['+15% Penetration', '+8% Damage Reduction', 'Once per fight, below 35% HP: restore 10% Max Health'],
    ['+20% damage against enemies below 30% HP', 'Below 30% HP: +20% Damage Reduction', 'Every 8th successful attack restores 2% Max Health'],
    ['+12% Primary Damage · +5% Double Attack', '+12% Health · +10% Defence · +4% Damage Reduction', '+10% Attack Speed · +8% Penetration · +1.5% Life Steal']
  ];
})(RPG.data);
