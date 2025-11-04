export function initScene(){
  const canvas = document.getElementById('three-canvas');
  
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);
  
  const camera = new THREE.OrthographicCamera(
    -1, 1, 1, -1, 0.1, 1000
  );
  camera.position.z = 1;
  
  const renderer = new THREE.WebGLRenderer({ 
    canvas, 
    antialias: true,
    alpha: false 
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  
  window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
  
  return { scene, camera, renderer };
}
