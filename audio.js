'use strict';
// One lazily unlocked context; music remains a separate HTMLAudioElement.
class BattleSound {
 constructor(){this.context=null;this.master=null;this.enabled=true;this.volume=.32;this.voices=new Set();this.lastFlap=-1;this.diagnostics={played:0,flaps:0,limited:0};}
 async unlock(){try{if(!this.context){this.context=new (window.AudioContext||window.webkitAudioContext)();this.master=this.context.createGain();this.master.connect(this.context.destination);this.level();}if(this.context.state==='suspended')await this.context.resume();}catch{this.unavailable=true;}}
 level(){if(this.master)this.master.gain.value=this.enabled?this.volume:0;}
 clear(){for(const node of this.voices)try{node.stop();}catch{}this.voices.clear();this.lastFlap=-1;}
 pause(){this.clear();this.context?.suspend().catch(()=>{});}
 resume(){this.context?.resume().catch(()=>{});}
 play(kind){const c=this.context;if(!this.enabled||!c||c.state!=='running')return;
  const flap=kind==='flap';if(flap&&(c.currentTime-this.lastFlap<.07||this.voices.size>=4)){this.diagnostics.limited++;return;}
  if(this.voices.size>=10){this.diagnostics.limited++;return;}
  if(flap)this.lastFlap=c.currentTime;
  const map={coverWarning:[720,.28],domainWarning:[430,.35],shield:[980,.15],hit:[100,.12],black:[64,.20],ultimate:[150,.28],skill:[380,.14],coverSuccess:[880,.18],coverLost:[190,.18],transform:[90,.4],victory:[660,.3],defeat:[85,.3],flap:[620,.075]};
  if(!map[kind])return;const [freq,duration]=map[kind],osc=c.createOscillator(),gain=c.createGain(),filter=c.createBiquadFilter();
  osc.type=flap?'sine':kind.includes('Warning')?'square':'triangle';osc.frequency.setValueAtTime(freq,c.currentTime);osc.frequency.exponentialRampToValueAtTime(flap?200:freq*1.5,c.currentTime+duration);
  filter.type='lowpass';filter.frequency.value=flap?1200:2500;gain.gain.setValueAtTime(0,c.currentTime);gain.gain.linearRampToValueAtTime(flap?.16:.28,c.currentTime+.008);gain.gain.exponentialRampToValueAtTime(.001,c.currentTime+duration);
  osc.connect(filter);filter.connect(gain);gain.connect(this.master);this.voices.add(osc);osc.onended=()=>{this.voices.delete(osc);osc.disconnect();filter.disconnect();gain.disconnect();};osc.start();osc.stop(c.currentTime+duration+.01);this.diagnostics.played++;if(flap){this.diagnostics.flaps++;
   if(!this.air){this.air=c.createBuffer(1,Math.ceil(c.sampleRate*.08),c.sampleRate);const data=this.air.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=(Math.random()*2-1)*(1-i/data.length);}
   const noise=c.createBufferSource(),wind=c.createBiquadFilter(),level=c.createGain();noise.buffer=this.air;wind.type='bandpass';wind.frequency.setValueAtTime(2400,c.currentTime);wind.frequency.exponentialRampToValueAtTime(600,c.currentTime+.07);level.gain.value=.11;noise.connect(wind);wind.connect(level);level.connect(this.master);this.voices.add(noise);noise.onended=()=>{this.voices.delete(noise);noise.disconnect();wind.disconnect();level.disconnect();};noise.start();
  }
 }
}
