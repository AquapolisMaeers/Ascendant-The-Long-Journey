'use strict';
(function(G, D, S) {
  const C = D.config;
  // Three levels of grace, then a meaningful level disadvantage. The same
  // rule applies to both actors. Dungeon levels above the player cap retain
  // their higher base stats without an unavoidable extra level-gap penalty.
  const levelFactor=(a,b)=>{
    if(Math.max(a.level,b.level)<10)return 1;
    const difference=Math.min(C.levelCap,a.level)-Math.min(C.levelCap,b.level),gap=Math.max(0,Math.abs(difference)-3);
    const factor=Math.min(3.5,1+.3*gap+.15*gap*gap);
    return difference>=0?factor:1/factor;
  };
  const hit = (a, b) => G.clamp(1 + C.hitLevel * (a.level - b.level) - b.dodge, C.minHitChance, 1);
  const crit = (a, b) => G.clamp(a.crit - b.resistance, 0, D.caps.crit);
  const mitigation = (a, b) => {
    const def = b.defence * (1 - a.penetration);
    return Math.min(D.caps.mitigation, def / (def + C.defenceFactor * a.level));
  };
  const reduction = b => Math.min(D.caps.reduction, b.reduction + (b.lastStand && b.hp / b.health < D.perkConditional.lastStand.threshold ? D.perkConditional.lastStand.reduction : 0));
  const venomStacks = actor => Math.min(actor.deathblossom?10:5,actor.hits);

  function refreshVenomSpeed(f) {
    for(const [actor,opponent,timer] of [[f.player,f.enemy,'nextPlayer'],[f.enemy,f.player,'nextEnemy']]) {
      if(!actor.venomSpeed&&!opponent.venomSlow)continue;
      actor.venomBaseSpeed ??= actor.raw?.speed ?? actor.speed ?? 0;
      actor.venomBaseInterval ??= actor.interval;
      const baseSpeed=G.clamp(actor.venomBaseSpeed,-.5,D.caps.speed);
      const speed=G.clamp(actor.venomBaseSpeed+(actor.venomSpeed||0)*venomStacks(actor)-(opponent.venomSlow||0)*venomStacks(opponent),-.5,D.caps.speed);
      const interval=actor.venomBaseInterval*(1+baseSpeed)/(1+speed);
      // Preserve progress through an attack already being prepared when its speed changes.
      f[timer]=f.time+Math.max(0,f[timer]-f.time)*interval/actor.interval;
      actor.speed=speed;actor.interval=interval;
    }
  }

  function strike(f, a, b, side, events, extra = false) {
    const rng = () => G.random(f);
    if (rng() >= hit(a, b)) {
      events?.push({
        side,
        miss: true
      });
      return;
    }
    const hitNumber = a.hits + 1;
    const critical = rng() < crit(a, b) || a.perfectShot && hitNumber % 3 === 0;
    let damage = a.damage * (a.levelDamage ?? 1) * (critical ? 1 + a.critDamage : 1);
    if(a.fury) damage *= 1+a.fury*(1-a.hp/a.health)*(a.unchained && a.hp/a.health<.4?2:1);
    if(a.ignite) damage *= 1+a.ignite*Math.min(5,a.hits);
    if(a.venom) damage *= 1+a.venom*venomStacks(a);
    if(a.arcaneBurst && hitNumber % (a.torrent?3:4)===0) damage *= 1+a.arcaneBurst;
    if(a.aimedShot && hitNumber % 3===0) damage *= 1+a.aimedShot;
    if(a.firestorm && hitNumber % 5===0) damage *= 1.5;
    if(a.deepFreeze && b.hp/b.health<.5) damage *= 1.2;
    if(extra && a.endlessVolley) damage *= 1.4;
    if(a.counterReady) { damage *= 1.75; a.counterReady=false; }
    if(a.feastReady) { damage *= 1.3; a.feastReady=false; }
    if(a.reavingStrike && hitNumber%3===0) damage *= 1+a.reavingStrike;
    if (a.executioner && b.hp / b.health < D.perkConditional.executioner.threshold) damage *= 1 + D.perkConditional.executioner.damage;
    damage = Math.max(C.minimumHit, damage * (1 - mitigation(a, b)) * (1 - reduction(b)));
    b.received=(b.received||0)+1;
    const guarded=b.guard && b.received%4===0;
    if(guarded) { damage=Math.max(C.minimumHit,damage*(1-b.guard)); if(b.retribution)b.counterReady=true; }
    const actual = Math.min(b.hp, damage);
    b.hp = Math.max(0, b.hp - actual);
    a.hits++;
    if(a.venomSpeed||a.venomSlow)refreshVenomSpeed(f);
    const rawSteal = actual * Math.min(D.caps.lifeSteal,a.lifeSteal+(a.hp/a.health<.6?(a.siphon||0):0)), tenths = rawSteal * 10;
    // Round positive gains up to a tenth, correcting only floating-point noise at exact tenths.
    const roundedSteal = rawSteal > 0 ? Math.max(1, Math.ceil(tenths - Number.EPSILON * Math.max(1, tenths) * 4)) / 10 : 0;
    const healing = Math.min(Math.max(0, a.health - a.hp), roundedSteal);
    a.hp += healing;
    events?.push({
      side,
      damage: actual,
      critical,
      healing,
      extra,
      guarded,
      mitigated: damage < a.damage
    });
    if (a.relentless && a.hits % D.perkConditional.relentless.hits === 0)
      recover(a, a.health * D.perkConditional.relentless.heal, side, 'Relentless', events);
    if(a.feast && a.hits%4===0) { recover(a,a.health*.04,side,'Feast',events); a.feastReady=true; }
    if(a.reavingHeal && a.hits%3===0) recover(a,a.health*a.reavingHeal,side,'Leeching cuts',events);
    secondWind(b, events, side === 'player' ? 'enemy' : 'player');
    // Reflect actual post-mitigation damage once. Thorns cannot crit, heal or trigger another reflection.
    const reflected = Math.min(a.hp, actual * G.clamp(b.thorns || 0, 0, D.caps.thorns));
    if (reflected > 0) {
      a.hp = Math.max(0, a.hp - reflected);
      events?.push({side:side === 'player' ? 'enemy' : 'player',damage:reflected,thorns:true});
      secondWind(a, events, side);
    }
    if (a.hp > 0 && b.hp > 0 && !extra && rng() < a.double) strike(f, a, b, side, events, true);
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

  function recover(a, amount, side, source, events) {
    const healing = Math.min(Math.max(0, a.health - a.hp), amount);
    if (healing <= 0) return;
    a.hp += healing;
    events?.push({side, recovery:true, source, healing});
  }

  function secondWind(a, events, side) {
    if (a.hp > 0 && a.secondWind && !a.wind && a.hp / a.health < D.perkConditional.secondWind.threshold) {
      recover(a, a.health * D.perkConditional.secondWind.heal, side, 'Second Wind', events);
      a.wind = true;
    }
  }

  function auto(f, events) {
    if (f.food.threshold > 0 && f.player.hp / f.player.health <= f.food.threshold) eat(f, events);
  }
  S.kernel = {
    levelFactor,
    hit,
    crit,
    mitigation,
    reduction,
    venomStacks,
    eat,
    average(a, b) {
      return hit(a, b) * Math.max(C.minimumHit, a.damage * (a.levelDamage ?? levelFactor(a,b)) * (1 + crit(a, b) * a.critDamage) * (1 - mitigation(a, b)) * (1 - reduction(b))) * (1 + hit(a, b) * a.double);
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
      // Snapshot the level factors. Legacy saved fights omit them and continue
      // at their previously committed damage, while new fights use this rule.
      player.levelDamage=levelFactor(player,foe);
      foe.levelDamage=levelFactor(foe,player);
      if(player.chill) foe.interval *= 1+player.chill*(player.deepFreeze?2:1);
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
          threshold: c.eatUnlocks.includes(c.eat) ? c.eat : 0,
          ready: Math.max(0, (c.foodReady - Date.now()) / 1000),
          used: 0
        },
        finished: false
      };
    },
    advance(f, until, events) {
      let guard = 0;
      secondWind(f.player, events, 'player');
      secondWind(f.enemy, events, 'enemy');
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
        if (f.player.hp <= 0 || f.enemy.hp <= 0) {
          f.finished = true;
          f.won = f.player.hp > 0;
          break;
        }
        if (f.nextEnemy <= next + 1e-8) {
          strike(f, f.enemy, f.player, 'enemy', events);
          f.nextEnemy += f.enemy.interval;
        }
        if (f.player.hp <= 0 || f.enemy.hp <= 0) {
          f.finished = true;
          f.won = f.player.hp > 0;
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
    record(events, c = G.character()) {
      for (const e of events) {
        if (e.damage && e.side === 'player') c.stats.damage += e.damage;
        const who = e.side === 'player' ? 'You' : 'Enemy';
        G.runtime.log.unshift(e.food ? 'You eat and recover ' + G.number(e.healing, 2) + ' HP.' :
          e.recovery ? who + ' recover ' + G.number(e.healing, 2) + ' HP (' + e.source + ').' :
          e.miss ? who + ' miss.' : who + ' deal ' + G.number(e.damage, 1) + (e.critical ? ' critical' : '') +
          ' damage' + (e.thorns ? ' (Thorn Damage)' : '') + (e.extra ? ' (double strike)' : '') + (e.guarded ? ' (guarded)' : '') + '.' +
          (e.healing > 0 ? ' ' + who + ' recover ' + G.number(e.healing, 2) + ' HP (Lifesteal).' : ''));
        G.emit('strike', e);
      }
      G.runtime.log = G.runtime.log.slice(0, 60);
    },
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
      this.record(events, c);
      if (events.length) G.save.write();
      if (f.finished) this.finish(f.won);
    },
    foodCooldown(c = G.character()) {
      if (c.combat) return Math.max(0, c.combat.food.ready - c.combat.time);
      return Math.max(0, ((c.peaceFoodReady || 0) - Date.now()) / 1000);
    },
    manualEat(quantity=1) {
      const c = G.character();
      G.assert([1,5,10].includes(quantity),'Choose Eat, Eat 5 or Eat 10.');
      G.assert(quantity===1||!c.combat,'Eat one meal at a time during combat.');
      G.assert(quantity===1||(c.batchEatUnlocks||[]).includes(quantity),'Purchase this eating upgrade in Shop > Character first.');
      if (c.combat) {
        const f = c.combat,
          events = [];
        G.assert(S.kernel.eat(f, events), 'Food unavailable, HP full, or food cooldown active.');
        S.inventory.take(f.food.key, 1, c);
        c.hp = f.player.hp;
        c.foodReady = Date.now() + C.foodSeconds * 1000;
        this.record(events, c);
      } else {
        G.assert(c.food, 'Select food first.');
        G.assert(c.hp < S.character.stats(c).health, 'Already at full HP.');
        G.assert(this.foodCooldown(c) === 0, 'Food cooldown is active.');
        const health=S.character.stats(c).health,healing=D.catalog[c.food].healing;
        G.assert(healing>0,'Select cooked food first.');
        const count=Math.min(quantity,S.inventory.available(c.food,c),Math.ceil((health-c.hp)/healing));
        G.assert(count>0,'No unlocked food available.');
        S.inventory.take(c.food, count, c);
        c.hp = Math.min(health, c.hp + healing*count);
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
      S.guilds.progress(c,'creatures');
      if(encounter.type==='elite')S.guilds.progress(c,'elites');
      S.quests.defeated(encounter.enemy, c);
      S.companions.gain(c, D.companionRules.victoryXp * encounter.enemy.level);
      const levelUps = S.xp.add(c, D.loot[encounter.type].xp * encounter.enemy.level);
      if (levelUps) {
        const before = c.hp;
        c.hp = S.character.stats(c).health;
        if (c.hp > before) this.record([{side:'player',recovery:true,source:'Level up',healing:c.hp-before}], c);
        G.notify('Level ' + c.level + ' reached. Health fully restored.', 'success');
      }
      if (encounter.type === 'boss') {
        c.stats.bossKills[encounter.enemy.boss] = true;
        c.stats.dungeons++;
        S.guilds.progress(c,'dungeons');
        c.dungeon = null;
      }
      const rewards = S.loot.roll(encounter.type, encounter.enemy.level, c.location, encounter.enemy.name === 'Mimic');
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
