'use strict';
(function(G,D,S,U){
  const loot=document.getElementById('loot-popup'),stack=document.createElement('div');
  stack.id='reward-popups';stack.className='reward-popups';loot.before(stack);stack.append(loot);
  let snapshot=null,timer=0,expires=0,remaining=6000;
  const rendered=new WeakMap();
  const activeSkill=c=>c?.activity?.type==='gather'?c.activity.skill:
    c?.activity?.type==='craft'?D.recipes.find(r=>r.id===c.activity.recipe)?.skill:null;
  const matches=c=>snapshot?.characterId===c?.id&&c?.skills[snapshot.skill]?.level===snapshot.level&&c.skills[snapshot.skill].xp===snapshot.xp;
  const dock=()=>document.getElementById('activity-dock');
  const pause=()=>{
    if(timer){clearTimeout(timer);timer=0;remaining=Math.max(0,expires-performance.now());}
  };
  const schedule=()=>{
    pause();
    const panel=dock();
    if(!snapshot||activeSkill(G.character())||document.hidden||G.runtime.selecting||document.querySelector('.modal')||panel?.matches(':hover')||panel?.contains(document.activeElement))return;
    expires=performance.now()+remaining;timer=setTimeout(()=>U.skillProgress.clear(),remaining);
  };
  U.skillProgress={
    current(c=G.character()){
      if(!c||G.runtime.selecting)return null;
      const skill=activeSkill(c)||(!c.activity&&!c.combat&&matches(c)?snapshot.skill:null);
      return skill?{skill,track:c.skills[skill],gain:matches(c)&&snapshot.skill===skill?snapshot.amount:0,title:snapshot?.title}:null;
    },
    content(c=G.character()){
      const progress=this.current(c);if(!progress)return '';
      const {skill,track,gain}=progress,mastered=track.level===D.config.levelCap,next=D.xpNext(track.level),ratio=mastered?1:G.clamp(track.xp/next,0,1);
      const target=mastered?'Mastered':G.percent(ratio,1)+' to level '+(track.level+1);
      return '<div class="skill-xp-label"><span>'+U.e(skill)+' <span class="skill-xp-level">\u00b7 Level '+track.level+'</span></span>'+
        '<span class="skill-xp-summary">'+(gain?'<span class="skill-xp-gain">+'+G.number(gain)+' XP</span>':'')+'<span>'+target+'</span></span></div>'+
        '<div class="skill-xp-track" role="progressbar" aria-label="'+U.e(skill)+' experience" aria-valuemin="0" aria-valuemax="'+(mastered?1:next)+'" aria-valuenow="'+(mastered?1:track.xp)+'" aria-valuetext="'+U.e(target)+'"><i style="width:'+ratio*100+'%"></i></div>'+
        '<div class="skill-xp-detail"><span>'+(mastered?'LEVEL CAP':G.number(track.xp)+' / '+G.number(next)+' XP')+'</span><span>'+(mastered?'Skill mastered':G.number(Math.max(0,next-track.xp))+' XP to next level')+'</span></div>';
    },
    update(){
      const popup=document.getElementById('skill-xp-popup');if(!popup)return;
      const html=this.content();popup.hidden=!html;
      if(rendered.get(popup)!==html){U.patch(popup,html);rendered.set(popup,html);}
    },
    clear(){pause();snapshot=null;U.live();},
    show(detail){
      const c=G.character();
      if(!c||detail.characterId!==c.id||G.runtime.selecting||document.hidden||!D.skills.includes(detail.skill))return;
      const track=c.skills[detail.skill],a=c.activity,recipe=a?.type==='craft'?D.recipes.find(r=>r.id===a.recipe):null;
      snapshot={characterId:c.id,skill:detail.skill,level:track.level,xp:track.xp,amount:detail.amount,title:recipe?.name||detail.skill+' training'};
      pause();remaining=6000;U.live();schedule();
    }
  };
  document.addEventListener('click',event=>{
    if(event.target.closest('.skill-xp-dismiss')){U.skillProgress.clear();U.render();}
  });
  document.addEventListener('pointerenter',event=>{if(event.target.id==='activity-dock')pause();},true);
  document.addEventListener('pointerleave',event=>{if(event.target.id==='activity-dock')schedule();},true);
  document.addEventListener('focusin',event=>{if(dock()?.contains(event.target))pause();});
  document.addEventListener('focusout',()=>setTimeout(schedule,0));
  window.addEventListener('rpg:skill-xp',({detail})=>U.skillProgress.show(detail));
  window.addEventListener('rpg:dialog-opened',pause);
  window.addEventListener('rpg:dialog-closed',()=>setTimeout(schedule,0));
  document.addEventListener('visibilitychange',()=>{if(document.hidden)U.skillProgress.clear();else schedule();});
  window.addEventListener('rpg:rendered',()=>{
    if(snapshot&&(!matches(G.character())||G.runtime.selecting))U.skillProgress.clear();
    U.skillProgress.update();schedule();
  });
})(RPG,RPG.data,RPG.systems,RPG.ui);
