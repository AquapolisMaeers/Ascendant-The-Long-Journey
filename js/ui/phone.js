'use strict';
(function(G, D, S, U) {
  const media = matchMedia('(max-width:700px), (max-width:1000px) and (max-height:500px) and (pointer:coarse)');
  U.isPhone = () => media.matches;
  const pages = () => ['World','Character','Inventory','Skills','Crafting','Shop',...(S.market.allowed() ? ['Marketplace'] : []),'Quests','Achievements','Leaderboards','Companions','Emporium','Settings'];
  U.mobileMenu = () => {
    if (!U.isPhone() || !G.character() || G.runtime.selecting) return;
    const c = G.character();
    document.querySelector('.phone-nav [data-action="mobileMenu"]')?.setAttribute('aria-expanded','true');
    U.modal('Your journey', '<div class="phone-menu"><div class="phone-menu-profile">' + U.characterPortrait(c.class, c.appearance) + '<div><strong>' + U.e(c.name) + '</strong><small>Level ' + c.level + ' \u00b7 ' + c.class + ' \u00b7 ' + c.mode + '</small></div></div><nav class="phone-menu-grid" aria-label="All game pages">' + pages().map(page => '<button type="button" data-action="navigate" data-value="' + page + '" ' + (G.runtime.page === page ? 'class="active" aria-current="page"' : '') + '>' + U.icon(page) + '<span>' + page + '</span>' + (G.runtime.page === page ? '<small>HERE</small>' : '') + '</button>').join('') + '</nav><div class="phone-menu-foot">' + U.btn('Character slots','slots','','quiet') + '<span>LOCAL SAVE \u00b7 ' + U.e(G.save.status) + '</span></div></div>');
  };
  const shell = U.shell;
  U.shell = () => {
    const html = shell();
    if (!G.character() || G.runtime.selecting || G.runtime.loadFailure) return html;
    const primary = ['World','Inventory','Crafting','Shop'];
    return html + '<nav class="phone-nav" aria-label="Quick navigation">' + primary.map(page => '<button type="button" data-action="navigate" data-value="' + page + '" ' + (G.runtime.page === page ? 'class="active" aria-current="page"' : '') + '>' + U.icon(page) + '<span>' + page + '</span></button>').join('') + '<button type="button" data-action="mobileMenu" aria-haspopup="dialog" aria-expanded="' + !!document.querySelector('.phone-menu') + '" aria-label="More pages" ' + (!primary.includes(G.runtime.page) ? 'class="active"' : '') + '>' + U.icon('Menu') + '<span>More</span></button></nav>';
  };
  const world = U.screens.World;
  U.screens.World = () => {
    const html = world();
    if (!U.isPhone() || S.tutorial.active() || G.character().combat) return html;
    const template = document.createElement('template'); template.innerHTML = html;
    const travel = template.content.querySelector('[data-action="locations"]');
    if (travel) { travel.innerHTML = U.icon('World') + '<span>Travel</span>'; travel.setAttribute('aria-label', 'Change location'); }
    const loc = D.locations[G.character().location];
    for (const [selector, icon, label, state] of [
      ['.inn-panel','fountain','Wayside inn','PAID HEALING'],
      ['.afk-panel','clock','AFK advancing',S.afk.run ? 'ACTIVE' : 'AUTOMATE'],
      ['.location-scene','World',loc.name,'REGION ' + (loc.id + 1)]
    ]) {
      const panel = template.content.querySelector(selector);
      if (!panel) continue;
      const details = document.createElement('details'); details.className = 'phone-fold';
      details.dataset.section = selector.slice(1);
      details.innerHTML = '<summary>' + U.icon(icon) + '<span>' + U.e(label) + '</span><small>' + state + '</small></summary>';
      panel.replaceWith(details); details.append(panel);
    }
    return template.innerHTML;
  };
  window.addEventListener('rpg:dialog-closed', () => document.querySelector('.phone-nav [data-action="mobileMenu"]')?.setAttribute('aria-expanded','false'));
  const activityView = U.activityView;
  U.activityView = () => { activityView(); if (U.isPhone()) window.scrollTo({top:0, behavior:'instant'}); };
  const compact = new Intl.NumberFormat('en', {notation:'compact', maximumFractionDigits:1});
  const live = U.live;
  U.live = () => {
    live();
    if (!U.isPhone() || !G.character()) return;
    const value = G.character().ascendantCoins || 0, balance = document.getElementById('ascendant-coins');
    if (balance) {
      balance.textContent = value >= 1000 ? compact.format(value) : G.number(value);
      const wallet = balance.closest('button');
      wallet.title = G.number(value) + ' Ascendant Coins';
      wallet.setAttribute('aria-label', G.number(value) + ' Ascendant Coins. Open Emporium.');
    }
  };
  let lastView = '';
  const measure = () => {
    const header = document.querySelector('.topbar');
    if (U.isPhone() && header) document.body.style.setProperty('--phone-header-height', Math.ceil(header.getBoundingClientRect().height) + 'px');
    else document.body.style.removeProperty('--phone-header-height');
  };
  const observer = new ResizeObserver(measure);
  let watched = null;
  window.addEventListener('rpg:rendered', () => {
    const header = document.querySelector('.topbar');
    if (header !== watched) { observer.disconnect(); if (header) observer.observe(header); watched = header; }
    measure();
    if (!U.isPhone()) return;
    const c = G.character(), xp = document.querySelector('.top-progress:not(.hp-top)');
    if (c && xp) xp.setAttribute('aria-label', 'Level ' + c.level + '. ' + G.number(c.xp) + ' of ' + (c.level === 100 ? 'maximum' : G.number(D.xpNext(c.level))) + ' XP.');
    const view = G.runtime.page + '|' + G.runtime.tab;
    if (view !== lastView) {
      const tabs = document.querySelector('#content > .tabs'), active = tabs?.querySelector('[aria-selected="true"]');
      if (active) {
        const a = active.getBoundingClientRect(), t = tabs.getBoundingClientRect();
        if (a.left < t.left || a.right > t.right) tabs.scrollLeft += a.left - t.left - 12;
      }
      lastView = view;
    }
    document.querySelectorAll('.data-table').forEach(table => { table.tabIndex = 0; table.setAttribute('aria-label', 'Swipe horizontally for more columns'); });
  });
  media.addEventListener('change', () => {
    lastView = '';
    if (!U.isPhone() && document.querySelector('.phone-menu')) U.close();
    document.querySelectorAll('.data-table').forEach(table => { table.removeAttribute('tabindex'); table.removeAttribute('aria-label'); });
    U.render();
  });
})(RPG, RPG.data, RPG.systems, RPG.ui);
