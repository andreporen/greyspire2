Write-Host "Iniciando atualização automática dos arquivos..." -ForegroundColor Yellow

# 1. CONTEÚDO: index.html
$html_content = @"
<!DOCTYPE html>
<html lang="pt-br">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"/>
  <title>O Pergaminho Arcano</title>

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700&family=MedievalSharp&display=swap" rel="stylesheet">

  <link rel="stylesheet" href="./src/style.css">

  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/howler/2.2.3/howler.min.js"></script>

</head>
<body>

  <div id="a11y-poem-container" class="sr-only">
    </div>

  <div id="seal-container">
    <img id="arcane-seal-img" src="./assets/selo-arcano.png" alt="Selo Arcano">
    <div id="build-version">v1.0 (modular)</div>
  </div>

  <canvas id="three-canvas"></canvas>

  <div id="signature-container">
    <p id="signature">
O coração dispara antes que você perceba que deixou a carta cair. O papel atinge o chão, mas a sensação de contato não some com ele. Algo fica preso na sua cabeça, como se um pensamento entrasse sem pedir permissão. Não é visão, nem sonho. É lembrança de algo que você nunca viveu.<br><br>
A imagem vem inteira, sem construção, sem origem: uma taverna que você nunca viu, mas reconhece. Tábuas escuras, cheiro de ferrugem, luz baixa demais para ser aconchegante, mesas que já desistiram de permanecer retas. Ferrugem & Ossos. Velha Chama. O nome surge pronto, como se sempre estivesse guardado em algum ponto da sua mente que não era seu.<br><br>
Ninguém diz que você deve ir.<br>
Mas a sensação é de que você já está atrasado.
    </p>
  </div>

  <script type="module">
    import { boot } from './src/main.js';
    boot();
  </script>
</body>
</html>
"@

# 2. CONTEÚDO: src/style.css (NOVO ARQUIVO)
$css_content = @"
:root { --cor-arcana:#b24cff; }

html, body {
  margin:0; padding:0; width:100%; height:100%;
  background:#000; color:#fff; font-family:'MedievalSharp', cursive;
  overflow:hidden;
}

#seal-container{
  position:fixed; top:50%; left:50%; transform:translate(-50%,-50%);
  width:180px; height:200px; display:flex; flex-direction:column; gap:6px;
  justify-content:center; align-items:center; cursor:pointer; z-index:20;
}
#arcane-seal-img{
  width:128px; height:auto; filter:drop-shadow(0 0 22px var(--cor-arcana));
  transition:opacity .28s ease-out, filter .28s ease-out, transform .18s ease-out;
}
#arcane-seal-img:active{ transform: scale(0.98); }
#arcane-seal-img.clicked{ opacity:0; filter:drop-shadow(0 0 5px var(--cor-arcana)); }
#build-version{ font-size:0.7rem; opacity:0.45; transition:opacity .28s ease-out; }
#build-version.hide{ opacity:0; }

#three-canvas{ position:fixed; top:0; left:0; z-index:1; }

#signature-container{
  display:none; opacity:0; position:fixed; bottom:10vh; left:50%;
  transform:translateX(-50%); z-index:10; text-align:center;
  font-size:1.2rem; font-family:'MedievalSharp', cursive; line-height:1.35;
  max-width:600px; transition:opacity 1s ease-in; padding:0 16px;
}
#signature{ color:#fff; }

/* Classe de acessibilidade: Esconde visualmente, mas mantém para leitores de tela */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
"@

# 3. CONTEÚDO: src/audio.js
$audio_js_content = @"
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
      try{ h.play(id) }catch(e){ console.warn('Falha ao tentar tocar som após erro', e) }
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
"@

# 4. CONTEÚDO: src/crawl.js
$crawl_js_content = @"
import { SETTINGS } from './settings.js';
import { vertexShader, fragmentShader } from './shaders.js';

export function createTextMesh(renderer, poemLines){
  const isMobile = innerWidth <= SETTINGS.canvas.mobileMaxWidth;
  let fontSize   = isMobile ? 22.4 : 32;
  let lineHeight = fontSize * 1.28;
  let cssWidth   = SETTINGS.canvas.baseTextureWidth;
  let cssHeight  = Math.floor(poemLines.length * lineHeight + (fontSize * 2));

  const maxCssHeight = Math.floor(innerHeight * SETTINGS.canvas.verticalMaxViewport);
  if (cssHeight > maxCssHeight){
    const s = maxCssHeight / cssHeight;
    fontSize *= s; lineHeight *= s; cssWidth *= s;
    cssHeight = Math.floor(poemLines.length * lineHeight + (fontSize * 2));
  }

  const dpr = Math.min(devicePixelRatio||1, SETTINGS.canvas.dprMax);
  const ss  = SETTINGS.canvas.supersample;

  const canvas = document.createElement('canvas');
  canvas.width  = Math.floor(cssWidth  * dpr * ss);
  canvas.height = Math.floor(cssHeight * dpr * ss);
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  ctx.scale(dpr*ss, dpr*ss);

  const textConf = { canvas, ctx, dpr, ss, cssWidth, cssHeight, fontSize, lineHeight };

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.NearestFilter;
  texture.anisotropy = renderer.capabilities.getMaxAnisotropy();

  const mat = new THREE.ShaderMaterial({
    uniforms:{
      map:{value:texture},
      time:{value:0.0},
      glowColor:{value:new THREE.Color(SETTINGS.colors.arcane)},
      baseDistortion:{value:SETTINGS.shader.baseDistortion},
      baseNoise:{value:SETTINGS.shader.baseNoise},
      beatLevel:{value:0.0}
    },
    vertexShader, fragmentShader, transparent:true
  });

  const geo = new THREE.PlaneGeometry(cssWidth, cssHeight);
  const mesh = new THREE.Mesh(geo, mat);

  const group = new THREE.Group();
  group.add(mesh);
  group.rotation.x = 0;

  const startY = -cssHeight/2 + SETTINGS.canvas.startYOffset;
  group.position.y = startY;

  mesh.userData.textConf = textConf;

  return { group, mesh, texture, textConf };
}
"@

# 5. CONTEÚDO: src/main.js
$main_js_content = @"
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
    poemContainer.innerHTML = lines.map(line => `<p>${line.trim() || '&nbsp;'}</p>`).join('');
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
"@

# 6. CONTEÚDO: src/settings.js
$settings_js_content = @"
export const SETTINGS = {
  colors: { arcane: '#b24cff' },

  font: {
    family: "'Cinzel Decorative'",
    weight: 700
  },

  typing: {
    perWordMs: 220,            // velocidade (A1)
    perWordJitter: 50,
    materializeMs: 240,
    driftPerFrame: 0.04,
    spaceFactor: 1.15
  },

  shader: {
    baseDistortion: 0.010,
    baseNoise: 0.010
  },

  rateByProgress(p) {
    let rate = 1;
    if (p > 0.40) rate = 1.10;
    if (p > 0.60) rate = 1.20;
    if (p > 0.80) rate = 1.30;
    if (p > 0.92) rate = 1.38;
    if (p > 0.98) rate = 1.45;
    return rate;
  },

  canvas: {
    mobileMaxWidth: 480,
    baseTextureWidth: 1024,
    dprMax: 3,
    supersample: 2.0,
    verticalMaxViewport: 0.84,
    startYOffset: -90
  }
};
"@

# 7. CONTEÚDO: src/typing.js
$typing_js_content = @"
import { SETTINGS } from './settings.js';

export function prepareTokens(ctx, cssWidth, fontSize, lineHeight, lines){
  ctx.font = `${SETTINGS.font.weight} ${fontSize}px ${SETTINGS.font.family}`;
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';

  const tokens = [];
  let y = fontSize * 2;

  for (let i=0;i<lines.length;i++){
    const raw = lines[i];
    if (!raw.trim()){ y += lineHeight; continue; }

    const words = raw.split(' ');
    const widths = words.map(w => ctx.measureText(w).width);
    const spaceBase = ctx.measureText(' ').width * SETTINGS.typing.spaceFactor;
    const totalWidth = widths.reduce((a,b)=>a+b,0) + (words.length-1)*spaceBase;
    let x = (cssWidth - totalWidth)/2;

    for (let j=0;j<words.length;j++){
      const w = words[j];
      const wWidth = widths[j];
      tokens.push({ text:w, lineIndex:i, x, y, t0:null });
      x += wWidth + spaceBase;
    }
    y += lineHeight;
  }

  return tokens;
}

export function startTyping(tokens, onDone){
  let idx = 0;
  const { perWordMs, perWordJitter } = SETTINGS.typing;

  const step = () => {
    if (idx >= tokens.length){ onDone && onDone(); return; }
    tokens[idx].t0 = performance.now();
    idx++;
    const jitter = (Math.random()*2 - 1) * perWordJitter;
    const delay = Math.max(60, perWordMs + jitter);
    setTimeout(step, delay);
  };

  step();
}

export function redrawTypingCanvas(ctx, conf, tokens, startedAt){
  const { cssWidth, cssHeight, fontSize } = conf;
  ctx.clearRect(0,0,cssWidth,cssHeight);
  ctx.font = `${SETTINGS.font.weight} ${conf.fontSize}px ${SETTINGS.font.family}`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';

  let nowMs = performance.now();
  let lastX = null, lastY = null;

  for (const tk of tokens){
    if (!tk.t0) break;
    const age = nowMs - tk.t0;
    const k = Math.min(1, age / SETTINGS.typing.materializeMs);

    ctx.globalAlpha = 0.15 + 0.85 * k;
    ctx.shadowColor = `rgba(178,76,255,${(0.20*(1-k)).toFixed(3)})`;
    ctx.shadowBlur  = 5*(1-k);

    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(tk.text, tk.x, tk.y);

    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;

    lastX = tk.x + ctx.measureText(tk.text).width;
    lastY = tk.y;
  }

  if (lastX!==null && lastY!==null){
    const blink = (Math.sin((nowMs - startedAt)/280) > 0) ? 1 : 0.3;
    ctx.globalAlpha = blink;
    ctx.fillRect(lastX+6, lastY - fontSize*0.85, 2, fontSize*0.9);
    ctx.globalAlpha = 1;
  }
}

export function typingProgress(tokens){
  const shown = tokens.filter(t=>t.t0 !== null).length;
  const total = tokens.length || 1;
  return shown / total;
}
"@

# --- AÇÃO: GRAVANDO OS ARQUIVOS ---
try {
    Write-Host "1/7 - Atualizando index.html..."
    Set-Content -Path "./index.html" -Value $html_content -Force -Encoding utf8

    Write-Host "2/7 - Criando/Atualizando src/style.css..."
    Set-Content -Path "./src/style.css" -Value $css_content -Force -Encoding utf8

    Write-Host "3/7 - Atualizando src/audio.js..."
    Set-Content -Path "./src/audio.js" -Value $audio_js_content -Force -Encoding utf8

    Write-Host "4/7 - Atualizando src/crawl.js..."
    Set-Content -Path "./src/crawl.js" -Value $crawl_js_content -Force -Encoding utf8

    Write-Host "5/7 - Atualizando src/main.js..."
    Set-Content -Path "./src/main.js" -Value $main_js_content -Force -Encoding utf8

    Write-Host "6/7 - Atualizando src/settings.js..."
    Set-Content -Path "./src/settings.js" -Value $settings_js_content -Force -Encoding utf8

    Write-Host "7/7 - Atualizando src/typing.js..."
    Set-Content -Path "./src/typing.js" -Value $typing_js_content -Force -Encoding utf8

    Write-Host ""
    Write-Host "PRONTO! Todos os 7 arquivos foram atualizados com sucesso." -ForegroundColor Green
} catch {
    Write-Host ""
    Write-Host "ERRO: Ocorreu um problema ao tentar gravar os arquivos." -ForegroundColor Red
    Write-Host $_.Exception.Message
}