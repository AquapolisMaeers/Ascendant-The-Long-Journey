'use strict';
(function(G,D,S,U) {
  U.enhanceConfirmation = id => {
    G.ensureIdle();const item=S.items.find(id);
    G.assert(item?.kind==='gear'&&item.enhance<25,'Choose equipment that can be enhanced.');
    const q=S.upgrades.quote(item);
    G.runtime.enhancePending={id,enhance:item.enhance,rarity:item.rarity};
    const guide=U.prefixGuide(item).replace('<details class="possible-prefixes">','<details class="possible-prefixes" open>');
    U.modal('Confirm enhancement: '+U.e(U.itemName(item)),
      '<p>+'+item.enhance+' → +'+(item.enhance+1)+' · '+G.percent(q.chance,0)+' success · '+G.money(q.coins)+'</p>'+
      U.upgradePreview(item,false)+U.ingredients(q.cost)+guide+
      '<p>Materials and coins are consumed on an attempt. Failure preserves this item and increases fail protection.</p>'+
      '<div class="modal-actions">'+U.btn('Back to item','enhanceCancel','','quiet')+
      U.btn('Confirm enhancement','enhanceConfirm','','primary')+'</div>');
  };
  const character=U.screens.Character;
  U.screens.Character=()=>{
    const html=character();
    return !G.runtime.tab||G.runtime.tab==='Equipment'?html+
      '<section class="panel spacer cosmetic-slots"><h3>Outfits & auras</h3><p class="notes spacer">Additional equipment slots · Coming soon. Base items will have no Enhancement or Ascension.</p>'+
      '<div class="grid-2 spacer"><div class="cosmetic-slot">'+U.icon('Plate')+'<strong>Outfit</strong><span class="badge">Coming soon</span></div>'+
      '<div class="cosmetic-slot">'+U.icon('gem')+'<strong>Aura</strong><span class="badge">Coming soon</span></div></div></section>':html;
  };
  U.screens.Leaderboards=()=>{
    const group=['All','Combat','Skills','Journey'].includes(G.runtime.tab)?G.runtime.tab:'All';
    const id=G.runtime.leaderboard||D.leaderboards.find(b=>group==='All'||b.group===group).id;
    const current=D.leaderboards.find(b=>b.id===id&&(group==='All'||b.group===group))||D.leaderboards.find(b=>group==='All'||b.group===group);
    const rows=S.leaderboards.rows(current.id);
    return U.heading('LOCAL CHRONICLES','Leaderboards','Rank your saved characters in this browser. Sixteen pursuits, one long journey.')+
      U.tabs(['All','Combat','Skills','Journey'],group)+
      '<section class="panel"><label>Ranking category<select id="leaderboard-category">'+
      D.leaderboards.filter(b=>group==='All'||b.group===group).map(b=>'<option value="'+b.id+'" '+(b.id===current.id?'selected':'')+'>'+b.name+'</option>').join('')+
      '</select></label><p class="notes spacer">Local characters only. Level ties use XP within that level. Creatures Defeated includes regular, elite and boss victories.</p>'+
      '<table class="data-table leaderboard-table spacer"><thead><tr><th>Rank / character</th><th>'+current.name+'</th></tr></thead><tbody>'+
      rows.map((row,i)=>'<tr class="'+(row.character.id===G.character().id?'your-ranking':'')+'"><td><div class="leaderboard-character">'+
        '<span class="rank-number">'+(i+1)+'</span>'+U.characterPortrait(row.character.class,row.character.appearance)+
        '<div><strong>'+U.e(row.character.name)+'</strong><small>'+row.character.class+' · '+row.character.mode+(row.character.debugUsed?' · Developer tools used':'')+'</small></div></div></td>'+
        '<td>'+ (current.id==='coins'?G.money(row.value):G.number(row.value,['damage','defence','health'].includes(current.id)?2:0))+
        (current.tie?'<small>'+G.number(row.tie)+' XP</small>':'')+'</td></tr>').join('')+
      '</tbody></table></section>';
  };
  U.screens.Companions=()=>{
    const c=G.character(),p=S.companions.view(c.companion),d=S.companions.definition(p);
    const foods=c.inventory.filter(i=>i.kind==='stack'&&!i.locked&&D.catalog[i.key].healing);
    const intro=U.heading('A FRIEND FOR THE ROAD','Companions','Raise a companion. Keep it fed. Earn its loyalty.');
    if(!p) return intro+'<p class="notes spacer">One companion per character. Feeding uses cooked food. Hunger falls 10 per hour, including time away; starvation removes bonuses and eventually requires revival.</p>'+
      '<div class="grid-3 spacer">'+D.companions.map(entry=>'<section class="panel companion-card">'+U.portraitArt(entry.portrait)+
      '<h3 class="spacer">'+entry.name+'</h3><p class="notes spacer">'+entry.description+'</p><p class="notes spacer">Levels 1–20 · 10 XP per gathering/crafting action · 25 × enemy level XP per victory.</p>'+
      U.btn('Adopt · '+entry.price+' Bronze','adoptCompanion','data-type="'+entry.id+'" '+(c.combat||c.activity||c.dungeon||S.tutorial.active()||c.coins<entry.price?'disabled':''),'gold-btn')+'</section>').join('')+'</div>';
    const bonus=S.companions.bonus(c),value=bonus[d.stat]||0,revive=p.level*D.companionRules.revivePerLevel;
    return intro+'<div class="grid-2"><section class="panel companion-card">'+U.portraitArt(d.portrait)+
      '<div class="row between spacer"><h2>'+d.name+'</h2><span class="badge">'+(p.alive?p.active?'BONUS ACTIVE':'HUNGRY':'STARVED')+'</span></div>'+
      '<div class="bar-label spacer"><span>LEVEL '+p.level+'</span><span>'+G.number(p.xp)+' / '+(p.level===20?'MAX':G.number(S.companions.xpNext(p.level)))+' XP</span></div>'+
      U.bar(p.xp,p.level===20?1:S.companions.xpNext(p.level),'skill')+
      '<div class="meta-row"><span>Hunger</span><strong id="companion-hunger">'+G.number(p.hunger,1)+' / 100</strong></div>'+U.bar(p.hunger,100)+
      '<div class="meta-row"><span>Vitality</span><strong id="companion-health">'+G.number(p.health,1)+' / 100</strong></div>'+U.bar(p.health,100,'hp')+
      '<div class="meta-row"><span>'+D.labels[d.stat]+'</span><strong id="companion-bonus">+'+U.statValue(d.stat,value)+'</strong></div>'+
      '<p class="notes spacer">'+d.description+' Bonuses apply while fed and alive; a committed fight keeps its starting stats.</p></section>'+
      '<section class="panel"><h3>Care & upkeep</h3><p class="notes spacer">Hunger loses 10 points per hour, even offline. At zero hunger, bonuses stop and vitality loses 10 per hour. Starved companions keep their levels but need paid revival.</p>'+
      (p.alive?'<label class="spacer">Cooked food<select id="companion-food">'+(foods.length?foods.map(i=>'<option value="'+i.key+'">'+U.e(D.catalog[i.key].name)+' · '+i.quantity+' owned · +'+Math.min(50,Math.max(10,D.catalog[i.key].healing))+' hunger</option>').join(''):'<option value="">No unlocked cooked food</option>')+'</select></label><div class="row spacer">'+
        U.btn('Feed one meal','feedCompanion',!foods.length||c.combat||c.activity||p.hunger>=100&&p.health>=100?'disabled':'','gold-btn')+'</div><p class="notes spacer">A meal restores 10–50 hunger plus half as much vitality. Locked food stays protected.</p>':
        U.btn('Revive · '+G.number(revive)+' Bronze','reviveCompanion',c.combat||c.activity||c.coins<revive?'disabled':'','gold-btn spacer'))+
      '<p class="notes spacer">Train together through active gathering, crafting and victories. Offline training does not level companions.</p>'+
      U.btn('Release companion','releaseCompanion',c.combat||c.activity?'disabled':'','danger spacer')+'</section></div>';
  };
  U.screens.Emporium=()=>{
    const c=G.character(),claimed=Object.keys(c.ascendantRewards||{}).length;
    return U.heading('THE ASCENDANT EMPORIUM','Ascendant Coins','A currency earned through achievements, combat levels and major milestones.',
      '<span class="badge">'+G.number(c.ascendantCoins||0)+' ASCENDANT COINS</span>')+
      '<div class="grid-2"><section class="panel"><h2>Coming soon</h2><p class="notes spacer">The Ascendant Emporium is being prepared. Its inventory and prices are TBD.</p>'+
      '<div class="cosmetic-slot spacer">'+U.icon('gem')+'<strong>Ascendant currency shop</strong><span class="badge">Coming soon</span></div>'+
      '<p class="notes spacer">Purchasing Ascendant Coins with real money is not available.</p></section><section class="panel"><h3>Earn your coins</h3>'+
      '<div class="meta-row"><span>Each combat level after Level 1</span><strong>2 coins</strong></div>'+
      '<div class="meta-row"><span>Each achievement</span><strong>5 coins</strong></div>'+
      '<div class="meta-row"><span>Achievement with a prestige title</span><strong>50 coins</strong></div>'+
      '<p class="notes spacer">Combat milestones grant additional coins:</p><div class="milestone-coins">'+
      Object.entries(D.ascendantCurrency.milestones).map(([level,n])=>'<div class="meta-row"><span>Level '+level+'</span><strong>+'+n+' coins</strong></div>').join('')+
      '</div><p class="notes spacer">'+claimed+' rewards recorded. Each reward is earned once per character; older characters receive credit for recorded achievements and combat levels.</p></section></div>';
  };
  const live=U.live;
  U.live=()=>{
    live();const c=G.character();if(!c)return;
    const wallet=document.getElementById('ascendant-coins');if(wallet)wallet.textContent=G.number(c.ascendantCoins||0);
    if(G.runtime.page==='Companions'&&c.companion) {
      const p=S.companions.view(c.companion),set=(id,text)=>{const el=document.getElementById(id);if(el)el.textContent=text};
      set('companion-hunger',G.number(p.hunger,1)+' / 100');set('companion-health',G.number(p.health,1)+' / 100');
      const d=S.companions.definition(p);set('companion-bonus','+'+U.statValue(d.stat,S.companions.bonus(c)[d.stat]||0));
    }
  };
})(RPG,RPG.data,RPG.systems,RPG.ui);
