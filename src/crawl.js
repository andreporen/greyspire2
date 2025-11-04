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
