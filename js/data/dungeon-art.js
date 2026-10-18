'use strict';
(function(D) {
  D.dungeonArt=['ironblood','bastion','crucible','starfallen','dominion'];
  for(const id of ['perk-reset','talent-reset']) D.itemIllustrations[id]={file:'assets/art/journey/'+id+'.png',index:0,columns:1,rows:1,version:'discipline-1',name:D.shop.find(e=>e.id===id).name};
  for(const kind of ['fiber','leather','cloth']) D.tiers.forEach((_,tier)=>{
    D.itemIllustrations[kind+':'+tier]={file:'assets/art/items/'+kind+'.svg',index:0,columns:1,rows:1,version:'discipline-1',name:D.resources[kind][tier]};
  });
})(RPG.data);
