'use strict';
(function(G,D,S,U) {
  U.profilePortrait=(c,appearance=c.appearance)=>{
    const portrait=U.characterPortrait(c.class,appearance),aura=D.regalia.find(entry=>entry.kind==='aura'&&entry.id===c.regalia?.aura&&c.regalia.owned.includes(entry.id));
    if(!aura)return portrait;
    return '<span class="character-portrait aura-profile" data-aura="'+U.e(aura.id)+'" style="--profile-aura:'+aura.color+'" role="img" aria-label="'+U.e(c.name+' · '+aura.name)+'"><span class="profile-aura-backdrop" aria-hidden="true">'+U.paint('regalia:'+aura.id)+'</span><span class="profile-aura-character" aria-hidden="true">'+portrait+'</span></span>';
  };
  U.equippedPortrait=c=>U.profilePortrait(c);
  U.gearPortrait=()=>U.customize();
})(RPG,RPG.data,RPG.systems,RPG.ui);
