'use strict';
(function(G, D, S, U) {
  U.toolPrefixHelp = () => '<details class="prefix-handbook spacer"><summary>Tool prefixes — what each one does</summary><dl>' +
    Object.entries(D.toolPrefixDescriptions).map(([name, text]) => '<dt>' + name + '</dt><dd>' + text + '</dd>').join('') + '</dl></details>';
  U.skillPreferences = (prefix = '') => {
    const c = G.character(), p = S.world.preferences(c), weights = S.world.encounterWeights(c), total = weights.reduce((a, b) => a + b, 0);
    return '<section class="panel skill-preferences spacer"><div class="panel-head"><h3>Your gathering path</h3><span class="badge">50% GATHERING</span></div>' +
      '<p class="notes">Choose what you are most likely to discover when advancing. Changing your preference is free. Primary and secondary must differ; choosing the other preference swaps them.</p><div class="grid-2 spacer">' +
      ['primary', 'secondary'].map(rank => '<label>' + (rank === 'primary' ? 'Primary preference' : 'Secondary preference') + '<select id="preference-' + prefix + rank + '" data-preference="' + rank + '">' +
        D.skills.slice(0, 4).map(skill => '<option ' + (p[rank] === skill ? 'selected' : '') + '>' + skill + '</option>').join('') + '</select></label>').join('') +
      '</div><div class="preference-odds spacer">' + D.skills.slice(0, 4).map(skill => '<span><strong>' + skill + '</strong> ' + G.percent(weights[D.encounters.types.indexOf(skill)] / total, 2) + '</span>').join('') +
      '</div><p class="notes spacer">These are chances per Advance. Other encounter odds stay the same; resource tiers and loot rolls are unchanged.</p></section>';
  };
  U.lesson = (intro = false) => {
    const step = S.tutorial.current();
    if (!step) return;
    let body = '<div class="eyebrow">TUTORIAL · LESSON ' + (G.character().guide.step + 1) + ' OF ' + D.tutorial.steps.length + '</div>';
    if (intro) body += '<h3 class="spacer">Welcome to your guided first steps</h3><p class="spacer">You are starting the tutorial. Follow the crimson training panel at the top of the screen. Each practical lesson prepares you for the next, then you will learn how to plan longer journeys. Your first four gathering nodes are guaranteed.</p>';
    body += '<p class="spacer">' + step.text + '</p>';
    if (step.id === 'preferences') body += U.skillPreferences('lesson-');
    if (step.id === 'offline') body += '<label class="spacer">Train while away<select id="lesson-offline-select"><option value="">None</option>' + D.skills.map(skill => '<option ' + (G.character().offline === skill ? 'selected' : '') + '>' + skill + '</option>').join('') + '</select></label><p class="notes spacer">This is independent of your primary and secondary encounter preferences.</p>';
    if (step.id === 'afk') body += U.afkPanel();
    if (step.id === 'recovery') body += '<div class="grid-2 spacer"><section class="panel"><h3>Campfire · free</h3><p>Full health. Once every 30 minutes.</p></section><section class="panel"><h3>Inn · paid</h3><p>Partial or full healing. No cooldown. Check the quoted price first.</p></section></div>';
    if (step.id === 'prefixes') body += U.toolPrefixHelp().replace('<details ', '<details open ');
    const reading = ['preferences', 'offline', 'afk', 'recovery', 'prefixes', 'ready'].includes(step.id);
    body += '<div class="modal-actions">' + U.btn(reading ? step.id === 'ready' ? 'Complete tutorial & set out' : 'Understood · next lesson' : 'Begin this lesson', reading ? 'tutorialAcknowledge' : 'closeModal', '', 'primary') + '</div>';
    U.modal(intro ? 'Your tutorial starts here' : step.title, body, step.id === 'afk');
  };
  const tutorial = U.tutorial;
  U.tutorial = (...args) => {
    if (!G.character()?.tutorial) { tutorial(...args); return; }
    U.modal('Your field guide', '<p>Gather resources to prepare equipment, meals and gems for the next fight. Mining supplies ore, Woodcutting supplies logs, Fishing supplies raw fish, and Hunting supplies hides. Smithing turns these into bars and equipment; Cooking makes healing food; Faceting prepares gems for sockets.</p>' +
      U.skillPreferences('guide-') + '<h3 class="spacer">Train at your own pace</h3><p class="spacer">AFK skilling in the top bar earns offline XP only for up to eight hours. Gathering earns 25% of base active XP, Smithing and Cooking 12.5%, and Faceting 1.875%. Knowledge applies; ingredients are not consumed and no items or coins are produced.</p><p class="spacer">AFK advancing runs while the game is visible. Configure encounter filters, minimum estimated victory chance and a low-health stop in Settings. For gathering only, turn on gathering and turn every other encounter filter off. Your first 15 active minutes are free; then each started minute costs 10 Bronze. Estimates cannot guarantee survival.</p>' +
      '<h3 class="spacer">Recover before taking risks</h3><p class="spacer">The campfire restores full health free once every 30 minutes. The inn offers paid healing with no cooldown, charging your level times HP restored, rounded up in Bronze. Food and Auto-Eat help you survive fights. Rest outside combat and dungeons. The wallet shows Gold, Silver and Bronze; 100 Bronze equals 1 Silver, and 100 Silver equals 1 Gold.</p>' +
      U.toolPrefixHelp() + U.btn('Return to the world', 'closeModal', '', 'primary spacer'), true);
  };
  const shell = U.shell;
  U.shell = () => {
    const html = shell();
    if (!G.character() || G.runtime.selecting || !S.tutorial.active()) return html;
    return html.replace('YOUR JOURNEY</div>', 'TUTORIAL IN PROGRESS</div>');
  };
  let previousView = null;
  window.addEventListener('rpg:rendered', () => {
    const view = [G.character()?.id, G.runtime.selecting, G.runtime.page, G.runtime.tab].join('|');
    if (view === previousView) return;
    previousView = view;
    if (G.state.settings.reduced || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const heading = document.querySelector('#content .page-heading h1');
    if (heading) {
      heading.getAnimations().forEach(animation => animation.cancel());
      heading.animate([{transform:'translateX(-8px)'},{transform:'translateX(0)'}], {duration:240,easing:'cubic-bezier(.2,.7,.2,1)'});
    }
  });
})(RPG, RPG.data, RPG.systems, RPG.ui);
