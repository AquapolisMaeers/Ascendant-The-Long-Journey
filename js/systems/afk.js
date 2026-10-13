'use strict';
(function(G, D, S) {
  // Running state is deliberately session-only; preferences belong to each character.
  S.afk = {
    run: null,
    status: 'Ready when you are.',
    start() {
      G.ensureProgress();
      const c = G.character();
      G.assert(!c.dungeon && !S.tutorial.active(), 'Finish the tutorial and leave the dungeon before AFK advancing.');
      G.assert(c.hp / S.character.stats(c).health > c.afk.minHp, 'Recover above your AFK health limit first.');
      this.run = { id: c.id, elapsed: 0, inspect: 0, skipped: 0, fights: 0 };
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
        minHp: [.25, .5, .75], minutes: [15, 30, 60],
        elites: [true, false], gather: [true, false], chests: [true, false]
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
      run.elapsed += ms;
      let reason = null;
      if (c.pending.length || c.inventory.length >= c.capacity) reason = 'Make inventory space to continue';
      else if (c.dungeon || S.tutorial.active()) reason = 'Manual adventure requires your attention';
      else if (run.elapsed >= c.afk.minutes * 60000) reason = 'Session timer finished';
      else if (!c.combat && c.hp / S.character.stats(c).health <= c.afk.minHp) reason = 'Health reached your stop limit';
      if (reason) { this.stop(reason); G.commit(); return; }
      if (c.combat || c.activity) { run.inspect = 0; return; }
      if (document.querySelector('.modal')) return;
      const e = c.encounter;
      if (!e) { S.world.advance(true); return; }
      run.inspect += ms;
      if (run.inspect < 1000) return;
      run.inspect = 0;
      if (e.enemy && (e.type === 'regular' || e.type === 'elite' && c.afk.elites)) {
        // Recompute using current HP, gear, perks, food stock and shared cooldown.
        const sim = S.kernel.simulate(c, e.enemy);
        if (sim.chance >= c.afk.chance) {
          this.status = 'Fighting ' + e.enemy.name + ' (' + G.percent(sim.chance, 1) + ' estimated).';
          run.fights++;
          S.combat.start();
          return;
        }
        this.status = 'Skipped ' + e.enemy.name + ': ' + G.percent(sim.chance, 1) + ' estimated.';
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
