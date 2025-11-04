export function initScene() {
  const canvas = document.getElementById('three-canvas');
  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, innerWidth/innerHeight, 1, 10000);
  camera.position.set(0,130,480);
  camera.lookAt(0,0,0);

  const renderer = new THREE.WebGLRenderer({canvas, antialias:true, alpha:true});
  renderer.setSize(innerWidth, innerHeight);
  renderer.setPixelRatio(Math.min(devicePixelRatio, 3));

  function onResize(){
    camera.aspect = innerWidth/innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
  }
  addEventListener('resize', onResize, {passive:true});
  addEventListener('orientationchange', onResize, {passive:true});

  document.addEventListener('visibilitychange', ()=>{
    try{ if (Howler.ctx && Howler.ctx.state!=='running') Howler.ctx.resume(); }catch(e){}
  });

  return { scene, camera, renderer };
}
