export const SETTINGS = {
  colors: { arcane: '#b24cff' },

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
    verticalMaxViewport: 0.84
  }
};


function computeDistortionFromBeat(beatLevel, rate){
  const BASE = 0.0022;
  const PEAK = 0.0045;
  const boost = Math.min(1, (rate - 1) / 0.5);
  const k = Math.min(1, Math.max(0, 0.6*beatLevel + 0.4*boost));
  return BASE + (PEAK - BASE) * k;
}

