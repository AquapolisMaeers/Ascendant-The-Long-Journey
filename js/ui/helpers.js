'use strict';
(function(G, D, U) {
  const paths = {
    World: 'M3 19 8 5l5 9 3-6 5 11H3zM8 5l2 6-3-1',
    Character: 'M8 5a4 4 0 1 0 8 0M5 22v-6a7 7 0 0 1 14 0v6M9 15l3 4 3-4',
    Inventory: 'M4 7h16v14H4zM8 7V3h8v4M4 11h16M10 14h4v3h-4z',
    Skills: 'm3 21 9-10M6 3c5-1 11 5 12 10l-4 3C13 10 9 6 3 6z',
    Crafting: 'M4 14h16l-4 4H7zM8 18v3h8v-3M9 4l4-2 5 7-4 3zM12 10l-6 6',
    Shop: 'M3 9h18l-2-6H5zM5 10v11h14V10M9 21v-7h6v7',
    Marketplace: 'M3 7h16l-3-3M21 17H5l3 3M19 7l-3 3M5 17l3-3',
    Achievements: 'M8 3h8v8a4 4 0 0 1-8 0zM8 5H4v3a4 4 0 0 0 4 4M16 5h4v3a4 4 0 0 1-4 4M12 15v5M8 21h8',
    Quests: 'M7 3h13v17H7zM7 3H4v4h3M7 20H4v-4h3M10 7h7M10 11h7M10 15h5',
    Leaderboards: 'M3 3v18h19M6 20v-7h3v7M12 20V9h3v11M18 20V5h3v15',
    Companions: 'M7 15c-5 5-1 8 5 5 6 3 10 0 5-5l-3-4h-4zM4 7a2 3 0 1 0 4 0 2 3 0 1 0-4 0M10 5a2 3 0 1 0 4 0 2 3 0 1 0-4 0M16 7a2 3 0 1 0 4 0 2 3 0 1 0-4 0',
    Settings: 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8M10 3h4l1 3 3 1 3 3v4l-3 1-1 3-3 3h-4l-1-3-3-1-3-3v-4l3-1 1-3z',
    Weapon: 'm5 21 5-6M3 15l6 6M8 16 18 3l3 1-1 4-10 10',
    Helmet: 'M5 19V10a7 7 0 0 1 14 0v9l-5 3v-8h-4v8zM5 11h14',
    Plate: 'M5 3 2 8l4 3v10h12V11l4-3-3-5-4 2H9z',
    Greaves: 'M6 3h12v8l-2 11h-5l1-10-1 10H6z',
    Gloves: 'M7 11V5l2-1v7-8h2v8-9h2v9-7h2v10l2-3 3 1-5 9H8l-4-8z',
    Boots: 'M7 3h8v11l6 3v4H4v-6l3-2z',
    Necklace: 'M4 4c0 12 4 12 8 14 4-2 8-2 8-14M12 16l4 4-4 3-4-3z',
    Ring: 'M8 10a7 7 0 1 0 8 0M8 7l4-4 4 4-4 5z',
    gem: 'm12 2 9 7-9 13L3 9zM3 9h18M8 3l4 19 4-19',
    Mining: 'M3 7c7-7 13-4 18 1l-2 3C12 5 8 6 3 7zM12 7 6 22',
    Woodcutting: 'm5 22 9-19M13 4l8 2-4 8-8-4',
    Fishing: 'M5 21 15 3M15 3v12c0 7 7 6 6 1M7 17l-4-2',
    Hunting: 'M5 5h14v14H5zM5 5l14 14M19 5 5 19M2 12h20',
    Smithing: 'M3 12h18l-6 5H8zM8 17v4h8v-4M9 2l5 3-2 4-5-3z',
    Cooking: 'M4 11h14v4a7 7 0 0 1-14 0zM18 12h5M8 3v4M13 2v5',
    Faceting: 'm12 2 9 7-9 13L3 9zM3 9h18M8 3l4 19 4-19',
    Warrior: 'm5 21 5-6M3 15l6 6M8 16 18 3l3 1-1 4-10 10',
    Archer: 'M4 3c22 0 22 18 0 18L15 12zM3 12h18M18 9l3 3-3 3',
    Mage: 'm5 22 9-15M13 2l2 3 4 1-3 3-1 4-2-3-4-1 3-3z',
    creature: 'M4 3l5 4h6l5-4-2 10-3 8H9l-3-8zM7 11l3 1M17 11l-3 1M10 17h4',
    dungeon: 'M3 22V5h4V2h3v3h4V2h3v3h4v17h-6v-7a3 3 0 0 0-6 0v7z',
    fountain: 'M3 15h18l-5 6H8zM12 15V3M12 7c-6-6-7 3-7 5M12 7c6-6 7 3 7 5',
    food: 'M5 13c-4-6 4-9 7-5 3-4 11-1 7 5l-4 8H9zM12 8V3l4-1',
    arrow: 'M3 12h17M14 5l7 7-7 7',
    lock: 'M6 10h12v12H6zM8 10V6a4 4 0 0 1 8 0v4M12 15v3',
    clock: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18M12 6v6l4 3'
  };
  U.icon = name => '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="' + (paths[name] || paths.gem) + '"/></svg>';
  U.e = G.escape;
  U.btn = (label, action, attrs = '', cls = '') => '<button class="btn ' + cls + '" data-action="' + action + '" ' + attrs + '>' + label + '</button>';
  U.bar = (value, max, cls = '', id = '') => '<div class="bar ' + cls + '"><i ' + (id ? 'id="' + id + '"' : '') + ' style="width:' + G.clamp(value / max * 100, 0, 100) + '%"></i></div>';
  U.heading = (eyebrow, title, description, actions = '') => '<div class="page-heading"><div><div class="eyebrow">' + eyebrow + '</div><h1>' + title + '</h1><p>' + description + '</p></div><div class="row">' + actions + '</div></div>';
  U.tabs = (names, current) => '<div class="tabs" role="tablist">' + names.map(n => '<button role="tab" aria-selected="' + (n === current) + '" class="' + (n === current ? 'active' : '') + '" data-action="tab" data-value="' + n + '">' + n + '</button>').join('') + '</div>';
  U.itemName = i => i.kind === 'gear' ? S.items.name(i) : i.kind === 'tool' ? i.name : D.catalog[i.key].name;
  const S = G.systems;
  U.itemIcon = i => i.kind === 'gear' ? i.slot : i.kind === 'tool' ? i.skill : D.catalog[i.key].category === 'Food' ? 'food' : D.catalog[i.key].category === 'Gems' ? 'gem' : D.catalog[i.key].kind === 'ore' || D.catalog[i.key].kind === 'bar' ? 'Mining' : D.catalog[i.key].kind === 'logs' ? 'Woodcutting' : D.catalog[i.key].kind === 'fish' ? 'Fishing' : 'Inventory';
  U.itemCard = (i, slot = '') => {
    const rarity = i.kind === 'stack' ? D.catalog[i.key].rarity : i.rarity;
    return '<button class="item-card rarity-' + rarity + '" data-action="item" data-id="' + i.id + '">' + (slot ? '<span class="slot-label">' + slot + '</span>' : '') + U.icon(U.itemIcon(i)) + '<span class="quantity">' + (i.locked ? '◆ ' : '') + (i.quantity ? '×' + G.number(i.quantity) : i.enhance !== undefined ? '+' + i.enhance : '') + '</span><span class="name">' + U.e(U.itemName(i)) + '</span><small>' + D.rarity[rarity] + ' · ' + (i.kind === 'tool' ? 'Bound tool' : 'Lv ' + (i.kind === 'gear' ? D.tiers[i.tier] : D.catalog[i.key].level)) + (i.boss !== undefined && i.boss !== null ? ' · Boss gear' : '') + '</small></button>';
  };
  U.ingredients = cost => '<div class="ingredients">' + Object.entries(cost).map(([id, required]) => {
    const owned = S.inventory.count(id), available = S.inventory.available(id), locked = owned - available;
    return '<div class="' + (available >= required ? 'good' : 'bad') + '"><span class="ingredient-name">' +
      U.itemArt({kind:'stack',key:id}) + '<span>' + U.e(D.catalog[id]?.name || id) + '</span></span>' +
      '<span class="mono" title="Owned / required">' + G.number(owned) + ' / ' + required + ' owned' +
      (locked ? ' (' + G.number(locked) + ' locked)' : '') + '</span></div>';
  }).join('') + '</div>';
  U.statValue = (key, v) => ['damage', 'defence', 'health'].includes(key) ? G.number(v, 2) : G.percent(v, 2);
  U.shell = function() {
    const c = G.character();
    if (!c || G.runtime.selecting) return U.welcome();
    const stats = S.character.stats(c),
      nav = ['World', 'Character', 'Inventory', 'Skills', 'Crafting', 'Shop', ...(S.market.allowed() ? ['Marketplace'] : []), 'Quests', 'Achievements', 'Leaderboards', 'Companions', 'Emporium', 'Settings'];
    return '<div class="shell ' + (c.hp / stats.health < .25 ? 'low-hp' : '') + '"><aside class="sidebar"><div class="brand"><img src="assets/icons/crest.svg" alt=""><div><strong>ASCENDANT</strong><small>THE LONG JOURNEY</small></div></div><div class="nav-label">YOUR JOURNEY</div><nav class="nav" aria-label="Main navigation">' + nav.map(n => '<button data-action="navigate" data-value="' + n + '" class="' + (G.runtime.page === n ? 'active' : '') + '">' + U.icon(n) + n + '</button>').join('') + '</nav><div class="sidebar-foot">' + U.btn('Character slots', 'slots', '', 'small quiet') + '<div class="offline-badge">● OFFLINE · LOCAL SAVE</div><div class="save-status"><span class="save-led"></span><span id="save-status">' + U.e(G.save.status) + '</span><div id="save-time">' + (G.state.savedAt ? new Date(G.state.savedAt).toLocaleTimeString() : '') + '</div></div></div></aside><div class="main-column"><header class="topbar"><div class="identity"><button class="portrait customize-character" data-action="customize" aria-label="Customize character appearance" title="Customize your character" style="--cloak:' + U.e(c.appearance.color) + '">' + U.characterPortrait(c.class, c.appearance) + '</button><div><strong>' + U.e(c.name) + '</strong><small>' + c.class + ' · ' + c.mode + '</small></div></div><div class="top-progress"><div class="bar-label"><span>LEVEL ' + c.level + '</span><span>' + G.number(c.xp) + ' / ' + (c.level === 100 ? 'MAX' : G.number(D.xpNext(c.level))) + '</span></div>' + U.bar(c.xp, D.xpNext(c.level)) + '</div><div class="top-progress hp-top"><div class="bar-label"><span>HEALTH</span><span id="top-hp-label">' + G.number(c.hp, 1) + ' / ' + G.number(c.combat?.player.health || stats.health, 1) + '</span></div>' + U.bar(c.hp, c.combat?.player.health || stats.health, 'hp', 'top-hp') + '</div><label class="top-training" title="Offline base XP: gathering 25%, Smithing/Cooking 12.5%, Faceting 1.875%; maximum 8 hours; no items or costs">AFK skilling<select id="offline-select" aria-label="AFK skilling"><option value="">None</option>' + D.skills.map(skill => '<option value="' + skill + '" ' + (c.offline === skill ? 'selected' : '') + '>' + skill + '</option>').join('') + '</select></label><div class="currencies" aria-label="Wallet" title="100 Bronze = 1 Silver; 100 Silver = 1 Gold"><small class="wallet-label">WALLET</small><span class="currency-g"><i class="coin"></i>' + Math.floor(c.coins / 10000) + ' <small>G</small></span><span class="currency-s"><i class="coin"></i>' + Math.floor(c.coins % 10000 / 100) + ' <small>S</small></span><span class="currency-b"><i class="coin"></i>' + c.coins % 100 + ' <small>B</small></span></div>' + U.btn('AC <strong id="ascendant-coins">' + G.number(c.ascendantCoins || 0) + '</strong>', 'navigate', 'data-value="Emporium" title="Ascendant Coins" aria-label="Ascendant Coins and Emporium"', 'small quiet ascendant-wallet') + U.btn(U.icon('Settings'), 'navigate', 'data-value="Settings" aria-label="Settings"', 'small quiet') + '</header><main class="content" id="content">' + (c.pending.length ? '<div class="warning">' + c.pending.length + ' pending reward' + (c.pending.length > 1 ? 's' : '') + '. Progression paused until you make inventory space. ' + U.btn('Resolve loot', 'navigate', 'data-value="Inventory"', 'small') + '</div>' : '') + (U.screens[G.runtime.page] || U.screens.World)() + '</main></div></div>';
  };
  // Keep existing images, focus, disclosure state and animation nodes alive.
  U.patch = (root, html) => {
    const template = document.createElement('template');
    template.innerHTML = html;
    const morph = (parent, next) => {
      const desired = [...next.childNodes];
      desired.forEach((fresh, index) => {
        let old = parent.childNodes[index];
        if (!old) { parent.append(fresh.cloneNode(true)); return; }
        if (old.nodeType !== fresh.nodeType || old.nodeName !== fresh.nodeName ||
            old.nodeType === 1 && old.id !== fresh.id) {
          parent.replaceChild(fresh.cloneNode(true), old); return;
        }
        if (old.nodeType !== 1) {
          if (old.nodeValue !== fresh.nodeValue) old.nodeValue = fresh.nodeValue;
          return;
        }
        for (const attr of [...old.attributes])
          if (!fresh.hasAttribute(attr.name) && !(old.tagName === 'DETAILS' && attr.name === 'open')) old.removeAttribute(attr.name);
        for (const attr of fresh.attributes)
          if (old.getAttribute(attr.name) !== attr.value) old.setAttribute(attr.name, attr.value);
        morph(old, fresh);
        if (old instanceof HTMLInputElement) {
          old.checked = fresh.checked;
          if (old !== document.activeElement) old.value = fresh.value;
        }
        if (old instanceof HTMLSelectElement && old !== document.activeElement) old.value = fresh.value;
      });
      while (parent.childNodes.length > desired.length) parent.lastChild.remove();
    };
    morph(root, template.content);
  };
  U.render = () => {
    const focused = document.activeElement?.id;
    U.patch(document.getElementById('app'), U.shell());
    const content = document.getElementById('content');
    if (content) {
      content.dataset.page = G.runtime.page;
      content.dataset.tab = G.runtime.tab || '';
    }
    if (focused) document.getElementById(focused)?.focus();
    U.applySettings();
    G.emit('rendered');
  };
  U.applySettings = () => {
    document.body.classList.toggle('reduce-motion', G.state.settings.reduced);
    document.documentElement.style.setProperty('--scale', G.state.settings.scale / 100);
    document.documentElement.style.setProperty('--text-scale', G.state.settings.text / 100);
  };
  U.screens = {};
})(RPG, RPG.data, RPG.ui);
