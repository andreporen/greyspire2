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

export function showInterstitial(onDone){
  const inter = document.getElementById('interstitial');
  const glitch = document.getElementById('glitchLines');
  if (!inter || !glitch) { onDone(); return; }

  // 1. Define 'display: flex'
  inter.style.display = 'flex';

  // 2. Espera um frame e adiciona '.show' (fade-in)
  requestAnimationFrame(() => {
    inter.classList.add('show');
  });

  // 3. Tempo de espera (3000ms) antes do glitch
  setTimeout(() => {
    glitch.classList.add('glitch-run');

    // 4. Ao final do glitch (450ms)
    setTimeout(() => {
      inter.classList.remove('show'); // Inicia o fade-out
      glitch.classList.remove('glitch-run');
      
      // 5. ESPERA o fade-out (500ms) terminar
      setTimeout(() => {
        inter.style.display = 'none';
        onDone && onDone();
      }, 500);

    }, 450);
  }, 3000);
}
