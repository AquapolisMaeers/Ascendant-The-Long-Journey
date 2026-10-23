'use strict';
(function(G,D,S,U) {
  const active=U.screens.Companions;
  const rates=d=>Object.entries(S.companions.rates(d)).map(([stat,value])=>'<span>+'+U.companionStatValue(stat,value)+' '+D.labels[stat]+' / level</span>').join('');
  const blocked=()=>{const c=G.character();return c.combat||c.activity||c.dungeon||S.tutorial.active();};
  U.screens.Companions=()=>{
    const c=G.character(),tabs=['Active','Stable','Adopt'],tab=tabs.includes(G.runtime.tab)?G.runtime.tab:'Active';S.emporium.normalize(c);
    const owned=[...new Set([...c.specialPets,...Object.keys(c.petStable),...(c.companion?[c.companion.type]:[])])];
    const navigation=U.tabs(tabs,tab),heading=U.heading('A FRIEND FOR THE ROAD','Companions','Keep a collection. Equip one companion for its bonuses.','<span class="badge">'+owned.length+' OWNED \u00b7 '+(c.companion?'1':'0')+' EQUIPPED</span>');
    if(tab==='Active') {
      if(!c.companion)return heading+navigation+'<section class="panel companion-empty"><h2>A place at your side.</h2><p class="notes spacer">Choose a companion from your stable, or adopt a new friend. Only the equipped companion grants bonuses and gains active XP. Every other companion keeps its progress in the stable.</p><div class="row spacer">'+U.btn('Open stable','tab','data-value="Stable"','gold-btn')+U.btn('Adopt a companion','tab','data-value="Adopt"','quiet')+'</div></section>';
      const html=active(),end=html.indexOf('<div class="grid-2">');
      return heading+navigation+html.slice(end).replace('Release companion','Return to stable');
    }
    if(G.runtime.petPageView!==tab){G.runtime.petPageView=tab;G.runtime.companionPage=0;}
    const entries=tab==='Stable'?D.allCompanions.filter(d=>owned.includes(d.id)):D.companions;
    const pages=Math.max(1,Math.ceil(entries.length/6)),page=Math.max(0,Math.min(pages-1,G.runtime.companionPage||0));
    const cards=entries.slice(page*6,page*6+6).map(d=>{
      const equipped=c.companion?.type===d.id,p=equipped?c.companion:c.petStable[d.id],collected=owned.includes(d.id);
      const care=p?S.companions.view(p,Date.now(),!equipped):null;
      return '<article class="panel pet-collection-card" data-pet="'+d.id+'">'+U.companionPortrait(d)+'<div class="pet-card-copy"><small class="eyebrow">'+(equipped?'EQUIPPED':collected?'IN YOUR STABLE':d.special?'SPECIAL':'ADOPTABLE')+'</small><h3>'+U.e(d.name)+'</h3><p class="pet-level">'+(collected?D.rarity[p?.ascensions||0]+' \u00b7 Level '+(p?.level||1)+(care&&!care.alive?' \u00b7 Needs revival':care&&!care.active?' \u00b7 Hungry':''):'Common \u00b7 Level 1')+'</p><div class="pet-card-rates">'+rates(d)+'</div></div><div class="pet-card-action">'+(tab==='Adopt'?'<span class="gold">'+G.money(d.price)+'</span>'+U.btn(collected?'Owned':'Adopt','adoptCompanion','data-type="'+d.id+'" '+(collected||blocked()||c.coins<d.price?'disabled':''),'gold-btn'):U.btn(equipped?'Equipped':'Equip companion','equipPet','data-id="'+d.id+'" '+(equipped||blocked()?'disabled':''),'quiet'))+'</div></article>';
    }).join('');
    return heading+navigation+'<p class="notes pet-collection-note">'+(tab==='Stable'?'Only your equipped companion grants bonuses. Switching preserves levels, XP and ascensions. Stored companions lose no hunger or vitality, even offline. Care resumes when equipped.':'Adopt one of each regular companion. New friends wait in your stable when another companion is equipped.')+'</p>'+(entries.length?'<div class="pet-collection-grid">'+cards+'</div>':'<section class="panel companion-empty"><h2>Your stable awaits.</h2><p class="notes spacer">Adopt a companion or discover one in a Companion Mystery Box.</p>'+U.btn('Adopt a companion','tab','data-value="Adopt"','gold-btn spacer')+'</section>')+(pages>1?'<div class="pet-pagination">'+U.btn('Previous','companionPage','data-page="'+(page-1)+'" '+(page===0?'disabled':''),'quiet small')+'<small>Page '+(page+1)+' / '+pages+'</small>'+U.btn('Next','companionPage','data-page="'+(page+1)+'" '+(page===pages-1?'disabled':''),'quiet small')+'</div>':'');
  };
})(RPG,RPG.data,RPG.systems,RPG.ui);
