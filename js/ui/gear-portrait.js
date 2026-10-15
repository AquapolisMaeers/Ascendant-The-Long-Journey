'use strict';
(function(G,D,S,U) {
  U.equippedPortrait=(c,large=false)=>{
    const gear=D.slots.map(slot=>c.equipment[slot]).filter(Boolean),rarity=Math.max(0,...gear.map(i=>i.rarity));
    const labels=D.slots.filter(slot=>c.equipment[slot]).map(slot=>slot+': '+U.itemName(c.equipment[slot])+' ('+D.rarity[c.equipment[slot].rarity]+')');
    const scope='hero-'+c.id.replace(/[^a-z0-9-]/gi,'')+(large?'-large':'-small');
    const colors=['#81654f','#80583d','#a5b3bd','#8097a3','#929a82','#788c98','#5e8998','#574c70','#a08155','#738fa8','#759381','#bda572'];
    const mix=(hex,target,t)=>'#'+[1,3,5].map(k=>Math.round(parseInt(hex.slice(k,k+2),16)*(1-t)+target*t).toString(16).padStart(2,'0')).join('');
    const defs=D.slots.filter(slot=>c.equipment[slot]).map(slot=>{
      const item=c.equipment[slot],color=colors[item.tier];
      return '<linearGradient id="'+scope+'-'+slot+'" x1="0" y1="0" x2="1" y2=".7"><stop stop-color="'+mix(color,255,.48)+'"/><stop offset=".3" stop-color="'+color+'"/><stop offset=".65" stop-color="'+mix(color,0,.18)+'"/><stop offset="1" stop-color="'+mix(color,0,.55)+'"/></linearGradient>';
    }).join('');
    const part=(slot,paths)=>{
      const item=c.equipment[slot];if(!item)return '';
      return '<g class="avatar-piece avatar-'+slot.toLowerCase()+' rarity-'+item.rarity+'" data-slot="'+slot+'" data-item="'+U.e(item.id)+'" data-art-key="'+U.itemArtKey(item)+'" fill="url(#'+scope+'-'+slot+')">'+paths+
        (item.boss!==null&&slot==='Plate'?'<path class="model-inlay" d="M76 83 81 78 86 83 81 88Z"/>':'')+'</g>';
    };
    const weapon=c.equipment.Weapon;
    let weaponShape='';
    if(weapon?.style===1)weaponShape='<path d="M45 67Q8 126 45 183l4-3Q16 126 49 70Z"/><path class="model-string" d="m45 67-12 60 12 56M9 127h60"/><path class="model-edge" d="m63 123 8 4-8 4"/>';
    else if(weapon?.style===2)weaponShape='<path d="m121 151 6-108 4 0-5 108Z"/><path d="m117 40 12-17 12 17-12 16Z"/><path class="model-inlay" d="m123 39 6-8 6 8-6 9Z"/><path class="model-edge" d="M124 62h7m-8 9h7m-8 10h7"/>';
    else if(weapon)weaponShape='<path d="m29 118-6-68 6-15 8 14-2 69Z"/><path class="model-edge" d="m29 42 3 74"/><path d="m16 116 27-1 1 6-27 1Z"/><path d="m27 122 8-1 1 20-8 1Z"/><path d="m26 141 11-1 1 7-12 1Z"/>';
    return '<span class="equipped-portrait rarity-'+rarity+(large?' large':'')+'" role="img" aria-label="'+U.e(labels.join('; ')||'No equipment')+'" data-rarity="'+rarity+'">'+
      '<svg class="gear-avatar-base" viewBox="0 0 160 210" aria-hidden="true"><defs>'+defs+'<linearGradient id="'+scope+'-cloth"><stop stop-color="#62616c"/><stop offset="1" stop-color="#292936"/></linearGradient><linearGradient id="'+scope+'-skin"><stop stop-color="#d7bda0"/><stop offset="1" stop-color="#906e60"/></linearGradient></defs>'+
      '<ellipse cx="81" cy="199" rx="44" ry="7" fill="#060912" opacity=".6"/>'+
      '<g class="model-body" fill="url(#'+scope+'-cloth)" stroke="#111722" stroke-width="1.3" stroke-linejoin="round"><path d="m62 119-5 30 1 32 15 0 8-42 8 42 16-1-2-35-8-27Z"/>'+
      '<path d="M61 72 48 77 35 96 28 119l12 5 14-24 12-12ZM98 73l14 4 9 21 4 25-12 3-10-30-11-8Z"/>'+
      '<path d="M63 70 51 84 59 110 58 127 80 137 104 127 102 109 110 84 97 71 85 65 73 65Z"/>'+
      '<path fill="url(#'+scope+'-skin)" d="m74 54-2 17 12 9 8-11-7-17ZM27 116l-5 13 5 10 10-4 6-12ZM115 119l-3 15 6 5 10-9-3-10Z"/>'+
      '<path d="m58 176-4 14-10 6v4h30v-23ZM89 176v24h28v-5l-12-7-2-13Z" fill="#373039"/>'+
      '<path fill="url(#'+scope+'-skin)" d="M64 31c0-21 33-22 33 0l-1 12-5 12-12 7-13-10-4-16Z"/>'+
      '<path fill="#3a3034" d="m63 37-3-13 6-10 15-5 16 10 1 16-9-11-19 4-3 14Z"/>'+
      '<path d="m87 34 5 3-5 1m-14-3 5-1" fill="none" stroke="#29242c"/><path d="m87 40 4 6-6 0m-9 7 9-1" fill="none" stroke="#805e54"/></g>'+
      part('Greaves','<path d="m62 130 17 6-7 40-15 0 1-27ZM84 136l16-6 5 44-16 2-5-26Z"/><path class="model-facet" d="m62 134 9 6-6 32-4 0Zm29 7 6-5 5 34-6 2Z"/><path class="model-seam" d="m58 154 17 3m11-1 17-3"/>')+
      part('Boots','<path d="m57 173 17 2-2 23H46l-1-5 11-9ZM88 176l17-2 1 12 13 7-1 6H88Z"/><path class="model-facet" d="m59 177 8 1-2 10-15 7h-1l10-10Zm33 2 8-1 2 10 12 7H94Z"/><path class="model-seam" d="m55 184 16 2m19 0 14-2"/>')+
      part('Plate','<path d="m63 71 13 7 11 1 12-8 12 12-10 21 1 22-21 10-22-10 2-22-11-20Z"/><path d="m50 79-5 10 15 7 6-18-6-5Zm51-5-5 8 7 12 13-6-4-10Z"/><path class="model-facet" d="m65 80 11 5 4 44-15-7 1-23ZM89 84l8-5 5 14-8 11-2 22-8 4Z"/><path class="model-seam" d="m61 104 19 6 21-6m-39 11 18 6 21-6M80 83v45"/><path class="model-rivet" d="m52 83 2 1m53-2 2 1"/>')+
      part('Weapon',weaponShape)+
      part('Gloves','<path d="m28 114 15 7-5 10-4 4-9-2-4-5Z"/><path d="m113 117 13-1 4 13-6 7-9-3-3-6Z"/><path class="model-seam" d="m26 119 13 6m-15-1 12 6m79-6h11m-10 4h11"/>')+
      part('Necklace','<path class="model-chain" d="M68 75q12 27 26 0"/><path d="m81 91 5 5-5 6-5-6Z"/>')+
      part('Ring','<path class="model-chain" d="M25 129q5-5 10 0"/><path class="model-inlay" d="m29 126 3-2 2 3-2 2Z"/>')+
      part('Helmet','<path d="M61 34 63 22 76 15 90 18 99 28 100 46 92 53 89 35 75 33 69 45 62 47Z"/><path class="model-facet" d="m67 26 10-7 7 3-6 8-11 2ZM89 23l7 7 1 12-4 2-3-13Z"/><path class="model-seam" d="m63 34 12-5 15 2 9 9m-23-23 2 12"/><path class="model-visor" d="m70 38 20-2 1 5-14 2Z"/>')+
      '<path class="model-ground-light" d="M49 201h66"/></svg><span class="gear-portrait-shine" aria-hidden="true"></span></span>';
  };
  U.gearPortrait=()=>{
    const c=G.character();
    U.modal('Your equipped gear','<div class="gear-portrait-preview">'+U.equippedPortrait(c,true)+'<div><h3>'+U.e(c.name)+'</h3><p class="notes">A fitted character model wears your equipment with shared perspective and lighting. Materials follow the equipped gear tier; the frame and inlays reflect rarity.</p></div></div><div class="modal-actions">'+U.btn('Close','closeModal','','quiet')+U.btn('Manage equipment','portraitEquipment','','gold-btn')+'</div>');
  };
  const itemArt=U.itemArt;
  U.itemArt=item=>{
    const info=item.kind==='stack'?D.catalog[item.key]:null,gem=info?.boxOnly?D.gems[info.type]:null;
    if(!gem)return itemArt(item);
    return '<span class="item-art unique-gem-art" data-art-key="'+item.key+'" style="--gem-color:'+gem.color+'" aria-hidden="true"><svg viewBox="0 0 100 100"><path d="M50 5 89 31 76 67 50 95 24 67 11 31Z" fill="#151b2b" stroke="currentColor" stroke-width="3"/><path d="M11 31h78L50 95 31 31 50 5 69 31 50 95" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="m50 29 17 13-17 19-17-19Z" fill="currentColor" opacity=".5"/><text x="50" y="52" text-anchor="middle" fill="#fff1d4" font-size="18" font-family="serif">'+D.roman[info.rank]+'</text><circle cx="50" cy="76" r="4" fill="currentColor"/></svg></span>';
  };
})(RPG,RPG.data,RPG.systems,RPG.ui);
