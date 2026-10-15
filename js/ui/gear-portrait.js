'use strict';
(function(G,D,S,U) {
  U.equippedPortrait=(c,large=false)=>{
    const gear=D.slots.map(slot=>c.equipment[slot]).filter(Boolean),rarity=Math.max(0,...gear.map(i=>i.rarity));
    const labels=D.slots.filter(slot=>c.equipment[slot]).map(slot=>slot+': '+U.itemName(c.equipment[slot])+' ('+D.rarity[c.equipment[slot].rarity]+')');
    return '<span class="equipped-portrait rarity-'+rarity+(large?' large':'')+'" role="img" aria-label="'+U.e(labels.join('; ')||'No equipment')+'" data-rarity="'+rarity+'">'+
      '<svg class="gear-avatar-base" viewBox="0 0 100 130" aria-hidden="true"><path d="M35 46 21 61 17 91l11 3 10-27-2 37 28 0-2-37 10 27 11-3-4-30-14-15Z" fill="#39313a" stroke="#a28d79"/><path d="m39 99-4 29h12l3-24 3 24h12l-4-29Z" fill="#282833"/><ellipse cx="50" cy="29" rx="13" ry="17" fill="#bba28a"/><path d="M37 27V14l13-7 13 7v13l-6-11-14 0Z" fill="#3b2c2c"/></svg>'+
      D.slots.map(slot=>{
        const item=c.equipment[slot];
        return item?'<span class="avatar-piece avatar-'+slot.toLowerCase()+' rarity-'+item.rarity+'" data-slot="'+slot+'" data-item="'+item.id+'" aria-hidden="true">'+U.itemArt(item)+'</span>':'';
      }).join('')+'<span class="gear-portrait-shine" aria-hidden="true"></span></span>';
  };
  U.gearPortrait=()=>{
    const c=G.character();
    U.modal('Your equipped gear','<div class="gear-portrait-preview">'+U.equippedPortrait(c,true)+'<div><h3>'+U.e(c.name)+'</h3><p class="notes">Your portrait wears your current equipment. Each piece carries its own rarity glow; the frame reflects your highest equipped rarity.</p></div></div><div class="modal-actions">'+U.btn('Close','closeModal','','quiet')+U.btn('Manage equipment','portraitEquipment','','gold-btn')+'</div>');
  };
  const itemArt=U.itemArt;
  U.itemArt=item=>{
    const info=item.kind==='stack'?D.catalog[item.key]:null,gem=info?.boxOnly?D.gems[info.type]:null;
    if(!gem)return itemArt(item);
    return '<span class="item-art unique-gem-art" data-art-key="'+item.key+'" style="--gem-color:'+gem.color+'" aria-hidden="true"><svg viewBox="0 0 100 100"><path d="M50 5 89 31 76 67 50 95 24 67 11 31Z" fill="#151b2b" stroke="currentColor" stroke-width="3"/><path d="M11 31h78L50 95 31 31 50 5 69 31 50 95" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="m50 29 17 13-17 19-17-19Z" fill="currentColor" opacity=".5"/><text x="50" y="52" text-anchor="middle" fill="#fff1d4" font-size="18" font-family="serif">'+D.roman[info.rank]+'</text><circle cx="50" cy="76" r="4" fill="currentColor"/></svg></span>';
  };
})(RPG,RPG.data,RPG.systems,RPG.ui);
