'use strict';
(function(G,D,S) {
  D.questRules = {slots:3, cooldown:30*60*1000};
  S.quests = {
    location(c) { return D.locations.findLast(l=>c.level>=l.level).id; },
    key(q) { return q.kind+':'+(q.enemy||'*'); },
    target(q) { return q.kind==='kill' ? (q.enemy?4+q.location:8+q.location*2) : 12+q.location*3; },
    choices(c,location) {
      const loc=D.locations[location];
      return [{kind:'kill',enemy:null},...loc.regular.map(e=>({kind:'kill',enemy:e.name})),
        ...D.skills.slice(0,4).filter(skill=>c.skills[skill].level>=loc.level).map(kind=>({kind,enemy:null}))];
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
        if(q.completedAt ? now>=q.readyAt || q.location>location : q.location!==location || q.kind!=='kill'&&c.skills[q.kind].level<D.locations[location].level) {
          c.quests[i]=this.create(c,i,now);changed=true;
        }
      });
      return changed;
    },
    rewards(q) {
      const loc=D.locations[q.location],kind=q.kind==='kill'?'bar':D.resourceKinds[D.skills.indexOf(q.kind)];
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
          const rewards=this.rewards(q);S.inventory.reward(rewards,c);
          if(c===G.character()) {
            G.notify('Quest complete in '+D.locations[q.location].name+'. Rewards collected; a new quest arrives in 30 minutes.','success');
            S.loot.present(rewards,'Quest complete');
          }
        }
      }
    },
    defeated(enemy,c=G.character()) { this.add(c,q=>q.kind==='kill'&&(!q.enemy||q.enemy===enemy.name),1); },
    gathered(skill,rewards,c=G.character()) {
      const kind=D.resourceKinds[D.skills.indexOf(skill)];
      for(const r of rewards) if(r.key?.startsWith(kind+':'))
        this.add(c,q=>q.kind===skill&&r.key===kind+':'+q.tier,r.quantity||1);
    },
    valid(c) {
      if(c.questCompletions!==undefined&&(!Number.isSafeInteger(c.questCompletions)||c.questCompletions<0)) return false;
      if(c.quests===null||c.quests===undefined) return true;
      if(!Array.isArray(c.quests)||c.quests.length!==D.questRules.slots) return false;
      const keys=new Set();
      return c.quests.every(q=>{
        if(!q||!['kill',...D.skills.slice(0,4)].includes(q.kind)||!Number.isInteger(q.location)||!D.locations[q.location]||D.locations[q.location].level>c.level||
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
