'use strict';
(function(G, D, S) {
  S.world = {
    preferences(c = G.character()) {
      return c.skillPreferences || {primary: 'Fishing', secondary: 'Mining'};
    },
    setPreference(rank, skill) {
      G.assert(['primary', 'secondary'].includes(rank) && D.gatheringSkills.includes(skill), 'Choose a gathering skill.');
      const c = G.character(), p = {...this.preferences(c)}, other = rank === 'primary' ? 'secondary' : 'primary';
      if (p[other] === skill) p[other] = p[rank];
      p[rank] = skill;
      p.mode='preferred';
      c.skillPreferences = p;
      G.commit();
    },
    encounterWeights(c = G.character()) {
      const weights = [...D.encounters[D.locations[c.location].dungeon === null ? 'without' : 'with']],
        skills = D.gatheringSkills, p = this.preferences(c),
        total = D.encounters.types.reduce((sum, type, i) => sum + (skills.includes(type) ? weights[i] : 0), 0);
      return weights.map((weight, i) => skills.includes(D.encounters.types[i]) ? total *
        (D.encounters.types[i] === p.primary ? .5 : D.encounters.types[i] === p.secondary ? .25 : .25/(skills.length-2)) : weight);
    },
    tier(location, divisor = 2, starter = false) {
      if (location === 0 && starter) return G.weighted(G.rng, [70, 30]);
      const max = D.tierFor(D.locations[location].max);
      return G.weighted(G.rng, Array.from({
        length: max + 1
      }, (_, i) => Math.pow(divisor, i - max)));
    },
    enemy(type, location, forcedLevel) {
      const loc = D.locations[location],
        boss = type === 'boss',
        level = forcedLevel || (boss ? G.int(G.rng, ...D.dungeonLevels.boss.map(n => D.dungeons[loc.dungeon].level + n)) : G.int(G.rng, loc.level, loc.max));
      const row = boss ? {
        name: D.dungeons[loc.dungeon].boss,
        archetype: 'Dungeon Boss'
      } : G.pick(G.rng, loc[type]);
      const e = {
        name: row.name,
        archetype: row.archetype,
        type,
        level,
        health: D.enemyBase.health + D.enemyBase.healthPerLevel * level,
        damage: D.enemyBase.damage + D.enemyBase.damagePerLevel * level,
        defence: D.enemyBase.defencePerLevel * level,
        crit: D.config.baseCrit,
        critDamage: D.config.baseCritDamage,
        speed: 0,
        penetration: 0,
        double: 0,
        dodge: 0,
        reduction: 0,
        resistance: 0,
        lifeSteal: 0
      };
      const scaling = D.enemyScaling(location);
      for (const key of ['health', 'damage', 'defence']) e[key] *= scaling[key];
      e.penetration = scaling.penetration;
      e.resistance = scaling.resistance;
      if (boss) {
        for (const key of ['health', 'damage', 'defence']) e[key] *= D.boss[key];
        e.penetration += D.boss.penetration;
        for (const key of ['crit', 'critDamage']) e[key] = D.boss[key];
        e.boss = loc.dungeon;
      } else {
        for (const label of row.archetype.split('/')) {
          const mod = D.archetypes[label] || {};
          for (const [key, value] of Object.entries(mod))
            if (['health', 'damage', 'defence'].includes(key)) e[key] *= value;
            else e[key] += value;
        }
        if (type === 'elite')
          for (const key of ['health', 'damage', 'defence']) e[key] *= D.tuning.elite[key];
      }
      e.interval = D.config.attackSeconds / (1 + G.clamp(e.speed, -.5, 1));
      return e;
    },
    discover(forced) {
      const c = G.character(),
        loc = D.locations[c.location];
      if (!forced && S.tutorial?.discover()) return;
      const type = forced || D.encounters.types[G.weighted(G.rng, this.encounterWeights(c))];
      let e = {
        type
      };
      if (['regular', 'elite', 'boss'].includes(type)) e.enemy = this.enemy(type, c.location);
      else if (D.gatheringSkills.includes(type)) {
        e.tier = this.tier(c.location, 2, true);
        e.charges = D.config.nodeCharges;
      } else if (type === 'treasure') {
        e.level = c.level;
        e.mimic = G.rng() < D.config.mimicChance;
      } else G.assert(loc.dungeon !== null, 'This location has no dungeon.');
      c.encounter = e;
      G.runtime.estimate = null;
      if (type === 'dungeon') G.audio?.play('dungeon');
    },
    advance(automated = false) {
      G.ensureProgress();
      S.tutorial?.guard('advance');
      const c = G.character();
      G.assert(!c.encounter && !c.dungeon, 'Resolve the current encounter first.');
      c.activity = {
        type: 'advance',
        elapsed: 0,
        duration: automated ? D.config.afkAdvanceMs : D.config.advanceMs,
        afk: automated
      };
      G.commit();
    },
    moveOn() {
      G.ensureIdle();
      const c = G.character();
      G.assert(!c.dungeon, 'Use Leave Dungeon between rooms.');
      G.assert(!S.tutorial?.active(), 'Finish the required tutorial before moving on.');
      c.encounter = null;
      G.commit();
    },
    travelQuote(id, c = G.character()) {
      G.assert(Number.isInteger(id) && D.locations[id], 'Choose a valid location.');
      const distance = Math.abs(id - c.location), perStep = D.travelStepPrices[id];
      return {from:c.location, to:id, distance, perStep, coins:distance * perStep};
    },
    location(id) {
      G.ensureProgress();
      const c = G.character();
      G.assert(!c.dungeon, 'Leave the dungeon first.');
      G.assert(!S.tutorial?.active(), 'Finish the required tutorial before changing location.');
      G.assert(D.locations[id] && c.level >= D.locations[id].level, 'Location is locked.');
      const quote = this.travelQuote(id, c);
      if (!quote.distance) return;
      G.assert(c.coins >= quote.coins, 'Not enough coins for this journey.');
      S.afk?.stop('Location changed', false);
      c.coins -= quote.coins;
      c.encounter = null;
      c.location = id;
      G.commit();
    },
    gather() {
      G.ensureProgress();
      S.tutorial?.guard('gather');
      const c = G.character(),
        e = c.encounter;
      G.assert(e && D.gatheringSkills.includes(e.type), 'No gathering node.');
      G.assert(c.skills[e.type].level >= D.tiers[e.tier], 'Skill level is too low for this resource.');
      G.assert(S.items.usableTool(c, e.type), 'Skill level is too low to use this tool.');
      c.activity = {
        type: 'gather',
        skill: e.type,
        tier: e.tier,
        elapsed: 0,
        duration: D.config.actionMs / (1 + S.items.toolBonus(c, e.type, 'Efficiency')),
        rewards: []
      };
      if (e.type === 'Fishing') G.audio?.play('cast');
      G.commit();
    },
    gatherAction() {
      const c = G.character(),
        a = c.activity,
        e = c.encounter,
        kind = D.gatherResources[a.skill],
        rewards = [{
          key: kind + ':' + a.tier,
          quantity: (a.skill==='Farming'?2:1) * (1 + (G.rng() < S.items.toolBonus(c, a.skill, 'Yield') ? 1 : 0))
        }];
      if (a.tier < D.tiers.length - 1 && G.rng() < S.items.toolBonus(c, a.skill, 'Fortune')) rewards.push({
        key: kind + ':' + (a.tier + 1),
        quantity: 1
      });
      S.inventory.reward(rewards);
      S.quests.gathered(a.skill, rewards, c);
      G.audio?.play(a.skill.toLowerCase());
      a.rewards = S.loot.merge(a.rewards || [], rewards);
      S.tutorial?.gathered(a.skill, rewards);
      S.companions.gain(c, D.companionRules.actionXp);
      S.xp.add(c.skills[a.skill], D.config.skillXp * D.tiers[a.tier] * (1 + S.items.toolBonus(c, a.skill, 'Knowledge')));
      if (G.rng() >= S.items.toolBonus(c, a.skill, 'Conservation')) e.charges--;
      G.runtime.recent = rewards;
      if (e.charges <= 0) {
        c.activity = null;
        c.encounter = null;
        S.loot.present(a.rewards, 'Gathering complete');
        S.tutorial?.nodeComplete(a.skill);
      }
      G.commit();
    },
    tick(ms) {
      const c = G.character();
      if (!c?.activity || c.pending.length) return;
      const a = c.activity;
      a.elapsed += ms;
      if (a.elapsed < a.duration) return;
      a.elapsed -= a.duration;
      if (a.type === 'advance') {
        c.activity = null;
        c.stats.advance++;
        this.discover();
        G.commit();
      } else if (a.type === 'gather') this.gatherAction();
      else S.crafting.complete();
    },
    stop() {
      const c = G.character();
      G.assert(!c.combat, 'Cannot stop a fight.');
      G.assert(c.activity?.type !== 'advance', 'Advance is already underway.');
      if (c.activity?.rewards?.length) S.loot.present(c.activity.rewards, 'Activity stopped');
      c.activity = null;
      G.commit();
    },
    openChest() {
      G.ensureProgress();
      const c = G.character(),
        e = c.encounter;
      G.assert(e?.type === 'treasure', 'No treasure chest to open.');
      if (e.mimic) {
        const enemy = this.enemy('regular', c.location, e.level);
        Object.assign(enemy, {
          name: 'Mimic',
          archetype: 'Mimic · Balanced',
          health: (D.enemyBase.health + D.enemyBase.healthPerLevel * e.level) * D.enemyScaling(c.location).health,
          damage: (D.enemyBase.damage + D.enemyBase.damagePerLevel * e.level) * D.enemyScaling(c.location).damage,
          defence: e.level * D.enemyScaling(c.location).defence,
          crit: D.config.baseCrit,
          critDamage: D.config.baseCritDamage,
          speed: 0,
          interval: D.config.attackSeconds
        });
        c.encounter = {
          type: 'regular',
          enemy
        };
        G.runtime.estimate = null;
        G.notify('The chest is a Mimic! Inspect it, then choose Fight or Move On.', 'warning');
      } else {
        const rewards = S.loot.roll('regular', e.level, c.location);
        S.inventory.reward(rewards);
        c.encounter = null;
        S.loot.present(rewards, 'Treasure Chest');
      }
      G.commit();
    }
  };
  S.dungeons = {
    enter() {
      G.ensureProgress();
      const c = G.character();
      G.assert(c.encounter?.type === 'dungeon', 'Discover an entrance through Advance first.');
      c.dungeon = {
        id: D.locations[c.location].dungeon,
        room: 1,
        cleared: false,
        interrupted: false
      };
      this.room();
      G.commit();
    },
    room() {
      const c = G.character(),
        r = c.dungeon.room;
      if (r === 3) c.encounter = {
        type: G.rng() < .5 ? 'fountain' : 'spoils'
      };
      else {
        const type = r < 3 ? 'regular' : r === 4 ? 'elite' : 'boss';
        c.encounter = {
          type,
          enemy: S.world.enemy(type, c.location, G.int(G.rng, ...D.dungeonLevels[type].map(n => D.dungeons[c.dungeon.id].level + n)))
        };
      }
      G.runtime.estimate = null;
      G.audio?.play(r === 5 ? 'boss' : 'dungeon');
      G.emit('effect', {
        kind: r === 5 ? 'boss' : 'room'
      });
    },
    next() {
      G.ensureProgress();
      const c = G.character();
      G.assert(c.dungeon?.cleared, 'Complete this room first.');
      c.dungeon.room++;
      c.dungeon.cleared = false;
      this.room();
      G.commit();
    },
    event() {
      G.ensureProgress();
      const c = G.character(),
        type = c.encounter?.type;
      G.assert(['fountain', 'spoils'].includes(type), 'No room event.');
      if (type === 'fountain') {
        c.hp = S.character.stats(c).health;
        G.notify('The Fountain of Youth restores all HP.', 'success');
      } else {
        const rewards = S.loot.roll('regular', D.locations[c.location].level, c.location);
        S.inventory.reward(rewards);
        S.loot.present(rewards, 'The Spoils Chamber');
      }
      c.encounter = null;
      c.dungeon.cleared = true;
      G.commit();
    },
    leave() {
      G.ensureIdle();
      const c = G.character();
      G.assert(c.dungeon, 'No dungeon run.');
      c.dungeon = null;
      c.encounter = null;
      G.notify('Dungeon abandoned. Rediscover the entrance to return.');
      G.commit();
    }
  };
  S.loot = {
    merge(previous, rewards) {
      const out = G.clone(previous);
      for (const r of rewards) {
        const existing = r.key ? out.find(i => i.key === r.key) : r.coins ? out.find(i => i.coins) : null;
        if (existing) {
          if (r.key) existing.quantity += r.quantity;
          else existing.coins += r.coins;
        } else out.push(G.clone(r));
      }
      return out;
    },
    gem(level) {
      const rank = G.weighted(G.rng, D.gemDrops.findLast(([min]) => level >= min)[1]) + 1;
      const gem = G.int(G.rng, 0, D.regularGemCount - 1);
      return {key: rank === 1 ? 'uncut:' + gem : 'gem:' + gem + ':' + rank, quantity: 1};
    },
    roll(type, level, location, guaranteedGem = false) {
      const table = D.loot[type],
        loc = D.locations[location],
        rewards = [{
          coins: G.int(G.rng, ...loc.coins) * table.coins
        }];
      for (const kind of D.resourceKinds)
        if (G.rng() < table.material) rewards.push({
          key: kind + ':' + S.world.tier(location, table.divisor),
          quantity: table.quantity
        });
      if (G.rng() < table.gem) {
        rewards.push(this.gem(level));
      }
      if (G.rng() < table.gear) {
        const tier = S.world.tier(location, table.divisor),
          piece = G.int(G.rng, 0, 9),
          rarity = G.weighted(G.rng, table.rarities);
        // Keep the existing piece roll; only armour makes a second class draw.
        const armorClass = D.armorSlots.includes(D.pieces[piece]) ? D.classes[G.weighted(G.rng, D.armorWeights)] : undefined;
        const item = S.items.create(tier, piece, rarity, type === 'boss' ? loc.dungeon : null, armorClass);
        rewards.push(item);
        if (type === 'boss') {
          const c = G.character();
          c.stats.bossDrops[loc.dungeon] = [...new Set([...(c.stats.bossDrops[loc.dungeon] || []), piece])];
        }
      }
      if (G.rng() < table.tool) rewards.push(S.items.dropTool(D.skills[G.weighted(G.rng, D.toolDrops.weights)], G.weighted(G.rng, table.rarities)));
      if (G.rng() < table.stone) rewards.push({
        key: 'stone',
        quantity: 1
      });
      // Complete the ordinary loot rolls first, preserving every other reward.
      if (guaranteedGem && !rewards.some(r => D.catalog[r.key]?.category === 'Gems')) rewards.push(this.gem(level));
      return rewards;
    },
    present(rewards, label) {
      G.audio?.play('loot');
      G.runtime.recent = G.clone(rewards);
      G.emit('loot', {
        rewards,
        label
      });
    }
  };
})(RPG, RPG.data, RPG.systems);
