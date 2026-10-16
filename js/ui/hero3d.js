'use strict';
/* Local, dependency-free 3D meshes. Gear is parented to body anchors; WebGL supplies
   lighting and a depth buffer. The same geometry has a Canvas fallback. No save RNG. */
(function(U,D) {
  const TAU=Math.PI*2, add=(a,b)=>a.map((v,i)=>v+b[i]), sub=(a,b)=>a.map((v,i)=>v-b[i]),
    mul=(a,n)=>a.map(v=>v*n), dot=(a,b)=>a.reduce((n,v,i)=>n+v*b[i],0),
    cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],
    norm=a=>mul(a,1/(Math.hypot(...a)||1));
  const rgb=hex=>[1,3,5].map(k=>parseInt(hex.slice(k,k+2),16)/255);
  const materials=['#796353','#946845','#9da9b1','#8ba3ac','#859881','#7c8fa7','#60959f','#79618f','#bb9459','#89acc5','#91b5a0','#c6aa70'];
  const identity=[1,0,0,0,1,0,0,0,1];
  const basis=(b,v)=>[b[0]*v[0]+b[3]*v[1]+b[6]*v[2],b[1]*v[0]+b[4]*v[1]+b[7]*v[2],b[2]*v[0]+b[5]*v[1]+b[8]*v[2]];
  const point=(node,v,normal=false)=>{
    const transformed=basis(node.b,v.map((n,i)=>normal?n/node.s[i]:n*node.s[i]));
    const p=normal?transformed:add(transformed,node.p);
    return node.parent?point(node.parent,p,normal):normal?norm(p):p;
  };
  function node(parent,name,p=[0,0,0],s=[1,1,1],b=identity) {
    const n={parent,name,p,s,b,children:[],meshes:[]};if(parent)parent.children.push(n);return n;
  }
  function surface(rings,sides=24) {
    const positions=[],normals=[];
    const at=(j,i)=>{const r=rings[j],t=i/sides*TAU;return [r[1]*Math.cos(t),r[0],r[2]*Math.sin(t)];};
    const normal=(j,i)=>{
      const a=rings[Math.max(0,j-1)],b=rings[Math.min(rings.length-1,j+1)],r=rings[j],t=i/sides*TAU;
      return norm([Math.cos(t)/(r[1]||.001),-((b[1]-a[1])/(b[0]-a[0]||.001))/Math.max(.01,r[1]),Math.sin(t)/(r[2]||.001)]);
    };
    for(let j=0;j<rings.length-1;j++)for(let i=0;i<sides;i++)for(const [a,b] of [[j,i],[j+1,i],[j+1,i+1],[j,i],[j+1,i+1],[j,i+1]]) {
      positions.push(...at(a,b));normals.push(...normal(a,b));
    }
    return {positions,normals};
  }
  const sphere=(()=>{const rings=[];for(let i=0;i<=14;i++){const t=i/14*Math.PI;rings.push([-Math.cos(t),Math.max(.0001,Math.sin(t)),Math.max(.0001,Math.sin(t))]);}return surface(rings);})();
  const cube=(()=>{
    const positions=[],normals=[];
    for(const [n,a,b,c,d] of [
      [[0,0,1],[-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1]],[[0,0,-1],[1,-1,-1],[-1,-1,-1],[-1,1,-1],[1,1,-1]],
      [[1,0,0],[1,-1,1],[1,-1,-1],[1,1,-1],[1,1,1]],[[-1,0,0],[-1,-1,-1],[-1,-1,1],[-1,1,1],[-1,1,-1]],
      [[0,1,0],[-1,1,1],[1,1,1],[1,1,-1],[-1,1,-1]],[[0,-1,0],[-1,-1,-1],[1,-1,-1],[1,-1,1],[-1,-1,1]]])
      for(const v of [a,b,c,a,c,d]){positions.push(...v);normals.push(...n);}
    return {positions,normals};
  })();
  const mesh=(n,geometry,color,gloss=.15)=>{n.meshes.push({geometry,color:rgb(color),gloss});return n;};
  const ell=(parent,name,p,s,color,gloss=.15)=>mesh(node(parent,name,p,s),sphere,color,gloss);
  const box=(parent,name,p,s,color,gloss=.2)=>mesh(node(parent,name,p,s),cube,color,gloss);
  function segment(parent,name,a,b,r1,r2,color,gloss=.2,depth=1) {
    const d=sub(b,a),y=norm(d),x=norm(cross([0,0,1],y)),z=cross(x,y),length=Math.hypot(...d);
    const n=node(parent,name,a,[1,1,1],[...x,...y,...z]);
    return mesh(n,surface([[0,r1,r1*depth],[length,r2,r2*depth]],16),color,gloss);
  }
  function ring(parent,name,p,r,t,color) {
    const positions=[],normals=[];
    const v=(i,j)=>{const a=i/32*TAU,b=j/8*TAU;return [(r+t*Math.cos(b))*Math.cos(a),t*Math.sin(b),(r+t*Math.cos(b))*Math.sin(a)];};
    for(let i=0;i<32;i++)for(let j=0;j<8;j++)for(const [a,b]of[[i,j],[i+1,j],[i+1,j+1],[i,j],[i+1,j+1],[i,j+1]]) {
      positions.push(...v(a,b));normals.push(Math.cos(b/8*TAU)*Math.cos(a/32*TAU),Math.sin(b/8*TAU),Math.cos(b/8*TAU)*Math.sin(a/32*TAU));
    }
    return mesh(node(parent,name,p),{positions,normals},color,.8);
  }
  function extrude(parent,name,outline,depth,color) {
    const positions=[],normals=[];
    const triangle=(a,b,c,n)=>{for(const p of [a,b,c]){positions.push(...p);normals.push(...n);}};
    for(let i=1;i<outline.length-1;i++) {
      triangle([...outline[0],depth],[...outline[i],depth],[...outline[i+1],depth],[0,0,1]);
      triangle([...outline[0],-depth],[...outline[i+1],-depth],[...outline[i],-depth],[0,0,-1]);
    }
    for(let i=0;i<outline.length;i++) {
      const a=outline[i],b=outline[(i+1)%outline.length],n=norm([b[1]-a[1],a[0]-b[0],0]);
      triangle([...a,depth],[...a,-depth],[...b,depth],n);triangle([...a,-depth],[...b,-depth],[...b,depth],n);
    }
    return mesh(node(parent,name),{positions,normals},color,.85);
  }
  function build(model) {
    const root=node(null,'body'),anchors={},equipment=model.equipment||{},cloth=model.color||'#414756',skin='#b68e77',dark='#20232d';
    const anchor=(name,p)=>anchors[name]=node(root,name,p);
    const torso=anchor('torso',[0,2.22,0]),head=anchor('head',[0,2.91,0]);
    const torsoRings=[[-.51,.23,.145],[-.40,.265,.16],[-.20,.225,.145],[.02,.295,.175],[.24,.35,.18],[.37,.30,.155],[.40,.12,.10]];
    mesh(torso,surface(torsoRings),cloth);
    ell(root,'pelvis',[0,1.69,0],[.255,.19,.15],dark);
    segment(root,'neck',[0,2.55,0],[0,2.81,0],.09,.095,skin);
    ell(head,'skull',[0,.035,0],[.177,.226,.167],skin);
    ell(head,'jaw',[0,-.095,.018],[.139,.14,.136],skin);
    ell(head,'nose',[0,-.008,.164],[.032,.065,.043],skin);
    ell(head,'mouth',[0,-.122,.145],[.047,.007,.005],'#714e48');
    for(const side of [-1,1]) {
      ell(head,'ear',[side*.175,-.01,-.007],[.027,.058,.035],skin);
      ell(head,'eye',[side*.068,.037,.152],[.038,.014,.012],'#d8d2bc');
      ell(head,'iris',[side*.066,.038,.163],[.012,.013,.004],'#343b3b');
      ell(head,'brow',[side*.064,.069,.152],[.047,.011,.012],'#342b2c');
    }
    mesh(node(head,'hair'),surface([[.10,.17,.16],[.17,.15,.14],[.24,.08,.08],[.26,.001,.001]]),'#302930');
    const legs=[],arms=[];
    for(const side of [-1,1]) {
      const hip=[side*.16,1.70,0],knee=[side*.205,.97,.032],ankle=[side*.225,.26,.01];
      const shoulder=[side*.365,2.51,-.005],elbow=[side*.52,2.035,.035],wrist=[side*.565,1.64,.19],hand=[side*.57,1.51,.21];
      const thigh=segment(root,'thigh',hip,knee,.138,.106,dark),shin=segment(root,'shin',knee,ankle,.108,.075,cloth);
      const upper=segment(root,'upper-arm',shoulder,elbow,.115,.09,cloth),fore=segment(root,'forearm',elbow,wrist,.092,.063,cloth);
      segment(root,'wrist',wrist,hand,.058,.061,skin);
      anchors['thigh'+side]=thigh;anchors['shin'+side]=shin;anchors['forearm'+side]=fore;
      const foot=anchor('foot'+side,[side*.225,.13,.075]),palm=anchor('hand'+side,hand);
      ell(foot,'shoe',[0,-.035,.07],[.105,.10,.205],'#333039');
      ell(palm,'palm',[0,0,0],[.072,.09,.06],skin);
      for(let f=0;f<4;f++)ell(palm,'finger',[(f-1.5)*.028,-.055,.038],[.016,.05,.028],skin);
      ell(palm,'thumb',[side*-.06,.017,.044],[.025,.046,.033],skin);
      legs.push({side,thigh,shin,foot});arms.push({side,shoulder,elbow,wrist,fore,palm,upper});
    }
    const slots=[];
    const gear=(slot,parent)=>{
      const item=equipment[slot];if(!item)return null;
      const n=node(parent,slot);n.slot=slot;n.item=item;slots.push(n);return n;
    };
    const metal=slot=>materials[equipment[slot]?.tier||0],trim=slot=>(equipment[slot]?.rarity||0)>=4?'#ddbd7d':'#a7adb1';
    let n=gear('Plate',torso);
    if(n) {
      mesh(n,surface(torsoRings.map(([y,x,z])=>[y,x+.025,z+.035])),metal('Plate'),.7);
      for(const y of [-.35,-.22,-.09])mesh(node(n,'cuirass-ridge',[0,y,.006]),surface([[0,.25+(y+.35)*.10,.185],[.025,.254+(y+.35)*.10,.194]],24),trim('Plate'),.75);
      box(n,'belt',[0,-.44,.01],[.268,.035,.184],'#393139');box(n,'buckle',[0,-.44,.202],[.041,.043,.014],trim('Plate'),.8);
      for(const a of arms) {
        const p=sub(a.shoulder,torso.p);
        mesh(node(n,'pauldron',add(p,[a.side*.028,.02,0])),surface([[-.09,.16,.18],[-.065,.18,.20],[.04,.155,.175],[.09,.11,.14],[.11,.001,.001]],20),metal('Plate'),.7);
        mesh(node(n,'pauldron-trim',add(p,[a.side*.028,.02,0])),surface([[-.09,.161,.181],[-.071,.178,.199]],20),trim('Plate'),.75);
      }
      mesh(node(n,'breastplate-keel',[0,.02,.213]),surface([[-.20,0,0],[.05,.028,.018],[.28,0,0]],4),trim('Plate'),.7);
      for(const side of [-1,1])mesh(node(n,'tasset',[side*.145,-.47,.09]),surface([[-.22,.10,.11],[-.18,.12,.12],[.06,.12,.12]],8),metal('Plate'),.65);
      if(equipment.Plate.boss!==null)ell(n,'boss-seal',[0,.08,.222],[.055,.072,.025],trim('Plate'),.85);
    }
    n=gear('Greaves',root);
    if(n)for(const l of legs) {
      const thigh=node(l.thigh,'thigh-armor');thigh.slot='Greaves';
      mesh(thigh,surface([[.06,.146,.145],[.28,.139,.14],[.58,.119,.118],[.69,.115,.113]],20),metal('Greaves'),.65);
      const shin=node(l.shin,'shin-armor');shin.slot='Greaves';
      mesh(shin,surface([[.02,.119,.123],[.22,.123,.13],[.48,.091,.102],[.60,.083,.092]],20),metal('Greaves'),.7);
      mesh(node(n,'knee',[l.side*.205,.96,.13]),surface([[-.12,0,0],[0,.115,.065],[.12,0,0]],6),trim('Greaves'),.65);
    }
    n=gear('Boots',root);
    if(n)for(const l of legs) {
      const boot=node(l.foot,'fitted-boot');boot.slot='Boots';
      ell(boot,'toe',[0,-.025,.098],[.116,.105,.222],metal('Boots'),.55);
      mesh(node(boot,'ankle'),surface([[-.02,.10,.12],[.22,.091,.10],[.25,.095,.104]],20),metal('Boots'),.6);
      ell(boot,'sole',[0,-.091,.10],[.119,.026,.224],'#26252b');
      ring(boot,'ankle-trim',[0,.22,0],.096,.012,trim('Boots'));
    }
    n=gear('Gloves',root);
    if(n)for(const a of arms) {
      const guard=node(a.fore,'vambrace');guard.slot='Gloves';
      mesh(guard,surface([[.17,.093,.10],[.29,.086,.095],[.42,.074,.082]],20),metal('Gloves'),.7);
      const glove=node(a.palm,'gauntlet');glove.slot='Gloves';
      mesh(node(glove,'cuff'),surface([[.025,.075,.076],[.14,.068,.072]],20),metal('Gloves'),.65);
      ell(glove,'palm',[0,.008,.005],[.081,.09,.074],metal('Gloves'),.6);
      for(let f=0;f<4;f++)ell(glove,'finger-plate',[(f-1.5)*.031,-.055,.058],[.018,.043,.028],metal('Gloves'),.7);
      ell(glove,'knuckles',[0,-.01,.069],[.073,.023,.013],trim('Gloves'),.8);
    }
    n=gear('Helmet',head);
    if(n) {
      mesh(n,surface([[.065,.19,.18],[.14,.188,.18],[.23,.135,.135],[.29,.015,.018]],28),metal('Helmet'),.75);
      for(const side of [-1,1]) {
        ell(n,'temple',[side*.174,.045,.015],[.044,.095,.146],metal('Helmet'),.7);
        ell(n,'cheek-guard',[side*.152,-.075,.09],[.035,.11,.062],metal('Helmet'),.7);
      }
      ell(n,'brow-guard',[0,.073,.164],[.19,.025,.037],trim('Helmet'),.8);
      ell(n,'crest',[0,.20,-.035],[.021,.12,.13],trim('Helmet'),.7);
      mesh(n,surface([[-.20,.09,.105],[-.08,.167,.18],[.02,.183,.19]],28),metal('Helmet'),.7);
      box(n,'nasal-guard',[0,.005,.185],[.015,.07,.018],trim('Helmet'),.75);
      for(const x of [-.075,-.045,.045,.075])box(n,'visor-vent',[x,-.075,.174],[.005,.025,.005],'#242932');
    }
    n=gear('Necklace',root);
    if(n) {
      const points=Array.from({length:25},(_,i)=>{const t=i/24*Math.PI;return [.145*Math.cos(t),2.60-.285*Math.sin(t),.187+.047*Math.sin(t)];});
      for(let i=0;i<points.length-1;i++)segment(n,'chain',points[i],points[i+1],.009,.009,trim('Necklace'),.9);
      mesh(node(n,'pendant',[0,2.285,.25]),surface([[-.06,0,0],[0,.045,.025],[.06,0,0]],4),metal('Necklace'),.9);
    }
    n=gear('Ring',anchors['hand-1']);
    if(n){ring(n,'band',[-.015,-.063,.039],.024,.008,metal('Ring'));ell(n,'ring-gem',[-.015,-.063,.064],[.016,.017,.015],trim('Ring'),.95);}
    const weapon=equipment.Weapon;
    n=gear('Weapon',anchors['hand'+(weapon?.style===2?1:-1)]);
    if(n) {
      const color=metal('Weapon'),edge=trim('Weapon'),name=(weapon.name||(weapon.boss!==null?D.dungeons[weapon.boss]?.weapons[weapon.style]:null)||D.weapons[weapon.style]?.[weapon.tier]||'').toLowerCase();
      if(weapon.style===1&&/crossbow|arbalest/.test(name)) {
        box(n,'crossbow-stock',[0,.22,0],[.042,.41,.042],'#54433b');
        for(const side of [-1,1]) {
          segment(n,'crossbow-prod',[0,.54,0],[side*.31,.48,.06],.025,.018,color,.65);
          segment(n,'crossbow-string',[side*.31,.48,.06],[0,.20,.07],.003,.003,'#e3d3ac');
        }
        segment(n,'crossbow-bolt',[0,.21,.076],[0,.75,.076],.008,.008,edge,.7);
        ell(n,'crossbow-trigger',[0,.12,-.03],[.07,.04,.07],color,.7);
      } else if(weapon.style===1) {
        const pts=Array.from({length:33},(_,i)=>{const y=-1.0+i/16;return [.23*Math.pow(Math.abs(y),1.7),y,0];});
        for(let i=0;i<pts.length-1;i++)segment(n,'bow-limb',pts[i],pts[i+1],.024,.022,color,.55);
        segment(n,'bow-string',pts[0],pts[32],.003,.003,'#e1d4af');
        segment(n,'bow-grip',[0,-.105,0],[0,.105,0],.032,.032,'#4a3330');
        segment(n,'arrow',[.23,.03,0],[.79,.03,0],.005,.005,'#ac9770');
        mesh(node(n,'arrow-head',[.80,.03,0],[.04,.012,.025]),sphere,edge,.75);
      } else if(weapon.style===2&&/book/.test(name)) {
        box(n,'spellbook-cover',[0,.25,-.006],[.22,.29,.055],color,.65);
        box(n,'spellbook-pages',[0,.25,.039],[.19,.265,.027],'#d6c8a3');
        for(const side of [-1,1])box(n,'spellbook-leaf',[side*.10,.25,.072],[.09,.25,.008],'#ddd3b9');
        box(n,'spellbook-spine',[0,.25,.085],[.01,.27,.012],edge,.7);
        for(const y of [.12,.18,.24,.30,.36])for(const side of [-1,1])box(n,'spellbook-script',[side*.10,y,.084],[.06,.004,.001],'#76667b');
      } else if(weapon.style===2) {
        const wand=/wand/.test(name),scepter=/scepter/.test(name),top=wand ? .53 : scepter ? .89 : 1.37;
        segment(n,wand?'wand-shaft':scepter?'scepter-shaft':'staff-shaft',[0,wand?-.11:scepter?-.31:-1.13,0],[0,top,0],.022,.025,color,.55);
        for(const y of [top-.13,top-.05])ring(n,'arcane-band',[0,y,0],.027,.008,edge);
        const size=wand ? .045 : scepter ? .09 : .105;
        mesh(node(n,'arcane-crystal',[0,top+.12,0]),surface([[-.12,0,0],[0,size,size*.8],[.17,0,0]],6),'#95d5d5',.9);
        if(!wand)for(const side of [-1,1])segment(n,'crystal-prong',[side*.025,top-.11,0],[side*(size+.007),top+.11,0],.015,.008,edge,.8);
      } else if(/axe|cleaver|hammer|maul|breaker|halberd|glaive/.test(name)) {
        const pole=/halberd|glaive/.test(name),axe=/axe|cleaver|halberd/.test(name),hammer=/hammer|maul|breaker/.test(name);
        segment(n,'long-grip',[0,pole?-1.05:-.21,0],[0,pole?1.29:1.14,0],.028,.024,'#53413a');
        if(axe) {
          const outline=[[.015,.83],[.25,.87],[.39,1.10],[.34,1.34],[.04,1.20]];
          extrude(n,'axe-head',outline,.04,color);
          if(/greataxe/.test(name))extrude(n,'axe-head',outline.map(([x,y])=>[-x,y]),.04,color);
          ring(n,'axe-collar',[0,1.03,0],.037,.012,edge);
        }
        if(hammer) {
          box(n,'hammer-head',[0,1.11,0],[.22,.105,.10],color,.7);
          for(const side of [-1,1])box(n,'hammer-face',[side*.23,1.11,0],[.025,.12,.114],edge,.75);
        }
        if(pole)mesh(node(n,'polearm-blade'),surface([[1.22,.055,.018],[1.46,.06,.018],[1.68,0,0]],4),color,.9);
        ell(n,'pommel',[0,pole?-1.05:-.21,0],[.037,.04,.035],edge,.7);
      } else {
        const length=weapon.tier<3 ? .88+weapon.tier*.13 : 1.48;
        mesh(node(n,'blade'),surface([[.20,.065,.02],[length-.26,.055,.018],[length,0,0]],4),color,.9);
        ell(n,'crossguard',[0,.19,0],[.176,.027,.039],edge,.85);
        segment(n,'sword-grip',[0,-.13,0],[0,.18,0],.028,.028,'#4a3330');
        for(const y of [-.1,-.05,0,.05,.10])ring(n,'grip-wrap',[0,y,0],.03,.004,edge);
        ell(n,'pommel',[0,-.16,0],[.041,.05,.037],color,.85);
      }
    }
    // All accessory meshes carry the owning slot, even when fitted to limb anchors.
    const parts=[];
    const visit=(nd,slot=null)=>{slot=nd.slot||slot;for(const m of nd.meshes)parts.push({...m,node:nd,slot});nd.children.forEach(child=>visit(child,slot));};visit(root);
    const vertices=[];
    for(const part of parts)for(let i=0;i<part.geometry.positions.length;i+=3) {
      const p=point(part.node,part.geometry.positions.slice(i,i+3)),normal=point(part.node,part.geometry.normals.slice(i,i+3),true);
      vertices.push(...p,...normal,...part.color,part.gloss);
    }
    return {root,anchors,slots,parts,vertices:new Float32Array(vertices)};
  }
  const vertexShader='attribute vec3 aPosition;attribute vec3 aNormal;attribute vec3 aColor;attribute float aGloss;uniform float uYaw;uniform float uPitch;uniform float uAspect;varying vec3 vNormal;varying vec3 vColor;varying vec3 vPos;varying float vGloss;void main(){float c=cos(uYaw),s=sin(uYaw),cx=cos(uPitch),sx=sin(uPitch);mat3 y=mat3(c,0.,-s,0.,1.,0.,s,0.,c);mat3 x=mat3(1.,0.,0.,0.,cx,sx,0.,-sx,cx);vec3 p=x*y*(aPosition-vec3(0.,1.65,0.));vNormal=x*y*aNormal;vColor=aColor;vGloss=aGloss;vPos=p;float h=1.86;gl_Position=vec4(p.x/(h*uAspect),p.y/h,-p.z/5.,1.);}';
  const fragmentShader='precision mediump float;varying vec3 vNormal;varying vec3 vColor;varying vec3 vPos;varying float vGloss;void main(){vec3 n=normalize(vNormal);vec3 light=normalize(vec3(-.6,.9,1.2));float key=max(dot(n,light),0.);float fill=max(dot(n,normalize(vec3(.8,.25,-.6))),0.);float spec=pow(max(dot(n,normalize(light+vec3(0.,0.,1.))),0.),36.);float rim=pow(1.-max(dot(n,vec3(0.,0.,1.)),0.),3.);vec3 color=vColor*(.28+.72*key+.19*fill)+vec3(1.,.9,.73)*spec*vGloss*.65+vec3(.25,.37,.47)*rim*.18;gl_FragColor=vec4(color,1.);}';
  function webgl(canvas) {
    const gl=canvas.getContext('webgl',{alpha:true,antialias:true,premultipliedAlpha:false,preserveDrawingBuffer:true});if(!gl)return null;
    const shader=(type,src)=>{const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s;};
    const vs=shader(gl.VERTEX_SHADER,vertexShader),fs=shader(gl.FRAGMENT_SHADER,fragmentShader),program=gl.createProgram();gl.attachShader(program,vs);gl.attachShader(program,fs);gl.linkProgram(program);
    if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));
    gl.deleteShader(vs);gl.deleteShader(fs);gl.useProgram(program);
    const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
    for(const [name,size,offset]of[['aPosition',3,0],['aNormal',3,12],['aColor',3,24],['aGloss',1,36]]){const at=gl.getAttribLocation(program,name);gl.enableVertexAttribArray(at);gl.vertexAttribPointer(at,size,gl.FLOAT,false,40,offset);}
    const yaw=gl.getUniformLocation(program,'uYaw'),pitch=gl.getUniformLocation(program,'uPitch'),aspect=gl.getUniformLocation(program,'uAspect');
    gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);gl.clearColor(0,0,0,0);
    return {kind:'webgl',load:scene=>gl.bufferData(gl.ARRAY_BUFFER,scene.vertices,gl.STATIC_DRAW),draw(scene,y,p){gl.viewport(0,0,canvas.width,canvas.height);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.uniform1f(yaw,y);gl.uniform1f(pitch,p);gl.uniform1f(aspect,canvas.width/canvas.height);gl.drawArrays(gl.TRIANGLES,0,scene.vertices.length/10);},dispose(){gl.deleteBuffer(buffer);gl.deleteProgram(program);gl.getExtension('WEBGL_lose_context')?.loseContext();}};
  }
  function software(canvas) {
    const ctx=canvas.getContext('2d'),rotate=(v,y,p)=>{const a=[v[0]*Math.cos(y)+v[2]*Math.sin(y),v[1],-v[0]*Math.sin(y)+v[2]*Math.cos(y)];return [a[0],a[1]*Math.cos(p)-a[2]*Math.sin(p),a[1]*Math.sin(p)+a[2]*Math.cos(p)];};
    return {kind:'software-3d',load(){},draw(scene,y,p){
      const v=scene.vertices,triangles=[],h=canvas.height/3.72;
      for(let i=0;i<v.length;i+=30){const pts=[],normals=[];for(let k=0;k<3;k++){const a=i+k*10;pts.push(rotate([v[a],v[a+1]-1.65,v[a+2]],y,p));normals.push(rotate([v[a+3],v[a+4],v[a+5]],y,p));}const n=norm(add(add(normals[0],normals[1]),normals[2])),light=.28+.72*Math.max(0,dot(n,norm([-.6,.9,1.2])))+.19*Math.max(0,dot(n,norm([.8,.25,-.6])));triangles.push({pts,z:pts.reduce((s,a)=>s+a[2],0),color:'rgb('+[v[i+6],v[i+7],v[i+8]].map(c=>Math.min(255,Math.round(c*light*255))).join(',')+')'});}
      triangles.sort((a,b)=>a.z-b.z);ctx.clearRect(0,0,canvas.width,canvas.height);
      for(const t of triangles){ctx.beginPath();t.pts.forEach((p,i)=>ctx[i?'lineTo':'moveTo'](canvas.width/2+p[0]*h,canvas.height/2-p[1]*h));ctx.closePath();ctx.fillStyle=t.color;ctx.fill();}
    },dispose(){}};
  }
  const active=new Map();
  function hydrate() {
    for(const [canvas,view]of active)if(!canvas.isConnected){view.renderer.dispose();active.delete(canvas);}
    for(let canvas of document.querySelectorAll('canvas[data-hero-model]')) {
      const signature=canvas.getAttribute('data-hero-model');let view=active.get(canvas);
      if(view?.signature===signature){canvas.setAttribute('data-renderer',view.renderer.kind);canvas.setAttribute('data-model-ready','true');continue;}
      if(!view) {
        let renderer;try{renderer=webgl(canvas);}catch{renderer=null;}
        if(!renderer){const fresh=canvas.cloneNode(true);canvas.replaceWith(fresh);canvas=fresh;renderer=software(canvas);}
        view={renderer,yaw:-.32,pitch:.03,signature:null,scene:null};active.set(canvas,view);
        if(canvas.closest('.large')) {
          let drag=null;
          canvas.addEventListener('pointerdown',e=>{drag={x:e.clientX,y:e.clientY};canvas.setPointerCapture(e.pointerId);});
          canvas.addEventListener('pointermove',e=>{if(!drag)return;view.yaw+=(e.clientX-drag.x)*.012;view.pitch=Math.max(-.28,Math.min(.28,view.pitch+(e.clientY-drag.y)*.007));drag={x:e.clientX,y:e.clientY};view.renderer.draw(view.scene,view.yaw,view.pitch);});
          canvas.addEventListener('pointerup',()=>drag=null);canvas.addEventListener('pointercancel',()=>drag=null);
          canvas.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','Home'].includes(e.key))return;e.preventDefault();view.yaw=e.key==='Home'?-.32:view.yaw+(e.key==='ArrowLeft'?-.25:.25);view.renderer.draw(view.scene,view.yaw,view.pitch);});
        }
        canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();view.signature=null;});
        canvas.addEventListener('webglcontextrestored',()=>{active.delete(canvas);hydrate();});
      }
      view.scene=build(JSON.parse(signature));view.signature=signature;view.renderer.load(view.scene);view.renderer.draw(view.scene,view.yaw,view.pitch);
      canvas.setAttribute('data-renderer',view.renderer.kind);canvas.setAttribute('data-model-ready','true');
    }
  }
  U.hero3d={build,hydrate,view:canvas=>active.get(canvas)};
  document.addEventListener('click',event=>{
    const control=event.target.closest('[data-model-turn]');if(!control)return;
    const canvas=control.closest('.hero-stage')?.querySelector('canvas'),v=active.get(canvas);if(!v)return;
    v.yaw=control.dataset.modelTurn==='reset'?-.32:v.yaw+Number(control.dataset.modelTurn);v.pitch=.03;v.renderer.draw(v.scene,v.yaw,v.pitch);
  });
  const observer=new MutationObserver(hydrate);
  observer.observe(document.getElementById('app'),{childList:true,subtree:true,attributes:true,attributeFilter:['data-hero-model']});
  observer.observe(document.getElementById('modal-root'),{childList:true,subtree:true});
  window.addEventListener('rpg:rendered',hydrate);
})(RPG.ui,RPG.data);
