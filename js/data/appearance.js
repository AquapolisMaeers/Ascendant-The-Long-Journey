'use strict';
(function(D) {
  D.citizenLooks={Warrior:['Village recruit','Militia apprentice','Town watchman'],Archer:['Village forester','Woodland apprentice','Village hunter'],Mage:['Village scribe','Hedge apprentice','Village herbalist']};
  D.characterLooks = {
    Warrior: ['Vanguard', 'Shieldbearer', 'Veteran', 'Ironwarden', 'Helmguard'],
    Archer: ['Woodsman', 'Scout', 'Longbow', 'Frostwalker', 'Tracker'],
    Mage: ['Scholar', 'Spellbinder', 'Arcanist', 'Mystic', 'Sage']
  };
  D.appearanceKind = className => ({Warrior:'sentinel', Archer:'ranger', Mage:'mystic'})[className];
  D.validAppearance = a => !!a && ['sentinel','ranger','mystic'].includes(a.portrait) &&
    /^#[0-9a-f]{6}$/i.test(a.color) && (a.look === undefined || Number.isInteger(a.look) && a.look >= 0 && a.look < 5);
  // Base-game portraits are now freely customizable. Keep legacy tokens in the catalog for old saves.
  D.shop = D.shop.filter(item => item.id !== 'appearance');
})(RPG.data);
