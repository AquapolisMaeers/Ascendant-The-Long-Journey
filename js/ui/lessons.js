'use strict';
(function(G,D,S,U) {
  U.tutorialDirections=step=>{
    const route=step.route,phone=U.isPhone(),quick={World:'Journey',Character:'Hero',Inventory:'Bag',Crafting:'Craft'}[route.page];
    return '<section class="tutorial-route spacer"><h3>How to get there</h3><ol><li>'+U.e(phone?(quick?'Tap '+quick+' in the bottom navigation.':'Tap More in the bottom navigation, then choose '+route.page+'.'):'Click '+route.page+' in the left navigation.')+'</li>'+route.steps.map(text=>'<li>'+U.e(text)+'</li>').join('')+'</ol></section>';
  };
  U.guidePanel=()=>{
    if(!S.tutorial.active())return '';
    const c=G.character(),step=S.tutorial.current(),world=G.runtime.page==='World',gather=D.gatheringSkills.includes(step.id);
    let label='Show directions',action='tutorialLesson';
    if(world&&(gather||step.id==='fight')) {
      label=c.encounter?(gather?'Gather '+step.title+' resources':'Fight Level 1 creature'):'ADVANCE';
      action=c.encounter?(gather?'tutorialGather':'tutorialFight'):'tutorialAdvance';
    }
    if(['preferences','offline','afk','recovery','prefixes','ready'].includes(step.id))label='Read lesson';
    return '<section class="panel guide-panel" aria-label="Tutorial lesson"><div class="row between"><span class="eyebrow">REQUIRED TUTORIAL '+(c.guide.step+1)+' / '+D.tutorial.steps.length+'</span><span class="tutorial-path">'+U.e(step.route.page+(step.route.tab?' / '+step.route.tab:''))+'</span></div><h3>'+step.title+'</h3><p class="notes">'+step.text+'</p><div class="row spacer">'+U.btn(label,action,(c.activity||c.combat||c.pending.length?'disabled':''),'gold-btn')+(action!=='tutorialLesson'?U.btn('How to get there','tutorialLesson','','quiet small'):'')+'</div></section>';
  };
  U.craftControls=r=>{
    const c=G.character(),selected=G.runtime.craftQuantities?.[c.id]?.[r.id],max=Math.min(1000000,S.crafting.max(r)),busy=c.activity||c.combat||c.pending.length;
    const verb=r.skill==='Cooking'?'Cook':r.skill==='Smithing'?(r.output?.startsWith('cloth:')?'Weave':r.output?.startsWith('leather:')?'Cure':'Smith'):r.rank?'Fuse':'Cut';
    const locked=c.skills[r.skill].level<r.level||!S.items.usableTool(c,r.skill)||(r.skill==='Faceting'&&c.tools.Faceting.rarity<D.facet.chisel[r.rank]);
    return '<div class="recipe-actions"><div class="craft-quantities" role="group" aria-label="Select '+U.e(r.name)+' quantity">'+[1,5,10,'max'].map(n=>U.btn(String(n).toUpperCase(),'craftQuantity','data-id="'+r.id+'" data-quantity="'+n+'" aria-pressed="'+(selected===(n==='max'?max:n))+'" '+(busy||max<(n==='max'?1:n)?'disabled':''),'small quiet')).join('')+'</div>'+U.btn(verb+(selected?' ('+selected+')':''),'craft','data-id="'+r.id+'" '+(!selected||selected>max||busy||locked?'disabled':''),'primary craft-start')+'</div>';
  };
  U.selectCraftQuantity=(id,value)=>{
    const r=D.recipes.find(r=>r.id===id);G.assert(r,'Choose a recipe.');
    const n=value==='max'?Math.min(1000000,S.crafting.max(r)):Number(value);
    G.assert(Number.isSafeInteger(n)&&n>0&&n<=S.crafting.max(r),'Choose a quantity your unlocked ingredients can make.');
    const c=G.character();G.runtime.craftQuantities??={};(G.runtime.craftQuantities[c.id]??={})[id]=n;U.render();
  };

  // Draw above the interface so highlights also work inside scrolling panels
  // and fixed phone navigation, without changing the controls' stacking order.
  const visible=el=>el&&el.getClientRects().length&&getComputedStyle(el).visibility!=='hidden';
  const find=(selector,root=document)=>[...root.querySelectorAll(selector)].filter(visible);
  const action=(name,extra='')=>'[data-action="'+name+'"]'+extra;
  U.tutorialTargets=()=>{
    const c=G.character(),step=S.tutorial.current();
    if(!step||G.runtime.selecting)return [];
    const modal=document.querySelector('.modal');
    if(modal){
      const menu=find('.phone-menu '+action('navigate','[data-value="'+step.route.page+'"]'));
      if(menu.length)return menu;
      for(const name of ['confirm','enhanceConfirm','tutorialAcknowledge','equip','enhance','closeModal']){
        const controls=find(action(name)+':not(:disabled)',modal);
        if(controls.length)return controls;
      }
      return [];
    }
    if(c.activity||c.combat||c.pending.length)return [];
    const route=step.route;
    if(G.runtime.page!==route.page){
      const nav=find(action('navigate','[data-value="'+route.page+'"]'));
      return nav.length?nav:find('.phone-nav '+action('mobileMenu'));
    }
    const tab=G.runtime.tab||(route.page==='Skills'?'Disciplines':route.page==='Character'||route.page==='Inventory'?'Equipment':route.page==='Crafting'?'Smithing':'');
    if(route.tab&&tab!==route.tab)return find('.tabs '+action('tab','[data-value="'+route.tab+'"]'));
    if(step.id==='perk')return find(action('perk','[data-level="1"]'));
    if(D.gatheringSkills.includes(step.id)||step.id==='fight')return find('.guide-panel '+action(c.encounter?(step.id==='fight'?'tutorialFight':'tutorialGather'):'tutorialAdvance'));
    if(['cook:0','bar:0','facet'].includes(step.id)){
      const type=D.classes.indexOf(c.class),id=step.id==='facet'?'facet:'+type+':0':step.id;
      if(step.id==='facet'&&+document.getElementById('gem-filter')?.value!==type)return find('#gem-filter');
      if(step.id!=='facet'&&+document.getElementById('craft-tier')?.value!==0)return find('#craft-tier');
      if(step.id==='bar:0'&&document.getElementById('smithing-category')?.value!=='Materials')return find('#smithing-category');
      const selected=G.runtime.craftQuantities?.[c.id]?.[id];
      return find(selected?action('craft','[data-id="'+id+'"]'):action('craftQuantity','[data-id="'+id+'"][data-quantity="'+(step.id==='cook:0'?5:1)+'"]'));
    }
    if(step.id==='enhance'||step.id==='equip')return find(action('item','[data-id="'+(step.id==='enhance'?c.guide.weaponId:c.guide.plateId)+'"]')).slice(0,1);
    return find('.guide-panel '+action('tutorialLesson'));
  };
  let frame=0,signature='',lastTarget='';
  const updateSpotlight=()=>{
    frame=0;
    let overlay=document.getElementById('tutorial-spotlight');
    if(!S.tutorial.active()||G.runtime.selecting){overlay?.remove();signature='';lastTarget='';return;}
    if(!overlay){
      overlay=document.createElementNS('http://www.w3.org/2000/svg','svg');
      overlay.id='tutorial-spotlight';overlay.setAttribute('aria-hidden','true');
      document.body.append(overlay);
    }
    const targets=U.tutorialTargets(),modal=document.querySelector('.modal');
    const key=[G.character().id,G.character().guide.step,G.runtime.page,G.runtime.tab,!!modal,targets.map(el=>el.outerHTML).join('')].join('|');
    if(targets.length&&key!==lastTarget&&!modal){
      const r=targets[0].getBoundingClientRect();
      if(r.top<0||r.bottom>innerHeight||r.left<0||r.right>innerWidth)targets[0].scrollIntoView({block:'center',inline:'nearest',behavior:'instant'});
    }
    lastTarget=key;
    const box=(el,pad)=>{
      const r=el.getBoundingClientRect();
      // Respect scrolling containers: never cut holes over clipped controls.
      let left=Math.max(0,r.left),top=Math.max(0,r.top),right=Math.min(innerWidth,r.right),bottom=Math.min(innerHeight,r.bottom);
      for(let p=el.parentElement;p&&p!==document.body;p=p.parentElement){
        const style=getComputedStyle(p),b=p.getBoundingClientRect();
        if(/auto|scroll|hidden|clip/.test(style.overflowX)){left=Math.max(left,b.left);right=Math.min(right,b.right);}
        if(/auto|scroll|hidden|clip/.test(style.overflowY)){top=Math.max(top,b.top);bottom=Math.min(bottom,b.bottom);}
      }
      return right>left&&bottom>top?'x="'+(left-pad)+'" y="'+(top-pad)+'" width="'+(right-left+pad*2)+'" height="'+(bottom-top+pad*2)+'" rx="8"':'';
    };
    const clear=find(modal?'.modal':'.guide-panel');
    const holes=[...clear,...targets].map(el=>box(el,5)).filter(Boolean);
    const rings=targets.map(el=>box(el,5)).filter(Boolean);
    overlay.classList.toggle('static-highlight',G.state.settings.reduced||matchMedia('(prefers-reduced-motion: reduce)').matches);
    const markup='<defs><mask id="tutorial-spotlight-mask"><rect width="100%" height="100%" fill="white"/>'+holes.map(b=>'<rect '+b+' fill="black"/>').join('')+'</mask></defs><rect width="100%" height="100%" fill="#070b14" fill-opacity="'+(modal?'.2':'.48')+'" mask="url(#tutorial-spotlight-mask)"/>'+rings.map(b=>'<rect class="tutorial-click-ring" '+b+'/>').join('');
    if(markup!==signature){overlay.innerHTML=markup;signature=markup;}
  };
  const schedule=()=>{if(!frame)frame=requestAnimationFrame(updateSpotlight);};
  for(const event of ['rpg:rendered','rpg:dialog-opened','rpg:dialog-closed','resize'])window.addEventListener(event,schedule);
  document.addEventListener('scroll',schedule,true);
})(RPG,RPG.data,RPG.systems,RPG.ui);
