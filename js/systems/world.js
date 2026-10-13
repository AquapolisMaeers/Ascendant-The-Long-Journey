'use strict';
(function(G, D, S) {
  S.world = {
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
        level = forcedLevel || (boss ? D.dungeons[loc.dungeon].level : G.int(G.rng, loc.level, loc.max));
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
      if (boss) {
        for (const key of ['health', 'damage', 'defence']) e[key] *= D.boss[key];
        for (const key of ['penetration', 'crit', 'critDamage']) e[key] = D.boss[key];
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
      const type = forced || D.encounters.types[G.weighted(G.rng, D.encounters[loc.dungeon === null ? 'without' : 'with'])];
      let e = {
        type
      };
      if (['regular', 'elite', 'boss'].includes(type)) e.enemy = this.enemy(type, c.location);
      else if (D.skills.slice(0, 4).includes(type)) {
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
        duration: automated ? c.afk.interval : D.config.advanceMs,
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
    location(id) {
      G.ensureProgress();
      const c = G.character();
      G.assert(!c.dungeon, 'Leave the dungeon first.');
      G.assert(!S.tutorial?.active(), 'Finish the required tutorial before changing location.');
      G.assert(D.locations[id] && c.level >= D.locations[id].level, 'Location is locked.');
      c.encounter = null;
      c.location = id;
      G.commit();
    },
    gather() {
      G.ensureProgress();
      S.tutorial?.guard('gather');
      const c = G.character(),
        e = c.encounter;
      G.assert(e && D.skills.slice(0, 4).includes(e.type), 'No gathering node.');
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
        kind = D.resourceKinds[D.skills.indexOf(a.skill)],
        rewards = [{
          key: kind + ':' + a.tier,
          quantity: 1 + (G.rng() < S.items.toolBonus(c, a.skill, 'Yield') ? 1 : 0)
        }];
      if (a.tier < D.tiers.length - 1 && G.rng() < S.items.toolBonus(c, a.skill, 'Fortune')) rewards.push({
        key: kind + ':' + (a.tier + 1),
        quantity: 1
      });
      S.inventory.reward(rewards);
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
          health: D.enemyBase.health + D.enemyBase.healthPerLevel * e.level,
          damage: D.enemyBase.damage + D.enemyBase.damagePerLevel * e.level,
          defence: e.level,
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
          enemy: S.world.enemy(type, c.location)
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
    roll(type, level, location) {
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
        const rank = G.weighted(G.rng, D.gemDrops.findLast(([min]) => level >= min)[1]) + 1;
        const gem = G.int(G.rng, 0, D.gems.length - 1);
        rewards.push({
          key: rank === 1 ? 'uncut:' + gem : 'gem:' + gem + ':' + rank,
          quantity: 1
        });
      }
      if (G.rng() < table.gear) {
        const tier = S.world.tier(location, table.divisor),
          piece = G.int(G.rng, 0, 9),
          rarity = G.weighted(G.rng, table.rarities);
        const item = S.items.create(tier, piece, rarity, type === 'boss' ? loc.dungeon : null);
        rewards.push(item);
        if (type === 'boss') {
          const c = G.character();
          c.stats.bossDrops[loc.dungeon] = [...new Set([...(c.stats.bossDrops[loc.dungeon] || []), piece])];
        }
      }
      if (G.rng() < table.tool) rewards.push(S.items.createTool(D.skills[G.weighted(G.rng, D.toolDrops.weights)], G.weighted(G.rng, table.rarities)));
      if (G.rng() < table.stone) rewards.push({
        key: 'stone',
        quantity: 1
      });
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
