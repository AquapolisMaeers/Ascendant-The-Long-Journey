'use strict';
(function(G,D,S,U) {
  const remaining=ms=>{const seconds=Math.max(0,Math.ceil(ms/1000));return Math.floor(seconds/60)+'m '+String(seconds%60).padStart(2,'0')+'s';};
  U.questName = q => q.kind==='elite'?'Defeat '+q.target+' elite creatures':q.kind==='secondary'?'Smith '+q.target+' class secondaries (level '+D.tiers[q.tier]+'+)':q.kind==='textile'?'Refine '+q.target+' leather or cloth (level '+D.tiers[q.tier]+'+)':q.kind==='Cooking'?'Cook '+q.target+' meals (level '+D.tiers[q.tier]+'+)':q.kind==='Faceting'?'Successfully cut or fuse '+q.target+' gems':q.kind==='kill' ? 'Defeat '+q.target+' '+(q.enemy?'× '+q.enemy:'creatures') :
    ({Mining:'Mine ',Woodcutting:'Chop ',Fishing:'Catch ',Hunting:'Collect ',Farming:'Harvest '}[q.kind])+q.target+' × '+D.catalog[D.gatherResources[q.kind]+':'+q.tier].name;
  U.screens.Quests = () => {
    const c=G.character(),location=S.quests.location(c),board=c.quests||[];
    return U.heading('WORK FOR THE ROAD','Quests','Three quest slots. Complete a task to earn regional rewards.',
      '<span class="badge">'+(c.questCompletions||0)+' COMPLETED</span>')+
      '<section class="panel quest-rules"><h3>'+D.locations[location].name+'</h3><p class="notes spacer">Quests follow your highest unlocked location and your usable skills. Unfinished quests change when a harder region unlocks; completed slots keep their 30-minute timer, including time offline.</p><p class="notes spacer">Work in the named region: gather, defeat elites, refine textiles, smith secondaries, cook or facet gems. Crafting quests count successful output; gathering quests count only harvests. Purchases and quest rewards never count. Rewards arrive automatically, with exact Pending Loot if your bag is full.</p></section>'+
      (!board.length?'<p class="empty spacer">Complete the required tutorial to unlock your quest board.</p>':'<div class="grid-3 spacer quest-board">'+board.map((q,i)=>
        '<section class="panel quest-card '+(q.completedAt?'quest-complete':'')+'"><div class="panel-head"><h3>'+U.icon(['kill','elite'].includes(q.kind)?'Weapon':['secondary','textile'].includes(q.kind)?'Smithing':q.kind)+' Quest '+(i+1)+'</h3><span class="badge">'+(q.completedAt?'REWARDED':'ACTIVE')+'</span></div>'+
        '<div class="eyebrow spacer">'+D.locations[q.location].name+'</div><h3 class="spacer">'+U.e(U.questName(q))+'</h3>'+
        '<div class="bar-label spacer"><span>Progress</span><span>'+q.progress+' / '+q.target+'</span></div>'+U.bar(q.progress,q.target,'skill')+
        '<div class="quest-rewards spacer"><strong>'+(q.completedAt?'Rewards received':'Rewards')+'</strong><div class="stack spacer">'+S.quests.rewards(q).map(U.rewardText).join('')+'</div></div>'+
        (q.completedAt?'<p class="notes spacer">New quest in <strong id="quest-timer-'+i+'">'+remaining(q.readyAt-Date.now())+'</strong></p><small class="muted">Next quest: '+D.locations[location].name+'</small>':
          '<div class="spacer">'+(c.location===q.location?U.btn('Open World','navigate','data-value="World"','gold-btn'):
            U.btn('Travel to quest region','questTravel','data-id="'+q.location+'" '+(c.combat||c.activity||c.dungeon||c.pending.length?'disabled':''),'gold-btn'))+'</div>')+'</section>').join('')+'</div>');
  };
  const live=U.live;
  U.live=()=>{
    live();const c=G.character();if(!c||G.runtime.page!=='Quests') return;
    c.quests?.forEach((q,i)=>{const el=document.getElementById('quest-timer-'+i);if(el)el.textContent=remaining(q.readyAt-Date.now());});
  };
})(RPG,RPG.data,RPG.systems,RPG.ui);
