export interface LyricLine {
  lyric: string;
  translation?: string;
  timestampSec: number;
  chord: string;
  vocalCue?: string;
}

export interface LyricSection {
  sectionType: string; // e.g. "Intro", "Verse 1", "Chorus", "Verse 2", "Bridge", "Outro"
  lines: LyricLine[];
}

export interface BioacousticData {
  frequencyHz?: number;
  binauralBeatHz?: number;
  biologicalMechanism?: string;
  citationReference?: string;
}

export interface Song {
  id: string;
  title: string;
  subtitle?: string;
  artist: string;
  genre: string;
  mood: string;
  key: string;
  bpm: number;
  durationSec: number;
  scaleType?: string;
  summary: string;
  chordsProgression: string[];
  sections: LyricSection[];
  bioacousticData?: BioacousticData;
  instrumentation?: string[];
  coverUrl?: string;
  vocalAudioUrl?: string; // Gemini TTS generated vocal WAV
  compositionType?: 'song' | 'noha';
  language?: string;
  stylePrompt?: string;
  createdAt: string;
  isFavorite?: boolean;
}

export interface BioPreset {
  id: string;
  name: string;
  description: string;
  targetFrequencyHz: number;
  brainwaveEntrainment: string;
  sequenceOrigin: string;
  tempoBpm: number;
  mood: string;
  suggestedGenre: string;
}
