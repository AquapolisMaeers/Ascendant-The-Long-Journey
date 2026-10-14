'use strict';
(function(G, D, S, U) {
  const tiles = { Mining: 10, Woodcutting: 11, Fishing: 12, Hunting: 13, Smithing: 14, Cooking: 15, Faceting: 16,
    Weapon: 0, Warrior: 0, Archer: 1, Mage: 2, Helmet: 3, Plate: 4, Greaves: 5, Gloves: 6, Boots: 7,
    Necklace: 8, Ring: 9, food: 22, gem: 24, Inventory: 35 };
  // The painted rows are not perfectly uniform. Sample inside each object row,
  // especially above the extractor/potion row beneath the gems.
  U.art = index => {
    const size = [204, 204, 204, 192, 192, 204][Math.floor(index / 6)], atlas = 1254, rowCenters = [106, 316, 520, 720, 918, 1120];
    const x = (index % 6 + .5) * atlas / 6 - size / 2;
    const y = rowCenters[Math.floor(index / 6)] - size / 2;
    return '<span class="item-art" aria-hidden="true" style="background-size:' + (atlas / size * 100) + '% ' + (atlas / size * 100) + '%;background-position:' + (x / (atlas - size) * 100) + '% ' + (y / (atlas - size) * 100) + '%"></span>';
  };
  U.paint = key => {
    const art = D.itemIllustrations[key];
    G.assert(art, 'Missing artwork for ' + key + '.');
    // Sample inside a single cell, inset by 1% on all four sides.
    const [x, y, w, h] = art.crop || [(art.index % art.columns + .01) / art.columns,
      (Math.floor(art.index / art.columns) + .01) / art.rows, .98 / art.columns, .98 / art.rows];
    return '<span class="item-art" aria-hidden="true" data-art-key="' + U.e(key) +
      '" style="background-image:url(' + art.file + '?v=' + art.version + ');background-size:' +
      (100 / w) + '% ' + (100 / h) + '%;background-position:' +
      (x / (1 - w) * 100) + '% ' + (y / (1 - h) * 100) + '%"></span>';
  };
  U.itemArtKey = i => i.kind === 'gear' ? (i.boss == null ? 'gear:' + i.tier : 'boss:' + i.boss) + ':' + i.piece :
    i.kind === 'tool' ? 'tool:' + i.skill : i.key;
  U.itemArt = i => U.paint(U.itemArtKey(i));

  U.portraitArt = index => '<span class="icon portrait-art" aria-hidden="true" style="background-position:' + (index % 4 * 100 / 3) + '% ' + (Math.floor(index / 4) * 100 / 3) + '%"></span>';
  const icon = U.icon;
  U.icon = name => {
    if (D.classes.includes(name)) return U.portraitArt(D.classes.indexOf(name));
    if (name === 'dungeon') return U.portraitArt(15);
    if (name !== 'creature') return icon(name);
    const e = G.character()?.encounter?.enemy, n = (e?.name || '').toLowerCase();
    const matches = [[/mimic/,14],[/wolf|hound|warg/,4],[/boar|hog/,5],[/bear/,6],[/spider|arachn/,7],
      [/goblin|imp|kobold/,8],[/skeleton|undead|bone|wight|revenant/,9],[/mage|witch|warlock|sorcer|cult|wraith|shade/,10],
      [/golem|stone|sentinel|construct|elemental/,11],[/dragon|drake|wyrm/,13]];
    return U.portraitArt(matches.find(([pattern]) => pattern.test(n))?.[1] ?? (e?.type === 'regular' ? 3 : 12));
  };
  const encounter = U.encounter;
  U.encounter = () => {
    let html = encounter();
    const e = G.character()?.encounter;
    if (e && !G.character().activity && !G.character().combat) {
      const kind = {Mining:'ore',Woodcutting:'logs',Fishing:'fish',Hunting:'hide'}[e.type];
      const key = e.type === 'treasure' ? 'treasure' : kind ? kind + ':' + e.tier : null;
      if (key) html = html.replace(/(<div class="encounter-emblem">)<svg[\s\S]*?<\/svg>/, '$1' + U.paint(key));
    }
    return html;
  };

  const card = U.itemCard;
  U.itemCard = (i, slot = '') => card(i, slot).replace(/<svg class="icon"[\s\S]*?<\/svg>/, U.itemArt(i));
  const item = U.item;
  U.item = id => {
    item(id);
    const i = S.items.find(id);
    if (i) {
      const modal = document.querySelector('.modal');
      modal?.classList.add('item-modal');
      modal?.querySelector('.modal-head')?.insertAdjacentHTML('afterbegin', '<div class="item-art-detail rarity-' + (i.kind === 'stack' ? D.catalog[i.key].rarity : i.rarity) + '">' + U.itemArt(i) + '</div>');
    }
  };
  const reward = U.rewardText;
  U.rewardText = r => '<span class="reward-art' + (r.kind === 'gear' || r.kind === 'tool' ? ' rarity-' + r.rarity : '') + '">' + (r.coins ? U.paint('coins') : U.itemArt(r.kind ? r : {kind: 'stack', key: r.key})) + '<span>' + reward(r) + '</span></span>';
  U.afkPanel = (compact = false) => {
    const c = G.character(), a = c.afk, running = S.afk.run?.id === c.id;
    if (compact) return '<section class="panel afk-panel"><div class="panel-head"><h3>AFK advancing</h3><span class="badge">' + (running ? 'ACTIVE' : 'STOPPED') + '</span></div><div class="afk-summary"><span>' + a.interval / 1000 + 's travel</span><span>' + G.percent(a.chance, 0) + ' minimum odds</span><span>' + a.minutes + ' minutes</span></div><p class="notes afk-price">15 minutes free · then ' + S.afk.minuteRate(c) + ' Bronze/min</p><p id="afk-status" class="afk-status" role="status">' + U.e(S.afk.status) + '</p><div class="row">' + (running ? U.btn('Stop AFK', 'afkStop', '', 'danger') : U.btn('Start AFK', 'afkStart', c.combat || c.activity || c.pending.length || c.dungeon || S.tutorial.active() ? 'disabled' : '', 'gold-btn')) + U.btn('Configure', 'navigate', 'data-value="Settings"', 'small quiet') + '</div><small id="afk-timer" class="muted"></small></section>';
    const select = (key, label, values, format) => '<label>' + label + '<select data-afk="' + key + '">' + values.map(v => '<option value="' + v + '" ' + (a[key] === v ? 'selected' : '') + '>' + format(v) + '</option>').join('') + '</select></label>';
    const toggle = (key, label) => '<label class="settings-row">' + label + '<input type="checkbox" data-afk="' + key + '" ' + (a[key] ? 'checked' : '') + '></label>';
    return '<section class="panel afk-panel"><div class="panel-head"><h3>AFK advancing</h3><span class="badge">' + (running ? 'ACTIVE' : 'STOPPED') + '</span></div><p class="notes">A slower journey with your rules. Selected creatures and dungeon rooms are checked against a fresh 1,000-fight estimate before every battle.</p>' + (compact ? '<details><summary>' + a.interval / 1000 + 's travel · ' + G.percent(a.chance, 0) + ' minimum odds · edit filters</summary>' : '') + '<div class="afk-controls">' +
      select('interval', 'Travel interval', [8000,12000,16000], v => v / 1000 + ' seconds' + (v === 12000 ? ' · default' : '')) +
      select('chance', 'Minimum estimated win chance', [.55,.65,.75,.85,.95], v => G.percent(v,0)) +
      select('minHp', 'Stop at or below this health', [.25,.5,.75], v => G.percent(v,0)) +
      select('minutes', 'Active session duration', [15,30,60], v => v + ' minutes') + '</div>' +
      toggle('normals', 'Include normal creatures') + toggle('elites', 'Include elite creatures') + toggle('dungeons', 'Include dungeons') + toggle('gather', 'Gather usable resource nodes') + toggle('chests', 'Open treasure chests') +
      '<p class="notes">Manual travel takes 4 seconds. Dungeon rooms follow your win-chance filter; normal and elite filters apply outside dungeons. Turn off creatures, dungeons and chests for gathering only. It stops on defeat, full inventory, or low health. A win estimate is not a guarantee; Hardcore death rules still apply.</p>' +
      '<p class="notes afk-price">First 15 minutes free each session. Then ' + S.afk.minuteRate(c) + ' Bronze per started minute at this location. Maximum for ' + a.minutes + ' minutes: ' + S.afk.quote(c).maximum + ' Bronze. Stops if you cannot pay. Eating and resting at the campfire keep AFK running.</p>' + '<p class="notes">Keep the game visible. Hidden tabs pause; reloading requires a new start. Stopping allows a committed fight or gathering action to finish.</p>' +
      (compact ? '</details><p class="notes">Visible game only · health and loot stops active. Estimates cannot guarantee survival.</p>' : '') + '<p id="afk-status" class="afk-status" role="status">' + U.e(S.afk.status) + '</p><div class="row">' +
      (running ? U.btn('Stop AFK advancing', 'afkStop', '', 'danger wide') : U.btn('Start AFK advancing', 'afkStart', c.combat || c.activity || c.pending.length || c.dungeon || S.tutorial.active() ? 'disabled' : '', 'gold-btn wide')) +
      '</div><small id="afk-timer" class="muted"></small></section>';
  };
  const world = U.screens.World;
  U.screens.World = () => world().replace('<aside class="world-side">', '<aside class="world-side">' + U.afkPanel(true));
  const settings = U.screens.Settings;
  U.screens.Settings = () => settings() + '<div class="grid-2 spacer">' + U.afkPanel() + '<section class="panel"><h3>The sound of the journey</h3><p class="notes spacer">Clicks and menus are silent. Effects have softer attacks and a warm, quieter mix. Each skill has its own soundscape: quarry echoes, running water, woodland rustle, forge fire, simmering pots or a jeweller’s workbench. Travel, combat and dungeons have matching backgrounds. Music softens while an environment is playing.</p><label class="spacer">Preview an activity<select id="audio-scene-preview">' + ['Mining','Fishing','Woodcutting','Hunting','Smithing','Cooking','Faceting','Travel','Combat','Dungeon'].map(n => '<option value="' + n.toLowerCase() + '">' + n + '</option>').join('') + '</select></label><div class="row spacer">' + U.btn('Play 6-second sample', 'audioPreview') + U.btn('Stop sample', 'audioPreviewStop', '', 'quiet') + '</div><p class="notes spacer">Music controls the soundtrack, Ambience controls environmental loops, and SFX controls action sounds. Master controls everything. Backgrounds follow your active task and fade when it ends; hidden tabs pause audio.</p></section></div>';
  const shell = U.shell;
  U.shell = () => {
    const html = shell(), c = G.character();
    if (!c) return html;
    const unspent = D.perkLevels.filter(level => c.level >= level && c.perks[level] === undefined);
    return html.replace('<main class="content" id="content">', '<main class="content" id="content">' +
      (unspent.length && !S.tutorial.active() ? '<div class="perk-reminder"><span><strong>' + unspent.length + ' perk choice' + (unspent.length === 1 ? '' : 's') + ' available</strong> · Shape your build before the next battle.</span>' + U.btn('Choose perks', 'openPerks', '', 'small gold-btn') + '</div>' : ''));
  };
  const live = U.live;
  U.live = () => {
    live();
    const status = document.getElementById('afk-status'), timer = document.getElementById('afk-timer'), run = S.afk.run;
    if (status) status.textContent = S.afk.status;
    if (timer && run) timer.textContent = Math.ceil((G.character().afk.minutes * 60000 - run.elapsed) / 1000) + 's remaining · ' + run.fights + ' fights · ' + run.skipped + ' skipped · ' + run.spent + ' Bronze spent';
  };
})(RPG, RPG.data, RPG.systems, RPG.ui);
