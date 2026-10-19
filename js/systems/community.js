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
      if(guild.tasks.week<this.week(now))guild.tasks=this.freshTasks(now,guild.members.length);
      return guild;
    },
    valid(guild,c){
      if(guild===undefined||guild===null)return true;
      if(!object(guild)||typeof guild.id!=='string'||!guild.id.length||guild.id.length>80||!handle(guild.name)||guild.leader!==c.id||!whole(guild.createdAt)||
        !whole(guild.bank)||!whole(guild.points,1e9)||!Array.isArray(guild.members)||!guild.members.length||guild.members.length>D.guildRules.members||
        new Set(guild.members.map(member=>member?.id)).size!==guild.members.length||
        !guild.members.every(member=>object(member)&&typeof member.id==='string'&&member.id.length>0&&member.id.length<=80&&handle(member.name))||
        !guild.members.some(member=>member.id===c.id)||!object(guild.perks)||Object.keys(guild.perks).length!==D.guildPerks.length||
        !D.guildPerks.every(perk=>whole(guild.perks[perk.id],D.guildRules.perkCap)))return false;
      const t=guild.tasks;
      if(!object(t)||!whole(t.week)||t.week!==this.week(t.week)||!Number.isInteger(t.members)||t.members<1||t.members>D.guildRules.members||
        !object(t.progress)||Object.keys(t.progress).length!==D.guildTasks.length||!Array.isArray(t.claimed)||new Set(t.claimed).size!==t.claimed.length||
        !t.claimed.every(id=>D.guildTasks.some(task=>task.id===id))||
        !D.guildTasks.every(task=>whole(t.progress[task.id],task.target*t.members)&&t.claimed.includes(task.id)===(t.progress[task.id]===task.target*t.members)))return false;
      return Array.isArray(guild.ledger)&&guild.ledger.length<=40&&guild.ledger.every(entry=>object(entry)&&['donation','upgrade'].includes(entry.kind)&&whole(entry.at)&&whole(entry.coins)&&whole(entry.points,1e9)&&handle(entry.by)&&typeof entry.note==='string'&&entry.note.length<=80);
    },
    create(name){
      G.ensureIdle();const c=actor();G.assert(c.tutorial&&!S.tutorial.active(c),'Complete the tutorial before founding a guild.');
      G.assert(!c.guild,'You already belong to a guild.');const value=typeof name==='string'?name.trim():'';
      G.assert(handle(value),'Use a guild name of 2–24 characters.');
      c.guild={id:G.uid(),name:value,leader:c.id,createdAt:Date.now(),members:[{id:c.id,name:c.name}],bank:0,points:0,
        perks:Object.fromEntries(D.guildPerks.map(perk=>[perk.id,0])),tasks:this.freshTasks(),ledger:[]};
      G.commit();
    },
    leader(){G.ensureIdle();const c=actor(),guild=this.sync(c);G.assert(guild&&guild.leader===c.id,'Only the guild leader can do that.');return {c,guild};},
    log(guild,entry){guild.ledger.unshift({at:Date.now(),...entry});guild.ledger.length=Math.min(40,guild.ledger.length);},
    donate(coins){
      G.ensureIdle();const c=actor(),guild=this.sync(c);G.assert(guild,'Join a guild before donating.');
      G.assert(whole(coins)&&coins>0,'Enter a positive whole amount of Bronze.');
      G.assert(c.coins>=coins,'Your wallet cannot cover this donation.');G.assert(whole(guild.bank+coins),'The guild bank is full.');
      c.coins-=coins;guild.bank+=coins;this.log(guild,{kind:'donation',coins,points:0,by:c.name,note:'Bank donation'});G.commit();
    },
    quote(id,c=G.character()){
      const guild=c?.guild,perk=D.guildPerks.find(perk=>perk.id===id);G.assert(guild&&perk,'Choose a guild perk.');
      const rank=guild.perks[id],next=rank+1;
      return {rank,next,max:rank>=D.guildRules.perkCap,coins:perk.coins*next*next,points:perk.points*next*next,bonus:Math.min(next,D.guildRules.perkCap)*D.guildRules.perkStep};
    },
    upgrade(id){
      const {c,guild}=this.leader(),quote=this.quote(id,c);G.assert(!quote.max,'This guild perk is at maximum rank.');
      G.assert(guild.points>=quote.points,'Earn more Guild Points from weekly tasks.');G.assert(guild.bank>=quote.coins,'The guild bank needs more donations.');
      guild.points-=quote.points;guild.bank-=quote.coins;guild.perks[id]++;
      this.log(guild,{kind:'upgrade',coins:quote.coins,points:quote.points,by:c.name,note:D.guildPerks.find(perk=>perk.id===id).name+' rank '+quote.next});
      G.runtime.estimate=null;G.commit();
    },
    progress(c,id,amount=1,now=Date.now()){
      const guild=this.sync(c,now),task=D.guildTasks.find(task=>task.id===id);
      if(!guild||!task||!c.tutorial||S.tutorial.active(c)||!whole(amount,1e6)||!amount||guild.tasks.claimed.includes(id))return;
      const target=task.target*guild.tasks.members;guild.tasks.progress[id]=Math.min(target,guild.tasks.progress[id]+amount);
      if(guild.tasks.progress[id]===target){
        guild.tasks.claimed.push(id);const reward=task.points*guild.tasks.members;guild.points=Math.min(1e9,guild.points+reward);
        if(c===G.character())G.notify('Guild task complete: '+task.name+' · +'+G.number(reward)+' Guild Points','success');
      }
    },
    // A shared host must verify the reigning champion; local guild saves cannot award reign.
    reigning(){return false;},
    bonus(c){
      const guild=c?.guild;if(!guild)return {};
      return Object.fromEntries(D.guildPerks.map(perk=>[perk.stat,(guild.perks[perk.id]||0)*D.guildRules.perkStep+(this.reigning(c)?D.guildRules.reignBonus:0)]));
    },
    disband(){const {c}=this.leader();c.guild=null;c.hp=Math.min(c.hp,S.character.stats(c).health);G.runtime.estimate=null;G.commit();},
    // Pure scoring plan for later server integration. No local war, rewards or global champion is fabricated.
    warScore(victories){
      G.assert(Array.isArray(victories)&&victories.length<=D.guildRules.members,'A war roster holds up to 50 players.');
      G.assert(victories.every(n=>whole(n)),'War victories must be whole numbers.');
      return victories.reduce((sum,n)=>sum+Math.min(n,D.guildRules.warMemberCap),0);
    }
  };
})(RPG,RPG.data,RPG.systems);
