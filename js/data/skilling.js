'use strict';
(function(D){
  const node=(id,name,ranks,effects,description)=>({id,name,ranks,effects,description});
  const ranks=[5,5,5,5,4,1];
  const path=(id,name,icon,role,rows)=>({id,name,icon,role,nodes:rows.map((row,index)=>({...node(id+':'+index,row[0],ranks[index],row[1],row[2]),requires:index?id+':'+(index-1):'foundation'}))});
  D.skilling={levelsPerPoint:10,
    root:node('foundation','Fieldwork',4,{allKnowledge:.01},'+1% skill XP per rank. Applies to active and offline skill training.'),
    paths:[
      path('harvesting','Harvesting','Farming','Gather more, work faster and make resource nodes last.',[
        ['Harvesting rhythm',{gatherEfficiency:.02},'+2% gathering speed per rank across all five gathering skills.'],
        ['Full baskets',{gatherYield:.015},'+1.5 percentage points of double-harvest chance per rank. Farming doubles its normal two-fibre harvest.'],
        ['Field notes',{gatherKnowledge:.02},'+2% gathering XP per rank, including offline gathering training.'],
        ['Hidden abundance',{gatherFortune:.01},'+1 percentage point of next-tier gathering bonus chance per rank, within the current region\'s resource limits.'],
        ['Careful hands',{gatherConservation:.025},'+2.5 percentage points per rank to preserve a resource-node charge after gathering.'],
        ['Bountiful season',{gatherYield:.075,gatherEfficiency:.05},'+7.5 percentage points of double-harvest chance and +5% gathering speed.']
      ]),
      path('crafting','Crafting','Smithing','Produce more, conserve ingredients and steady gem fusion.',[
        ['Workshop cadence',{craftEfficiency:.02},'+2% crafting speed per rank for Smithing, Cooking and Faceting.'],
        ['Material sense',{craftConservation:.015},'+1.5 percentage points per rank to conserve each crafting ingredient. Failed fusion still breaks exactly one gem.'],
        ['Production craft',{craftYield:.01},'+1 percentage point of double-output chance per rank, including crafted gear and gems.'],
        ['Artisan notes',{craftKnowledge:.02},'+2% crafting XP per rank, including offline crafting training.'],
        ['Steady facets',{fusionChance:.01},'+1 percentage point of successful gem-fusion chance per rank, capped at 100%.'],
        ['Master artisan',{craftYield:.05,craftConservation:.025},'+5 percentage points of double-output chance and +2.5 percentage points of ingredient conservation.']
      ]),
      path('mastery','Mastery','Skills','Develop every discipline and improve patient offline study.',[
        ['Practised motions',{allEfficiency:.01},'+1% gathering and crafting speed per rank.'],
        ['Patient study',{allKnowledge:.01},'+1% XP in all eight skills per rank, including offline training.'],
        ['Nature\'s gifts',{gatherFortune:.005},'+0.5 percentage points of next-tier gathering bonus chance per rank, within the current region\'s resource limits.'],
        ['Resourceful craft',{craftConservation:.005},'+0.5 percentage points of ingredient conservation per rank. Failed fusion still breaks exactly one gem.'],
        ['Deep focus',{offlineKnowledge:.025},'+2.5% offline skill XP per rank. The eight-hour cap and XP-only training stay in place.'],
        ['Master of trades',{allEfficiency:.05,allKnowledge:.05},'+5% gathering and crafting speed, and +5% XP in all eight skills.']
      ])
    ]
  };
})(RPG.data);
