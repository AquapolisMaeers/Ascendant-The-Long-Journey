'use strict';
(function(G, D, S, U) {
  U.modal = (title, body, wide = false) => {
    if (!document.querySelector('.modal')) G.runtime.previousFocus = document.activeElement;
    document.getElementById('modal-root').innerHTML = '<div class="modal-backdrop"><section class="modal ' + (wide ? 'wide-modal' : '') + '" role="dialog" aria-modal="true" aria-labelledby="modal-title"><div class="modal-head"><h2 id="modal-title">' + title + '</h2><button class="modal-close" data-action="closeModal" aria-label="Close dialog">×</button></div>' + body + '</section></div>';
    const backdrop = document.querySelector('.modal-backdrop');
    let startedOutside = false;
    backdrop.onpointerdown = event => { startedOutside = event.target === backdrop; };
    backdrop.onclick = event => {
      if (startedOutside && event.target === backdrop) U.close();
      startedOutside = false;
    };
    setTimeout(() => document.querySelector('.modal input:not([type=hidden]),.modal select,.modal .btn,.modal-close')?.focus(), 0);
    G.emit('dialog-opened');
  };
  U.close = () => {
    document.getElementById('modal-root').innerHTML = '';
    G.runtime.modalItem = null;
    G.runtime.confirmAction = null;
    G.runtime.enhancePending = null;
    G.runtime.ascendPending = null;
    G.runtime.commandToolAccess = null;
    G.runtime.previousFocus?.focus();
    G.emit('dialog-closed');
  };
  U.confirm = (title, body, callback, danger = false, cancelAction = 'closeModal') => {
    G.runtime.confirmAction = callback;
    U.modal(title, body + '<div class="modal-actions">' + U.btn('Cancel', cancelAction, '', 'quiet') + U.btn('Confirm', 'confirm', '', '' + (danger ? 'danger' : 'gold-btn')) + '</div>');
  };
  U.locations = () => U.modal('Choose a location', '<div class="stack location-options">' + D.locations.map(l => '<button class="slot" data-action="location" data-id="' + l.id + '" ' + (G.character().level < l.level ? 'disabled' : '') + '><span class="slot-number">' + l.level + '</span><div><strong>' + l.name + '</strong><small>Enemies ' + l.level + '–' + l.max + (l.dungeon !== null ? ' · ' + D.dungeons[l.dungeon].name : '') + '</small></div></button>').join('') + '</div>', true);
  D.modeDescriptions = {
    Regular: 'A forgiving start to a long journey. Defeat restores your health but costs stored items and coins: one item and 10% of coins in the first land, increasing by one item and five percentage points per land. Equipped gear and tools are protected. The Marketplace preview is available.',
    Ironman: 'Build your own legacy through gathering, crafting and battle. The Marketplace is hidden. Defeat has the same item and coin penalties as Regular; equipped gear and tools are protected.',
    Hardcore: 'Every fight puts this entire chronicle at stake. Death permanently deletes this character, including its inventory, equipment and progress. There is no recovery; the empty slot can start a new journey.',
    'Hardcore Ironman': 'Begin a self-sufficient journey with one unbroken life. The Marketplace is hidden. Your first death permanently changes this character to Ironman and applies the normal regional item and coin losses. Your remaining progress survives.'
  };
  D.classStories = {
    Warrior: {title:'Stand where others falter', story:'You know the weight of a blade and the promise made by standing your ground. Whether you once guarded a village gate or took up a discarded sword yesterday, you step into danger so that the road behind you stays open. Your story is written in the fights you choose and the people you imagine protecting.', play:'Your weapon uses Attack for primary damage. Seek melee weapons and Attack gems, then choose perks and prefixes to shape offence, defence or utility. Preparation, food and equipment determine how safely you can face the next opponent.'},
    Archer: {title:'Read the road before it reads you', story:'A broken branch, a moving shadow, a breath held steady: you notice what the hurried traveller misses. Beyond the lantern light, patience is its own kind of courage. You set out with a bow and the belief that careful preparation can turn a dangerous journey into a story worth telling.', play:'Your weapon uses Ranged for primary damage. Seek bows and Ranged gems, then shape your build through offensive, defensive or utility perks. The bow is your combat identity; all classes use the same automatic combat timing rules unless their stats or perks modify them.'},
    Mage: {title:'Give the unknown a name', story:'The world is full of things that refuse to explain themselves. You answer with curiosity, a staff and a little stubbornness. Every gem you cut and every ruin you enter is another question asked of the dark. You travel because there is always one more mystery beyond the next ridge.', play:'Your weapon uses Magic for primary damage. Seek staves and Magic gems, and develop your own balance of offence, defence and utility. Spells are your weapon style within automatic combat; there is no separate mana resource or active spell rotation.'}
  };
  U.creation = (slot, step = 0) => {
    if (!G.runtime.creation || G.runtime.creation.slot !== slot) G.runtime.creation = {
      slot,
      step: 0,
      name: '',
      class: 'Warrior',
      mode: 'Regular',
      appearance: {
        portrait: 'sentinel',
        color: '#b9a375'
      }
    };
    const f = G.runtime.creation;
    f.step = step;
    const title = ['A name for the road', 'Choose your class', 'Choose your game mode', 'Your appearance', 'Begin your chronicle'][step];
    let body = '<div class="creation-step">' + Array.from({
      length: 5
    }, (_, i) => '<i class="' + (i <= step ? 'active' : '') + '"></i>').join('') + '</div>';
    if (step === 0) body += '<label>Character name<input id="create-name" minlength="2" maxlength="24" placeholder="Enter your name" value="' + U.e(f.name) + '" autocomplete="off"></label><p>2–24 characters. Each character has a separate inventory, skills, currency, and achievements.</p>';
    if (step === 1) body += '<div class="class-options">' + D.classes.map(n => '<button class="class-option ' + (f.class === n ? 'active' : '') + '" data-action="createClass" data-value="' + n + '">' + U.icon(n) + '<span>' + n + '</span></button>').join('') + '</div><section class="class-story spacer">' + U.characterPortrait(f.class, f.appearance) + '<div class="eyebrow">' + f.class + '</div><h3>' + D.classStories[f.class].title + '</h3><p class="spacer">' + D.classStories[f.class].story + '</p><p class="notes spacer">' + D.classStories[f.class].play + '</p><p class="notes spacer">Every class can master all eight skills. Milestone perks are shared in balance. Each class also has three unique talent paths and its own armour. Class is permanent.</p></section>';
    if (step === 2) body += '<div class="stack">' + D.modes.map(n => '<button class="slot ' + (f.mode === n ? 'gold' : '') + '" data-action="createMode" data-value="' + n + '"><div><strong>' + (f.mode === n ? '◆ ' : '') + n + '</strong><small>' + ({
      Regular: 'Normal death · Marketplace preview',
      Hardcore: 'Death permanently deletes this character',
      Ironman: 'Self-sufficient · Marketplace completely hidden',
      'Hardcore Ironman': 'Death permanently converts to Ironman; all progress stays'
    } [n]) + '</small></div></button>').join('') + '</div>' + (f.mode === 'Hardcore' ? '<div class="warning danger-box spacer">HARDCORE: death permanently deletes this character. The slot becomes reusable. There is no recovery.</div>' : '');
    if (step === 3) body += U.lookPicker('create', f.class, f.appearance.look ?? 0, 'createLook') + '<input type="hidden" id="create-color" value="' + f.appearance.color + '"><p class="notes spacer">An ordinary beginning. Your story is still yours to write.</p>';
    if (step === 4) body += '<div class="panel"><h2>' + U.e(f.name) + '</h2><p>' + f.class + ' · ' + f.mode + '</p><p>Start at Level 1 with a Common Worn class weapon and all eight Common tools. Start with ' + D.config.startingBronze + ' Bronze. The guided tutorial helps you earn food and armour.</p></div><p>Class and mode are permanent. Only a fallen Hardcore Ironman converts to Ironman.</p>' + (f.mode === 'Hardcore' ? '<label class="settings-row"><span>I understand death permanently deletes this character.</span><input type="checkbox" id="hardcore-confirm"></label>' : '');
    body += '<div class="modal-actions">' + (step ? U.btn('Back', 'createBack', '', 'quiet') : '') + U.btn(step === 4 ? 'Begin journey' : 'Continue', step === 4 ? 'createFinish' : 'createNext', '', 'primary') + '</div>';
    U.modal(title, body);
  };
  U.item = id => {
    const item = S.items.find(id);
    G.assert(item, 'Item not found.');
    G.runtime.modalItem = id;
    const c = G.character(),
      gear = item.kind === 'gear',
      tool = item.kind === 'tool';
    const rarity = gear || tool ? item.rarity : D.catalog[item.key].rarity;
    let body = '<div class="item-heading rarity-' + rarity + '">' + U.icon(U.itemIcon(item)) + '<div><div class="eyebrow">' + D.rarity[rarity] + (gear ? ' · LV ' + D.tiers[item.tier] + ' · +' + item.enhance : tool ? ' · ' + (item.bound ? 'BOUND STARTER TOOL' : 'NO SKILL LEVEL REQUIREMENT') : ' · ×' + item.quantity) + '</div><p>' + (gear ? item.slot + (item.boss !== null ? ' · Boss gear · +15% inherent stats' : '') : tool ? item.skill : D.catalog[item.key].category) + (item.locked ? ' · Locked ◆' : '') + '</p></div></div>';
    if (gear) {
      const stats = S.items.stats(item),
        equipped = c.equipment[item.slot],
        other = equipped && equipped.id !== item.id ? S.items.stats(equipped) : null;
      body += '<table class="data-table spacer"><thead><tr><th>Inherent stat</th><th>This item</th><th>Compared to equipped</th></tr></thead><tbody>' + Object.entries(stats).map(([key, value]) => '<tr><td>' + D.labels[key] + '</td><td>' + U.statValue(key, value) + '</td><td class="' + (value >= (other?.[key] || 0) ? 'good' : 'bad') + '">' + (other ? (value >= (other[key] || 0) ? '↑ +' : '↓ ') + U.statValue(key, value - (other[key] || 0)) : '—') + '</td></tr>').join('') + '</tbody></table><p>Comparison shows inherent stats. Final Stats includes prefixes, perks, and gems.</p>';
    }
    if (tool && item.skill === 'Faceting') body += '<p>Fortune currently has no Chisel effect. Gem-rank requirements remain enforced.</p>';
    if (gear && c.inventory.includes(item)) {
      const copy = G.clone(c);
      copy.equipment[item.slot] = G.clone(item);
      const before = S.character.stats(c),
        after = S.character.stats(copy);
      body += '<details class="spacer"><summary>Compare final build if equipped</summary><table class="data-table"><thead><tr><th>Final stat</th><th>Current</th><th>With item</th></tr></thead><tbody>' + Object.keys(D.labels).filter(k => !k.endsWith('Pct')).map(k => '<tr><td>' + D.labels[k] + '</td><td>' + U.statValue(k, before[k]) + '</td><td class="' + (after[k] > before[k] ? 'good' : after[k] < before[k] ? 'bad' : '') + '">' + (after[k] > before[k] ? '↑ ' : after[k] < before[k] ? '↓ ' : '') + U.statValue(k, after[k]) + '</td></tr>').join('') + '</tbody></table><p>Includes prefixes, gems, perks and effective stat caps. Equipping still requires the correct class and level.</p></details>';
    }
    if (gear || tool) {
      if (tool) body += U.toolPrefixHelp();
      body += '<hr><div class="item-details-grid"><section class="item-prefixes"><h3>Prefixes · ' + Object.keys(item.prefixes).length + ' / ' + S.items.prefixSlots(item) + '</h3><div class="notes spacer">' + (Object.entries(item.prefixes).map(([key, value]) => tool ? key + ' ' + D.roman[value] + ' · ' + G.percent(value * D.toolPrefixes[key]) + ' — ' + D.toolPrefixDescriptions[key] : D.labels[key] + ' +' + U.statValue(key, value)).join('<br>') || 'No prefixes yet.') + '</div><div class="grid-2 spacer">';
      if (gear && (item.enhance < 25 || Object.keys(item.prefixes).length < S.items.prefixSlots(item))) {
        const q = S.upgrades.quote(item);
        body += '<section class="upgrade-box upgrade-compact"><h3>' + (item.enhance===25?'Fill a missing prefix':'Enhance to +'+(item.enhance+1)) + '</h3>' + U.upgradeSummary(q,true) + U.btn(item.enhance===25?'Refine prefixes':'Enhance', 'enhance', 'data-id="' + id + '"', 'primary wide') + '</section>';
      }
      if (item.rarity < 7) {
        const q = S.upgrades.quote(item,true);
        body += '<section class="upgrade-box upgrade-compact"><h3>Ascend to ' + D.rarity[item.rarity + 1] + '</h3>' + U.upgradeSummary(q,true) + U.btn('Ascend', 'ascend', 'data-id="' + id + '"', 'gold-btn wide') + '</section>';
      }
      body += '</div></section>';
      if (gear) {
        body += '<section class="item-sockets"><div class="row between"><h3>Gem sockets</h3><span class="badge">' + S.items.sockets(item) + ' / ' + (item.boss !== null ? 5 : 3) + ' UNLOCKED</span></div><p>Unlock at ' + D.sockets[item.boss !== null ? 'boss' : 'regular'].map(n => '+' + n).join(' / ') + '.</p>';
        for (let index = 0; index < S.items.sockets(item); index++) {
          const key = item.gems[index],
            gems = c.inventory.filter(i => i.kind === 'stack' && D.catalog[i.key].rank > 0 && D.gemAllowed[item.slot].includes(D.catalog[i.key].type));
          body += '<div class="socket-row">' + U.icon('gem') + (key ? '<span>' + U.e(D.catalog[key].name) + '</span>' + U.btn('Extract', 'extract', 'data-id="' + id + '" data-index="' + index + '"', 'small') + U.btn('Destroy gem', 'destroyGem', 'data-id="' + id + '" data-index="' + index + '"', 'small danger') : '<select id="socket-' + index + '"><option value="">Select a gem</option>' + gems.map(i => '<option value="' + i.key + '">' + U.e(D.catalog[i.key].name) + ' ×' + i.quantity + '</option>').join('') + '</select>' + U.btn('Socket', 'socket', 'data-id="' + id + '" data-index="' + index + '"', 'small')) + '</div>';
        }
        body += '</section></div><hr><div class="row">' + (c.inventory.includes(item) ? U.btn('Equip', 'equip', 'data-id="' + id + '"', 'primary') : U.btn('Unequip', 'unequip', 'data-slot="' + item.slot + '"')) + U.btn(item.locked ? 'Unlock' : 'Lock / favourite', 'lock', 'data-id="' + id + '"') + U.btn('Remove enchantments', 'removeEnchant', 'data-id="' + id + '"', 'danger') + (c.inventory.includes(item) ? U.btn('Discard', 'discard', 'data-id="' + id + '"', 'danger') : '') + '</div>';
      }
      else body += '</div>';
    } else {
      const info = D.catalog[item.key];
      body += U.effectPreview(item) + '<p>' + (info.healing ? 'Restores ' + info.healing + ' HP. Assign this food in World.' : info.rank === 0 && info.category === 'Gems' ? 'Cut this typed uncut gem into Gem I in Crafting → Faceting.' : info.category === 'Gems' ? 'Socket into compatible equipment. Fuse three identical gems to upgrade the rank.' : info.id === 'stone' ? 'Consumed by every rarity Ascension attempt.' : 'An item for your journey.') + '</p><div class="row spacer">' + U.btn(item.locked ? 'Unlock' : 'Lock / favourite', 'lock', 'data-id="' + id + '"') + (info.category === 'Food' ? U.btn('Assign food', 'assignFood', 'data-key="' + item.key + '"', 'primary') : '') + (item.key === 'rename' ? U.btn('Use contract', 'renameForm') : item.key === 'appearance' ? U.btn('Customize appearance', 'appearanceForm') : '') + U.btn('Discard', 'discard', 'data-id="' + id + '"', 'danger') + '</div>';
    }
    U.modal(U.e(U.itemName(item)), body, true);
    G.runtime.modalItem = id;
  };
  U.tutorial = step => {
    const pages = [
      ['A deliberate journey', 'Choose a location in World, then press ADVANCE. Four seconds later, one optional encounter appears.', 'World'],
      ['Your choice matters', 'Fight a creature, gather a resource, enter a dungeon, or Move On. Inspect the victory estimate and combat math before choosing Fight.', 'World'],
      ['Prepare, then prevail', 'Combat and chosen gathering actions resolve automatically. Loot is collected automatically; click the loot notice to dismiss it. Inventory lets you equip, lock, and inspect gear.', 'Inventory'],
      ['Build for the long road', 'Character holds gear, stats, and milestone perks. Skills shows your eight tools. Choose offline training in the top bar. Crafting turns resources into equipment, food, and gems. Shop offers utility and storage.', 'Character']
    ];
    G.runtime.tutorialStep = step;
    const [title, text] = pages[step];
    U.modal(title, '<div class="eyebrow">FIELD GUIDE ' + (step + 1) + ' / 4</div><p class="spacer">' + text + '</p><div class="modal-actions">' + U.btn(step === 3 ? 'Return to the world' : 'Next', step === 3 ? 'closeModal' : 'tutorialNext', '', 'primary') + '</div>');
  };
  U.commandPanel = () => {
    U.modal('Command panel', '<form id="command-form" autocomplete="off"><label>Command<input id="command-input" type="text" maxlength="128" autocomplete="off" autocapitalize="off" spellcheck="false" aria-describedby="command-feedback" required></label><p id="command-feedback" class="notes spacer" role="status"></p><div class="modal-actions">' + U.btn('Cancel', 'closeModal', 'type="button"', 'quiet') + '<button type="submit" class="btn gold-btn">Run</button></div></form>');
    const input = document.getElementById('command-input');
    setTimeout(() => { if (input?.isConnected) input.focus(); }, 0);
  };
  U.debug = () => {
    const c = G.character();
    G.assert(c, 'Create a character first.');
    G.assert(!G.runtime.selecting && G.runtime.commandToolAccess === c.id, 'Command unavailable.');
    U.modal('Command Tool', '<div class="warning">Debug changes mark this character as modified. Export a normal save before balancing experiments.</div><div class="field-grid"><label>Character level<input id="debug-level" type="number" min="1" max="100" value="' + c.level + '"></label><label>Skill<select id="debug-skill">' + D.skills.map(s => '<option>' + s + '</option>').join('') + '</select></label><label>Skill level<input id="debug-skill-level" type="number" min="1" max="100" value="100"></label><label>XP amount<input id="debug-xp" type="number" min="0" value="500"></label><label>HP<input id="debug-hp" type="number" min="0" value="100"></label><label>Tier<select id="debug-tier">' + D.tiers.map((n, i) => '<option value="' + i + '">' + n + '</option>').join('') + '</select></label><label>Piece<select id="debug-piece">' + D.pieces.map((n, i) => '<option value="' + i + '">' + n + '</option>').join('') + '</select></label><label>Rarity<select id="debug-rarity">' + D.rarity.map((n, i) => '<option value="' + i + '">' + n + '</option>').join('') + '</select></label><label>Boss set<select id="debug-boss">' + D.dungeons.map((n, i) => '<option value="' + i + '">' + n.prefix + '</option>').join('') + '</select></label><label>Gem rank<select id="debug-gem-rank"><option value="0">Uncut</option>' + [1, 2, 3, 4, 5].map(n => '<option>' + n + '</option>').join('') + '</select></label></div><div class="row spacer">' + [
      ['Set character level', 'level'],
      ['Set skill level', 'skill'],
      ['Add XP', 'xp'],
      ['Add 100 Gold', 'coins'],
      ['Generate item', 'item'],
      ['Generate boss item', 'bossItem'],
      ['Add tier materials', 'materials'],
      ['Add gems', 'gems'],
      ['Add 100 Stones', 'stones'],
      ['Set HP', 'hp'],
      ['Force creature', 'regular'],
      ['Force Elite', 'elite'],
      ['Force gathering', 'gather'],
      ['Force Dungeon', 'dungeon'],
      ['Test death rules', 'death'],
      ['Simulate 1,000 fights', 'simulate'],
      ['Export state', 'export'],
      ['Clear save', 'reset']
    ].map(([label, command]) => U.btn(label, 'debug', 'data-command="' + command + '"', 'small')).join('') + '</div>', true);
  };
})(RPG, RPG.data, RPG.systems, RPG.ui);
