// Raia Realistic Paper Sound Synthesizer (Web Audio API)
// 100% Procedural & Offline - Zero external MP3 downloads required

export class SoundSynthesizer {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.volume = 0.65;
    this.profile = 'luxury'; // 'luxury' (glossy art catalog), 'heavy' (thick cardstock), 'soft' (delicate silk paper)
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setVolume(val) {
    this.volume = Math.max(0, Math.min(1, val));
  }

  setEnabled(val) {
    this.enabled = !!val;
  }

  setProfile(profile) {
    this.profile = profile;
  }

  playPageTurn(speed = 1.0) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const mainGain = this.ctx.createGain();
    mainGain.gain.setValueAtTime(this.volume, now);
    mainGain.connect(this.ctx.destination);

    let duration = 0.38 / Math.max(0.6, speed);
    let centerFreq = 2200;
    let bandQ = 0.7;
    let thumpGainVal = 0.28;

    if (this.profile === 'heavy') {
      duration = 0.46 / Math.max(0.6, speed);
      centerFreq = 1600;
      bandQ = 0.9;
      thumpGainVal = 0.42;
    } else if (this.profile === 'soft') {
      duration = 0.32 / Math.max(0.6, speed);
      centerFreq = 3000;
      bandQ = 0.5;
      thumpGainVal = 0.16;
    }

    const pitchJitter = (Math.random() - 0.5) * 350;
    duration += (Math.random() - 0.5) * 0.05;

    // 1. Friction noise burst
    const bufferSize = Math.floor(this.ctx.sampleRate * duration);
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let lastOut = 0.0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + 0.14 * white) / 1.14;
      lastOut = output[i];
      output[i] *= 2.2;
    }

    const noiseNode = this.ctx.createBufferSource();
    noiseNode.buffer = noiseBuffer;

    const bandpass = this.ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.setValueAtTime(centerFreq + pitchJitter, now);
    bandpass.frequency.exponentialRampToValueAtTime((centerFreq * 0.58) + pitchJitter, now + duration);
    bandpass.Q.setValueAtTime(bandQ, now);

    const highpass = this.ctx.createBiquadFilter();
    highpass.type = 'highpass';
    highpass.frequency.setValueAtTime(550, now);

    const envelope = this.ctx.createGain();
    envelope.gain.setValueAtTime(0.001, now);
    envelope.gain.linearRampToValueAtTime(0.55, now + duration * 0.25);
    envelope.gain.setValueAtTime(0.48, now + duration * 0.45);
    envelope.gain.linearRampToValueAtTime(0.6, now + duration * 0.65);
    envelope.gain.exponentialRampToValueAtTime(0.001, now + duration);

    noiseNode.connect(bandpass);
    bandpass.connect(highpass);
    highpass.connect(envelope);
    envelope.connect(mainGain);

    noiseNode.start(now);
    noiseNode.stop(now + duration);

    // 2. Page settling tap
    const thumpSize = Math.floor(this.ctx.sampleRate * 0.12);
    const thumpBuffer = this.ctx.createBuffer(1, thumpSize, this.ctx.sampleRate);
    const thumpData = thumpBuffer.getChannelData(0);
    for (let i = 0; i < thumpSize; i++) {
      thumpData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.025));
    }

    const thumpSource = this.ctx.createBufferSource();
    thumpSource.buffer = thumpBuffer;

    const thumpFilter = this.ctx.createBiquadFilter();
    thumpFilter.type = 'lowpass';
    thumpFilter.frequency.setValueAtTime(280, now);

    const thumpEnvelope = this.ctx.createGain();
    const thumpTime = now + duration * 0.72;
    thumpEnvelope.gain.setValueAtTime(0.001, thumpTime);
    thumpEnvelope.gain.linearRampToValueAtTime(thumpGainVal, thumpTime + 0.015);
    thumpEnvelope.gain.exponentialRampToValueAtTime(0.001, thumpTime + 0.1);

    thumpSource.connect(thumpFilter);
    thumpFilter.connect(thumpEnvelope);
    thumpEnvelope.connect(mainGain);

    thumpSource.start(thumpTime);
    thumpSource.stop(thumpTime + 0.12);
  }
}
