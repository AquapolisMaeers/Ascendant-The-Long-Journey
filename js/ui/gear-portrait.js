'use strict';
(function(G,D,S,U) {
  U.equippedPortrait=c=>U.characterPortrait(c.class,c.appearance);
  U.gearPortrait=()=>U.customize();
  const itemArt=U.itemArt;
  U.itemArt=item=>{
    const info=item.kind==='stack'?D.catalog[item.key]:null,gem=info?.boxOnly?D.gems[info.type]:null;
    if(!gem)return itemArt(item);
    return '<span class="item-art unique-gem-art" data-art-key="'+item.key+'" style="--gem-color:'+gem.color+'" aria-hidden="true"><svg viewBox="0 0 100 100"><path d="M50 5 89 31 76 67 50 95 24 67 11 31Z" fill="#151b2b" stroke="currentColor" stroke-width="3"/><path d="M11 31h78L50 95 31 31 50 5 69 31 50 95" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="m50 29 17 13-17 19-17-19Z" fill="currentColor" opacity=".5"/><text x="50" y="52" text-anchor="middle" fill="#fff1d4" font-size="18" font-family="serif">'+D.roman[info.rank]+'</text><circle cx="50" cy="76" r="4" fill="currentColor"/></svg></span>';
  };
})(RPG,RPG.data,RPG.systems,RPG.ui);
