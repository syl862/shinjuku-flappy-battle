'use strict';
const VISUAL={cameraAmplitude:12,farSpeed:5,midSpeed:13,nearSpeed:27,victoryLead:.8,purpleCut:.23,blackCut:.24};
class BattleView {
 constructor(canvas){this.canvas=canvas;this.c=canvas.getContext('2d');this.camera=0;this.scroll=0;this.lastTime=0;this.current=null;this.trail=[];this.reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change',e=>{this.reduced=e.matches;});
  const names={background:'shinjuku-adapted.png',gojo:'gojo-provisional.png',yuji:'yuji-provisional.png',sukuna1:'sukuna1-provisional.png',sukuna2:'sukuna2-provisional.png',purple:'purple-reference.png',black:'black-flash.png',shared:'E1.jpg',yujiDefeat:'F2.jpg',gojoVictory:'G1.jpg',yujiVictory:'yuji-victory-clean-v2.png'};
  this.images={};for(const [key,name]of Object.entries(names)){const im=new Image();im.src='assets/art/'+name;this.images[key]=im;}
 }
 reset(){this.camera=0;this.scroll=0;this.lastTime=0;this.trail=[];}
 text(t,x,y,size=14,color='#d8e9f4'){this.c.font=`600 ${size}px Segoe UI,Arial`;this.c.fillStyle=color;this.c.fillText(t,x,y);}
 line(x,y,xx,yy,color,width=2){const c=this.c;c.beginPath();c.strokeStyle=color;c.lineWidth=width;c.moveTo(x,y);c.lineTo(xx,yy);c.stroke();}
 circle(x,y,r,color,width=2){const c=this.c;c.beginPath();c.strokeStyle=color;c.lineWidth=width;c.arc(x,y,r,0,Math.PI*2);c.stroke();}
 fit(im,x,y,w,h,crop){if(!im?.complete||!im.naturalWidth)return;const s=crop||[0,0,im.naturalWidth,im.naturalHeight],scale=Math.min(w/s[2],h/s[3]),dw=s[2]*scale,dh=s[3]*scale;this.c.drawImage(im,...s,x+(w-dw)/2,y+(h-dh)/2,dw,dh);}
 sprite(key,x,y,height=100,opacity=1){const c=this.c,im=this.images[key];c.save();c.globalAlpha=opacity;this.fit(im,x-height*.55,y-height/2,height*1.1,height);c.restore();}
 background(b){const c=this.c,im=this.images.background;c.fillStyle='#182535';c.fillRect(0,0,960,600);
  if(im.complete&&im.naturalWidth){const w=1440,h=w*im.naturalHeight/im.naturalWidth,pos=this.scroll*VISUAL.farSpeed%(w*2);for(let i=-1;i<3;i++){c.save();c.translate(i*w-pos,-70+this.camera*.25);if(Math.abs(i)%2){c.translate(w,0);c.scale(-1,1);}c.drawImage(im,0,0,w,h);c.restore();}}
  c.fillStyle='#07112178';c.fillRect(0,0,960,600);
  for(let i=-1;i<12;i++){const x=i*115-this.scroll*VISUAL.midSpeed%115,h=70+Math.abs(i*71%120),y=580-h+this.camera*.65;c.fillStyle='#1c2c3a88';c.beginPath();c.moveTo(x,y+14);c.lineTo(x+48,y);c.lineTo(x+72,y+25);c.lineTo(x+72,580);c.lineTo(x,580);c.fill();for(let j=0;j<3;j++)this.line(x+8+j*15,y+15,x+6+j*15,y+55,'#607f8b44',2);}
  for(let i=-1;i<24;i++){const x=i*50-this.scroll*VISUAL.nearSpeed%50,y=576+(i%3)*4+this.camera;c.fillStyle='#0e1925cc';c.beginPath();c.moveTo(x,y+20);c.lineTo(x+14,y-8);c.lineTo(x+38,y);c.lineTo(x+50,y+20);c.fill();}
  if(b?.scene>0){c.fillStyle='#9d172528';c.fillRect(0,0,960,600);this.text('領域展開 / SOUL BOUNDARY',520,535,22,'#f9a2b5');}
 }
 pillar(e,b){const c=this.c,w=e.width??40,x=e.x-w/2;
  for(const s of FlappyBattle.segmentsOf(e,b.mode)){const h=s.b-s.a;c.save();c.beginPath();c.rect(x,s.a,w,h);c.clip();const gr=c.createLinearGradient(x,0,x+w,0);gr.addColorStop(0,'#354450');gr.addColorStop(.55,'#74838a');gr.addColorStop(1,'#2e3a46');c.fillStyle=gr;c.fillRect(x,s.a,w,h);for(let j=0;j<h;j+=28){this.line(x+4,s.a+j,x+24,s.a+j+9,'#162430',2);this.line(x+24,s.a+j+9,x+15,s.a+j+23,'#162430',2);}for(let j=0;j<4;j++){const xx=x+5+j*9;this.line(xx,s.a,xx+2,s.a+12,'#a69b87',2);this.line(xx,s.b-10,xx-2,s.b,'#a69b87',2);}c.restore();c.strokeStyle='#c4d2d7';c.lineWidth=1;c.strokeRect(x,s.a,w,h);}
  FlappyBattle.openingsOf(e,b.mode).forEach((g,i)=>{this.line(x-5,g.a,x+w+5,g.a,'#71f9df',3);this.line(x-5,g.b,x+w+5,g.b,'#71f9df',3);this.text('PASS '+(i+1),x-8,(g.a+g.b)/2,10,'#92ffe7');});
 }
 cover(b){const c=this.c,event=b.cover;if(!event)return;const m=FlappyBattle.CONFIG.modes[b.mode],warning=event.age<m.coverWarning;
  const planned=b.enemies.find(e=>e.id===event.plannedId);
  if(planned)for(const s of FlappyBattle.segmentsOf(planned,b.mode)){if(s.b-s.a<40)continue;c.fillStyle='#edb66d20';c.fillRect(0,s.a,planned.x-20,s.b-s.a);c.strokeStyle='#ffd58c';c.lineWidth=3;c.strokeRect(planned.x-20,s.a,planned.width||40,s.b-s.a);for(let x=10;x<planned.x-40;x+=45)this.line(x,s.a+3,x-20,Math.min(s.b,s.a+25),'#e9bd7655',1);}
  const any=b.coverSegments().some(s=>b.y-16>=s.a&&b.y+16<=s.b);this.text(warning?`COVER SLASH · ${Math.max(0,event.impact-event.age).toFixed(1)}s · HIDE IN AMBER SHADOW`:'COVER SLASH / CUTTING WAVE',155,40,15,'#ffe0a0');
  this.text(event.coverChanged?'COVER BROKEN · FIND ANOTHER SOLID SEGMENT':any?'SOLID COVER · STAY UNTIL THE WAVE PASSES':'OPENINGS DO NOT BLOCK THIS SLASH',200,62,11,event.coverChanged?'#ff9d99':'#ffe0a0');
  if(!warning){const xx=930-(event.age-m.coverWarning)*FlappyBattle.CONFIG.coverSpeed;c.save();c.shadowColor='#ff8b9d';c.shadowBlur=16;for(let y=55;y<565;y+=5){const blocked=b.coverSegments().some(s=>s.x>xx&&y>=s.a&&y<=s.b);if(!blocked)this.line(xx,y,xx-12,y+5,'#ffdce0',6);}c.restore();}
 }
 domain(b){if(!b.domain)return;const c=this.c,m=FlappyBattle.CONFIG.modes[b.mode],d=b.domain,active=d.age>=m.warning,a=d.safeY-m.domainGap/2,z=d.safeY+m.domainGap/2;c.fillStyle=active?'#f739554b':'#e68f3530';c.fillRect(0,55,960,a-55);c.fillRect(0,z,960,565-z);this.line(0,a,960,a,'#63ffe5',3);this.line(0,z,960,z,'#63ffe5',3);this.text(active?'伏魔御厨子 / ACTIVE':'伏魔御厨子 / WARNING — MOVE TO CYAN LANE',180,38,16,'#ffe2c1');}
 draw(b,selected,dt,paused){const c=this.c;if(this.current!==b){this.current=b;this.reset();}const active=b?.state==='battle'&&!paused,delta=active?Math.max(0,b.time-this.lastTime):0;this.lastTime=b?.time||0;if(active&&!this.reduced){this.scroll+=delta;const target=(b.y-300)/254*VISUAL.cameraAmplitude;this.camera+=(target-this.camera)*(1-Math.exp(-delta*4));}if(active){this.trail=this.trail.map(p=>({...p,age:p.age+delta})).filter(p=>p.age<.25);if(b.effects.some(e=>e.kind==='flap'))this.trail.push({x:140,y:b.y,age:0});this.trail=this.trail.slice(-16);}c.clearRect(0,0,960,600);this.background(b);if(!b){this.sprite(selected,140,320,125);this.sprite('sukuna1',840,310,150);return;}
  this.domain(b);for(const e of b.enemies)this.pillar(e,b);this.cover(b);
  const color=b.character==='gojo'?'#81cfff':'#fb768a';for(const p of this.trail){c.globalAlpha=(1-p.age/.25)*.5;this.circle(140-p.age*160,p.y,4+p.age*10,color,3);}c.globalAlpha=1;
  for(const s of b.shots){c.fillStyle=color;c.beginPath();c.arc(s.x,s.y,5,0,7);c.fill();}
  this.sprite(b.phase===1?'sukuna1':'sukuna2',843,300,b.phase===1?150:175);this.text(b.phase===1?'MEGUMI INCARNATION':'FOUR-ARMED TRUE FORM',750,415,10,'#ffc2c9');
  if(b.invulnerable<=0||Math.floor(b.time*20)%2===0)this.sprite(b.character,140,b.y,106);this.circle(140,b.y,16,'#f5ffffcc',1.4);c.fillStyle='#fff';c.fillRect(138,b.y-2,4,4);
  if(b.character==='gojo'&&b.shield<=0)this.circle(140,b.y,32,'#91eaff77',2);
  for(const e of b.effects){const a=e.ttl/e.max,p=1-a;c.save();c.globalAlpha=a;
   if(e.kind==='flap'){this.circle(140,e.y+33,5+p*20,color,2);for(let i=0;i<5;i++)this.line(132+i*4,e.y+32,124+i*8,e.y+39+p*18,color,1.5);}
   else if(e.kind==='blue'){c.strokeStyle='#67d8ff';c.lineWidth=9;c.beginPath();c.arc(320,e.y,25+p*65,b.time*5,b.time*5+5);c.stroke();for(let i=0;i<6;i++)this.line(320+Math.cos(i)*120,e.y+Math.sin(i)*100,320+Math.cos(i)*35,e.y+Math.sin(i)*30,'#65cfff88',2);}
   else if(e.kind==='purple'&&p>VISUAL.purpleCut){this.line(150,e.y,880,e.y,'#b476eeb0',65);this.line(150,e.y,880,e.y,'#f8dfff',12);}
   else if(e.kind==='punch'||e.kind==='black'){for(let i=0;i<4;i++)this.sprite('yuji',290+i*155,e.y,95,a*.65);if(e.kind==='black')this.text('黒閃 / BLACK FLASH',310,e.y-65,24,'#ff7994');}
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
