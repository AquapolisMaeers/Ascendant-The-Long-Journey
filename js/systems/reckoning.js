'use strict';
(function(G,D,S){
  const whole=n=>Number.isSafeInteger(n)&&n>=0;
  const maxUnits=1e15;
  const stamp=n=>G.assert(whole(n)&&n<=8640000000000000,'Choose a valid event time.');
  const identity=s=>typeof s==='string'&&s.length>0&&s.length<=80;
  S.reckoning={
    connected(){return false;},
    window(now=Date.now()){
      stamp(now);const start=S.guilds.week(now)+(D.reckoning.day+6)%7*D.reckoning.dayMs,end=start+D.reckoning.dayMs;
      return {id:new Date(start).toISOString().slice(0,10),start,end,open:now>=start&&now<end,canStart:now>=start&&now<=end-D.reckoning.sessionMs};
    },
    valid(session){
      if(!session||!identity(session.id)||!identity(session.guildId)||typeof session.guildName!=='string'||!whole(session.startsAt)||session.startsAt>8640000000000000-D.guildRules.weekMs||!whole(session.endsAt)||session.endsAt-session.startsAt!==D.reckoning.sessionMs)return false;
      const event=this.window(session.startsAt);
      if(session.eventId!==event.id||!event.canStart||session.endsAt>event.end||!(session.closedAt===null||session.closedAt===session.endsAt))return false;
      if(!Array.isArray(session.roster)||!session.roster.length||session.roster.length>50||new Set(session.roster.map(member=>member?.id)).size!==session.roster.length||
        !session.roster.every(member=>identity(member?.id)&&typeof member.name==='string'&&member.name.length>=2&&member.name.length<=24)||
        !Array.isArray(session.contributions)||session.contributions.length!==session.roster.length||new Set(session.contributions.map(row=>row?.id)).size!==session.roster.length)return false;
      return session.contributions.every(row=>session.roster.some(member=>member.id===row?.id)&&whole(row.damageUnits)&&row.damageUnits<=maxUnits&&whole(row.hits)&&row.hits===row.sequence&&whole(row.lastAt)&&
        (row.hits>0?row.lastAt>=session.startsAt&&row.lastAt<session.endsAt:row.lastAt===0&&row.damageUnits===0))&&session.contributions.reduce((sum,row)=>sum+row.damageUnits,0)<=maxUnits;
    },
    // Detached event model. The future host owns sessions and verifies combat before recording hits.
    open(guild,actorId,previous=[],now=Date.now()){
      G.assert(S.guilds.valid(guild,{id:actorId})&&S.guilds.can('reckoning',guild,actorId),'Only a Leader or Co-Leader can open an active fight.');
      const event=this.window(now);G.assert(event.canStart,'Open your hour on Sunday between 00:00 and 23:00 UTC.');
      G.assert(Array.isArray(previous)&&previous.every(session=>this.valid(session)),'Use valid event sessions.');
      const current=previous.filter(session=>session.eventId===event.id);
      G.assert(!current.some(session=>session.guildId===guild.id),'This guild already used its one-hour session for this Reckoning.');
      G.assert(!current.some(session=>session.roster.some(member=>guild.members.some(entrant=>entrant.id===member.id))),'A player can represent only one guild per Reckoning.');
      const session={id:G.uid(),guildId:guild.id,guildName:guild.name,eventId:event.id,startsAt:now,endsAt:now+D.reckoning.sessionMs,closedAt:null,
        roster:guild.members.map(member=>({id:member.id,name:member.name})),contributions:guild.members.map(member=>({id:member.id,damageUnits:0,hits:0,sequence:0,lastAt:0}))};
      G.assert(this.valid(session),'Cannot open this fight session.');return session;
    },
    recordHit(session,memberId,{damage,sequence,at}){
      G.assert(this.valid(session),'Choose a valid session.');stamp(at);
      G.assert(session.closedAt===null&&at>=session.startsAt&&at<session.endsAt,'This active fight is over.');
      const existing=session.contributions.find(row=>row.id===memberId);
      G.assert(existing,'Only the locked guild roster can contribute.');
      G.assert(Number.isFinite(damage)&&damage>0&&damage<=1e9,'Use positive, verified boss damage.');
      G.assert(whole(sequence)&&sequence===existing.sequence+1&&at>=existing.lastAt,'This hit is duplicated or out of order.');
      const units=Math.round(damage*1000);G.assert(units>0&&units<=maxUnits-this.totalUnits(session),'This damage total is too large.');
      const next=G.clone(session),row=next.contributions.find(row=>row.id===memberId);
      row.damageUnits+=units;row.sequence=sequence;row.hits++;row.lastAt=at;return next;
    },
    totalUnits(session){return session.contributions.reduce((sum,row)=>sum+row.damageUnits,0);},
    rows(session){
      G.assert(this.valid(session),'Choose a valid fight session.');const total=this.totalUnits(session);
      return session.roster.map(member=>{const row=session.contributions.find(row=>row.id===member.id);return {...member,damage:row.damageUnits/1000,hits:row.hits,share:total?row.damageUnits/total:0};})
        .sort((a,b)=>b.damage-a.damage||a.name.localeCompare(b.name)||a.id.localeCompare(b.id));
    },
    close(session,now=Date.now()){
      G.assert(this.valid(session),'Choose a valid fight session.');stamp(now);G.assert(now>=session.endsAt,'The full hour must finish first.');
      return {...G.clone(session),closedAt:session.endsAt};
    },
    settle(sessions,eventId,now=Date.now()){
      stamp(now);G.assert(Array.isArray(sessions)&&sessions.every(session=>this.valid(session)&&session.eventId===eventId),'Use sessions from the same Reckoning.');
      G.assert(/^\d{4}-\d{2}-\d{2}$/.test(eventId),'Choose a valid Reckoning day.');
      const event=this.window(Date.parse(eventId+'T00:00:00Z'));
      G.assert(event.id===eventId&&now>=event.end,'The Day of Reckoning must end before crowning a guild.');
      G.assert(new Set(sessions.map(session=>session.guildId)).size===sessions.length,'Each guild gets one scoring hour.');
      const entrants=sessions.flatMap(session=>session.roster.map(member=>member.id));
      G.assert(new Set(entrants).size===entrants.length,'A player cannot score for multiple guilds.');
      const standings=sessions.map(session=>({guildId:session.guildId,name:session.guildName,damageUnits:this.totalUnits(session),damage:this.totalUnits(session)/1000,players:this.rows(session)}))
        .sort((a,b)=>b.damageUnits-a.damageUnits||a.name.localeCompare(b.name)||a.guildId.localeCompare(b.guildId));
      const first=standings[0],tied=!!first&&standings[1]?.damageUnits===first.damageUnits,winnerId=first?.damageUnits>0&&!tied?first.guildId:null;
      return {eventId,winnerId,tied,startsAt:event.end,expiresAt:event.end+D.guildRules.weekMs,standings,
        awards:standings.filter(row=>row.damageUnits>0).map(row=>({guildId:row.guildId,points:D.guildRules.warParticipation+(row.guildId===winnerId?D.guildRules.warWinner:0)}))};
    },
    start(){G.assert(false,'Shared Reckoning sessions open with hosting. No fight has been started.');}
  };
})(RPG,RPG.data,RPG.systems);
