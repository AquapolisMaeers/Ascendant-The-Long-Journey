'use strict';
(function(G,D,S,U) {
  const destinations={
    Guild:{eyebrow:'UNDER ONE BANNER',title:'Guild',description:'A home for the people you journey with.',icon:'Guild',heading:'Your guild hall awaits',copy:'Guilds are coming to Ascendant. Creation, membership and the rest of guild life will be defined in a future update.',details:[['Guild','Coming soon'],['Membership','Not available yet']],action:'Create a guild'},
    Colosseum:{eyebrow:'ENTER THE ARENA',title:'Colosseum',description:'Player-versus-player combat, matched by rating.',icon:'Colosseum',heading:'The arena is being prepared',copy:'The Colosseum will bring PvP matchmaking based on MMR. Match rules, rating and rewards will be defined before the arena opens.',details:[['Matchmaking','Coming soon'],['MMR','Not rated']],action:'Find a match'}
  };
  for(const [page,entry] of Object.entries(destinations))U.screens[page]=()=>
    U.heading(entry.eyebrow,entry.title,entry.description,'<span class="badge">COMING SOON</span>')+
    '<section class="panel community-hall '+page.toLowerCase()+'-hall"><div class="community-emblem" aria-hidden="true">'+U.icon(entry.icon)+'</div><div class="community-copy"><h2>'+entry.heading+'</h2><p class="notes spacer">'+entry.copy+'</p><dl class="community-status">'+entry.details.map(([label,value])=>'<div><dt>'+label+'</dt><dd>'+value+'</dd></div>').join('')+'</dl>'+U.btn(entry.action,'','disabled aria-disabled="true"','gold-btn')+'</div></section>';
})(RPG,RPG.data,RPG.systems,RPG.ui);
