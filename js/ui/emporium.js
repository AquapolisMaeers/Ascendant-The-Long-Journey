'use strict';
(function(G,D,S,U) {
  const ac=n=>'<span class="ac-price"><span aria-hidden="true">\u2726</span> '+G.number(n)+' <small>AC</small></span>';
  U.regaliaStats = entry => '<dl class="regalia-stats">'+Object.entries(entry.stats).map(([key,n])=>'<div><dt>'+D.labels[key]+'</dt><dd>+'+U.statValue(key,n)+'</dd></div>').join('')+'</dl>';
  U.regaliaArt = entry => {
    const i=D.regalia.filter(r=>r.kind===entry.kind).indexOf(entry), aura=entry.kind==='aura', sovereign=entry.tier==='Sovereign';
    const symbols=[
      'M0-12 8-3 3 8 0 14-3 8-8-3Z','M-10-11H10V3L0 14-10 3Z','M0 13C-19-1-9-18 0-7 9-18 19-1 0 13Z',
      'M-11 10 10-11M2-12H12V-2M-10-1V11H2','M-12-10H12L9 6 0 14-9 6Z','M0-14V14M-14 0H14M-9-9 9 9M-9 9 9-9',
      'M-13 0 0-10 13 0 0 10ZM0-4V4','M-12 12 12-12M-12-5-5-12M5 12 12 5','M-14-7H9L2-13M-14 0H14M-14 7H9L2 13',
      'M0-15 4-4 15 0 4 4 0 15-4 4-15 0-4-4Z','M-13 8 0-12 4-5-5 8ZM0 8 9-8 13-1 8 8Z',
      'M10-12C-16-10-16 10 10 12-2 3-2-3 10-12Z','M-12-6 0-13 12-6 9 9 0 15-9 9ZM-7 0H7',
      'M0-14 12 0 0 14-12 0ZM-5 0H5','M0-14C-25 12 25 12 0-14ZM-5 6H5'
    ];
    const emblem='<path d="'+(symbols[i]||'M-12 10 0-14 12 10 0 5Z')+'" transform="translate(70 '+(aura?'70':'62')+') scale('+(aura?'.8':'.55')+')" fill="none" stroke="#fff0c6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>';
    return '<span class="regalia-art '+(aura?'aura-art':'outfit-art')+(entry.tier==='Sovereign'?' sovereign-art':'')+'" style="--regalia:'+entry.color+'" role="img" aria-label="'+U.e(entry.name)+'">'+
      '<svg viewBox="0 0 140 140" aria-hidden="true"><path class="regalia-seal" d="M70 5 123 35v70l-53 30-53-30V35Z"/><path class="regalia-rays" d="M70 8v18M70 114v18M8 70h18M114 70h18M26 26l13 13M101 101l13 13M26 114l13-13M101 39l13-13"/>'+
      (sovereign?'<path d="M38 44 5 24 14 62 6 88 31 81 15 113 49 97M102 44 135 24 126 62 134 88 109 81 125 113 91 97" fill="#3c263c" stroke="currentColor" stroke-width="2"/>':'')+
      (aura?'<circle class="aura-orbit" cx="70" cy="70" r="43"/><path class="aura-crest" d="M70 28 96 60 82 83 70 112 58 83 44 60Z"/><path class="regalia-etch" d="m44 60 26 10 26-10M70 28v84M58 83l12-13 12 13"/><circle cx="70" cy="70" r="7" fill="currentColor"/>':
        '<path class="outfit-cape" d="M42 31 20 117l30-8 20 18 20-18 30 8-22-86-19-9H61Z"/><path class="outfit-body" d="m43 32-14 19 18 16-3 35 26 13 26-13-3-35 18-16-14-19-18-10-9 13-9-13Z"/><path class="regalia-etch" d="m43 32 27 20 27-20M47 67l23 15 23-15M70 52v63M44 102l26-8 26 8"/><path class="regalia-jewel" d="m70 52 8 10-8 11-8-11Z"/>')+
      emblem+(entry.id.endsWith(':tanky')?'<path d="M35 40 27 56 42 73M105 40 113 56 98 73" fill="none" stroke="currentColor" stroke-width="6"/>':'')+
      (entry.id.endsWith(':aggressive')?'<path d="M25 116 53 88M115 116 87 88" fill="none" stroke="#f6d9bd" stroke-width="4"/>':'')+
      (entry.id.endsWith(':utility')?'<path d="M39 39 70 90 101 39M58 93l-9 25M82 93l9 25" fill="none" stroke="#d7c4ef" stroke-width="2"/>':'')+
      (sovereign?'<path d="M50 20 46 6 60 14 70 2 80 14 94 6 90 20Z" fill="currentColor"/><circle cx="70" cy="70" r="55" fill="none" stroke="currentColor" stroke-dasharray="2 7"/>':'<path class="regalia-glyph" d="M'+(57+i%4*3)+' 18h18l-9 9Z"/>')+'</svg></span>';
  };
  const portrait=U.companionPortrait;
  U.companionPortrait=entry=>entry?.special?'<span class="special-pet-art">'+portrait(entry)+'<b aria-hidden="true">\u2726</b></span>':portrait(entry);
  const art=entry=>entry.special?U.companionPortrait(entry):U.regaliaArt(entry);
  const petStats=p=>'<p class="notes pet-rate">+'+U.statValue(p.stat,p.perLevel)+' '+D.labels[p.stat]+' per level</p>';
  const blocked=()=>{const c=G.character();return c.combat||c.activity||c.dungeon||c.pending.length||S.tutorial.active();};
  const itemCard=(entry,collection=false)=>{
    const c=G.character(),owned=S.emporium.owned(entry,c),equipped=entry.special?c.companion?.type===entry.id:c.regalia[entry.kind]===entry.id;
    return '<article class="regalia-card '+(entry.tier==='Sovereign'?'sovereign':'')+'" data-regalia="'+entry.id+'" style="--regalia:'+(entry.color||'#a9d8d2')+'"><div class="regalia-art-stage">'+art(entry)+'<span class="regalia-edition">'+(equipped?'EQUIPPED':owned?'COLLECTED':entry.special?'SPECIAL COMPANION':entry.tier.toUpperCase())+'</span></div><div class="regalia-body"><h3>'+U.e(entry.name)+'</h3>'+
      (entry.special?petStats(entry):Object.keys(entry.stats).length>5?'<p class="notes">Every combat stat, in one legendary set.</p><details><summary>All 15 bonuses</summary>'+U.regaliaStats(entry)+'</details>':U.regaliaStats(entry))+
      '<div class="regalia-purchase">'+'<span class="collection-owned">'+(equipped?'In use':'Yours forever')+'</span>'+
      U.btn(equipped?'Equipped':'Equip',entry.special?'equipPet':'equipRegalia','data-id="'+entry.id+'" '+(equipped||blocked()||!owned?'disabled':''),'quiet')+'</div></div></article>';
  };
  U.boxOdds=(box,filter=false)=>{
    const outcomes=S.emporium.outcomes(box),total=outcomes.reduce((n,o)=>n+o.weight,0),type=G.runtime.boxGemType||'all',rank=G.runtime.boxGemRank||'all';
    const filters=box.kind==='gem'&&filter?'<div class="box-pool-filters"><label>Gem type<select id="box-gem-type"><option value="all">All types</option>'+D.gems.map((gem,i)=>'<option value="'+i+'" '+(type===String(i)?'selected':'')+'>'+gem.name+'</option>').join('')+'</select></label><label>Rank<select id="box-gem-rank"><option value="all">All ranks</option>'+[1,2,3,4,5].map(i=>'<option value="'+i+'" '+(rank===String(i)?'selected':'')+'>'+D.roman[i]+'</option>').join('')+'</select></label></div>':'';
    const rows=outcomes.filter(o=>!filters||(type==='all'||String(D.catalog[o.key].type)===type)&&(rank==='all'||String(D.catalog[o.key].rank)===rank));
    return filters+'<div class="box-odds" tabindex="0" aria-label="Box rewards and unmodified per-opening odds"><table class="data-table"><thead><tr><th>Possible reward</th><th>Chance</th></tr></thead><tbody>'+rows.map(o=>{
      const info=o.key?D.catalog[o.key]:null,gem=info?D.gems[info.type]:null;
      return '<tr><td>'+U.e(o.entry?.name||(info?info.name:o.stone?'1 Ascendant Stone':U.price(o.coins)))+(info?.boxOnly?' <small class="exclusive-label">EXCLUSIVE</small>':'')+(gem?'<small class="box-gem-effect">+'+U.statValue(gem.stat,gem.value*info.rank)+' '+D.labels[gem.stat]+'</small>':'')+'</td><td>'+G.percent(o.weight/total,box.kind==='gem'?6:4)+'</td></tr>';
    }).join('')+'</tbody></table></div>';
  };
  U.emporiumResult=result=>{
    const entry=result.entry;
    U.modal(result.duplicate?'Already in your collection':entry?'A new chapter in your collection':result.key?'A gem for your journey':result.stone?'An Ascendant Stone!':'Coins for the road',
      '<div class="emporium-result">'+(entry?art(entry):result.key?U.itemArt({kind:'stack',key:result.key}):U.paint(result.stone?'stone':'coins'))+'<h3>'+U.e(entry?.name||(result.key?D.catalog[result.key].name:result.stone?'1 Ascendant Stone':U.price(result.coins)))+'</h3>'+
      (result.duplicate?'<p class="notes">You already own this reward. Returned '+ac(result.refund)+'. Your existing item or pet is preserved.</p>':entry?'<p class="notes">Added to your permanent collection. Equip it whenever you are ready.</p>':result.key?U.effectPreview({kind:'stack',key:result.key})+'<p class="notes">Added to your inventory.</p>':'<p class="notes">Added to your '+(result.stone?'inventory':'wallet')+'.</p>')+'</div><div class="modal-actions">'+U.btn('Continue','closeModal','','quiet')+
      (entry&&!result.duplicate?U.btn('Equip now',entry.special?'equipPet':'equipRegalia','data-id="'+entry.id+'"','gold-btn'):'')+'</div>');
  };
  U.emporiumOpen=id=>{
    const box=D.emporiumBoxes.find(b=>b.id===id),c=G.character();G.assert(box,'Choose an available box.');
    U.confirm('Open '+box.name+'?', '<div class="box-quote">'+U.icon('Inventory')+'<div><h3>One random reward</h3>'+ac(box.price)+'</div></div><p class="notes spacer">Each opening is an independent roll. '+(box.kind==='gem'?'Regular types: 90%; exclusive types: 10%. Ranks I / II / III / IV / V: 60% / 25% / 10% / 4.5% / 0.5%. Gems stack; no duplicate refund.':box.duplicate?'Duplicates return '+box.duplicate+' AC; existing collection items and pet progress are preserved.':'A stone has exactly 1 chance in 100; normal coins fill the other 99 outcomes.')+'</p>'+U.boxOdds(box),()=>{
      G.assert(c===G.character(),'Character changed. Review your purchase again.');U.emporiumResult(S.emporium.open(id));
    });
    if(c.ascendantCoins<box.price)document.querySelector('[data-action="confirm"]').disabled=true;
  };
  U.screens.Emporium=()=>{
    const c=G.character();S.emporium.normalize(c);
    const category=D.emporiumCategories.find(e=>e.name===G.runtime.tab)||D.emporiumCategories[0],box=D.emporiumBoxes.find(b=>b.id===category.box);
    const summary=box.kind==='gem'?'One gem, ranks I\u2013V. Regular types: 90%; exclusive types: 10%. Rank V: 0.5%.':box.duplicate?'One random permanent unlock. Duplicates return '+box.duplicate+' AC.':'One stone at 1%, or 5 / 10 / 15 Silver at 33% each.';
    return U.heading('THE ASCENDANT EMPORIUM','Fortune favours the journey.','Mystery boxes, permanent collections, and a chance at the extraordinary.',ac(c.ascendantCoins))+
      U.tabs(D.emporiumCategories.map(e=>e.name),category.name)+
      '<section class="emporium-intro"><div><h3>'+category.name+'</h3><p class="notes">'+category.description+'</p></div>'+'<div class="row">'+(box.kind==='gem'?U.btn('Gem guide','gemGuide','','quiet small'):'')+U.btn('How to earn coins','ascendantHelp','','quiet small')+'</div></section>'+
      '<div class="box-layout"><section class="panel box-offer"><div class="mystery-art">'+U.paint(box.kind==='gem'?'gem:6:5':'treasure')+'<b>?</b></div><h2>'+box.name+'</h2><p class="notes spacer">'+summary+'</p><div class="regalia-purchase">'+ac(box.price)+U.btn('Review & open','emporiumOpen','data-id="'+box.id+'" '+(blocked()||c.ascendantCoins<box.price?'disabled':''),'gold-btn')+'</div><p class="notes spacer">Find owned outfits and auras under Character. Your companions wait in the stable.</p></section><section class="panel"><h3>Every possible outcome</h3>'+U.boxOdds(box,true)+'</section></div>';
  };
  U.ascendantHelp=()=>U.modal('Earn Ascendant Coins','<p class="notes">Combat levels after Level 1 award 2 AC each. Achievements award 5 AC, or 50 AC when they grant a title. Each reward is claimed once per character.</p><div class="spacer">'+Object.entries(D.ascendantCurrency.milestones).map(([level,n])=>'<div class="meta-row"><span>Combat level '+level+'</span>'+ac(n)+'</div>').join('')+'</div>'+U.btn('Continue','closeModal','','gold-btn spacer'));
  const character=U.screens.Character;
  U.screens.Character=()=>{
    const c=G.character();S.emporium.normalize(c);
    if(G.runtime.tab!=='Outfits & Auras')return character().replace(/<section class="panel spacer cosmetic-slots">[\s\S]*?<\/section>/,'');
    return U.heading('PERSONAL REGALIA','Outfits & Auras','Equip one of each. Their bonuses add to your equipment and obey the same combat caps.')+U.tabs(['Equipment','Stats','Perks','Outfits & Auras'],'Outfits & Auras')+
      '<div class="grid-2 equipped-regalia">'+['outfit','aura'].map(kind=>{
        const entry=D.regalia.find(e=>e.id===c.regalia[kind]);
        return '<section class="panel"><div class="panel-head"><h3>'+ (kind==='outfit'?'Outfit':'Aura')+'</h3>'+U.btn('Collection','regaliaCollection','data-kind="'+kind+'"','small quiet')+'</div>'+(entry?'<div class="regalia-equipped">'+U.regaliaArt(entry)+'<div><h3>'+entry.name+'</h3>'+U.regaliaStats(entry)+'</div></div>'+U.btn('Unequip','unequipRegalia','data-kind="'+kind+'" '+(blocked()?'disabled':''),'quiet spacer'):'<div class="empty">'+U.icon(kind==='outfit'?'Plate':'gem')+'<p>No '+kind+' equipped.</p></div>')+'</section>';
      }).join('')+'</div>';
  };
  U.regaliaCollection=kind=>{
    const entries=D.regalia.filter(r=>r.kind===kind&&G.character().regalia.owned.includes(r.id));
    U.modal(kind==='outfit'?'Your outfits':'Your auras',entries.length?'<div class="regalia-grid collection-modal">'+entries.map(e=>itemCard(e,true)).join('')+'</div>':'<p class="notes">Your collection begins in the Ascendant Emporium.</p>'+U.btn('Visit the Emporium','visitEmporium','data-kind="'+kind+'"','gold-btn spacer'),true);
  };
  const companions=U.screens.Companions;
  U.screens.Companions=()=>{
    const c=G.character();S.emporium.normalize(c);
    const stable=[...new Set([...c.specialPets,...Object.keys(c.petStable)])].filter(type=>type!==c.companion?.type);
    return companions().replace('Release companion',S.companions.definition(c.companion)?.special?'Return to stable':'Release companion')+(stable.length?'<details class="panel spacer pet-stable"><summary>Companion stable \u00b7 '+stable.length+' waiting</summary><p class="notes spacer">One companion travels with you. Switching preserves levels and ascensions; hunger and vitality continue to age in the stable.</p><div class="stable-grid spacer">'+stable.map(type=>{
      const pet=D.allCompanions.find(p=>p.id===type),p=c.petStable[type];
      return '<div class="stable-pet">'+U.companionPortrait(pet)+'<div><strong>'+pet.name+'</strong><small>'+D.rarity[p?.ascensions||0]+' \u00b7 Level '+(p?.level||1)+'</small>'+U.btn('Travel together','equipPet','data-id="'+type+'" '+(blocked()?'disabled':''),'small quiet')+'</div></div>';
    }).join('')+'</div></details>':'');
  };
  const levelArt=U.companionPortrait;
  // The existing level card also resolves special companion portraits.
  U.companionPortrait=entry=>entry?levelArt(entry):U.icon('Companions');
  let lastView='';
  const measure=()=>{
    const sidebar=document.querySelector('.sidebar'),dock=document.getElementById('activity-dock');
    if(sidebar)document.body.style.setProperty('--activity-rail-left',Math.max(0,sidebar.getBoundingClientRect().right)+'px');
    if(dock&&!dock.hidden)document.body.style.setProperty('--activity-space',Math.ceil(dock.getBoundingClientRect().height+12)+'px');
    const view=G.runtime.page+'|'+G.runtime.tab;
    if(lastView!==view){document.getElementById('content')?.scrollTo(0,0);lastView=view;}
  };
  const sidebarObserver=new ResizeObserver(measure);let watchedSidebar;
  window.addEventListener('rpg:rendered',()=>{const sidebar=document.querySelector('.sidebar');if(sidebar!==watchedSidebar){sidebarObserver.disconnect();if(sidebar)sidebarObserver.observe(sidebar);watchedSidebar=sidebar;}measure();});
  window.addEventListener('resize',measure);
})(RPG,RPG.data,RPG.systems,RPG.ui);
