export const vertexShader = `
  varying vec2 vUv;
  void main(){
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
  }
`;

export const fragmentShader = `
  uniform sampler2D map;
  uniform float time;
  uniform vec3 glowColor;

  uniform float baseDistortion;  // intensidade base das ondas
  uniform float baseNoise;       // ruído base
  uniform float beatLevel;       // 0..1.2 (pré-calculado + acelerado)

  varying vec2 vUv;

  float rand(vec2 co){ return fract(sin(dot(co.xy, vec2(12.9898,78.233))) * 43758.5453); }

  void main(){
    vec2 uv = vUv;

    // Curvatura leve (sem zoom acumulado)
    float bend = 0.35;
    vec2 p = uv * 2.0 - 1.0;
    p.y = p.y + bend * (p.y * p.y);
    float perspective = 1.0 + bend * (p.y + 1.0) * 0.5;
    p /= perspective;
    vec2 warpedUv = p * 0.5 + 0.5;

    // Ondas fortes + ruído, reativos ao beat
    float waveAmp = baseDistortion * (0.7 + 2.2 * beatLevel);
    float wave    = waveAmp * sin(warpedUv.y * (18.0 + 10.0*beatLevel) + time * (1.6 + 1.5*beatLevel));
    vec2 distortedUv = warpedUv;
    distortedUv.x += wave;

    float nAmp  = baseNoise * (0.6 + 1.8 * beatLevel);
    float nSeed = rand(warpedUv * (18.0 + 6.0*beatLevel) + time * (0.6 + 0.9*beatLevel));
    float noise = (nSeed - 0.5) * nAmp;
    distortedUv.y += noise * 0.9;
    distortedUv.x += noise * 0.5;

    vec4 texel = texture2D(map, clamp(distortedUv, 0.0, 1.0));

    // Cor/luminância no beat: branco → roxo → quase preto nos picos
    float b = clamp(beatLevel, 0.0, 1.2);
    float colorPulse = smoothstep(0.0, 1.0, b);

    vec3 white  = vec3(1.0);
    vec3 purple = normalize(glowColor) * 0.7 + vec3(0.35,0.0,0.65)*0.3;

    vec3 colorText = mix(white, purple, colorPulse);
    float blackout = smoothstep(0.93, 1.05, b);
    colorText = mix(colorText, vec3(0.0), 0.38 * blackout);

    vec3 glow = glowColor * texel.a * (0.35 + 0.65 * colorPulse) * 0.55;

    vec3 color = colorText * texel.a + glow;
    gl_FragColor = vec4(color, texel.a);
  }
`;
