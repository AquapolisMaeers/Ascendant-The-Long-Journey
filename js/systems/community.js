'use strict';
(function(G,D,S) {
  const whole=(n,max=1e15)=>Number.isSafeInteger(n)&&n>=0&&n<=max;
  const object=o=>!!o&&typeof o==='object'&&!Array.isArray(o);
  const handle=s=>typeof s==='string'&&s===s.trim()&&s.length>=2&&s.length<=24&&!/[\u0000-\u001f\u007f]/.test(s);
  const key=s=>s.normalize('NFKC').toLocaleLowerCase('en-US');
  const actor=()=>{const c=G.character();G.assert(c,'Choose a character.');return c;};
  S.community={
    connected(){return false;},
    contacts(c=G.character()){return c.community||{friends:[],ignored:[]};},
    valid(value){
      return value===undefined||object(value)&&['friends','ignored'].every(list=>Array.isArray(value[list])&&value[list].length<=100&&
        new Set(value[list].map(entry=>handle(entry?.handle)?key(entry.handle):'')).size===value[list].length&&
        value[list].every(entry=>object(entry)&&handle(entry.handle)&&whole(entry.createdAt)))&&
        !value.friends.some(friend=>value.ignored.some(blocked=>key(blocked.handle)===key(friend.handle)));
    },
    add(list,name){
      const c=actor();G.assert(['friends','ignored'].includes(list),'Choose Friends or Ignore.');
      const value=typeof name==='string'?name.trim():'';
      G.assert(handle(value),'Use a player name of 2–24 characters.');
      G.assert(key(value)!==key(c.name),'Choose another player.');
      const contacts=this.contacts(c);G.assert(contacts[list].length<100,'This list holds up to 100 names.');
      G.assert(!contacts[list].some(entry=>key(entry.handle)===key(value)),'This name is already on the list.');
      if(list==='friends')G.assert(!contacts.ignored.some(entry=>key(entry.handle)===key(value)),'Remove this player from Ignore first.');
      if(list==='ignored')contacts.friends=contacts.friends.filter(entry=>key(entry.handle)!==key(value));
      contacts[list].push({handle:value,createdAt:Date.now()});c.community=contacts;G.commit();
    },
    remove(list,name){
      G.assert(['friends','ignored'].includes(list),'Choose Friends or Ignore.');
      const c=actor(),contacts=this.contacts(c);contacts[list]=contacts[list].filter(entry=>key(entry.handle)!==key(name));c.community=contacts;G.commit();
    },
    ignored(name,c=G.character()){return handle(name)&&this.contacts(c).ignored.some(entry=>key(entry.handle)===key(name));},
    send(){G.assert(false,'Chat opens when a shared host is connected. Your message has not been sent.');}
  };
  S.guilds={
    // Monday 00:00 UTC. Store an absolute start so reloads and local time zones agree.
    week(now=Date.now()){
      G.assert(whole(now),'Choose a valid date.');const d=new Date(now);d.setUTCHours(0,0,0,0);d.setUTCDate(d.getUTCDate()-(d.getUTCDay()+6)%7);return d.getTime();
    },
    freshTasks(now=Date.now(),members=1){return {week:this.week(now),members,progress:Object.fromEntries(D.guildTasks.map(task=>[task.id,0])),claimed:[]};},
    sync(c=G.character(),now=Date.now()){
      const guild=c?.guild;if(!guild)return null;
      if(guild.tasks.week<this.week(now)){guild.tasks=this.freshTasks(now,guild.members.length);this.touch(guild);}
      return guild;
    },
    migrate(guild,c){
      if(!guild||![undefined,2].includes(guild.version))return;
      G.assert(this.valid(guild,c,guild.version===2?2:true),'Invalid save: legacy guild');
      if(guild.version===undefined){
        for(const perk of D.guildPerks)guild.perks[perk.id]??=0;
        for(const member of guild.members)member.role=member.id===guild.leader?'Leader':'Member';
      }
      const upgradeXp=D.guildPerks.reduce((sum,perk)=>{const n=guild.perks[perk.id];return sum+perk.points*n*(n+1)*(2*n+1)/6*D.guildRules.upgradeXp;},0);
      const taskXp=guild.tasks.claimed.reduce((sum,id)=>sum+D.guildTasks.find(task=>task.id===id).points*D.guildRules.taskXp,0);
      guild.progress={xp:upgradeXp+taskXp,totalTasks:guild.tasks.claimed.length};
      guild.updatedAt=Math.max(guild.createdAt,c.lastSeen||0);
      if(c.stats&&c.stats.guildDonated===undefined){
        const unique=guild.members.filter(member=>member.name===c.name).length===1;
        c.stats.guildDonated=unique?Math.min(1e15,guild.ledger.filter(entry=>entry.kind==='donation'&&entry.by===c.name).reduce((sum,entry)=>sum+entry.coins,0)):0;
      }
      for(const task of D.guildTasks)if(guild.tasks.claimed.includes(task.id))guild.tasks.progress[task.id]=task.target*guild.tasks.members;
      guild.version=D.guildRules.version;
    },
    valid(guild,c,legacy=false){
      if(guild===undefined||guild===null)return true;
      const first=legacy===true,perks=first?D.guildPerks.slice(0,3):D.guildPerks;
      if(!object(guild)||typeof guild.id!=='string'||!guild.id.length||guild.id.length>80||!handle(guild.name)||typeof guild.leader!=='string'||first&&guild.leader!==c.id||!whole(guild.createdAt)||
        (first?guild.version!==undefined:guild.version!==(legacy===2?2:D.guildRules.version))||
        !legacy&&(!whole(guild.updatedAt)||guild.updatedAt<guild.createdAt||!object(guild.progress)||!whole(guild.progress.xp,1e12)||!whole(guild.progress.totalTasks,1e9))||
        !whole(guild.bank)||!whole(guild.points,1e9)||!Array.isArray(guild.members)||!guild.members.length||guild.members.length>D.guildRules.members||
        new Set(guild.members.map(member=>member?.id)).size!==guild.members.length||
        !guild.members.every(member=>object(member)&&typeof member.id==='string'&&member.id.length>0&&member.id.length<=80&&handle(member.name))||
        !guild.members.some(member=>member.id===c.id)||!guild.members.some(member=>member.id===guild.leader)||
        !first&&(!guild.members.every(member=>D.guildRoles.some(role=>role.id===member.role))||guild.members.filter(member=>member.role==='Leader').length!==1||guild.members.find(member=>member.id===guild.leader).role!=='Leader')||
        !object(guild.perks)||Object.keys(guild.perks).length!==perks.length||
        !perks.every(perk=>whole(guild.perks[perk.id],D.guildRules.perkCap)))return false;
      const t=guild.tasks;
      if(!object(t)||!whole(t.week)||t.week!==this.week(t.week)||!Number.isInteger(t.members)||t.members<1||t.members>D.guildRules.members||
        !object(t.progress)||Object.keys(t.progress).length!==D.guildTasks.length||!Array.isArray(t.claimed)||new Set(t.claimed).size!==t.claimed.length||
        !t.claimed.every(id=>D.guildTasks.some(task=>task.id===id))||
        !D.guildTasks.every((task,index)=>{const target=(first?[100,15,300,50,10,5][index]:legacy===2?[1000,100,5000,1000,50,25][index]:task.target)*t.members;return whole(t.progress[task.id],target)&&t.claimed.includes(task.id)===(t.progress[task.id]===target);})||!legacy&&guild.progress.totalTasks<t.claimed.length)return false;
      return Array.isArray(guild.ledger)&&guild.ledger.length<=40&&guild.ledger.every(entry=>object(entry)&&['donation','upgrade'].includes(entry.kind)&&whole(entry.at)&&whole(entry.coins)&&whole(entry.points,1e9)&&handle(entry.by)&&typeof entry.note==='string'&&entry.note.length<=80);
    },
    create(name){
      G.ensureIdle();const c=actor();G.assert(c.tutorial&&!S.tutorial.active(c),'Complete the tutorial before founding a guild.');
      G.assert(!c.guild,'You already belong to a guild.');const value=typeof name==='string'?name.trim():'';
      G.assert(handle(value),'Use a guild name of 2–24 characters.');
      const now=Date.now();
      c.guild={version:D.guildRules.version,id:G.uid(),name:value,leader:c.id,createdAt:now,updatedAt:now,progress:{xp:0,totalTasks:0},members:[{id:c.id,name:c.name,role:'Leader'}],bank:0,points:0,
        perks:Object.fromEntries(D.guildPerks.map(perk=>[perk.id,0])),tasks:this.freshTasks(),ledger:[]};
      G.commit();
    },
    leader(){G.ensureIdle();const c=actor(),guild=this.sync(c);G.assert(guild&&guild.leader===c.id,'Only the guild leader can do that.');return {c,guild};},
    touch(guild){guild.updatedAt=Math.max(guild.updatedAt||guild.createdAt,Date.now());},
    threshold(level){return D.guildRules.levelXp*level*(level-1)/2;},
    level(guild=G.character()?.guild){
      const xp=guild?.progress?.xp||0,level=Math.min(D.guildRules.levelCap,Math.max(1,Math.floor((1+Math.sqrt(1+8*xp/D.guildRules.levelXp))/2)));
      return {level,xp,current:level===D.guildRules.levelCap?0:xp-this.threshold(level),required:level===D.guildRules.levelCap?0:D.guildRules.levelXp*level,max:level===D.guildRules.levelCap};
    },
    grantXp(guild,amount){G.assert(whole(amount,1e12),'Guild XP must be a non-negative whole amount.');guild.progress.xp=Math.min(1e12,guild.progress.xp+amount);this.touch(guild);},
    rankings(id){
      G.assert(['guild-level','guild-wealth'].includes(id),'Choose a guild ranking.');
      const copies=new Map();
      for(const c of G.state.slots.filter(Boolean)){
        const guild=c.guild;if(!guild)continue;const previous=copies.get(guild.id);
        if(!previous||guild.updatedAt>previous.updatedAt||guild.updatedAt===previous.updatedAt&&c.id===G.character()?.id)copies.set(guild.id,guild);
      }
      return [...copies.values()].map(guild=>({guild,value:id==='guild-level'?this.level(guild).level:guild.bank,tie:id==='guild-level'?guild.progress.xp:0}))
        .sort((a,b)=>b.value-a.value||b.tie-a.tie||a.guild.name.localeCompare(b.guild.name)||a.guild.id.localeCompare(b.guild.id));
    },
    role(guild,id){return guild?.members.find(member=>member.id===id)?.role||null;},
    can(action,guild=G.character()?.guild,id=G.character()?.id){
      const role=this.role(guild,id),rank=D.guildRoles.find(entry=>entry.id===role)?.rank??-1;
      return ['participate','donate'].includes(action)?rank>=0:['upgrade','reckoning','roles'].includes(action)?rank>=3:['invite','remove'].includes(action)?rank>=2:['transfer','disband'].includes(action)?role==='Leader':false;
    },
    setRole(memberId,role){
      G.ensureIdle();const c=actor(),guild=this.sync(c),member=guild?.members.find(entry=>entry.id===memberId);
      const own=D.guildRoles.find(entry=>entry.id===this.role(guild,c.id)),target=D.guildRoles.find(entry=>entry.id===member?.role),next=D.guildRoles.find(entry=>entry.id===role);
      G.assert(this.can('roles',guild,c.id)&&member&&member.id!==c.id&&next&&next.id!=='Leader'&&own.rank>target.rank&&own.rank>next.rank,'You can only manage ranks below your own.');
      member.role=role;this.touch(guild);G.commit();
    },
    transfer(memberId){
      const {c,guild}=this.leader(),member=guild.members.find(entry=>entry.id===memberId);G.assert(member&&member.id!==c.id,'Choose another guild member.');
      guild.members.find(entry=>entry.id===c.id).role='Co-Leader';member.role='Leader';guild.leader=member.id;this.touch(guild);G.commit();
    },
    log(guild,entry){guild.ledger.unshift({at:Date.now(),...entry});guild.ledger.length=Math.min(40,guild.ledger.length);},
    donate(coins){
      G.ensureIdle();const c=actor(),guild=this.sync(c);G.assert(guild,'Join a guild before donating.');
      G.assert(this.can('donate',guild,c.id),'Only members can donate.');G.assert(whole(coins)&&coins>0,'Enter a positive whole amount of Bronze.');
      G.assert(c.coins>=coins,'Your wallet cannot cover this donation.');G.assert(whole(guild.bank+coins),'The guild bank is full.');
      c.coins-=coins;guild.bank+=coins;c.stats.guildDonated=Math.min(1e15,(c.stats.guildDonated||0)+coins);this.touch(guild);this.log(guild,{kind:'donation',coins,points:0,by:c.name,note:'Bank donation'});G.commit();
    },
    quote(id,c=G.character()){
      const guild=c?.guild,perk=D.guildPerks.find(perk=>perk.id===id);G.assert(guild&&perk,'Choose a guild perk.');
      const rank=guild.perks[id],next=rank+1;
      return {rank,next,max:rank>=D.guildRules.perkCap,coins:perk.coins*next*next,points:perk.points*next*next,bonus:Math.min(next,D.guildRules.perkCap)*perk.step};
    },
    upgrade(id){
      G.ensureIdle();const c=actor(),guild=this.sync(c);G.assert(this.can('upgrade',guild,c.id),'Only Leaders and Co-Leaders can buy guild upgrades.');
      const quote=this.quote(id,c);G.assert(!quote.max,'This guild perk is at maximum rank.');
      G.assert(guild.points>=quote.points,'Earn more Guild Points from weekly tasks.');G.assert(guild.bank>=quote.coins,'The guild bank needs more donations.');
      guild.points-=quote.points;guild.bank-=quote.coins;guild.perks[id]++;
      this.grantXp(guild,quote.points*D.guildRules.upgradeXp);
      this.log(guild,{kind:'upgrade',coins:quote.coins,points:quote.points,by:c.name,note:D.guildPerks.find(perk=>perk.id===id).name+' rank '+quote.next});
      G.runtime.estimate=null;G.commit();
    },
    progress(c,id,amount=1,now=Date.now()){
      const guild=this.sync(c,now),task=D.guildTasks.find(task=>task.id===id);
      if(!guild||!this.can('participate',guild,c.id)||!task||!c.tutorial||S.tutorial.active(c)||!whole(amount,1e6)||!amount||guild.tasks.claimed.includes(id))return;
      const target=task.target*guild.tasks.members;guild.tasks.progress[id]=Math.min(target,guild.tasks.progress[id]+amount);this.touch(guild);
      if(guild.tasks.progress[id]===target){
        guild.tasks.claimed.push(id);const reward=task.points*guild.tasks.members;guild.points=Math.min(1e9,guild.points+reward);
        guild.progress.totalTasks=Math.min(1e9,guild.progress.totalTasks+1);this.grantXp(guild,task.points*D.guildRules.taskXp);
        if(c===G.character())G.notify('Guild task complete: '+task.name+' · +'+G.number(reward)+' Guild Points','success');
      }
    },
    // A shared host must verify the reigning champion; local guild saves cannot award reign.
    reigning(){return false;},
    bonus(c){
      const guild=c?.guild;if(!guild)return {};
      if(!this.can('participate',guild,c.id))return {};
      return Object.fromEntries(D.guildPerks.map(perk=>[perk.stat,(guild.perks[perk.id]||0)*perk.step+(this.reigning(c)&&D.reckoning.stats.includes(perk.stat)?D.guildRules.reignBonus:0)]));
    },
    disband(){const {c}=this.leader();c.guild=null;c.hp=Math.min(c.hp,S.character.stats(c).health);G.runtime.estimate=null;G.commit();},
  };
})(RPG,RPG.data,RPG.systems);
