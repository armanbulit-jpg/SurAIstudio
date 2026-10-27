import React from 'react';
import {
  Dna,
  Activity,
  Layers,
  Sparkles,
  BookOpen,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { BioPreset } from '../types/music';

interface BioScienceExplorerProps {
  presets: BioPreset[];
  onSelectPresetToGenerate: (preset: BioPreset) => void;
}

export const BioScienceExplorer: React.FC<BioScienceExplorerProps> = ({
  presets,
  onSelectPresetToGenerate,
}) => {
  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Hero Banner */}
      <div className="relative rounded-2xl overflow-hidden border border-teal-500/30 bg-gradient-to-r from-teal-950/70 via-slate-900 to-slate-950 p-6 sm:p-10 shadow-2xl">
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-2 text-xs font-mono text-teal-400 font-semibold tracking-wide uppercase mb-2">
            <Dna className="w-4 h-4 text-teal-400 animate-pulse" />
            <span>Bioscience & Acoustic Sonification</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
            DNA, Neuro-Receptors & Acoustic Resonance
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-2.5 leading-relaxed">
            Discover how biological gene codon sequences (UniProt) and circadian neural frequencies are mathematically transformed into musical scales, harmonic chords, and brainwave entrainment soundscapes.
          </p>
        </div>

        {/* Decorative background image */}
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-35 mix-blend-screen pointer-events-none hidden md:block">
          <img
            src="/src/assets/images/cover_bioacoustic_1793100112208.jpg"
            alt="Bioacoustics"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Scientific Framework 3-Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="w-9 h-9 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-400">
            <Dna className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-white">1. Codon-to-Pitch Mapping</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Each nucleotide triplet (e.g. ATG for Methionine, GAT for Aspartate) maps deterministically to modal scale degrees, creating organic melodies.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
            <Activity className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-white">2. Neural Wave Entrainment</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Stereophonic frequency differentials generate binaural beats (Alpha 10Hz, Theta 6Hz, Gamma 40Hz) shown in EEG studies to foster focus and calm.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="w-9 h-9 rounded-xl bg-sky-500/10 flex items-center justify-center text-sky-400">
            <Layers className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-white">3. Solfeggio 432Hz & 528Hz</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Acoustic carrier waves are calibrated to harmonic resonance tunings, providing physical warmth and rich overtone depth beneath lyrics.
          </p>
        </div>
      </div>

      {/* Preset Cards Catalog */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white tracking-tight">
            Scientific Presets Catalog
          </h3>
          <span className="text-xs font-mono text-slate-500">
            Select any preset to compose with it
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {presets.map((preset) => (
            <div
              key={preset.id}
              className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-teal-500/50 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono text-teal-400 font-semibold px-2 py-0.5 rounded bg-teal-950/60 border border-teal-800/40">
                    {preset.targetFrequencyHz}Hz · {preset.brainwaveEntrainment}
                  </span>
                  <span className="text-xs font-mono text-slate-500">{preset.tempoBpm} BPM</span>
                </div>

                <h4 className="text-base font-bold text-white group-hover:text-teal-300 transition-colors">
                  {preset.name}
                </h4>

                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  {preset.description}
                </p>

                <div className="mt-3 p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 text-[11px] font-mono text-slate-400">
                  <span className="text-teal-400 font-medium">Biological Source:</span> {preset.sequenceOrigin}
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  Style: <span className="text-slate-200">{preset.suggestedGenre}</span>
                </span>

                <button
                  onClick={() => onSelectPresetToGenerate(preset)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold transition-colors shadow-sm"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Create with this Preset</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
