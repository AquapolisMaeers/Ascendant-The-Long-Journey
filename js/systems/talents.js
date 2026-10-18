'use strict';
(function(G,D,S) {
  S.talents = {
    nodes(c) { return D.talents[c.class].flatMap(path => path.nodes.map((node,index) => ({...node, id:path.id+':'+index, path, index}))); },
    spent(c) { return Object.values(c.talents || {}).reduce((sum,rank)=>sum+rank,0); },
    available(c) { return c.level - 1 - this.spent(c); },
    valid(c) {
      if(c.talents===undefined) return true;
      if(!c.talents || typeof c.talents!=='object' || Array.isArray(c.talents)) return false;
      const nodes=this.nodes(c);
      return this.available(c)>=0 && Object.entries(c.talents).every(([id,rank])=>{
        const node=nodes.find(n=>n.id===id);
        return node && Number.isInteger(rank) && rank>=1 && rank<=D.talentRanks[node.index] && c.level>=D.talentLevels[node.index] &&
          (!node.index || c.talents[node.path.id+':'+(node.index-1)]===D.talentRanks[node.index-1]);
      });
    },
    canLearn(c,id) {
      const n=this.nodes(c).find(n=>n.id===id);
      return !!n && this.available(c)>0 && c.level>=D.talentLevels[n.index] && (c.talents?.[id]||0)<D.talentRanks[n.index] &&
        (!n.index || c.talents?.[n.path.id+':'+(n.index-1)]===D.talentRanks[n.index-1]);
    },
    effects(c) {
      const effects={};
      for(const n of this.nodes(c)) for(const [stat,value] of Object.entries(n.effects)) {
        const rank=c.talents?.[n.id]||0;
        if(rank) effects[stat]=typeof value==='boolean'?true:(effects[stat]||0)+value*rank;
      }
      return effects;
    },
    learn(id) {
      G.ensureIdle(); const c=G.character();
      G.assert(!S.tutorial.active(),'Finish the tutorial before spending talent points.');
      G.assert(this.canLearn(c,id),'This talent needs an available point, its required level and a completed previous node.');
      const health=S.character.stats(c).health;
      c.talents ??= {}; c.talents[id]=(c.talents[id]||0)+1;
      c.hp+=Math.max(0,S.character.stats(c).health-health);
      G.runtime.estimate=null; G.commit();
    },
    reset() {
      G.ensureIdle(); const c=G.character();
      G.assert(!c.dungeon,'Leave the dungeon before resetting talents.');
      c.talents={}; c.hp=Math.min(c.hp,S.character.stats(c).health);
      G.runtime.estimate=null; G.commit();
    }
  };
})(RPG,RPG.data,RPG.systems);
