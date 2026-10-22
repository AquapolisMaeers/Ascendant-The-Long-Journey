'use strict';
(function(G,D,U){
  const loot=document.getElementById('loot-popup'),stack=document.createElement('div'),popup=document.createElement('aside');
  stack.id='reward-popups';stack.className='reward-popups';
  popup.id='skill-xp-popup';popup.className='skill-xp-popup';popup.hidden=true;
  popup.setAttribute('aria-label','Skill experience progress');popup.setAttribute('role','status');popup.setAttribute('aria-live','polite');
  loot.before(stack);stack.append(popup,loot);
  let owner=null,snapshot=null,timer=0,expires=0,remaining=6000,hovered=false;
  const measure=()=>{
    document.body.classList.toggle('has-skill-xp',!popup.hidden);
    document.body.style.setProperty('--skill-xp-height',Math.ceil(popup.getBoundingClientRect().height)+'px');
  };
  const pause=()=>{
    if(timer){clearTimeout(timer);timer=0;remaining=Math.max(0,expires-performance.now());}
  };
  const schedule=()=>{
    pause();
    if(popup.hidden||document.hidden||G.runtime.selecting||document.querySelector('.modal')||hovered||popup.contains(document.activeElement))return;
    expires=performance.now()+remaining;timer=setTimeout(()=>U.skillProgress.clear(),remaining);
  };
  U.skillProgress={
    clear(){pause();owner=null;snapshot=null;popup.hidden=true;hovered=false;measure();},
    show(detail){
      const c=G.character();
      if(!c||detail.characterId!==c.id||G.runtime.selecting||document.hidden||!D.skills.includes(detail.skill))return;
      owner=c.id;
      const track=c.skills[detail.skill],mastered=track.level===D.config.levelCap,next=D.xpNext(track.level),ratio=mastered?1:G.clamp(track.xp/next,0,1);
      snapshot={skill:detail.skill,level:track.level,xp:track.xp};
      const target=mastered?'Mastered':G.percent(ratio,1)+' toward level '+(track.level+1);
      U.patch(popup,'<div class="skill-xp-head"><span class="skill-xp-icon">'+U.icon(detail.skill)+'</span><div><strong>'+U.e(detail.skill)+'</strong><small>Level '+track.level+'</small></div><span class="skill-xp-gain">+'+G.number(detail.amount)+' XP</span><button type="button" class="skill-xp-dismiss" aria-label="Dismiss skill progress">\u00d7</button></div>'+
        '<div class="skill-xp-label"><span>'+target+'</span><span>'+(mastered?'LEVEL CAP':G.number(track.xp)+' / '+G.number(next)+' XP')+'</span></div>'+
        '<div class="skill-xp-track" role="progressbar" aria-label="'+U.e(detail.skill)+' experience" aria-valuemin="0" aria-valuemax="'+(mastered?1:next)+'" aria-valuenow="'+(mastered?1:track.xp)+'" aria-valuetext="'+U.e(target)+'"><i style="width:'+ratio*100+'%"></i></div>'+
        '<small class="skill-xp-remaining">'+(mastered?'Skill mastered':G.number(Math.max(0,next-track.xp))+' XP to next level')+'</small>');
      pause();remaining=6000;popup.hidden=false;measure();schedule();
    }
  };
  popup.addEventListener('click',event=>{if(event.target.closest('.skill-xp-dismiss'))U.skillProgress.clear();});
  popup.addEventListener('pointerenter',()=>{hovered=true;pause();});
  popup.addEventListener('pointerleave',()=>{hovered=false;schedule();});
  popup.addEventListener('focusin',pause);popup.addEventListener('focusout',()=>setTimeout(schedule,0));
  window.addEventListener('rpg:skill-xp',({detail})=>U.skillProgress.show(detail));
  window.addEventListener('rpg:dialog-opened',pause);
  window.addEventListener('rpg:dialog-closed',()=>setTimeout(schedule,0));
  document.addEventListener('visibilitychange',()=>{if(document.hidden)U.skillProgress.clear();});
  window.addEventListener('rpg:rendered',()=>{
    const c=G.character(),track=snapshot&&c?.skills[snapshot.skill];
    if(owner&&(owner!==c?.id||G.runtime.selecting||track?.level!==snapshot.level||track?.xp!==snapshot.xp))U.skillProgress.clear();
  });
  new ResizeObserver(measure).observe(popup);
})(RPG,RPG.data,RPG.ui);
