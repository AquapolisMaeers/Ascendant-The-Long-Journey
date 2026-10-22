'use strict';
(function(G, D) {
  let KEY = 'advance.rpg.v1',
    BACKUP = KEY + '.backup',
    FATES = KEY + '.fates',
    HISTORY = KEY + '.history';
  const fail = m => {
    throw Error('Invalid save: ' + m);
  };
  const finite = (n, min = 0, max = 1e15) => typeof n === 'number' && Number.isFinite(n) && n >= min && n <= max;
  const record = o => o && typeof o === 'object' && !Array.isArray(o);
  const idsValid = (list, known) => Array.isArray(list) && list.length <= known.length && new Set(list).size === list.length && list.every(id => known.includes(id));
  function validatePet(p) {
    if (!record(p)) fail('companion');
    const rank = p.ascensions === undefined ? 0 : p.ascensions, cap = D.companionRules.levelCaps[rank];
    if (!Number.isInteger(rank) || rank < 0 || rank >= D.companionRules.levelCaps.length ||
      !D.allCompanions.some(d => d.id === p.type) || !Number.isInteger(p.level) || !finite(p.level, rank ? D.companionRules.levelCaps[rank - 1] : 1, cap) ||
      !finite(p.xp) || p.level === cap && p.xp !== 0 || p.level < cap && p.xp >= G.systems.companions.xpNext(p.level) ||
      !finite(p.hunger, 0, 100) || !finite(p.health, 0, 100) || !finite(p.updatedAt)) fail('companion');
  }

  function validateItem(i, ids) {
    if (!i || typeof i.id !== 'string' || ids.has(i.id)) fail('duplicate or missing item ID');
    ids.add(i.id);
    if (typeof i.locked !== 'boolean') fail('item lock');
    if (i.kind === 'stack') {
      if (!Object.hasOwn(D.catalog, i.key) || !Number.isSafeInteger(i.quantity) || i.quantity < 1) fail('item stack');
      return;
    }
    if (i.kind === 'tool') {
      if (!D.skills.includes(i.skill) || i.name !== D.tools[D.skills.indexOf(i.skill)] || !Number.isInteger(i.rarity) || !D.rarity[i.rarity] || typeof i.bound !== 'boolean' || !finite(i.ascendFail, 0, 1) || !i.prefixes || Object.keys(i.prefixes).length > G.systems.items.prefixSlots(i) || Object.entries(i.prefixes).some(([k, v]) => !Object.hasOwn(D.toolPrefixes, k) || !Number.isInteger(v) || !finite(v, 1, 8))) fail('tool');
      return;
    }
    if (i.kind !== 'gear' || !Number.isInteger(i.tier) || !D.tiers[i.tier] || !Number.isInteger(i.piece) || !D.pieces[i.piece] || !Number.isInteger(i.rarity) || !D.rarity[i.rarity] || !Number.isInteger(i.enhance) || !finite(i.enhance, 0, 25)) fail('equipment');
    if (i.slot !== D.pieceSlot(i.piece) || i.style !== (i.piece < 3 ? i.piece : null) || !(i.boss === null || Number.isInteger(i.boss) && D.dungeons[i.boss])) fail('equipment identity');
    if (i.armorClass !== undefined && (!D.classes.includes(i.armorClass) || !D.armorSlots.includes(i.slot))) fail('armour class');
    if (!i.prefixes || Object.keys(i.prefixes).length > G.systems.items.prefixSlots(i) || Object.entries(i.prefixes).some(([k, v]) => !D.prefixPools[i.slot].includes(k) || !finite(v))) fail('prefixes');
    if (!Array.isArray(i.gems) || i.gems.length > G.systems.items.sockets(i) || i.gems.some(k => k !== null && (!D.catalog[k] || D.catalog[k].category !== 'Gems' || !D.catalog[k].rank || !D.gemAllowed[i.slot].includes(D.catalog[k].type)))) fail('sockets');
    if (!finite(i.enhanceFail, 0, 1) || !finite(i.ascendFail, 0, 1)) fail('fail protection');
  }

  function validate(p) {
    if (!p || p.saveVersion !== D.config.version) fail('unsupported version');
    if (!Array.isArray(p.slots) || p.slots.length !== 3 || !Number.isInteger(p.active) || p.active < 0 || p.active > 2) fail('character slots');
    if (!p.settings || !finite(p.savedAt)) fail('settings or timestamp');
    if (p.settings.atmosphere !== undefined && typeof p.settings.atmosphere !== 'boolean') fail('atmosphere setting');
    if (p.settings.muted !== undefined && typeof p.settings.muted !== 'boolean') fail('mute setting');
    for (const key of ['damage', 'combatLog', 'notifications', 'reduced'])
      if (typeof p.settings[key] !== 'boolean') fail('boolean setting');
    for (const key of ['master', 'music', 'sfx'])
      if (!finite(p.settings[key], 0, 100)) fail('audio setting');
    if (p.settings.ambience !== undefined && !finite(p.settings.ambience, 0, 100)) fail('ambience setting');
    if (!finite(p.settings.scale, 80, 125) || !finite(p.settings.text, 85, 125)) fail('display scale');
    const characterIds = new Set();
    for (const c of p.slots) {
      if (!c) continue;
      if (characterIds.has(c.id)) fail('duplicate character ID');
      characterIds.add(c.id);
      if (!D.validAppearance(c.appearance)) fail('appearance');
      if (c.gemSocketRules !== undefined && c.gemSocketRules !== 1) fail('gem socket rules');
      if (c.regalia !== undefined) {
        if (!record(c.regalia) || !idsValid(c.regalia.owned,D.regalia.map(r=>r.id))) fail('regalia collection');
        for (const kind of ['outfit','aura','mount']) if (!(kind==='mount'&&c.regalia[kind]===undefined) && c.regalia[kind] !== null &&
          (!c.regalia.owned.includes(c.regalia[kind]) || !D.regalia.some(r=>r.id===c.regalia[kind]&&r.kind===kind))) fail('equipped regalia');
      }
      if (c.appearance.outfit !== undefined && (!c.regalia?.owned.includes(c.appearance.outfit) || c.regalia.outfit!==c.appearance.outfit || !D.regalia.some(r=>r.id===c.appearance.outfit&&r.kind==='outfit'))) fail('outfit portrait');
      if (c.specialPets !== undefined && !idsValid(c.specialPets,D.specialCompanions.map(p=>p.id))) fail('special companion collection');
      if (c.petStable !== undefined) {
        if (!record(c.petStable) || Object.keys(c.petStable).length>D.allCompanions.length) fail('companion stable');
        for (const [type,pet] of Object.entries(c.petStable)) {
          validatePet(pet);
          if (type!==pet.type || c.companion?.type===type || type.startsWith('special-')&&!c.specialPets?.includes(type)) fail('companion stable ownership');
        }
      }
      if (c.ascendantCoins !== undefined && (!Number.isSafeInteger(c.ascendantCoins) || !finite(c.ascendantCoins))) fail('Ascendant Coins');
      if (c.ascendantRewards !== undefined) {
        if (!c.ascendantRewards || typeof c.ascendantRewards !== 'object' || Array.isArray(c.ascendantRewards)) fail('Ascendant rewards');
        for (const [id, claimed] of Object.entries(c.ascendantRewards)) {
          const [type, ...rest] = id.split(':'), key = rest.join(':');
          const known = type === 'combat' ? /^[0-9]+$/.test(key) && +key >= 2 && +key <= 100 :
            type === 'milestone' ? Object.hasOwn(D.ascendantCurrency.milestones, key) :
            type === 'achievement' && D.achievements.some(a => a.id === key);
          if (!known || claimed !== true) fail('Ascendant reward claim');
        }
      }
      if (c.companion !== undefined && c.companion !== null) {
        validatePet(c.companion);
        if (c.companion.type.startsWith('special-')&&!c.specialPets?.includes(c.companion.type)) fail('active companion ownership');
      }
      if (c.weather !== undefined && !['auto', 'clear', 'rain', 'wind'].includes(c.weather)) fail('weather');
      if (c.peaceFoodReady !== undefined && !finite(c.peaceFoodReady)) fail('peace food cooldown');
      if(c.batchEatUnlocks!==undefined&&!idsValid(c.batchEatUnlocks,[5,10]))fail('batch eating unlocks');
      if (!G.systems.quests.valid(c)) fail('quests');
      if(!G.systems.colosseum.valid(c.colosseum))fail('Colosseum record');
      if(!G.systems.guilds.valid(c.guild,c))fail('guild');
      if(!G.systems.community.valid(c.community))fail('community lists');
      if (!Number.isInteger(c.seed) || !finite(c.seed, 1, 4294967295) || !finite(c.foodReady) || !c.facetFails || Object.entries(c.facetFails).some(([k, v]) => ![0, 1, 2, 3, 4].includes(+k) || !finite(v, 0, 1))) fail('random state or counters');
      if (typeof c.id !== 'string' || typeof c.name !== 'string' || c.name.length < 2 || c.name.length > 24 || !D.classes.includes(c.class) || !D.modes.includes(c.mode)) fail('character identity');
      if (!Number.isInteger(c.level) || !finite(c.level, 1, 100) || !finite(c.xp) || !finite(c.hp) || !Number.isSafeInteger(c.coins) || !finite(c.coins) || !Number.isInteger(c.capacity) || c.capacity < 50 || c.capacity > 160 || c.capacity % 10 || !Number.isInteger(c.location) || !D.locations[c.location] || D.locations[c.location].level > c.level) fail('character progression');
      if (!Array.isArray(c.inventory) || c.inventory.length > c.capacity || !Array.isArray(c.pending) || !c.equipment || !c.skills || !c.tools || !c.stats || !c.perks || !c.achievements || !Array.isArray(c.listings) || c.listings.length > 20) fail('character structure');
      if (c.xp >= D.xpNext(c.level) || c.level === 100 && c.xp !== 0) fail('unresolved character XP');
      for (const key of ['advance', 'regular', 'elite', 'boss', 'dungeons', 'bars', 'cooked', 'facets', 'enhancements', 'maxEnhance', 'socketed', 'listing', 'sale', 'purchase', 'damage', 'deaths'])
        if (!finite(c.stats[key])) fail('statistics');
      for(const key of ['harvested','textiles','secondaries','boxesOpened'])if(c.stats[key]!==undefined && (!Number.isSafeInteger(c.stats[key])||c.stats[key]<0))fail('craft and harvest statistics');
      if(c.playTime!==undefined&&(!record(c.playTime)||['onlineMs','offlineMs','updatedAt','startedAt'].some(key=>!finite(c.playTime[key]))||c.playTime.startedAt>c.playTime.updatedAt))fail('play time');
      if(c.stats.guildDonated!==undefined&&(!Number.isSafeInteger(c.stats.guildDonated)||!finite(c.stats.guildDonated)))fail('guild donation statistics');
      for (const key of ['ascensions', 'gemCreated'])
        if (!Array.isArray(c.stats[key])) fail('achievement records');
      if (!c.stats.bossKills || !c.stats.bossDrops || typeof c.title !== 'string') fail('boss or title records');
      for (const l of c.listings)
        if (typeof l.id !== 'string' || !finite(l.price, 1) || !finite(l.created) || !finite(l.expires) || !['active', 'retrieval'].includes(l.status)) fail('listing');
      const stackKeys = c.inventory.filter(i => i.kind === 'stack').map(i => i.key);
      if (new Set(stackKeys).size !== stackKeys.length) fail('duplicate stack type');
      const ids = new Set();
      for (const item of [...c.inventory, ...c.pending, ...Object.values(c.equipment).filter(Boolean), ...c.listings.map(l => l.item)]) validateItem(item, ids);
      for (const slot of D.slots)
        if (!(slot in c.equipment) || c.equipment[slot] && c.equipment[slot].slot !== slot) fail('equipped slot');
      if(c.equipment.Secondary && D.secondaryClass(c.equipment.Secondary.piece)!==c.class) fail('secondary class');
      for (const skill of D.skills) {
        const t = c.tools[skill],
          s = c.skills[skill];
        validateItem(t, ids);
        if (!s || !Number.isInteger(s.level) || !finite(s.level, 1, 100) || !finite(s.xp) || !t || t.kind !== 'tool' || t.skill !== skill || !Number.isInteger(t.rarity) || !D.rarity[t.rarity] || !t.prefixes || Object.entries(t.prefixes).some(([k, v]) => !Object.hasOwn(D.toolPrefixes, k) || !Number.isInteger(v) || !finite(v, 1, 8))) fail('skill or tool');
      }
      if (Object.entries(c.perks).some(([k, v]) => !D.perkLevels.includes(+k) || +k > c.level || ![0, 1, 2].includes(v))) fail('perk choice');
      if (!G.systems.talents.valid(c)) fail('talent allocation');
      if (!G.systems.skilling.valid(c)) fail('skilling allocation');
      if (c.provisionsVersion !== undefined && c.provisionsVersion !== 1) fail('provisions version');
      if (!(c.offline === null || D.skills.includes(c.offline)) || !finite(c.lastSeen) || !Array.isArray(c.eatUnlocks) || c.eatUnlocks.some(v => ![0, .25, .5, .75].includes(v)) || !c.eatUnlocks.includes(c.eat) || c.food !== null && !D.catalog[c.food]?.healing) fail('food or offline selection');
      if (c.encounter) {
        const e = c.encounter;
        if (['regular', 'elite', 'boss'].includes(e.type)) {
          if (e.enemy?.thorns !== undefined && !finite(e.enemy.thorns, 0, D.caps.thorns)) fail('enemy Thorn Damage');
          if (!e.enemy || typeof e.enemy.name !== 'string' || typeof e.enemy.archetype !== 'string' || !Number.isInteger(e.enemy.level) || !finite(e.enemy.level, 1, 109)) fail('enemy');
          for (const key of ['damage', 'health', 'defence', 'crit', 'critDamage', 'penetration', 'double', 'dodge', 'reduction', 'resistance', 'lifeSteal', 'interval'])
            if (!finite(e.enemy[key]) || key === 'interval' && e.enemy[key] < .5) fail('enemy stats');
        } else if (D.gatheringSkills.includes(e.type)) {
          if (e.resource !== undefined) fail('gathering resource');
          if (!Number.isInteger(e.tier) || !D.tiers[e.tier] || !Number.isInteger(e.charges) || !finite(e.charges, 1, 5)) fail('gathering node');
        } else if (e.type === 'treasure') {
          if (typeof e.mimic !== 'boolean' || !Number.isInteger(e.level) || !finite(e.level, 1, 100)) fail('treasure chest');
        } else if (!['dungeon', 'fountain', 'spoils'].includes(e.type)) fail('encounter type');
      }
      if (c.dungeon && (!Number.isInteger(c.dungeon.id) || !D.dungeons[c.dungeon.id] || !Number.isInteger(c.dungeon.room) || !finite(c.dungeon.room, 1, 5) || typeof c.dungeon.cleared !== 'boolean')) fail('dungeon');
      if (c.activity && (!['advance', 'gather', 'craft'].includes(c.activity.type) || !finite(c.activity.elapsed) || !finite(c.activity.duration, 1, 100000))) fail('activity');
      if (c.activity?.type === 'gather' && (!c.encounter || !D.gatheringSkills.includes(c.activity.skill) || c.activity.skill!==c.encounter.type || c.activity.tier!==c.encounter.tier || !Number.isInteger(c.activity.tier) || !D.tiers[c.activity.tier])) fail('gather activity');
      if(c.activity?.resource!==undefined) fail('gathering resource');
      if (c.activity?.type === 'craft' && (!D.recipes.some(r => r.id === c.activity.recipe) || !Number.isInteger(c.activity.remaining) || !finite(c.activity.remaining, 1, 1000000))) fail('craft queue');
      if (!c.afk || c.afk.interval !== D.config.afkAdvanceMs || !finite(c.afk.chance,0,1) || !finite(c.afk.minHp,0,1) || c.afk.minutes !== undefined && ![15, 30, 60].includes(c.afk.minutes) || ['elites', 'gather', 'chests'].some(k => typeof c.afk[k] !== 'boolean')) fail('AFK settings');
      if (['normals','dungeons'].some(k => c.afk[k] !== undefined && typeof c.afk[k] !== 'boolean')) fail('AFK encounter filters');
      if (!finite(c.restReadyAt)) fail('rest cooldown');
      if (c.skillPreferences !== undefined && (!c.skillPreferences || c.skillPreferences.mode!==undefined&&!['balanced','preferred'].includes(c.skillPreferences.mode) || !D.gatheringSkills.includes(c.skillPreferences.primary) || !D.gatheringSkills.includes(c.skillPreferences.secondary) || c.skillPreferences.primary === c.skillPreferences.secondary)) fail('skill preferences');
      if (c.guide && (!Number.isInteger(c.guide.step) || !D.tutorial.steps[c.guide.step] || typeof c.guide.active !== 'boolean' || !c.guide.gathered)) fail('tutorial');
      if (c.activity?.rewards) {
        if (!Array.isArray(c.activity.rewards)) fail('activity rewards');
        for (const r of c.activity.rewards) {
          if (['gear', 'tool'].includes(r.kind)) validateItem(r, new Set());
          else if (r.coins) {
            if (!Number.isSafeInteger(r.coins) || !finite(r.coins, 1)) fail('reward coins');
          } else if (!Object.hasOwn(D.catalog, r.key) || !Number.isSafeInteger(r.quantity) || r.quantity < 1) fail('reward item');
        }
      }
      if (c.combat) {
        const f = c.combat;
        for(const actor of [f.player,f.enemy])if(actor?.thorns!==undefined&&!finite(actor.thorns,0,D.caps.thorns))fail('combat Thorn Damage');
        for(const actor of [f.player,f.enemy])if(actor?.levelDamage!==undefined&&!finite(actor.levelDamage,1/3.5,3.5))fail('combat level modifier');
        if (!f.player || !f.enemy || !finite(f.time) || !finite(f.player.hp) || !finite(f.enemy.hp) || !finite(f.nextPlayer) || !finite(f.nextEnemy) || !finite(f.seed)) fail('combat state');
        for (const actor of [f.player, f.enemy])
          for (const key of ['level', 'damage', 'health', 'defence', 'crit', 'critDamage', 'penetration', 'double', 'dodge', 'reduction', 'resistance', 'lifeSteal', 'interval', 'hits'])
            if (!finite(actor[key]) || key === 'interval' && actor[key] < .5) fail('combat stats');
        if (!f.food || !Number.isInteger(f.food.count) || !finite(f.food.count) || !finite(f.food.ready) || !finite(f.food.used) || ![0, .25, .5, .75].includes(f.food.threshold)) fail('combat food');
        if (!c.encounter?.enemy || !['regular', 'elite', 'boss'].includes(c.encounter.type)) fail('combat encounter');
      }
    }
    return p;
  }
  G.save = {
    status: 'Not saved',
    storageKey() { return KEY; },
    useAccount(id) {
      KEY = id ? 'ascendant.account.' + id + '.profile' : 'advance.rpg.v1';
      BACKUP = KEY + '.backup'; FATES = KEY + '.fates'; HISTORY = KEY + '.history';
      this.lastGoodText = null; this.fates = {}; this.error = null;
    },
    error: null,
    migrations: {
      2(p) {
        p = G.clone(p);
        p.saveVersion = 3;
        for (const c of p.slots.filter(Boolean)) {
          if (c.guide) c.guide.step++;
          c.afk = { interval: 12000, chance: .75, minHp: .25, elites: false, gather: false, chests: true, minutes: 30 };
        }
        return p;
      },
      1(p) {
        p = G.clone(p);
        p.saveVersion = 2;
        for (const c of p.slots.filter(Boolean)) {
          c.restReadyAt ??= 0;
          c.guide ??= null;
          for (const t of Object.values(c.tools)) t.bound ??= true;
          if (c.activity) c.activity.rewards ??= [];
        }
        return p;
      }
    },
    lastGoodText: null,
    fates: {},
    validate,
    recordFate(c, fate) {
      this.fates[c.id] = fate;
      try {
        localStorage.setItem(FATES, JSON.stringify(this.fates));
      } catch (e) {
        G.notify('Permanent character state could not be written: ' + e.message, 'error');
      }
    },
    applyFates(p) {
      p.slots = p.slots.map(c => {
        if (!c) return null;
        const fate = this.fates[c.id];
        if (fate === 'dead') return null;
        if (fate === 'Ironman') c.mode = 'Ironman';
        return c;
      });
      return p;
    },
    migrate(p) {
      let guard = 0;
      while (p?.saveVersion !== D.config.version && this.migrations[p?.saveVersion] && guard++ < 10) p = this.migrations[p.saveVersion](p);
      if(Array.isArray(p?.slots)) for(const c of p.slots.filter(Boolean)) {
        if(c.playTime===undefined&&c.stats)G.systems.playtime.normalize(c);
        G.systems.guilds.migrate(c.guild,c);
        // Preserve chosen skills while moving every profile to primary/secondary odds.
        if(c.skillPreferences&&['balanced','preferred',undefined].includes(c.skillPreferences.mode))c.skillPreferences.mode='preferred';
        // Farming is additive: all previous skill XP, tools and stored fibres stay.
        if(c.skills&&c.tools&&!Object.hasOwn(c.skills,'Farming')&&!Object.hasOwn(c.tools,'Farming')) {
          c.skills.Farming={level:1,xp:0};
          c.tools.Farming=G.systems.items.createTool('Farming',0,true);
        }
        // Convert the old Woodcutting-only grove to a Farming crop. Already
        // harvested rewards were delivered to inventory and are never removed.
        if(c.encounter?.type==='Woodcutting'&&c.encounter.resource==='fiber') {
          c.encounter.type='Farming';delete c.encounter.resource;
          if(c.activity?.type==='gather'&&c.activity.skill==='Woodcutting'&&c.activity.resource==='fiber') {
            if(c.skills?.Farming?.level>=D.tiers[c.activity.tier]) {
              c.activity.skill='Farming';delete c.activity.resource;
              c.activity.duration=D.config.actionMs/(1+G.systems.items.toolBonus(c,'Farming','Efficiency'));
              c.activity.elapsed=Math.min(c.activity.elapsed,c.activity.duration-1);
            } else c.activity=null;
          }
        }
        c.talents ??= {};
        if(c.skilling===undefined)c.skilling={};
        if(c.equipment && !Object.hasOwn(c.equipment,'Secondary')) c.equipment.Secondary=null;
        if(c.creatureBalanceVersion===undefined) {
          // Refresh uncommitted previews once. A fight already in progress keeps
          // its actors and random state so its committed outcome cannot change.
          const enemy=c.encounter?.enemy,loc=c.location;
          if(enemy&&!c.combat&&D.locations[loc]&&['regular','elite','boss'].includes(enemy.type)) {
            const scale=D.legacyEnemyScaling(loc,enemy.level);
            const old={health:1+.12*loc+.008*loc*loc,damage:1+.06*loc+.003*loc*loc,defence:1+.08*loc+.004*loc*loc};
            for(const key of ['health','damage','defence'])enemy[key]*=scale[key]/old[key];
          }
          c.creatureBalanceVersion=1;
        }
        if(c.creatureBalanceVersion<2) {
          const enemy=c.encounter?.enemy,loc=c.location;
          if(enemy&&!c.combat&&D.locations[loc]&&['regular','elite','boss'].includes(enemy.type)) {
            const scale=D.regionalEnemyScaling(loc,enemy.level),old=D.legacyEnemyScaling(loc,enemy.level);
            for(const key of ['health','damage','defence'])enemy[key]*=scale[key]/old[key];
          }
          c.creatureBalanceVersion=2;
        }
        if(c.creatureBalanceVersion<4) {
          const enemy=c.encounter?.enemy,loc=c.location;
          if(enemy&&!c.combat&&!c.encounter.tutorial&&D.locations[loc]&&['regular','elite','boss'].includes(enemy.type)) {
            Object.assign(enemy,G.systems.world.enemyStats(enemy.type,loc,enemy.level,{name:enemy.name,archetype:enemy.archetype}));
          }
          c.creatureBalanceVersion=4;
        }
        // Old 25% was free. Keep paid higher tiers and remove only that free tier.
        if(c.provisionsVersion===undefined && Array.isArray(c.eatUnlocks)) {
          c.eatUnlocks=c.eatUnlocks.filter(n=>n!==.25);
          if(c.eat===.25)c.eat=0;
          if(c.combat?.food?.threshold===.25)c.combat.food.threshold=0;
          c.provisionsVersion=1;
        }
        // Existing armour becomes its owner's class with all investments intact.
        for(const item of [...Object.values(c.equipment||{}),...(c.inventory||[]),...(c.pending||[]),...(c.listings||[]).map(l=>l?.item),...(c.activity?.rewards||[])])
          if(item?.kind==='gear' && D.armorSlots.includes(item.slot) && item.armorClass===undefined)item.armorClass=c.class;
        if(c.afk&&[8000,12000,16000].includes(c.afk.interval))c.afk.interval=D.config.afkAdvanceMs;
        if(c.gemSocketRules !== undefined || !Array.isArray(c.inventory) || !Array.isArray(c.pending) || !c.equipment || !Array.isArray(c.listings)) continue;
        for(const item of [...Object.values(c.equipment),...c.inventory,...c.pending,...c.listings.map(l=>l?.item)]) {
          if(item?.kind!=='gear'||!Array.isArray(item.gems)||!Array.isArray(D.gemAllowed[item.slot]))continue;
          item.gems=item.gems.map(key=>{
            const gem=D.catalog[key];
            if(!gem?.boxOnly||D.gemAllowed[item.slot].includes(gem.type)||!D.legacyExclusiveGemSlots[gem.type]?.includes(item.slot))return key;
            const stack=c.inventory.find(i=>i.kind==='stack'&&i.key===key&&Number.isSafeInteger(i.quantity+1));
            if(stack)stack.quantity++;
            else (c.inventory.length<c.capacity?c.inventory:c.pending).push({id:G.uid(),kind:'stack',key,quantity:1,locked:!!item.locked});
            return null;
          });
        }
        c.gemSocketRules=1;
      }
      validate(p);
      p.slots.filter(Boolean).forEach(c => {
        G.systems.chronicles.normalize(c);
        if(!c.combat)c.hp=Math.min(c.hp,G.systems.character.stats(c).health);
      });
      return this.applyFates(p);
    },
    write() {
      if (G.runtime.loadFailure || G.account?.enabled && !G.account.ready) return false;
      try {
        G.systems.playtime.flush();
        const candidate = G.clone(G.state);
        candidate.savedAt = Date.now();
        if (candidate.slots[candidate.active] && !document.hidden && !G.runtime.selecting) candidate.slots[candidate.active].lastSeen = candidate.savedAt;
        validate(candidate);
        const text = JSON.stringify(candidate),
          old = localStorage.getItem(KEY);
        let history = [];
        try {
          history = JSON.parse(localStorage.getItem(HISTORY) || '[]');
        } catch {}
        const prior = this.lastGoodText || old;
        if (prior) {
          try {
            this.migrate(JSON.parse(prior));
            localStorage.setItem(BACKUP, prior);
            history = [prior, ...history.filter(t => t !== prior)].slice(0, D.config.saveHistory);
            localStorage.setItem(HISTORY, JSON.stringify(history));
          } catch (error) {
            if (error.message.startsWith('Invalid save:') || error instanceof SyntaxError) {
              /* Preserve previous valid recovery copies. */ } else throw error;
          }
        }
        localStorage.setItem(KEY, text);
        if (!prior) localStorage.setItem(BACKUP, text);
        this.lastGoodText = text;
        G.state.savedAt = candidate.savedAt;
        if (G.character() && !document.hidden && !G.runtime.selecting) G.character().lastSeen = candidate.savedAt;
        this.status = 'Saved';
        this.error = null;
        G.emit('saved');
        return true;
      } catch (error) {
        this.status = 'Save failed';
        const message = error.message,
          changed = this.error !== message;
        this.error = message;
        if (changed) G.notify('Progress was not saved. ' + message + ' Export a backup now.', 'error');
        G.emit('saved');
        G.emit('save-error', {
          message
        });
        return false;
      }
    },
    load() {
      try {
        const fates = localStorage.getItem(FATES);
        if (fates) this.fates = JSON.parse(fates);
        let history = [];
        try {
          history = JSON.parse(localStorage.getItem(HISTORY) || '[]');
        } catch {}
        const primary = localStorage.getItem(KEY),
          backup = localStorage.getItem(BACKUP),
          texts = [primary, backup, ...history].filter(Boolean);
        if (!texts.length) return;
        let failure = null;
        for (let index = 0; index < texts.length; index++) {
          try {
            G.state = this.migrate(JSON.parse(texts[index]));
            this.lastGoodText = JSON.stringify(G.state);
            this.status = index === 0 ? 'Loaded' : 'Recovered backup';
            if (index > 0) G.notify('Recovered the last valid save. The unreadable snapshot was not overwritten.', 'warning');
            return;
          } catch (error) {
            failure = error;
          }
        }
        throw failure || Error('No valid save snapshot.');
      } catch (error) {
        this.error = error.message;
        this.status = 'Load failed';
        G.runtime.loadFailure = true;
        G.notify('Saved progress could not be loaded. Recovery copies are preserved. ' + error.message, 'error');
      }
    },
    export (scope = 'profile') {
      G.assert(!G.character()?.combat && !G.character()?.dungeon, 'Export is unavailable during an active fight or dungeon.');
      G.systems.playtime.flush();
      if(scope==='character') {
        G.assert(G.character(),'Choose a character to export.');
        const profile=G.clone(G.state);
        profile.slots=profile.slots.map((character,slot)=>slot===profile.active?character:null);
        return JSON.stringify(profile,null,2);
      }
      return JSON.stringify(G.state, null, 2);
    },
    prepareImport(text) {
      G.assert(typeof text==='string'&&text.length<10000000,'Choose a save file smaller than 10 MB.');
      const profile=this.migrate(JSON.parse(text));
      G.assert(profile.slots.some(Boolean),'This save has no importable characters.');
      return profile;
    },
    import(text, targetSlot = null, sourceSlot = null) {
      G.assert(!G.character()?.combat && !G.character()?.dungeon, 'Import is unavailable during an active fight or dungeon.');
      const p=this.prepareImport(text);
      sourceSlot ??= p.slots[p.active]?p.active:p.slots.findIndex(Boolean);
      const imported=p.slots[sourceSlot];
      G.assert(Number.isInteger(sourceSlot)&&imported,'Choose a character from the save.');
      G.assert(!imported.combat&&!imported.dungeon,'Finish this character’s fight or dungeon before exporting it.');
      const existing=G.state.slots.findIndex(c=>c?.id===imported.id);
      targetSlot ??= existing>=0?existing:G.state.slots.findIndex(c=>!c);
      G.assert(Number.isInteger(targetSlot)&&targetSlot>=0&&targetSlot<D.config.slots,'Choose an available character slot.');
      G.assert(!G.state.slots[targetSlot]||G.state.slots[targetSlot].id===imported.id,'That slot belongs to another character. Choose an empty slot.');
      G.assert(existing<0||existing===targetSlot,'This character is already in slot '+(existing+1)+'. Choose that slot to restore it.');
      const candidate=G.clone(G.state);
      candidate.slots[targetSlot]=imported;
      candidate.active=targetSlot;
      validate(candidate);
      G.systems.afk?.stop('Save imported', false);
      // Preserve every other slot, local settings and the existing recovery copy.
      G.systems.playtime.pause();
      G.state = candidate;
      G.runtime.loadFailure = false;
      G.runtime.needsResume = false;
      G.runtime.selecting = false;
      G.runtime.page = 'World';
      G.runtime.tab = '';
      G.runtime.estimate = null;
      const progress=G.systems.offline.apply(imported);
      G.systems.playtime.tick();
      if(progress.levelsGained)G.systems.offline.record(progress);
      G.systems.tutorial?.ensure();
      this.write();
      G.emit('change');
    },
    reset() {
      const fates = G.account?.enabled ? this.fates : {};
      G.systems.afk?.stop('Profile reset', false);
      G.systems.playtime.pause();
      G.state = G.newProfile();
      G.runtime.loadFailure = false;
      localStorage.removeItem(KEY);
      localStorage.removeItem(BACKUP);
      localStorage.removeItem(FATES);
      localStorage.removeItem(HISTORY);
      this.lastGoodText = null;
      this.fates = fates;
      localStorage.setItem(FATES, JSON.stringify(fates));
      this.write();
      G.emit('change');
    }
  };
})(RPG, RPG.data);
