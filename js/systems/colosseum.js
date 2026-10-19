'use strict';
(function(G,D,S) {
  const whole=n=>Number.isSafeInteger(n)&&n>=0;
  const checkLevel=level=>G.assert(Number.isInteger(level)&&level>=1&&level<=D.config.levelCap,'Choose a valid combat level.');
  const food=c=>({key:c.food,count:c.food?S.inventory.available(c.food,c):0,heal:D.catalog[c.food]?.healing||0,threshold:0,ready:0,used:0});
  S.colosseum={
    // Hosting and a shared queue will supply real opponents and authoritative settlement later.
    connected() { return false; },
    record(c=G.character()) { return c.colosseum||{points:0,victories:0,defeats:0}; },
    valid(record) { return record===undefined||!!record&&typeof record==='object'&&!Array.isArray(record)&&['points','victories','defeats'].every(key=>whole(record[key])); },
    league(points) {
      G.assert(whole(points),'League Points must be a non-negative whole number.');
      return D.leagues.findLast(league=>points>=league.minimum);
    },
    range(points) { this.league(points);return {minimum:Math.max(0,points-D.colosseum.matchRange),maximum:Math.min(Number.MAX_SAFE_INTEGER,points+D.colosseum.matchRange)}; },
    winPoints(winnerLevel,loserLevel) {
      checkLevel(winnerLevel);checkLevel(loserLevel);
      return D.colosseum.winPoints+Math.sign(loserLevel-winnerLevel)*D.colosseum.levelAdjustment;
    },
    quote(a,b=a) {
      const own=this.league(this.record(a).points),other=this.league(this.record(b).points),pool=own.entry+other.entry;
      const prize=Math.floor(pool*D.colosseum.prizeNumerator/D.colosseum.prizeDenominator);
      return {entry:own.entry,otherEntry:other.entry,pool,prize,retained:pool-prize};
    },
    canMatch(a,b) {
      if(!a||!b||typeof a.id!=='string'||typeof b.id!=='string'||a.id===b.id||a.accountId&&a.accountId===b.accountId)return false;
      const left=this.record(a).points,right=this.record(b).points;
      return whole(left)&&whole(right)&&Math.abs(left-right)<=D.colosseum.matchRange;
    },
    selectOpponent(player,queue,random) {
      G.assert(typeof random==='function','Matchmaking requires its own random source.');
      const candidates=queue.filter(other=>other.online===true&&other.ready===true&&this.canMatch(player,other)&&Number.isSafeInteger(other.coins)&&other.coins>=this.quote(other).entry);
      if(!Number.isSafeInteger(player.coins)||player.coins<this.quote(player).entry)return null;
      return candidates.length?G.pick(random,candidates):null;
    },
    // A pure settlement plan. This does not award local points or move coins.
    settlement(a,b,winnerId) {
      G.assert(this.canMatch(a,b),'These fighters are outside the matchmaking window.');
      G.assert(winnerId===a.id||winnerId===b.id,'The winner must be a participant.');
      const quote=this.quote(a,b);
      G.assert(whole(a.coins)&&whole(b.coins)&&a.coins>=quote.entry&&b.coins>=quote.otherEntry,'Both fighters must afford their locked entry fees.');
      const winner=winnerId===a.id?a:b,loser=winner===a?b:a,gained=this.winPoints(winner.level,loser.level);
      G.assert(Number.isSafeInteger(this.record(winner).points+gained),'League Point total is too large to store safely.');
      const awards=[a,b].map((fighter,index)=>({id:fighter.id,entry:index===0?quote.entry:quote.otherEntry,
        coinDelta:(fighter.id===winnerId?quote.prize:0)-(index===0?quote.entry:quote.otherEntry),
        points:fighter.id===winnerId?gained:0,victories:fighter.id===winnerId?1:0,defeats:fighter.id===winnerId?0:1}));
      G.assert(awards.every((award,index)=>whole([a,b][index].coins+award.coinDelta)&&[a,b][index].coins+award.coinDelta<=1e15),'A coin balance cannot hold this payout.');
      return {...quote,winnerId,awards};
    },
    // Detached combat state for the future shared match service; campaign saves stay untouched.
    createFight(a,b,seed) {
      G.assert(this.canMatch(a,b),'These fighters are outside the matchmaking window.');
      const own=S.character.stats(a),other=S.character.stats(b),matchSeed=seed||G.seed();
      const f=S.kernel.create({...a,hp:own.health},{...other,name:b.name,type:'pvp',appearance:G.clone(b.appearance),class:b.class},matchSeed);
      f.food=food(a);f.enemyFood=food(b);f.participants=[a.id,b.id];f.pvp=true;
      // PvP must apply slowing talents symmetrically; the shared kernel already applies the first fighter's chill.
      if(f.enemy.chill)f.player.interval*=1+f.enemy.chill*(f.enemy.deepFreeze?2:1);
      f.nextPlayer=f.player.interval+(matchSeed%2?1e-6:0);f.nextEnemy=f.enemy.interval+(matchSeed%2?0:1e-6);
      return f;
    },
    advance(f,until,events=[]) {
      G.assert(f?.pvp&&!f.finished&&Number.isFinite(until)&&until>=f.time,'Choose an active arena fight and a valid time.');
      f.food.threshold=0;f.enemyFood.threshold=0;
      return S.kernel.advance(f,until,events);
    },
    eat(f,side,events=[]) {
      G.assert(f?.pvp&&!f.finished&&['player','enemy'].includes(side),'Choose an active arena fighter.');
      const snapshot=side==='player'?f:{player:f.enemy,food:f.enemyFood,time:f.time};
      const gains=[];const used=S.kernel.eat(snapshot,gains);
      for(const event of gains)events.push({...event,side});return used;
    },
    battle() { G.assert(false,'Online matchmaking is not connected yet. No entry fee has been charged.'); }
  };
})(RPG,RPG.data,RPG.systems);
