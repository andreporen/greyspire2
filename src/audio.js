let sfx1, sfx2, sfx25, sfx3;
let heartBeatSoundId = null;

export function setupAudio() {
  Howler.autoSuspend = false;
  Howler.mute(false);
  Howler.volume(1.0);

  sfx1  = new Howl({ src:['./assets/sfx1.mp3'],  volume:0.8, loop:false });
  sfx2  = new Howl({ src:['./assets/sfx2.mp3'],  volume:0.6, loop:true  });
  sfx25 = new Howl({ src:['./assets/sfx2_5.mp3'],volume:1.0, loop:true  });
  sfx3  = new Howl({ src:['./assets/sfx3.mp3'],  volume:0.6, loop:false });

  [sfx1,sfx2,sfx25,sfx3].forEach(h=>
    h.once('playerror',(id)=>{
      try{ Howler.ctx.resume() }catch(e){ console.warn('Falha ao resumir audio context', e) }
      try{ h.play(id) }catch(e){ console.warn('Falha ao tentar tocar som apÃ³s erro', e) }
    })
  );
}

export function playStart() {
  sfx1.play();
  sfx2.play();
  heartBeatSoundId = sfx25.play();
}

export function setHeartRate(rate){
  try{
    if (heartBeatSoundId !== null){
      sfx25.rate(rate, heartBeatSoundId);
    }
  }catch(e){ console.warn('Falha ao definir heart rate:', e); }
}

export function fadeOutAmbience(ms=600){
  [sfx2,sfx25].forEach(s=>{
    try{
      // O fade(volume, 0, ms) aplica a todos os sons ativos se nenhum ID for passado.
      s.fade(s.volume(), 0, ms);
      setTimeout(()=>{ try{s.stop()}catch(e){ console.warn('Falha ao parar som', e); } }, ms+20);
    }catch(e){ console.warn('Falha ao aplicar fade out:', e); }
  });
}

export function playSignatureSfx(){
  try{ if (Howler.ctx && Howler.ctx.state!=='running') Howler.ctx.resume(); }catch(e){ console.warn('Falha ao resumir audio context', e); }
  sfx3.play();
}
