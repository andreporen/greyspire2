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
