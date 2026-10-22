'use strict';
(function(G, D, S) {
  S.achievements = {
    check() {
      const c = G.character();
      if (!c) return;
      S.quests.sync(c);
      for (const a of D.achievements)
        if (!c.achievements[a.id] && a.metric(c) >= a.target) {
          c.achievements[a.id] = Date.now();
          G.notify('Achievement: ' + a.name + (a.title ? ' · ' + a.title : ''), 'achievement');
          G.audio?.play('achievement');
          if (a.title) G.emit('prestige', {
            title: a.title
          });
        }
      const earned = S.ascendant.sync(c);
      if (earned) G.notify('+' + earned + ' Ascendant Coins earned.', 'success');
    },
    titles(c) {
      return D.achievements.filter(a => a.title && c.achievements[a.id]).map(a => a.title);
    }
  };
  S.playtime = {
    active: null,
    normalize(c,now=Date.now()) {
      c.playTime ??= {onlineMs:0,offlineMs:0,updatedAt:now,startedAt:now};
      return c.playTime;
    },
    settle(c,now=Date.now()) {
      if(!c)return;
      const time=this.normalize(c,now),elapsed=Math.max(0,now-time.updatedAt);
      const key=this.active===c?'onlineMs':'offlineMs';
      time[key]=Math.min(1e15,time[key]+elapsed);
      time.updatedAt=Math.max(time.updatedAt,now);
    },
    activate(c,now=Date.now()) {
      if(this.active!==c){this.pause(now);this.settle(c,now);this.active=c;}
      else this.settle(c,now);
    },
    pause(now=Date.now()) {
      if(this.active)this.settle(this.active,now);
      this.active=null;
    },
    tick(now=Date.now()) {
      const c=G.character();
      if(!c||document.hidden||G.runtime.selecting||G.runtime.loadFailure||!G.account.playable()){this.pause(now);return;}
      this.activate(c,now);
    },
    flush(now=Date.now()) {
      if(this.active===G.character()&&!document.hidden&&!G.runtime.selecting&&!G.runtime.loadFailure)this.settle(this.active,now);
      else this.pause(now);
    },
    totals(c,now=Date.now()) {
      const time=c.playTime;
      if(!time)return {onlineMs:0,offlineMs:0,startedAt:now};
      const elapsed=Math.max(0,now-time.updatedAt),online=this.active===c;
      return {onlineMs:Math.min(1e15,time.onlineMs+(online?elapsed:0)),offlineMs:Math.min(1e15,time.offlineMs+(online?0:elapsed)),startedAt:time.startedAt};
    }
  };
  S.offline = {
    rate(c, skill) {
      const tier = D.tierFor(c.skills[skill].level);
      let xp = D.config.skillXp * D.tiers[tier];
      if (skill === 'Smithing') xp = D.recipes.find(r => r.id === 'bar:' + tier).xp;
      if (skill === 'Cooking') xp = D.recipes.find(r => r.id === 'cook:' + tier).xp;
      if (skill === 'Faceting') xp = D.config.skillXp * D.config.offlineFacetingXp * c.skills[skill].level * D.config.offlineFacetingMultiplier;
      if (skill === 'Smithing' || skill === 'Cooking') xp *= .5;
      return xp / (D.config.actionMs / 1000);
    },
    select(skill) {
      G.assert(skill === null || D.skills.includes(skill), 'Choose a valid AFK discipline.');
      const c = G.character();
      const result = this.apply(c);
      if (result.levelsGained) this.record(result);
      c.offline = skill;
      G.commit();
    },
    apply(c, now = Date.now()) {
      S.playtime.settle(c,now);
      const seconds = G.clamp((now - c.lastSeen) / 1000, 0, D.config.offlineHours * 3600);
      let earned = 0;
      const previous = c.offline ? c.skills[c.offline].level : null;
      if (c.offline && seconds >= 1) {
        const skill = c.offline,
          rate = this.rate(c, skill);
        earned = rate * seconds * D.config.offlineRate * (1 + S.items.toolBonus(c, skill, 'Knowledge') + (S.skilling.effects(c).offlineKnowledge||0));
        S.xp.add(c.skills[skill], earned, {silent:true});
      }
      c.lastSeen = now;
      S.market.expire(c);
      return {
        characterId: c.id,
        name: c.name,
        skill: c.offline,
        seconds,
        xp: earned,
        fromLevel: previous,
        toLevel: c.offline ? c.skills[c.offline].level : null,
        levelsGained: c.offline ? c.skills[c.offline].level - previous : 0,
        progressXp: c.offline ? c.skills[c.offline].xp : 0
      };
    },
    record(result) {
      if (!result.xp) return;
      const rows = G.runtime.offline ??= [], existing = rows.find(row => row.characterId === result.characterId && row.skill === result.skill);
      if (existing) {
        existing.xp += result.xp;
        existing.seconds += result.seconds;
        existing.toLevel = result.toLevel;
        existing.levelsGained = existing.toLevel - existing.fromLevel;
        existing.progressXp = result.progressXp;
      } else rows.push(result);
      G.emit('offline-progress');
    },
    resume(c = G.character()) {
      if (!c) return;
      S.companions.sync(c);
      S.quests.sync(c);
      if (c.dungeon) {
        if (c.combat) c.dungeon.interrupted = true;
        else {
          c.dungeon = null;
          c.encounter = null;
        }
      }
      if (c.activity?.type === 'advance') c.activity = null;
      const result = this.apply(c);
      this.record(result);
      if(c===G.character()&&!document.hidden&&!G.runtime.selecting)S.playtime.activate(c);
      return result;
    }
  };
})(RPG, RPG.data, RPG.systems);
