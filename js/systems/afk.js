'use strict';
(function(G, D, S) {
  // Running state is deliberately session-only; preferences belong to each character.
  S.afk = {
    run: null,
    status: 'Ready when you are.',
    minuteRate(c = G.character()) { return D.afkMinuteRates[c.location]; },
    start() {
      G.ensureProgress();
      const c = G.character();
      G.assert(!c.dungeon && !S.tutorial.active(), 'Finish the tutorial and leave the dungeon before AFK advancing.');
      G.assert(c.hp / S.character.stats(c).health > c.afk.minHp, 'Recover above your AFK health limit first.');
      G.assert(!this.run, 'An AFK session is already running.');
      this.run = { id: c.id, location:c.location, elapsed: 0, inspect: 0, skipped: 0, fights: 0, paidMinutes:0, spent:0, rate:this.minuteRate(c), dungeon:false };
      this.status = 'Following your filters.';
      G.commit();
    },
    stop(reason = 'Stopped', notify = true) {
      if (!this.run) return;
      this.run = null;
      this.status = reason + '.';
      const c = G.character();
      if (c?.activity?.afk) c.activity = null;
      G.save?.write();
      G.emit('change');
      if (notify) G.notify('AFK advancing: ' + reason + '.');
    },
    configure(key, value) {
      const choices = {
        interval: [8000, 12000, 16000], chance: [.55, .65, .75, .85, .95],
        minHp: [.25, .5, .75],
        normals: [true, false], dungeons: [true, false], elites: [true, false], gather: [true, false], chests: [true, false]
      };
      G.assert(choices[key]?.includes(value), 'Invalid AFK setting.');
      this.stop('Filters changed', false);
      G.character().afk[key] = value;
      G.commit();
    },
    tick(ms) {
      const run = this.run, c = G.character();
      if (!run || document.hidden) return;
      if (!c || c.id !== run.id) { this.stop('Character changed', false); return; }
      if (c.location !== run.location) { this.stop('Location changed', false); return; }
      run.elapsed += ms;
      let reason = null;
      if (c.pending.length || c.inventory.length >= c.capacity) reason = 'Make inventory space to continue';
      else if (c.dungeon && !run.dungeon || S.tutorial.active()) reason = 'Manual adventure requires your attention';
      else if (!c.combat && c.hp / S.character.stats(c).health <= c.afk.minHp) reason = 'Health reached your stop limit';
      if (!reason) {
        // Pay for each started extra minute, never for unused future minutes.
        const due = Math.max(0, Math.ceil((run.elapsed - 15 * 60000) / 60000)) - run.paidMinutes;
        if (due > 0) {
          const cost = due * run.rate;
          if (c.coins < cost) reason = 'Insufficient Bronze for the next paid minute';
          else { c.coins -= cost; run.paidMinutes += due; run.spent += cost; G.commit(); }
        }
      }
      if (reason) { this.stop(reason); G.commit(); return; }
      if (c.combat || c.activity) { run.inspect = 0; return; }
      if (document.querySelector('.modal')) return;
      const e = c.encounter;
      if (!e && !c.dungeon) { run.dungeon=false; S.world.advance(true); return; }
      run.inspect += ms;
      if (run.inspect < 1000) return;
      run.inspect = 0;
      if (c.dungeon?.cleared) { S.dungeons.next(); return; }
      if (c.dungeon && ['fountain','spoils'].includes(e?.type)) { S.dungeons.event(); return; }
      if (e?.type === 'dungeon' && c.afk.dungeons) {
        this.status = 'Entering the dungeon. Every room gets a fresh odds check.';
        run.dungeon=true; S.dungeons.enter(); return;
      }
      if (e.enemy && (c.dungeon || e.type === 'regular' && c.afk.normals !== false || e.type === 'elite' && c.afk.elites)) {
        // Recompute using current HP, gear, perks, food stock and shared cooldown.
        const sim = S.kernel.simulate(c, e.enemy);
        if (sim.chance >= c.afk.chance) {
          this.status = 'Fighting ' + e.enemy.name + ' (' + G.percent(sim.chance, 1) + ' estimated).';
          run.fights++;
          S.combat.start();
          return;
        }
        this.status = 'Skipped ' + e.enemy.name + ': ' + G.percent(sim.chance, 1) + ' estimated.';
        if (c.dungeon) { run.skipped++; S.dungeons.leave(); run.dungeon=false; return; }
      } else if (e.type === 'treasure' && c.afk.chests) {
        this.status = 'Opening a wayside chest.';
        S.world.openChest();
        return; // A revealed Mimic gets its own fresh odds check.
      } else if (c.afk.gather && D.skills.slice(0, 4).includes(e.type) &&
          c.skills[e.type].level >= D.tiers[e.tier] && S.items.usableTool(c, e.type)) {
        this.status = 'Gathering ' + e.type.toLowerCase() + ' resources.';
        S.world.gather();
        return;
      } else this.status = 'Skipped encounter outside your filters.';
      run.skipped++;
      S.world.moveOn();
    }
  };
})(RPG, RPG.data, RPG.systems);
