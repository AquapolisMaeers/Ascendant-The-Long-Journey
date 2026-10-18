'use strict';
(function(G, D, S) {
  S.tutorial = {
    active(c = G.character()) {
      return !!c?.guide?.active;
    },
    current(c = G.character()) {
      return this.active(c) ? D.tutorial.steps[c.guide.step] : null;
    },
    ensure() {
      const c = G.character();
      if (c && !c.tutorial && !this.active(c) && !c.combat && !c.activity && !c.dungeon) this.start();
    },
    start() {
      G.ensureIdle();
      const c = G.character();
      G.assert(!c.dungeon, 'Leave the dungeon first.');
      G.assert(!c.tutorial, 'This character has already completed the tutorial.');
      if (!c.guide?.active) {
        c.guide = {
          active: true,
          step: c.perks[1] === undefined ? 0 : 1,
          weaponId: c.equipment.Weapon?.id,
          gathered: {},
          cooked: 0,
          smelted: 0,
          faceted: 0,
          grantedGem: false,
          plateId: null
        };
        c.location = 0;
        c.encounter = null;
      }
      G.runtime.page = 'World';
      G.runtime.tab = '';
      G.commit();
    },
    perkChosen() {
      if (this.current()?.id === 'perk' && G.character().perks[1] !== undefined) this.advanceStep();
    },
    guard(action, id) {
      if (!this.active()) return;
      const c = G.character(),
        step = this.current().id;
      const allowed = action === 'advance' && (D.skills.slice(0, 4).includes(step) || step === 'fight') ||
        action === 'gather' && step === c.encounter?.type ||
        action === 'craft' && (step === id || step === 'facet' && id === 'facet:' + D.classes.indexOf(c.class) + ':0') ||
        action === 'enhance' && step === 'enhance' && id === c.guide.weaponId ||
        action === 'fight' && step === 'fight' && c.encounter?.tutorial;
      G.assert(allowed, 'Complete the current tutorial lesson to continue.');
    },
    discover() {
      if (!this.active()) return false;
      const c = G.character(),
        step = this.current().id;
      if (D.skills.slice(0, 4).includes(step)) c.encounter = {
        type: step,
        tier: 0,
        charges: D.config.nodeCharges,
        tutorial: true
      };
      else if (step === 'fight') {
        const enemy = S.world.enemy('regular', 0, 1);
        Object.assign(enemy, {
          name: 'Highwayman',
          archetype: 'Balanced Melee',
          health: 28,
          damage: 6.4,
          defence: 1,
          crit: D.config.baseCrit,
          critDamage: D.config.baseCritDamage,
          speed: 0,
          interval: D.config.attackSeconds
        });
        c.encounter = {
          type: 'regular',
          enemy,
          tutorial: true
        };
      } else return false;
      G.runtime.estimate = null;
      return true;
    },
    advanceStep() {
      const c = G.character();
      if (!this.active()) return;
      c.guide.step++;
      if (this.current()?.id === 'facet' && !c.guide.grantedGem) {
        c.guide.grantedGem = true;
        S.inventory.reward([{
          key: 'uncut:' + D.classes.indexOf(c.class),
          quantity: 1
        }]);
        G.notify('Faceting lesson: one typed uncut gem supplied.', 'success');
      }
      G.ui.close();
      window.scrollTo(0, 0);
      G.notify('Next lesson: ' + this.current().title, 'info');
    },
    gathered(skill, rewards) {
      if (!this.active() || this.current().id !== skill) return;
      const c = G.character(),
        key = D.resourceKinds[D.skills.indexOf(skill)] + ':0';
      c.guide.gathered[skill] = (c.guide.gathered[skill] || 0) + rewards.filter(r => r.key === key).reduce((n, r) => n + r.quantity, 0);
    },
    nodeComplete(skill) {
      if (this.active() && this.current().id === skill && (G.character().guide.gathered[skill] || 0) >= 5) this.advanceStep();
    },
    crafted(recipe, success, rewards) {
      if (!this.active() || !success) return;
      const c = G.character(),
        step = this.current().id;
      if (step === recipe.id && recipe.id === 'cook:0') {
        c.guide.cooked += rewards.filter(r => r.key === 'food:0').reduce((n, r) => n + r.quantity, 0);
        if (c.guide.cooked >= 5) {
          c.food = 'food:0';
          c.eat = 0;
          this.advanceStep();
        }
      } else if (step === recipe.id && recipe.id === 'bar:0') this.advanceStep();
      else if (step === 'facet' && recipe.id === 'facet:' + D.classes.indexOf(c.class) + ':0') this.advanceStep();
    },
    enhanced(item) {
      if (this.active() && this.current().id === 'enhance' && item.id === G.character().guide.weaponId) this.advanceStep();
    },
    prefix(item) {
      return this.active() && this.current().id === 'enhance' && item.id === G.character().guide.weaponId ? {
        key: 'damage',
        increment: D.tutorial.prefixDamage
      } : null;
    },
    victory(encounter, rewards) {
      if (!this.active() || !encounter.tutorial || this.current().id !== 'fight') return;
      const c = G.character(),
        plate = S.items.create(0, D.pieces.indexOf('Plate'), 0);
      rewards.push(plate, {
        coins: D.tutorial.bonusBronze
      });
      c.guide.plateId = plate.id;
      this.advanceStep();
    },
    equipped(item) {
      if (this.active() && this.current().id === 'equip' && item.id === G.character().guide.plateId) this.advanceStep();
    },
    acknowledge() {
      const id = this.current()?.id;
      G.assert(['preferences', 'offline', 'afk', 'recovery', 'prefixes', 'ready'].includes(id), 'Complete the current practical lesson first.');
      G.assert(G.runtime.page===this.current().route.page,'Follow the directions to '+this.current().route.page+' before completing this lesson.');
      if (id === 'ready') this.finish();
      else { this.advanceStep(); G.commit(); }
    },
    finish(skip = false) {
      const c = G.character();
      G.assert(!skip && this.active() && this.current().id === 'ready' && c.equipment.Plate?.id === c.guide.plateId, 'The tutorial is required. Complete every lesson and equip the tutorial Plate to finish.');
      if (this.active()) {
        G.assert(!c.combat && !c.activity, 'Finish or stop the current tutorial action first.');
        c.guide.active = false;
        if (c.encounter?.tutorial) c.encounter = null;
      }
      const first = !c.tutorial;
      c.tutorial = 1;
      if (first) {
        c.hp = S.character.stats(c).health;
        G.notify('Tutorial complete. Health fully restored.', 'success');
      }
      G.runtime.page = 'World';
      G.runtime.tab = '';
      G.ui.close();
      window.scrollTo(0, 0);
      G.commit();
    }
  };
  S.recovery = {
    canRest(c = G.character()) {
      return !!c && !c.combat && !c.dungeon && (!c.activity || S.afk.run?.id === c.id && ['advance','gather'].includes(c.activity.type));
    },
    innQuote(fraction, c = G.character()) {
      G.assert([.25, .5, 1].includes(fraction), 'Choose 25%, 50% or full health.');
      const max = S.character.stats(c).health, missing = Math.max(0, max - c.hp);
      const healing = Math.min(missing, fraction === 1 ? missing : max * fraction);
      return {healing, coins: Math.ceil(c.level * healing)};
    },
    inn(fraction) {
      G.ensureIdle();
      const c = G.character();
      G.assert(!c.dungeon, 'Visit the inn in the outside world.');
      const q = this.innQuote(fraction, c);
      G.assert(q.healing > 0, 'Already at full health.');
      G.assert(c.coins >= q.coins, 'Insufficient coins.');
      c.coins -= q.coins;
      c.hp = Math.min(S.character.stats(c).health, c.hp + q.healing);
      G.audio?.play('heal');
      G.notify('The inn restored ' + G.number(q.healing, 2) + ' HP for ' + G.number(q.coins) + ' Bronze.', 'success');
      G.commit();
    },
    rest() {
      G.assert(this.canRest(), 'Finish combat or your manual activity before resting.');
      const c = G.character();
      G.assert(!c.dungeon, 'Rest is available in the outside world.');
      G.assert(Date.now() >= (c.restReadyAt || 0), 'Rest is still on cooldown.');
      G.assert(c.hp < S.character.stats(c).health, 'Already at full health.');
      c.hp = S.character.stats(c).health;
      c.restReadyAt = Date.now() + D.config.restCooldownMs;
      G.audio?.play('heal');
      G.notify('You rest by the campfire. Health fully restored.', 'success');
      G.emit('effect', {
        kind: 'heal'
      });
      G.commit();
    }
  };
})(RPG, RPG.data, RPG.systems);
