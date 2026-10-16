'use strict';
(function(G,D,S) {
  S.exchange={
    quote(from,to,tier,quantity,c=G.character()) {
      G.assert(D.resourceKinds.includes(from)&&D.resourceKinds.includes(to)&&from!==to,'Choose two different raw material types.');
      G.assert(Number.isInteger(tier)&&D.tiers[tier]!==undefined,'Choose a valid material tier.');
      G.assert(Number.isSafeInteger(quantity)&&quantity>0&&quantity<=1000000,'Choose a whole quantity from 1 to 1,000,000.');
      const input=from+':'+tier,output=to+':'+tier,cost=quantity*10;
      const source=c.inventory.find(i=>i.kind==='stack'&&i.key===input),target=c.inventory.find(i=>i.kind==='stack'&&i.key===output);
      const available=S.inventory.available(input,c),room=!!target||c.inventory.length-(source?.quantity===cost?1:0)<c.capacity;
      let max=Math.min(1000000,Math.floor(available/10),target?Number.MAX_SAFE_INTEGER-target.quantity:1000000);
      if(!target&&c.inventory.length>=c.capacity)max=source&&!source.locked&&source.quantity%10===0&&source.quantity/10<=max?source.quantity/10:0;
      return {from,to,tier,quantity,input,output,cost,available,room,
        fits:!target||Number.isSafeInteger(target.quantity+quantity),max};
    },
    trade(from,to,tier,quantity) {
      G.ensureProgress();const c=G.character();
      G.assert(!S.tutorial.active()&&!c.dungeon,'Finish the tutorial and leave the dungeon before exchanging materials.');
      const q=this.quote(from,to,tier,quantity,c);
      G.assert(q.available>=q.cost,'Not enough unlocked '+D.catalog[q.input].name+'.');
      G.assert(q.room,'Make an inventory slot for the received material.');
      G.assert(q.fits,'The received material stack would be too large.');
      S.inventory.take(q.input,q.cost,c);S.inventory.reward([{key:q.output,quantity:q.quantity}],c);
      G.notify('Exchanged '+q.cost+' '+D.catalog[q.input].name+' for '+q.quantity+' '+D.catalog[q.output].name+'.','success');
      G.commit();return q;
    }
  };
})(RPG,RPG.data,RPG.systems);
