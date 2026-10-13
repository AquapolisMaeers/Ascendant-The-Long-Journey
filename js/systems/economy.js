'use strict';
(function(G, D, S) {
  S.shop = {
    buy(id, quantity = 1) {
      G.ensureIdle();
      const c = G.character(),
        item = D.shop.find(i => i.id === id);
      G.assert(item, 'Unknown shop item.');
      G.assert(c.level >= (item.level || 1), 'Requires character level ' + item.level + '.');
      const threshold = id === 'eat50' ? .5 : id === 'eat75' ? .75 : null;
      G.assert(threshold === null || !c.eatUnlocks.includes(threshold), 'Already unlocked.');
      G.assert(Number.isSafeInteger(quantity) && quantity > 0 && quantity <= 1000000, 'Choose a valid purchase quantity.');
      G.assert(item.category === 'Materials' || quantity === 1, 'Buy this upgrade one at a time.');
      const total = item.price * quantity;
      const stack = c.inventory.find(i => i.kind === 'stack' && i.key === id);
      G.assert(!stack || Number.isSafeInteger(stack.quantity + quantity), 'This stack cannot hold more units.');
      G.assert(Number.isSafeInteger(total) && c.coins >= total, 'Insufficient coins.');
      G.assert(threshold !== null || stack || c.inventory.length < c.capacity, 'Inventory full.');
      c.coins -= total;
      if (threshold) c.eatUnlocks.push(threshold);
      else S.inventory.reward([{
        key: id,
        quantity
      }]);
      G.notify(item.name + ' purchased.', 'success');
      G.commit();
    },
    expand() {
      G.ensureIdle();
      const c = G.character(),
        price = D.storage[(c.capacity - 50) / 10];
      G.assert(price !== undefined, 'Maximum inventory capacity reached.');
      G.assert(c.coins >= price, 'Insufficient coins.');
      c.coins -= price;
      c.capacity += D.config.storageStep;
      G.commit();
    },
    rename(name) {
      G.ensureIdle();
      G.assert(name.trim().length >= 2 && name.trim().length <= 24, 'Name must contain 2–24 characters.');
      S.inventory.take('rename', 1);
      G.character().name = name.trim();
      G.commit();
    },
    appearance(value) {
      G.assert(D.validAppearance(value), 'Invalid appearance.');
      S.character.customize({look:value.look ?? 0, color:value.color});
    }
  };
  S.market = {
    allowed(c = G.character()) {
      return c && !c.mode.includes('Ironman');
    },
    assert() {
      G.assert(this.allowed(), 'Marketplace is unavailable for Ironman modes.');
    },
    tradable(item) {
      if (item.kind === 'tool') return !item.locked && !item.bound && Object.keys(item.prefixes).length === 0;
      return !item.locked && (item.kind === 'gear' ? item.enhance === 0 && Object.keys(item.prefixes).length === 0 && !item.gems.some(Boolean) : item.kind === 'stack' && D.catalog[item.key].category !== 'Utility');
    },
    list(id, quantity, price) {
      G.assert(!S.tutorial?.active(), 'Finish the required tutorial before listing its supplies.');
      this.assert();
      G.ensureIdle();
      const c = G.character();
      G.assert(c.listings.filter(l => l.status === 'active').length < D.config.maxListings, 'Maximum five active listings.');
      const item = c.inventory.find(i => i.id === id);
      G.assert(item && this.tradable(item), 'Unlock this item. Gear must be +0 with no prefixes or inserted gems; tools and utility items cannot be listed.');
      G.assert(Number.isSafeInteger(price) && price > 0 && price <= 1e12, 'Enter a valid whole-Bronze asking price.');
      G.assert(Number.isSafeInteger(quantity) && quantity > 0 && quantity <= (item.quantity || 1), 'Invalid quantity.');
      const fee = Math.ceil(price * D.config.listingFee);
      G.assert(c.coins >= fee, 'Insufficient coins for the 1% listing fee.');
      const listed = G.clone(item);
      listed.id = G.uid();
      if (item.kind === 'stack') {
        listed.quantity = quantity;
        S.inventory.take(item.key, quantity);
      } else c.inventory.splice(c.inventory.indexOf(item), 1);
      c.coins -= fee;
      c.listings.push({
        id: G.uid(),
        item: listed,
        price,
        fee,
        created: Date.now(),
        expires: Date.now() + D.config.listingDays * 86400000,
        status: 'active'
      });
      c.stats.listing++;
      G.commit();
    },
    expire(c) {
      for (const l of c.listings)
        if (l.status === 'active' && l.expires <= Date.now()) l.status = 'retrieval';
    },
    retrieve(id) {
      this.assert();
      G.ensureIdle();
      const c = G.character(),
        l = c.listings.find(l => l.id === id);
      G.assert(l, 'Listing not found.');
      const old = l.item.kind === 'stack' ? c.inventory.find(i => i.kind === 'stack' && i.key === l.item.key) : null;
      G.assert(old || c.inventory.length < c.capacity, 'Inventory full. The item remains safely in retrieval.');
      if (old) old.quantity += l.item.quantity;
      else c.inventory.push(l.item);
      c.listings.splice(c.listings.indexOf(l), 1);
      G.commit();
    }
  };
})(RPG, RPG.data, RPG.systems);
