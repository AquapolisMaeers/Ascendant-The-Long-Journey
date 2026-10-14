'use strict';
(function(G,D,S,U) {
  const remaining=ms=>{const seconds=Math.max(0,Math.ceil(ms/1000));return Math.floor(seconds/60)+'m '+String(seconds%60).padStart(2,'0')+'s';};
  U.questName = q => q.kind==='kill' ? 'Defeat '+q.target+' '+(q.enemy?'× '+q.enemy:'creatures') :
    ({Mining:'Mine ',Woodcutting:'Chop ',Fishing:'Catch ',Hunting:'Collect '}[q.kind])+q.target+' × '+D.catalog[D.resourceKinds[D.skills.indexOf(q.kind)]+':'+q.tier].name;
  U.screens.Quests = () => {
    const c=G.character(),location=S.quests.location(c),board=c.quests||[];
    return U.heading('WORK FOR THE ROAD','Quests','Three quest slots. Complete a task to earn regional rewards.',
      '<span class="badge">'+(c.questCompletions||0)+' COMPLETED</span>')+
      '<section class="panel quest-rules"><h3>'+D.locations[location].name+'</h3><p class="notes spacer">Quests follow your highest unlocked location. Only usable gathering skills are offered. Unfinished quests change when a harder region unlocks; completed slots keep their 30-minute timer. The timer also runs offline.</p><p class="notes spacer">Gather the named resources in that region. Purchases, crafting and quest rewards do not count. Coins and materials are awarded automatically; a full bag holds exact pending rewards.</p></section>'+
      (!board.length?'<p class="empty spacer">Complete the required tutorial to unlock your quest board.</p>':'<div class="grid-3 spacer quest-board">'+board.map((q,i)=>
        '<section class="panel quest-card '+(q.completedAt?'quest-complete':'')+'"><div class="panel-head"><h3>'+U.icon(q.kind==='kill'?'Weapon':q.kind)+' Quest '+(i+1)+'</h3><span class="badge">'+(q.completedAt?'REWARDED':'ACTIVE')+'</span></div>'+
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
