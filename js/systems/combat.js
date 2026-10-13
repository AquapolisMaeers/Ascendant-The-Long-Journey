'use strict';
(function(G, D, S) {
  const C = D.config;
  const hit = (a, b) => G.clamp(1 + C.hitLevel * (a.level - b.level) - b.dodge, C.minHitChance, 1);
  const crit = (a, b) => G.clamp(a.crit - b.resistance, 0, D.caps.crit);
  const mitigation = (a, b) => {
    const def = b.defence * (1 - a.penetration);
    return Math.min(D.caps.mitigation, def / (def + C.defenceFactor * a.level));
  };
  const reduction = b => Math.min(D.caps.reduction, b.reduction + (b.lastStand && b.hp / b.health < D.perkConditional.lastStand.threshold ? D.perkConditional.lastStand.reduction : 0));

  function strike(f, a, b, side, events, extra = false) {
    const rng = () => G.random(f);
    if (rng() >= hit(a, b)) {
      events?.push({
        side,
        miss: true
      });
      return;
    }
    const critical = rng() < crit(a, b);
    let damage = a.damage * (critical ? 1 + a.critDamage : 1);
    if (a.executioner && b.hp / b.health < D.perkConditional.executioner.threshold) damage *= 1 + D.perkConditional.executioner.damage;
    damage = Math.max(C.minimumHit, damage * (1 - mitigation(a, b)) * (1 - reduction(b)));
    const actual = Math.min(b.hp, damage);
    b.hp = Math.max(0, b.hp - actual);
    a.hits++;
    const healing = Math.min(a.health - a.hp, actual * a.lifeSteal);
    a.hp += healing;
    if (a.relentless && a.hits % D.perkConditional.relentless.hits === 0) a.hp = Math.min(a.health, a.hp + a.health * D.perkConditional.relentless.heal);
    if (b.hp > 0 && b.secondWind && !b.wind && b.hp / b.health < D.perkConditional.secondWind.threshold) {
      b.hp = Math.min(b.health, b.hp + b.health * D.perkConditional.secondWind.heal);
      b.wind = true;
    }
    events?.push({
      side,
      damage: actual,
      critical,
      healing,
      extra,
      mitigated: damage < a.damage
    });
    if (b.hp > 0 && !extra && rng() < a.double) strike(f, a, b, side, events, true);
  }

  function eat(f, events) {
    if (f.player.hp <= 0 || !f.food.count || f.time + 1e-8 < f.food.ready || f.player.hp >= f.player.health) return false;
    const healing = Math.min(f.food.heal, f.player.health - f.player.hp);
    f.player.hp += healing;
    f.food.count--;
    f.food.used++;
    f.food.ready = f.time + C.foodSeconds;
    events?.push({
      side: 'player',
      food: true,
      healing
    });
    return true;
  }

  function secondWind(a) {
    if (a.hp > 0 && a.secondWind && !a.wind && a.hp / a.health < D.perkConditional.secondWind.threshold) {
      a.hp = Math.min(a.health, a.hp + a.health * D.perkConditional.secondWind.heal);
      a.wind = true;
    }
  }

  function auto(f, events) {
    if (f.food.threshold > 0 && f.player.hp / f.player.health <= f.food.threshold) eat(f, events);
  }
  S.kernel = {
    hit,
    crit,
    mitigation,
    reduction,
    eat,
    average(a, b) {
      return hit(a, b) * Math.max(C.minimumHit, a.damage * (1 + crit(a, b) * a.critDamage) * (1 - mitigation(a, b)) * (1 - reduction(b))) * (1 + hit(a, b) * a.double);
    },
    create(c, enemy, seed) {
      const player = {
        ...S.character.stats(c),
        hp: c.hp,
        hits: 0,
        wind: false
      };
      const foe = {
        ...G.clone(enemy),
        hp: enemy.health,
        hits: 0,
        wind: false
      };
      const food = D.catalog[c.food];
      return {
        player,
        enemy: foe,
        time: 0,
        nextPlayer: player.interval,
        nextEnemy: foe.interval,
        seed: seed || G.seed(),
        food: {
          key: c.food,
          count: c.food ? S.inventory.available(c.food, c) : 0,
          heal: food?.healing || 0,
          threshold: c.eat,
          ready: Math.max(0, (c.foodReady - Date.now()) / 1000),
          used: 0
        },
        finished: false
      };
    },
    advance(f, until, events) {
      let guard = 0;
      secondWind(f.player);
      secondWind(f.enemy);
      auto(f, events);
      while (!f.finished && guard++ < 10000) {
        let foodAt = f.food.count && f.food.threshold > 0 && f.player.hp / f.player.health <= f.food.threshold ? Math.max(f.time, f.food.ready) : Infinity;
        const next = Math.min(f.nextPlayer, f.nextEnemy, foodAt);
        if (next > until) break;
        f.time = next;
        auto(f, events);
        if (f.nextPlayer <= next + 1e-8) {
          strike(f, f.player, f.enemy, 'player', events);
          f.nextPlayer += f.player.interval;
        }
        if (f.enemy.hp <= 0) {
          f.finished = true;
          f.won = true;
          break;
        }
        if (f.nextEnemy <= next + 1e-8) {
          strike(f, f.enemy, f.player, 'enemy', events);
          f.nextEnemy += f.enemy.interval;
        }
        if (f.player.hp <= 0) {
          f.finished = true;
          f.won = false;
          break;
        }
        auto(f, events);
      }
      if (!f.finished) f.time = until;
      return f;
    },
    simulate(c, enemy, count = C.simulations) {
      let wins = 0,
        duration = 0,
        foods = 0;
      const stream = {
        seed: 231997
      };
      for (let i = 0; i < count; i++) {
        const f = this.create(c, enemy, Math.floor(G.random(stream) * 4294967295) || 1);
        let steps = 0;
        while (!f.finished && steps++ < 3000) this.advance(f, Math.min(f.nextPlayer, f.nextEnemy), null);
        wins += f.finished && f.won ? 1 : 0;
        duration += f.time;
        foods += f.food.used;
      }
      return {
        chance: wins / count,
        count,
        seconds: duration / count,
        foods: foods / count
      };
    }
  };
  S.combat = {
    start() {
      G.ensureProgress();
      const c = G.character(),
        e = c.encounter;
      G.assert(e && ['regular', 'elite', 'boss'].includes(e.type), 'No creature to fight.');
      S.tutorial?.guard('fight');
      G.assert(c.hp > 0, 'You have no HP.');
      c.combat = S.kernel.create(c, e.enemy, Math.floor(G.rng() * 4294967295) || 1);
      G.runtime.log = [];
      G.runtime.fightStartDamage = c.stats.damage;
      G.save.write();
      G.emit('change');
    },
    tick(seconds) {
      const c = G.character();
      if (!c?.combat) return;
      const f = c.combat,
        events = [],
        used = f.food.used;
      S.kernel.advance(f, f.time + seconds, events);
      c.hp = f.player.hp;
      if (f.food.used > used) S.inventory.take(f.food.key, f.food.used - used, c);
      c.foodReady = Date.now() + Math.max(0, f.food.ready - f.time) * 1000;
      events.forEach(e => {
        if (e.damage && e.side === 'player') c.stats.damage += e.damage;
        G.runtime.log.unshift(e.food ? 'You eat and recover ' + G.number(e.healing, 1) + ' HP.' : e.miss ? (e.side === 'player' ? 'You' : 'Enemy') + ' miss.' : (e.side === 'player' ? 'You' : 'Enemy') + ' deal ' + G.number(e.damage, 1) + (e.critical ? ' critical' : '') + ' damage' + (e.extra ? ' (double strike)' : '') + '.');
        G.emit('strike', e);
      });
      G.runtime.log = G.runtime.log.slice(0, 60);
      if (events.length) G.save.write();
      if (f.finished) this.finish(f.won);
    },
    foodCooldown(c = G.character()) {
      if (c.combat) return Math.max(0, c.combat.food.ready - c.combat.time);
      return Math.max(0, ((c.peaceFoodReady || 0) - Date.now()) / 1000);
    },
    manualEat() {
      const c = G.character();
      if (c.combat) {
        const f = c.combat,
          events = [];
        G.assert(S.kernel.eat(f, events), 'Food unavailable, HP full, or food cooldown active.');
        S.inventory.take(f.food.key, 1, c);
        c.hp = f.player.hp;
        c.foodReady = Date.now() + C.foodSeconds * 1000;
        G.emit('strike', events[0]);
      } else {
        G.assert(c.food, 'Select food first.');
        G.assert(c.hp < S.character.stats(c).health, 'Already at full HP.');
        G.assert(this.foodCooldown(c) === 0, 'Food cooldown is active.');
        S.inventory.take(c.food, 1, c);
        c.hp = Math.min(S.character.stats(c).health, c.hp + D.catalog[c.food].healing);
        c.peaceFoodReady = Date.now() + C.peaceFoodSeconds * 1000;
        G.audio?.play('heal');
      }
      G.commit();
    },
    finish(won) {
      const c = G.character(),
        encounter = c.encounter;
      const abandon = c.dungeon?.interrupted;
      c.combat = null;
      c.encounter = null;
      if (!won) {
        this.death();
        return;
      }
      c.stats[encounter.type]++;
      const levelUps = S.xp.add(c, D.loot[encounter.type].xp * encounter.enemy.level);
      if (levelUps) {
        c.hp = S.character.stats(c).health;
        G.notify('Level ' + c.level + ' reached. Health fully restored.', 'success');
      }
      if (encounter.type === 'boss') {
        c.stats.bossKills[encounter.enemy.boss] = true;
        c.stats.dungeons++;
        c.dungeon = null;
      }
      const rewards = S.loot.roll(encounter.type, encounter.enemy.level, c.location);
      S.tutorial?.victory(encounter, rewards);
      S.inventory.reward(rewards);
      S.loot.present(rewards, 'Victory');
      G.emit('effect', {
        kind: 'victory'
      });
      if (abandon) {
        c.dungeon = null;
        G.notify('Interrupted fight resolved. The dungeon run has ended.', 'warning');
      } else if (c.dungeon) c.dungeon.cleared = true;
      G.audio?.play('loot');
      G.commit();
    },
    deathPenalty(c = G.character()) {
      const percent = 10 + c.location * 5;
      return {percent, items: c.location + 1, coins: Math.min(c.coins, Math.ceil(c.coins * percent / 100))};
    },
    loseInventory(c) {
      const penalty = this.deathPenalty(c), lost = [];
      // Equipped gear/tools never enter the draw. Locks protect against manual
      // sale/discard, but do not turn stored inventory into death-proof storage.
      const equipped = new Set([...Object.values(c.equipment), ...Object.values(c.tools)].filter(Boolean).map(i => i.id));
      for (let n = 0; n < penalty.items; n++) {
        const eligible = c.inventory.filter(i => !equipped.has(i.id));
        const total = eligible.reduce((sum, i) => sum + (i.quantity || 1), 0);
        if (!total) break;
        let draw = Math.floor(G.rng() * total), item;
        for (const candidate of eligible) {
          draw -= candidate.quantity || 1;
          if (draw < 0) { item = candidate; break; }
        }
        const copy = G.clone(item);
        if (copy.quantity) copy.quantity = 1;
        lost.push(copy);
        if (item.quantity > 1) item.quantity--;
        else c.inventory.splice(c.inventory.indexOf(item), 1);
      }
      c.coins -= penalty.coins;
      return {...penalty, lost, location: D.locations[c.location].name};
    },
    death() {
      S.afk?.stop('Defeat', false);
      const c = G.character();
      c.stats.deaths++;
      c.encounter = null;
      c.combat = null;
      c.activity = null;
      c.dungeon = null;
      if (c.mode === 'Hardcore') {
        const name = c.name;
        G.save.recordFate(c, 'dead');
        G.state.slots[G.state.active] = null;
        G.save.write();
        G.notify(name + ' has fallen. The Hardcore character is permanently deleted.', 'error');
      } else {
        const penalty = this.loseInventory(c);
        if (c.mode === 'Hardcore Ironman') {
          G.save.recordFate(c, 'Ironman');
          c.mode = 'Ironman';
          G.notify('You have fallen. Hardcore Ironman permanently becomes Ironman.', 'warning');
        }
        G.notify('Defeat: lost ' + penalty.lost.length + ' inventory item' + (penalty.lost.length === 1 ? '' : 's') + ' and ' + G.money(penalty.coins) + ' (' + penalty.percent + '%).', 'warning');
        c.hp = S.character.stats(c).health;
        G.commit();
        G.emit('death-loss', penalty);
      }
      G.audio?.play('death');
      G.emit('effect', {
        kind: 'death'
      });
      G.emit('change');
    }
  };
})(RPG, RPG.data, RPG.systems);
