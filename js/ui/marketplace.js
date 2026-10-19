'use strict';
(function(G,D,S,U) {
  const tabs=['Browse','Sell','My Listings'],pageSize=8;
  const state=()=>{
    const tab=tabs.includes(G.runtime.tab)?G.runtime.tab:'Browse';
    G.runtime.marketFilters??={};
    return G.runtime.marketFilters[tab]??={search:'',category:'All',sort:'Name',page:0};
  };
  const category=item=>U.saleCategory(item);
  const rarity=item=>item.kind==='stack'?D.catalog[item.key].rarity:item.rarity;
  const active=c=>c.listings.filter(l=>l.status==='active').length;
  const idle=c=>!c.combat&&!c.activity&&!S.tutorial.active();
  const empty=(heading,copy)=>'<div class="market-empty">'+U.icon('Marketplace')+'<h3>'+heading+'</h3><p class="notes">'+copy+'</p></div>';
  const select=(field,label,options,value)=>'<label>'+label+'<select id="market-'+field+'" data-market-field="'+field+'">'+options.map(option=>'<option '+(value===option?'selected':'')+'>'+U.e(option)+'</option>').join('')+'</select></label>';
  const controls=(items,browse=false)=>{
    const f=state(),categories=['All',...['Equipment','Tools','Materials','Gems','Food','Stones','Mystery Boxes'].filter(kind=>browse||f.category===kind||items.some(item=>category(item)===kind))];
    if(!categories.includes(f.category))f.category='All';
    const changed=f.search||f.category!=='All'||f.sort!=='Name'||['minimum','maximum','level'].some(key=>f[key])||['source','slot','style','rarity'].some(key=>f[key]&&f[key]!=='All');
    return '<div class="market-toolbar"><label class="market-search">Find an item<input id="market-search" data-market-field="search" type="search" placeholder="Search by name..." value="'+U.e(f.search)+'"></label>'+
      select('category','Category',categories,f.category)+select('sort','Sort by',browse?['Name','Price','Rarity','Level']:['Name','Rarity','Quantity'],f.sort)+(changed?U.btn('Reset','marketClear','','quiet small'):'')+'</div>';
  };
  const filtered=items=>{
    const f=state(),query=f.search.trim().toLowerCase();
    return items.filter(item=>(f.category==='All'||category(item)===f.category)&&U.itemName(item).toLowerCase().includes(query)).sort((a,b)=>{
      const order=f.sort==='Rarity'?rarity(b)-rarity(a):f.sort==='Quantity'?(b.quantity||1)-(a.quantity||1):0;
      return order||U.itemName(a).localeCompare(U.itemName(b))||a.id.localeCompare(b.id);
    });
  };
  const paginate=items=>{
    const f=state(),pages=Math.max(1,Math.ceil(items.length/pageSize));f.page=G.clamp(f.page,0,pages-1);
    return {items:items.slice(f.page*pageSize,(f.page+1)*pageSize),pager:pages>1?'<nav class="market-pagination" aria-label="Marketplace pages"><span>Page '+(f.page+1)+' of '+pages+'</span><div>'+U.btn('Previous','marketPage','data-page="'+(f.page-1)+'" '+(f.page===0?'disabled':''),'quiet small')+U.btn('Next','marketPage','data-page="'+(f.page+1)+'" '+(f.page===pages-1?'disabled':''),'quiet small')+'</div></nav>':''};
  };
  const identity=(item,inspect=true)=>{
    const tag=inspect?'button':'div',attributes=inspect?' type="button" data-action="item" data-id="'+item.id+'" aria-label="Inspect '+U.e(U.itemName(item))+'"':'';
    return '<'+tag+' class="market-item"'+attributes+'><span class="market-item-art rarity-'+rarity(item)+'">'+U.itemArt(item)+'</span><span class="market-item-copy"><strong>'+U.e(U.itemName(item))+'</strong><small>'+U.e(item.kind==='gear'?item.slot+(item.armorClass?' / '+({Archer:'Ranger'}[item.armorClass]||item.armorClass):''):category(item))+' <span aria-hidden="true">·</span> '+D.rarity[rarity(item)]+'</small></span></'+tag+'>';
  };
  const sell=()=>{
    const c=G.character(),items=c.inventory.filter(item=>S.market.tradable(item)),shown=filtered(items),page=paginate(shown),canList=active(c)<D.config.maxListings&&idle(c);
    return '<section class="panel market-inventory"><div class="panel-head"><div><h2>Choose an item to list</h2><p class="notes">'+items.length+' eligible item types in your bag</p></div><span class="badge">'+active(c)+' / '+D.config.maxListings+' LISTINGS</span></div>'+controls(items)+
      '<div class="market-result-heading"><span>'+shown.length+' item'+(shown.length===1?'':'s')+(state().search||state().category!=='All'?' matching your filters':'')+'</span><span>Stock is reserved when you list</span></div>'+
      (items.length?shown.length?'<div class="market-rows">'+page.items.map(item=>'<article class="market-row">'+identity(item)+'<div class="market-stock"><small>AVAILABLE</small><strong>'+G.number(item.quantity||1)+'</strong></div>'+U.btn('List item','listForm','data-id="'+item.id+'" '+(!canList?'disabled':''),'gold-btn small')+'</article>').join('')+'</div>':empty('No matching items','Try another category or search term.'):empty('Your trading bag is empty','Collect unlocked materials, sealed mystery boxes or clean equipment to start a listing.'))+page.pager+
      (!canList?'<p class="notes market-feedback">'+(active(c)>=D.config.maxListings?'All listing slots are in use. Retrieve a listing to free a slot.':'Finish your current activity or tutorial before listing items.')+'</p>':'')+
      '<details class="market-rules"><summary>What can I list?</summary><p class="notes">Unlocked materials, gems, food, Ascendant Stones and sealed mystery boxes. Equipment must be +0 with no prefixes or inserted gems. Unbound tools without prefixes are eligible. Locked items, bound tools and utility items stay out of this list.</p></details></section>';
  };
  const listings=()=>{
    const c=G.character(),items=c.listings.map(l=>l.item),shown=filtered(items),page=paginate(shown),ids=new Set(page.items.map(i=>i.id));
    return '<section class="panel market-inventory"><div class="panel-head"><div><h2>Your listings</h2><p class="notes">Manage reserved items and collect them back into your bag.</p></div><span class="badge">'+c.listings.filter(l=>l.status==='retrieval').length+' TO RETRIEVE</span></div>'+controls(items)+
      (!shown.length?empty(items.length?'No matching listings':'No listings yet',items.length?'Try another category or search term.':'Choose Sell to create your first local listing.'):
        ['retrieval','active'].map(status=>{
          const rows=c.listings.filter(l=>l.status===status&&ids.has(l.item.id));if(!rows.length)return '';
          return '<section class="market-listing-group"><h3>'+ (status==='active'?'Active listings':'Ready to retrieve')+'</h3><div class="market-rows">'+page.items.map(item=>rows.find(l=>l.item.id===item.id)).filter(Boolean).map(l=>'<article class="market-row market-owned-row">'+identity(l.item,false)+'<div class="market-listing-price"><strong>'+G.money(l.price)+'</strong><small>'+G.number(l.item.quantity||1)+' item'+((l.item.quantity||1)===1?'':'s')+' / total price</small></div><div class="market-listing-status"><span class="badge">'+(status==='active'?'ACTIVE':'READY')+'</span><small>'+(status==='active'?'Ends '+new Date(l.expires).toLocaleDateString():'Items held safely')+'</small></div>'+U.btn(status==='active'?'Cancel & retrieve':'Retrieve','retrieveListing','data-id="'+l.id+'" '+(!idle(c)?'disabled':''),'quiet small')+'</article>').join('')+'</div></section>';
        }).join(''))+page.pager+'</section>';
  };
  const browse=()=>{
    const f=state();
    return '<section class="panel market-inventory"><h2>Browse the trading hall</h2>'+controls([],true)+
      '<details class="market-rules market-advanced"><summary>More filters</summary><div class="market-advanced-grid">'+
      [['minimum','Minimum price (Bronze)'],['maximum','Maximum price (Bronze)'],['level','Required level / tier']].map(([key,label])=>'<label>'+label+'<input id="market-'+key+'" data-market-field="'+key+'" type="number" min="0" value="'+U.e(f[key]||'')+'"></label>').join('')+
      select('source','Skill / source',['All',...D.skills,'Creature','Boss'],f.source||'All')+select('slot','Equipment slot',['All',...D.slots],f.slot||'All')+select('style','Weapon style',['All','Melee','Ranged','Magic'],f.style||'All')+select('rarity','Rarity',['All',...D.rarity],f.rarity||'All')+'</div></details>'+
      '<div id="market-results">'+empty('The trading hall is quiet','Online listings will appear here when the marketplace opens. You can organize local listings under Sell and My Listings.')+'</div></section>';
  };
  U.screens.Marketplace=()=>{
    if(!S.market.allowed())return '<div class="empty">Marketplace is unavailable in Ironman modes.</div>';
    const c=G.character(),tab=tabs.includes(G.runtime.tab)?G.runtime.tab:'Browse';S.market.expire(c);
    return U.heading('THE TRADING HALL','Marketplace','Trade supplies, equipment and sealed presents.','<span class="badge">LOCAL PREVIEW</span>')+
      '<p class="market-offline-note">'+U.icon('Marketplace')+'<span>Listings stay on this device. Online buyers are not available yet.</span></p>'+U.tabs(tabs,tab)+
      '<div class="market-terms"><span><strong>'+D.config.maxListings+'</strong> active slots</span><span><strong>'+D.config.listingDays+' days</strong> per listing</span><span><strong>'+G.percent(D.config.listingFee,0)+'</strong> listing fee</span><span><strong>'+G.percent(D.config.saleTariff,0)+'</strong> on sale</span></div>'+
      (tab==='Sell'?sell():tab==='My Listings'?listings():browse());
  };
  U.marketClear=()=>{
    const f=state();for(const key of Object.keys(f))delete f[key];Object.assign(f,{search:'',category:'All',sort:'Name',page:0});
    document.querySelectorAll('[data-market-field]').forEach(input=>{input.value=f[input.dataset.marketField]??(input.tagName==='SELECT'?'All':'');});U.render();
  };
  U.marketPage=page=>{state().page=page;U.render();};
  U.marketListForm=id=>{
    S.market.assert();const c=G.character(),item=c.inventory.find(i=>i.id===id);
    G.assert(item&&S.market.tradable(item),'Choose an eligible item from your bag.');
    G.runtime.listItem=id;G.runtime.listOwner=c.id;
    U.modal('Create a listing','<div class="market-list-preview"><span class="market-item-art rarity-'+rarity(item)+'">'+U.itemArt(item)+'</span><div><h3>'+U.e(U.itemName(item))+'</h3><p class="notes">'+G.number(item.quantity||1)+' available / '+category(item)+'</p></div></div>'+
      '<div class="market-list-fields"><label>Quantity<input id="listing-quantity" type="number" min="1" max="'+(item.quantity||1)+'" step="1" inputmode="numeric" value="1"><span class="market-quantity-shortcuts">'+[1,5,10,'all'].map(n=>U.btn(n==='all'?'All':'x'+n,'marketQuantity','data-quantity="'+n+'"','quiet small')).join('')+'</span></label><label>Total asking price (Bronze)<input id="listing-price" type="number" min="1" max="1000000000000" step="1" inputmode="numeric" value="100"><small>Price for the entire quantity.</small></label></div>'+
      '<dl class="market-quote"><div><dt>Listing fee · paid now</dt><dd id="listing-fee"></dd></div><div><dt>Sale tariff · if sold</dt><dd id="listing-tariff"></dd></div><div><dt>Sale proceeds · after tariff</dt><dd id="listing-proceeds"></dd></div></dl><p class="notes market-feedback" id="listing-feedback" role="status"></p><p class="notes">The listing fee is not refunded. Local preview has no online buyers.</p><div class="modal-actions">'+U.btn('Cancel','closeModal','','quiet')+U.btn('Create listing','listConfirm','id="market-list-submit"','gold-btn')+'</div>');
    U.marketListingLive();
  };
  U.marketQuantity=value=>{
    const item=G.character().inventory.find(i=>i.id===G.runtime.listItem),input=document.getElementById('listing-quantity');
    G.assert(item&&input,'Choose an item to list.');input.value=String(value==='all'?(item.quantity||1):Math.min(item.quantity||1,Number(value)));U.marketListingLive();
  };
  U.marketListingLive=()=>{
    const submit=document.getElementById('market-list-submit');if(!submit)return;
    const c=G.character(),item=c.inventory.find(i=>i.id===G.runtime.listItem),price=Number(document.getElementById('listing-price').value),quantity=Number(document.getElementById('listing-quantity').value);
    const validPrice=Number.isSafeInteger(price)&&price>0&&price<=1e12,fee=validPrice?Math.ceil(price*D.config.listingFee):0,tariff=validPrice?Math.ceil(price*D.config.saleTariff):0;
    let message='';
    if(c.id!==G.runtime.listOwner||!item||!S.market.tradable(item))message='This item changed. Choose it from your bag again.';
    else if(!Number.isSafeInteger(quantity)||quantity<1||quantity>(item.quantity||1))message='Choose a whole quantity within your available stock.';
    else if(!validPrice)message='Enter a whole-Bronze total price from 1 to 1,000,000,000,000.';
    else if(active(c)>=D.config.maxListings)message='All listing slots are in use.';
    else if(c.coins<fee)message='You need '+G.money(fee)+' for the listing fee.';
    else if(!idle(c))message='Finish your current activity or tutorial first.';
    document.getElementById('listing-fee').textContent=validPrice?G.money(fee):'—';
    document.getElementById('listing-tariff').textContent=validPrice?G.money(tariff):'—';
    document.getElementById('listing-proceeds').textContent=validPrice?G.money(price-tariff):'—';
    document.getElementById('listing-feedback').textContent=message||'One listing reserves '+quantity+' item'+(quantity===1?'':'s')+' for up to '+D.config.listingDays+' days.';
    submit.disabled=!!message;
  };
  document.addEventListener('input',event=>{
    const el=event.target;
    if(G.runtime.page==='Marketplace'&&el.dataset.marketField){
      const cursor=el.selectionStart;state()[el.dataset.marketField]=el.value;state().page=0;U.render();
      const input=document.getElementById(el.id);if(input&&el.type==='search'){input.focus();input.setSelectionRange(cursor,cursor);}
    }
    if(['listing-quantity','listing-price'].includes(el.id))U.marketListingLive();
  });
  const live=U.live;U.live=()=>{live();U.marketListingLive();};
})(RPG,RPG.data,RPG.systems,RPG.ui);
