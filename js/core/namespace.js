'use strict';
window.RPG = {
  data: {},
  systems: {},
  ui: {},
  runtime: {
    page: 'World',
    tab: '',
    log: [],
    recent: [],
    estimate: null
  }
};
(function(G) {
  G.clone = v => JSON.parse(JSON.stringify(v));
  G.clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  G.assert = (ok, msg) => {
    if (!ok) throw Error(msg);
  };
  G.uid = () => {
    const a = new Uint32Array(2);
    crypto.getRandomValues(a);
    return [...a].map(v => v.toString(36)).join('');
  };
  G.seed = () => Math.floor(Math.random() * 4294967295) || 1;
  G.random = holder => {
    let x = holder.seed | 0;
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    holder.seed = x >>> 0;
    return holder.seed / 4294967296;
  };
  G.int = (rng, min, max) => min + Math.floor(rng() * (max - min + 1));
  G.pick = (rng, list) => list[Math.floor(rng() * list.length)];
  G.weighted = (rng, weights) => {
    let n = rng() * weights.reduce((a, b) => a + b, 0);
    for (let i = 0; i < weights.length; i++) {
      n -= weights[i];
      if (n < 0) return i;
    }
    return weights.length - 1;
  };
  G.rng = () => G.random(G.character());
  G.character = () => G.state.slots[G.state.active];
  G.emit = (name, detail) => window.dispatchEvent(new CustomEvent('rpg:' + name, {
    detail
  }));
  G.notify = (message, type = 'info') => G.emit('notice', {
    message,
    type
  });
  G.escape = s => String(s ?? '').replace(/[&<>"']/g, c => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  } [c]));
  G.number = (v, d = 0) => Number(v || 0).toLocaleString(undefined, {
    maximumFractionDigits: d
  });
  G.percent = (v, d = 1) => G.number(v * 100, d) + '%';
  G.money = v => {
    v = Math.floor(v);
    return Math.floor(v / 10000) + 'g ' + Math.floor(v % 10000 / 100) + 's ' + v % 100 + 'b';
  };
  G.commit = () => {
    G.systems.achievements?.check();
    G.save?.write();
    G.emit('change');
  };
  G.ensureIdle = () => {
    const c = G.character();
    G.assert(c, 'Choose a character.');
    G.assert(!c.combat, 'This action is unavailable during combat.');
    G.assert(!c.activity, 'Finish or stop the current activity first.');
  };
  G.ensureProgress = () => {
    G.ensureIdle();
    G.assert(!G.character().pending.length, 'Resolve Pending Loot in Inventory first.');
  };
})(RPG);
