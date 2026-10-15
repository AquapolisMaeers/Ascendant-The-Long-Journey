'use strict';
(function(G, D, S, U) {
  U.sellCategoryNames = ['All', 'Equipment', 'Tools', 'Materials', 'Gems', 'Food', 'Stones', 'Utility'];
  U.saleCategory = item => item.kind === 'gear' ? 'Equipment' : item.kind === 'tool' ? 'Tools' : item.key === 'stone' ? 'Stones' : D.catalog[item.key].category;
  U.sellCategories = (items, current) => '<nav class="sell-categories spacer" aria-label="Sale categories">' +
    U.sellCategoryNames.map(name => U.btn(name + ' <span>' + items.filter(i => name === 'All' || U.saleCategory(i) === name).length + '</span>', 'sellCategory',
      'data-category="' + name + '" aria-pressed="' + (name === current) + '"', 'small ' + (name === current ? 'selected' : 'quiet'))).join('') + '</nav>';

  U.companionMarks = p => '<span class="companion-marks" role="img" aria-label="' + (p.ascensions || 0) + ' of ' + (D.companionRules.levelCaps.length - 1) + ' ascensions">' +
    D.companionRules.levelCaps.slice(1).map((_, i) => '<span class="' + (i < (p.ascensions || 0) ? 'lit' : '') + '" aria-hidden="true">◆</span>').join('') + '</span>';
  U.companionAscensionPanel = p => {
    const q = S.companions.ascensionQuote(p), atCap = p.level === q.cap, available = S.inventory.available('stone');
    return '<section class="companion-ascension spacer"><div class="row between"><strong>' + D.rarity[q.rank] + ' bond</strong><span class="badge">LEVEL CAP ' + q.cap + '</span></div>' +
      (q.nextCap === undefined ? '<p class="notes spacer">The final bond. Your companion can train to level 100.</p>' :
        '<p class="notes spacer">' + (atCap ? 'Your companion is ready to ascend.' : 'Reach level ' + q.cap + ' to ascend.') + ' Unlock ' + q.rarity + ' and a level cap of ' + q.nextCap + '.</p>' +
        '<div class="ascension-quote spacer"><strong>' + G.percent(q.chance, 0) + ' success</strong><span>' + q.stones + ' stones · ' + available + ' unlocked</span></div>' +
        U.btn('Ascend companion', 'ascendCompanion', !atCap || available < q.stones || !p.alive || G.character().combat || G.character().activity || G.character().dungeon ? 'disabled' : '', 'gold-btn wide spacer')) +
      '<details class="spacer"><summary>Rarity milestones</summary><div class="companion-milestones">' + D.companionRules.levelCaps.map((cap, rank) =>
        '<span class="' + (rank === q.rank ? 'current' : '') + '">' + D.rarity[rank] + '<small>' + (rank ? D.companionRules.levelCaps[rank - 1] + 1 : 1) + '–' + cap + '</small></span>').join('') + '</div></details></section>';
  };

  U.offlineTraining = (id = 'offline-select') => {
    const c = G.character();
    return '<section class="panel offline-training"><div class="panel-head"><h3>' + U.icon('Skills') + ' Offline training</h3><span class="badge">XP WHILE AWAY</span></div>' +
      '<label>AFK skilling<select id="' + id + '" aria-label="AFK skilling"><option value="">None</option>' + D.skills.map(skill => '<option ' + (c.offline === skill ? 'selected' : '') + '>' + skill + '</option>').join('') +
      '</select></label><p class="notes spacer">Up to 8 hours of XP only. No ingredients, items or coins. Independent of gathering preferences.</p>' +
      '<details class="spacer"><summary>Rates & offline rules</summary><p class="notes spacer">Up to 8 hours of XP only. No ingredients, items or coins. Gathering: 25% of base active XP. Smithing/Cooking: 12.5%. Faceting: 1.875%. Knowledge applies; Efficiency does not. Combat never runs offline.</p></details></section>';
  };
  U.trainingDialog = () => U.modal('Train while you are away', U.offlineTraining('training-offline-select') + U.btn('Done', 'closeModal', '', 'primary spacer'));
  const skills = U.screens.Skills;
  U.screens.Skills = () => {
    const html = skills(), preferences = U.skillPreferences();
    return html.replace(preferences, '<div class="skill-preparation spacer">' + preferences + U.offlineTraining() + '</div>').replace(/<p class="notes spacer">Choose AFK skilling[\s\S]*?<\/p>/, '');
  };
  const settings = U.screens.Settings;
  U.screens.Settings = () => settings().replace('<div class="stack save-settings">',
    U.offlineTraining() + '<div class="stack save-settings">').replace('<h3>Sound & presentation</h3>',
    '<h3>Sound & presentation</h3><label class="settings-row">Ambient particles & weather<input type="checkbox" data-setting="atmosphere" ' + (G.state.settings.atmosphere !== false ? 'checked' : '') + '></label>');

  const character = U.screens.Character;
  U.screens.Character = () => {
    if (G.runtime.tab !== 'Perks') return character();
    const c = G.character(), chosen = D.perkLevels.filter(level => c.perks[level] !== undefined).length,
      ready = D.perkLevels.filter(level => c.level >= level && c.perks[level] === undefined).length;
    return U.heading('SHAPE YOUR LEGEND', 'Your path to power', 'Each milestone offers three paths. Choose one permanent perk per milestone.', '<span class="badge">' + chosen + ' / 5 CHOSEN</span>') +
      U.tabs(['Equipment', 'Stats', 'Perks'], 'Perks') + '<section class="perk-overview"><div><strong>' + c.class + ' disciplines</strong><p>Build around force, endurance or technique.</p></div>' +
      '<span>' + (ready ? ready + ' choice' + (ready === 1 ? '' : 's') + ' available' : 'Your next milestone awaits') + '</span></section>' +
      '<div class="perk-path">' + D.perkLevels.map((level, row) => {
        const selected = c.perks[level], locked = c.level < level;
          return '<section class="perk-milestone ' + (locked ? 'locked' : selected === undefined ? 'available' : 'chosen') + '"><div class="perk-level"><span>MILESTONE ' + (row + 1) + '</span><strong>' + level + '</strong><small>' + (locked ? 'Locked' : selected === undefined ? 'Choose a path' : 'Path sealed') + '</small></div><div class="perk-options">' +
          D.perkNames[c.class][row].map((name, choice) => '<button class="perk-path-card ' + ['offensive', 'defensive', 'utility'][choice] + (selected === choice ? ' selected' : '') + '" data-action="perk" data-level="' + level + '" data-choice="' + choice + '" ' + (locked || selected !== undefined ? 'disabled' : '') + '>' +
            '<div class="perk-card-label">' + U.icon(['Weapon', 'Plate', 'Skills'][choice]) + '<span>' + ['Offence', 'Defence', 'Utility'][choice] + '</span><small>' + (selected === choice ? '✓ CHOSEN' : locked ? 'LEVEL ' + level : selected !== undefined ? 'UNCHOSEN' : 'PERMANENT') + '</small></div>' +
            '<strong>' + U.e(name) + '</strong><p>' + D.perkDescriptions[row][choice] + '</p></button>').join('') + '</div></section>';
      }).join('') + '</div>';
  };

  U.completionPanel = () => {
    const c = G.character(), title = D.achievements.find(a => a.id === 'completionist'), done = title.metric(c), ratio = Math.min(1, done / title.target),
      allDone = D.achievements.filter(a => c.achievements[a.id]).length;
    return '<section class="completion-panel panel spacer"><div class="completion-ring" style="--completion:' + ratio * 360 + 'deg"><strong>' + G.percent(ratio, 1) + '</strong></div><div><div class="eyebrow">THE COMPLETIONIST</div>' +
      '<h3>Your legend, one milestone at a time</h3><p class="notes">' + done + ' / ' + title.target + ' launch achievements completed. ' + allDone + ' / ' + D.achievements.length + ' achievements earned overall (' + G.percent(allDone / D.achievements.length, 1) + ').</p>' +
      '<small class="muted">The Completionist keeps its original requirements, including Marketplace records.</small></div></section>';
  };
  const achievements = U.screens.Achievements;
  U.screens.Achievements = () => achievements().replace('<div class="tabs"', U.completionPanel() + '<div class="tabs"');

  U.weather = (c = G.character()) => D.locationWeather[c?.location] || 'clear';
  const world = U.screens.World;
  U.screens.World = () => {
    const configure = U.btn('Configure', 'navigate', 'data-value="Settings"', 'small quiet');
    return world().replace(configure,
      configure + U.btn('Offline training', 'trainingDialog', 'title="AFK skilling: ' + (G.character().offline || 'Not assigned') + '"', 'small quiet training-link'));
  };

  U.activityView = () => {
    const a = G.character()?.activity, recipe = a?.type === 'craft' ? D.recipes.find(r => r.id === a.recipe) : null;
    G.runtime.page = recipe ? 'Crafting' : 'World';
    G.runtime.tab = recipe?.skill || '';
    if (recipe) {
      G.runtime.craftTier = recipe.tier;
      if (recipe.skill === 'Smithing') G.runtime.smithingCategory = U.smithingCategory(recipe);
      if (recipe.skill === 'Faceting') G.runtime.gemFilter = recipe.type;
    }
    U.render();
  };
  const shell = U.shell;
  U.shell = () => {
    const html = shell(), c = G.character();
    if (!c || G.runtime.selecting) return html;
    const a = c.activity, run = S.afk.run, visible = a || c.combat || run,
      stop = run ? U.btn('Stop AFK', 'afkStop', '', 'quiet small') : a && a.type !== 'advance' ? U.btn('Stop', 'stopActivity', '', 'quiet small') : '';
    return html + '<aside class="activity-dock" id="activity-dock" aria-label="Current activity" ' + (visible ? '' : 'hidden') + '><button data-action="activityView" title="Return to the active task"><span class="activity-dock-icon">' + U.icon(a?.skill || (a?.type === 'craft' ? D.recipes.find(r => r.id === a.recipe)?.skill : c.combat ? 'Weapon' : 'clock')) +
      '</span><span><small id="dock-kind">WORK IN PROGRESS</small><strong id="dock-title"></strong><span id="dock-count"></span></span><span id="dock-percent"></span></button><div class="dock-footer"><span id="dock-time"></span>' + stop + '</div><div class="dock-track" role="progressbar" aria-label="Activity progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><i id="dock-bar"></i></div></aside>';
  };
  const live = U.live;
  U.live = () => {
    live();
    const c = G.character(), a = c?.activity, dock = document.getElementById('activity-dock'), run = S.afk.run;
    if (!c || !dock || dock.hidden) return;
    const set = (id, text) => { const el = document.getElementById(id); if (el && el.textContent !== text) el.textContent = text; };
    const seconds = ms => (Math.max(0, ms) / 1000).toFixed(1) + 's';
    const duration = ms => { const s = Math.ceil(Math.max(0, ms) / 1000); return s >= 60 ? Math.floor(s / 60) + 'm ' + s % 60 + 's' : s + 's'; };
    let ratio = 0;
    if (a) {
      const recipe = a.type === 'craft' ? D.recipes.find(r => r.id === a.recipe) : null,
        part = G.clamp(a.elapsed / a.duration, 0, 1), total = a.total || a.remaining || 1,
        done = a.type === 'craft' ? total - a.remaining : 0;
      ratio = a.type === 'craft' ? G.clamp((done + part) / total, 0, 1) : part;
      set('dock-kind', c.pending.length ? 'PAUSED \u00b7 BAG FULL' : (run ? 'AFK \u00b7 ' : '') + (recipe?.skill || a.skill || 'Travelling'));
      set('dock-title', recipe?.name || (a.type === 'gather' ? D.catalog[D.resourceKinds[D.skills.indexOf(a.skill)] + ':' + a.tier].name : 'Discovering the road'));
      set('dock-count', a.type === 'craft' ? done + ' / ' + total + ' actions \u00b7 ' + a.remaining + ' left' : a.type === 'gather' ? c.encounter.charges + ' node charges left \u00b7 current action' : 'One encounter ahead');
      const queue = (Math.max(0, (a.remaining || 1) - 1) * a.duration + Math.max(0, a.duration - a.elapsed));
      set('dock-time', seconds(a.elapsed) + ' / ' + seconds(a.duration) + (c.pending.length ? ' \u00b7 Paused' : a.type === 'craft' ? ' \u00b7 ~' + duration(queue) + ' left' : ' \u00b7 ' + seconds(a.duration - a.elapsed) + ' left'));
    } else if (c.combat) {
      ratio = G.clamp(1 - c.combat.enemy.hp / c.combat.enemy.health, 0, 1);
      set('dock-kind', (run ? 'AFK \u00b7 ' : '') + 'Combat');
      set('dock-title', c.combat.enemy.name);
      set('dock-count', G.number(Math.max(0, c.combat.enemy.hp), 1) + ' enemy HP \u00b7 damage dealt');
      set('dock-time', c.combat.time.toFixed(1) + 's elapsed');
    } else {
      set('dock-kind', 'AFK ADVANCING'); set('dock-title', 'Following your filters');
      set('dock-count', S.afk.status); set('dock-time', duration(run?.elapsed || 0) + ' session');
    }
    const percent = Math.floor(ratio * 100), progress = dock.querySelector('[role="progressbar"]');
    set('dock-percent', !a && !c.combat ? '\u2014' : percent + '%');
    document.getElementById('dock-bar').style.width = ratio * 100 + '%';
    progress.setAttribute('aria-valuenow', percent);
    progress.setAttribute('aria-valuetext', document.getElementById('dock-count').textContent + '. ' + document.getElementById('dock-time').textContent);
    progress.setAttribute('aria-label', c.combat ? 'Enemy health depleted' : 'Activity progress');
  };
  const dockObserver = new ResizeObserver(entries => {
    for (const {target} of entries) document.body.style.setProperty('--activity-space', Math.ceil(target.getBoundingClientRect().height + 24) + 'px');
  });
  let watchedDock;
  window.addEventListener('rpg:rendered', () => {
    const dock = document.getElementById('activity-dock');
    if (dock !== watchedDock) { dockObserver.disconnect(); if (dock) dockObserver.observe(dock); watchedDock = dock; }
    U.live();
  });
})(RPG, RPG.data, RPG.systems, RPG.ui);
