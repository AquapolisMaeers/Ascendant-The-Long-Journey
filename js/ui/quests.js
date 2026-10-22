'use strict';
(function(G,D,S,U) {
  const remaining=ms=>{const seconds=Math.max(0,Math.ceil(ms/1000));return Math.floor(seconds/60)+'m '+String(seconds%60).padStart(2,'0')+'s';};
  U.questName = q => q.kind==='elite'?'Defeat '+q.target+' elite creatures':q.kind==='secondary'?'Smith '+q.target+' class secondaries (level '+D.tiers[q.tier]+'+)':q.kind==='textile'?'Refine '+q.target+' leather or cloth (level '+D.tiers[q.tier]+'+)':q.kind==='Cooking'?'Cook '+q.target+' meals (level '+D.tiers[q.tier]+'+)':q.kind==='Faceting'?'Successfully cut or fuse '+q.target+' gems':q.kind==='kill' ? 'Defeat '+q.target+' '+(q.enemy?'× '+q.enemy:'creatures') :
    ({Mining:'Mine ',Woodcutting:'Chop ',Fishing:'Catch ',Hunting:'Collect ',Farming:'Harvest '}[q.kind])+q.target+' × '+D.catalog[D.gatherResources[q.kind]+':'+q.tier].name;
  U.questDetails = q => {
    const region=D.locations[q.location].name,level=D.tiers[q.tier];
    let action,counts;
    if(q.kind==='kill'){
      action=q.enemy?'Use World → Advance in '+region+' to find '+q.enemy+'. Choose Fight and win. Other creature names do not count.':'Use World → Advance in '+region+' and win battles. Normal creatures, elites and dungeon bosses in this region all count.';
      counts='Each victory adds 1. Moving on or losing gives no progress.';
    }else if(q.kind==='elite'){
      action='Use World → Advance in '+region+' to discover an elite creature'+(D.locations[q.location].dungeon!==null?', or reach the elite room in '+D.dungeons[D.locations[q.location].dungeon].name:'')+'. Choose Fight and win.';
      counts='Only victories against creatures marked ELITE count, 1 per victory. Normal creatures and bosses do not count.';
    }else if(D.gatheringSkills.includes(q.kind)){
      const resource=D.catalog[D.gatherResources[q.kind]+':'+q.tier].name;
      action='Use World → Advance in '+region+' to find a '+q.kind+' encounter yielding '+resource+'. Gather with your '+D.tools[D.skills.indexOf(q.kind)]+'. Requires '+q.kind+' level '+level+'. Set '+q.kind+' as a preferred gathering skill in Skills to find it more often.';
      counts='Only '+resource+' harvested in this region counts. Each item adds 1; Yield bonuses count. Other material tiers, purchases, exchanges, loot and offline XP do not count.';
    }else if(q.kind==='secondary'){
      action='While in '+region+', open Crafting → Smithing → Secondaries. Craft shields, daggers or grimoires at equipment level '+level+' or higher. Requires the recipe\'s Smithing level, a Hammer and its listed ingredients.';
      counts='Each successfully crafted secondary adds 1, including bonus output. Buying, equipping, enhancing or upgrading existing gear gives no progress.';
    }else if(q.kind==='textile'){
      action='While in '+region+', open Crafting → Smithing → Materials. Refine leather or cloth at material level '+level+' or higher. Choose a recipe, quantity and Smith. Bring the listed hides or fibres and a usable Hammer.';
      counts='Each leather or cloth produced adds 1, including bonus output. Raw hides, fibres, metal bars and purchased textiles do not count.';
    }else if(q.kind==='Cooking'){
      action='While in '+region+', open Crafting → Cooking. Cook '+D.catalog['food:'+q.tier].name+' or a higher-level meal. Bring the recipe\'s raw fish, a '+D.tools[D.skills.indexOf('Cooking')]+' and the required Cooking level.';
      counts='Each meal successfully cooked adds 1, including bonus output. Eating food, buying meals or training offline gives no progress.';
    }else{
      action='While in '+region+', open Crafting → Faceting. Cut uncut gems or fuse matching gems into a higher rank. Any gem type or rank counts; bring the recipe\'s gems, Chisel rarity and required Faceting level.';
      counts='Each gem successfully produced adds 1, including bonus output. Failed fusion attempts still earn XP but give no quest progress. Buying, opening boxes, socketing gems and offline XP do not count.';
    }
    return '<div class="quest-instructions spacer"><p class="notes"><strong>How to complete:</strong> '+U.e(action)+'</p><p class="notes spacer"><strong>What counts:</strong> '+U.e(counts)+'</p>'+(!q.completedAt?'<p class="notes spacer"><strong>Remaining:</strong> '+G.number(Math.max(0,q.target-q.progress))+' more. Rewards are delivered automatically when the progress bar fills.</p>':'')+'</div>';
  };
  U.screens.Quests = () => {
    const c=G.character(),location=S.quests.location(c),board=c.quests||[];
    return U.heading('WORK FOR THE ROAD','Quests','Three quest slots. Complete a task to earn regional rewards.',
      '<span class="badge">'+(c.questCompletions||0)+' COMPLETED</span>')+
      '<section class="panel quest-rules"><h3>'+D.locations[location].name+'</h3><p class="notes spacer">Quests follow your highest unlocked location and your usable skills. Unfinished quests change when a harder region unlocks; completed slots keep their 30-minute timer, including time offline.</p><p class="notes spacer">Work in the named region: gather, defeat elites, refine textiles, smith secondaries, cook or facet gems. Crafting quests count successful output; gathering quests count only harvests. Purchases and quest rewards never count. Rewards arrive automatically, with exact Pending Loot if your bag is full.</p></section>'+
      (!board.length?'<p class="empty spacer">Complete the required tutorial to unlock your quest board.</p>':'<div class="grid-3 spacer quest-board">'+board.map((q,i)=>
        '<section class="panel quest-card '+(q.completedAt?'quest-complete':'')+'"><div class="panel-head"><h3>'+U.icon(['kill','elite'].includes(q.kind)?'Weapon':['secondary','textile'].includes(q.kind)?'Smithing':q.kind)+' Quest '+(i+1)+'</h3><span class="badge">'+(q.completedAt?'REWARDED':'ACTIVE')+'</span></div>'+
        '<div class="eyebrow spacer">'+D.locations[q.location].name+'</div><h3 class="spacer">'+U.e(U.questName(q))+'</h3>'+
        U.questDetails(q)+
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
