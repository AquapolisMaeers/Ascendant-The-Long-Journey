'use strict';
(function(D) {
  const node = (name, effects, description = '') => ({name, effects, description});
  // Six connected nodes per path: 46 points to master, 99 earned by level 100.
  D.talentRanks = [5, 10, 10, 10, 10, 1];
  D.talentLevels = [2, 10, 20, 30, 45, 60];
  D.talents = {
    Warrior: [
      {id:'berserker', name:'Berserker', role:'Trade safety for damage as your health falls.', nodes:[
        node('Heavy blows',{damagePct:.012}), node('Rising fury',{fury:.03},'Up to +3% damage per rank as health falls.'),
        node('Cruel edge',{critDamage:.012}), node('Reckless tempo',{speed:.008}), node('Blood appetite',{lifeSteal:.005},'Always gain 0.5% lifesteal per rank, up to 5% at ten ranks; subject to the lifesteal cap.'),
        node('Unchained',{unchained:true},'Fury is doubled below 40% health.') ]},
      {id:'guardian', name:'Guardian', role:'Absorb punishment and answer with powerful counters.', nodes:[
        node('Stalwart',{healthPct:.018}), node('Shield discipline',{guard:.025},'Every fourth incoming hit deals 2.5% less damage per rank.'),
        node('Iron wall',{defencePct:.018}), node('Measured defence',{reduction:.004}), node('Hold the line',{resistance:.008}),
        node('Retribution',{retribution:true},'Each guarded hit empowers your next attack by 75%.') ]},
      {id:'reaver', name:'Reaver', role:'Overwhelm durable enemies with relentless strikes and reliable stolen health.', nodes:[
        node('Leeching cuts',{reavingStrike:.04,reavingHeal:.003},'Every third successful attack deals 4% extra damage and restores 0.3% maximum health per rank.'), node('Blood siphon',{lifeSteal:.0025,siphon:.0025},'Always gain 0.25% lifesteal per rank, doubled below 60% health; subject to the lifesteal cap.'),
        node('Enduring flesh',{healthPct:.02}), node('Rending strikes',{penetration:.012}), node('Ravenous rhythm',{double:.012}),
        node('Feast',{feast:true},'Every fourth successful attack restores 4% maximum health and empowers your next successful attack by 30%.') ]}
    ],
    Mage: [
      {id:'pyromancer', name:'Pyromancer', role:'Build heat through successive hits and unleash a firestorm.', nodes:[
        node('Kindling',{damagePct:.012}), node('Gathering heat',{ignite:.006},'Each previous hit adds 0.6% damage per rank, up to five stacks.'),
        node('Scorching focus',{crit:.006}), node('Flashfire',{speed:.008}), node('Ashen breach',{penetration:.008}),
        node('Firestorm',{firestorm:true},'Every fifth successful attack deals 50% extra damage.') ]},
      {id:'frostbinder', name:'Frostbinder', role:'Slow incoming attacks and survive behind protective wards.', nodes:[
        node('Glacial ward',{healthPct:.018}), node('Winter grasp',{chill:.01},'Enemy attack intervals are 1% longer per rank.'),
        node('Ice armour',{defencePct:.018}), node('Frozen barrier',{reduction:.004}), node('Cold precision',{critDamage:.012}),
        node('Deep freeze',{deepFreeze:true},'Winter grasp is doubled; deal 20% extra damage to enemies below half health.') ]},
      {id:'arcanist', name:'Arcanist', role:'Pierce defences and release a burst every fourth hit.', nodes:[
        node('Arcane studies',{damagePct:.012}), node('Resonance',{arcaneBurst:.03},'Every fourth successful attack deals 3% extra damage per rank.'),
        node('Spell breach',{penetration:.01}), node('Accelerated casting',{speed:.008}), node('Echoes',{double:.008}),
        node('Arcane torrent',{torrent:true},'Resonance triggers every third successful attack instead of every fourth.') ]}
    ],
    Archer: [
      {id:'marksman', name:'Marksman', role:'Land deliberate, devastating critical shots.', nodes:[
        node('Steady aim',{crit:.008}), node('Aimed shot',{aimedShot:.035},'Every third successful attack deals 3.5% extra damage per rank.'),
        node('Keen eye',{critDamage:.018}), node('Armour piercing',{penetration:.008}), node('Patient hunter',{damagePct:.01}),
        node('Perfect shot',{perfectShot:true},'Every third successful attack is a guaranteed critical strike.') ]},
      {id:'skirmisher', name:'Skirmisher', role:'Win through rapid attacks, evasion and follow-up volleys.', nodes:[
        node('Quick footing',{speed:.012}), node('Volley training',{double:.012}),
        node('Evasive steps',{dodge:.008}), node('Running shots',{damagePct:.01}), node('Fleet hunter',{speed:.008}),
        node('Endless volley',{endlessVolley:true},'Follow-up double attacks deal 40% extra damage.') ]},
      {id:'venom', name:'Venom Hunter', role:'Stack venom with repeated hits to overwhelm durable enemies.', nodes:[
        node('Toxic arrows',{damagePct:.01}), node('Venom coating',{venom:.008},'Each previous hit adds 0.8% damage per rank, up to five venom stacks.'),
        node('Patient stalker',{dodge:.008}), node('Corrosive venom',{penetration:.008}), node('Predator rhythm',{speed:.008}),
        node('Deathblossom',{deathblossom:true},'Venom can stack ten times instead of five.') ]}
    ]
  };
  D.armorSlots = ['Helmet','Plate','Greaves','Gloves','Boots'];
  D.armorWeights = [1, 1, 1];
  D.armorNames = {
    Warrior:['Helm','Plate','Greaves','Gauntlets','Sabatons'],
    Archer:['Hood','Jerkin','Leggings','Bracers','Trailboots'],
    Mage:['Circlet','Robes','Legwraps','Spellgloves','Slippers']
  };
})(RPG.data);
