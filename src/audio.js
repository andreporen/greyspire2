let sfx1, sfx2, sfx25, sfx3;

export function setupAudio() {
  Howler.autoSuspend = false;
  Howler.mute(false);
  Howler.volume(1.0);

  sfx1  = new Howl({ src:['./assets/sfx1.mp3'],  volume:0.8, loop:false });
  sfx2  = new Howl({ src:['./assets/sfx2.mp3'],  volume:0.6, loop:true  });
  sfx25 = new Howl({ src:['./assets/sfx2_5.mp3'],volume:1.0, loop:true  });
  sfx3  = new Howl({ src:['./assets/sfx3.mp3'],  volume:0.6, loop:false });

  [sfx1,sfx2,sfx25,sfx3].forEach(h=>
    h.once('playerror',(id)=>{try{Howler.ctx.resume()}catch(e){} try{h.play(id)}catch(e){}})
  );
}

export function playStart() {
  sfx1.play();
  sfx2.play();
  sfx25.play();
}

export function setHeartRate(rate){
  try{
    if (sfx25 && sfx25._sounds && sfx25._sounds.length>0){
      const id = sfx25._sounds[0]._id;
      if (id) sfx25.rate(rate, id);
    }
  }catch(e){}
}

export function fadeOutAmbience(ms=600){
  [sfx2,sfx25].forEach(s=>{
    try{
      const id = s._sounds[0]? s._sounds[0]._id : null;
      if (id!==null) s.fade(s.volume(id), 0, ms, id);
      setTimeout(()=>{ try{s.stop()}catch(e){} }, ms+20);
    }catch(e){}
  });
}

export function playSignatureSfx(){
  try{ if (Howler.ctx && Howler.ctx.state!=='running') Howler.ctx.resume(); }catch(e){}
  sfx3.play();
}
