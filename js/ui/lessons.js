'use strict';
(function(G,D,S,U) {
  U.tutorialDirections=step=>{
    const route=step.route,phone=U.isPhone(),quick=['World','Inventory','Crafting','Shop'].includes(route.page);
    return '<section class="tutorial-route spacer"><h3>How to get there</h3><ol><li>'+U.e(phone?(quick?'Tap '+route.page+' in the bottom navigation.':'Tap More in the bottom navigation, then choose '+route.page+'.'):'Click '+route.page+' in the left navigation.')+'</li>'+route.steps.map(text=>'<li>'+U.e(text)+'</li>').join('')+'</ol></section>';
  };
  U.guidePanel=()=>{
    if(!S.tutorial.active())return '';
    const c=G.character(),step=S.tutorial.current(),world=G.runtime.page==='World',gather=D.skills.slice(0,4).includes(step.id);
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
    const verb=r.skill==='Cooking'?'Cook':r.skill==='Smithing'?'Smith':r.rank?'Fuse':'Cut';
    const locked=c.skills[r.skill].level<r.level||!S.items.usableTool(c,r.skill)||(r.skill==='Faceting'&&c.tools.Faceting.rarity<D.facet.chisel[r.rank]);
    return '<div class="recipe-actions"><div class="craft-quantities" role="group" aria-label="Select '+U.e(r.name)+' quantity">'+[1,5,10,'max'].map(n=>U.btn(String(n).toUpperCase(),'craftQuantity','data-id="'+r.id+'" data-quantity="'+n+'" aria-pressed="'+(selected===(n==='max'?max:n))+'" '+(busy||max<(n==='max'?1:n)?'disabled':''),'small quiet')).join('')+'</div>'+U.btn(verb+(selected?' ('+selected+')':''),'craft','data-id="'+r.id+'" '+(!selected||selected>max||busy||locked?'disabled':''),'primary craft-start')+'</div>';
  };
  U.selectCraftQuantity=(id,value)=>{
    const r=D.recipes.find(r=>r.id===id);G.assert(r,'Choose a recipe.');
    const n=value==='max'?Math.min(1000000,S.crafting.max(r)):Number(value);
    G.assert(Number.isSafeInteger(n)&&n>0&&n<=S.crafting.max(r),'Choose a quantity your unlocked ingredients can make.');
    const c=G.character();G.runtime.craftQuantities??={};(G.runtime.craftQuantities[c.id]??={})[id]=n;U.render();
  };
})(RPG,RPG.data,RPG.systems,RPG.ui);
