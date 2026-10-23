'use strict';
const VISUAL={cameraAmplitude:12,farSpeed:5,midSpeed:13,nearSpeed:27,victoryLead:.8,purpleCut:.23,blackCut:.24};
class BattleView {
 constructor(canvas){this.canvas=canvas;this.c=canvas.getContext('2d');this.camera=0;this.scroll=0;this.lastTime=0;this.current=null;this.trail=[];this.ruinCache=new WeakMap();this.spriteCache=new Map();this.reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change',e=>{this.reduced=e.matches;});
  const names={background:'shinjuku-adapted.png',gojo:'gojo-provisional.png',yuji:'yuji-provisional.png',sukuna1:'sukuna1-provisional.png',sukuna2:'sukuna2-provisional.png',purple:'purple-reference.png',black:'black-flash.png',shared:'E1.jpg',yujiDefeat:'F2.jpg',gojoVictory:'G1.jpg',yujiVictory:'yuji-victory-clean-v2.png'};
  this.images={};for(const [key,name]of Object.entries(names)){const im=new Image();im.src='assets/art/'+name;this.images[key]=im;}
 }
 reset(){this.camera=0;this.scroll=0;this.lastTime=0;this.trail=[];}
 text(t,x,y,size=14,color='#d8e9f4'){this.c.font=`600 ${size}px Segoe UI,Arial`;this.c.fillStyle=color;this.c.fillText(t,x,y);}
 line(x,y,xx,yy,color,width=2){const c=this.c;c.beginPath();c.strokeStyle=color;c.lineWidth=width;c.moveTo(x,y);c.lineTo(xx,yy);c.stroke();}
 circle(x,y,r,color,width=2){const c=this.c;c.beginPath();c.strokeStyle=color;c.lineWidth=width;c.arc(x,y,r,0,Math.PI*2);c.stroke();}
 fit(im,x,y,w,h,crop){if(!im?.complete||!im.naturalWidth)return;const s=crop||[0,0,im.naturalWidth,im.naturalHeight],scale=Math.min(w/s[2],h/s[3]),dw=s[2]*scale,dh=s[3]*scale;this.c.drawImage(im,...s,x+(w-dw)/2,y+(h-dh)/2,dw,dh);}
 sprite(key,x,y,height=100,opacity=1){const c=this.c,im=this.images[key];if(!im?.complete||!im.naturalWidth)return;const id=key+':'+height;let bitmap=this.spriteCache.get(id);if(!bitmap){bitmap=document.createElement('canvas');bitmap.width=Math.ceil(height*2.2);bitmap.height=Math.ceil(height*2);const context=bitmap.getContext('2d'),scale=Math.min(bitmap.width/im.naturalWidth,bitmap.height/im.naturalHeight),w=im.naturalWidth*scale,h=im.naturalHeight*scale;context.drawImage(im,(bitmap.width-w)/2,(bitmap.height-h)/2,w,h);if(this.spriteCache.size>=48)this.spriteCache.delete(this.spriteCache.keys().next().value);this.spriteCache.set(id,bitmap);}c.save();c.globalAlpha=opacity;c.drawImage(bitmap,x-height*.55,y-height/2,height*1.1,height);c.restore();}
 background(b){const c=this.c,im=this.images.background;c.fillStyle='#182535';c.fillRect(0,0,960,600);
  if(im.complete&&im.naturalWidth){const w=1440,h=w*im.naturalHeight/im.naturalWidth,pos=this.scroll*VISUAL.farSpeed%(w*2);for(let i=-1;i<3;i++){if(i*w-pos+w<0||i*w-pos>960)continue;c.save();c.translate(i*w-pos,-70+this.camera*.25);if(Math.abs(i)%2){c.translate(w,0);c.scale(-1,1);}c.drawImage(im,0,0,w,h);c.restore();}}
  c.fillStyle='#07112178';c.fillRect(0,0,960,600);
  for(let i=-1;i<12;i++){const x=i*115-this.scroll*VISUAL.midSpeed%115,h=70+Math.abs(i*71%120),y=580-h+this.camera*.65;c.fillStyle='#1c2c3a88';c.beginPath();c.moveTo(x,y+14);c.lineTo(x+48,y);c.lineTo(x+72,y+25);c.lineTo(x+72,580);c.lineTo(x,580);c.fill();for(let j=0;j<3;j++)this.line(x+8+j*15,y+15,x+6+j*15,y+55,'#607f8b44',2);}
  for(let i=-1;i<24;i++){const x=i*50-this.scroll*VISUAL.nearSpeed%50,y=576+(i%3)*4+this.camera;c.fillStyle='#0e1925cc';c.beginPath();c.moveTo(x,y+20);c.lineTo(x+14,y-8);c.lineTo(x+38,y);c.lineTo(x+50,y+20);c.fill();}
  if(b?.scene>0){c.save();c.globalAlpha=Math.min(1,b.scene/.8);c.fillStyle='#9d172528';c.fillRect(0,0,960,600);this.text('領域展開 / SOUL BOUNDARY',520,535,22,'#f9a2b5');c.restore();}
 }
 polygon(points,fill,stroke){const c=this.c;c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=1;c.stroke();}}
 outlineSolids(parts,color,width=1){const c=this.c,ordered=[...parts].sort((u,v)=>u.a-v.a);if(!ordered.length)return;c.beginPath();c.moveTo(ordered[0].left,ordered[0].a);for(const s of ordered){c.lineTo(s.left,s.a);c.lineTo(s.left,s.b);}for(const s of [...ordered].reverse()){c.lineTo(s.right,s.b);c.lineTo(s.right,s.a);}c.closePath();c.strokeStyle=color;c.lineWidth=width;c.stroke();}
 ruinSection(e,parts){const c=this.c,a=Math.min(...parts.map(s=>s.a)),b=Math.max(...parts.map(s=>s.b)),left=Math.min(...parts.map(s=>s.left)),right=Math.max(...parts.map(s=>s.right)),w=right-left,rock=parts[0].material==='rock',seed=e.styleSeed||e.id||1;
  c.save();c.beginPath();for(const s of parts)c.rect(s.left,s.a,s.right-s.left,s.b-s.a);c.clip();
  const front=c.createLinearGradient(left,a,right,b);front.addColorStop(0,rock?'#87918e':'#8e979c');front.addColorStop(.48,rock?'#586875':'#667783');front.addColorStop(1,'#273848');c.fillStyle=front;c.fillRect(left,a,w,b-a);
  // A deep shaded return wall and light-facing facade give substantial volume.
  this.polygon([[right-w*.25,a],[right,a],[right,b],[right-w*.25,b-8]],'#263543');this.line(right-w*.25,a,right-w*.25,b,'#a6b0ac66',1);
  if(rock){const levels=4;for(let i=0;i<levels;i++){const y=a+(b-a)*i/levels;this.polygon([[left,y+12],[left+w*.40,y-10],[right-w*.17,y+8],[right-w*.28,y+(b-a)/levels],[left+w*.18,y+(b-a)/levels+9]],['#667989','#526779','#7d8b8e','#48596b'][i],'#a0a6a166');}this.polygon([[left,a],[left+w*.55,a+6],[left+w*.34,a+(b-a)*.4],[left+w*.08,a+(b-a)*.51]],'#9daba5aa');for(let i=0;i<3;i++){const y=a+20+(b-a)*i/4;this.line(left+w*.23,y,left+w*.56,y+19,'#233342',3);this.line(left+w*.56,y+19,left+w*.49,y+34,'#233342',2);}}
  else{const floor=38;for(let y=Math.floor(a/floor)*floor;y<b;y+=floor){c.fillStyle='#273744';c.fillRect(left,y+29,w,7);c.fillStyle='#a2a9a5';c.fillRect(left,y+28,w*.75,2);c.fillStyle='#172939';c.fillRect(right-w*.25,y+31,w*.25,5);
    const columns=Math.max(2,Math.floor(w/25));for(let i=0;i<columns;i++){const x=left+7+i*(w*.70/columns),ww=w*.70/columns-7;if(((i+Math.floor(y/38)+seed)%5)===0){this.polygon([[x-2,y+5],[x+ww+3,y+3],[x+ww,y+24],[x+2,y+22]],'#192a37');}else{c.fillStyle='#1a2d3d';c.fillRect(x,y+7,ww,17);this.line(x+2,y+8,x+ww-2,y+8,'#7d9aa24d',1);this.line(x+ww/2,y+8,x+ww/2,y+23,'#425765',1);}}
   }
   // Broad missing plaster and irregular wall exposures, not a repeated crack overlay.
   this.polygon([[left+w*.08,a+13],[left+w*.41,a+6],[left+w*.51,a+30],[left+w*.30,a+51],[left+w*.10,a+40]],'#a4aaa099');
   this.polygon([[right-w*.48,b-72],[right-w*.25,b-90],[right-w*.24,b-23],[right-w*.56,b-15]],'#344c5a');
  }
  // Restrained aggregate and chipped plaster remain inside the physical surface.
  for(let i=0;i<Math.min(90,(b-a)*.35);i++){const u=Math.abs(Math.sin(seed+i*12.9898)),v=Math.abs(Math.sin(seed*.7+i*7.137));c.fillStyle=i%3?'#d0c5aa33':'#1a2b3b55';c.fillRect(left+u*w,a+v*(b-a),1+(i%2),1+(i%3));}
  // Thick broken concrete/stone end faces, clipped to the same collision solids.
  for(const [y,dir]of [[a,1],[b,-1]]){if(y===0||y===565)continue;const depth=rock?13:11;this.polygon([[left,y],[right,y],[right-w*.12,y+dir*depth],[left+w*.10,y+dir*(depth+3)]],rock?'#a0aaa0':'#a8aca2','#c1bdb077');for(let i=0;i<5;i++){const x=left+9+i*(w-18)/5;this.line(x,y+dir*3,x+4,y+dir*13,'#525e60',2);if(!rock)this.line(x+3,y+dir*9,x+1,y+dir*23,'#7f7770',1.5);}}
  c.restore();
  // The fine silhouette follows every physical step; texture/rebar adds no hitboxes.
  const ordered=[...parts].sort((u,v)=>u.a-v.a);c.beginPath();c.moveTo(ordered[0].left,a);for(const s of ordered){c.lineTo(s.left,s.a);c.lineTo(s.left,s.b);}for(const s of [...ordered].reverse()){c.lineTo(s.right,s.b);c.lineTo(s.right,s.a);}c.closePath();c.strokeStyle='#abb7b388';c.lineWidth=1;c.stroke();
 }
 pillar(e,b){const half=Math.ceil((e.width??40)*.72)+10;if(e.x+half<0||e.x-half>960)return;let entry=this.ruinCache.get(e);const version=e.geometryVersion||0;
  if(!entry||entry.version!==version||entry.segments!==e.segments){const bitmap=document.createElement('canvas');bitmap.width=half*4;bitmap.height=1200;const context=bitmap.getContext('2d'),original=this.c;context.scale(2,2);context.translate(half-e.x,0);this.c=context;try{this.paintPillar(e,b);}finally{this.c=original;}entry={bitmap,half,version,segments:e.segments};this.ruinCache.set(e,entry);}
  this.c.drawImage(entry.bitmap,e.x-entry.half,0,entry.half*2,600);
 }
 paintPillar(e,b){const c=this.c,rects=FlappyBattle.solidRects(e,b.mode),w=e.width??40;
  // Recessed remains connect double breaches, but are deliberately not solid geometry.
  if(e.architecture&&rects.length){c.save();c.globalAlpha=.55;const x=e.x-w*.43;c.fillStyle='#334657';c.fillRect(x,0,10,565);c.fillRect(e.x+w*.32,0,12,565);this.line(x+10,0,x+10,565,'#78939b66',1);for(let y=20;y<565;y+=76){this.line(x,y,e.x+w*.41,y+16,'#61788988',3);this.line(x,y+8,e.x+w*.41,y+58,'#40556a77',2);}c.restore();}
  if(rects.some(s=>s.b===565)){c.save();c.fillStyle='#080e1b88';c.beginPath();c.ellipse(e.x,567,w*.68,10,0,0,7);c.fill();c.restore();}
  const groups=new Map();for(const r of rects){const id=r.parent||r.id||r.a;if(!groups.has(id))groups.set(id,[]);groups.get(id).push(r);}for(const parts of groups.values())this.ruinSection(e,parts);
  if(rects.some(s=>s.b===565)){for(let i=0;i<5;i++){const x=e.x-w*.4+i*w*.19;this.polygon([[x-6,568],[x-2,561+(i%2)*3],[x+7,568]],i%2?'#485969':'#6b7779');}}
  for(const g of FlappyBattle.openingsOf(e,b.mode)){for(const y of [g.a,g.b]){this.line(e.x-w*.46,y,e.x+w*.46,y,'#6ca99c88',1.2);}}
 }
 cover(b){const c=this.c,event=b.cover;if(!event)return;const m=FlappyBattle.CONFIG.modes[b.mode],warning=event.age<m.coverWarning;
  // Only actual forward foreground solids project cover. Rear braces never appear here.
  for(const s of b.coverSegments()){c.fillStyle=s.pillarId===event.plannedId?'#edb66d20':'#edb66d10';c.fillRect(0,s.a,s.left,s.b-s.a);c.strokeStyle='#e5bd79bb';c.lineWidth=2;this.outlineSolids(s.pieces||[s],'#e5bd79bb',2);for(let x=10;x<s.left-15;x+=55)this.line(x,s.a+3,x-15,Math.min(s.b,s.a+18),'#e9bd7640',1);}
  const any=b.coverSegments().some(s=>b.y-16>=s.a&&b.y+16<=s.b);this.text(warning?`COVER SLASH · ${Math.max(0,event.impact-event.age).toFixed(1)}s · HIDE IN AMBER SHADOW`:'COVER SLASH / CUTTING WAVE',155,40,15,'#ffe0a0');
  this.text(event.coverChanged?'COVER BROKEN · FIND ANOTHER SOLID SEGMENT':any?'SOLID COVER · STAY UNTIL THE WAVE PASSES':'OPENINGS DO NOT BLOCK THIS SLASH',200,62,11,event.coverChanged?'#ff9d99':'#ffe0a0');
  if(!warning){const xx=930-(event.age-m.coverWarning)*FlappyBattle.CONFIG.coverSpeed;c.save();c.shadowColor='#ff8b9d';c.shadowBlur=16;for(let y=55;y<565;y+=5){const blocked=b.coverSegments().some(s=>s.x>xx&&y>=s.a&&y<=s.b);if(!blocked)this.line(xx,y,xx-12,y+5,'#ffdce0',6);}c.restore();}
 }
 domain(b){if(!b.domain)return;const c=this.c,m=FlappyBattle.CONFIG.modes[b.mode],d=b.domain,active=d.age>=m.warning,a=d.safeY-m.domainGap/2,z=d.safeY+m.domainGap/2;c.fillStyle=active?'#f739554b':'#e68f3530';c.fillRect(0,55,960,a-55);c.fillRect(0,z,960,565-z);this.line(0,a,960,a,'#63ffe5',3);this.line(0,z,960,z,'#63ffe5',3);this.text(active?'伏魔御厨子 / ACTIVE':'伏魔御厨子 / WARNING — MOVE TO CYAN LANE',180,38,16,'#ffe2c1');}
 skillCast(b){const k=b.cast;if(!k)return;const c=this.c,t=k.age,wind=t<k.hover,progress=Math.max(0,Math.min(1,(t-k.hover)/k.travel)),color=k.kind==='blue'?'#79dcff':k.kind==='purple'?'#c98aff':'#ff8595',fade=Math.min(1,(k.hover+k.travel+.4-t)/.4);c.save();c.globalAlpha=fade;
  if(wind){const r=12+24*t/k.hover;this.circle(140,k.y,r,color,4);for(let i=0;i<8;i++){const a=i*Math.PI/4+t*8;this.line(140+Math.cos(a)*(60-r/2),k.y+Math.sin(a)*(60-r/2),140+Math.cos(a)*r,k.y+Math.sin(a)*r,color,2);}if(b.hovering)this.text('SUSPENDED',75,k.y-72,10,color);}
  else if(k.kind==='blue'){const x=Math.min(350,k.front);this.circle(x,k.y,22+progress*16,color,7);for(let i=0;i<9;i++){const a=i*.7+t*12;this.line(x+Math.cos(a)*75,k.y+Math.sin(a)*64,x+Math.cos(a+.5)*24,k.y+Math.sin(a+.5)*24,color,2);c.fillStyle='#abb4b9';c.fillRect(x+Math.cos(a)*55,k.y+Math.sin(a)*50,5,4);}this.line(140,k.y,x,k.y,'#5fc6ff45',18);this.line(x,k.y,Math.min(470,k.front),k.y,'#a6edff99',6);}
  else if(k.kind==='purple'){this.line(140,k.y,k.front,k.y,'#9b3eff44',68);this.line(140,k.y,k.front,k.y,'#be80f4aa',35);this.line(140,k.y,k.front,k.y,'#f5deff',8);c.fillStyle='#ecd7ff';c.beginPath();c.arc(k.front,k.y,22,0,7);c.fill();this.circle(k.front,k.y,30,color,5);}
  else if(k.kind==='dismantle'){for(let i=0;i<3;i++){const x=k.front-i*22;this.line(x-48,k.y-65+i*15,x+12,k.y+60-i*15,color,3-i*.6);}this.sprite('yuji',Math.min(k.front,800),k.y,95,.4);}
  else {const radius=progress*760;c.fillStyle='#a2223820';c.beginPath();c.arc(140,k.y,radius,0,7);c.fill();this.circle(140,k.y,radius,'#ff8d9a99',8);this.circle(140,k.y,Math.max(0,radius-20),'#fed0d455',2);this.text('領域展開 / EXPANDING',235,110,20,color);}
  if(k.kind==='purple'&&wind){c.save();c.beginPath();c.rect(525,75,405,215);c.clip();this.fit(this.images.purple,525,75,405,215,[0,30,474,277]);c.restore();this.text('虚式·茈',560,315,25,'#fff');}c.restore();
 }
 draw(b,selected,dt,paused){const c=this.c;if(this.current!==b){this.current=b;this.reset();}const active=b?.state==='battle'&&!paused,delta=active?Math.max(0,b.time-this.lastTime):0;this.lastTime=b?.time||0;if(active&&!this.reduced){this.scroll+=delta;const target=(b.y-300)/254*VISUAL.cameraAmplitude;this.camera+=(target-this.camera)*(1-Math.exp(-delta*4));}if(active){this.trail=this.trail.map(p=>({...p,age:p.age+delta})).filter(p=>p.age<.25);if(b.effects.some(e=>e.kind==='flap'))this.trail.push({x:140,y:b.y,age:0});this.trail=this.trail.slice(-16);}c.clearRect(0,0,960,600);this.background(b);if(!b){this.sprite(selected,140,320,125);this.sprite('sukuna1',840,310,150);return;}
  this.domain(b);for(const e of b.enemies)this.pillar(e,b);this.cover(b);
  const color=b.character==='gojo'?'#81cfff':'#fb768a';for(const p of this.trail){c.globalAlpha=(1-p.age/.25)*.5;this.circle(140-p.age*160,p.y,4+p.age*10,color,3);}c.globalAlpha=1;
  for(const s of b.shots){if(b.character==='gojo'){this.line(s.x-32,s.y,s.x,s.y,'#68bbff55',10);this.line(s.x-20,s.y,s.x,s.y,'#84e4ffbb',4);c.fillStyle='#efffff';c.beginPath();c.arc(s.x,s.y,5,0,7);c.fill();this.circle(s.x,s.y,9,'#80ceff88',2);}else{this.sprite('yuji',s.x-20,s.y,65,.30);this.line(s.x-40,s.y-10,s.x+10,s.y-6,s.black?'#ff294b':'#ffbba1',3);this.line(s.x-35,s.y+12,s.x+14,s.y+7,'#ffe4ceaa',2);}}
  this.skillCast(b);
  const reaction=this.reduced?0:Math.sin(b.bossHit*65)*Math.min(7,b.bossHit*24);this.sprite(b.phase===1?'sukuna1':'sukuna2',843+reaction,300,b.phase===1?150:175);if(b.bossHit>0){c.save();c.globalAlpha=Math.min(.35,b.bossHit);this.circle(843,300,b.bossHitStrong?60:40,'#fff3d4',12);c.restore();}this.text(b.phase===1?'MEGUMI INCARNATION':'FOUR-ARMED TRUE FORM',750,415,10,'#ffc2c9');
  if(b.invulnerable<=0||Math.floor(b.time*20)%2===0)this.sprite(b.character,140,b.y,106);this.circle(140,b.y,16,'#f5ffffcc',1.4);c.fillStyle='#fff';c.fillRect(138,b.y-2,4,4);
  if(b.character==='gojo'&&b.shield<=0)this.circle(140,b.y,32,'#91eaff77',2);
  for(const e of b.effects){const a=e.ttl/e.max,p=1-a;c.save();c.globalAlpha=a;
   if(e.kind==='bossHit'||e.kind==='bossHeavy'){const strong=e.kind==='bossHeavy';for(let i=0;i<(strong?12:6);i++){const angle=i*2.4;this.line(835+Math.cos(angle)*8,e.y+Math.sin(angle)*8,835+Math.cos(angle)*(15+p*(strong?65:28)),e.y+Math.sin(angle)*(15+p*(strong?65:28)),strong?'#ff9fa7':'#ffe7ad',strong?3:2);}if(strong)this.circle(835,e.y,12+p*45,'#ff919e',3);}
   else if(e.kind==='activation'){this.circle(140,e.y,18+p*16,color,3);}
   else if(e.kind==='fracture'){for(let i=0;i<8;i++){const angle=i*2.4;c.fillStyle=i%2?'#b9bdc3':'#62727b';c.fillRect((e.x||300)+Math.cos(angle)*p*55,e.y+Math.sin(angle)*p*65,4+2*a,4+2*a);}}
   else if(e.kind==='flap'){this.circle(140,e.y+33,5+p*20,color,2);for(let i=0;i<5;i++)this.line(132+i*4,e.y+32,124+i*8,e.y+39+p*18,color,1.5);}
   else if(e.kind==='blue'){c.strokeStyle='#67d8ff';c.lineWidth=9;c.beginPath();c.arc(320,e.y,25+p*65,b.time*5,b.time*5+5);c.stroke();for(let i=0;i<6;i++)this.line(320+Math.cos(i)*120,e.y+Math.sin(i)*100,320+Math.cos(i)*35,e.y+Math.sin(i)*30,'#65cfff88',2);}
   else if(e.kind==='purple'&&p>VISUAL.purpleCut){this.line(150,e.y,880,e.y,'#b476eeb0',65);this.line(150,e.y,880,e.y,'#f8dfff',12);}
   else if(e.kind==='punch'||e.kind==='black'){for(let i=0;i<4;i++)this.sprite('yuji',290+i*155,e.y,95,a*.65);if(e.kind==='black'){for(let i=0;i<8;i++){const a=i*.8;this.line(820,e.y,820+Math.cos(a)*(25+p*60),e.y+Math.sin(a)*(25+p*60),'#070911',9);this.line(820,e.y,820+Math.cos(a)*(25+p*60),e.y+Math.sin(a)*(25+p*60),'#ff254c',3);}}if(e.kind==='black')this.text('黒閃 / BLACK FLASH',310,e.y-65,24,'#ff7994');}
   else if(e.kind==='dismantle'){this.line(230,e.y-80,870,e.y+80,'#ffc7ba',5);this.line(230,e.y+80,870,e.y-80,'#ff8e97',5);}
   else if(['shield','hit','near','coverSuccess','coverLost'].includes(e.kind)){const labels={shield:'INFINITY BLOCK',hit:'−1 HP',near:'BLACK FLASH READY',coverSuccess:'COVER DEFENSE +20',coverLost:'COVER DESTROYED'};this.text(labels[e.kind],75,e.y-62,15,e.kind==='coverSuccess'?'#ffe3a1':color);}
   c.restore();
  }
  const cut=b.effects.find(e=>e.kind==='purple'&&1-e.ttl/e.max<VISUAL.purpleCut||e.kind==='black');if(cut){c.save();const progress=1-cut.ttl/cut.max;c.globalAlpha=.88;const im=cut.kind==='purple'?this.images.purple:this.images.black;c.beginPath();c.rect(525,75,405,215);c.clip();const zoom=this.reduced?0:Math.min(progress,.3)*.12;this.fit(im,525-405*zoom/2,75-215*zoom/2,405*(1+zoom),215*(1+zoom),cut.kind==='purple'?[0,30,474,277]:undefined);c.restore();this.text(cut.kind==='purple'?'虚式·茈':'黒閃',560,315,25,'#fff');if(!this.reduced)this.line(550,320,900,320,color,3);}
  if(b.state==='transform'){c.fillStyle='#090d1bdb';c.fillRect(0,0,960,600);this.sprite('sukuna2',480,255,340);this.text('REINCARNATION',340,470,28,'#ffc6d0');this.text('Combat and all temporary timers paused',332,500,15);}
  this.line(0,565,960,565,'#607989',2);this.text('CORE CIRCLE = COLLISION BODY',20,588,10,'#acbdcd');this.text('AI RECONSTRUCTION · SELECTED SPRITES PENDING',620,588,9,'#acbdcd');
 }
 drawCG(canvas,b){if(!b?.result)return;const c=canvas.getContext('2d');c.fillStyle='#121a25';c.fillRect(0,0,canvas.width,canvas.height);let key,crop;
  if(b.state==='victory'&&b.endAge<VISUAL.victoryLead)key='shared';else if(b.state==='victory'){key=b.character==='gojo'?'gojoVictory':'yujiVictory';if(b.character==='gojo')crop=[0,142,750,305];}else if(b.character==='yuji'){key='yujiDefeat';crop=[15,32,1570,665];}else key='gojo';
  const im=this.images[key];if(im?.complete&&im.naturalWidth){const s=crop||[0,0,im.naturalWidth,im.naturalHeight],scale=Math.min(canvas.width/s[2],canvas.height/s[3])*(this.reduced?1:1+Math.min(b.endAge,2)*.008),w=s[2]*scale,h=s[3]*scale;c.drawImage(im,...s,(canvas.width-w)/2,(canvas.height-h)/2,w,h);}
  if(b.state==='defeat'&&b.character==='gojo'){c.fillStyle='#fff';c.font='16px Segoe UI';c.fillText('F1 UNAVAILABLE · PROVISIONAL ART',20,canvas.height-20);}
 }
}
