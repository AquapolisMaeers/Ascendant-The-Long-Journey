'use strict';
(function(G, D, S) {
  S.shop.value = function(item) {
    if (item.kind === 'gear') return Object.entries(S.items.recipe(item)).reduce((n, [key, q]) => n + q * this.stackValue(key), 0);
    if (item.kind === 'tool') return item.bound ? 0 : D.toolLevels[item.rarity];
    return this.stackValue(item.key);
  };
  S.shop.stackValue = function(key) {
    const data = D.catalog[key];
    if (!data) return 0;
    if (data.kind === 'bar') {
      const recipe = D.recipes.find(r => r.id === key);
      return Object.entries(recipe.cost).reduce((n, [k, q]) => n + q * D.catalog[k].level, 0);
    }
    if (data.kind === 'food') return D.tiers[data.tier];
    return data.level;
  };
  S.shop.sell = function(id, quantity = 1) {
    G.ensureIdle();
    G.assert(!S.tutorial?.active(), 'Finish or skip the tutorial before selling its materials.');
    const c = G.character(),
      item = c.inventory.find(i => i.id === id);
    G.assert(item, 'Only unequipped inventory items can be sold.');
    G.assert(!item.locked && !item.bound, 'Unlock the item before selling. Bound starter tools cannot be sold.');
    G.assert(Number.isSafeInteger(quantity) && quantity > 0 && quantity <= (item.quantity || 1), 'Choose a valid sale quantity.');
    const total = this.value(item) * quantity;
    G.assert(Number.isSafeInteger(total) && total > 0 && Number.isSafeInteger(c.coins + total), 'Invalid sale value.');
    if (item.kind === 'stack') S.inventory.take(item.key, quantity);
    else c.inventory.splice(c.inventory.indexOf(item), 1);
    c.coins += total;
    S.inventory.resolve();
    G.notify('Sold ' + quantity + ' × ' + (item.kind === 'stack' ? D.catalog[item.key].name : S.items.name(item)) + ' for ' + G.money(total) + '.', 'success');
  };
})(RPG, RPG.data, RPG.systems);
