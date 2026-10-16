'use strict';
(function(G, D, S, U) {
  const formatTime = ms => {
    const secs = Math.max(0, Math.ceil(ms / 1000));
    return Math.floor(secs / 60) + 'm ' + String(secs % 60).padStart(2, '0') + 's';
  };
  U.tutorial = () => {
    const c = G.character();
    if (S.tutorial.active()) {
      if (G.runtime.justCreatedTutorial) { G.runtime.justCreatedTutorial = false; U.lesson(true); return; }
      U.close();
      G.runtime.page = 'World';
      U.render();
      return;
    }
    if (c.tutorial) {
      U.modal('Your seven skills', '<p>Mining supplies ore; Woodcutting supplies logs; Fishing supplies raw fish; Hunting supplies hides. Smithing refines ore into bars and makes equipment. Cooking produces healing food. Faceting turns uncut gems into Gem I, then fuses higher ranks.</p><p>Enhance your gear to develop prefixes. Treasure Chests can contain a Mimic. Rest at the campfire once every 30 minutes.</p>' + U.btn('Return to the world', 'closeModal', '', 'primary'));
      return;
    }
    U.modal('Learn by doing', '<div class="eyebrow">GUIDED FIRST STEPS</div><p>You begin with ' + D.config.startingBronze + ' Bronze. The guide starts with your free Level 1 perk, then covers all seven skills, your first weapon prefix, and a Level 1 fight.</p><p>Four Advances guarantee starter resources. You will cook Minnows, smelt Copper Ore, cut a gem, Enhance your weapon, and earn a Common Worn Plate.</p><div class="modal-actions">' + U.btn('Start required tutorial', 'tutorialStart', '', 'primary') + '</div>');
  };
  U.guidePanel = () => {
    if (!S.tutorial.active()) return '';
    const c = G.character(),
      step = S.tutorial.current();
    let label = 'ADVANCE',
      action = 'tutorialAdvance',
      attrs = '';
    if (D.skills.slice(0, 4).includes(step.id) && c.encounter) {
      label = 'Gather ' + step.title + ' resources';
      action = 'tutorialGather';
    }
    if (['cook:0', 'bar:0', 'facet'].includes(step.id)) {
      label = 'Open ' + step.title;
      action = 'tutorialTask';
    }
    if (step.id === 'perk') {
      label = 'Choose your Level 1 perk';
      action = 'openPerks';
    }
    if (step.id === 'enhance') {
      label = 'Enhance your weapon';
      action = 'tutorialTask';
    }
    if (step.id === 'fight' && c.encounter) {
      label = 'Fight Level 1 creature';
      action = 'tutorialFight';
    }
    if (step.id === 'equip') {
      label = 'Equip your Common Worn Plate';
      action = 'tutorialTask';
    }
    if (['preferences', 'offline', 'afk', 'recovery', 'prefixes', 'ready'].includes(step.id)) {
      label = step.id === 'ready' ? 'Complete tutorial' : 'Open lesson'; action = 'tutorialLesson';
    }
    return '<section class="panel guide-panel" aria-label="Tutorial lesson"><div class="row between"><span class="eyebrow">REQUIRED TUTORIAL ' + (c.guide.step + 1) + ' / ' + D.tutorial.steps.length + '</span></div><h3>' + step.title + '</h3><p class="notes">' + step.text + '</p><div class="row spacer">' + U.btn(label, action, (c.activity || c.combat || c.pending.length ? 'disabled' : ''), 'gold-btn') + (step.id === 'fight' ? '<small class="muted">Your food is assigned at 25% Auto-Eat.</small>' : '') + '</div></section>';
  };
  U.restPanel = () => {
    const c = G.character(),
      remaining = Math.max(0, (c.restReadyAt || 0) - Date.now());
    return '<section class="panel rest-panel"><div class="panel-head"><h3>Wayside campfire</h3>' + U.icon('fountain') + '</div><p class="notes">Rest to fully recover your health. Available once every 30 minutes.</p><div class="meta-row"><span>Rest cooldown</span><strong id="rest-time">' + (remaining ? formatTime(remaining) : 'Ready') + '</strong></div>' + U.btn('Rest to full health', 'rest', 'id="rest-button" ' + (remaining || !S.recovery.canRest(c) || c.hp >= S.character.stats(c).health ? 'disabled' : ''), 'wide') + '</section>';
  };
  U.innPanel = () => {
    const c = G.character();
    return '<section class="panel inn-panel"><div class="panel-head"><h3>Wayside inn</h3>' + U.icon('fountain') +
      '</div><p class="notes">No cooldown · Price: level × HP restored, rounded up.</p><div class="inn-options">' +
      [.25, .5, 1].map(fraction => {
        const q = S.recovery.innQuote(fraction, c);
        return U.btn('<span>' + (fraction === 1 ? 'Fill health' : G.percent(fraction, 0) + ' HP') +
          '</span><small>' + G.number(q.coins) + ' Bronze</small>', 'inn',
          'data-fraction="' + fraction + '" title="Restore ' + G.number(q.healing, 2) + ' HP" ' +
          (c.combat || c.activity || c.dungeon || !q.healing || c.coins < q.coins ? 'disabled' : ''), 'quiet');
      }).join('') + '</div></section>';
  };
  const world = U.screens.World;
  U.screens.World = () => world()
    .replace('<aside class="world-side">', '<aside class="world-side">' + U.restPanel())
    .replace('<p class="notes death-risk">', U.innPanel() + '<p class="notes death-risk">');
  const encounter = U.encounter;
  U.encounter = () => {
    const c = G.character(),
      e = c.encounter;
    if (e?.type === 'treasure' && !c.activity && !c.combat)
      return '<section class="panel encounter"><div class="encounter-content"><div class="encounter-emblem">' + U.icon('Inventory') + '</div><div><span class="badge">TREASURE CHEST</span><h2 class="encounter-title">A chest beside the road</h2><p class="notes">Loot from this location’s regular pool at your level. A 1% chance of a Level ' + e.level + ' Mimic awaits inside.</p><div class="encounter-actions">' + U.btn('Open chest', 'openChest', c.pending.length ? 'disabled' : '', 'gold-btn') + U.btn('Move on', 'moveOn', '', 'quiet') + '</div></div></div></section>';
    return encounter();
  };
  const lootText = U.rewardText;
  U.rewardText = r => r.kind === 'tool' ? '<span class="rarity-' + r.rarity + ' rarity-text">' + D.rarity[r.rarity] + ' ' + U.e(r.name) + '</span>' : lootText(r);
  const inventory = U.screens.Inventory;
  U.screens.Inventory = () => {
    if (G.runtime.tab !== 'Tools') return inventory();
    const c = G.character(),
      q = (G.runtime.search || '').toLowerCase(),
      sort = G.runtime.sort || 'Name';
    let equipped = Object.values(c.tools).filter(i => i.name.toLowerCase().includes(q)),
      spare = c.inventory.filter(i => i.kind === 'tool' && i.name.toLowerCase().includes(q));
    const order = (a, b) => sort === 'Rarity' ? b.rarity - a.rarity : sort === 'Tier' ? D.toolLevels[b.rarity] - D.toolLevels[a.rarity] : a.name.localeCompare(b.name);
    equipped.sort(order);
    spare.sort(order);
    return U.heading('YOUR POSSESSIONS', 'Inventory', 'Equipped tools do not occupy storage. Every tool rarity can be equipped at any skill level.', '<span class="badge">' + c.inventory.length + ' / ' + c.capacity + ' SLOTS</span>') + U.tabs(['Equipment', 'Materials', 'Gems', 'Food', 'Tools', 'Utility'], 'Tools') + '<div class="toolbar"><input id="inventory-search" aria-label="Search inventory" placeholder="Search tools…" value="' + U.e(G.runtime.search || '') + '"><select id="inventory-sort" aria-label="Sort items">' + ['Name', 'Rarity', 'Tier'].map(s => '<option ' + (sort === s ? 'selected' : '') + '>' + s + '</option>').join('') + '</select></div><h3>Equipped tools</h3><div class="item-grid spacer">' + equipped.map(i => U.itemCard(i)).join('') + '</div><h3 class="spacer">Spare tools</h3><div class="item-grid spacer">' + (spare.map(i => U.itemCard(i)).join('') || '<p class="empty">Tool drops appear here.</p>') + '</div>';
  };
  const itemCard = U.itemCard;
  U.itemCard = (i, slot = '') => i.kind !== 'tool' ? itemCard(i, slot) : '<button class="item-card rarity-' + i.rarity + '" data-action="item" data-id="' + i.id + '">' + U.icon(i.skill) + '<span class="quantity">' + (i.locked ? '◆' : '') + '</span><span class="name">' + U.e(i.name) + '</span><small>' + D.rarity[i.rarity] + ' · ' + i.skill + ' · No level requirement · ' + (i.bound ? 'Bound starter' : G.character().tools[i.skill]?.id === i.id ? 'Equipped' : 'Spare tool') + '</small></button>';
  const shop = U.screens.Shop;
  U.screens.Shop = () => {
    if (G.runtime.tab !== 'Sell') return shop();
    const c = G.character(),
      items = c.inventory.filter(i => !i.bound);
    const category = U.sellCategoryNames.includes(G.runtime.sellCategory) ? G.runtime.sellCategory : 'All';
    const shown = items.filter(i => category === 'All' || U.saleCategory(i) === category);
    return U.heading('THE QUARTERMASTER', 'Shop', 'Sell spare items for Bronze.', '<span class="badge">' + G.money(c.coins) + '</span>') + U.tabs(D.shopTabs, 'Sell') + '<section class="panel"><h3>Prices follow materials</h3><p class="notes spacer">Raw materials sell for their required level in Bronze. Bars include their ore and fuel costs; gear includes all original recipe ingredients. Equipment rarity, Enhancement and inserted gems do not increase gear sale prices.</p><p class="notes">Ascendant Stones sell for 1 Gold each. Tools sell by rarity: 50b, 1s, 2s 50b, 5s, 10s, 25s, 50s, 1g. Locked items and bound starter tools cannot be sold.</p></section>' + U.sellCategories(items, category) + '<div class="grid-3 spacer sell-grid">' + (shown.map(i => '<section class="recipe">' + U.itemCard(i) + '<div class="row between spacer"><span class="gold">' + G.money(S.shop.value(i)) + ' each</span>' + U.btn('Sell…', 'sellForm', 'data-id="' + i.id + '" ' + (i.locked ? 'disabled' : ''), 'small gold-btn') + '</div></section>').join('') || '<p class="empty">No spare items in this category.</p>') + '</div>';
  };
  const item = U.item;
  U.item = id => {
    item(id);
    const i = S.items.find(id),
      c = G.character();
    if (i?.kind === 'tool') {
      const body = document.querySelector('.modal');
      const extra = document.createElement('div');
      extra.className = 'row spacer';
      if (c.inventory.includes(i)) extra.innerHTML = U.btn('Equip tool', 'equip', 'data-id="' + id + '"', 'primary') + (!i.bound ? U.btn(i.locked ? 'Unlock' : 'Lock / favourite', 'lock', 'data-id="' + id + '"') + U.btn('Sell…', 'sellForm', 'data-id="' + id + '" ' + (i.locked ? 'disabled' : ''), 'gold-btn') + U.btn('Discard', 'discard', 'data-id="' + id + '" ' + (i.locked ? 'disabled' : ''), 'danger') : '<span class="notes">Bound starter tools stay with this character.</span>');
      else extra.innerHTML = '<span class="badge">EQUIPPED · ' + i.skill + ' · NO LEVEL REQUIREMENT' + '</span>';
      body.append(extra);
    } else if (i && c.inventory.includes(i)) {
      const extra = document.createElement('div');
      extra.className = 'row spacer';
      extra.innerHTML = U.btn('Sell for ' + G.money(S.shop.value(i)) + ' each…', 'sellForm', 'data-id="' + id + '" ' + (i.locked ? 'disabled' : ''), 'gold-btn');
      document.querySelector('.modal').append(extra);
    }
  };
  U.quantityButtons = (action, available) => '<div class="row quantity-presets" aria-label="Quantity shortcuts">' +
    [1, 10, 25, 50, action === 'buyQuantity' ? 100 : 'all'].map(n => U.btn(n === 'all' ? 'All' : '×' + n, action,
      'data-quantity="' + n + '" ' + (available < 1 ? 'disabled' : ''), 'small quiet')).join('') + '</div>';
  U.buyMaterialsForm = id => {
    const item = D.shop.find(i => i.id === id);
    G.assert(item?.category === 'Materials', 'Choose a raw material.');
    G.runtime.buyItem = id;
    const max = Math.min(1000000, Math.floor(G.character().coins / item.price));
    U.modal('Buy ' + U.e(item.name), '<p>' + item.price + ' Bronze per unit.</p>' +
      '<label>Quantity<input id="buy-quantity" type="number" min="1" max="' + Math.max(1, max) + '" value="1"></label>' +
      U.quantityButtons('buyQuantity', max) + '<div class="meta-row"><span>Total cost</span><strong id="buy-total">' +
      G.money(item.price) + '</strong></div><div class="modal-actions">' + U.btn('Cancel', 'closeModal', '', 'quiet') +
      U.btn('Buy selected quantity', 'buyConfirm', max < 1 ? 'disabled' : '', 'gold-btn') + '</div>');
  };
  U.sellForm = id => {
    const item = S.items.find(id);
    G.assert(item && !item.locked && !item.bound, 'This item cannot be sold.');
    G.runtime.sellItem = id;
    U.modal('Sell ' + U.e(U.itemName(item)) + '?', '<p>' + G.money(S.shop.value(item)) + ' per item.</p>' + (item.kind === 'gear' && (item.enhance || item.gems.some(Boolean)) ? '<div class="warning">Selling permanently removes this equipment, its upgrades, and every inserted gem.</div>' : '') + '<label>Quantity<input id="sell-quantity" type="number" min="1" max="' + (item.quantity || 1) + '" value="1"></label>' + U.quantityButtons('sellQuantity', item.quantity || 1) + '<div class="meta-row"><span>Total sale</span><strong id="sell-total">' + G.money(S.shop.value(item)) + '</strong></div><div class="modal-actions">' + U.btn('Cancel', 'closeModal', '', 'quiet') + U.btn('Sell selected quantity', 'sellConfirm', '', 'gold-btn') + '</div>');
  };
  U.saveWarning = () => G.save.error || G.runtime.loadFailure ? '<div class="warning danger-box">Save problem: ' + U.e(G.save.error || 'Progress could not be loaded.') + ' ' + U.btn('Export a backup', 'export', '', 'small') + '</div>' : '';
  const shell = U.shell;
  U.shell = () => {
    const html = shell();
    return G.character() ? html.replace('<main class="content" id="content">', '<main class="content" id="content">' + U.saveWarning()) : html;
  };
  window.addEventListener('rpg:save-error', () => {
    const content = document.getElementById('content');
    if (content && !content.querySelector('.save-failure')) {
      const warning = document.createElement('div');
      warning.className = 'save-failure';
      warning.innerHTML = U.saveWarning();
      content.prepend(warning);
    }
  });
  let prefixTimer;
  window.addEventListener('rpg:prefix', ({
    detail: p
  }) => {
    const el = document.getElementById('prefix-popup'),
      label = p.tool ? p.key : D.labels[p.key],
      value = v => p.tool ? D.roman[v] + ' · ' + G.percent(v * D.toolPrefixes[p.key]) : U.statValue(p.key, v);
    el.innerHTML = '<div class="eyebrow">' + (p.isNew ? 'NEW PREFIX' : 'PREFIX POWERED UP') + '</div><strong>' + label + '</strong><p>' + value(p.before) + ' → ' + value(p.total) + '</p><small>' + U.e(p.itemName) + ' · click to dismiss</small>';
    el.hidden = false;
    clearTimeout(prefixTimer);
    prefixTimer = setTimeout(() => el.hidden = true, 4500);
  });
  document.getElementById('prefix-popup').onclick = () => document.getElementById('prefix-popup').hidden = true;
  const live = U.live;
  U.live = () => {
    live();
    const c = G.character();
    if (!c) return;
    const rest = document.getElementById('rest-time'),
      button = document.getElementById('rest-button'),
      remaining = Math.max(0, (c.restReadyAt || 0) - Date.now());
    if (rest) rest.textContent = remaining ? formatTime(remaining) : 'Ready';
    if (button) button.disabled = remaining > 0 || !S.recovery.canRest(c) || c.hp >= S.character.stats(c).health;
  };
  window.addEventListener('rpg:death-loss', ({detail}) => {
    U.modal('The cost of defeat', '<p>You recover at full health after falling in ' + U.e(detail.location) + '.</p><p class="spacer">Coins lost: <strong>' + G.money(detail.coins) + '</strong> (' + detail.percent + '%, rounded up).</p><div class="notes spacer">' + (detail.lost.length ? '<p>Inventory items lost:</p>' + detail.lost.map(U.rewardText).join('<br>') : 'Your inventory was empty; no items were lost.') + '</div><p class="notes spacer">Equipped gear and tools are protected. Stored items can be lost even when locked. Each location adds one item and five percentage points to the penalty.</p>' + U.btn('Return to the world', 'closeModal', '', 'primary spacer'));
  });
})(RPG, RPG.data, RPG.systems, RPG.ui);
