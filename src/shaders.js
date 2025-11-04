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
  uniform float distortionStrength; // Novo uniforme

  varying vec2 vUv;

  void main(){
    vec2 warpedUv = vUv; // Usa UVs planos (2D) para nitidez máxima

    // Distorção de onda sutil e LENTA
    vec2 distortedUv = warpedUv;
    float d = distortionStrength;
    
    // Frequências baixas (4.0/3.0) e velocidade lenta (0.5/0.6)
    distortedUv.x += sin(warpedUv.y * 4.0 + time * 0.5) * d;
    distortedUv.y += cos(warpedUv.x * 3.0 + time * 0.6) * d;

    vec4 texel = texture2D(map, clamp(distortedUv, 0.0, 1.0));

    // Cor simples (branco + glow)
    vec3 colorText = vec3(1.0);
    vec3 glow = glowColor * texel.a * 0.45;

    vec3 color = colorText * texel.a + glow;
    gl_FragColor = vec4(color, texel.a);
  }
`;
