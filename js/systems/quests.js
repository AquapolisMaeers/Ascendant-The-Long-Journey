'use strict';
(function(G,D,S) {
  D.questRules = {slots:3, cooldown:30*60*1000};
  S.quests = {
    location(c) { return D.locations.findLast(l=>c.level>=l.level).id; },
    key(q) { return q.kind+':'+(q.enemy||'*'); },
    target(q) {
      if(q.kind==='elite'||q.kind==='secondary')return 2+Math.floor(q.location/3);
      if(q.kind==='Faceting')return 3+Math.floor(q.location/2);
      if(q.kind==='textile'||q.kind==='Cooking')return 8+q.location*2;
      return q.kind==='kill' ? (q.enemy?4+q.location:8+q.location*2) : 12+q.location*3;
    },
    choices(c,location) {
      const loc=D.locations[location];
      return [{kind:'kill',enemy:null},{kind:'elite',enemy:null},...loc.regular.map(e=>({kind:'kill',enemy:e.name})),
        ...D.gatheringSkills.filter(skill=>c.skills[skill].level>=loc.level).map(kind=>({kind,enemy:null})),
        ...(c.skills.Smithing.level>=loc.level?[{kind:'secondary',enemy:null},{kind:'textile',enemy:null}]:[]),
        ...['Cooking','Faceting'].filter(skill=>c.skills[skill].level>=loc.level).map(kind=>({kind,enemy:null}))];
    },
    create(c,slot,now,preferred=null) {
      const location=this.location(c), used=new Set((c.quests||[]).filter((q,i)=>q&&i!==slot&&q.location===location).map(q=>this.key(q)));
      const choices=this.choices(c,location).filter(q=>!used.has(this.key(q)));
      // Quest rotation has its own deterministic stream, separate from gameplay RNG.
      let seed=2166136261;
      for(const ch of c.id+':'+slot+':'+now) seed=Math.imul(seed^ch.charCodeAt(0),16777619)>>>0;
      const picked=choices.find(q=>q.kind===preferred)||G.pick(()=>G.random({seed:seed||1}),choices);
      const q={...picked,location,tier:D.tierFor(D.locations[location].level),progress:0,completedAt:0,readyAt:0};
      q.target=this.target(q);
      return q;
    },
    sync(c,now=Date.now()) {
      if(!c?.tutorial) return false;
      c.questCompletions??=0;
      if(!c.quests) {
        c.quests=Array(D.questRules.slots).fill(null);
        ['kill','Woodcutting','Mining'].forEach((kind,i)=>c.quests[i]=this.create(c,i,now,kind));
        return true;
      }
      let changed=false;const location=this.location(c);
      c.quests.forEach((q,i)=>{
        if(q.completedAt ? now>=q.readyAt || q.location>location : q.location!==location || !this.choices(c,location).some(choice=>this.key(choice)===this.key(q))) {
          c.quests[i]=this.create(c,i,now);changed=true;
        }
      });
      return changed;
    },
    rewards(q) {
      const loc=D.locations[q.location],kind=({kill:'bar',elite:'bar',secondary:'cloth',textile:'fiber',Cooking:'fish'})[q.kind]||D.gatherResources[q.kind];
      if(q.kind==='Faceting')return [{coins:Math.ceil((loc.coins[0]+loc.coins[1])/2)*3},{key:'uncut:'+(q.location%D.regularGemCount),quantity:2}];
      return [{coins:Math.ceil((loc.coins[0]+loc.coins[1])/2)*3},{key:kind+':'+q.tier,quantity:q.kind==='kill'?2:5}];
    },
    add(c,predicate,amount,now=Date.now()) {
      this.sync(c,now);
      if(!c.quests||!c.tutorial) return;
      for(const q of c.quests) {
        if(q.completedAt||q.location!==c.location||!predicate(q)) continue;
        q.progress=Math.min(q.target,q.progress+amount);
        if(q.progress===q.target) {
          // Mark completion before delivering rewards so repeated checks cannot repay it.
          q.completedAt=now;q.readyAt=now+D.questRules.cooldown;c.questCompletions++;
          S.guilds.progress(c,'quests',1,now);
          const rewards=this.rewards(q);S.inventory.reward(rewards,c);
          if(c===G.character()) {
            G.notify('Quest complete in '+D.locations[q.location].name+'. Rewards collected; a new quest arrives in 30 minutes.','success');
            S.loot.present(rewards,'Quest complete');
          }
        }
      }
    },
    defeated(enemy,c=G.character()) { this.add(c,q=>q.kind==='kill'&&(!q.enemy||q.enemy===enemy.name)||q.kind==='elite'&&enemy.type==='elite',1); },
    crafted(recipe,rewards,c=G.character()) {
      const quantity=rewards.reduce((sum,r)=>sum+(r.quantity||1),0);
      this.add(c,q=>q.kind==='Faceting'&&recipe.skill==='Faceting'||recipe.tier>=q.tier&&(
        q.kind==='secondary'&&recipe.category==='Secondaries'||q.kind==='textile'&&['cloth','leather'].includes(recipe.output?.split(':')[0])||q.kind==='Cooking'&&recipe.skill==='Cooking'),quantity);
    },
    gathered(skill,rewards,c=G.character()) {
      const kind=D.gatherResources[skill];
      for(const r of rewards) if(r.key?.startsWith(kind+':'))
        this.add(c,q=>q.kind===skill&&r.key===kind+':'+q.tier,r.quantity||1);
    },
    valid(c) {
      if(c.questCompletions!==undefined&&(!Number.isSafeInteger(c.questCompletions)||c.questCompletions<0)) return false;
      if(c.quests===null||c.quests===undefined) return true;
      if(!Array.isArray(c.quests)||c.quests.length!==D.questRules.slots) return false;
      const keys=new Set();
      return c.quests.every(q=>{
        if(!q||!['kill','elite','secondary','textile','Cooking','Faceting',...D.gatheringSkills].includes(q.kind)||!Number.isInteger(q.location)||!D.locations[q.location]||D.locations[q.location].level>c.level||
          q.tier!==D.tierFor(D.locations[q.location].level)||q.target!==this.target(q)||!Number.isInteger(q.progress)||q.progress<0||q.progress>q.target||
          !Number.isSafeInteger(q.completedAt)||q.completedAt<0||!Number.isSafeInteger(q.readyAt)||q.readyAt<0||
          (q.completedAt?q.progress!==q.target||q.readyAt!==q.completedAt+D.questRules.cooldown:q.progress===q.target||q.readyAt!==0)||
          (q.kind==='kill'?q.enemy!==null&&!D.locations[q.location].regular.some(e=>e.name===q.enemy):q.enemy!==null)) return false;
        const key=q.location+':'+this.key(q);
        if(keys.has(key)) return false;keys.add(key);return true;
      });
    }
  };
})(RPG,RPG.data,RPG.systems);
