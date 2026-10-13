'use strict';
(function(G, D, S, U) {
  U.characterPortrait = (className, appearance = {}) => {
    const look = Number.isInteger(appearance.look) ? appearance.look : 0;
    const row = D.classes.indexOf(className), w = .98 / 5, h = .98 / 3;
    const x = (look + .01) / 5, y = (row + .01) / 3;
    return '<span class="character-portrait" role="img" aria-label="' + U.e(className + ' · ' + D.characterLooks[className][look]) +
      '" data-class="' + className + '" data-look="' + look + '" style="background-size:' + 100 / w + '% ' + 100 / h +
      '%;background-position:' + x / (1 - w) * 100 + '% ' + y / (1 - h) * 100 + '%"></span>';
  };
  U.lookPicker = (prefix, className, look, action) =>
    '<input type="hidden" id="' + prefix + '-portrait" value="' + look + '">' +
    '<div class="look-picker" role="group" aria-label="' + className + ' portraits">' +
    D.characterLooks[className].map((name, index) => '<button class="look-option ' + (index === look ? 'selected' : '') +
      '" data-action="' + action + '" data-look="' + index + '" aria-pressed="' + (index === look) + '">' +
      U.characterPortrait(className, {look:index}) + '<span>' + U.e(name) + '</span></button>').join('') + '</div>';
  U.customize = () => {
    const c = G.character();
    G.assert(c, 'Choose a character.');
    G.runtime.appearanceDraft = {look:c.appearance.look ?? 0, color:c.appearance.color};
    U.customizer();
  };
  U.customizer = () => {
    const c = G.character(), draft = G.runtime.appearanceDraft;
    U.modal('Customize ' + U.e(c.name), '<div class="customize-preview" style="--cloak:' + U.e(draft.color) + '">' +
      U.characterPortrait(c.class, draft) + '<div><h3>' + U.e(D.characterLooks[c.class][draft.look]) +
      '</h3><p>' + c.class + ' · Cosmetic appearance</p></div></div>' +
      U.lookPicker('appearance', c.class, draft.look, 'appearanceLook') +
      '<label class="spacer">Portrait accent<input type="color" id="appearance-color" value="' + U.e(draft.color) +
      '"></label><p>Five base-game looks for your class. Changing appearance is free.</p><div class="modal-actions">' +
      U.btn('Cancel', 'closeModal', '', 'quiet') + U.btn('Save appearance', 'appearanceConfirm', '', 'gold-btn') + '</div>');
  };

  U.itemStatLabel = (key, item) => key === 'damage' && item?.style !== null && item?.style !== undefined ?
    D.primary[item.style] + ' Damage' : D.labels[key];
  const gearFor = r => ({
    kind:'gear', tier:r.tier, piece:r.piece, slot:r.piece < 3 ? 'Weapon' : D.pieces[r.piece],
    style:r.piece < 3 ? r.piece : null, rarity:0, boss:null, enhance:0, prefixes:{}, gems:[]
  });
  U.itemSummary = item => {
    if (item.kind === 'gear') return Object.entries(S.items.stats(item)).map(([key, value]) =>
      U.itemStatLabel(key, item) + ' ' + G.number(value, 4)).join(' · ');
    if (item.kind === 'tool') return Object.entries(item.prefixes).map(([key, rank]) =>
      key + ' +' + G.percent(rank * D.toolPrefixes[key], 2)).join(' · ') || 'Ascend to gain work bonuses';
    const info = D.catalog[item.key];
    if (info.healing) return 'Restores ' + G.number(info.healing) + ' HP';
    if (info.rank > 0) {
      const gem = D.gems[info.type];
      const name = gem.style === undefined ? D.labels[gem.stat] : D.primary[gem.style] + ' Damage';
      return '+' + U.statValue(gem.stat, gem.value * info.rank) + ' ' + name;
    }
    if (info.category === 'Gems') return 'Facet into a typed Gem I';
    if (info.kind === 'fish') return 'Cook into ' + D.catalog['food:' + info.tier].name;
    if (info.kind === 'bar') return 'Smith ' + D.tierNames[info.tier] + ' equipment';
    if (info.kind === 'ore') return 'Refine through Smithing';
    if (info.kind === 'logs') return 'Used to craft and enhance weapons';
    if (info.kind === 'hide') return 'Used to craft and enhance armour';
    if (item.key === 'stone') return 'Required for rarity Ascension';
    if (item.key === 'appearance') return 'Portraits are now freely customizable';
    return D.shop.find(entry => entry.id === item.key)?.description || '';
  };
  U.effectPreview = item => {
    const summary = U.itemSummary(item), info = item.kind === 'stack' ? D.catalog[item.key] : null;
    let extra = '';
    if (info?.rank > 0) {
      const gem = D.gems[info.type], slots = D.slots.filter(slot => D.gemAllowed[slot].includes(info.type));
      extra = '<small>Compatible slots: ' + slots.join(', ') + (gem.style === undefined ? '' : ' · ' + D.classes[gem.style] + ' only') + '</small>';
    }
    return summary ? '<div class="output-effects"><strong>' + U.e(summary) + '</strong>' + extra + '</div>' : '';
  };
  U.recipePreview = recipe => {
    if (recipe.piece === undefined) return U.effectPreview({kind:'stack', key:recipe.output});
    const item = gearFor(recipe), equipped = G.character().equipment[item.slot], stats = S.items.stats(item);
    const old = equipped ? S.items.stats(equipped) : {};
    return '<div class="recipe-preview"><div class="eyebrow">COMMON +0 · DAMAGE, DEFENCE & HEALTH</div><dl class="preview-stats">' +
      Object.entries(stats).map(([key, val]) => '<div><dt>' + U.itemStatLabel(key, item) + '</dt><dd>' +
        U.statValue(key, val) + '</dd></div>').join('') + '</dl><small>Equip Lv ' + D.tiers[item.tier] +
      (item.style === null ? '' : ' · ' + D.classes[item.style] + ' only') + '</small>' +
      '<details class="compare-crafted"><summary>Compare inherent stats</summary><dl class="preview-stats">' +
      Object.entries(stats).map(([key, val]) => '<div><dt>' + U.itemStatLabel(key, item) + '</dt><dd class="' +
        (val >= (old[key] || 0) ? 'good' : 'bad') + '">' + (val >= (old[key] || 0) ? '+' : '') +
        U.statValue(key, val - (old[key] || 0)) + '</dd></div>').join('') +
      '</dl><small>Compared with this slot. Prefixes, gems and perks are applied separately.</small></details></div>';
  };
  U.upgradePreview = (item, ascend) => {
    if (item.kind === 'tool') return '<div class="upgrade-benefits"><strong>On success</strong><small>' +
      D.rarity[item.rarity] + ' → ' + D.rarity[item.rarity + 1] +
      ' · One work prefix gains a rank. No skill-level requirement.</small></div>';
    const next = {...item, enhance:item.enhance + (ascend ? 0 : 1), rarity:item.rarity + (ascend ? 1 : 0)};
    const before = S.items.stats(item), after = S.items.stats(next);
    return '<div class="upgrade-benefits"><strong>On success · inherent stats</strong><dl class="preview-stats">' +
      Object.entries(after).map(([key, val]) => '<div><dt>' + U.itemStatLabel(key, item) + '</dt><dd>' +
        U.statValue(key, before[key]) + ' → ' + U.statValue(key, val) + '</dd></div>').join('') +
      '</dl><small>' + (ascend ? 'Enhancement, prefixes and sockets are preserved.' : 'One allowed prefix improves.' +
        (S.items.sockets(next) > S.items.sockets(item) ? ' Unlocks a new gem socket.' : '')) + '</small></div>';
  };
  U.prefixGuide = item => {
    const owned = Object.keys(item.prefixes), tool = item.kind === 'tool';
    const forced = tool ? null : S.tutorial?.prefix(item);
    const pool = forced ? [forced.key] : owned.length >= D.config.prefixSlots ? owned :
      tool ? Object.keys(D.toolPrefixes) : D.prefixPools[item.slot];
    return '<details class="possible-prefixes"><summary>Possible prefixes · ' + pool.length + '</summary><p>' +
      (forced ? 'This tutorial roll guarantees +2 Primary Damage.' : owned.length >= D.config.prefixSlots ?
        'All three prefix slots are occupied. Successful rolls now strengthen an existing prefix.' :
        'A successful roll adds or strengthens one of these prefixes. An item holds up to three different prefixes.') +
      '</p><div class="prefix-options">' + pool.map(key => {
        const range = D.prefixRanges[key];
        const amount = forced ? '+' + U.statValue(key, forced.increment) :
          tool ? '+' + G.percent(D.toolPrefixes[key], 2) + ' per rank' :
          '+' + U.statValue(key, range[0]) + ' to +' + U.statValue(key, range[1]);
        return '<div><span>' + (tool ? key : D.labels[key]) +
          (owned.includes(key) ? ' <small>Existing</small>' : '') + '</span><strong>' + amount + '</strong></div>';
      }).join('') + '</div></details>';
  };
  const card = U.itemCard;
  U.itemCard = (item, slot = '') => {
    const summary = U.itemSummary(item);
    return card(item, slot).replace('</button>', (summary ? '<span class="item-summary" title="' +
      (item.kind === 'gear' ? 'Inherent stats before prefixes, gems and perks' : 'Item effect') + '">' + U.e(summary) +
      '</span>' : '') + '</button>');
  };
  const shop = U.screens.Shop;
  U.screens.Shop = () => {
    let html = shop();
    for (const entry of D.shop.filter(entry => entry.category === G.runtime.tab && D.catalog[entry.id])) {
      html = html.replace('<h3 class="spacer">' + entry.name + '</h3>',
        '<h3 class="spacer">' + entry.name + '</h3>' + U.effectPreview({kind:'stack',key:entry.id}));
    }
    return html;
  };
})(RPG, RPG.data, RPG.systems, RPG.ui);
