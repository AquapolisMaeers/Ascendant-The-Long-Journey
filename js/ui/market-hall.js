'use strict';
(function(G,D,S,U) {
  // Continue the engraved regalia icon system with distinct tack, antlers and colors.
  const regaliaArt=U.regaliaArt;
  U.regaliaArt=entry=>{
    if(entry.kind!=='mount')return regaliaArt(entry);
    const key=entry.id.split(':')[1],stag=['health','healthPct'].includes(key),kirin=['penetration','utility','sovereign'].includes(key);
    return '<span class="regalia-art mount-art" style="--regalia:'+entry.color+'" role="img" aria-label="'+U.e(entry.name)+'"><svg viewBox="0 0 160 140" aria-hidden="true"><ellipse cx="82" cy="122" rx="57" ry="7" fill="#090b1480"/><path d="M17 110 9 90 18 59 42 34 61 27 98 32 132 58 149 89 137 113 104 128 60 129Z" fill="#171b29" stroke="currentColor" opacity=".65"/>'+
      '<path d="M111 68q28-7 24 20l10 18q-14-3-16-20l-10-4" fill="#292132" stroke="currentColor" stroke-width="2"/>'+ 
      '<path d="m62 85-6 29-9 7h14l12-30m25-2 9 27-1 6h14l-5-8-6-31" fill="#655366" stroke="#211b28" stroke-width="3"/>'+ 
      '<path d="M55 68q25-18 61 2l6 16q-15 16-55 7l-18-7Z" fill="currentColor" stroke="#161822" stroke-width="3"/>'+ 
      '<path d="m66 86-5 26-8 9h15l3-8 9-24m26-4 3 28 7 8h14l-11-12-2-29" fill="currentColor" stroke="#171824" stroke-width="3"/>'+ 
      '<path d="M54 83 41 65 38 49 28 55 16 49 23 34 33 24 37 15 43 27 51 26 57 40 67 62Z" fill="currentColor" stroke="#141725" stroke-width="3"/>'+ 
      '<path d="M44 27q23 13 20 42l-11-3q-1-19-11-28Z" fill="#302334"/><path d="m24 34 18 9-8 11m4-8 20 19" fill="none" stroke="#ead3ae" stroke-width="2"/><circle cx="30" cy="35" r="2" fill="#11111a"/>'+ 
      '<path d="m70 60 31 2 10 25-28 8-16-19Z" fill="#242135" stroke="#eed5a7" stroke-width="2"/><path d="m76 66 20 1 7 16-17 5Z" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="89" cy="76" r="4" fill="currentColor"/>'+ 
      (stag?'<path d="m36 24-10-12-1-8m4 12-11-1m20 11 9-16 10-7m-13 13 12 2" fill="none" stroke="#f2debc" stroke-width="3" stroke-linecap="round"/>':'')+
      (kirin?'<path d="m29 28-1-20 9 16" fill="#f7dc94" stroke="#342431" stroke-width="2"/>':'')+
      (entry.tier==='Sovereign'?'<path d="M46 20 42 7 54 13 62 3 69 14 82 8 78 23Z" fill="#f0d18b"/><path d="m113 66 19-15m-16 26 23-2m-24 12 16 11" stroke="#f0d18b" stroke-width="2"/>':'')+'</svg></span>';
  };
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
