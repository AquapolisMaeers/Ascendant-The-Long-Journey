'use strict';
(function(G) {
  const skills = ['mining','woodcutting','fishing','hunting','smithing','cooking','faceting'];
  const scenes = [...skills, 'travel', 'combat', 'dungeon'];
  const effects = ['hit','crit','miss','loot','rare','enhance','ascend','socket','achievement','dungeon','boss','death','heal',
    ...skills, 'cast','sword','bow','magic','travel'];
  G.audio = {
    unlocked: false, music: null, voices: [], loops: [], last: {}, variants: {},
    sceneKey: null, previewScene: null, previewUntil: 0, suspended: false, mixedAt: 0,
    unlock() {
      if (!this.unlocked) {
        this.unlocked = true;
        this.music = new Audio('assets/audio/wayside-theme.wav');
        this.music.loop = true;
        this.music.preload = 'auto';
        this.music.volume = 0;
      }
      this.sync();
    },
    scene() {
      const preview = this.previewContext, current = G.character();
      if (this.previewScene && performance.now() < this.previewUntil && preview?.character === current && preview.activity === current?.activity && preview.combat === current?.combat) return this.previewScene;
      this.previewScene = null;
      const c = G.character();
      if (!c || G.runtime.loadFailure || G.account?.enabled && !G.account.playable()) return null;
      if (c.combat) return 'combat';
      if (c.pending.length) return null;
      const a = c.activity;
      if (a?.type === 'advance') return 'travel';
      if (a?.type === 'gather') return a.skill.toLowerCase();
      if (a?.type === 'craft') return G.data.recipes.find(r => r.id === a.recipe)?.skill.toLowerCase() || null;
      return c.dungeon ? 'dungeon' : null;
    },
    startMedia(media) {
      media.play().then(() => {
        if (document.hidden || this.suspended || !G.state.settings.master) media.pause();
      }).catch(() => {});
    },
    sync() {
      if (!this.unlocked) return;
      const s = G.state.settings, now = performance.now();
      const dt = Math.min(.1, Math.max(0, (now - (this.mixedAt || now - 50)) / 1000));
      this.mixedAt = now;
      const silent = document.hidden || this.suspended || !s.master;
      const scene = this.scene();
      this.sceneKey = scene;
      const ambience = s.ambience ?? 45;
      const audible = !silent && ambience > 0;
      if (scene && audible && !this.loops.some(l => l.key === scene)) {
        // Keep at most an outgoing and an incoming soundscape.
        if (this.loops.length >= 2) this.loops.shift().media.pause();
        const media = new Audio('assets/audio/ambience-' + scene + '.wav');
        media.loop = true;
        media.volume = 0;
        this.loops.push({key: scene, media, fade: 0});
      }
      for (const loop of this.loops) {
        const target = audible && loop.key === scene ? 1 : 0;
        loop.fade = silent || !ambience ? 0 : G.clamp(loop.fade + (target ? 1 : -1) * dt / 1, 0, 1);
        loop.media.volume = s.master / 100 * ambience / 100 * .5 * loop.fade;
        if (!audible || loop.fade === 0 && !target) loop.media.pause();
        else if (loop.media.paused) this.startMedia(loop.media);
      }
      this.loops = this.loops.filter(l => l.key === scene || l.fade > 0);
      const musicVolume = s.master * s.music / 10000 * .8 * (scene && ambience ? .45 : 1);
      this.music.volume = silent || !s.music ? 0 : this.music.volume + (musicVolume - this.music.volume) * Math.min(1, dt * 3);
      if (silent || !s.music) this.music.pause();
      else if (this.music.paused) this.startMedia(this.music);
      for (const voice of this.voices) {
        voice.volume = s.master * s.sfx / 10000 * (voice.softGain ?? .7);
        if (silent || !s.sfx) voice.pause();
      }
      this.voices = this.voices.filter(v => !v.ended && !v.paused);
    },
    play(kind, event = null) {
      // Navigation and unknown UI events are intentionally silent.
      if (!effects.includes(kind)) return;
      if (!this.unlocked || document.hidden || this.suspended) return;
      const s = G.state.settings, now = performance.now();
      if (!s.master || !s.sfx || now - (this.last[kind] ?? -Infinity) < (['loot','rare','achievement'].includes(kind) ? 1500 : 120)) return;
      this.last[kind] = now;
      if (['hit','crit'].includes(kind) && event?.side === 'player') {
        kind = {Warrior:'sword', Archer:'bow', Mage:'magic'}[G.character()?.class] || kind;
      }
      let file = kind;
      if (skills.includes(kind)) {
        // Separate from gameplay RNG; cycling prevents identical consecutive impacts.
        const variant = (this.variants[kind] || 0) % 3 + 1;
        this.variants[kind] = variant;
        if (variant > 1) file += '-' + variant;
      }
      this.voices = this.voices.filter(v => !v.ended && !v.paused);
      if (this.voices.length >= 4) this.voices.shift().pause();
      const voice = new Audio('assets/audio/' + file + '.wav');
      voice.softGain = ['loot','rare','achievement','enhance','ascend','socket','heal'].includes(kind) ? .45 : .7;
      voice.volume = s.master * s.sfx / 10000 * (voice.softGain ?? .7);
      this.voices.push(voice);
      this.startMedia(voice);
    },
    preview(kind) {
      G.assert(scenes.includes(kind), 'Choose an activity soundscape.');
      this.unlock();
      const c = G.character();
      this.previewContext = {character: c, activity: c?.activity, combat: c?.combat};
      this.previewScene = kind;
      this.previewUntil = performance.now() + 6000;
      this.sync();
      this.play(kind === 'combat' ? 'sword' : kind);
    },
    endPreview() {
      this.previewScene = null;
      this.previewUntil = 0;
      this.sync();
    },
    suspend() {
      this.suspended = true;
      this.endPreview();
      this.music?.pause();
      this.loops.forEach(l => l.media.pause());
      this.voices.forEach(v => v.pause());
    }
  };
  document.addEventListener('pointerdown', () => G.audio.unlock(), {once:true});
  document.addEventListener('keydown', () => G.audio.unlock(), {once:true});
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) G.audio.endPreview();
    G.audio.sync();
  });
  window.addEventListener('rpg:rendered', () => G.audio.sync());
  window.addEventListener('pagehide', () => G.audio.suspend());
  window.addEventListener('pageshow', () => { G.audio.suspended = false; G.audio.sync(); });
  // Also catches an activity paused by error/loot without requiring a render.
  setInterval(() => G.audio.sync(), 50);
})(RPG);
