(function (root) {
'use strict';
const CONFIG={hp:3,bossHP:1000,gravity:720,flap:-290,radius:16,playerX:140,top:55,bottom:565,protection:.5,shield:12,jCooldown:8,jHover:.9,kHover:1.35,ultimate:100,normalInterval:.75,normalDamage:6,energyHit:3,energyDodge:7,transform:2.2,initialEnergy:20,yujiJ:36,gojoK:140,yujiK:115,suppressDuration:5,suppressRate:.35,pillarWidth:40,routeMargin:5,flapDebounce:.055,coverSpeed:1900,coverWindow:.12,coverMaxDistance:680,coverRecovery:1.4,coverLearning:8,domainActive:1.1,domainInterval:8,maxEffects:64,maxEvents:64,modes:{practice:{speed:175,gap:235,opening:158,middle:54,interval:2.6,warning:2.1,domainGap:240,coverInterval:11,coverWarning:2},challenge:{speed:235,gap:180,opening:138,middle:58,interval:2.1,warning:1.6,domainGap:190,coverInterval:9,coverWarning:1.5}}};
const KEY='shinjuku-flappy-battle-v03-history';
const reasons=['boss defeated','slash','domain','boundary','pillar','cover slash'];
function validHistory(data){return Array.isArray(data)?data.filter(e=>e&&['gojo','yuji'].includes(e.character)&&Object.hasOwn(CONFIG.modes,e.mode)&&['victory','defeat'].includes(e.outcome)&&Number.isFinite(e.seconds)&&e.seconds>=0&&Number.isSafeInteger(e.score)&&e.score>=0&&reasons.includes(e.reason)).slice(0,5):[];}
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function segmentsOf(e,mode='practice') {if(e.segments)return e.segments;const half=CONFIG.modes[mode].gap/2,cy=e.gapY??300;return [{a:CONFIG.top,b:cy-half,id:'top'},{a:cy+half,b:CONFIG.bottom,id:'bottom'}];}
function openingsOf(e,mode='practice') {let cursor=CONFIG.top;const out=[];for(const s of [...segmentsOf(e,mode)].sort((a,b)=>a.a-b.a)){if(s.a>cursor)out.push({a:cursor,b:s.a});cursor=Math.max(cursor,s.b);}if(cursor<CONFIG.bottom)out.push({a:cursor,b:CONFIG.bottom});return out;}
function makePillar(id,x,shift,mode) {const m=CONFIG.modes[mode],cy=310+shift;const gaps=[{a:cy-m.middle/2-m.opening,b:cy-m.middle/2},{a:cy+m.middle/2,b:cy+m.middle/2+m.opening}];return {id,x,width:CONFIG.pillarWidth,gaps,segments:[{a:CONFIG.top,b:gaps[0].a,id:id+'t'},{a:gaps[0].b,b:gaps[1].a,id:id+'m'},{a:gaps[1].b,b:CONFIG.bottom,id:id+'b'}],touched:false,rewarded:false};}
// Independent random choices; every candidate still passes the actual-physics search.
function randomPillar(id,x,mode,random){
 const practice=mode==='practice',count=random()<.5?1:2,gaps=[];
 if(count===1){const size=(practice?196:168)+random()*40,low=82,high=538-size;const a=low+random()*(high-low);gaps.push({a,b:a+size});}
 else{const one=(practice?142:124)+random()*28,two=(practice?142:124)+random()*28,middle=48+random()*30,total=one+two+middle;const a=75+random()*(470-total);gaps.push({a,b:a+one},{a:a+one+middle,b:a+total});}
 let cursor=CONFIG.top;const segments=[];for(const g of gaps){segments.push({a:cursor,b:g.a,id:id+'s'+segments.length});cursor=g.b;}segments.push({a:cursor,b:CONFIG.bottom,id:id+'s'+segments.length});
 const width=(practice?104:96)+random()*36,groundMaterial=count===1&&random()<.25?'rock':'building',styleSeed=Math.floor(random()*65536),solid=[];
 for(let i=0;i<segments.length;i++){const source=segments[i],a=i===0?0:source.a,b=source.b,parent=source.id,rock=i===segments.length-1&&groundMaterial==='rock';
  const tiers=rock?8:3,breaks=rock?Array.from({length:tiers+1},(_,k)=>a+(b-a)*k/tiers):[a,a+(b-a)*.22,a+(b-a)*.63,b];
  for(let j=0;j<tiers;j++){const t=j/(tiers-1),insetL=rock?width*(.30*(1-t)+.025*Math.abs(Math.sin(j*1.7+styleSeed))):random()*width*.12,insetR=rock?width*(.22*(1-t)+.03*Math.abs(Math.cos(j*1.9+styleSeed))):random()*width*.1;solid.push({a:breaks[j],b:breaks[j+1],left:-width/2+insetL,right:width/2-insetR,id:parent+'p'+j,parent,material:rock?'rock':'building'});}
 }
 return {id,x,width,gaps,segments:solid,architecture:count===2,groundMaterial,styleSeed,touched:false,rewarded:false};
}
function bodyClear(y,e,mode,margin=0){return segmentsOf(e,mode).every(s=>y+CONFIG.radius+margin<=s.a||y-CONFIG.radius-margin>=s.b);}
function overlapsX(x,e,margin=0){return Math.abs(e.x-x)<(e.width??CONFIG.pillarWidth)/2+CONFIG.radius+margin;}
// These are the only foreground solids: rendering, collision and cover share them.
function solidRects(e,mode='practice'){const half=(e.width??CONFIG.pillarWidth)/2;return segmentsOf(e,mode).map(s=>({...s,a:s.a===CONFIG.top?0:s.a,left:e.x+(s.left??-half),right:e.x+(s.right??half)}));}
function collidesBody(x,y,e,mode,margin=0){const r=CONFIG.radius+margin,half=(e.width??CONFIG.pillarWidth)/2;if(Math.abs(e.x-x)>=half+r)return false;for(const s of segmentsOf(e,mode)){if(x+r>e.x+(s.left??-half)&&x-r<e.x+(s.right??half)&&y+r>(s.a===CONFIG.top?0:s.a)&&y-r<s.b)return true;}return false;}
function coverBands(e,mode){const out=[];for(const s of solidRects(e,mode).filter(s=>s.left>=CONFIG.playerX+CONFIG.radius+4&&s.right<=850).sort((a,b)=>a.a-b.a)){const last=out.at(-1);if(last&&Math.abs(last.b-s.a)<1e-6){last.b=s.b;last.left=Math.min(last.left,s.left);last.right=Math.max(last.right,s.right);last.pieces.push(s);}else out.push({...s,pieces:[s]});}return out;}
// Bounded reachable-state search: identical gravity/flap/bounds, explicit input trace.
function findRoute({y,vy,enemies,mode},seconds,options={}) {
 const dt=1/30,speed=CONFIG.modes[mode].speed,r=CONFIG.radius,steps=Math.ceil(seconds/dt),body=r+CONFIG.routeMargin;
 // Obstacle positions depend only on time, not on the candidate player trajectory.
 // Build collision bands once per substep instead of allocating geometry per node.
 const solids=enemies.map(e=>({x:e.x,half:(e.width??CONFIG.pillarWidth)/2,segments:segmentsOf(e,mode)})),bands=[];
 for(let k=0;k<steps*2;k++){const t=(Math.floor(k/2)+1)*dt,st=t-(1-k%2)/60,active=[];
  for(const e of solids){const x=e.x-speed*st;if(Math.abs(x-CONFIG.playerX)>=e.half+body)continue;for(const s of e.segments)if(CONFIG.playerX+body>x+(s.left??-e.half)&&CONFIG.playerX-body<x+(s.right??e.half))active.push({a:s.a===CONFIG.top?0:s.a,b:s.b});}bands.push(active);
 }
 let nodes=[{y,vy,wait:0,parent:null,flap:false}];
 for(let i=1;i<=steps;i++){const t=i*dt,next=new Map();
  for(const n of nodes)for(const flap of [false,true]){if(flap&&n.wait>0)continue;let v=flap?CONFIG.flap:n.vy,py=n.y,blocked=false;
   for(let sub=0;sub<2;sub++){v+=CONFIG.gravity/60;py+=v/60;const st=t-(1-sub)/60;
    if(py>554||py<70||options.band&&st>=options.band.from&&st<=options.band.to&&(py-r<options.band.a||py+r>options.band.b)){blocked=true;break;}
    for(const solid of bands[(i-1)*2+sub])if(py+body>solid.a&&py-body<solid.b){blocked=true;break;}if(blocked)break;
   }if(blocked)continue;
   const wait=flap?.10:Math.max(0,n.wait-dt),key=Math.round(py/5)+','+Math.round(v/32)+','+(wait>0?1:0);if(!next.has(key))next.set(key,{y:py,vy:v,wait,parent:n,flap});
  }
  if(!next.size)return null;const target=options.band&&t<options.band.from?(options.band.a+options.band.b)/2:(options.target??300);
  nodes=[...next.values()].sort((a,b)=>(Math.abs(a.y-target)+Math.abs(a.vy)*.04)-(Math.abs(b.y-target)+Math.abs(b.vy)*.04)).slice(0,100);
 }
 const result=nodes[0],path=[];for(let n=result;n.parent;n=n.parent)path.push(n.flap);path.reverse();return {y:result.y,vy:result.vy,wait:result.wait,path};
}

class Battle {
 constructor(character='gojo',mode='practice',random=Math.random){Object.assign(this,{character,mode,random,state:'battle',hp:CONFIG.hp,boss:CONFIG.bossHP,phase:1,transformed:false,y:300,vy:0,time:0,invulnerable:0,shield:0,cooldown:0,energy:CONFIG.initialEnergy,blackFlash:false,enemies:[],shots:[],effects:[],events:[],combatLog:[],domain:null,cover:null,spawn:1.8,domainTimer:5,coverTimer:CONFIG.coverLearning,quiet:0,auto:.2,suppress:0,scene:0,transition:0,endAge:0,result:null,cast:null,hoverRemaining:0,bossHit:0,bossHitStrong:false,lastFlap:-Infinity,nextId:1,routePostponed:0,coverPostponed:0});this.stats={hits:0,blocks:0,dodges:0,near:0,j:0,k:0,black:0,damage:0,coverDefenses:0,coverWaves:0,coverExposed:0,coverDestroyed:0,sources:{slash:0,pillar:0,'cover slash':0,domain:0,boundary:0}};}
 logCombat(kind,detail={}){this.combatLog.push({kind,time:Number(this.time.toFixed(3)),...detail});this.combatLog=this.combatLog.slice(-128);}
 emit(kind){this.events.push({kind,time:this.time});this.events=this.events.slice(-CONFIG.maxEvents);}
 drainEvents(){const events=this.events;this.events=[];return events;}
 flap(){if(this.state!=='battle')return false;const manualExit=this.hovering;if(!manualExit&&this.time-this.lastFlap<CONFIG.flapDebounce)return false;if(manualExit)this.endHover();this.lastFlap=this.time;this.vy=CONFIG.flap;this.effect('flap',this.y,.28);this.emit('flap');return true;}
 effect(kind,y=this.y,duration=.6){this.effects.push({kind,y,ttl:duration,max:duration});this.effects=this.effects.slice(-CONFIG.maxEffects);}
 damageBoss(amount,strong=false,impactY=300){if(this.state!=='battle'||amount<=0)return;const dealt=Math.min(this.boss,amount);this.bossHit=strong?.32:.16;this.bossHitStrong=strong;this.effect(strong?'bossHeavy':'bossHit',clamp(impactY,240,360),strong?.45:.24);this.emit(strong?'skillImpact':'bossHit');this.stats.damage+=dealt;this.boss-=dealt;if(this.boss<=0){this.finish('victory','boss defeated');return;}if(this.boss<=CONFIG.bossHP/2&&!this.transformed){this.transformed=true;this.state='transform';this.transition=CONFIG.transform;this.enemies=[];this.shots=[];this.domain=null;this.cover=null;this.cast=null;this.endHover();this.emit('transform');this.effect('transform',300,CONFIG.transform);}}
 hit(reason,object){if(this.state!=='battle')return false;if(object)object.touched=true;if(this.hovering||this.invulnerable>0)return false;if(this.character==='gojo'&&this.shield<=0){this.shield=CONFIG.shield;this.invulnerable=CONFIG.protection;this.stats.blocks++;this.effect('shield');this.emit('shield');return false;}this.hp--;this.stats.hits++;this.stats.sources[reason]=(this.stats.sources[reason]||0)+1;this.invulnerable=CONFIG.protection;this.effect('hit');this.emit('hit');if(this.hp<=0)this.finish('defeat',reason);return true;}
 clearSegments(kind,from=120,to=820,impactY=this.y){this.enemies=this.enemies.filter((e,i)=>{
  if(e.x<from||e.x>to)return true;
  if(!e.segments){if(kind==='blue')return !(e.x>=120&&e.x<=470&&Math.abs((e.gapY??300)-impactY)<240);if(kind==='dismantle')return !(e.x>120&&i%2===0);return Math.abs(impactY-(e.gapY??300))+80<CONFIG.modes[this.mode].gap/2;}
  if(e.x<120||e.x>820||kind==='blue'&&e.x>470||kind==='dismantle'&&i%2)return true;let changed=false;
  if(kind==='dismantle'){const nearest=[...e.segments].sort((a,b)=>Math.abs((a.a+a.b)/2-impactY)-Math.abs((b.a+b.b)/2-impactY))[0];e.segments=e.segments.filter(s=>nearest?.parent?s.parent!==nearest.parent:s!==nearest);changed=!!nearest;}
  else {const range=kind==='blue'?110:60,low=impactY-range,high=impactY+range;e.segments=e.segments.flatMap(s=>{if(s.b<=low||s.a>=high)return [s];changed=true;if(kind==='blue')return [];const parts=[];if(s.a<low)parts.push({...s,b:low,id:s.id+'a'});if(s.b>high)parts.push({...s,a:high,id:s.id+'b'});return parts;});}
  if(changed){e.geometryVersion=(e.geometryVersion||0)+1;this.effect('fracture',impactY,.35);this.effects[this.effects.length-1].x=e.x;}
  if(changed&&this.cover&&(this.cover.plannedId==null||this.cover.plannedId===e.id)){this.stats.coverDestroyed++;this.cover.coverChanged=true;this.effect('coverLost');this.emit('coverLost');this.logCombat('highlightedCoverAltered',{pillar:e.id,skill:kind});}return e.segments.length>0;
 });}
 get hovering(){return this.state==='battle'&&this.hoverRemaining>1e-8;}
 endHover(){if(this.hoverRemaining<=0)return false;this.hoverRemaining=0;this.vy=0;return true;}
 skill(which){if(this.state!=='battle'||this.cast||this.hovering)return false;
  if(which==='j'){if(this.cooldown>0)return false;this.cooldown=CONFIG.jCooldown;this.stats.j++;}
  else if(which==='k'){if(this.energy<CONFIG.ultimate)return false;this.energy-=CONFIG.ultimate;this.stats.k++;}else return false;
  const kind=which==='j'?(this.character==='gojo'?'blue':'dismantle'):(this.character==='gojo'?'purple':'yujiDomain');
  this.hoverRemaining=which==='j'?CONFIG.jHover:CONFIG.kHover;this.vy=0;
  this.cast={kind,which,age:0,hover:which==='j'?.25:.7,travel:which==='j'?.55:.65,y:this.y,front:140,hit:false,seen:new Set(),savedVy:this.vy};
  this.effect('activation',this.y,.3);this.emit(which==='j'?'skill':'ultimate');return true;
 }
 advanceCast(realDt){const c=this.cast;if(!c)return;c.age+=realDt;if(Math.abs(c.age-c.hover)<1e-8)c.age=c.hover;
  if(c.age>=c.hover){const progress=clamp((c.age-c.hover)/c.travel,0,1);c.front=140+680*progress;
   if(c.kind!=='yujiDomain')for(const e of [...this.enemies])if(e.x>=120&&e.x<=c.front&&!c.seen.has(e.id??e)){c.seen.add(e.id??e);this.clearSegments(c.kind,e.x-.01,e.x+.01,c.y);}
   if(progress>=1&&!c.hit){c.hit=true;if(c.kind==='dismantle')this.damageBoss(CONFIG.yujiJ,true,c.y);else if(c.kind==='purple')this.damageBoss(CONFIG.gojoK,true,c.y);else if(c.kind==='yujiDomain'){this.scene=CONFIG.suppressDuration;this.suppress=CONFIG.suppressDuration;this.damageBoss(CONFIG.yujiK,true,c.y);}else this.emit('skillImpact');}
  }
  if(this.cast===c&&c.age>=c.hover+c.travel+.4)this.cast=null;
 }
 coverSegments(offset=0){const speed=CONFIG.modes[this.mode].speed;return this.enemies.flatMap(e=>{const x=e.x-speed*offset;if(x>CONFIG.playerX+CONFIG.coverMaxDistance)return [];return coverBands({...e,x},this.mode).filter(s=>s.b-s.a>=CONFIG.radius*2+8).map(s=>({...s,x,pillarId:e.id}));});}
 protectedAt(y,offset=0){return this.coverSegments(offset).some(s=>y-CONFIG.radius>=s.a&&y+CONFIG.radius<=s.b);}
 planCover(){const m=CONFIG.modes[this.mode],impact=m.coverWarning+(930-CONFIG.playerX)/CONFIG.coverSpeed;const candidates=this.coverSegments(impact).filter(s=>s.left-CONFIG.playerX-CONFIG.radius>m.speed*(.5+CONFIG.coverWindow));
  for(const s of candidates.sort((a,b)=>Math.abs((a.a+a.b)/2-this.y)-Math.abs((b.a+b.b)/2-this.y))){const e=this.enemies.find(e=>e.id===s.pillarId),end=Math.max(impact+CONFIG.coverWindow+.15,(e.x+(e.width||40)/2+CONFIG.radius-CONFIG.playerX)/m.speed+.2);const band={a:s.a+3,b:s.b-3,from:impact-1/30,to:impact+CONFIG.coverWindow+1/30};const route=findRoute(this,end,{band,target:this.y});if(route)return {impact,plannedId:s.pillarId,plannedSegment:s.id,plannedBand:{a:s.a,b:s.b},route,escapeEnd:end};}return null;
 }
 beginCover(){if(this.state!=='battle'||this.domain||this.cover||this.quiet>0)return false;const plan=this.planCover();if(!plan){this.coverPostponed++;this.coverTimer=.35;return false;}this.cover={...plan,id:this.nextId++,age:0,resolved:false,coverChanged:false};this.stats.coverWaves++;this.emit('coverWarning');this.logCombat('coverWarning',{wave:this.cover.id,pillar:plan.plannedId});return true;}
 rewardDodge(){this.stats.dodges++;this.energy=Math.min(100,this.energy+CONFIG.energyDodge);}
 finish(outcome,reason){if(this.state!=='battle')return;this.state=outcome;this.endAge=0;this.enemies=[];this.domain=null;this.cover=null;this.shots=[];this.cast=null;this.endHover();this.emit(outcome);const score=Math.round(this.stats.damage+this.stats.dodges*20+this.stats.near*35+this.hp*100+(outcome==='victory'?1000:0));this.result={character:this.character,mode:this.mode,outcome,reason,seconds:Number(this.time.toFixed(1)),score,coverStats:{waves:this.stats.coverWaves,defenses:this.stats.coverDefenses,exposed:this.stats.coverExposed,altered:this.stats.coverDestroyed},coverEvents:this.combatLog.map(e=>({...e}))};}
 pendingRouteBand(){
  if(this.cover){const c=this.cover,e=this.enemies.find(e=>e.id===c.plannedId),s=e&&(c.plannedBand||e.segments?.find(s=>s.id===c.plannedSegment));if(s&&!c.coverChanged)return {band:{a:s.a+3,b:s.b-3,from:Math.max(0,c.impact-c.age-1/30),to:c.impact-c.age+CONFIG.coverWindow+1/30}};}
  if(this.domain){const d=this.domain,m=CONFIG.modes[this.mode];return {band:{a:d.safeY-m.domainGap/2+3,b:d.safeY+m.domainGap/2-3,from:Math.max(0,m.warning-d.age),to:m.warning+CONFIG.domainActive-d.age}};}
  return {};
 }
 spawnPillar(){const m=CONFIG.modes[this.mode];for(let attempt=0;attempt<3;attempt++){const e=randomPillar(this.nextId,930,this.mode,this.random);const horizon=(930+e.width/2+CONFIG.radius-CONFIG.playerX)/m.speed+.1;if(findRoute({...this,enemies:[...this.enemies,e]},horizon,this.pendingRouteBand())){this.enemies.push(e);this.nextId++;this.spawn=m.interval*(.85+this.random()*.3)*(this.phase===2?.76:1)+(e.width-CONFIG.pillarWidth)/m.speed;return true;}}this.routePostponed++;this.spawn=.4;return false;}
 step(dt){
  if(this.state==='victory'||this.state==='defeat'){this.endAge+=dt;return;}if(this.state==='transform'){this.transition-=dt;if(this.transition<=0){this.state='battle';this.phase=2;this.effects=[];this.spawn=1;this.domainTimer=2;this.coverTimer=4;this.quiet=1.5;}return;}
  // Hover windows use wall time; all world clocks use the same slow simulation time.
  // Split at release so cinematic protection never leaks into resumed controls.
  if(this.hovering&&dt>this.hoverRemaining+1e-8){const first=this.hoverRemaining;this.step(first);this.step(dt-first);return;}
  const realDt=dt,hover=this.hovering;dt*=hover?.25:1;
  this.time+=dt;for(const key of ['invulnerable','shield','cooldown','suppress','scene','quiet','bossHit'])this[key]=Math.max(0,this[key]-dt);this.effects.forEach(e=>e.ttl-=dt);this.effects=this.effects.filter(e=>e.ttl>0);if(!hover){this.vy+=CONFIG.gravity*dt;this.y+=this.vy*dt;}
  if(this.y>554){this.y=554;this.vy=-250;this.hit('boundary');}if(this.y<70){this.y=70;this.vy=70;}if(this.state!=='battle')return;
  this.auto-=dt;if(this.auto<=0){this.auto+=CONFIG.normalInterval;let damage=CONFIG.normalDamage;if(this.character==='yuji'){if(this.blackFlash){damage*=3;this.blackFlash=false;this.stats.black++;}}this.shots.push({x:145,y:this.y,damage,black:damage>CONFIG.normalDamage});}
  for(const s of this.shots){s.x+=900*dt;if(s.x>=820){this.energy=Math.min(100,this.energy+CONFIG.energyHit);if(s.black){this.effect('black',s.y,.35);this.emit('black');}this.damageBoss(s.damage,s.black,s.y);s.dead=true;if(this.state!=='battle')return;}}this.shots=this.shots.filter(s=>!s.dead);
  const m=CONFIG.modes[this.mode],rate=this.suppress>0?CONFIG.suppressRate:1;this.spawn-=dt*rate;if(this.spawn<=0)this.spawnPillar();
  for(const e of this.enemies){e.x-=m.speed*dt;if(collidesBody(CONFIG.playerX,this.y,e,this.mode))this.hit(e.segments?'pillar':'slash',e);if(this.state!=='battle')return;
   if(e.x+(e.width??40)/2<CONFIG.playerX-CONFIG.radius&&!e.rewarded){e.rewarded=true;if(!e.touched){this.rewardDodge();const edge=Math.min(...segmentsOf(e,this.mode).flatMap(s=>[Math.abs(this.y-s.a),Math.abs(this.y-s.b)]));if(this.character==='yuji'&&edge>=CONFIG.radius&&edge<=CONFIG.radius+30){this.blackFlash=true;this.stats.near++;this.effect('near');}}}
  }this.enemies=this.enemies.filter(e=>e.x+(e.width??40)/2>-50);
  if(this.cover){const c=this.cover;c.age+=dt;
   if(c.age>=c.impact&&!c.resolved){
    if(c.windowProtected===undefined)c.windowProtected=true;
    if(!this.protectedAt(this.y)){c.windowProtected=false;if(!c.contactResolved){c.contactResolved=true;this.stats.coverExposed++;this.logCombat('coverContact',{wave:c.id,outcome:this.hovering?'cinematic protection':this.invulnerable>0?'hit immunity':this.character==='gojo'&&this.shield<=0?'Infinity':'damage'});this.hit('cover slash');}}
    if(c.age>=c.impact+CONFIG.coverWindow&&this.state==='battle'){
     c.resolved=true;if(c.windowProtected&&!c.contactResolved){this.stats.coverDefenses++;this.rewardDodge();this.effect('coverSuccess');this.emit('coverSuccess');this.logCombat('coverDefense',{wave:c.id});}
    }
   }
   if(c.age>=c.impact+CONFIG.coverWindow&&this.state==='battle'){this.cover=null;this.coverTimer=m.coverInterval+(this.random()-.5)*2;this.quiet=CONFIG.coverRecovery;}
  }
  if(this.state!=='battle')return;
  if(this.domain){this.domain.age+=dt;if(this.domain.age>=m.warning&&Math.abs(this.y-this.domain.safeY)+CONFIG.radius>m.domainGap/2)this.hit('domain');if(this.domain&&this.domain.age>=m.warning+CONFIG.domainActive){this.domain=null;this.quiet=CONFIG.coverRecovery;}}
  if(this.state!=='battle')return;
  if(!this.cover&&!this.domain&&this.quiet<=0){if(this.phase===2){this.domainTimer-=dt*rate;if(this.domainTimer<=0){const next=this.enemies.filter(e=>e.x>104).sort((a,b)=>a.x-b.x)[0],gaps=next?openingsOf(next,this.mode):[{a:190,b:430}];const g=[...gaps].sort((a,b)=>Math.abs((a.a+a.b)/2-this.y)-Math.abs((b.a+b.b)/2-this.y))[0];const safeY=clamp((g.a+g.b)/2,165,455),band={a:safeY-m.domainGap/2+3,b:safeY+m.domainGap/2-3,from:m.warning,to:m.warning+CONFIG.domainActive};if(findRoute(this,m.warning+CONFIG.domainActive+.1,{band})){this.domain={safeY,age:0};this.domainTimer=CONFIG.domainInterval;this.emit('domainWarning');}else this.domainTimer=.4;}}
   if(!this.domain){this.coverTimer-=dt*rate;if(this.coverTimer<=0)this.beginCover();}}
  this.advanceCast(realDt);
  if(hover&&this.state==='battle'){if(this.hoverRemaining-realDt<=1e-8)this.endHover();else this.hoverRemaining-=realDt;}
 }
}
const api={Battle,CONFIG,KEY,validHistory,makePillar,randomPillar,segmentsOf,openingsOf,bodyClear,solidRects,collidesBody,coverBands,findRoute};if(typeof module!=='undefined')module.exports=api;else root.FlappyBattle=api;
})(globalThis);

