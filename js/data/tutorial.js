'use strict';
(function(D) {
  D.tutorial = {
    bonusBronze: 50,
    prefixDamage: 2,
    steps: [{
      id: 'perk',
      title: 'Choose your first perk',
      text: 'Open Character → Perks and choose your free Level 1 perk. Read all three choices: each is permanent and shapes your build.'
    }, {
      id: 'Fishing',
      title: 'Fishing',
      text: 'Advance to a guaranteed Minnow spot. Fish its five charges to collect your first food ingredients.'
    }, {
      id: 'Mining',
      title: 'Mining',
      text: 'Advance to a guaranteed Copper Ore node. Mine all five charges; five ore makes one Copper Bar.'
    }, {
      id: 'Woodcutting',
      title: 'Woodcutting',
      text: 'Advance to guaranteed Pine Logs. Chop five charges; three logs will help Enhance your weapon.'
    }, {
      id: 'Hunting',
      title: 'Hunting',
      text: 'Advance to a guaranteed Rabbit Pelt encounter. Hunt its five charges. Hides are used in armour.'
    }, {
      id: 'cook:0',
      title: 'Cooking',
      text: 'Cook the five Minnows. Cooked Minnows restore 5 HP each and can be assigned to Auto-Eat.'
    }, {
      id: 'bar:0',
      title: 'Smithing',
      text: 'Smelt your five Copper Ore into one Copper Bar. Bars make equipment and fuel Enhancement.'
    }, {
      id: 'facet',
      title: 'Faceting',
      text: 'Your guide supplies one typed uncut gem. Cut it into Gem I for your first Faceting XP. Higher ranks fuse three identical gems.'
    }, {
      id: 'enhance',
      title: 'Your first prefix',
      text: 'Enhance your starting weapon once: one Copper Bar, three Pine Logs and 20 Bronze. This lesson adds +2 Primary Damage.'
    }, {
      id: 'fight',
      title: 'Your first battle',
      text: 'Advance to a guaranteed Level 1 regular creature. Assign your cooked food, inspect the preview, then Fight.'
    }, {
      id: 'equip',
      title: 'Claim your armour',
      text: 'The tutorial creature always drops a Common Worn Plate and 50 extra Bronze. Equip the Plate to reduce incoming damage. Next, learn how to plan your gathering, train away from the keyboard and recover between battles.'
    }, {
      id: 'preferences', title: 'Choose your gathering path',
      text: 'Choose a primary and secondary gathering skill. Gathering keeps its combined 50% Advance chance: primary 25%, secondary 12.5%, and each other skill 6.25%. This changes which nodes you find, not their rewards. Tutorial nodes are guaranteed so you can learn every skill.'
    }, {
      id: 'offline', title: 'AFK skilling: progress while away',
      text: 'Choose an AFK skilling discipline in the top bar. When you return, it earns up to eight hours of XP only: gathering 25%, Smithing/Cooking 12.5%, Faceting 1.875% of base active XP. Knowledge applies. No ingredients are spent and no items or coins are produced. Choose a skill now or leave it at None.'
    }, {
      id: 'afk', title: 'AFK training: travel with a plan',
      text: 'AFK advancing is active training: keep the game visible while it travels, gathers and optionally fights. Set encounter filters, a victory estimate and a low-health stopping point before starting. Gathering only: enable gathering and turn every other filter off. Combat remains risky; an estimate is not a promise. The first 15 active minutes are free, then each started minute costs 10 Bronze. Full inventory stops the run. Offline combat never runs.'
    }, {
      id: 'recovery', title: 'A fire, a meal and a safe bed',
      text: 'Health is your travel budget. The Wayside campfire restores all health for free once every 30 minutes. Save it for a meaningful recovery. The inn restores 25%, 50% or all missing health with no cooldown, charging your level times HP restored, rounded up in Bronze. Food heals on the road; Auto-Eat helps in combat. Rest outside combat and dungeons; use the labeled wallet to plan what you can afford.'
    }, {
      id: 'prefixes', title: 'Make your tools work for you',
      text: 'Tool prefixes improve different parts of a skill. Efficiency speeds active work; Yield can add an item; Fortune can find next-tier resources; Knowledge increases XP; Conservation can save charges or ingredients. Find exact per-rank effects in Skills and every tool detail. Ascension develops tool prefixes. Choose upgrades to support the kind of progress you want.'
    }, {
      id: 'ready', title: 'Your journey begins here',
      text: 'You have prepared food, made a bar, cut a gem, improved your weapon and equipped armour. You also know how to guide gathering odds, train away from the keyboard and recover. Complete training to unlock quests and the open road. Your health will be fully restored.'
    }]
  };
})(RPG.data);
