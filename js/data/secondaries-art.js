'use strict';
(function(D) {
  for(let piece=10;piece<=12;piece++)for(let design=0;design<17;design++) {
    const key=(design<12?'gear:'+design:'boss:'+(design-12))+':'+piece;
    D.itemIllustrations[key]={file:'assets/art/items/secondaries.png',index:(piece-10)*18+design,columns:6,rows:9,version:'secondaries-v1',name:(design<12?D.tierNames[design]:D.dungeons[design-12].prefix)+' '+D.pieces[piece]};
  }
  // The old level-60 Spellbook is now a staff; existing item investments persist.
  D.itemIllustrations['gear:7:2']={file:'assets/art/items/secondaries.png',index:17,columns:6,rows:9,version:'secondaries-v1',name:'Obsidian Staff'};
})(RPG.data);
