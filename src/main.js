import { SETTINGS } from './settings.js';
import { POEMA } from './poem.js';
import { initScene } from './scene.js';
import { createTextMesh } from './crawl.js';
import { preloadBeat, getBeatAt } from './beat.js';
import { setupAudio, playStart, setHeartRate, fadeOutAmbience, playSignatureSfx } from './audio.js';
import { bindSeal, showSignature } from './ui.js';
import { prepareTokens, startTyping, redrawTypingCanvas, typingProgress } from './typing.js';

let scene, camera, renderer, clock;
let crawlGroup, textMesh, texture, textConf;
let tokens = [];
let startedAt = 0;
let animationInProgress = false;

let beatAccum = 0;
let lastFrameMs = null;

export async function boot(){
  await preloadBeat('./assets/sfx2_5.mp3');
  setupAudio();
  ({scene, camera, renderer} = initScene());
  clock = new THREE.Clock(true);

  bindSeal(startExperience);
}

function startExperience(){
  if (animationInProgress) return;
  animationInProgress = true;

  playStart();

  const lines = POEMA.trim().split('\n');
  
  // Inserir o texto no DOM para acessibilidade (leitores de tela)
  const poemContainer = document.getElementById('a11y-poem-container');
  if (poemContainer) {
    poemContainer.innerHTML = lines.map(line => <p></p>).join('');
  }

  ({ group:crawlGroup, mesh:textMesh, texture, textConf } = createTextMesh(renderer, lines));
  scene.add(crawlGroup);

  tokens = prepareTokens(textConf.ctx, textConf.cssWidth, textConf.fontSize, textConf.lineHeight, lines);
  startedAt = performance.now();
  startTyping(tokens, ()=> setTimeout(finishAnimation, 1200));

  clock = new THREE.Clock(true);
  beatAccum = 0;
  lastFrameMs = performance.now();

  redrawTypingCanvas(textConf.ctx, textConf, tokens, startedAt);
  texture.needsUpdate = true;

  animate();
}

function animate(){
  requestAnimationFrame(animate);
  if (!animationInProgress) return;

  const nowMs = performance.now();
  const dt = lastFrameMs ? (nowMs - lastFrameMs)/1000 : 0;
  lastFrameMs = nowMs;

  const p = typingProgress(tokens);
  const rate = SETTINGS.rateByProgress(p);
  setHeartRate(rate);
  beatAccum += dt * rate;

  if (textMesh && textMesh.material){
    const u = textMesh.material.uniforms;
    u.time.value = clock.getElapsedTime();
    u.beatLevel.value = getBeatAt(beatAccum);
  }

  if (crawlGroup){ crawlGroup.position.y += SETTINGS.typing.driftPerFrame; }

  if (textMesh?.userData?.textConf){
    redrawTypingCanvas(textConf.ctx, textConf, tokens, startedAt);
    texture.needsUpdate = true;
  }

  renderer.render(scene, camera);
}

function finishAnimation(){
  if (!animationInProgress) return;
  animationInProgress = false;

  fadeOutAmbience(600);
  showSignature();
  setTimeout(()=> playSignatureSfx(), 1000);
}
