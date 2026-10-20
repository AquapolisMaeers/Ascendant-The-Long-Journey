'use strict';
(function(G,D,S){
  S.skilling={
    nodes(){return[D.skilling.root,...D.skilling.paths.flatMap(path=>path.nodes)];},
    earned(c){return Math.floor(D.skills.reduce((sum,skill)=>sum+c.skills[skill].level-1,0)/D.skilling.levelsPerPoint);},
    spent(c){return Object.values(c.skilling||{}).reduce((sum,rank)=>sum+rank,0);},
    available(c){return this.earned(c)-this.spent(c);},
    valid(c){
      if(c.skilling===undefined)return true;
      if(!c.skilling||typeof c.skilling!=='object'||Array.isArray(c.skilling))return false;
      const nodes=this.nodes();
      return this.available(c)>=0&&Object.entries(c.skilling).every(([id,rank])=>{
        const node=nodes.find(n=>n.id===id),parent=nodes.find(n=>n.id===node?.requires);
        return node&&Number.isInteger(rank)&&rank>=1&&rank<=node.ranks&&(!parent||c.skilling[parent.id]===parent.ranks);
      });
    },
    canLearn(c,id){
      const node=this.nodes().find(n=>n.id===id),parent=this.nodes().find(n=>n.id===node?.requires);
      return!!node&&this.available(c)>0&&(c.skilling?.[id]||0)<node.ranks&&(!parent||c.skilling?.[parent.id]===parent.ranks);
    },
    effects(c){
      const out={};for(const node of this.nodes())for(const[key,value]of Object.entries(node.effects))out[key]=(out[key]||0)+value*(c.skilling?.[node.id]||0);
      return out;
    },
    toolBonus(c,skill,key){
      if(!D.skills.includes(skill))return 0;
      if(!['Efficiency','Yield','Knowledge','Fortune','Conservation'].includes(key))return 0;
      const effects=this.effects(c),scope=D.gatheringSkills.includes(skill)?'gather':'craft';
      return(effects['all'+key]||0)+(effects[scope+key]||0);
    },
    settle(c){const result=S.offline.apply(c);if(result.levelsGained)S.offline.record(result);},
    learn(id){
      G.ensureIdle();const c=G.character();
      G.assert(!c.dungeon&&!S.tutorial.active(),'Finish the tutorial and leave the dungeon before spending skilling points.');
      G.assert(this.canLearn(c,id),'This node needs an available skilling point and a fully learned prerequisite.');
      this.settle(c);c.skilling??={};c.skilling[id]=(c.skilling[id]||0)+1;G.commit();
    },
    reset(){
      G.ensureIdle();const c=G.character();
      G.assert(!c.dungeon&&!S.tutorial.active(),'Finish the tutorial and leave the dungeon before resetting skilling points.');
      G.assert(this.spent(c)>0,'No spent skilling points to reset.');
      G.assert(S.inventory.available('talent-reset',c)>0,'You need an unlocked Crystal of Recollection.');
      this.settle(c);S.inventory.take('talent-reset',1,c);c.skilling={};G.commit();
    }
  };
})(RPG,RPG.data,RPG.systems);
