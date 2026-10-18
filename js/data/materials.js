'use strict';
(function(D) {
  D.resources.fiber=['Flax Fibre','Nettle Fibre','Hemp Fibre','Moonflax Fibre','Silkweed Fibre','Sunflax Fibre','Runesilk Fibre','Ashsilk Fibre','Wyrmsilk Fibre','Starsilk Fibre','Eldersilk Fibre','Ancient Silk Fibre'];
  D.resources.leather=['Rabbit Leather','Fox Leather','Boar Leather','Deer Leather','Bear Leather','Direwolf Leather','Runestag Leather','Obsidian Leather','Wyrmhide Leather','Starhorn Leather','Elderbeast Leather','Ancient Beast Leather'];
  D.resources.cloth=['Linen','Nettleweave','Hempcloth','Moonweave','Silkweed Cloth','Sunweave','Runesilk','Ashsilk','Wyrmsilk','Starsilk','Eldersilk','Ancient Silk'];
  for(const kind of ['fiber','leather','cloth']) D.resources[kind].forEach((name,tier)=>{
    const id=kind+':'+tier;
    D.catalog[id]={id,name,kind,tier,level:D.tiers[tier],category:'Materials',rarity:0};
  });
  D.armorTierName=(className,tier)=>className==='Archer'?D.resources.leather[tier]:className==='Mage'?D.resources.cloth[tier]:D.tierNames[tier];
  D.armorCost=(slot,className)=>{
    const base=D.equipmentRecipes[slot];
    if(!D.armorSlots.includes(slot)||!['Archer','Mage'].includes(className))return {...base};
    return className==='Archer'?{leather:base.bar,logs:Math.ceil(base.bar/3)}:{cloth:base.bar,fiber:Math.ceil(base.bar/2)};
  };
  D.materialWork=(kind,tier)=>kind==='bar'?5+D.coal[tier]:kind==='leather'?4:kind==='cloth'?3:1;
  D.secondaryCost=(tier,piece)=>Object.fromEntries(Object.entries(piece===10?{bar:7,logs:10,hide:6}:piece===11?{bar:6,leather:3}:{bar:2,cloth:6,logs:5}).map(([kind,n])=>[kind+':'+tier,n]));
})(RPG.data);
