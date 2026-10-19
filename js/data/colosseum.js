'use strict';
(function(D) {
  D.colosseum={matchRange:100,winPoints:5,levelAdjustment:2,prizeNumerator:4,prizeDenominator:5,ascendantAt:100000};
  const thresholds=[0,10000,25000,40000,55000,70000,85000,100000];
  const fees=[50,100,250,500,1000,2500,5000,10000];
  D.leagues=D.rarity.map((rarity,index)=>({id:index,name:rarity+' League',rarity,index,minimum:thresholds[index],maximum:thresholds[index+1]??null,entry:fees[index]}));
})(RPG.data);
