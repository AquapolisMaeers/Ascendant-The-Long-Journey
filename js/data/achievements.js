'use strict';
(function(D) {
  D.achievements = [];
  const add = (id, name, group, target, metric, title) => D.achievements.push({
    id,
    name,
    group,
    target,
    metric,
    title
  });
  const counter = (key, name, steps) => steps.forEach(n => add(key + '-' + n, name + ' · ' + n.toLocaleString(), 'Journey', n, c => c.stats[key]));
  counter('advance', 'Advance', [1, 100, 1000, 10000, 100000, 1000000]);
  counter('regular', 'Regular creatures', [1, 100, 1000, 10000, 100000]);
  counter('elite', 'Elites', [1, 100, 1000, 10000]);
  add('world', 'Unlock all eleven locations', 'Journey', 100, c => c.level, 'The Wayfarer');
  D.dungeons.forEach(d => {
    add('boss-' + d.id, d.boss, 'Dungeons', 1, c => +!!c.stats.bossKills[d.id]);
    add('collection-' + d.id, d.prefix + ' personal drop collection', 'Dungeons', 10, c => (c.stats.bossDrops[d.id] || []).length);
  });
  [10, 50, 100].forEach(n => add('dungeons-' + n, n + ' dungeon completions', 'Dungeons', n, c => c.stats.dungeons));
  add('conqueror', 'Defeat all five bosses', 'Dungeons', 5, c => Object.keys(c.stats.bossKills).length, 'The Conqueror');
  D.skills.forEach(skill => [25, 50, 75, 100].forEach(n => add('skill-' + skill + '-' + n, skill + ' level ' + n, 'Skills', n, c => c.skills[skill].level)));
  add('artisan', 'Master all eight skills', 'Skills', D.skills.length, c => D.skills.filter(s => c.skills[s].level === 100).length, 'Master Artisan');
  [10, 25, 50, 75, 100].forEach(n => add('level-' + n, 'Character level ' + n, 'Journey', n, c => c.level, n === 100 ? 'The Legend' : null));
  ['bars', 'cooked', 'facets'].forEach(key => [100, 1000, 10000, 100000].forEach(n => add(key + '-' + n, n.toLocaleString() + ' ' + ({
    bars: 'bars smithed',
    cooked: 'fish cooked',
    facets: 'Faceting attempts'
  } [key]), 'Crafting', n, c => c.stats[key])));
  add('enhance-first', 'First successful Enhancement', 'Equipment', 1, c => c.stats.enhancements);
  [5, 15, 25].forEach(n => add('enhance-' + n, 'Reach +' + n, 'Equipment', n, c => c.stats.maxEnhance));
  add('equipped', 'Equip all eight slots', 'Equipment', 8, c => Object.values(c.equipment).filter(Boolean).length);
  add('full25', 'Equip eight +25 items', 'Equipment', 8, c => Object.values(c.equipment).filter(i => i?.enhance === 25).length);
  for (let i = 0; i < 7; i++) add('ascension-' + i, D.rarity[i] + ' → ' + D.rarity[i + 1], 'Equipment', 1, c => +c.stats.ascensions.includes(i));
  add('ascendant', 'Eight Ascendant +25 items', 'Equipment', 8, c => Object.values(c.equipment).filter(i => i?.enhance === 25 && i.rarity === 7).length, 'The Ascendant');
  add('socket-first', 'Socket your first gem', 'Gems', 1, c => c.stats.socketed);
  for (let rank = 2; rank <= 5; rank++) add('gem-' + rank, 'Create Gem ' + D.roman[rank], 'Gems', 1, c => +c.stats.gemCreated.includes(rank));
  add('socket25', 'Fill every socket of a +25 item', 'Gems', 1, c => +[...c.inventory, ...Object.values(c.equipment)].some(i => i?.kind === 'gear' && i.enhance === 25 && i.gems.filter(Boolean).length === (i.boss !== null ? 5 : 3)));
  add('boss-sockets', 'Full Boss Socket · 40/40', 'Gems', 40, c => Object.values(c.equipment).filter(i => i?.boss !== null && i?.enhance === 25).reduce((n, i) => n + i.gems.filter(Boolean).length, 0));
  add('gem-extreme', 'Forty simultaneous Gem V', 'Gems', 40, c => Object.values(c.equipment).filter(i => i?.boss !== null && i?.enhance === 25).reduce((n, i) => n + i.gems.filter(k => k && D.catalog[k].rank === 5).length, 0));
  ['listing', 'sale', 'purchase'].forEach(key => add('market-' + key, 'First ' + ({
    listing: 'listing',
    sale: 'completed sale',
    purchase: 'purchase'
  } [key]), 'Marketplace', 1, c => c.stats[key]));
  const launchIds = D.achievements.map(a => a.id);
  add('completionist', 'Every launch achievement', 'Prestige', launchIds.length, c => launchIds.filter(id => c.achievements[id]).length, 'The Completionist');
  [1, 10, 100, 1000, 10000].forEach(n => add('quests-' + n, 'Quests completed · ' + n.toLocaleString(), 'Quests', n, c => c.questCompletions ?? 0));
  add('companion-first', 'Adopt your first companion', 'Companions', 1, c => +!!c.companion);
  [5, 10, 15, 20].forEach(n => add('companion-level-' + n, 'Companion level ' + n, 'Companions', n, c => c.companion?.level ?? 0));
  // Additive milestones keep earned legacy achievements and launch requirements.
  [5,10].forEach(n=>add('farming-level-'+n,'Farming level '+n,'Skills',n,c=>c.skills.Farming.level));
  [1,100,1000,10000].forEach(n=>add('harvest-'+n,'Harvest '+n.toLocaleString()+' fibres','Farming',n,c=>c.stats.harvested||0));
  [1,100,1000].forEach(n=>add('textiles-'+n,'Refine '+n.toLocaleString()+' leather or cloth','Crafting',n,c=>c.stats.textiles||0));
  [1,10,100].forEach(n=>add('secondary-craft-'+n,'Smith '+n+' secondaries','Crafting',n,c=>c.stats.secondaries||0));
  add('secondary-equipped','Equip a class secondary','Equipment',1,c=>+!!c.equipment.Secondary);
  add('equipped-nine','Equip all nine slots','Equipment',9,c=>Object.values(c.equipment).filter(Boolean).length);
  add('full25-nine','Equip nine +25 items','Equipment',9,c=>Object.values(c.equipment).filter(i=>i?.enhance===25).length);
  add('ascendant-nine','Nine Ascendant +25 items','Equipment',9,c=>Object.values(c.equipment).filter(i=>i?.enhance===25&&i.rarity===7).length);
  [1,10,46,99].forEach(n=>add('talents-'+n,'Invest '+n+' talent points','Talents',n,c=>Object.values(c.talents||{}).reduce((sum,rank)=>sum+rank,0)));
  add('talent-path','Master a complete talent path','Talents',1,c=>+D.talents[c.class].some(path=>path.nodes.every((_,index)=>c.talents?.[path.id+':'+index]===D.talentRanks[index])));
  D.dungeons.forEach(d=>add('collection-expanded-'+d.id,d.prefix+' complete arsenal (23 pieces)','Dungeons',23,c=>(c.stats.bossDrops[d.id]||[]).length));
  [1,10,100].forEach(n=>add('presents-'+n,'Open '+n+' mystery presents','Collections',n,c=>c.stats.boxesOpened||0));
  add('regalia-trio','Outfit, aura and mount','Collections',3,c=>['outfit','aura','mount'].filter(kind=>c.regalia?.[kind]).length);
  add('boss-sockets-nine','Nine boss items, every socket filled','Gems',45,c=>Object.values(c.equipment).filter(i=>i?.boss!=null&&i.enhance===25).reduce((n,i)=>n+i.gems.filter(Boolean).length,0));
  add('gem-extreme-nine','Forty-five simultaneous Gem V','Gems',45,c=>Object.values(c.equipment).filter(i=>i?.boss!=null&&i.enhance===25).reduce((n,i)=>n+i.gems.filter(k=>k&&D.catalog[k].rank===5).length,0));
})(RPG.data);
