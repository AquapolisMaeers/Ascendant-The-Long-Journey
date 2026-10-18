'use strict';
(function(G, D, S, U) {
  U.citizenLook=(className,look)=>Number.isInteger(look)&&D.citizenLooks[className]?.[look]?look:0;
  U.characterPortrait = (className,appearance={}) => {
    const outfit=D.regalia.find(r=>r.id===appearance.outfit&&r.kind==='outfit');
    if(outfit)return '<span class="character-portrait citizen-portrait outfit-portrait" role="img" aria-label="'+U.e(outfit.name)+' portrait" data-class="'+U.e(className)+'" data-outfit="'+outfit.id+'" style="background-image:url('+outfit.avatar+')"></span>';
    const look=U.citizenLook(className,appearance.look);
    return '<span class="character-portrait citizen-portrait" role="img" aria-label="'+U.e(className+' / '+D.citizenLooks[className][look])+'" data-class="'+U.e(className)+'" data-look="'+look+'" style="background-image:url(assets/art/citizens/citizen-'+className.toLowerCase()+(look?'-'+look:'')+'.webp)"></span>';
  };
  U.lookPicker = (prefix,className,look=0,action='createLook',outfitSelected=false) => {
    look=U.citizenLook(className,look);
    return '<input type="hidden" id="'+prefix+'-portrait" value="'+look+'"><div class="look-picker" role="group" aria-label="'+className+' citizen portraits">'+D.citizenLooks[className].map((name,index)=>'<button type="button" class="look-option '+(!outfitSelected&&look===index?'selected':'')+'" data-action="'+action+'" data-look="'+index+'" aria-pressed="'+(!outfitSelected&&look===index)+'">'+U.characterPortrait(className,{look:index})+'<span>'+U.e(name)+'</span></button>').join('')+'</div>';
  };
  U.customize = () => {
    const c=G.character();G.runtime.appearanceDraft={look:U.citizenLook(c.class,c.appearance.look),color:c.appearance.color,...(c.appearance.outfit?{outfit:c.appearance.outfit}:{})};U.customizer();
  };
  U.customizer = () => {
    const c=G.character(),draft=G.runtime.appearanceDraft,outfit=D.regalia.find(r=>r.id===c.regalia.outfit&&r.kind==='outfit'&&c.regalia.owned.includes(r.id));
    const outfitChoice=outfit?'<section class="outfit-avatar-choice spacer"><div><span class="eyebrow">EQUIPPED OUTFIT</span><p class="notes">This portrait is available while '+U.e(outfit.name)+' is equipped.</p></div><button type="button" class="look-option '+(draft.outfit===outfit.id?'selected':'')+'" data-action="appearanceOutfit" aria-pressed="'+(draft.outfit===outfit.id)+'">'+U.characterPortrait(c.class,{outfit:outfit.id})+'<span>'+U.e(outfit.name)+'</span></button></section>':'';
    U.modal('Your avatar','<div class="citizen-preview">'+U.characterPortrait(c.class,draft)+'<div><div class="eyebrow">'+U.e(c.class.toUpperCase())+'</div><h3>'+U.e(c.name)+'</h3><p class="notes spacer">Choose a citizen portrait or the portrait of your equipped outfit.</p></div></div><div class="spacer">'+U.lookPicker('appearance',c.class,draft.look,'appearanceLook',!!draft.outfit)+'</div>'+outfitChoice+'<input type="hidden" id="appearance-color" value="'+U.e(draft.color)+'"><div class="modal-actions">'+U.btn('Cancel','closeModal','','quiet')+U.btn('Manage equipment','portraitEquipment','','quiet')+U.btn('Save portrait','appearanceConfirm','','gold-btn')+'</div>');
  };

  U.itemStatLabel = (key, item) => key === 'damage' && item?.style !== null && item?.style !== undefined ?
    D.primary[item.style] + ' Damage' : D.labels[key];
  const gearFor = r => ({
    kind:'gear', tier:r.tier, piece:r.piece, slot:r.piece < 3 ? 'Weapon' : D.pieces[r.piece],
    style:r.piece < 3 ? r.piece : null, armorClass:r.armorClass, rarity:0, boss:null, enhance:0, prefixes:{}, gems:[]
  });
  U.itemSummary = item => {
    if (item.kind === 'gear') return Object.entries(S.items.stats(item)).map(([key, value]) =>
      U.itemStatLabel(key, item) + ' ' + U.statValue(key, value)).join(' · ');
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
    if (info?.flavor) extra += '<small class="food-flavor">“' + U.e(info.flavor) + '”</small>';
    if (info?.rank > 0) {
      const gem = D.gems[info.type], slots = D.slots.filter(slot => D.gemAllowed[slot].includes(info.type));
      extra = '<p class="gem-description">' + U.e(D.gemDescriptions[gem.stat]) + '</p><small>Compatible slots: ' + slots.join(', ') + (gem.style === undefined ? '' : ' · ' + D.classes[gem.style] + ' only') + (gem.boxOnly ? ' · Gem Mystery Boxes; fuse higher ranks in Faceting' : '') + '</small>';
    }
    return summary ? '<div class="output-effects"><strong>' + U.e(summary) + '</strong>' + extra + '</div>' : '';
  };
  U.craftingStatus = skill => {
    const c = G.character(), tool = c.tools[skill];
    return '<button class="craft-status rarity-' + tool.rarity + '" data-action="item" data-id="' + tool.id + '" aria-label="View ' + U.e(tool.name) + '">' + U.itemArt(tool) +
      '<span><small>' + skill + ' · Level ' + c.skills[skill].level + '</small><strong>' + D.rarity[tool.rarity] + ' ' + U.e(tool.name) + '</strong></span></button>';
  };
  U.recipePreview = recipe => {
    if (recipe.piece === undefined) return U.effectPreview({kind:'stack', key:recipe.output});
    const item = gearFor(recipe), c = G.character(), equipped = c.equipment[item.slot], stats = S.items.stats(item);
    const before = S.character.stats(c), after = S.character.stats({...c, equipment:{...c.equipment,[item.slot]:item}});
    const comparison = item.armorClass && item.armorClass !== c.class || item.style !== null && item.style !== D.classes.indexOf(c.class) ?
      '<p class="notes">This equipment requires '+(item.armorClass || D.classes[item.style])+'. Compare equipment for your class to preview your build.</p>' :
      '<p class="notes">Replacing '+(equipped?U.e(U.itemName(equipped)):'an empty '+item.slot+' slot')+' with this Common +0 piece.</p>'+
      '<table class="data-table crafted-comparison"><thead><tr><th>Final stat</th><th>Now</th><th>With craft</th><th>Change</th></tr></thead><tbody>'+
      Object.keys(D.labels).filter(key=>!key.endsWith('Pct')).map(key=>{
        const delta=after[key]-before[key],changed=Math.abs(delta)>1e-10;
        return '<tr><td>'+D.labels[key]+'</td><td>'+U.statValue(key,before[key])+'</td><td>'+U.statValue(key,after[key])+'</td><td class="'+
          (changed?delta>0?'good':'bad':'')+'">'+(changed?(delta>0?'+':'')+U.statValue(key,delta):'—')+'</td></tr>';
      }).join('')+'</tbody></table><small>Includes equipped prefixes, gems, perks, companion bonuses and effective caps. The new craft starts without prefixes or gems.</small>';
    return '<div class="recipe-preview"><div class="eyebrow">COMMON +0 · DAMAGE, DEFENCE & HEALTH</div><dl class="preview-stats">' +
      Object.entries(stats).map(([key, val]) => '<div><dt>' + U.itemStatLabel(key, item) + '</dt><dd>' +
        U.statValue(key, val) + '</dd></div>').join('') + '</dl><small>Equip Lv ' + D.tiers[item.tier] +
      (item.armorClass ? ' · ' + item.armorClass + ' only' : item.style === null ? '' : ' · ' + D.classes[item.style] + ' only') + '</small>' +
      '<details class="compare-crafted"><summary>Compare full equipped stats</summary>'+comparison+'</details></div>';
  };
  U.upgradePreview = (item, ascend) => {
    if (item.kind === 'tool') return '<div class="upgrade-benefits"><strong>On success</strong><small>' +
      D.rarity[item.rarity] + ' → ' + D.rarity[item.rarity + 1] +
      ' · One work prefix gains a rank. No skill-level requirement.</small><small>Prefix capacity: '+
      S.items.prefixSlots(item)+' → '+S.items.prefixSlots(item,item.rarity+1)+'</small></div>';
    const next = {...item, enhance:Math.min(25,item.enhance + (ascend ? 0 : 1)), rarity:item.rarity + (ascend ? 1 : 0)};
    const before = S.items.stats(item), after = S.items.stats(next);
    return '<div class="upgrade-benefits"><strong>On success · inherent stats</strong><dl class="preview-stats">' +
      Object.entries(after).map(([key, val]) => '<div><dt>' + U.itemStatLabel(key, item) + '</dt><dd>' +
        U.statValue(key, before[key]) + ' → ' + U.statValue(key, val) + '</dd></div>').join('') +
      '</dl><small>' + (ascend ? 'Enhancement, prefixes and sockets are preserved. Prefix capacity: '+S.items.prefixSlots(item)+' → '+S.items.prefixSlots(next)+'.' : (item.enhance===25?'Fills one missing prefix slot. Enhancement stays +25.':'One allowed prefix improves.') +
        (S.items.sockets(next) > S.items.sockets(item) ? ' Unlocks a new gem socket.' : '')) + '</small></div>';
  };
  U.prefixGuide = item => {
    const owned = Object.keys(item.prefixes), tool = item.kind === 'tool';
    const limit = S.items.prefixSlots(item, tool ? Math.min(7,item.rarity+1) : item.rarity);
    const forced = tool ? null : S.tutorial?.prefix(item);
    const pool = forced ? [forced.key] : !tool&&item.enhance===25&&owned.length<limit ? D.prefixPools[item.slot].filter(key=>!owned.includes(key)) : owned.length >= limit ? owned :
      tool ? Object.keys(D.toolPrefixes) : D.prefixPools[item.slot];
    return '<details class="possible-prefixes"><summary>Possible prefixes · ' + pool.length + '</summary><p>' +
      (forced ? 'This tutorial roll guarantees +2 Primary Damage.' : !tool&&item.enhance===25&&owned.length<limit ? 'A successful refinement fills one empty prefix slot from this list; Enhancement stays +25.' : owned.length >= limit ?
        'All '+limit+' prefix slots are occupied. Successful rolls now strengthen an existing prefix.' :
        'A successful roll adds or strengthens one of these prefixes. '+(tool?'The target rarity':'This item')+' holds up to '+limit+' different prefixes.') +
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
