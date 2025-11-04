export const BEAT = { fps:60, durationSec:0, values:[], ready:false };

export async function preloadBeat(url="assets/sfx2_5.mp3"){
  try{
    const resp = await fetch(url, {cache:'force-cache'});
    const arr  = await resp.arrayBuffer();

    const AC = window.AudioContext || window.webkitAudioContext;
    const ctx = new AC({ sampleRate:44100 });
    const decoded = await ctx.decodeAudioData(arr);

    const chL = decoded.getChannelData(0);
    const chR = decoded.numberOfChannels>1 ? decoded.getChannelData(1) : null;

    const sr   = decoded.sampleRate;
    const hop  = Math.max(1, Math.floor(sr / BEAT.fps));

    const env = [];
    let peak = 0;
    for (let i=0; i<decoded.length; i+=hop){
      let sum=0, count=0;
      for (let j=0; j<hop && (i+j)<decoded.length; j++){
        const sL = chL[i+j];
        const sR = chR ? chR[i+j] : 0;
        const m  = chR ? (sL + sR)*0.5 : sL;
        sum += m*m; count++;
      }
      const rms = Math.sqrt(sum/Math.max(1,count));
      env.push(rms); if (rms>peak) peak=rms;
    }

    const smooth = (arr,k=0.86)=>{
      const out = new Float32Array(arr.length);
      let prev=0; for (let i=0;i<arr.length;i++){ prev=prev*k+arr[i]*(1-k); out[i]=prev; }
      prev=0; for (let i=arr.length-1;i>=0;i--){ prev=prev*k+out[i]*(1-k); out[i]=Math.max(out[i],prev); }
      return Array.from(out);
    };
    let sm = smooth(env, 0.86);
    const sorted = [...sm].sort((a,b)=>a-b);
    const p95 = sorted[Math.floor(sorted.length*0.95)] || (peak || 1);
    sm = sm.map(v => Math.min(1, v / (p95 || 1)));
    sm = sm.map(v => Math.pow(v, 0.6));

    BEAT.values = sm;
    BEAT.durationSec = decoded.duration;
    BEAT.ready = true;

    ctx.close && ctx.close();
  }catch(e){
    console.warn('Pré-cálculo do beat falhou, usando fallback.', e);
    const total = 60 * 30;
    const vals = [];
    for (let i=0;i<total;i++){
      const t=i/60; vals.push( (Math.sin(t*2*Math.PI*1.1)*0.5+0.5) );
    }
    BEAT.values = vals;
    BEAT.durationSec = total/60;
    BEAT.ready = true;
  }
}

export function getBeatAt(accumSec){
  if (!BEAT.ready || BEAT.values.length===0){
    return (Math.sin(accumSec*2*Math.PI*1.0)*0.5+0.5);
  }
  const t = accumSec % BEAT.durationSec;
  const idx = Math.floor(t * BEAT.fps) % BEAT.values.length;
  return BEAT.values[idx];
}


function computeDistortionFromBeat(beatLevel, rate){
  const BASE = 0.0022;
  const PEAK = 0.0045;
  const boost = Math.min(1, (rate - 1) / 0.5);
  const k = Math.min(1, Math.max(0, 0.6*beatLevel + 0.4*boost));
  return BASE + (PEAK - BASE) * k;
}

