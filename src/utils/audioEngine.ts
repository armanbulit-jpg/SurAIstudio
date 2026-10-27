import { Song } from '../types/music';

// Scale and note frequency mapping
const NOTE_FREQS: Record<string, number> = {
  'C2': 65.41, 'C#2': 69.30, 'D2': 73.42, 'D#2': 77.78, 'E2': 82.41, 'F2': 87.31, 'F#2': 92.50, 'G2': 98.00, 'G#2': 103.83, 'A2': 110.00, 'A#2': 116.54, 'B2': 123.47,
  'C3': 130.81, 'C#3': 138.59, 'D3': 146.83, 'D#3': 155.56, 'E3': 164.81, 'F3': 174.61, 'F#3': 185.00, 'G3': 196.00, 'G#3': 207.65, 'A3': 220.00, 'A#3': 233.08, 'B3': 246.94,
  'C4': 261.63, 'C#4': 277.18, 'D4': 293.66, 'D#4': 311.13, 'E4': 329.63, 'F4': 349.23, 'F#4': 369.99, 'G4': 392.00, 'G#4': 415.30, 'A4': 440.00, 'A#4': 466.16, 'B4': 493.88,
  'C5': 523.25, 'C#5': 554.37, 'D5': 587.33, 'D#5': 622.25, 'E5': 659.25, 'F5': 698.46, 'F#5': 739.99, 'G5': 783.99, 'G#5': 830.61, 'A5': 880.00, 'A#5': 932.33, 'B5': 987.77,
};

// Common chord voicing map
const CHORD_MAP: Record<string, string[]> = {
  'C': ['C3', 'G3', 'C4', 'E4'],
  'Cm': ['C3', 'G3', 'C4', 'D#4'],
  'D': ['D3', 'A3', 'D4', 'F#4'],
  'Dm': ['D3', 'A3', 'D4', 'F4'],
  'E': ['E3', 'B3', 'E4', 'G#4'],
  'Em': ['E3', 'B3', 'E4', 'G4'],
  'F': ['F3', 'C4', 'F4', 'A4'],
  'Fm': ['F3', 'C4', 'F4', 'G#4'],
  'G': ['G3', 'D4', 'G4', 'B4'],
  'Gm': ['G3', 'D4', 'G4', 'A#4'],
  'A': ['A3', 'E4', 'A4', 'C#5'],
  'Am': ['A3', 'E4', 'A4', 'C5'],
  'Bb': ['A#2', 'F3', 'A#3', 'D4'],
  'Bbm': ['A#2', 'F3', 'A#3', 'C#4'],
  'B': ['B2', 'F#3', 'B3', 'D#4'],
  'Bm': ['B2', 'F#3', 'B3', 'D4'],
  'C#m': ['C#3', 'G#3', 'C#4', 'E4'],
  'F#m': ['F#2', 'C#3', 'F#3', 'A3'],
  'G#m': ['G#2', 'D#3', 'G#3', 'B3'],
  'Eb': ['D#3', 'A#3', 'D#4', 'G4'],
  'Ab': ['G#2', 'D#3', 'G#3', 'C4'],
};

export class StudioAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  public analyser: AnalyserNode | null = null;
  private vocalAudio: HTMLAudioElement | null = null;
  private vocalSourceNode: MediaElementAudioSourceNode | null = null;

  private isPlaying = false;
  private currentSong: Song | null = null;
  private startTime = 0;
  private pauseOffset = 0;
  private timerId: number | null = null;
  private onTimeUpdateCallback: ((currentTime: number) => void) | null = null;
  private onEndedCallback: (() => void) | null = null;

  // Active oscillator references for live stop
  private activeNodes: (AudioNode | { stop: (time?: number) => void })[] = [];

  constructor() {
    // Lazy initialize upon user action
  }

  private initContext() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioContextClass();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.85;

      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 256;
      this.analyser.smoothingTimeConstant = 0.8;

      this.masterGain.connect(this.analyser);
      this.analyser.connect(this.ctx.destination);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setVolume(val: number) {
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(Math.max(0, Math.min(1, val)), this.ctx.currentTime);
    }
  }

  public onTimeUpdate(cb: (currentTime: number) => void) {
    this.onTimeUpdateCallback = cb;
  }

  public onEnded(cb: () => void) {
    this.onEndedCallback = cb;
  }

  public playSong(song: Song, offsetSec = 0) {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    this.stopPlayback();

    this.currentSong = song;
    this.isPlaying = true;
    this.pauseOffset = offsetSec;
    this.startTime = this.ctx.currentTime - offsetSec;

    // 1. Play Gemini TTS Vocal Track if available
    if (song.vocalAudioUrl) {
      this.vocalAudio = new Audio(song.vocalAudioUrl);
      this.vocalAudio.currentTime = offsetSec;

      try {
        if (!this.vocalSourceNode) {
          this.vocalSourceNode = this.ctx.createMediaElementSource(this.vocalAudio);
          this.vocalSourceNode.connect(this.masterGain);
        }
      } catch {
        // Element already connected or fallback
      }

      this.vocalAudio.play().catch((e) => console.log('Audio autoplay prevented:', e));
    }

    // 2. Schedule Musical Accompaniment (Chords, Bass, Bioacoustic wave, Beats)
    this.scheduleArrangement(song, offsetSec);

    // 3. Time update ticker
    this.timerId = window.setInterval(() => {
      if (!this.ctx || !this.isPlaying || !this.currentSong) return;
      const current = this.ctx.currentTime - this.startTime;

      if (this.onTimeUpdateCallback) {
        this.onTimeUpdateCallback(Math.min(current, this.currentSong.durationSec));
      }

      if (current >= this.currentSong.durationSec) {
        this.stopPlayback();
        if (this.onEndedCallback) {
          this.onEndedCallback();
        }
      }
    }, 100);
  }

  public pause() {
    if (!this.isPlaying || !this.ctx) return;
    this.pauseOffset = this.ctx.currentTime - this.startTime;
    this.stopPlayback(true);
  }

  public resume() {
    if (this.currentSong && !this.isPlaying) {
      this.playSong(this.currentSong, this.pauseOffset);
    }
  }

  public seek(targetSec: number) {
    if (this.currentSong) {
      const wasPlaying = this.isPlaying;
      this.pauseOffset = targetSec;
      if (wasPlaying) {
        this.playSong(this.currentSong, targetSec);
      } else if (this.onTimeUpdateCallback) {
        this.onTimeUpdateCallback(targetSec);
      }
    }
  }

  public stopPlayback(preserveOffset = false) {
    this.isPlaying = false;
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }

    if (this.vocalAudio) {
      this.vocalAudio.pause();
      if (!preserveOffset) {
        this.vocalAudio.currentTime = 0;
      }
    }

    // Stop and disconnect synth nodes
    this.activeNodes.forEach((node) => {
      try {
        if ('stop' in node && typeof node.stop === 'function') {
          node.stop();
        }
        if ('disconnect' in node && typeof (node as any).disconnect === 'function') {
          (node as any).disconnect();
        }
      } catch {
        // already stopped
      }
    });
    this.activeNodes = [];

    if (!preserveOffset) {
      this.pauseOffset = 0;
    }
  }

  // Synthesizes chords, bass, drums and bioacoustic tones
  private scheduleArrangement(song: Song, offsetSec: number) {
    if (!this.ctx || !this.masterGain) return;

    const ctx = this.ctx;
    const now = ctx.currentTime;
    const bpm = song.bpm || 100;
    const beatDuration = 60 / bpm;
    const barDuration = beatDuration * 4;
    const totalBars = Math.ceil(song.durationSec / barDuration);

    const chords = song.chordsProgression && song.chordsProgression.length > 0
      ? song.chordsProgression
      : ['Dm', 'Bb', 'C', 'Am'];

    // --- Bioacoustic Carrier / Binaural Drone ---
    if (song.bioacousticData && song.bioacousticData.frequencyHz) {
      const baseFreq = song.bioacousticData.frequencyHz;
      const beatDelta = song.bioacousticData.binauralBeatHz || 10;

      // Left Channel Oscillator
      const oscL = ctx.createOscillator();
      const panL = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
      const gainBio = ctx.createGain();

      oscL.type = 'sine';
      oscL.frequency.value = baseFreq;
      gainBio.gain.setValueAtTime(0.08, now);

      if (panL) {
        panL.pan.value = -0.8;
        oscL.connect(panL);
        panL.connect(gainBio);
      } else {
        oscL.connect(gainBio);
      }

      // Right Channel Oscillator (+ delta for binaural entrainment)
      const oscR = ctx.createOscillator();
      const panR = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
      oscR.type = 'sine';
      oscR.frequency.value = baseFreq + beatDelta;

      if (panR) {
        panR.pan.value = 0.8;
        oscR.connect(panR);
        panR.connect(gainBio);
      } else {
        oscR.connect(gainBio);
      }

      gainBio.connect(this.masterGain);

      oscL.start(now);
      oscR.start(now);
      const remain = song.durationSec - offsetSec;
      if (remain > 0) {
        oscL.stop(now + remain);
        oscR.stop(now + remain);
      }
      this.activeNodes.push(oscL, oscR, gainBio);
    }

    // --- Music Loop Scheduling (Chords + Bass + Rhythm) ---
    for (let bar = 0; bar < totalBars; bar++) {
      const barStartTime = bar * barDuration;
      if (barStartTime + barDuration < offsetSec) continue;

      const chordName = chords[bar % chords.length] || 'Dm';
      const cleanChord = chordName.trim();
      const chordNotes = CHORD_MAP[cleanChord] || CHORD_MAP['Dm'];

      const scheduleTime = now + Math.max(0, barStartTime - offsetSec);
      if (scheduleTime < now) continue;

      // 1. Chords (Warm Polyphonic Pad)
      chordNotes.forEach((noteName, idx) => {
        const freq = NOTE_FREQS[noteName] || 220;
        const osc = ctx.createOscillator();
        const chordGain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        osc.type = idx === 0 ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(freq, scheduleTime);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1400, scheduleTime);

        // Gentle envelope
        chordGain.gain.setValueAtTime(0, scheduleTime);
        chordGain.gain.linearRampToValueAtTime(0.12, scheduleTime + 0.3);
        chordGain.gain.exponentialRampToValueAtTime(0.001, scheduleTime + barDuration * 0.95);

        osc.connect(filter);
        filter.connect(chordGain);
        chordGain.connect(this.masterGain!);

        osc.start(scheduleTime);
        osc.stop(scheduleTime + barDuration);
        this.activeNodes.push(osc, chordGain, filter);
      });

      // 2. Bassline (Sub 808 note)
      const rootNote = chordNotes[0] || 'D3';
      const bassFreq = (NOTE_FREQS[rootNote] || 146.83) / 2; // drop an octave
      const bassOsc = ctx.createOscillator();
      const bassGain = ctx.createGain();

      bassOsc.type = 'triangle';
      bassOsc.frequency.setValueAtTime(bassFreq, scheduleTime);

      bassGain.gain.setValueAtTime(0.24, scheduleTime);
      bassGain.gain.exponentialRampToValueAtTime(0.001, scheduleTime + barDuration * 0.85);

      bassOsc.connect(bassGain);
      bassGain.connect(this.masterGain!);

      bassOsc.start(scheduleTime);
      bassOsc.stop(scheduleTime + barDuration);
      this.activeNodes.push(bassOsc, bassGain);

      // 3. Rhythm & Percussion Beats
      const isNoha = song.compositionType === 'noha' || song.genre?.toLowerCase().includes('noha') || song.genre?.toLowerCase().includes('marsiya');

      for (let beat = 0; beat < 4; beat++) {
        const beatTime = scheduleTime + beat * beatDuration;
        if (beatTime < now) continue;

        if (isNoha) {
          // Solemn Matami / Heartbeat double-thud on primary beats
          if (beat === 0 || beat === 2) {
            this.triggerHeartbeatMatam(beatTime, 1.0);
            this.triggerHeartbeatMatam(beatTime + 0.22, 0.65); // resonant echo
          }
        } else {
          // Standard modern beats
          // Kick on beats 0 and 2
          if (beat === 0 || beat === 2) {
            this.triggerKick(beatTime);
          }

          // Snare / Rim on beats 1 and 3
          if (beat === 1 || beat === 3) {
            this.triggerSnare(beatTime);
          }

          // Hi-Hat on every 8th note
          this.triggerHiHat(beatTime);
          this.triggerHiHat(beatTime + beatDuration / 2);
        }
      }
    }
  }

  private triggerHeartbeatMatam(time: number, intensity = 1.0) {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(62, time);
    osc.frequency.exponentialRampToValueAtTime(32, time + 0.25);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(160, time);

    gain.gain.setValueAtTime(0.38 * intensity, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.28);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(time);
    osc.stop(time + 0.3);
    this.activeNodes.push(osc, gain, filter);
  }

  private triggerKick(time: number) {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.frequency.setValueAtTime(130, time);
    osc.frequency.exponentialRampToValueAtTime(38, time + 0.15);

    gain.gain.setValueAtTime(0.35, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.18);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(time);
    osc.stop(time + 0.2);
    this.activeNodes.push(osc, gain);
  }

  private triggerSnare(time: number) {
    if (!this.ctx || !this.masterGain) return;
    // Tone component
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(200, time);

    oscGain.gain.setValueAtTime(0.15, time);
    oscGain.gain.exponentialRampToValueAtTime(0.01, time + 0.12);

    osc.connect(oscGain);
    oscGain.connect(this.masterGain);

    osc.start(time);
    osc.stop(time + 0.13);
    this.activeNodes.push(osc, oscGain);
  }

  private triggerHiHat(time: number) {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'square';
    osc.frequency.setValueAtTime(6500, time);

    filter.type = 'highpass';
    filter.frequency.setValueAtTime(7000, time);

    gain.gain.setValueAtTime(0.04, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.05);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(time);
    osc.stop(time + 0.06);
    this.activeNodes.push(osc, gain, filter);
  }

  // Generate downloadable audio file as standard Stereo 16-bit 44.1kHz WAV Blob
  public async renderToWavBlob(song: Song): Promise<Blob> {
    const sampleRate = 44100;
    const duration = Math.min(song.durationSec || 90, 180);
    const offlineCtx = new OfflineAudioContext(2, sampleRate * duration, sampleRate);

    const master = offlineCtx.createGain();
    master.gain.value = 0.85;
    master.connect(offlineCtx.destination);

    const bpm = song.bpm || 100;
    const beatDuration = 60 / bpm;
    const barDuration = beatDuration * 4;
    const totalBars = Math.ceil(duration / barDuration);
    const chords = song.chordsProgression?.length ? song.chordsProgression : ['Dm', 'Bb', 'C', 'Am'];

    // Bioacoustic sine waves
    if (song.bioacousticData && song.bioacousticData.frequencyHz) {
      const baseFreq = song.bioacousticData.frequencyHz;
      const beatDelta = song.bioacousticData.binauralBeatHz || 10;

      const oscL = offlineCtx.createOscillator();
      const panL = offlineCtx.createStereoPanner();
      const bioGain = offlineCtx.createGain();

      oscL.type = 'sine';
      oscL.frequency.value = baseFreq;
      bioGain.gain.value = 0.08;
      panL.pan.value = -0.8;
      oscL.connect(panL);
      panL.connect(bioGain);
      bioGain.connect(master);
      oscL.start(0);
      oscL.stop(duration);

      const oscR = offlineCtx.createOscillator();
      const panR = offlineCtx.createStereoPanner();
      oscR.type = 'sine';
      oscR.frequency.value = baseFreq + beatDelta;
      panR.pan.value = 0.8;
      oscR.connect(panR);
      panR.connect(bioGain);
      oscR.start(0);
      oscR.stop(duration);
    }

    // Arrangement
    for (let bar = 0; bar < totalBars; bar++) {
      const barStartTime = bar * barDuration;
      if (barStartTime >= duration) break;

      const chordNotes = CHORD_MAP[chords[bar % chords.length]] || CHORD_MAP['Dm'];

      // Chords
      chordNotes.forEach((noteName, idx) => {
        const freq = NOTE_FREQS[noteName] || 220;
        const osc = offlineCtx.createOscillator();
        const chordGain = offlineCtx.createGain();
        osc.type = idx === 0 ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(freq, barStartTime);

        chordGain.gain.setValueAtTime(0, barStartTime);
        chordGain.gain.linearRampToValueAtTime(0.12, barStartTime + 0.3);
        chordGain.gain.exponentialRampToValueAtTime(0.001, barStartTime + barDuration * 0.95);

        osc.connect(chordGain);
        chordGain.connect(master);
        osc.start(barStartTime);
        osc.stop(barStartTime + barDuration);
      });

      // Bass
      const rootNote = chordNotes[0] || 'D3';
      const bassFreq = (NOTE_FREQS[rootNote] || 146.83) / 2;
      const bassOsc = offlineCtx.createOscillator();
      const bassGain = offlineCtx.createGain();
      bassOsc.type = 'triangle';
      bassOsc.frequency.setValueAtTime(bassFreq, barStartTime);
      bassGain.gain.setValueAtTime(0.24, barStartTime);
      bassGain.gain.exponentialRampToValueAtTime(0.001, barStartTime + barDuration * 0.85);
      bassOsc.connect(bassGain);
      bassGain.connect(master);
      bassOsc.start(barStartTime);
      bassOsc.stop(barStartTime + barDuration);

      // Drums & Percussion
      const isNoha = song.compositionType === 'noha' || song.genre?.toLowerCase().includes('noha') || song.genre?.toLowerCase().includes('marsiya');

      for (let beat = 0; beat < 4; beat++) {
        const beatTime = barStartTime + beat * beatDuration;
        if (beatTime >= duration) break;

        if (isNoha) {
          if (beat === 0 || beat === 2) {
            const heartOsc = offlineCtx.createOscillator();
            const heartGain = offlineCtx.createGain();
            const filter = offlineCtx.createBiquadFilter();

            heartOsc.type = 'sine';
            heartOsc.frequency.setValueAtTime(62, beatTime);
            heartOsc.frequency.exponentialRampToValueAtTime(32, beatTime + 0.25);

            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(160, beatTime);

            heartGain.gain.setValueAtTime(0.38, beatTime);
            heartGain.gain.exponentialRampToValueAtTime(0.001, beatTime + 0.28);

            heartOsc.connect(filter);
            filter.connect(heartGain);
            heartGain.connect(master);
            heartOsc.start(beatTime);
            heartOsc.stop(beatTime + 0.3);
          }
        } else {
          if (beat === 0 || beat === 2) {
            const kickOsc = offlineCtx.createOscillator();
            const kickGain = offlineCtx.createGain();
            kickOsc.frequency.setValueAtTime(130, beatTime);
            kickOsc.frequency.exponentialRampToValueAtTime(38, beatTime + 0.15);
            kickGain.gain.setValueAtTime(0.35, beatTime);
            kickGain.gain.exponentialRampToValueAtTime(0.001, beatTime + 0.18);
            kickOsc.connect(kickGain);
            kickGain.connect(master);
            kickOsc.start(beatTime);
            kickOsc.stop(beatTime + 0.2);
          }
        }
      }
    }

    const renderedBuffer = await offlineCtx.startRendering();
    return audioBufferToWavBlob(renderedBuffer);
  }
}

// Helper: Convert Web Audio AudioBuffer to standard 16-bit PCM WAV Blob
function audioBufferToWavBlob(buffer: AudioBuffer): Blob {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;
  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;

  const length = buffer.length * blockAlign;
  const bufferLength = 44 + length;
  const arrayBuffer = new ArrayBuffer(bufferLength);
  const view = new DataView(arrayBuffer);

  // RIFF identifier
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + length, true);
  writeString(view, 8, 'WAVE');
  // format chunk identifier
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, format, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitDepth, true);
  // data chunk identifier
  writeString(view, 36, 'data');
  view.setUint32(40, length, true);

  // Write interleaved PCM samples
  const channels: Float32Array[] = [];
  for (let c = 0; c < numChannels; c++) {
    channels.push(buffer.getChannelData(c));
  }

  let offset = 44;
  for (let i = 0; i < buffer.length; i++) {
    for (let c = 0; c < numChannels; c++) {
      let sample = channels[c][i];
      sample = Math.max(-1, Math.min(1, sample));
      const intSample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
      view.setInt16(offset, intSample, true);
      offset += 2;
    }
  }

  return new Blob([arrayBuffer], { type: 'audio/wav' });
}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

// Shared singleton instance for the app
export const studioAudio = new StudioAudioEngine();
