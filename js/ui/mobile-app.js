'use strict';
(function(G,D,S,U) {
  // A separate phone composition; the desktop renderers are left intact.
  const views=[['explore','World','Explore'],['supplies','fountain','Supplies'],['auto','clock','Auto']];
  U.mobileWorldView=view=>{
    if(!U.isPhone()||!views.some(([id])=>id===view))return;
    G.runtime.mobileWorldView=view;
    U.render();
    document.querySelector('.mobile-world-tabs')?.scrollIntoView({block:'start',behavior:'instant'});
  };
  const world=U.screens.World;
  U.screens.World=()=>{
    const html=world();if(!U.isPhone())return html;
    const c=G.character(),loc=D.locations[c.location],tutorial=S.tutorial.active(),template=document.createElement('template');
    template.innerHTML=html;
    if(G.runtime.mobileWorldCharacter!==c.id){G.runtime.mobileWorldCharacter=c.id;G.runtime.mobileWorldView='explore';}
    const view=c.combat?'explore':G.runtime.mobileWorldView||'explore';
    const take=selector=>{const node=template.content.querySelector(selector);return node?.outerHTML||'';};
    const screen=template.content.querySelector('.world-screen'),room=take('.world-main > .panel:has(.room-track)'),mood=take('.dungeon-mood');
    const encounter=take('.encounter'),preview=take('.preview'),food=template.content.querySelector('.food-panel');
    const fire=template.content.querySelector('.rest-panel');
    if(fire){
      fire.classList.add('mobile-campfire');
      const button=fire.querySelector('#rest-button'),time=fire.querySelector('#rest-time');
      fire.innerHTML='<div class="mobile-fire-icon" aria-hidden="true">'+U.icon('fountain')+'</div><div class="mobile-fire-copy"><h3>Campfire</h3><small>Free full healing <span aria-hidden="true">/</span> '+(time?.outerHTML||'Ready')+'</small></div>'+(button?.outerHTML||'');
      const next=fire.querySelector('#rest-button');if(next)next.textContent='Rest';
      if(c.dungeon)fire.insertAdjacentHTML('beforeend','<small class="mobile-fire-reason">Campfire is available outside the dungeon.</small>');
      else if(c.activity&&!S.afk.run)fire.insertAdjacentHTML('beforeend','<small class="mobile-fire-reason">Finish or stop your activity to rest.</small>');
    }
    const travel=!c.dungeon?U.btn(U.icon('World')+'<span>Travel</span>','locations',tutorial?'disabled':'','quiet small'):'';
    const title=c.dungeon?D.dungeons[c.dungeon.id].name:loc.name;
    const header='<header class="mobile-region page-heading"><div><span class="eyebrow">'+(c.dungeon?'DUNGEON / ROOM '+c.dungeon.room+' OF 5':'YOUR JOURNEY / REGION '+(loc.id+1))+'</span><h1>'+U.e(title)+'</h1><p>Enemies level '+loc.level+(loc.max!==loc.level?' - '+loc.max:'')+'</p></div><div class="row">'+travel+'</div></header>';
    const tabs='<nav class="mobile-world-tabs" role="tablist" aria-label="Journey controls">'+views.map(([id,icon,label])=>'<button type="button" id="mobile-world-tab-'+id+'" role="tab" aria-controls="mobile-world-'+id+'" aria-selected="'+(view===id)+'" data-action="mobileWorldView" data-view="'+id+'">'+U.icon(icon)+'<span>'+label+'</span></button>').join('')+'</nav>';
    const section=(id,body)=>'<section id="mobile-world-'+id+'" class="mobile-world-view" role="tabpanel" aria-labelledby="mobile-world-tab-'+id+'" '+(view!==id?'hidden':'')+'>'+body+'</section>';
    const supplies=food?'<details class="phone-fold phone-food-setup" data-section="food-setup" open><summary>'+U.icon('food')+'<span>Food & Auto-Eat</span><small>PREPARE</small></summary>'+food.outerHTML+'</details>':'';
    const quick='<div class="mobile-prepare-row">'+U.btn(U.icon('food')+'Food & Auto-Eat','mobileWorldView','data-view="supplies"','quiet small')+U.btn(U.icon('clock')+(S.afk.run?'AFK running':'Auto advancing'),'mobileWorldView','data-view="auto"','quiet small')+'</div>';
    const notes='<details class="mobile-road-notes"><summary>About this region & defeat rules</summary><p>'+U.e(loc.description)+'</p><p>Material levels: '+S.world.materialTiers(c.location).map(t=>D.tiers[t]).join(', ')+'.</p>'+take('.death-risk')+'</details>';
    const auto=take('.afk-panel')+'<section class="panel mobile-training"><h3>Train while away</h3><p class="notes">Choose an offline skill in Skills. Active auto advancing needs this tab to stay visible.</p>'+U.btn('Offline training','navigate','data-value="Skills"','quiet wide')+'</section>';
    // Combat keeps one prominent Eat control in the shared bottom dock.
    const body=c.combat?room+encounter+take('.phone-combat-food'):
      (fire?.outerHTML||'')+tabs+section('explore',room+mood+quick+encounter+preview+notes)+
      section('supplies','<div class="mobile-section-heading"><h2>Prepare for the road</h2><p>Assign food, set Auto-Eat or pay for healing.</p></div>'+supplies+take('.inn-panel'))+section('auto',auto);
    return '<div class="world-screen mobile-world '+(c.combat?'combat-view ':'')+(screen?.classList.contains('dungeon-view')?'dungeon-view':'')+'"'+(c.dungeon?' data-dungeon="'+c.dungeon.id+'"':'')+'>'+header+'<div class="world-grid"><div class="world-main">'+body+'</div></div></div>';
  };
  U.mobileMenu=()=>{
    if(!U.isPhone()||!G.character()||G.runtime.selecting)return;
    const c=G.character(),groups=[['Adventure',['World','Quests']],['Your adventurer',['Character','Inventory','Skills','Crafting','Companions']],['Trade',['Shop',...(S.market.allowed()?['Marketplace']:[])]],['Community',['Community','Colosseum']],['Records & settings',['Achievements','Leaderboards','Settings']]];
    document.querySelector('.phone-nav [data-action="mobileMenu"]')?.setAttribute('aria-expanded','true');
    U.modal('Your journey','<div class="phone-menu"><div class="phone-menu-profile">'+U.characterPortrait(c.class,c.appearance)+'<div><strong>'+U.e(c.name)+'</strong><small>Level '+c.level+' / '+c.class+' / '+c.mode+'</small></div></div>'+groups.map(([name,pages])=>'<section class="mobile-menu-group"><h3>'+name+'</h3><nav class="phone-menu-grid" aria-label="'+name+'">'+pages.map(page=>'<button type="button" data-action="navigate" data-value="'+page+'" '+(G.runtime.page===page?'class="active" aria-current="page"':'')+'>'+U.icon(page)+'<span>'+page+'</span></button>').join('')+'</nav></section>').join('')+'<div class="phone-menu-foot">'+U.btn('Character slots','slots','','quiet')+'<span>LOCAL SAVE / '+U.e(G.save.status)+'</span></div></div>');
  };
  const shell=U.shell;
  U.shell=()=>{
    const html=shell();if(!U.isPhone()||!G.character()||G.runtime.selecting||G.runtime.loadFailure)return html;
    const template=document.createElement('template');template.innerHTML=html;
    const nav=template.content.querySelector('.phone-nav'),food=template.content.querySelector('.phone-combat-food'),dock=template.content.querySelector('.activity-dock');
    const primary=[['World','Journey'],['Character','Hero'],['Inventory','Bag'],['Crafting','Craft']];
    nav.innerHTML=primary.map(([page,label])=>'<button type="button" data-action="navigate" data-value="'+page+'" '+(G.runtime.page===page?'class="active" aria-current="page"':'')+'>'+U.icon(page)+'<span>'+label+'</span></button>').join('')+'<button type="button" data-action="mobileMenu" aria-haspopup="dialog" aria-expanded="'+!!document.querySelector('.phone-menu')+'" aria-label="More pages" '+(!primary.some(([page])=>page===G.runtime.page)?'class="active"':'')+'>'+U.icon('Menu')+'<span>More</span></button>';
    const footer=document.createElement('footer');footer.className='mobile-bottom';footer.id='mobile-bottom';footer.setAttribute('aria-label','Mobile controls');
    if(food)footer.append(food);
    if(dock){
      const c=G.character(),host=template.content.querySelector('#mobile-world-explore');
      if(G.runtime.page==='World'&&host){
        dock.hidden=!(c.activity&&c.activity.type!=='advance'||S.afk.run&&!c.activity);
        dock.classList.add('mobile-inline-activity');
        const quick=host.querySelector('.mobile-prepare-row');if(quick)quick.after(dock);else host.prepend(dock);
      }else footer.append(dock);
    }
    footer.append(nav);template.content.append(footer);
    return template.innerHTML;
  };
  const live=U.live;
  U.live=()=>{
    live();if(!U.isPhone())return;
    const c=G.character(),button=document.querySelector('.mobile-campfire #rest-button');
    if(button&&c)button.textContent=c.hp>=S.character.stats(c).health?'Full health':Date.now()<(c.restReadyAt||0)?'Cooling down':!S.recovery.canRest(c)?'Unavailable':'Rest';
  };
  const observer=new ResizeObserver(entries=>{
    for(const {target} of entries)if(target.id==='mobile-bottom')document.body.style.setProperty('--mobile-bottom-height',Math.ceil(target.getBoundingClientRect().height)+'px');
  });
  let watched;
  const loot=document.getElementById('loot-popup');
  const measureLoot=()=>{
    document.body.classList.toggle('has-phone-loot',!loot.hidden);
    document.body.style.setProperty('--phone-loot-height',Math.ceil(loot.getBoundingClientRect().height)+'px');
  };
  new ResizeObserver(measureLoot).observe(loot);
  new MutationObserver(measureLoot).observe(loot,{attributes:true,attributeFilter:['hidden']});
  window.addEventListener('rpg:rendered',()=>{
    const footer=document.getElementById('mobile-bottom');
    if(footer!==watched){observer.disconnect();if(footer)observer.observe(footer);watched=footer;}
    if(footer)document.body.style.setProperty('--mobile-bottom-height',Math.ceil(footer.getBoundingClientRect().height)+'px');
    else document.body.style.removeProperty('--mobile-bottom-height');
    document.body.classList.toggle('mobile-app',U.isPhone()&&!G.runtime.selecting&&!!G.character());
  });
})(RPG,RPG.data,RPG.systems,RPG.ui);
