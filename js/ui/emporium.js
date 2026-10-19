'use strict';
(function(G,D,S,U) {
  const ac=n=>'<span class="ac-price"><span aria-hidden="true">\u2726</span> '+G.number(n)+' <small>AC</small></span>';
  U.regaliaStats = entry => '<dl class="regalia-stats">'+Object.entries(entry.stats).map(([key,n])=>'<div><dt>'+D.labels[key]+'</dt><dd>+'+U.statValue(key,n)+'</dd></div>').join('')+'</dl>';
  U.regaliaArt = entry => '<span class="regalia-art painted-regalia '+entry.kind+'-art" style="--regalia:'+entry.color+'" role="img" aria-label="'+U.e(entry.name)+'">'+U.paint('regalia:'+entry.id)+'</span>';
  const portrait=U.companionPortrait;
  U.companionPortrait=entry=>entry?.special?'<span class="special-pet-art" role="img" aria-label="'+U.e(entry.name)+'"><img class="special-pet-illustration" src="'+entry.illustration+'" alt="" decoding="async"><b aria-hidden="true">\u2726</b></span>':portrait(entry);
  const art=entry=>entry.special?U.companionPortrait(entry):U.regaliaArt(entry);
  const petStats=p=>'<p class="notes pet-rate">'+Object.entries(S.companions.rates(p)).map(([stat,rate])=>'+'+U.companionStatValue(stat,rate)+' '+D.labels[stat]+' per level').join('<br>')+'</p>';
  const blocked=()=>{const c=G.character();return c.combat||c.activity||c.dungeon||c.pending.length||S.tutorial.active();};
  U.mysteryBoxArt=box=>'<span class="sealed-box-art box-'+box.kind+'">'+U.paint(box.id)+'<b>'+({outfit:'Outfit',aura:'Aura',mount:'Mount',pet:'Pet',gem:'Gem',stone:'Stone'}[box.kind])+'</b></span>';
  const itemArt=U.itemArt;
  U.itemArt=item=>D.catalog[item.key]?.box?U.mysteryBoxArt(D.emporiumBoxes.find(b=>b.id===item.key)):itemArt(item);
  const item=U.item;
  U.item=id=>{
    item(id);const entry=S.items.find(id),box=D.emporiumBoxes.find(b=>b.id===entry?.key&&b.sealed);
    if(box)document.querySelector('.modal')?.insertAdjacentHTML('beforeend','<div class="modal-actions">'+U.btn('Open present','openInventoryBox','data-id="'+id+'" '+(entry.locked||!G.character().inventory.includes(entry)||blocked()?'disabled':''),'gold-btn')+'</div>');
  };
  U.openInventoryBox=id=>{
    const c=G.character(),entry=c.inventory.find(i=>i.id===id),box=D.emporiumBoxes.find(b=>b.id===entry?.key&&b.sealed);
    G.assert(box&&!entry.locked,'Choose an unlocked mystery box in your inventory.');
    U.confirm('Unwrap '+box.name+'?',U.mysteryBoxArt(box)+'<p class="notes spacer">Consumes one sealed box. One permanent unlock; duplicates return '+box.duplicate+' AC. Opening binds the reward to your collection.</p><details class="spacer"><summary>Possible rewards and odds</summary>'+U.boxOdds(box)+'</details>',()=>{
      G.assert(c===G.character()&&c.inventory.includes(entry)&&!entry.locked,'The box changed. Review it again.');
      U.emporiumResult(S.emporium.open(box.id));
    });
  };
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
      return '<tr><td>'+(o.entry?.special?'<span class="pet-outcome">'+U.companionPortrait(o.entry)+'<span>'+U.e(o.entry.name)+'<small class="pet-outcome-rates">'+Object.entries(S.companions.rates(o.entry)).map(([stat,rate])=>'+'+U.companionStatValue(stat,rate)+' '+D.labels[stat]+' / level').join('<br>')+'</small></span></span>':U.e(o.entry?.name||(info?info.name:o.stone?'1 Ascendant Stone':U.price(o.coins))))+(info?.boxOnly?' <small class="exclusive-label">EXCLUSIVE</small>':'')+(gem?'<small class="box-gem-effect">+'+U.statValue(gem.stat,gem.value*info.rank)+' '+D.labels[gem.stat]+'</small>':'')+'</td><td>'+G.percent(o.weight/total,box.kind==='gem'?6:4)+'</td></tr>';
    }).join('')+'</tbody></table></div>';
  };
  U.emporiumResult=result=>{
    const entry=result.entry;
    U.modal(result.duplicate?'Already in your collection':entry?'A new chapter in your collection':result.key?'A gem for your journey':result.stone?'An Ascendant Stone!':'Coins for the road',
      '<div class="emporium-result">'+(entry?art(entry):result.key?U.itemArt({kind:'stack',key:result.key}):U.paint(result.stone?'stone':'coins'))+'<h3>'+U.e(entry?.name||(result.key?D.catalog[result.key].name:result.stone?'1 Ascendant Stone':U.price(result.coins)))+'</h3>'+
      (entry?.special?petStats(entry):'')+(result.duplicate?'<p class="notes">You already own this reward. Returned '+ac(result.refund)+'. Your existing item or pet is preserved.</p>':entry?'<p class="notes">Added to your permanent collection. Equip it whenever you are ready.</p>':result.key?U.effectPreview({kind:'stack',key:result.key})+'<p class="notes">Added to your inventory.</p>':'<p class="notes">Added to your '+(result.stone?'inventory':'wallet')+'.</p>')+'</div><div class="modal-actions">'+U.btn('Continue','closeModal','','quiet')+
      (entry&&!result.duplicate?U.btn('Equip now',entry.special?'equipPet':'equipRegalia','data-id="'+entry.id+'"','gold-btn'):'')+'</div>');
  };
  U.emporiumOpen=id=>{
    const box=D.emporiumBoxes.find(b=>b.id===id),c=G.character();G.assert(box,'Choose an available box.');
    if(box.sealed){
      U.confirm('Purchase '+box.name+'?',U.mysteryBoxArt(box)+'<p class="spacer">'+ac(box.price)+'</p><p class="notes spacer">Adds one sealed box to Inventory > Mystery Boxes. Open it as a present whenever you like, or list the unopened box on the Marketplace.</p><details class="spacer"><summary>Contents and opening odds</summary>'+U.boxOdds(box)+'</details>',()=>{
        G.assert(c===G.character(),'Character changed. Review your purchase again.');
        S.emporium.buy(id);
        U.modal('A present for your journey',U.mysteryBoxArt(box)+'<h3 class="spacer">'+box.name+'</h3><p class="notes spacer">Your sealed box is waiting in your bag.</p><div class="modal-actions">'+U.btn('Keep shopping','closeModal','','quiet')+U.btn('View mystery boxes','viewMysteryBoxes','','gold-btn')+'</div>');
      });
      return;
    }
    U.confirm('Open '+box.name+'?', '<div class="box-quote">'+U.mysteryBoxArt(box)+'<div><h3>One random reward</h3>'+ac(box.price)+'</div></div><p class="notes spacer">Each opening is an independent roll. '+(box.kind==='gem'?'Regular types: 90%; exclusive types: 10%. Ranks I / II / III / IV / V: 60% / 25% / 10% / 4.5% / 0.5%. Gems stack; no duplicate refund.':box.duplicate?'Duplicates return '+box.duplicate+' AC; existing collection items and pet progress are preserved.':'A stone has exactly 1 chance in 100; normal coins fill the other 99 outcomes.')+'</p>'+U.boxOdds(box),()=>{
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
      '<div class="box-layout"><section class="panel box-offer"><div class="mystery-art">'+U.mysteryBoxArt(box)+'</div><h2>'+box.name+'</h2><p class="notes spacer">'+summary+'</p><div class="regalia-purchase">'+ac(box.price)+U.btn(box.sealed?'Purchase box':'Review & open','emporiumOpen','data-id="'+box.id+'" '+(blocked()||c.ascendantCoins<box.price?'disabled':''),'gold-btn')+'</div><p class="notes spacer">'+(box.sealed?'Sealed boxes go to Inventory > Mystery Boxes. Open them there or list them on the Marketplace.':'Find unlocked regalia under Character and companions in the stable.')+'</p></section><section class="panel"><h3>Every possible outcome</h3>'+U.boxOdds(box,true)+'</section></div>';
  };
  U.ascendantHelp=()=>U.modal('Earn Ascendant Coins','<p class="notes">Combat levels after Level 1 award 2 AC each. Achievements award 5 AC, or 50 AC when they grant a title. Each reward is claimed once per character.</p><div class="spacer">'+Object.entries(D.ascendantCurrency.milestones).map(([level,n])=>'<div class="meta-row"><span>Combat level '+level+'</span>'+ac(n)+'</div>').join('')+'</div>'+U.btn('Continue','closeModal','','gold-btn spacer'));
  const character=U.screens.Character;
  U.screens.Character=()=>{
    const c=G.character();S.emporium.normalize(c);
    if(!['Outfits & Auras','Mounts'].includes(G.runtime.tab))return character().replace(/<section class="panel spacer cosmetic-slots">[\s\S]*?<\/section>/,'');
    const mounts=G.runtime.tab==='Mounts';
    return U.heading('PERSONAL REGALIA',mounts?'Mounts':'Outfits & Auras',mounts?'Equip one mount. Combat bonuses use the same caps as gear; travel times stay the same.':'Equip one of each. Their bonuses add to your equipment and obey the same combat caps.')+U.tabs(['Equipment','Stats','Perks','Talents','Outfits & Auras','Mounts'],G.runtime.tab)+
      '<div class="grid-2 equipped-regalia">'+(mounts?['mount']:['outfit','aura']).map(kind=>{
        const entry=D.regalia.find(e=>e.id===c.regalia[kind]);
        return '<section class="panel"><div class="panel-head"><h3>'+ ({outfit:'Outfit',aura:'Aura',mount:'Mount'}[kind])+'</h3>'+U.btn('Collection','regaliaCollection','data-kind="'+kind+'"','small quiet')+'</div>'+(entry?'<div class="regalia-equipped">'+U.regaliaArt(entry)+'<div><h3>'+entry.name+'</h3>'+U.regaliaStats(entry)+(kind==='outfit'?'<p class="notes spacer">Outfit portrait unlocked while equipped.</p>'+U.btn('Choose avatar','gearPortrait','','small quiet spacer'):'')+'</div></div>'+U.btn('Unequip','unequipRegalia','data-kind="'+kind+'" '+(blocked()?'disabled':''),'quiet spacer'):'<div class="empty">'+U.icon(kind==='outfit'?'Plate':'gem')+'<p>No '+kind+' equipped.</p></div>')+'</section>';
      }).join('')+'</div>';
  };
  U.regaliaCollection=kind=>{
    const entries=D.regalia.filter(r=>r.kind===kind&&G.character().regalia.owned.includes(r.id));
    U.modal(({outfit:'Your outfits',aura:'Your auras',mount:'Your mounts'})[kind],entries.length?'<div class="regalia-grid collection-modal">'+entries.map(e=>itemCard(e,true)).join('')+'</div>':'<p class="notes">Your collection begins in the Ascendant Emporium.</p>'+U.btn('Visit the Emporium','visitEmporium','data-kind="'+kind+'"','gold-btn spacer'),true);
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
