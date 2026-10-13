'use strict';
(function(G, D, S) {
  S.items = {
    create(tier, piece, rarity = 0, boss = null) {
      const style = piece < 3 ? piece : null,
        slot = piece < 3 ? 'Weapon' : D.pieces[piece];
      return {
        id: G.uid(),
        kind: 'gear',
        tier,
        piece,
        slot,
        style,
        rarity,
        boss,
        enhance: 0,
        prefixes: {},
        gems: [],
        enhanceFail: 0,
        ascendFail: 0,
        locked: false
      };
    },
    createTool(skill, rarity = 0, bound = false) {
      return {
        id: G.uid(),
        kind: 'tool',
        skill,
        name: D.tools[D.skills.indexOf(skill)],
        rarity,
        prefixes: {},
        ascendFail: 0,
        locked: bound,
        bound
      };
    },
    announcePrefix(item, event) {
      G.emit('prefix', {
        ...event,
        itemName: this.name(item),
        tool: item.kind === 'tool'
      });
    },
    name(item) {
      if (item.kind === 'tool') return item.name;
      const d = item.boss !== null ? D.dungeons[item.boss] : null;
      return d ? (item.style !== null ? d.weapons[item.style] : d.prefix + ' ' + (item.slot === 'Helmet' ? 'Helm' : item.slot)) : (item.style !== null ? D.weapons[item.style][item.tier] : D.tierNames[item.tier] + ' ' + item.slot);
    },
    stats(item) {
      const mult = D.tiers[item.tier] * (item.boss !== null ? D.config.bossGear : 1) * D.rarityMult[item.rarity] * (1 + D.config.enhanceStat * item.enhance);
      return Object.fromEntries(Object.entries(D.itemStats[item.slot]).map(([key, value]) => [key, value * mult]));
    },
    sockets(item) {
      return D.sockets[item.boss !== null ? 'boss' : 'regular'].filter(n => n <= item.enhance).length;
    },
    find(id) {
      const c = G.character();
      return [...c.inventory, ...Object.values(c.equipment), ...Object.values(c.tools)].find(i => i?.id === id);
    },
    prefix(item) {
      const keys = Object.keys(item.prefixes),
        pool = item.kind === 'tool' ? Object.keys(D.toolPrefixes) : D.prefixPools[item.slot];
      const forced = S.tutorial?.prefix(item);
      const key = forced?.key || G.pick(G.rng, keys.length >= D.config.prefixSlots ? keys : pool);
      const range = D.prefixRanges[key],
        before = item.prefixes[key] || 0;
      const increment = forced?.increment ?? (item.kind === 'tool' ? 1 : range[0] + G.rng() * (range[1] - range[0]));
      item.prefixes[key] = before + increment;
      return {
        key,
        before,
        increment,
        total: item.prefixes[key],
        isNew: !before
      };
    },
    recipe(item) {
      return Object.fromEntries(Object.entries(D.equipmentRecipes[item.slot]).map(([k, n]) => [k + ':' + item.tier, n]));
    },
    toolBonus(c, skill, key) {
      return (c.tools[skill].prefixes[key] || 0) * D.toolPrefixes[key];
    },
    usableTool(c, skill) {
      return c.skills[skill].level >= D.toolLevels[c.tools[skill].rarity];
    }
  };
  S.inventory = {
    count(id, c = G.character()) {
      return c.inventory.find(i => i.kind === 'stack' && i.key === id)?.quantity || 0;
    },
    available(id, c = G.character()) {
      return c.inventory.find(i => i.kind === 'stack' && i.key === id && !i.locked)?.quantity || 0;
    },
    has(cost, c = G.character()) {
      return Object.entries(cost).every(([id, n]) => this.available(id, c) >= n);
    },
    pay(cost, c = G.character()) {
      G.assert(this.has(cost, c), 'Missing ingredients, or an ingredient is locked.');
      for (const [id, n] of Object.entries(cost)) this.take(id, n, c);
    },
    take(id, n, c = G.character()) {
      const i = c.inventory.find(i => i.kind === 'stack' && i.key === id && !i.locked);
      G.assert(i && i.quantity >= n, 'Missing unlocked ' + (D.catalog[id]?.name || id) + '.');
      i.quantity -= n;
      if (!i.quantity) c.inventory.splice(c.inventory.indexOf(i), 1);
    },
    reward(rewards, c = G.character()) {
      for (const reward of rewards) {
        if (reward.coins) {
          c.coins += reward.coins;
          continue;
        }
        const item = ['gear', 'tool'].includes(reward.kind) ? reward : {
          id: G.uid(),
          kind: 'stack',
          key: reward.key,
          quantity: reward.quantity || 1,
          locked: false
        };
        const existing = item.kind === 'stack' ? c.inventory.find(i => i.kind === 'stack' && i.key === item.key) : null;
        if (existing) existing.quantity += item.quantity;
        else if (c.inventory.length < c.capacity) c.inventory.push(item);
        else c.pending.push(item);
      }
      if (c.pending.length) G.notify('Inventory full. Exact rewards are held as Pending Loot. Progression is paused.', 'warning');
    },
    resolve() {
      const c = G.character();
      const pending = c.pending.splice(0);
      for (const item of pending) {
        const old = item.kind === 'stack' ? c.inventory.find(i => i.kind === 'stack' && i.key === item.key) : null;
        if (old) old.quantity += item.quantity;
        else if (c.inventory.length < c.capacity) c.inventory.push(item);
        else c.pending.push(item);
      }
      G.commit();
    },
    discard(id, quantity) {
      G.ensureIdle();
      const c = G.character(),
        item = c.inventory.find(i => i.id === id);
      G.assert(item, 'Item not found.');
      G.assert(!item.locked && !item.bound, 'Unlock this item before discarding it. Bound tools cannot be discarded.');
      G.assert(!S.tutorial?.active(), 'Finish the required tutorial before discarding its supplies.');
      if (item.kind === 'stack' && quantity < item.quantity) {
        G.assert(quantity > 0, 'Choose a positive quantity.');
        item.quantity -= quantity;
      } else c.inventory.splice(c.inventory.indexOf(item), 1);
      this.resolve();
    },
    lock(id) {
      G.ensureIdle();
      const item = S.items.find(id);
      G.assert(item, 'Item not found.');
      G.assert(!item.bound, 'Starter tools are character-bound.');
      item.locked = !item.locked;
      G.commit();
    },
    equip(id) {
      G.ensureIdle();
      const c = G.character(),
        item = c.inventory.find(i => i.id === id);
      G.assert(item && ['gear', 'tool'].includes(item.kind), 'Choose equipment or a tool.');
      if (item.kind === 'tool') {
        G.assert(c.skills[item.skill].level >= D.toolLevels[item.rarity], 'Skill level is too low for this tool.');
        const old = c.tools[item.skill];
        c.inventory.splice(c.inventory.indexOf(item), 1);
        if (old) c.inventory.push(old);
        c.tools[item.skill] = item;
        G.commit();
        return;
      }
      G.assert(c.level >= D.tiers[item.tier], 'Character level is too low.');
      G.assert(item.style === null || item.style === D.classes.indexOf(c.class), 'Wrong weapon class.');
      const old = c.equipment[item.slot];
      c.inventory.splice(c.inventory.indexOf(item), 1);
      if (old) c.inventory.push(old);
      c.equipment[item.slot] = item;
      S.tutorial?.equipped(item);
      c.hp = Math.min(c.hp, S.character.stats(c).health);
      G.commit();
    },
    unequip(slot) {
      G.ensureIdle();
      const c = G.character();
      G.assert(c.inventory.length < c.capacity, 'Inventory full.');
      G.assert(c.equipment[slot], 'Slot is empty.');
      c.inventory.push(c.equipment[slot]);
      c.equipment[slot] = null;
      c.hp = Math.min(c.hp, S.character.stats(c).health);
      G.commit();
    }
  };
})(RPG, RPG.data, RPG.systems);
