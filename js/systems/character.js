'use strict';
(function(G, D, S) {
  S.character = {
    stats(c) {
      const s = {
        level: c.level,
        damage: c.level,
        health: D.config.playerHealth + D.config.playerHealthPerLevel * (c.level - 1),
        defence: 0,
        crit: D.config.baseCrit,
        critDamage: D.config.baseCritDamage,
        speed: 0,
        penetration: 0,
        double: 0,
        dodge: 0,
        reduction: 0,
        resistance: 0,
        lifeSteal: 0,
        damagePct: 0,
        healthPct: 0,
        defencePct: 0
      };
      const add = (key, val) => s[key] = typeof val === 'boolean' ? val : (s[key] || 0) + val;
      for (const item of Object.values(c.equipment).filter(Boolean)) {
        Object.entries(S.items.stats(item)).forEach(([k, v]) => add(k, v));
        Object.entries(item.prefixes).forEach(([k, v]) => add(k, v));
        item.gems.filter(Boolean).forEach(id => {
          const gem = D.catalog[id],
            def = D.gems[gem.type];
          if (def.style === undefined || def.style === D.classes.indexOf(c.class)) add(def.stat, def.value * gem.rank);
        });
      }
      for (const [level, choice] of Object.entries(c.perks)) {
        const index = D.perkLevels.indexOf(+level);
        Object.entries(D.perkEffects[index][choice]).forEach(([k, v]) => add(k, v));
      }
      for (const stat of ['damage', 'defence', 'health']) s[stat] *= 1 + s[stat + 'Pct'];
      s.raw = {
        ...s
      };
      for (const [key, cap] of Object.entries(D.caps))
        if (s[key] !== undefined) s[key] = G.clamp(s[key], 0, cap);
      s.interval = D.config.attackSeconds / (1 + s.speed);
      return s;
    },
    choose(level, choice) {
      G.ensureIdle();
      const c = G.character();
      G.assert(D.perkLevels.includes(level) && c.level >= level, 'Perk milestone is locked.');
      G.assert(c.perks[level] === undefined, 'This milestone already has a selected perk.');
      G.assert([0, 1, 2].includes(choice), 'Invalid perk.');
      c.perks[level] = choice;
      S.tutorial?.perkChosen();
      G.runtime.estimate = null;
      G.commit();
    }
  };
})(RPG, RPG.data, RPG.systems);
