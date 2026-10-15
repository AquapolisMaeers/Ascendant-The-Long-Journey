'use strict';
(function(G, D, S, U) {
  U.price = value => [[Math.floor(value / 10000),'Gold'],[Math.floor(value % 10000 / 100),'Silver'],[value % 100,'Bronze']].filter(([amount]) => amount).map(([amount,unit]) => G.number(amount) + ' ' + unit).join(' ') || '0 Bronze';
  U.locations = () => {
    const c = G.character();
    U.modal('Choose your next destination', '<p class="notes travel-intro">Travel fees depend on the destination and the number of regions crossed. Review your fare before setting out.</p><div class="stack location-options">' + D.locations.map(l => {
      const q = S.world.travelQuote(l.id), here = !q.distance, locked = c.level < l.level;
      return '<button class="slot travel-option ' + (here ? 'current' : '') + '" data-action="location" data-id="' + l.id + '" ' + (here || locked ? 'disabled' : '') + '><span class="slot-number">' + l.level + '</span><div><strong>' + U.e(l.name) + '</strong><small>Enemies ' + l.level + '\u2013' + l.max + (locked ? ' \u00b7 Requires level ' + l.level : here ? ' \u00b7 Your current location' : ' \u00b7 ' + q.distance + ' region' + (q.distance === 1 ? '' : 's') + ' away') + '</small></div><span class="travel-fare">' + (here ? 'YOU ARE HERE' : U.price(q.coins)) + '</span></button>';
    }).join('') + '</div>', true);
  };
  U.travelConfirmation = id => {
    const c = G.character(), q = S.world.travelQuote(id, c);
    if (!q.distance) { U.close(); return; }
    G.assert(c.level >= D.locations[id].level, 'Location is locked.');
    const origin = D.locations[q.from], destination = D.locations[id];
    U.confirm('Set out for ' + destination.name + '?', '<div class="travel-route"><small>FROM ' + U.e(origin.name) + '</small><h3>' + U.e(destination.name) + '</h3><p>' + U.e(destination.description) + '</p></div>' +
      '<div class="travel-quote"><span>TRAVEL FARE<strong>' + U.price(q.coins) + '</strong></span><p>' + q.distance + ' region' + (q.distance === 1 ? '' : 's') + ' \u00d7 ' + U.price(q.perStep) + ' per region</p></div>' +
      '<p class="notes spacer">Your wallet: ' + U.price(c.coins) + '. ' + (c.coins < q.coins ? '<strong class="bad">You need ' + U.price(q.coins - c.coins) + ' more to travel.</strong>' : 'The fare is charged when you confirm.') + '</p><p class="notes spacer">AFK advancing here: 15 free minutes, then ' + U.price(D.afkMinuteRates[id]) + '/started minute. Travelling stops your current AFK session.</p>', () => {
        G.assert(G.character() === c && c.location === q.from, 'Your departure point changed. Choose your destination again.');
        S.world.location(id);
        G.runtime.page = 'World'; G.runtime.tab = ''; U.render();
      });
    document.querySelector('.modal [data-action="confirm"]').disabled = c.coins < q.coins;
  };
})(RPG, RPG.data, RPG.systems, RPG.ui);
