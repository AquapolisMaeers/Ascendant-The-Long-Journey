'use strict';
(function(D) {
  D.shopTabs=['Utility','Materials','Exchange','Character','Storage','Sell'];
  D.materialKinds={ore:'Ore',logs:'Lumber',fish:'Raw fish',hide:'Hides'};
  D.shop=D.shop.filter(entry=>entry.category!=='Materials');
  D.tiers.forEach((level,tier)=>{
    const region=D.locations.findIndex(location=>location.max>=level),unlock=D.locations[region].level;
    for(const kind of [...D.resourceKinds,'fiber']) {
      const id=kind+':'+tier;
      D.shop.push({id,name:(kind==='fish'?'Raw ':'')+D.catalog[id].name,category:'Materials',tier,region,level:unlock,
        price:Math.ceil(10*Math.pow(level,1.75)),description:'Level '+level+' raw material. Premium supplies from '+D.locations[region].name+'. Gathering is the economical choice.'});
    }
  });
})(RPG.data);
