'use strict';
(function(D) {
  D.tuning.rawGems = {
    actionMs: 4000,
    xp: D.config.skillXp * D.config.facetingXp,
    scalesWithLevel: true,
    inputs: 1,
    success: 1
  };
  D.tuning.bossGearTiers = 'weighted-location';
  D.gems.forEach((gem, type) => {
    D.catalog['uncut:' + type] = {
      id: 'uncut:' + type,
      name: 'Uncut ' + gem.name.toLowerCase() + ' gem',
      category: 'Gems',
      type,
      rank: 0,
      level: 1,
      rarity: 0
    };
  });
})(RPG.data);
