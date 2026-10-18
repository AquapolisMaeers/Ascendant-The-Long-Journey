'use strict';
(function(D) {
  const version='painted-20261017';
  const register=(key,file,index,columns,rows,name)=>D.itemIllustrations[key]={file:'assets/art/painted/'+file+'.png',index,columns,rows,version,name};
  for(const [className,prefix] of [['Mage','mage'],['Archer','ranger']])for(const [slot,part] of ['head','body','legs','hands','feet'].entries())for(let tier=0;tier<17;tier++) {
    const piece=slot+3,name=(tier<12?D.armorTierName(className,tier):D.dungeons[tier-12].prefix)+' '+D.armorNames[className][slot];
    register('class-gear:'+className+':'+tier+':'+piece,prefix+'-'+part,tier,4,5,name);
  }
  for(const kind of ['fiber','leather','cloth'])D.resources[kind].forEach((name,tier)=>register(kind+':'+tier,'material-'+kind,tier,4,3,name));
  for(let type=D.regularGemCount;type<D.gems.length;type++)for(let rank=1;rank<=5;rank++)register('gem:'+type+':'+rank,'advanced-gems',(type-D.regularGemCount)*5+rank-1,5,10,D.catalog['gem:'+type+':'+rank].name);
  // Painted gem rows have uneven spacing and an empty footer. Bound each crop
  // inside the dark gutter so neighbouring gem tips never enter an icon.
  const gemRows=[4,159,308,462,614,771,940,1110,1281,1467,1666];
  for(let type=D.regularGemCount;type<D.gems.length;type++)for(let rank=1;rank<=5;rank++) {
    const row=type-D.regularGemCount;
    D.itemIllustrations['gem:'+type+':'+rank].crop=[(rank-1+.01)/5,(gemRows[row]+1)/1774,.98/5,(gemRows[row+1]-gemRows[row]-2)/1774];
  }
  for(const kind of ['aura','mount'])D.regalia.filter(entry=>entry.kind===kind).forEach((entry,index)=>register('regalia:'+entry.id,kind==='mount'?'mounts':'auras',index,4,5,entry.name));
  for(const entry of D.regalia.filter(entry=>entry.kind==='outfit'))D.itemIllustrations['regalia:'+entry.id]={file:entry.avatar,index:0,columns:1,rows:1,version,name:entry.name};
})(RPG.data);
