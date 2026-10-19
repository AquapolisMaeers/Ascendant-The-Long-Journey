'use strict';
(function(D) {
  D.tutorial = {
    bonusBronze: 50,
    prefixDamage: 2,
    steps: [{
      id: 'perk',
      title: 'Choose your first perk',
      text: 'Open Character → Perks and choose your free Level 1 perk. Read all three choices: each shapes your build. A Tome of Renewal can refund your choices later.'
    }, {
      id: 'Fishing',
      title: 'Fishing',
      text: 'Advance to a guaranteed Minnow spot. Fish its five charges to collect your first food ingredients.'
    }, {
      id: 'Mining',
      title: 'Mining',
      text: 'Advance to a guaranteed Copper Ore node. Mine all five charges; three ore makes one Copper Bar, leaving two ore for later.'
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
      text: 'Choose a primary and secondary gathering skill. Primary gets 25% per Advance, secondary gets 12.5%, and the other three share the remaining 12.5% equally. This changes which nodes you find, not their rewards. Tutorial nodes are guaranteed for the starter lessons.'
    }, {
      id: 'offline', title: 'AFK skilling: progress while away',
      text: 'Choose an AFK skilling discipline under Skills → Offline training. When you return, it earns up to eight hours of XP only: gathering 25%, Smithing/Cooking 12.5%, Faceting 1.875% of base active XP. Knowledge applies. No ingredients are spent and no items or coins are produced. Choose a skill now or leave it at None.'
    }, {
      id: 'afk', title: 'AFK training: travel with a plan',
      text: 'AFK advancing is active training: keep the game visible while it travels, gathers and optionally fights. Set encounter filters, a victory estimate and a low-health stopping point before starting. Gathering only: enable gathering and turn every other filter off. Combat remains risky; an estimate is not a promise. The first 15 active minutes are free, then each started minute costs the regional rate shown in the AFK panel. Later regions cost more. Travel fees also scale with destination and distance; review the fare before confirming. Full inventory stops the run. Offline combat never runs.'
    }, {
      id: 'recovery', title: 'A fire, a meal and a safe bed',
      text: 'Health is your travel budget. The Wayside campfire restores all health for free once every 30 minutes. Save it for a meaningful recovery. The inn restores 25%, 50% or all missing health with no cooldown, charging your level times HP restored, rounded up in Bronze. Food heals on the road; Auto-Eat helps in combat. Rest outside combat and dungeons; use the labeled wallet to plan what you can afford.'
    }, {
      id: 'prefixes', title: 'Make your tools work for you',
      text: 'Tool prefixes improve different parts of a skill. Efficiency speeds active work; Yield can add an item; Fortune can find next-tier resources; Knowledge increases XP; Conservation can save charges or ingredients. Find exact per-rank effects in Skills and every tool detail. Ascension develops tool prefixes. Choose upgrades to support the kind of progress you want.'
    }, {
      id: 'ready', title: 'Your journey begins here',
      text: 'You have prepared food, made a bar, cut a gem, improved your weapon and equipped armour. You also know how to guide gathering odds, train away from the keyboard and recover. Complete training to unlock quests, Farming and the open road. Advance to discover Farming crop patches, then harvest Flax Fibre with your Pruning Shears at Farming level 1. Your health will be fully restored.'
    }]
  };
  const routes={
    perk:{page:'Character',tab:'Perks',steps:['Select the Perks tab inside Character.','Read the three Level 1 choices, choose one and confirm it. A health perk increases your current health as well as your maximum.']},
    Fishing:{page:'World',steps:['Press Advance and wait for the journey to finish.','At the Minnow spot, press Fish. Empty all five charges to gather ingredients for healing food.']},
    Mining:{page:'World',steps:['Press Advance to discover the Copper Ore node.','Press Mine and collect all five charges. Three ore becomes one bar for your first weapon upgrade; keep the other two.']},
    Woodcutting:{page:'World',steps:['Press Advance to find Pine Logs.','Press Chop and empty all five charges. Logs are part of the weapon Enhancement recipe.']},
    Hunting:{page:'World',steps:['Press Advance to find the Rabbit Pelt encounter.','Press Hunt and empty all five charges. Hides will later supply armor recipes.']},
    'cook:0':{page:'Crafting',tab:'Cooking',steps:['Select Cooking, then choose the Level 1 Minnow fish species.','On Cooked Minnow, select 5, then press Cook. Selecting a number only sets the quantity.','Cooking turns your raw fish into healing food for your first battle.']},
    'bar:0':{page:'Crafting',tab:'Smithing',steps:['Select Smithing, choose the Level 1 Copper tier, then select Materials in Recipe category.','On Copper Bar, select 1, then press Smith. The bar is an ingredient for weapon Enhancement.']},
    facet:{page:'Crafting',tab:'Faceting',steps:['Select Faceting. In Gem type, choose the gem matching your class: Attack for Warrior, Ranged for Archer, Magic for Mage.','On Gem I, select 1, then press Cut. The guide supplied one matching uncut gem so you can learn how socket gems begin.']},
    enhance:{page:'Character',tab:'Equipment',steps:['Select Equipment and click your equipped weapon.','In its item window, press Enhance. Review the materials, cost and success chance, then confirm. This lesson improves your weapon before combat.']},
    fight:{page:'World',steps:['Your cooked food has been assigned in Provisions. Tap Eat when hurt. Buy Auto-Eat 25% from Shop at level 10.','Press Advance. Read the Level 1 creature preview, then press Fight. Your new prefix and food help prepare you for this encounter.']},
    equip:{page:'Inventory',tab:'Equipment',steps:['Select Equipment in Inventory and click the Common Worn Plate from the tutorial battle.','Press Equip in its item window. Armor reduces incoming damage on your next journey.']},
    preferences:{page:'Skills',steps:['Find Your gathering path near the top of Skills.','Choose primary and secondary skills from the five gathering skills. The other three share the remaining gathering chance equally.']},
    offline:{page:'Skills',steps:['Find Offline training beside Your gathering path near the top of Skills. On a phone, scroll below the preference panel.','Use AFK skilling to choose the skill that earns XP while away. You can leave it at None. No materials or coins are produced or consumed.']},
    afk:{page:'Settings',steps:['Find the AFK advancing panel. Every Advance takes 8 seconds.','Type your minimum estimated win chance and low-health stopping point as percentages from 0 to 100. Set the encounter filters before starting a real session.','AFK advancing needs the game visible and can spend coins after the first 15 minutes. Review the regional fee.']},
    recovery:{page:'World',steps:['Find the campfire beside the encounter on desktop, or near the top of Journey on a phone. On phones, open Supplies for the inn and food.','The campfire is free once every 30 minutes. The inn has a displayed price and no cooldown. Food is managed in Provisions.']},
    prefixes:{page:'Skills',steps:['Open Tool prefixes: what each one does.','Read how Efficiency, Yield, Fortune, Knowledge and Conservation support different kinds of progress. You can also inspect equipped tools here.']},
    ready:{page:'World',steps:['Review your health, food and wallet.','Open this final lesson and choose Complete tutorial when you are ready for the open road.']}
  };
  D.tutorial.steps.forEach(step=>step.route=routes[step.id]);
  D.tutorial.steps.find(s=>s.id==='preferences').text='Choose any of the five gathering skills as primary and secondary. Primary gets 25% per Advance; secondary gets 12.5%; each of the other three gets about 4.17%. Farming crop patches appear through Advance and use Pruning Shears after the tutorial.';
})(RPG.data);
