import { SETTINGS } from './settings.js';

export function prepareTokens(ctx, cssWidth, fontSize, lineHeight, lines){
  ctx.font = `700 ${fontSize}px 'Cinzel Decorative'`;
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
  ctx.font = `700 ${conf.fontSize}px 'Cinzel Decorative'`;
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
