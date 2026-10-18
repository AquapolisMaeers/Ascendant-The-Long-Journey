'use strict';
(function(G,D,S,U) {
  const boxOdds=U.boxOdds;
  U.boxOdds=(box,filter=false)=>{
    if(box.kind!=='mount')return boxOdds(box,filter);
    const rows=S.emporium.outcomes(box),total=rows.reduce((sum,r)=>sum+r.weight,0);
    return '<div class="box-odds mount-odds" tabindex="0" aria-label="Mount rewards and per-opening odds"><table class="data-table"><thead><tr><th>Possible mount</th><th>Chance</th></tr></thead><tbody>'+rows.map(r=>'<tr><td><span class="mount-outcome">'+U.regaliaArt(r.entry)+'<span>'+U.e(r.entry.name)+'<small>'+Object.entries(r.entry.stats).map(([key,n])=>'+'+U.statValue(key,n)+' '+D.labels[key]).join(' / ')+'</small></span></span></td><td>'+G.percent(r.weight/total,4)+'</td></tr>').join('')+'</tbody></table></div>';
  };
  const general=U.screens.Shop,emporium=U.screens.Emporium;
  U.shopFrame=(html,section)=>{
    const template=document.createElement('template');template.innerHTML=html;
    const heading=template.content.querySelector('.page-heading'),switcher=document.createElement('div');
    switcher.className='shop-sections';switcher.setAttribute('role','group');switcher.setAttribute('aria-label','Choose a shop');
    switcher.innerHTML=[['general','Shop','General shop'],['emporium','Emporium','Ascendant Emporium']].map(([id,icon,label])=>'<button type="button" data-action="shopSection" data-section="'+id+'" aria-pressed="'+(section===id)+'" class="'+(section===id?'active':'')+'">'+U.icon(icon)+'<span>'+label+'</span></button>').join('');
    if(heading)heading.after(switcher);else template.content.prepend(switcher);
    return template.innerHTML;
  };
  U.screens.Shop=()=>U.shopFrame(G.runtime.shopSection==='emporium'?emporium():general(),G.runtime.shopSection==='emporium'?'emporium':'general');
  // Legacy internal destinations still render the combined shop and never need a sidebar entry.
  U.screens.Emporium=()=>U.shopFrame(emporium(),'emporium');
})(RPG,RPG.data,RPG.systems,RPG.ui);
