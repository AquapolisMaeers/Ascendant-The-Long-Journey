'use strict';
(function(G,D,S,U) {
  U.equippedPortrait=(c,large=false)=>{
    const gear=D.slots.map(slot=>c.equipment[slot]).filter(Boolean),rarity=Math.max(0,...gear.map(i=>i.rarity));
    const labels=D.slots.filter(slot=>c.equipment[slot]).map(slot=>slot+': '+U.itemName(c.equipment[slot])+' ('+D.rarity[c.equipment[slot].rarity]+')');
    const equipment=Object.fromEntries(D.slots.filter(slot=>c.equipment[slot]).map(slot=>{
      const i=c.equipment[slot];return [slot,{tier:i.tier,rarity:i.rarity,style:i.style,boss:i.boss,id:i.id,name:S.items.name(i)}];
    }));
    return '<span class="equipped-portrait rarity-'+rarity+(large?' large':'')+'" role="img" aria-label="'+U.e(labels.join('; ')||'Adventurer without equipment')+'" data-rarity="'+rarity+'"><canvas class="gear-avatar-base" width="'+(large?600:120)+'" height="'+(large?840:168)+'" data-hero-model="'+U.e(JSON.stringify({equipment,color:c.appearance?.color||'#414756'}))+'" '+(large?'tabindex="0" aria-label="Rotate character with left and right arrow keys; Home resets the view"':'aria-hidden="true"')+'>Your equipped character model</canvas><span class="gear-portrait-shine" aria-hidden="true"></span></span>';
  };
  U.gearPortrait=()=>{
    const c=G.character();
    U.modal('Your equipped gear','<div class="gear-portrait-preview"><div class="hero-stage">'+U.equippedPortrait(c,true)+'<div class="model-controls"><button type="button" class="btn quiet" data-model-turn="-.35" aria-label="Rotate left">&#8592;</button><button type="button" class="btn quiet" data-model-turn="reset">Reset view</button><button type="button" class="btn quiet" data-model-turn=".35" aria-label="Rotate right">&#8594;</button></div><small>Drag to rotate &middot; Arrow keys also work</small></div><div class="hero-details"><div class="eyebrow">EQUIPPED / '+U.e(c.class.toUpperCase())+'</div><h3>'+U.e(c.name)+'</h3><p class="notes spacer">Your equipment, fitted to your adventurer. Turn the model to inspect every piece.</p><div class="hero-slot-list spacer">'+D.slots.map(slot=>{const i=c.equipment[slot];return '<div><small>'+slot+'</small><span class="'+(i?'rarity-'+i.rarity+' rarity-text':'notes')+'">'+(i?U.e(U.itemName(i)):'Unequipped')+'</span></div>';}).join('')+'</div></div></div><div class="modal-actions">'+U.btn('Close','closeModal','','quiet')+U.btn('Manage equipment','portraitEquipment','','gold-btn')+'</div>');
    U.hero3d.hydrate();
  };
  const itemArt=U.itemArt;
  U.itemArt=item=>{
    const info=item.kind==='stack'?D.catalog[item.key]:null,gem=info?.boxOnly?D.gems[info.type]:null;
    if(!gem)return itemArt(item);
    return '<span class="item-art unique-gem-art" data-art-key="'+item.key+'" style="--gem-color:'+gem.color+'" aria-hidden="true"><svg viewBox="0 0 100 100"><path d="M50 5 89 31 76 67 50 95 24 67 11 31Z" fill="#151b2b" stroke="currentColor" stroke-width="3"/><path d="M11 31h78L50 95 31 31 50 5 69 31 50 95" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="m50 29 17 13-17 19-17-19Z" fill="currentColor" opacity=".5"/><text x="50" y="52" text-anchor="middle" fill="#fff1d4" font-size="18" font-family="serif">'+D.roman[info.rank]+'</text><circle cx="50" cy="76" r="4" fill="currentColor"/></svg></span>';
  };
})(RPG,RPG.data,RPG.systems,RPG.ui);
