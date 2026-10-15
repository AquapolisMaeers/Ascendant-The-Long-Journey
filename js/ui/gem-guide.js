'use strict';
(function(G,D,S,U) {
  U.gemGuide=()=>{
    const back=G.runtime.modalItem;
    U.modal('Gems, explained','<p class="notes">Socket gems into unlocked equipment sockets. Roman numerals I\u2013V mean ranks 1\u20135: each rank adds another base bonus. Chance bonuses add percentage points; damage, defence and health percentages add to their matching bonus pool. Normal combat caps still apply.</p><div class="gem-handbook spacer">'+D.gems.map((gem,type)=>{
      const slots=D.slots.filter(slot=>D.gemAllowed[slot].includes(type));
      return '<details><summary><strong>'+U.e(gem.name)+'</strong><span>+'+U.statValue(gem.stat,gem.value)+' \u2192 +'+U.statValue(gem.stat,gem.value*5)+' '+D.labels[gem.stat]+'</span></summary><p>'+U.e(D.gemDescriptions[gem.stat])+'</p><p><strong>Fits:</strong> '+slots.join(', ')+(gem.style===undefined?'':' \u00b7 '+D.classes[gem.style]+' weapons only')+'</p><small>'+(gem.boxOnly?'Gem Mystery Box exclusive. No Faceting or fusion recipe.':'Found through normal loot and Faceting, or the Gem Mystery Box.')+'</small></details>';
    }).join('')+'</div><div class="modal-actions">'+(back?U.btn('Back to equipment','gemGuideBack','data-id="'+U.e(back)+'"','quiet'):'')+U.btn('Done','closeModal','','gold-btn')+'</div>',true);
  };
  const inventory=U.screens.Inventory;
  U.screens.Inventory=()=>{
    const html=inventory();
    return G.runtime.tab==='Gems'?html.replace('<span class="badge">',U.btn('Gem guide','gemGuide','','small quiet')+'<span class="badge">'):html;
  };
  const itemDialog=U.item;
  U.item=id=>{
    itemDialog(id);
    const first=document.querySelector('.modal .socket-row');
    if(first)first.insertAdjacentHTML('beforebegin','<div class="socket-help"><p>Only gems compatible with this equipment appear below.</p>'+U.btn('Gem guide','gemGuide','','quiet small')+'</div>');
  };
})(RPG,RPG.data,RPG.systems,RPG.ui);
