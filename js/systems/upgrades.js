'use strict';
(function(G, D, S) {
  const pay = (coins, cost) => {
    const c = G.character();
    G.assert(c.coins >= coins, 'Insufficient coins.');
    G.assert(S.inventory.has(cost), 'Missing materials, or an ingredient is locked.');
    S.inventory.pay(cost);
    c.coins -= coins;
  };
  S.upgrades = {
    quote(item, ascend = false) {
      if (item.kind === 'tool') {
        const r = item.rarity,
          tier = D.tierFor(D.toolLevels[Math.min(7, r + 1)]),
          kind = D.gatherResources[item.skill] || {Smithing:'bar',Cooking:'fish'}[item.skill];
        const cost = {
          stone: 1
        };
        if (kind) cost[kind + ':' + tier] = Math.ceil(D.tuning.toolBaseMaterials * D.ascend.materials[r]);
        return {
          coins: D.coinUnits[tier] * D.ascend.coins[r],
          cost,
          chance: Math.min(1, D.ascend.chance[r] + item.ascendFail)
        };
      }
      if (ascend) {
        const cost = Object.fromEntries(Object.entries(S.items.recipe(item)).map(([id, n]) => [id, Math.ceil(n * D.ascend.materials[item.rarity])]));
        cost.stone = 1;
        return {
          coins: D.coinUnits[item.tier] * D.ascend.coins[item.rarity],
          cost,
          chance: Math.min(1, D.ascend.chance[item.rarity] + item.ascendFail)
        };
      }
      const b = Math.min(4, Math.floor(item.enhance / 5)),
        cost = {
          ['bar:' + item.tier]: D.enhance.bars[b]
        };
      if (item.slot === 'Weapon') cost['logs:' + item.tier] = D.enhance.weaponLogs[b];
      else if (!['Necklace', 'Ring'].includes(item.slot)) cost['hide:' + item.tier] = D.enhance.secondary[b];
      if(D.armorSlots.includes(item.slot)) {
        delete cost['bar:'+item.tier]; delete cost['hide:'+item.tier];
        const kinds=Object.keys(D.armorCost(item.slot,item.armorClass));
        cost[kinds[0]+':'+item.tier]=D.enhance.bars[b];
        cost[kinds[1]+':'+item.tier]=D.enhance.secondary[b];
      }
      if(item.slot==='Secondary') {
        for(const key of Object.keys(cost))delete cost[key];
        for(const [key,n] of Object.entries(S.items.recipe(item)))cost[key]=Math.max(1,Math.ceil(n*(b+1)/5));
      }
      return {
        coins: D.coinUnits[item.tier] * D.enhance.coins[b],
        cost,
        chance: Math.min(1, D.enhance.chance[b] + item.enhanceFail)
      };
    },
    enhance(id) {
      G.ensureIdle();
      const item = S.items.find(id);
      G.assert(item?.kind === 'gear', 'Only combat gear can be Enhanced.');
      G.assert(item.enhance < 25 || Object.keys(item.prefixes).length < S.items.prefixSlots(item), 'Already +25 with every prefix slot filled.');
      const refining = item.enhance === 25;
      S.tutorial?.guard('enhance', id);
      const q = this.quote(item);
      pay(q.coins, q.cost);
      if (G.rng() < q.chance) {
        if (!refining) item.enhance++;
        item.enhanceFail = 0;
        const prefixEvent = S.items.prefix(item, refining);
        S.items.announcePrefix(item, prefixEvent);
        S.tutorial?.enhanced(item);
        const c = G.character();
        c.stats.enhancements++;
        c.stats.maxEnhance = Math.max(c.stats.maxEnhance, item.enhance);
        G.notify(refining ? 'Prefix refinement succeeded. A missing slot was filled.' : 'Enhancement succeeded: +' + item.enhance + '. One prefix improved.', 'success');
        G.audio?.play('enhance');
        G.emit('effect', {
          kind: 'enhance',
          socket: D.sockets[item.boss !== null ? 'boss' : 'regular'].includes(item.enhance)
        });
      } else {
        item.enhanceFail = Math.min(1, item.enhanceFail + D.config.failIncrement);
        G.emit('effect', {
          kind: 'failure'
        });
        G.notify('Enhancement failed. Item preserved; +1 percentage point fail protection.', 'warning');
      }
      G.commit();
    },
    ascend(id) {
      G.ensureIdle();
      const item = S.items.find(id);
      G.assert(item && item.kind !== 'stack', 'Select equipment or a tool.');
      G.assert(item.rarity < 7, 'Already Ascendant.');
      const q = this.quote(item, true);
      pay(q.coins, q.cost);
      if (G.rng() < q.chance) {
        const c = G.character();
        c.stats.ascensions = [...new Set([...c.stats.ascensions, item.rarity])];
        item.rarity++;
        item.ascendFail = 0;
        if (item.kind === 'tool') S.items.announcePrefix(item, S.items.prefix(item));
        G.notify('Ascension succeeded: ' + D.rarity[item.rarity] + '.', 'success');
        G.audio?.play('ascend');
        G.emit('effect', {
          kind: 'ascend',
          rarity: item.rarity
        });
      } else {
        item.ascendFail = Math.min(1, item.ascendFail + D.config.failIncrement);
        G.emit('effect', {
          kind: 'failure'
        });
        G.notify('Ascension failed. Item preserved; +1 percentage point fail protection.', 'warning');
      }
      G.commit();
    },
    socket(id, index, key, destroyOld = false) {
      G.ensureIdle();
      const item = S.items.find(id),
        gem = D.catalog[key],
        c = G.character();
      G.assert(item?.kind === 'gear' && Number.isInteger(index) && index >= 0 && index < S.items.sockets(item), 'Socket is locked.');
      G.assert(gem?.rank > 0 && D.gemAllowed[item.slot].includes(gem.type), 'Invalid gem for this slot.');
      const style = D.gems[gem.type].style;
      G.assert(style === undefined || style === (item.style ?? D.classes.indexOf(c.class)), 'Wrong class damage gem.');
      G.assert(S.inventory.available(key) > 0, 'Gem unavailable or locked.');
      const old = item.gems[index];
      G.assert(!old || destroyOld, 'Confirm destruction of the old gem, or safely extract it.');
      S.inventory.take(key, 1);
      item.gems[index] = key;
      c.stats.socketed++;
      G.audio?.play('socket');
      G.emit('effect', {
        kind: 'socket'
      });
      G.commit();
    },
    extract(id, index, destroy = false) {
      G.ensureIdle();
      G.assert(!G.character().pending.length || destroy, 'Resolve existing Pending Loot before extracting another gem.');
      const item = S.items.find(id);
      G.assert(item?.gems[index], 'This socket is empty.');
      if (!destroy) {
        G.assert(S.inventory.available('extractor') > 0, 'A Gem Extractor is required.');
        S.inventory.take('extractor', 1);
        S.inventory.reward([{
          key: item.gems[index],
          quantity: 1
        }]);
      }
      item.gems[index] = null;
      G.commit();
    },
    remove(id) {
      G.ensureIdle();
      const item = S.items.find(id);
      G.assert(item?.kind === 'gear', 'Select combat gear.');
      G.assert(!item.locked, 'Unlock this item before using an Enchantment Remover.');
      G.assert(!item.gems.some(Boolean), 'Extract or destroy every gem first.');
      S.inventory.take('remover', 1);
      item.enhance = 0;
      item.prefixes = {};
      item.gems = [];
      item.enhanceFail = 0;
      G.character().hp = Math.min(G.character().hp, S.character.stats(G.character()).health);
      G.commit();
    }
  };
})(RPG, RPG.data, RPG.systems);
