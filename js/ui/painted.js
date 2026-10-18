'use strict';
(function(G,D,S,U) {
  const itemArtKey=U.itemArtKey;
  U.itemArtKey=item=>item.kind==='gear'&&['Mage','Archer'].includes(item.armorClass)&&D.armorSlots.includes(item.slot||D.pieces[item.piece])?
    'class-gear:'+item.armorClass+':'+(item.boss==null?item.tier:12+item.boss)+':'+item.piece:itemArtKey(item);
  U.fibreGrove=()=>{
    const c=G.character(),available=S.world.fibreTiers(c),tier=available.includes(G.runtime.fibreTier)?G.runtime.fibreTier:available[available.length-1],busy=c.combat||c.activity||c.encounter||c.pending.length||S.tutorial.active();
    return '<details class="panel fibre-grove" id="fibre-grove" '+(G.runtime.fibreOpen?'open':'')+'><summary><span>Farming Grove</span><small>Gather cloth materials</small></summary><div class="fibre-grove-content">'+U.paint('fiber:'+tier)+'<div><h3>'+U.e(D.resources.fiber[tier])+'</h3><p>Harvest two fibres per action using Farming and Pruning Shears. Five charges per visit; return whenever you need more.</p><p class="notes">Nettle Fibre: Farming Level 5 in the Crossroads or any later region.</p></div><label>Material tier<select id="fibre-tier">'+D.tiers.map((level,i)=>'<option value="'+i+'" '+(i===tier?'selected':'')+' '+(!available.includes(i)?'disabled':'')+'>Level '+level+'</option>').join('')+'</select></label><p class="notes fibre-grove-hint">Higher tiers require the matching Farming level and a region that supports that level.</p>'+U.btn('Harvest fibres','forageFibre',busy?'disabled':'','gold-btn')+(busy?'<p class="notes fibre-grove-hint">Finish your current activity, resolve your encounter and collect pending loot before harvesting.</p>':'')+'</div></details>';
  };
  const world=U.screens.World;
  U.screens.World=()=>{
    const html=world(),c=G.character();if(c.dungeon||c.combat)return html;
    const template=document.createElement('template');template.innerHTML=html;
    template.content.querySelector('.world-main')?.insertAdjacentHTML('beforeend',U.fibreGrove());return template.innerHTML;
  };
  const summary=U.itemSummary;
  U.itemSummary=entry=>{
    const info=entry.kind==='stack'?D.catalog[entry.key]:null;
    return info?.kind==='fiber'?'Gather directly in World → Farming Grove with Farming Level '+D.tiers[info.tier]+'. Use Pruning Shears to harvest crops. Weave fabric under Smithing → Leather & cloth.':summary(entry);
  };
  const crafting=U.screens.Crafting;
  U.screens.Crafting=()=>{
    const html=crafting();if(G.runtime.tab&&G.runtime.tab!=='Smithing'||!['Armor','Leather & cloth'].includes(G.runtime.smithingCategory))return html;
    return html.replace('</div><p class="notes armour-material-help">','</div>'+U.btn('Gather cloth materials','openFibreGrove','','quiet small fibre-source')+'<p class="notes armour-material-help">');
  };
})(RPG,RPG.data,RPG.systems,RPG.ui);
