'use strict';
(function(G, D, S, U) {
  const tiles = { Mining: 10, Woodcutting: 11, Fishing: 12, Hunting: 13, Smithing: 14, Cooking: 15, Faceting: 16,
    Weapon: 0, Warrior: 0, Archer: 1, Mage: 2, Helmet: 3, Plate: 4, Greaves: 5, Gloves: 6, Boots: 7,
    Necklace: 8, Ring: 9, food: 22, gem: 24, Inventory: 35 };
  // The painted rows are not perfectly uniform. Sample inside each object row,
  // especially above the extractor/potion row beneath the gems.
  U.art = index => {
    const size = [204, 204, 204, 192, 192, 204][Math.floor(index / 6)], atlas = 1254, rowCenters = [106, 316, 520, 720, 918, 1120];
    const x = (index % 6 + .5) * atlas / 6 - size / 2;
    const y = rowCenters[Math.floor(index / 6)] - size / 2;
    return '<span class="item-art" aria-hidden="true" style="background-size:' + (atlas / size * 100) + '% ' + (atlas / size * 100) + '%;background-position:' + (x / (atlas - size) * 100) + '% ' + (y / (atlas - size) * 100) + '%"></span>';
  };
  U.paint = key => {
    const art = D.itemIllustrations[key];
    G.assert(art, 'Missing artwork for ' + key + '.');
    if(art.standalone)return '<span class="item-art standalone-art" aria-hidden="true" data-art-key="'+U.e(key)+'"><img src="'+art.file+'?v='+art.version+'" alt="" decoding="async"></span>';
    if(art.frame) {
      const [x,y,w,h]=art.frame,[width,height]=art.size,aspect=w/h;
      const fitWidth=aspect>=1?90:90*aspect,fitHeight=aspect>=1?90/aspect:90;
      const clip=art.clip?';clip-path:polygon('+art.clip.map(([px,py])=>px+'% '+py+'%').join(',')+')':'';
      // A separate viewport contains exactly one measured sprite. Fit that
      // viewport into the icon while preserving the painting's proportions.
      return '<span class="item-art isolated-art" aria-hidden="true" data-art-key="'+U.e(key)+'"><span class="sprite-paint" style="--sprite-width:'+fitWidth+'%;--sprite-height:'+fitHeight+'%;--sprite-aspect:'+aspect+';background-image:url('+art.file+'?v='+art.version+');background-size:'+(100*width/w)+'% '+(100*height/h)+'%;background-position:'+(x/(width-w)*100)+'% '+(y/(height-h)*100)+'%'+clip+'"></span></span>';
    }
    // Sample inside a single cell, inset by 1% on all four sides.
    const [x, y, w, h] = art.crop || [(art.index % art.columns + .01) / art.columns,
      (Math.floor(art.index / art.columns) + .01) / art.rows, .98 / art.columns, .98 / art.rows];
    return '<span class="item-art" aria-hidden="true" data-art-key="' + U.e(key) +
      '" style="background-image:url(' + art.file + '?v=' + art.version + ');background-size:' +
      (100 / w) + '% ' + (100 / h) + '%;background-position:' +
      (x / (1 - w) * 100) + '% ' + (y / (1 - h) * 100) + '%"></span>';
  };
  U.itemArtKey = i => i.kind === 'gear' ? (i.boss == null ? 'gear:' + i.tier : 'boss:' + i.boss) + ':' + i.piece :
    i.kind === 'tool' ? 'tool:' + i.skill : i.key;
  U.itemArt = i => U.paint(U.itemArtKey(i));

  U.portraitArt = index => '<span class="icon portrait-art" aria-hidden="true" style="background-position:' + (index % 4 * 100 / 3) + '% ' + (Math.floor(index / 4) * 100 / 3) + '%"></span>';
  U.creaturePortrait = (name,type='regular') => {
    const entry=D.creatureArt[name],kind=entry?.kind||'humanoid',seed=entry?.index||1,
      palettes=[['#6f8b68','#c1a06d','#e9c88b'],['#587b91','#9d7460','#dfbd8d'],['#93734f','#476d56','#e5c679'],['#7f687e','#576d87','#d8b27a'],['#94745e','#737b50','#e7c99b'],['#596d78','#a35f48','#e4bc75'],['#806557','#617d78','#e6cb99'],['#68708d','#a17e4f','#e3c18a']],
      palette=palettes[(seed*7)%palettes.length],[body,trim,light]=palette,mark=Array.from({length:6},(_,bit)=>((seed>>bit)&1)?'<circle cx="'+(51+bit%3*6)+'" cy="'+(82+Math.floor(bit/3)*6)+'" r="1.7" fill="'+light+'"/>':'<path d="M'+(49+bit%3*6)+' '+(82+Math.floor(bit/3)*6)+'h4" stroke="'+light+'" stroke-width="1"/>').join(''),
      elite=entry?.rank==='elite',id=entry?.id||'unknown-creature',accent=elite?'#f0d384':trim;
    let figure='';
    if(kind==='arachnid')figure='<g fill="none" stroke="'+trim+'" stroke-width="5" stroke-linecap="round"><path d="M41 59Q20 49 12 33M38 66Q17 65 9 54M42 73Q22 81 15 96M78 59Q99 49 108 33M81 66Q102 65 111 54M77 73Q97 81 104 96"/></g><ellipse cx="60" cy="73" rx="25" ry="31" fill="'+body+'"/><circle cx="60" cy="43" r="18" fill="'+trim+'"/><path d="M48 43h8m8 0h8" stroke="'+light+'" stroke-width="5" stroke-linecap="round"/><path d="M52 51l8 5 8-5" fill="none" stroke="'+body+'" stroke-width="3"/>';
    else if(kind==='reptile'&&/viper|serpent/i.test(name))figure='<path d="M19 97q-2-29 23-38 25-8 46 3 19 10 5 25-11 12-36 4-18-6-20-19-2-10 9-15" fill="none" stroke="'+body+'" stroke-width="18" stroke-linecap="round"/><path d="M64 50q7-25 31-23l15 12-9 18-21 7Z" fill="'+trim+'" stroke="'+light+'" stroke-width="3" stroke-linejoin="round"/><circle cx="91" cy="43" r="3" fill="'+accent+'"/><path d="M104 53q12 2 9 10m-9-10q10 7 5 14" fill="none" stroke="'+light+'" stroke-width="2"/><path d="M40 77l7-7m8 13 7-7m7 9 7-7" stroke="'+trim+'" stroke-width="3"/>';
    else if(kind==='reptile')figure='<path d="M45 71Q31 34 17 25q3 35 28 62l-8 20 24-12 21 12-8-22q28-20 35-53-20 1-37 34" fill="'+trim+'" stroke="'+light+'" stroke-width="3" stroke-linejoin="round"/><path d="M29 36 45 57M91 39 77 58" stroke="'+body+'" stroke-width="3"/><path d="M23 92q-16 5-11 20 14-7 25-16 18 12 38 3 12-6 15-24l8-17q11-10 22-4l-10 12 10 5-17 7q-4 17-17 25-21 14-49 1Z" fill="'+body+'" stroke="'+trim+'" stroke-width="4" stroke-linejoin="round"/><path d="M80 57 77 42 88 50 98 37 99 55" fill="'+trim+'" stroke="'+light+'" stroke-width="3" stroke-linejoin="round"/><circle cx="103" cy="58" r="3" fill="'+accent+'"/><path d="M107 67h8m-8 0 6 4" stroke="'+light+'" stroke-width="2" stroke-linecap="round"/><path d="M44 94l-2 12m43-12 3 12" stroke="'+trim+'" stroke-width="5" stroke-linecap="round"/>';
    else if(kind==='beast'){
      const antlers=/stag|deer/i.test(name)?'<path d="M45 42 37 25 25 19m12 6 1-14m37 31 8-17 12-6m-12 6-1-14" fill="none" stroke="'+light+'" stroke-width="4" stroke-linecap="round"/>':'',
        tusks=/boar|hog/i.test(name)?'<path d="M40 69q-14 3-10 18l11-8m39-10q14 3 10 18l-11-8" fill="'+light+'" stroke="'+trim+'" stroke-width="2"/>':'',
        ears=/bear/i.test(name)?'<circle cx="42" cy="38" r="10" fill="'+trim+'"/><circle cx="78" cy="38" r="10" fill="'+trim+'"/>':'<path d="M42 48 34 23 54 40m24 8 8-25-20 17" fill="'+body+'" stroke="'+trim+'" stroke-width="3"/>',
        muzzle=/bear/i.test(name)?'<ellipse cx="60" cy="75" rx="13" ry="9" fill="'+body+'"/>':/boar|hog/i.test(name)?'<ellipse cx="60" cy="75" rx="14" ry="10" fill="'+body+'" stroke="'+light+'" stroke-width="2"/><ellipse cx="60" cy="75" rx="4" ry="3" fill="'+trim+'"/>':/stag|deer/i.test(name)?'<path d="M52 68q8-5 16 0l-3 17h-10Z" fill="'+body+'"/>':'<path d="M48 69q12-8 24 0l-3 13q-9 6-18 0Z" fill="'+body+'" stroke="'+light+'" stroke-width="2"/><path d="M59 74h2" stroke="'+trim+'" stroke-width="3"/>';
      figure='<path d="M18 112Q19 81 37 75l5-25q18-20 36 0l6 25q18 8 18 37Z" fill="'+body+'" stroke="'+trim+'" stroke-width="4" stroke-linejoin="round"/>'+ears+antlers+'<path d="M43 57q17-13 34 0l-3 27q-13 17-28 0Z" fill="'+trim+'"/><path d="M48 65h4m16 0h4" stroke="'+accent+'" stroke-width="4" stroke-linecap="round"/>'+muzzle+'<path d="M53 84q7 4 14 0" fill="none" stroke="'+light+'" stroke-width="2"/>'+tusks;
    }
    else if(kind==='plant')figure='<path d="M60 112V54M59 85Q25 89 21 56q25 0 38 18M61 75q5-35 38-41-2 30-34 47M58 62Q30 49 38 22q25 10 24 31M60 55Q64 25 55 11" fill="none" stroke="'+trim+'" stroke-width="8" stroke-linecap="round"/><path d="M23 56q23 3 36 18-21 8-36-18m41-4q11-24 34-32-3 24-34 32M39 23q18 7 22 30-20-8-22-30" fill="'+body+'" stroke="'+light+'" stroke-width="2"/><circle cx="60" cy="61" r="12" fill="'+trim+'"/><circle cx="56" cy="60" r="2" fill="'+accent+'"/><circle cx="64" cy="60" r="2" fill="'+accent+'"/>;' .replace(/;$/,'');
    else if(kind==='construct')figure='<path d="M25 112V79l13-17V34l22-18 22 18v28l13 17v33Z" fill="'+body+'" stroke="'+trim+'" stroke-width="5" stroke-linejoin="round"/><path d="m39 34 21-12 21 12v26l-21 12-21-12Z" fill="'+trim+'" stroke="'+light+'" stroke-width="3"/><path d="M48 47h5m14 0h5" stroke="'+accent+'" stroke-width="5" stroke-linecap="round"/><path d="m60 51 7 9-7 7-7-7Z" fill="'+light+'"/><path d="M35 86h50" stroke="'+light+'" stroke-width="3" opacity=".8"/>';
    else if(kind==='spirit')figure='<path d="M22 112Q17 79 31 56l-4-16q7-24 33-25 26 1 33 25l-4 16q14 23 9 56l-18-11-20 12-20-12Z" fill="'+body+'" stroke="'+trim+'" stroke-width="4" stroke-linejoin="round"/><path d="M39 53q1-25 21-26 20 1 21 26l-9 24H48Z" fill="'+trim+'"/><path d="M48 54h5m14 0h5" stroke="'+accent+'" stroke-width="5" stroke-linecap="round"/><path d="M52 67q8 6 16 0" fill="none" stroke="'+light+'" stroke-width="3"/><path d="M30 90q-13 2-17-10m73 10q13 2 17-10" fill="none" stroke="'+light+'" stroke-width="3" opacity=".8"/>';
    else if(kind==='undead')figure='<path d="M20 112q2-36 19-45l1-20q1-27 20-28 19 1 20 28l1 20q17 9 19 45Z" fill="'+body+'" stroke="'+trim+'" stroke-width="4"/><path d="M39 47q0-22 21-22t21 22v18q-8 19-21 19T39 65Z" fill="'+light+'"/><path d="M46 51h8m12 0h8" stroke="'+body+'" stroke-width="7" stroke-linecap="round"/><path d="M51 67h18m-15 0v9m6-9v10m6-10v9" stroke="'+trim+'" stroke-width="3"/><path d="M35 99 51 89l9 9 9-9 16 10" fill="none" stroke="'+light+'" stroke-width="4"/>';
    else if(kind==='winged')figure='<path d="M47 54Q19 23 9 31q2 34 31 49l-12 23 31-15 31 15-12-23q29-15 31-49-10-8-38 23" fill="'+body+'" stroke="'+trim+'" stroke-width="4" stroke-linejoin="round"/><path d="M43 112V61l17-18 17 18v51Z" fill="'+trim+'" stroke="'+light+'" stroke-width="3"/><circle cx="60" cy="38" r="15" fill="'+body+'" stroke="'+light+'" stroke-width="3"/><path d="M52 39h4m8 0h4" stroke="'+accent+'" stroke-width="4" stroke-linecap="round"/><path d="M60 13v-9m-6 10 6-8 6 8" fill="none" stroke="'+light+'" stroke-width="3" stroke-linecap="round"/>';
    else if(kind==='brute')figure='<path d="M12 112Q14 78 31 69l-4-19q3-32 33-33 30 1 33 33l-4 19q17 9 19 43Z" fill="'+body+'" stroke="'+trim+'" stroke-width="5"/><path d="M39 40 30 17l22 16m29 7 9-23-22 16" fill="'+trim+'" stroke="'+light+'" stroke-width="3" stroke-linejoin="round"/><path d="M39 49q0-20 21-20t21 20v17q-8 17-21 17T39 66Z" fill="'+body+'" stroke="'+light+'" stroke-width="2"/><path d="M46 54h5m18 0h5" stroke="'+accent+'" stroke-width="5" stroke-linecap="round"/><path d="M49 70q11 6 22 0" fill="none" stroke="'+light+'" stroke-width="3"/><path d="M24 94h72" stroke="'+trim+'" stroke-width="7"/>';
    else figure='<path d="M18 112q1-32 19-40l2-18q1-24 21-24t21 24l2 18q18 8 19 40Z" fill="'+body+'" stroke="'+trim+'" stroke-width="4"/><path d="M40 53q0-22 20-22t20 22v13q-7 17-20 17T40 66Z" fill="'+light+'"/><path d="M47 53h5m16 0h5" stroke="'+body+'" stroke-width="4" stroke-linecap="round"/><path d="m49 69 11 5 11-5" fill="none" stroke="'+trim+'" stroke-width="3"/><path d="M32 89q28 14 56 0" fill="none" stroke="'+light+'" stroke-width="3"/>';
    if(/wolf|hound|mastiff|warg/i.test(name))figure+='<path d="M44 68q16-10 32 0l-7 19-9 7-9-7Z" fill="'+light+'" stroke="'+trim+'" stroke-width="2"/><path d="m56 69 4 5 4-5Z" fill="'+trim+'"/><path d="M60 74v9m-4 2 4 2 4-2" fill="none" stroke="'+trim+'" stroke-width="2"/>';
    const crest='<g>'+mark+'</g>';
    return '<svg class="icon portrait-art creature-portrait" role="img" aria-label="'+U.e(name)+'" data-creature-id="'+id+'" data-creature-mark="'+seed+'" data-creature-kind="'+kind+'" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="bg-'+id+'" x2="0" y2="1"><stop stop-color="'+body+'"/><stop offset="1" stop-color="#111722"/></linearGradient><linearGradient id="shade-'+id+'" x2="0" y2="1"><stop stop-color="#080b12" stop-opacity=".08"/><stop offset="1" stop-color="#080b12" stop-opacity=".82"/></linearGradient></defs><image href="'+U.e(entry?.scene||'assets/art/wayside.png')+'" x="0" y="0" width="120" height="120" preserveAspectRatio="xMidYMid slice"/><rect width="120" height="120" fill="url(#bg-'+id+')" opacity=".42"/><rect width="120" height="120" fill="url(#shade-'+id+')"/><path d="M0 92 20 66l15 13 22-35 22 38 14-21 27 30v29H0Z" fill="#0c1119" opacity=".48"/><path d="M7 105Q29 88 47 101t34 0 32 4v15H7Z" fill="#0e141dcc"/><path d="M10 15h18m64 0h18M10 104h14m72 0h14" stroke="'+light+'" stroke-width="2" opacity=".5"/>'+figure+crest+'<rect x="1.5" y="1.5" width="117" height="117" rx="11" fill="none" stroke="'+(elite?'#f0d384':trim)+'" stroke-width="'+(elite?'3':'2')+'" opacity=".9"/></svg>';
  };
  const icon = U.icon;
  U.icon = name => {
    if (D.classes.includes(name)) return U.portraitArt(D.classes.indexOf(name));
    if (name === 'dungeon') return U.portraitArt(15);
    if (name !== 'creature') return icon(name);
    const e = G.character()?.encounter?.enemy;
    return U.creaturePortrait(e?.name,e?.type);
  };
  const encounter = U.encounter;
  U.encounter = () => {
    let html = encounter();
    const e = G.character()?.encounter;
    if (e && !G.character().activity && !G.character().combat) {
      const kind = D.gatherResources[e.type];
      const key = e.type === 'treasure' ? 'treasure' : kind ? kind + ':' + e.tier : null;
      if (key) html = html.replace(/(<div class="encounter-emblem">)<svg[\s\S]*?<\/svg>/, '$1' + U.paint(key));
    }
    return html;
  };

  const card = U.itemCard;
  U.itemCard = (i, slot = '') => card(i, slot).replace(/<svg class="icon"[\s\S]*?<\/svg>/, U.itemArt(i));
  const item = U.item;
  U.item = id => {
    item(id);
    const i = S.items.find(id);
    if (i) {
      const modal = document.querySelector('.modal');
      modal?.classList.add('item-modal');
      modal?.querySelector('.modal-head')?.insertAdjacentHTML('afterbegin', '<div class="item-art-detail rarity-' + (i.kind === 'stack' ? D.catalog[i.key].rarity : i.rarity) + '">' + U.itemArt(i) + '</div>');
    }
  };
  const reward = U.rewardText;
  U.rewardText = r => '<span class="reward-art' + (r.kind === 'gear' || r.kind === 'tool' ? ' rarity-' + r.rarity : r.key === 'stone' ? ' rarity-7 ascendant-stone-reward' : '') + '">' + (r.coins ? U.paint('coins') : U.itemArt(r.kind ? r : {kind: 'stack', key: r.key})) + '<span>' + reward(r) + '</span></span>';
  U.afkPanel = (compact = false) => {
    const c = G.character(), a = c.afk, running = S.afk.run?.id === c.id;
    if (compact) return '<section class="panel afk-panel"><div class="panel-head"><h3>AFK advancing</h3><span class="badge">' + (running ? 'ACTIVE' : 'STOPPED') + '</span></div><div class="afk-summary"><span>' + a.interval / 1000 + 's travel</span><span>' + G.percent(a.chance, 2) + ' minimum odds</span></div><p class="notes afk-price">15 minutes free · then ' + U.price(S.afk.minuteRate(c)) + '/min</p><p id="afk-status" class="afk-status" role="status">' + U.e(S.afk.status) + '</p><div class="row">' + (running ? U.btn('Stop AFK', 'afkStop', '', 'danger') : U.btn('Start AFK', 'afkStart', c.combat || c.activity || c.pending.length || c.dungeon && (!a.dungeons || c.dungeon.interrupted) || S.tutorial.active() ? 'disabled' : '', 'gold-btn')) + U.btn('Configure', 'navigate', 'data-value="Settings"', 'small quiet') + '</div><small id="afk-timer" class="muted">' + U.afkTimer() + '</small></section>';
    const percentInput=(key,label)=>'<label>'+label+' (%)<input type="number" min="0" max="100" step="0.01" inputmode="decimal" data-afk="'+key+'" data-afk-percent="true" value="'+Number((a[key]*100).toFixed(2))+'"></label>';
    const toggle = (key, label) => '<label class="settings-row">' + label + '<input type="checkbox" data-afk="' + key + '" ' + (a[key] ? 'checked' : '') + '></label>';
    return '<section class="panel afk-panel"><div class="panel-head"><h3>AFK advancing</h3><span class="badge">' + (running ? 'ACTIVE' : 'STOPPED') + '</span></div><div class="afk-controls">' +
      '<label>Advance interval<span class="afk-fixed-interval" aria-label="Advance interval: 8 seconds">8 seconds</span></label>'+
      percentInput('chance','Minimum estimated win chance')+
      percentInput('minHp','Stop at or below this health')+'</div>'+
      toggle('normals', 'Include normal creatures') + toggle('elites', 'Include elite creatures') + toggle('dungeons', 'Include dungeons') + toggle('gather', 'Gather usable resource nodes') + toggle('chests', 'Open treasure chests') +
      '<p class="notes afk-price">First 15 minutes free. Then ' + U.price(S.afk.minuteRate(c)) + ' per started minute in ' + U.e(D.locations[c.location].name) + '. Later regions cost more. Stops if you cannot pay.</p>' +
      '<p class="notes">Keep the game visible. Pauses in hidden tabs; stops on low health, defeat or full inventory. Include dungeons automates all five rooms, including sanctuary rewards and the boss, even when normal and elite filters are off. You can start or resume between rooms. Every fight uses fresh win odds; a room below your minimum makes AFK leave the dungeon. Estimates cannot guarantee survival. Eating and campfire rest keep AFK running.</p>' +
      '<p id="afk-status" class="afk-status" role="status">' + U.e(S.afk.status) + '</p><div class="row">' +
      (running ? U.btn('Stop AFK advancing', 'afkStop', '', 'danger wide') : U.btn('Start AFK advancing', 'afkStart', c.combat || c.activity || c.pending.length || c.dungeon && (!a.dungeons || c.dungeon.interrupted) || S.tutorial.active() ? 'disabled' : '', 'gold-btn wide')) +
      '</div><small id="afk-timer" class="muted">' + U.afkTimer() + '</small></section>';
  };
  U.afkTimer = () => {
    const run = S.afk.run, seconds = Math.floor((run?.elapsed || 0) / 1000);
    const elapsed = String(Math.floor(seconds / 60)).padStart(2, '0') + ':' + String(seconds % 60).padStart(2, '0');
    return elapsed + ' elapsed' + (run ? ' · ' + run.fights + ' fights · ' + run.skipped + ' skipped · ' + run.spent + ' Bronze spent' : '');
  };
  const world = U.screens.World;
  U.screens.World = () => world().replace('<aside class="world-side">', '<aside class="world-side">' + U.afkPanel(true));
  const settings = U.screens.Settings;
  U.audioSamples = () => '<details class="audio-samples spacer"><summary>Activity sound samples</summary><label class="spacer">Preview an activity<select id="audio-scene-preview">' + ['Mining','Fishing','Woodcutting','Hunting','Smithing','Cooking','Faceting','Farming','Travel','Combat','Dungeon'].map(n => '<option value="' + n.toLowerCase() + '">' + n + '</option>').join('') + '</select></label><div class="row spacer">' + U.btn('Play 6-second sample', 'audioPreview') + U.btn('Stop sample', 'audioPreviewStop', '', 'quiet') + '</div></details>';
  U.screens.Settings = () => settings().replace(/<\/div><\/div>$/, '</div>' + U.afkPanel() + '</div>');
  const shell = U.shell;
  U.shell = () => {
    const html = shell(), c = G.character();
    if (!c) return html;
    const unspent = D.perkLevels.filter(level => c.level >= level && c.perks[level] === undefined);
    return html.replace('<main class="content" id="content">', '<main class="content" id="content">' +
      (unspent.length && !S.tutorial.active() ? '<div class="perk-reminder"><span><strong>' + unspent.length + ' perk choice' + (unspent.length === 1 ? '' : 's') + ' available</strong> · Shape your build before the next battle.</span>' + U.btn('Choose perks', 'openPerks', '', 'small gold-btn') + '</div>' : ''));
  };
  const live = U.live;
  U.live = () => {
    live();
    const status = document.getElementById('afk-status'), timer = document.getElementById('afk-timer'), run = S.afk.run;
    if (status) status.textContent = S.afk.status;
    if (timer) timer.textContent = U.afkTimer();
  };
})(RPG, RPG.data, RPG.systems, RPG.ui);
