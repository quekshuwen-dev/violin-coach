// Shared microphone pipeline for the tuner and scale check.
// Raw input (no browser voice processing) → 70 Hz high-pass → analyser.
export const MIC_FFT=8192;
export async function openMic(){
  const stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:false,noiseSuppression:false,autoGainControl:false,channelCount:1}});
  const ac=new (window.AudioContext||window.webkitAudioContext)();
  await ac.resume();
  const src=ac.createMediaStreamSource(stream);
  const hp=ac.createBiquadFilter();hp.type='highpass';hp.frequency.value=70;hp.Q.value=0.7;
  const analyser=ac.createAnalyser();analyser.fftSize=MIC_FFT;analyser.smoothingTimeConstant=0;
  src.connect(hp).connect(analyser);
  const buf=new Float32Array(analyser.fftSize);
  return{
    ac,analyser,sampleRate:ac.sampleRate,
    read(){analyser.getFloatTimeDomainData(buf);return buf;},
    close(){stream.getTracks().forEach(t=>t.stop());ac.close();}
  };
}
