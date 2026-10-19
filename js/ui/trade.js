'use strict';
(function(G,D,S,U) {
  const shop=U.screens.Shop;
  const intro=tab=>U.heading('THE QUARTERMASTER','Shop','Practical provisions for a longer journey.','<span class="badge">'+G.money(G.character().coins)+'</span>')+U.tabs(D.shopTabs,tab);
  const options=(selected)=>D.exchangeKinds.map(kind=>'<option value="'+kind+'" '+(selected===kind?'selected':'')+'>'+D.materialKinds[kind]+'</option>').join('');
  U.screens.Shop=()=>{
    const c=G.character();
    if(G.runtime.tab==='Materials') {
      const regions=D.locations.filter(l=>c.level>=l.level),region=regions.some(l=>l.id===G.runtime.shopRegion)?G.runtime.shopRegion:0;
      const tiers=D.tiers.map((_,i)=>i).filter(tier=>D.shop.some(entry=>entry.category==='Materials'&&entry.region===region&&entry.tier===tier));
      const tier=tiers.includes(G.runtime.shopMaterialTier)?G.runtime.shopMaterialTier:tiers[0];
      return intro('Materials')+'<div class="supply-filters"><label>Supplier location<select id="shop-region">'+D.locations.map(l=>'<option value="'+l.id+'" '+(region===l.id?'selected':'')+' '+(c.level<l.level?'disabled':'')+'>'+l.name+(c.level<l.level?' \u00b7 Unlock at level '+l.level:'')+'</option>').join('')+'</select></label><label>Material tier<select id="shop-material-tier">'+tiers.map(t=>'<option value="'+t+'" '+(t===tier?'selected':'')+'>Level '+D.tiers[t]+'</option>').join('')+'</select></label><p class="notes">Premium supplies priced by tier. Gather resources to save your coins.</p></div><div class="shop-grid regional-supplies">'+U.shopOffers(D.shop.filter(e=>e.category==='Materials'&&e.region===region&&e.tier===tier),'Materials')+'</div>';
    }
    if(G.runtime.tab!=='Exchange')return shop();
    const f=G.runtime.exchange??={from:'logs',to:'fish',tier:0,quantity:1};
    return intro('Exchange')+'<section class="panel exchange-panel"><div class="panel-head"><div><div class="eyebrow">THE BARTER COUNTER</div><h2>Ten for one.</h2></div><span class="badge">SAME TIER \u00b7 10 : 1</span></div><p class="notes spacer">Trade raw ore, lumber, fish, hides or fibres for another raw material of the same tier. Locked materials stay protected.</p><label class="exchange-tier spacer">Material tier<select id="exchange-tier">'+D.tiers.map((level,t)=>'<option value="'+t+'" '+(t===f.tier?'selected':'')+'>Level '+level+'</option>').join('')+'</select></label><div class="exchange-pair spacer"><div class="exchange-side"><small>YOU GIVE</small>'+U.paint(f.from+':'+f.tier)+'<label>From your inventory<select id="exchange-from">'+options(f.from)+'</select></label><strong id="exchange-give"></strong><small id="exchange-owned"></small></div><span class="exchange-arrow" aria-hidden="true">\u2192</span><div class="exchange-side"><small>YOU RECEIVE</small>'+U.paint(f.to+':'+f.tier)+'<label>Choose your return<select id="exchange-to">'+options(f.to)+'</select></label><strong id="exchange-receive"></strong><small>No coins or XP awarded</small></div></div><div class="exchange-order spacer"><label>Quantity to receive<div class="quantity-with-max"><input id="exchange-quantity" type="number" min="1" max="1000000" value="'+f.quantity+'" inputmode="numeric">'+U.btn('Max','exchangeMax','id="exchange-max"','quiet')+'</div></label>'+U.btn('Review exchange','exchangeReview','id="exchange-review"','gold-btn')+'</div><p class="notes spacer" id="exchange-feedback" role="status"></p></section>';
  };
  U.exchangeLive=()=>{
    if(G.runtime.page!=='Shop'||G.runtime.tab!=='Exchange')return;
    const f=G.runtime.exchange,c=G.character(),input=document.getElementById('exchange-quantity');if(!input)return;
    let maximum=0;try{maximum=S.exchange.quote(f.from,f.to,f.tier,1).max;}catch{}
    input.max=String(maximum);input.disabled=maximum<1;
    if(maximum<1)input.value='0';
    else if(Number(input.value)>maximum)input.value=String(maximum);
    else if(input!==document.activeElement&&Number(input.value)<1)input.value='1';
    const maxButton=document.getElementById('exchange-max');if(maxButton)maxButton.disabled=maximum<1;
    const quantity=Number(input.value),valid=Number.isSafeInteger(quantity)&&quantity>0&&quantity<=maximum;
    f.quantity=input.value===''?'':quantity;
    let q,message='';
    try{q=S.exchange.quote(f.from,f.to,f.tier,quantity);if(q.available<q.cost)message='Not enough unlocked materials. You can receive up to '+q.max+'.';else if(!q.room)message='Make room for the received material first.';else if(!q.fits)message='The received stack would be too large.';}catch(error){message=error.message;}
    if(maximum<1)message='No exchange available. You need at least 10 unlocked materials and room for the return.';
    if(c.activity||c.combat||c.dungeon)message='Finish your current activity before exchanging.';
    else if(c.pending.length)message='Resolve Pending Loot before exchanging.';
    else if(S.tutorial.active())message='Finish the tutorial before exchanging.';
    document.getElementById('exchange-give').textContent=(valid?quantity*10:'\u2014')+' '+D.catalog[f.from+':'+f.tier].name;
    document.getElementById('exchange-receive').textContent=(valid?quantity:'\u2014')+' '+D.catalog[f.to+':'+f.tier].name;
    document.getElementById('exchange-owned').textContent=S.inventory.available(f.from+':'+f.tier)+' unlocked in your inventory';
    document.getElementById('exchange-feedback').textContent=message||'Review and confirm before trading. Every 10 materials returns 1.';
    document.getElementById('exchange-review').disabled=!!message;
  };
  U.exchangeMax=()=>{
    const f=G.runtime.exchange,q=S.exchange.quote(f.from,f.to,f.tier,1),input=document.getElementById('exchange-quantity');
    if(input){input.value=String(q.max);U.exchangeLive();}
  };
  U.exchangeReview=()=>{
    const c=G.character(),f=G.runtime.exchange,q=S.exchange.quote(f.from,f.to,f.tier,Number(document.getElementById('exchange-quantity').value));
    U.confirm('Confirm material exchange','<div class="exchange-confirm"><div>'+U.paint(q.input)+'<strong>Give '+q.cost+' '+U.e(D.catalog[q.input].name)+'</strong></div><span aria-hidden="true">\u2192</span><div>'+U.paint(q.output)+'<strong>Receive '+q.quantity+' '+U.e(D.catalog[q.output].name)+'</strong></div></div><p class="notes spacer">Same tier, 10 for 1. The offered materials are consumed only when you confirm.</p>',()=>{
      G.assert(c===G.character(),'Your character changed. Review the exchange again.');S.exchange.trade(q.from,q.to,q.tier,q.quantity);
    });
  };
  const live=U.live;U.live=()=>{live();U.exchangeLive();};
})(RPG,RPG.data,RPG.systems,RPG.ui);
