'use strict';
(function(G,D,S,U) {
  const names=['Arena','Leagues','Rankings'];
  const money=n=>{
    if(n<100)return G.number(n)+' Bronze';
    if(n<10000)return G.number(n/100,2)+' Silver';
    const gold=Math.floor(n/10000),silver=(n%10000)/100;
    return G.number(gold)+' Gold'+(silver?' '+G.number(silver,2)+' Silver':'');
  };
  const emblem=league=>'<span class="arena-emblem rarity-'+league.index+'" aria-hidden="true">'+U.icon('Colosseum')+'<span>'+String(league.index+1).padStart(2,'0')+'</span></span>';
  const rank=()=>{
    const record=S.colosseum.record(),league=S.colosseum.league(record.points),next=D.leagues[league.index+1];
    return '<section class="panel arena-rank-card rarity-'+league.index+'">'+emblem(league)+'<div class="arena-rank-copy"><span class="eyebrow">YOUR LEAGUE</span><h2>'+league.name+'</h2><div class="arena-points"><strong>'+G.number(record.points)+'</strong><span>League Points</span></div>'+
      '<div class="arena-progress">'+(next?'<div class="bar-label"><span>'+G.number(next.minimum-record.points)+' points to '+next.name+'</span><span>'+G.number(next.minimum)+'</span></div>'+U.bar(record.points-league.minimum,next.minimum-league.minimum,'skill'):'<p class="notes">The highest league. Your points keep growing.</p>'+U.bar(1,1,'skill'))+'</div></div><dl class="arena-record"><div><dt>Victories</dt><dd>'+G.number(record.victories)+'</dd></div><div><dt>Defeats</dt><dd>'+G.number(record.defeats)+'</dd></div></dl></section>';
  };
  const food=()=>{
    const c=G.character(),foods=c.inventory.filter(item=>item.kind==='stack'&&!item.locked&&D.catalog[item.key].healing),selected=c.food;
    return '<section class="panel arena-food"><div class="panel-head"><h3>'+U.icon('food')+' Arena provisions</h3><span class="badge">MANUAL ONLY</span></div><label>Assigned food<select id="arena-food" '+(c.combat||c.activity||c.dungeon||S.tutorial.active()?'disabled':'')+'><option value="">No food assigned</option>'+foods.map(item=>'<option value="'+item.key+'" '+(selected===item.key?'selected':'')+'>'+U.e(D.catalog[item.key].name)+' / '+G.number(item.quantity)+' available</option>').join('')+(selected&&!foods.some(item=>item.key===selected)?'<option value="'+selected+'" selected>'+U.e(D.catalog[selected].name)+' / unavailable</option>':'')+'</select></label><p class="notes">During a match, eat one meal manually with the usual 10-second cooldown. Auto-Eat and bulk eating stay off for both fighters.</p></section>';
  };
  const arena=()=>{
    const c=G.character(),record=S.colosseum.record(),quote=S.colosseum.quote(c),range=S.colosseum.range(record.points);
    return rank()+'<div class="arena-preparation"><section class="panel arena-entry"><div class="panel-head"><h3>Enter the arena</h3><span class="badge">RATED PVP</span></div><div class="arena-quote"><div><small>YOUR ENTRY</small><strong>'+money(quote.entry)+'</strong></div><div><small>SAME-LEAGUE WINNER</small><strong>'+money(quote.prize)+'</strong></div></div><p class="notes arena-pool">Two entries form the prize pool. The winner receives 80%; 20% leaves circulation.</p><div class="arena-match-window"><span>Matchmaking range</span><strong>'+G.number(range.minimum)+' – '+G.number(range.maximum)+' LP</strong><small>An opponent is assigned automatically within '+G.number(range.window)+' League Points. Closer levels are prioritized.</small></div>'+U.btn('Battle','arenaBattle','disabled aria-disabled="true" aria-describedby="arena-connection"','gold-btn arena-battle')+'<p class="notes" id="arena-connection">Battle opens when online matchmaking is connected. No host is connected in this edition.</p><small class="arena-wallet">Your wallet: '+money(c.coins)+'</small></section><div class="arena-side">'+pointRules()+food()+'</div></div>'+
      '<details class="panel arena-rules"><summary>Match rules & prize pool</summary><div class="arena-rules-copy"><p>League Points are your matchmaking rating. The window starts at ±'+G.number(D.colosseum.matchRange)+' points and scales with rating up to ±'+G.number(D.colosseum.maxMatchRange)+'. Opponents must fit both players’ windows; closer combat levels are prioritized, then closer points. You cannot select an opponent.</p><p>Each fighter pays their own league’s entry fee when a real match is committed. The winner receives 80% of the combined pool, rounded down to whole Bronze. Across a league boundary, the two entry fees can differ. No opponent or a cancelled search costs nothing.</p><p>Both fighters begin at full arena health. Manual food is consumed from assigned, unlocked stock; the cooldown is 10 seconds. Arena losses have no campaign death or item-loss penalty. Online matchmaking, shared records and coin settlement will be connected with hosting.</p></div></details>';
  };
  const pointRules=()=>'<section class="panel arena-points-rules arena-point-formula"><h3>League Points per match</h3><dl><div><dt>Base victory</dt><dd>+5</dd></div><div><dt>Opponent level</dt><dd>+1 higher / −1 lower</dd></div><div><dt>Opponent points</dt><dd>+1 higher / −1 lower</dd></div></dl><p class="notes">Equal level or points adds 0. The winner gains 3–7 points; the loser loses that amount, stopping at 0.</p><p class="notes">Level 25 / 12,000 LP vs Level 24 / 11,800 LP: win +3 / −3; lose −7 / +7.</p></section>';
  const leagues=()=>{
    const current=S.colosseum.league(S.colosseum.record().points);
    return '<section class="panel arena-league-intro"><div><h2>Eight leagues. One long climb.</h2><p class="notes">Start at 0 League Points. Ascendant begins at 100,000, with no rank cap beyond it.</p></div><span class="badge">'+current.name.toUpperCase()+'</span></section><div class="arena-leagues">'+D.leagues.map(league=>'<article class="arena-league-card rarity-'+league.index+' '+(league.id===current.id?'current-league':'')+'"><div class="arena-league-name">'+emblem(league)+'<div><h3>'+league.name+'</h3><small>'+(league.id===current.id?'YOUR CURRENT LEAGUE':'LEAGUE '+(league.index+1))+'</small></div></div><div class="arena-league-stat"><small>LEAGUE POINTS</small><strong>'+G.number(league.minimum)+(league.maximum===null?' +':' – '+G.number(league.maximum-1))+'</strong></div><div class="arena-league-stat"><small>ENTRY / FIGHTER</small><strong>'+money(league.entry)+'</strong></div><div class="arena-league-stat"><small>SAME-LEAGUE PRIZE</small><strong>'+money(Math.floor(league.entry*2*4/5))+'</strong></div></article>').join('')+'</div><p class="notes arena-league-footnote">Prizes shown assume two fighters in the same league. Actual prizes use both committed entry fees. Ascendant entry is '+money(D.leagues.at(-1).entry)+' per fighter; the winner receives '+money(Math.floor(D.leagues.at(-1).entry*2*D.colosseum.prizeNumerator/D.colosseum.prizeDenominator))+'.</p>';
  };
  const rankings=()=>{
    const id=['league-points','colosseum-victories'].includes(G.runtime.arenaRanking)?G.runtime.arenaRanking:'league-points',board=D.leaderboards.find(b=>b.id===id),rows=S.leaderboards.rows(id);
    return '<section class="panel arena-rankings"><div class="panel-head"><div><h2>Colosseum rankings</h2><p class="notes">Saved adventurers in this browser. Shared rankings will open with the online arena.</p></div><span class="badge">LOCAL RECORDS</span></div><div class="arena-ranking-controls" role="group" aria-label="Colosseum ranking">'+['league-points','colosseum-victories'].map(key=>U.btn(D.leaderboards.find(b=>b.id===key).name,'arenaRanking','data-id="'+key+'" aria-pressed="'+(id===key)+'"','small '+(id===key?'gold-btn':'quiet'))).join('')+'</div><table class="data-table arena-ranking-table"><thead><tr><th>Adventurer</th><th>League</th><th>'+board.name+'</th></tr></thead><tbody>'+rows.map((row,index)=>'<tr class="'+(row.character.id===G.character().id?'your-ranking':'')+'"><td><div class="leaderboard-character"><span class="rank-number">'+(index+1)+'</span>'+U.characterPortrait(row.character.class,row.character.appearance)+'<div><strong>'+U.e(row.character.name)+'</strong><small>Level '+row.character.level+' / '+({Archer:'Ranger'}[row.character.class]||row.character.class)+'</small></div></div></td><td><span class="arena-league-label rarity-'+S.colosseum.league(S.colosseum.record(row.character).points).index+'">'+S.colosseum.league(S.colosseum.record(row.character).points).rarity+'</span></td><td>'+G.number(row.value)+'</td></tr>').join('')+'</tbody></table></section>';
  };
  U.screens.Colosseum=()=>{
    const tab=names.includes(G.runtime.tab)?G.runtime.tab:'Arena';
    return U.heading('ENTER THE ARENA','Colosseum','Climb the leagues. Win your share of the prize pool.','<span class="badge">ONLINE ARENA IN PREPARATION</span>')+U.tabs(names,tab)+(tab==='Leagues'?leagues():tab==='Rankings'?rankings():arena());
  };
  document.addEventListener('change',event=>{
    if(event.target.id!=='arena-food'||!G.account.playable())return;
    try{
      G.ensureIdle();const key=event.target.value,c=G.character();
      G.assert(!c.dungeon&&!S.tutorial.active(),'Finish the tutorial and leave the dungeon to prepare arena food.');
      G.assert(!key||D.catalog[key]?.healing&&S.inventory.available(key)>0,'Choose unlocked cooked food.');
      c.food=key||null;G.commit();
    }catch(error){G.notify(error.message,'error');U.render();}
  });
})(RPG,RPG.data,RPG.systems,RPG.ui);
