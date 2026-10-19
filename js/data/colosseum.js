'use strict';
(function(D) {
  D.colosseum={matchRange:1000,maxMatchRange:5000,matchRangeFraction:.05,matchRangeStep:100,winPoints:5,levelAdjustment:1,pointAdjustment:1,prizeNumerator:4,prizeDenominator:5,ascendantAt:100000};
  const thresholds=[0,10000,25000,40000,55000,70000,85000,100000];
  const fees=[50,250,1000,2500,10000,25000,50000,100000];
  D.leagues=D.rarity.map((rarity,index)=>({id:index,name:rarity+' League',rarity,index,minimum:thresholds[index],maximum:thresholds[index+1]??null,entry:fees[index]}));
})(RPG.data);
