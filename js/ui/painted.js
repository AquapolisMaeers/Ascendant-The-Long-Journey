'use strict';
(function(G,D,S,U) {
  const itemArtKey=U.itemArtKey;
  U.itemArtKey=item=>item.kind==='gear'&&['Mage','Archer'].includes(item.armorClass)&&D.armorSlots.includes(item.slot||D.pieces[item.piece])?
    'class-gear:'+item.armorClass+':'+(item.boss==null?item.tier:12+item.boss)+':'+item.piece:itemArtKey(item);
  const summary=U.itemSummary;
  U.itemSummary=entry=>{
    const info=entry.kind==='stack'?D.catalog[entry.key]:null;
    return info?.kind==='fiber'?'Find crop patches by Advancing in World. Requires Farming Level '+D.tiers[info.tier]+'. Use Pruning Shears to harvest crops. Weave fabric under Smithing → Leather & cloth.':summary(entry);
  };
})(RPG,RPG.data,RPG.systems,RPG.ui);
