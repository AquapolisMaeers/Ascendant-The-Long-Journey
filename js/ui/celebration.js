'use strict';
(function(G, D, S, U) {
  U.offlineReport = rows => {
    U.modal('While you were away', '<div class="offline-welcome"><span class="signal-icon">' + U.icon('clock') + '</span><div><div class="eyebrow">WELCOME BACK</div><h3>Your training kept moving.</h3><p class="notes">Offline skilling \u00b7 XP only \u00b7 up to 8 hours</p></div></div><div class="offline-results">' + rows.map(r => {
      const level = r.toLevel ?? 1, gained = r.levelsGained || 0;
      return '<section class="offline-result ' + (gained ? 'leveled' : '') + '" data-character="' + U.e(r.characterId || '') + '"><div class="offline-result-title"><span class="signal-icon">' + U.icon(r.skill) + '</span><div><strong>' + U.e(r.name) + '</strong><small>' + U.e(r.skill) + ' training</small></div><span class="offline-xp">+' + G.number(r.xp) + ' XP</span></div>' +
        (gained ? '<div class="offline-level-gain"><span>LEVEL UP<strong>' + r.fromLevel + ' <span aria-hidden="true">\u2192</span> ' + level + '</strong></span><span>+' + gained + ' level' + (gained === 1 ? '' : 's') + (level === 100 ? ' \u00b7 MASTERED' : '') + '</span></div>' : '<p class="notes offline-current-level">Level ' + level + (level === 100 ? ' \u00b7 Mastered' : ' \u00b7 ' + G.number(Math.max(0, D.xpNext(level) - (r.progressXp || 0))) + ' XP to next level') + '</p>') +
        '<div class="offline-track">' + U.bar(level === 100 ? 1 : r.progressXp || 0, level === 100 ? 1 : D.xpNext(level), 'skill') + '<small>' + G.number(r.seconds / 3600, 2) + ' hours trained</small></div></section>';
    }).join('') + '</div><p class="notes spacer">Gathering: 25% base active XP. Smithing/Cooking: 12.5%. Faceting: 1.875%. Knowledge applies. Training produces XP only; your ingredients and items stay intact.</p><div class="modal-actions">' + U.btn('Continue your journey', 'closeModal', '', 'gold-btn') + '</div>');
  };

  const popup = document.createElement('aside');
  popup.id = 'levelup-popup'; popup.className = 'levelup-popup'; popup.hidden = true;
  popup.setAttribute('aria-label', 'Level gains'); popup.setAttribute('role', 'status'); popup.setAttribute('aria-live', 'polite');
  document.body.append(popup);
  let rows = [], characterId = null, timer = 0, expires = 0, remaining = 12000, hovered = false;
  const paused = () => document.hidden || document.querySelector('.modal') || G.runtime.selecting || hovered || popup.contains(document.activeElement);
  const pause = () => {
    if (timer) { clearTimeout(timer); timer = 0; remaining = Math.max(0, expires - performance.now()); }
  };
  const schedule = () => {
    pause();
    if (popup.hidden || paused()) return;
    expires = performance.now() + remaining;
    timer = setTimeout(() => U.levelups.clear(), remaining);
  };
  const note = r => {
    if (r.kind === 'companion') return r.to === r.cap ? r.cap === 100 ? 'Fully trained at the final rarity.' : 'Ascension milestone reached. Visit Companions to raise the cap.' : 'Your bond grows stronger.';
    if (r.to === 100) return 'Level 100 \u00b7 Mastered.';
    if (r.kind === 'character') {
      const perks = D.perkLevels.filter(n => n > r.from && n <= r.to);
      const lands = D.locations.filter(l => l.level > r.from && l.level <= r.to);
      return [perks.length ? 'New perk milestone \u00b7 Character \u2192 Perks' : '', lands.length ? 'Region unlocked: ' + lands.at(-1).name : ''].filter(Boolean).join('. ') || 'Another step in your legend.';
    }
    const tiers = D.gatheringSkills.includes(r.skill) ? D.tiers.filter(n => n > r.from && n <= r.to).length : 0;
    return tiers ? tiers + ' new resource tier' + (tiers === 1 ? '' : 's') + ' unlocked.' : 'Training milestone reached.';
  };
  const render = () => {
    U.patch(popup, '<div class="levelup-head"><span>GROWTH, EARNED.</span><button type="button" class="levelup-dismiss" aria-label="Dismiss level gains">\u00d7</button></div><div class="levelup-list">' + rows.map(r => {
      const c = G.character(), icon = r.kind === 'character' ? U.characterPortrait(c.class, c.appearance) : r.kind === 'companion' ? U.companionPortrait(D.allCompanions.find(d => d.id === r.companionType)) : U.icon(r.skill);
      return '<section class="levelup-entry ' + r.kind + '"><span class="levelup-emblem">' + icon + '</span><div><small>' + (r.kind === 'character' ? 'ADVENTURER LEVEL UP' : r.kind === 'companion' ? 'COMPANION LEVEL UP' : 'SKILL LEVEL UP') + '</small><h3>' + U.e(r.kind === 'character' ? r.characterName : r.kind === 'companion' ? r.companionName : r.skill) + '</h3><p>' + U.e(note(r)) + '</p></div><div class="levelup-numbers"><strong>' + r.from + '<span>\u2192</span>' + r.to + '</strong><small>+' + (r.to - r.from) + ' level' + (r.to - r.from === 1 ? '' : 's') + '</small></div></section>';
    }).join('') + '</div>');
    popup.hidden = false;
  };
  U.levelups = {
    clear() { pause(); rows = []; characterId = null; popup.hidden = true; document.body.style.removeProperty('--levelup-space'); },
    add(detail) {
      const c = G.character();
      if (!c || c.id !== detail.characterId || G.runtime.selecting || detail.to <= detail.from) return;
      if (characterId !== c.id) this.clear();
      characterId = c.id;
      const row = rows.find(r => r.kind === detail.kind && r.skill === detail.skill && r.companionType === detail.companionType);
      if (row) { row.to = detail.to; row.cap = detail.cap; row.companionName = detail.companionName; }
      else rows.push({...detail});
      pause(); remaining = 12000; render(); schedule();
    }
  };
  popup.addEventListener('click', e => { if (e.target.closest('.levelup-dismiss')) U.levelups.clear(); });
  popup.addEventListener('pointerenter', () => { hovered = true; pause(); });
  popup.addEventListener('pointerleave', () => { hovered = false; schedule(); });
  popup.addEventListener('focusin', pause); popup.addEventListener('focusout', () => setTimeout(schedule, 0));
  window.addEventListener('rpg:levelup', ({detail}) => U.levelups.add(detail));
  window.addEventListener('rpg:dialog-opened', pause);
  window.addEventListener('rpg:dialog-closed', () => setTimeout(schedule, 0));
  document.addEventListener('visibilitychange', schedule);
  window.addEventListener('rpg:rendered', () => {
    if (characterId && (characterId !== G.character()?.id || G.runtime.selecting)) U.levelups.clear();
  });
  new ResizeObserver(() => {
    if (!popup.hidden) document.body.style.setProperty('--levelup-space', Math.ceil(popup.getBoundingClientRect().height + 16) + 'px');
  }).observe(popup);

  U.shopArt = entry => D.itemIllustrations[entry.id] ? U.paint(entry.id) : '<span class="shop-upgrade-icon">' + U.icon('AutoEat') + '<b>' + (entry.batch?'×'+entry.batch:G.percent(entry.threshold,0)) + '</b></span>';
  U.shopPreview = entry => '<div class="trade-preview"><div class="trade-art">' + U.shopArt(entry) + '</div><div><small>' + U.e(entry.category) + '</small><strong>' + U.e(entry.name) + '</strong><span>' + U.price(entry.price) + ' each</span></div></div>';
  U.shopOffers=(entries,current)=>{const c=G.character(),accents={Utility:'rose',Materials:'teal',Character:'violet'};return entries.map(entry => {
        const threshold = entry.threshold ?? null;
        const owned = entry.batch ? (c.batchEatUnlocks||[]).includes(entry.batch) : threshold && c.eatUnlocks.includes(threshold), locked = c.level < (entry.level || 1), afford = c.coins >= entry.price;
        return '<section class="panel shop-offer ' + accents[current] + '" data-shop-item="' + entry.id + '"><div class="shop-art-stage"><span class="shop-edition">' + (owned ? 'UNLOCKED' : locked ? 'LEVEL ' + entry.level : current === 'Materials' ? 'REGIONAL SUPPLY' : threshold || entry.batch ? 'PERMANENT UPGRADE' : 'FIELD ESSENTIAL') + '</span>' + U.shopArt(entry) + '<span class="shop-art-corner" aria-hidden="true"></span></div><div class="shop-offer-body"><div class="eyebrow">' + current + '</div><h3>' + U.e(entry.name) + '</h3><p class="notes">' + U.e(entry.description) + '</p>' + (D.catalog[entry.id] ? U.effectPreview({kind:'stack', key:entry.id}) : '') + '<div class="shop-purchase"><span class="shop-cost"><small>PRICE' + (current === 'Materials' ? ' / UNIT' : '') + '</small><strong>' + U.price(entry.price) + '</strong></span>' + U.btn(owned ? 'Owned' : current === 'Materials' ? 'Choose quantity' : 'Purchase', 'buy', 'data-id="' + entry.id + '" ' + (owned || locked || !afford || c.combat || c.activity || c.pending.length ? 'disabled' : ''), 'gold-btn') + '</div><small class="shop-availability">' + (owned ? 'Already part of your journey.' : locked ? 'Requires character level ' + entry.level + '.' : !afford ? 'Need ' + U.price(entry.price - c.coins) + ' more.' : current === 'Materials' ? 'Buy up to 100 at a time with quantity shortcuts.' : 'Review your purchase before paying.') + '</small></div></section>';
      }).join('');};
  const shop = U.screens.Shop;
  U.screens.Shop = () => {
    const names = D.shopTabs, current = names.includes(G.runtime.tab) ? G.runtime.tab : 'Utility';
    if (current === 'Storage') return shop().replace('<h2>A place for everything</h2>', '<div class="storage-heading"><span class="storage-art">' + U.paint('treasure') + '<b aria-hidden="true">+</b></span><div><div class="eyebrow">ROOM FOR THE ROAD</div><h2>A place for everything</h2></div></div>');
    if (current === 'Sell') return shop();
    const c = G.character(), accents = {Utility:'rose', Materials:'teal', Character:'violet'};
    return U.heading('THE QUARTERMASTER', 'Shop', 'Practical provisions for a longer journey.', '<span class="badge">' + G.money(c.coins) + '</span>') + U.tabs(names, current) +
      '<div class="shop-section-label"><span>' + U.icon(current === 'Character' ? 'Character' : current) + '</span><div><strong>' + {Utility:'Tools for a turning point', Materials:'Supplies for your next creation', Character:'Invest in your adventurer'}[current] + '</strong><small>' + {Utility:'Keep valuable gems safe and reshape your equipment.', Materials:'Matching materials, clear prices, and bulk purchases.', Character:'Contracts and permanent survival upgrades.'}[current] + '</small></div></div><div class="shop-grid">' + U.shopOffers(D.shop.filter(entry => entry.category === current),current) + '</div>';
  };
  const buyForm = U.buyMaterialsForm;
  U.buyMaterialsForm = id => { buyForm(id); document.querySelector('.modal-head').insertAdjacentHTML('afterend', U.shopPreview(D.shop.find(entry => entry.id === id))); };
  const sellForm = U.sellForm;
  U.sellForm = id => {
    sellForm(id);
    const item = S.items.find(id), rarity = item.kind === 'stack' ? D.catalog[item.key].rarity : item.rarity;
    document.querySelector('.modal-head').insertAdjacentHTML('afterend', '<div class="trade-preview rarity-' + rarity + '"><div class="trade-art">' + U.itemArt(item) + '</div><div><small>' + U.e(U.saleCategory(item)) + ' \u00b7 ' + D.rarity[rarity] + '</small><strong>' + U.e(U.itemName(item)) + '</strong><span>' + U.price(S.shop.value(item)) + ' each</span></div></div>');
  };
})(RPG, RPG.data, RPG.systems, RPG.ui);
