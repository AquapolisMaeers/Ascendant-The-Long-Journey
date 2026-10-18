'use strict';
(function(D) {
  D.recipes = [];
  for (let tier = 0; tier < D.tiers.length; tier++) {
    const level = D.tiers[tier],
      cost = {
        ['ore:' + (tier === 3 ? 2 : tier)]: 5
      };
    if (D.coal[tier]) cost['ore:3'] = D.coal[tier];
    D.recipes.push({
      id: 'bar:' + tier,
      name: D.resources.bar[tier],
      skill: 'Smithing',
      tier,
      level,
      cost,
      output: 'bar:' + tier,
      xp: D.config.skillXp * level * Object.values(cost).reduce((a, n) => a + n, 0)
    });
    for (let piece = 0; piece < 10; piece++) {
      const slot = piece < 3 ? 'Weapon' : D.pieces[piece];
      const recipe = {
        id: 'gear:' + tier + ':' + piece,
        name: piece < 3 ? D.weapons[piece][tier] : D.tierNames[tier] + ' ' + slot,
        skill: 'Smithing',
        tier,
        level,
        piece,
        cost: Object.fromEntries(Object.entries(D.equipmentRecipes[slot]).map(([k, n]) => [k + ':' + tier, n])),
        xp: D.config.skillXp * level * (D.equipmentRecipes[slot].bar * (5 + D.coal[tier]) + (D.equipmentRecipes[slot].logs || 0) + (D.equipmentRecipes[slot].hide || 0))
      };
      if(D.armorSlots.includes(slot)) {
        for(const armorClass of D.classes) D.recipes.push({...recipe,
          id:recipe.id+(armorClass==='Warrior'?'':':'+armorClass),armorClass,
          name:D.tierNames[tier]+' '+D.armorNames[armorClass][D.armorSlots.indexOf(slot)]+' · '+armorClass});
      } else D.recipes.push(recipe);
    }
    D.recipes.push({
      id: 'cook:' + tier,
      name: 'Cooked ' + D.resources.fish[tier],
      skill: 'Cooking',
      tier,
      level,
      cost: {
        ['fish:' + tier]: 1
      },
      output: 'food:' + tier,
      xp: D.config.skillXp * level * D.config.cookingXp
    });
  }
  D.gems.forEach((gem, type) => {
    for (let rank = 0; rank < 5; rank++) D.recipes.push({
      id: 'facet:' + type + ':' + rank,
      name: gem.name + ' Gem ' + D.roman[rank + 1],
      skill: 'Faceting',
      tier: D.tierFor(D.facet.levels[rank]),
      level: D.facet.levels[rank],
      type,
      rank,
      cost: {
        [rank === 0 ? 'uncut:' + type : 'gem:' + type + ':' + rank]: rank === 0 ? 1 : D.facet.inputs
      },
      output: 'gem:' + type + ':' + (rank + 1),
      xp: D.config.skillXp * D.facet.levels[rank] * D.config.facetingXp
    });
  });
})(RPG.data);
