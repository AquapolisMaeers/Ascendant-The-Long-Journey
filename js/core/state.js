'use strict';
(function(G, D) {
  G.newProfile = () => ({
    saveVersion: D.config.version,
    active: 0,
    slots: [null, null, null],
    settings: {
      master: 40,
      music: 25,
      sfx: 60,
      ambience: 45,
      scale: 100,
      text: 100,
      damage: true,
      combatLog: true,
      notifications: true,
      atmosphere: true,
      reduced: false
    },
    savedAt: 0
  });
  G.state = G.newProfile();
  G.newCharacter = (name, className, mode, appearance) => {
    G.assert(name.trim().length >= 2 && name.trim().length <= 24, 'Name must contain 2–24 characters.');
    G.assert(D.classes.includes(className) && D.modes.includes(mode), 'Invalid class or mode.');
    const c = {
      id: G.uid(),
      name: name.trim(),
      class: className,
      mode,
      appearance,
      level: 1,
      xp: 0,
      hp: 100,
      coins: D.config.startingBronze,
      ascendantCoins: 0,
      ascendantRewards: {},
      companion: null,
      regalia: {owned:[],outfit:null,aura:null},
      specialPets: [],
      petStable: {},
      quests: null,
      questCompletions: 0,
      seed: G.seed(),
      location: 0,
      inventory: [],
      equipment: Object.fromEntries(D.slots.map(s => [s, null])),
      capacity: D.config.inventoryStart,
      pending: [],
      skills: {},
      tools: {},
      perks: {},
      achievements: {},
      title: '',
      stats: {
        advance: 0,
        regular: 0,
        elite: 0,
        boss: 0,
        dungeons: 0,
        bars: 0,
        cooked: 0,
        facets: 0,
        enhancements: 0,
        maxEnhance: 0,
        socketed: 0,
        listing: 0,
        sale: 0,
        purchase: 0,
        damage: 0,
        deaths: 0,
        bossKills: {},
        bossDrops: {},
        ascensions: [],
        gemCreated: []
      },
      food: null,
      eat: 0,
      eatUnlocks: [0, .25],
      foodReady: 0,
      peaceFoodReady: 0,
      facetFails: {},
      offline: null,
      skillPreferences: {primary: 'Fishing', secondary: 'Mining'},
      lastSeen: Date.now(),
      listings: [],
      encounter: null,
      activity: null,
      combat: null,
      dungeon: null,
      tutorial: 0,
      guide: null,
      afk: { interval: 12000, chance: .75, minHp: .25, normals: true, dungeons: false, elites: false, gather: false, chests: true },
      restReadyAt: 0,
      debugUsed: false
    };
    D.skills.forEach((s, i) => {
      c.skills[s] = {
        level: 1,
        xp: 0
      };
      c.tools[s] = G.systems.items.createTool(s, 0, true);
    });
    c.equipment.Weapon = G.systems.items.create(0, D.classes.indexOf(className), 0);
    return c;
  };
  G.systems.xp = {
    add(track, amount, {silent = false} = {}) {
      const previous = track.level;
      track.xp += Math.max(0, amount);
      let count = 0;
      while (track.level < D.config.levelCap && track.xp >= D.xpNext(track.level)) {
        track.xp -= D.xpNext(track.level);
        track.level++;
        count++;
      }
      if (track.level === D.config.levelCap) track.xp = 0;
      if (count && !silent) {
        const c = G.state.slots.find(c => c && (c === track || Object.values(c.skills).includes(track)));
        if (c) G.emit('levelup', {
          characterId:c.id, characterName:c.name, kind:c === track ? 'character' : 'skill',
          skill:c === track ? null : D.skills.find(skill => c.skills[skill] === track),
          from:previous, to:track.level
        });
      }
      return count;
    }
  };
})(RPG, RPG.data);
