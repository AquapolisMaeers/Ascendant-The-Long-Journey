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
      muted: false,
      reduced: false
    },
    savedAt: 0
  });
  G.state = G.newProfile();
  G.newCharacter = (name, className, mode, appearance) => {
    G.assert(name.trim().length >= 2 && name.trim().length <= 24, 'Name must contain 2–24 characters.');
    G.assert(D.classes.includes(className) && D.modes.includes(mode), 'Invalid class or mode.');
    const createdAt=Date.now();
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
      regalia: {owned:[],outfit:null,aura:null,mount:null},
      specialPets: [],
      petStable: {},
      gemSocketRules: 1,
      quests: null,
      questCompletions: 0,
      colosseum: {points:0,victories:0,defeats:0},
      guild: null,
      community: {friends:[],ignored:[]},
      seed: G.seed(),
      location: 0,
      inventory: [],
      equipment: Object.fromEntries(D.slots.map(s => [s, null])),
      capacity: D.config.inventoryStart,
      pending: [],
      skills: {},
      tools: {},
      perks: {},
      talents: {},
      skilling: {},
      creatureBalanceVersion: 6,
      combatXpVersion: 1,
      provisionsVersion: 1,
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
      eatUnlocks: [0],
      batchEatUnlocks: [],
      foodReady: 0,
      peaceFoodReady: 0,
      facetFails: {},
      offline: null,
      skillPreferences: {mode:'preferred',primary: 'Fishing', secondary: 'Mining'},
      lastSeen: createdAt,
      playTime: {onlineMs:0,offlineMs:0,updatedAt:createdAt,startedAt:createdAt},
      listings: [],
      encounter: null,
      activity: null,
      combat: null,
      dungeon: null,
      tutorial: 0,
      guide: null,
      afk: { interval: 8000, chance: .75, minHp: .25, normals: true, dungeons: false, elites: false, gather: true, chests: true },
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
    next(track) {
      return D.classes.includes(track.class)?D.combatXpNext(track.level):D.xpNext(track.level);
    },
    add(track, amount, {silent = false} = {}) {
      const previous = track.level;
      track.xp += Math.max(0, amount);
      let count = 0;
      while (track.level < D.config.levelCap && track.xp >= this.next(track)) {
        track.xp -= this.next(track);
        track.level++;
        count++;
      }
      if (track.level === D.config.levelCap) track.xp = 0;
      if (!silent) {
        const c = G.state.slots.find(c => c && (c === track || Object.values(c.skills).includes(track)));
        if (c && count) G.emit('levelup', {
          characterId:c.id, characterName:c.name, kind:c === track ? 'character' : 'skill',
          skill:c === track ? null : D.skills.find(skill => c.skills[skill] === track),
          from:previous, to:track.level
        });
        const skill=c&&c!==track?D.skills.find(skill=>c.skills[skill]===track):null;
        if(skill&&amount>0)G.emit('skill-xp',{
          characterId:c.id,skill,amount,level:track.level,xp:track.xp,levelsGained:count
        });
      }
      return count;
    }
  };
})(RPG, RPG.data);
