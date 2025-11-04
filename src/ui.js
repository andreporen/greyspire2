export function bindSeal(onClick){
  const seal = document.getElementById('arcane-seal-img');
  const ver  = document.getElementById('build-version');

  const handler = ()=>{
    seal.classList.add('clicked');
    ver.classList.add('hide');
    setTimeout(()=>{ document.getElementById('seal-container').style.display='none'; }, 280);
    onClick && onClick();
  };

  document.getElementById('seal-container').addEventListener('click', handler, {once:true});
}

export function showSignature(){
  const sig=document.getElementById('signature-container');
  sig.style.display='block';
  setTimeout(()=>{ sig.style.opacity='1'; },200);
}


function computeDistortionFromBeat(beatLevel, rate){
  const BASE = 0.0022;
  const PEAK = 0.0045;
  const boost = Math.min(1, (rate - 1) / 0.5);
  const k = Math.min(1, Math.max(0, 0.6*beatLevel + 0.4*boost));
  return BASE + (PEAK - BASE) * k;
}

