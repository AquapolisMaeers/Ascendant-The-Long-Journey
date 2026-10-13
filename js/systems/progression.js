'use strict';
(function(G, D, S) {
  S.achievements = {
    check() {
      const c = G.character();
      if (!c) return;
      for (const a of D.achievements)
        if (!c.achievements[a.id] && a.metric(c) >= a.target) {
          c.achievements[a.id] = Date.now();
          G.notify('Achievement: ' + a.name + (a.title ? ' · ' + a.title : ''), 'achievement');
          G.audio?.play('achievement');
          if (a.title) G.emit('prestige', {
            title: a.title
          });
        }
    },
    titles(c) {
      return D.achievements.filter(a => a.title && c.achievements[a.id]).map(a => a.title);
    }
  };
  S.offline = {
    rate(c, skill) {
      const tier = D.tierFor(c.skills[skill].level);
      let xp = D.config.skillXp * D.tiers[tier];
      if (skill === 'Smithing') xp = D.recipes.find(r => r.id === 'bar:' + tier).xp;
      if (skill === 'Cooking') xp = D.recipes.find(r => r.id === 'cook:' + tier).xp;
      if (skill === 'Faceting') xp = D.config.skillXp * D.config.facetingXp * c.skills[skill].level;
      return xp / (D.config.actionMs / 1000);
    },
    select(skill) {
      G.assert(skill === null || D.skills.includes(skill), 'Choose a valid AFK discipline.');
      const c = G.character();
      this.apply(c);
      c.offline = skill;
      G.commit();
    },
    apply(c, now = Date.now()) {
      const seconds = G.clamp((now - c.lastSeen) / 1000, 0, D.config.offlineHours * 3600);
      let earned = 0;
      if (c.offline && seconds >= 1) {
        const skill = c.offline,
          rate = this.rate(c, skill);
        earned = rate * seconds * D.config.offlineRate * (1 + S.items.toolBonus(c, skill, 'Knowledge'));
        S.xp.add(c.skills[skill], earned);
      }
      c.lastSeen = now;
      S.market.expire(c);
      return {
        name: c.name,
        skill: c.offline,
        seconds,
        xp: earned
      };
    },
    applyAll() {
      G.runtime.offline = G.state.slots.filter(Boolean).map(c => this.apply(c)).filter(r => r.xp > 0);
    },
    resume() {
      for (const c of G.state.slots.filter(Boolean)) {
        if (c.dungeon) {
          if (c.combat) c.dungeon.interrupted = true;
          else {
            c.dungeon = null;
            c.encounter = null;
          }
        }
        if (c.activity?.type === 'advance') {
          c.activity = null;
        }
      }
      this.applyAll();
    }
  };
})(RPG, RPG.data, RPG.systems);
