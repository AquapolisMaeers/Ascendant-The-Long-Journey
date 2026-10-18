'use strict';
(function(G,D,S,U) {
  U.utilityShop=()=>{U.close();G.runtime.page='Shop';G.runtime.shopSection='general';G.runtime.tab='Utility';U.render();};
  U.resetBuild=key=>{
    G.ensureIdle(); const c=G.character();
    G.assert(['perk-reset','talent-reset'].includes(key),'Choose a reset item.');
    G.assert(!c.dungeon&&!S.tutorial.active(),'Finish the tutorial and leave the dungeon before resetting your build.');
    const perks=key==='perk-reset',spent=perks?Object.keys(c.perks).length:S.talents.spent(c),entry=D.shop.find(e=>e.id===key);
    G.assert(spent>0,perks?'No selected perks to reset.':'No spent talent points to reset.');
    const preview='<div class="reset-item-preview">'+U.paint(key)+'<div><h3>'+entry.name+'</h3><p>'+entry.description+'</p></div></div>';
    if(!S.inventory.available(key,c)) {
      U.modal(entry.name,preview+'<p class="notes spacer">You need one unlocked '+entry.name+'. Buy it under Shop → Utility for '+G.money(entry.price)+'.</p><div class="modal-actions">'+U.btn('Cancel','closeModal','','quiet')+U.btn('Visit Utility shop','utilityShop','','gold-btn')+'</div>');
      return;
    }
    U.confirm('Use '+entry.name+'?',preview+'<p class="spacer">Consume one item and refund '+spent+' '+(perks?'perk choices':'talent points')+'. '+(perks?'Your talent tree stays allocated.':'Your milestone perks stay selected.')+'</p>',()=>{
      G.assert(c===G.character(),'Your character changed. Review the reset again.');
      if(perks)S.character.resetPerks();else S.talents.reset();
      G.notify(perks?'Perks refunded. Choose again at your unlocked milestones.':'Talent points refunded. Choose your new path.','success');
    });
  };
  const item=U.item;
  U.item=id=>{
    item(id);const entry=S.items.find(id);
    if(['perk-reset','talent-reset'].includes(entry?.key))document.querySelector('.modal')?.insertAdjacentHTML('beforeend',
      '<div class="modal-actions">'+U.btn('Use '+D.catalog[entry.key].name,'useReset','data-key="'+entry.key+'" '+(entry.locked||G.character().combat||G.character().activity||G.character().dungeon||S.tutorial.active()?'disabled':''),'gold-btn')+'</div>');
  };
  const offers=U.shopOffers;
  U.shopOffers=(entries,current)=>{
    const html=offers(entries,current);if(current!=='Utility')return html;
    const template=document.createElement('template');template.innerHTML=html;
    for(const key of ['perk-reset','talent-reset'])template.content.querySelector('[data-shop-item="'+key+'"] .output-effects')?.remove();
    return template.innerHTML;
  };
  const icon=U.icon;
  U.icon=name=>{
    const enemy=G.character()?.combat?.enemy||G.character()?.encounter?.enemy;
    if(name==='creature'&&enemy?.type==='boss'&&D.dungeonArt[enemy.boss])return '<img class="icon portrait-art dungeon-boss-art" src="assets/art/journey/boss-'+D.dungeonArt[enemy.boss]+'.png" alt="'+U.e(enemy.name)+'" decoding="async">';
    return icon(name);
  };
  const mood=[
    'Chains stir beyond the torchlight. The keep is listening.',
    'Thunder rolls through empty halls. Something waits behind the gate.',
    'The stone burns beneath your feet. Each breath tastes of ash.',
    'Shattered stars drift overhead. A fallen crown still commands them.',
    'The last throne stands in darkness. Its king has not forgotten you.'
  ];
  const world=U.screens.World;
  U.screens.World=()=>{
    const html=world(),c=G.character();if(!c.dungeon)return html;
    const template=document.createElement('template');template.innerHTML=html;
    const screen=template.content.querySelector('.world-screen'),heading=screen?.querySelector('.page-heading');
    screen?.classList.add('dungeon-view');screen?.setAttribute('data-dungeon',c.dungeon.id);
    screen?.querySelector('.phone-food-setup')?.removeAttribute('open');
    heading?.querySelector('[data-action="locations"]')?.remove();
    if(heading){heading.querySelector('h1').textContent=D.dungeons[c.dungeon.id].name;heading.querySelector('p').textContent='A continuous descent. Prepare between rooms.';
      heading.insertAdjacentHTML('afterend','<div class="dungeon-mood"><span class="dungeon-flame" aria-hidden="true">◆</span><p>'+mood[c.dungeon.id]+'</p><small>ROOM '+c.dungeon.room+' / 5</small></div>');}
    return template.innerHTML;
  };
  window.addEventListener('rpg:rendered',()=>{
    const content=document.getElementById('content'),c=G.character();
    if(content&&G.runtime.page==='World'&&c?.dungeon)content.style.setProperty('--dungeon-backdrop','url("'+new URL('assets/art/journey/dungeon-'+D.dungeonArt[c.dungeon.id]+'.png',document.baseURI).href+'")');
    else content?.style.removeProperty('--dungeon-backdrop');
  });
  const crafting=U.screens.Crafting;
  U.screens.Crafting=()=>{
    const html=crafting();if(G.runtime.tab&&G.runtime.tab!=='Smithing')return html;
    const category=G.runtime.smithingCategory;
    if(category!=='Armor') {
      if(category!=='Leather & cloth')return html;
      const template=document.createElement('template');template.innerHTML=html;
      const tier=template.content.querySelector('#craft-tier');if(tier)tier.parentElement.firstChild.textContent='Material tier';
      template.content.querySelector('.toolbar')?.insertAdjacentHTML('afterend','<p class="notes armour-material-help">Cure hides with logs for ranger leather. Weave fibres harvested with Farming into mage fabric. Choose Armor to craft the finished pieces.</p>');
      return template.innerHTML;
    }
    const className=D.classes.includes(G.runtime.armorClass)?G.runtime.armorClass:G.character().class;
    const template=document.createElement('template');template.innerHTML=html;
    const toolbar=template.content.querySelector('.toolbar');
    toolbar?.querySelector('.smithing-filter')?.insertAdjacentHTML('afterend','<label>Armour class<select id="armor-class">'+D.classes.map(name=>'<option value="'+name+'" '+(name===className?'selected':'')+'>'+({Warrior:'Warrior · plate',Archer:'Ranger · leather',Mage:'Mage · cloth'}[name])+'</option>').join('')+'</select></label>');
    const tier=template.content.querySelector('#craft-tier');
    if(tier){tier.parentElement.firstChild.textContent='Material tier';for(const option of tier.options)option.textContent='Level '+D.tiers[+option.value];}
    toolbar?.insertAdjacentHTML('afterend','<p class="notes armour-material-help">'+(className==='Warrior'?'Plate uses regional bars and hides.':className==='Archer'?'Leather armour uses cured regional leather and wooden fittings. Cure hides under Leather & cloth.':'Cloth armour uses regional fabric and fibre. Harvest fibres with Farming, then weave fabric under Leather & cloth.')+'</p>');
    return template.innerHTML;
  };
  const skills=U.screens.Skills;
  U.screens.Skills=()=>skills().replace('<div class="grid-3 spacer skills-grid">','<p class="notes armour-material-help">Farming harvests textile fibres with Pruning Shears. Refine fibres into cloth and hides into leather under Crafting → Smithing → Leather & cloth.</p><div class="grid-3 spacer skills-grid">');
  const summary=U.itemSummary;
  U.itemSummary=entry=>{
    const info=entry.kind==='stack'?D.catalog[entry.key]:null;
    return info?.kind==='fiber'?'Harvested with Farming. Weave fabric under Smithing → Leather & cloth.':info?.kind==='leather'?'Cured from regional hides. Used to craft and upgrade ranger armour.':info?.kind==='cloth'?'Woven from regional fibres. Used to craft and upgrade mage armour.':summary(entry);
  };
})(RPG,RPG.data,RPG.systems,RPG.ui);
