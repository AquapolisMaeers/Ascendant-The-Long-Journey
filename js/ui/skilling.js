'use strict';
(function(G,D,S,U){
  const idle=c=>!c.combat&&!c.activity&&!c.dungeon&&!S.tutorial.active();
  const labels={allKnowledge:'All skill XP',allEfficiency:'Gathering & crafting speed',gatherKnowledge:'Gathering XP',gatherEfficiency:'Gathering speed',gatherYield:'Double-harvest chance',gatherFortune:'Next-tier gathering chance',gatherConservation:'Preserve node charge',craftKnowledge:'Crafting XP',craftEfficiency:'Crafting speed',craftYield:'Double-output chance',craftConservation:'Ingredient conservation',fusionChance:'Gem-fusion success',offlineKnowledge:'Additional offline XP'};
  U.skillingSummary=c=>{
    const effects=Object.entries(S.skilling.effects(c)).filter(([,value])=>value>0);
    return '<details class="skilling-bonuses"><summary>Active skilling bonuses</summary><p class="notes">Speed and XP add to matching tool bonuses. Chances add percentage points. All-skill and discipline bonuses stack; speed divides the normal action time.</p>'+(effects.length?'<dl>'+effects.map(([key,value])=>'<div><dt>'+labels[key]+'</dt><dd>+'+G.percent(value)+'</dd></div>').join('')+'</dl>':'<p class="notes">No skilling nodes learned yet.</p>')+'</details>';
  };
  U.confirmSkilling=id=>{
    const c=G.character(),node=S.skilling.nodes().find(n=>n.id===id),rank=c.skilling?.[id]||0;
    G.assert(idle(c)&&S.skilling.canLearn(c,id),'This node needs an available point and its prerequisite; finish your activity first.');
    U.confirm('Spend 1 skilling point?','<div class="talent-confirm"><span class="eyebrow">SKILLING TREE</span><h3>'+U.e(node.name)+'</h3><p>'+U.e(node.description)+'</p><dl class="preview-stats"><div><dt>Node rank</dt><dd>'+rank+' → '+(rank+1)+' / '+node.ranks+'</dd></div><div><dt>Available points</dt><dd>'+S.skilling.available(c)+' → '+(S.skilling.available(c)-1)+'</dd></div></dl><p class="notes">Refund this tree with one Crystal of Recollection from Shop → Utility. Combat talents use their own points.</p></div>',()=>{
      G.assert(c===G.character()&&(c.skilling?.[id]||0)===rank,'Your character or allocation changed. Review this node again.');
      S.skilling.learn(id);G.notify(node.name+' increased to rank '+(rank+1)+'.','success');
    });
    document.querySelector('.modal [data-action="confirm"]').textContent='Spend 1 skilling point';
  };
  U.resetSkilling=()=>{
    G.ensureIdle();const c=G.character();
    G.assert(idle(c),'Finish the tutorial and leave the dungeon before resetting this tree.');
    const spent=S.skilling.spent(c),entry=D.shop.find(item=>item.id==='talent-reset');
    G.assert(spent>0,'No spent skilling points to reset.');
    const preview='<div class="reset-item-preview">'+U.paint('talent-reset')+'<div><h3>'+U.e(entry.name)+'</h3><p>Refund only this character\'s skilling tree.</p></div></div>';
    if(!S.inventory.available('talent-reset',c)){
      U.modal('Reset skilling tree',preview+'<p class="notes spacer">You need one unlocked Crystal of Recollection. Shop → Utility sells it for '+U.price(entry.price)+'.</p><div class="modal-actions">'+U.btn('Cancel','closeModal','','quiet')+U.btn('Visit Utility shop','utilityShop','','gold-btn')+'</div>');return;
    }
    const allocation=JSON.stringify(c.skilling);
    U.confirm('Reset skilling tree?',preview+'<p class="spacer">Consume one Crystal of Recollection and refund '+spent+' skilling points. Earned points remain available. Combat talents, milestone perks and your other characters keep their allocations.</p>',()=>{
      G.assert(c===G.character()&&JSON.stringify(c.skilling)===allocation,'Your character or allocation changed. Review the reset again.');S.skilling.reset();G.notify('Skilling points refunded. Choose your new path.','success');
    });
  };
  const renderNode=(node,c)=>{
    const rank=c.skilling?.[node.id]||0,parent=S.skilling.nodes().find(n=>n.id===node.requires),ready=idle(c)&&S.skilling.canLearn(c,node.id),complete=rank===node.ranks;
    return '<article class="talent-node skilling-node '+(complete?'mastered':rank?'invested':'')+'" data-node="'+node.id+'"><span class="eyebrow">'+(node.id==='foundation'?'SHARED FOUNDATION':node.ranks===1?'CAPSTONE':'CONNECTED NODE')+' · '+rank+' / '+node.ranks+'</span><h3>'+U.e(node.name)+'</h3><p>'+U.e(node.description)+'</p><small>'+(parent?'Requires '+U.e(parent.name)+' at full rank.':'Entry node · all eight skills contribute points.')+'</small>'+U.btn(complete?'Mastered':'Review (1 point)','learnSkilling','data-id="'+node.id+'" '+(!ready?'disabled':''),'small '+(ready?'gold-btn':'quiet'))+'</article>';
  };
  const skills=U.screens.Skills;
  U.screens.Skills=()=>{
    const c=G.character(),earned=S.skilling.earned(c),spent=S.skilling.spent(c),tabs=U.tabs(['Disciplines','Skilling Tree'],G.runtime.tab==='Skilling Tree'?'Skilling Tree':'Disciplines');
    if(G.runtime.tab!=='Skilling Tree'){
      const template=document.createElement('template');template.innerHTML=skills();const heading=template.content.querySelector('.page-heading');
      heading?.insertAdjacentHTML('afterend',tabs+'<section class="panel skilling-overview"><div><h3>'+S.skilling.available(c)+' skilling points available</h3><p class="notes">Earn one point per ten combined skill levels gained. Past levels count. Build your Harvesting, Crafting and Mastery paths.</p></div>'+U.btn('Open skilling tree','tab','data-value="Skilling Tree"','gold-btn')+'</section>');
      return template.innerHTML;
    }
    const gains=D.skills.reduce((sum,skill)=>sum+c.skills[skill].level-1,0),max=79,progress=earned===max?'All 79 points earned.':(D.skilling.levelsPerPoint-gains%D.skilling.levelsPerPoint)+' combined skill levels to your next point.';
    return U.heading('THE WORK OF PATIENCE','Skilling tree','Grow all eight skills.','<span class="badge">'+S.skilling.available(c)+' POINTS AVAILABLE</span>')+tabs+
      '<section class="panel talent-intro"><div><h3>'+spent+' / '+earned+' earned points spent</h3><p class="notes">'+progress+'</p><details class="skilling-rules"><summary>Points & progression</summary><p class="notes">Earn one point per ten combined skill levels gained across all eight skills, up to 79. Past levels count. Complete each node to follow its connection. Crystal of Recollection refunds this tree separately from combat talents.</p></details></div>'+U.btn('Reset skilling tree','resetSkilling',!idle(c)||!spent?'disabled':'','quiet')+'</section>'+U.skillingSummary(c)+
      '<div class="skilling-tree"><div class="skilling-root">'+renderNode(D.skilling.root,c)+'</div><div class="skilling-paths">'+D.skilling.paths.map((path,index)=>'<section class="talent-path skilling-path path-'+index+'" aria-label="'+path.name+' path"><header><h2>'+U.icon(path.icon)+' '+path.name+'</h2><p>'+path.role+'</p></header>'+path.nodes.map(node=>renderNode(node,c)).join('')+'</section>').join('')+'</div></div>';
  };
  const item=U.item;
  U.item=id=>{
    item(id);const entry=S.items.find(id),c=G.character();if(entry?.key!=='talent-reset')return;
    const combat=document.querySelector('.modal [data-action="useReset"]');if(combat)combat.textContent='Reset combat talents';
    document.querySelector('.modal')?.insertAdjacentHTML('beforeend','<div class="modal-actions">'+U.btn('Reset skilling tree','resetSkilling',entry.locked||!idle(c)||!S.skilling.spent(c)?'disabled':'','gold-btn')+'</div>');
  };
})(RPG,RPG.data,RPG.systems,RPG.ui);
