// Web Audio Sound Effects Synthesizer for Botock Video Editor
// Generates realistic sound effect WAV blobs client-side with zero external dependencies.

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

function bufferToWave(abuffer: AudioBuffer): Blob {
  const numOfChan = abuffer.numberOfChannels;
  const length = abuffer.length * numOfChan * 2 + 44;
  const outBuffer = new ArrayBuffer(length);
  const view = new DataView(outBuffer);
  const channels: Float32Array[] = [];
  let sampleRate = abuffer.sampleRate;
  let offset = 0;
  let pos = 0;

  // RIFF identifier
  writeString(view, pos, "RIFF"); pos += 4;
  view.setUint32(pos, length - 8, true); pos += 4;
  writeString(view, pos, "WAVE"); pos += 4;
  writeString(view, pos, "fmt "); pos += 4;
  view.setUint32(pos, 16, true); pos += 4; // SubChunk1Size (16 for PCM)
  view.setUint16(pos, 1, true); pos += 2; // AudioFormat (1 for PCM)
  view.setUint16(pos, numOfChan, true); pos += 2;
  view.setUint32(pos, sampleRate, true); pos += 4;
  view.setUint32(pos, sampleRate * 2 * numOfChan, true); pos += 4; // byte rate
  view.setUint16(pos, numOfChan * 2, true); pos += 2; // block align
  view.setUint16(pos, 16, true); pos += 2; // bits per sample
  writeString(view, pos, "data"); pos += 4;
  view.setUint32(pos, length - pos - 4, true); pos += 4;

  for (let i = 0; i < abuffer.numberOfChannels; i++) {
    channels.push(abuffer.getChannelData(i));
  }

  while (offset < abuffer.length) {
    for (let i = 0; i < numOfChan; i++) {
      let sample = Math.max(-1, Math.min(1, channels[i][offset]));
      sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0;
      view.setInt16(pos, sample, true);
      pos += 2;
    }
    offset++;
  }

  return new Blob([outBuffer], { type: "audio/wav" });
}

export type SoundEffectType = 
  | "applause" 
  | "laughter" 
  | "dog_bark" 
  | "eating_crunch" 
  | "whoosh" 
  | "bell_chime" 
  | "drum_roll"
  | "upbeat_loop";

export async function generateSoundEffect(type: SoundEffectType): Promise<File> {
  const sampleRate = 44100;
  
  if (type === "applause") {
    // 3 seconds of applause/cheering
    const duration = 3.0;
    const ctx = new OfflineAudioContext(2, sampleRate * duration, sampleRate);
    const numClaps = 300;
    
    for (let i = 0; i < numClaps; i++) {
      const time = Math.random() * (duration - 0.2);
      const osc = ctx.createBufferSource();
      const clapLength = Math.floor(sampleRate * 0.04);
      const clapBuffer = ctx.createBuffer(1, clapLength, sampleRate);
      const data = clapBuffer.getChannelData(0);
      for (let j = 0; j < clapLength; j++) {
        data[j] = (Math.random() * 2 - 1) * Math.exp(-j / (sampleRate * 0.008));
      }
      osc.buffer = clapBuffer;
      
      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.value = 800 + Math.random() * 1200;
      filter.Q.value = 2.0;

      const panner = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
      if (panner) panner.pan.value = Math.random() * 2 - 1;

      const gain = ctx.createGain();
      gain.gain.value = 0.15 + Math.random() * 0.1;

      osc.connect(filter);
      if (panner) {
        filter.connect(panner);
        panner.connect(gain);
      } else {
        filter.connect(gain);
      }
      gain.connect(ctx.destination);
      osc.start(time);
    }
    const rendered = await ctx.startRendering();
    const blob = bufferToWave(rendered);
    return new File([blob], "Crowd_Applause.wav", { type: "audio/wav" });
  }

  if (type === "laughter") {
    // 2.5 seconds crowd laughter
    const duration = 2.5;
    const ctx = new OfflineAudioContext(1, sampleRate * duration, sampleRate);
    const chuckles = 15;
    
    for (let i = 0; i < chuckles; i++) {
      const time = 0.1 + (i * 0.14) + (Math.random() * 0.05);
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(280 + Math.random() * 80, time);
      osc.frequency.exponentialRampToValueAtTime(160 + Math.random() * 40, time + 0.12);
      
      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(0.25, time + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.12);

      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.value = 600 + Math.random() * 400;

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      osc.start(time);
      osc.stop(time + 0.13);
    }
    const rendered = await ctx.startRendering();
    const blob = bufferToWave(rendered);
    return new File([blob], "Laughing_Crowd.wav", { type: "audio/wav" });
  }

  if (type === "dog_bark") {
    // 1.2 seconds dog bark (2 barks)
    const duration = 1.2;
    const ctx = new OfflineAudioContext(1, sampleRate * duration, sampleRate);
    
    [0.05, 0.45].forEach((startTime) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(320, startTime);
      osc.frequency.exponentialRampToValueAtTime(140, startTime + 0.25);

      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.7, startTime + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.28);

      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 1200;

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + 0.3);
    });

    const rendered = await ctx.startRendering();
    const blob = bufferToWave(rendered);
    return new File([blob], "Dog_Bark.wav", { type: "audio/wav" });
  }

  if (type === "eating_crunch") {
    // 1.5 seconds crunchy eating
    const duration = 1.5;
    const ctx = new OfflineAudioContext(1, sampleRate * duration, sampleRate);
    
    for (let i = 0; i < 6; i++) {
      const t = 0.1 + i * 0.22 + Math.random() * 0.05;
      const noise = ctx.createBufferSource();
      const nLen = Math.floor(sampleRate * 0.12);
      const nBuf = ctx.createBuffer(1, nLen, sampleRate);
      const data = nBuf.getChannelData(0);
      for (let j = 0; j < nLen; j++) {
        data[j] = (Math.random() * 2 - 1) * Math.exp(-j / (sampleRate * 0.02));
      }
      noise.buffer = nBuf;

      const filter = ctx.createBiquadFilter();
      filter.type = "highpass";
      filter.frequency.value = 2500;

      const gain = ctx.createGain();
      gain.gain.value = 0.45;

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start(t);
    }
    const rendered = await ctx.startRendering();
    const blob = bufferToWave(rendered);
    return new File([blob], "Eating_Crunch.wav", { type: "audio/wav" });
  }

  if (type === "whoosh") {
    // 1.0 second cinematic whoosh
    const duration = 1.0;
    const ctx = new OfflineAudioContext(1, sampleRate * duration, sampleRate);
    const noise = ctx.createBufferSource();
    const nLen = Math.floor(sampleRate * duration);
    const nBuf = ctx.createBuffer(1, nLen, sampleRate);
    const data = nBuf.getChannelData(0);
    for (let i = 0; i < nLen; i++) data[i] = Math.random() * 2 - 1;
    noise.buffer = nBuf;

    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(200, 0);
    filter.frequency.exponentialRampToValueAtTime(2400, 0.4);
    filter.frequency.exponentialRampToValueAtTime(150, 1.0);
    filter.Q.value = 3.0;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, 0);
    gain.gain.linearRampToValueAtTime(0.6, 0.4);
    gain.gain.exponentialRampToValueAtTime(0.001, 1.0);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    noise.start(0);

    const rendered = await ctx.startRendering();
    const blob = bufferToWave(rendered);
    return new File([blob], "Dramatic_Whoosh.wav", { type: "audio/wav" });
  }

  if (type === "bell_chime") {
    // 1.8 seconds bell notification
    const duration = 1.8;
    const ctx = new OfflineAudioContext(1, sampleRate * duration, sampleRate);
    [880, 1760, 2640].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.4 / (idx + 1), 0);
      gain.gain.exponentialRampToValueAtTime(0.0001, duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(0);
      osc.stop(duration);
    });
    const rendered = await ctx.startRendering();
    const blob = bufferToWave(rendered);
    return new File([blob], "Bell_Chime.wav", { type: "audio/wav" });
  }

  // Default / upbeat loop
  const duration = 2.0;
  const ctx = new OfflineAudioContext(1, sampleRate * duration, sampleRate);
  [0, 0.5, 1.0, 1.5].forEach((t, i) => {
    // Kick on beat 0 & 1.0, Snare on beat 0.5 & 1.5
    if (i % 2 === 0) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.setValueAtTime(150, t);
      osc.frequency.exponentialRampToValueAtTime(40, t + 0.15);
      gain.gain.setValueAtTime(0.7, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.25);
    } else {
      const noise = ctx.createBufferSource();
      const nLen = Math.floor(sampleRate * 0.15);
      const nBuf = ctx.createBuffer(1, nLen, sampleRate);
      const data = nBuf.getChannelData(0);
      for (let j = 0; j < nLen; j++) data[j] = (Math.random() * 2 - 1) * Math.exp(-j / (sampleRate * 0.03));
      noise.buffer = nBuf;
      const gain = ctx.createGain();
      gain.gain.value = 0.5;
      noise.connect(gain);
      gain.connect(ctx.destination);
      noise.start(t);
    }
  });
  const rendered = await ctx.startRendering();
  const blob = bufferToWave(rendered);
  return new File([blob], "Upbeat_Beat.wav", { type: "audio/wav" });
}
