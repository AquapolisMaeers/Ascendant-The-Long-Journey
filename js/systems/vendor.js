'use strict';
(function(G, D, S) {
  S.shop.value = function(item) {
    if (item.kind === 'gear') {
      const base = Object.entries(S.items.recipe(item)).reduce((n, [key, q]) => n + q * this.stackValue(key), 0);
      return Math.ceil(base * (item.boss != null ? D.config.bossSellMultiplier : 1));
    }
    if (item.kind === 'tool') return D.toolSellPrices[item.rarity];
    return this.stackValue(item.key);
  };
  S.shop.stackValue = function(key) {
    if (key === 'stone') return 10000;
    const data = D.catalog[key];
    if (!data) return 0;
    if (['bar','leather','cloth'].includes(data.kind)) {
      const recipe = D.recipes.find(r => r.id === key);
      return Object.entries(recipe.cost).reduce((n, [k, q]) => n + q * this.stackValue(k), 0);
    }
    if (data.kind === 'food') return D.tiers[data.tier];
    return data.level;
  };
  S.shop.canSell = function(item, c = G.character()) {
    return !!item && c.inventory.includes(item) && !item.locked &&
      !Object.values(c.tools).some(tool=>tool?.id===item.id) && !Object.values(c.equipment).some(gear=>gear?.id===item.id) && this.value(item)>0;
  };
  S.shop.saleQuote = function(selections, c = G.character()) {
    G.assert(Array.isArray(selections)&&selections.length>0&&selections.length<=c.inventory.length,'Select inventory items to sell.');
    const ids=new Set();let total=0,quantity=0;
    const rows=selections.map(selection=>{
      G.assert(selection&&typeof selection.id==='string'&&!ids.has(selection.id),'Select each item only once.');ids.add(selection.id);
      const item=c.inventory.find(i=>i.id===selection.id),count=selection.quantity;
      G.assert(this.canSell(item,c),'Only unlocked, unequipped inventory items can be sold.');
      G.assert(Number.isSafeInteger(count)&&count>0&&count<=(item.quantity||1),'Choose a valid sale quantity.');
      const unitPrice=this.value(item),price=unitPrice*count;
      G.assert(Number.isSafeInteger(price)&&price>0,'Invalid sale value.');total+=price;quantity+=count;
      return {id:item.id,quantity:count,unitPrice,total:price,item:G.clone(item)};
    });
    G.assert(Number.isSafeInteger(total)&&Number.isSafeInteger(quantity),'Invalid sale total.');
    return {characterId:c.id,rows,total,quantity};
  };
  S.shop.sellMany = function(selections, expected = null) {
    G.ensureIdle();
    G.assert(!S.tutorial?.active(), 'Finish the required tutorial before selling its materials.');
    const c=G.character(),quote=this.saleQuote(selections,c);
    G.assert(!expected||JSON.stringify(quote)===JSON.stringify(expected),'The selected items changed. Review the sale again.');
    G.assert(Number.isSafeInteger(c.coins+quote.total)&&c.coins+quote.total<=1e15,'Make room in your coin balance before selling.');
    // Validate the complete sale before removing any item or crediting coins.
    for(const row of quote.rows){
      const item=c.inventory.find(i=>i.id===row.id);
      if(item.kind==='stack'&&item.quantity>row.quantity)item.quantity-=row.quantity;
      else c.inventory.splice(c.inventory.indexOf(item),1);
    }
    c.coins+=quote.total;
    S.inventory.resolve();
    const first=quote.rows[0].item,name=first.kind==='stack'?D.catalog[first.key].name:S.items.name(first);
    G.notify('Sold '+quote.quantity+' '+(quote.rows.length===1?'× '+name:'items from '+quote.rows.length+' selections')+' for '+G.money(quote.total)+'.','success');
    return quote;
  };
  S.shop.sell = function(id, quantity = 1) { return this.sellMany([{id,quantity}]); };
})(RPG, RPG.data, RPG.systems);
