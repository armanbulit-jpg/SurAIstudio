import React, { useState, useEffect } from 'react';
import { TopNavbar } from './components/TopNavbar';
import { AudioPlayerVisualizer } from './components/AudioPlayerVisualizer';
import { SongGeneratorForm } from './components/SongGeneratorForm';
import { SongLibraryView } from './components/SongLibraryView';
import { BioScienceExplorer } from './components/BioScienceExplorer';
import { ShareDownloadModal } from './components/ShareDownloadModal';
import { CURATED_LIBRARY } from './data/libraryPresets';
import { Song, BioPreset } from './types/music';
import { studioAudio } from './utils/audioEngine';
import { Sparkles, Music, Dna, History, ArrowRight } from 'lucide-react';

const FALLBACK_PRESETS: BioPreset[] = [
  {
    id: 'bio-dopamine',
    name: 'Dopamine DRD2 Receptor Sonification',
    description: 'Translates human Dopamine Receptor D2 codon sequences into an uplifting harmonic pentatonic scale with 528Hz Solfeggio resonance.',
    targetFrequencyHz: 528,
    brainwaveEntrainment: 'Alpha (10Hz focus & reward)',
    sequenceOrigin: 'UniProt P14416 (DRD2_HUMAN) - Chromosome 11q23.2',
    tempoBpm: 110,
    mood: 'Euphoric & Mentally Uplifting',
    suggestedGenre: 'Lo-Fi Melodic Beats & Ambient',
  },
  {
    id: 'bio-circadian',
    name: 'Circadian Melatonin Synchronization',
    description: 'Designed around the suprachiasmatic biological clock with gentle 432Hz tuning and 6Hz Theta waves for deep peace and evening wind-down.',
    targetFrequencyHz: 432,
    brainwaveEntrainment: 'Theta (6Hz deep relaxation & REM)',
    sequenceOrigin: 'PER2 Period Circadian Regulator - PubMed ID 31481682',
    tempoBpm: 72,
    mood: 'Soulful, Dreamy & Calming',
    suggestedGenre: 'Sufi Ambient & Acoustic Ghazal',
  },
  {
    id: 'bio-cellular',
    name: 'Mitochondrial ATP Energy Pulse',
    description: 'Rhythmic acoustic driving beat emulating cellular respiration cycles (Krebs cycle) with harmonic 111Hz regenerative acoustic overtone.',
    targetFrequencyHz: 111,
    brainwaveEntrainment: 'Gamma (40Hz peak cognitive flow)',
    sequenceOrigin: 'ATP Synthase Subunit Alpha (UniProt P25705)',
    tempoBpm: 128,
    mood: 'Energetic, High-Vibration & Cyber',
    suggestedGenre: 'Cyber Synthwave & EDM',
  },
  {
    id: 'bio-oxytocin',
    name: 'Oxytocin Emotional Bonding Harmonic',
    description: 'Warm acoustic frequencies matched to the neuro-peptide Oxytocin receptor resonance for emotional elevation, empathy, and romantic warmth.',
    targetFrequencyHz: 432,
    brainwaveEntrainment: 'Alpha (8Hz heart-brain coherence)',
    sequenceOrigin: 'OXTR Oxytocin Receptor - UniProt P30559',
    tempoBpm: 84,
    mood: 'Romantic, Heartfelt & Nostalgic',
    suggestedGenre: 'Acoustic Folk & Urdu Pop',
  },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<'create' | 'library' | 'history' | 'science'>('create');
  const [currentSong, setCurrentSong] = useState<Song>(CURATED_LIBRARY[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [userHistory, setUserHistory] = useState<Song[]>([]);
  const [curatedList, setCuratedList] = useState<Song[]>(CURATED_LIBRARY);
  const [bioPresets, setBioPresets] = useState<BioPreset[]>(FALLBACK_PRESETS);

  // Modal State
  const [modalSong, setModalSong] = useState<Song | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'share' | 'download'>('share');

  // Load user history & presets on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('surai_user_history');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setUserHistory(parsed);
        }
      }
    } catch (e) {
      console.error('Failed to parse history:', e);
    }

    // Fetch science presets from backend
    fetch('/api/science/bioacoustic-presets')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.presets)) {
          setBioPresets(data.presets);
        }
      })
      .catch((e) => console.log('Using local fallback science presets:', e));
  }, []);

  const saveHistory = (newHistory: Song[]) => {
    setUserHistory(newHistory);
    try {
      localStorage.setItem('surai_user_history', JSON.stringify(newHistory));
    } catch (e) {
      console.error('Failed to persist history:', e);
    }
  };

  const handleTogglePlay = () => {
    if (isPlaying) {
      studioAudio.pause();
      setIsPlaying(false);
    } else {
      studioAudio.resume();
      if (!studioAudio.analyser) {
        studioAudio.playSong(currentSong, 0);
      }
      setIsPlaying(true);
    }
  };

  const handlePlaySong = (song: Song) => {
    setCurrentSong(song);
    setIsPlaying(true);
    studioAudio.playSong(song, 0);
  };

  const handleSeek = (timeSec: number) => {
    studioAudio.seek(timeSec);
  };

  const handleSongGenerated = (newSong: Song) => {
    const updatedHistory = [newSong, ...userHistory];
    saveHistory(updatedHistory);
    setCurrentSong(newSong);
    setIsPlaying(true);
    studioAudio.playSong(newSong, 0);
    // Smooth scroll to audio player
    window.scrollTo({ top: 350, behavior: 'smooth' });
  };

  const handleToggleFavorite = (songId: string) => {
    // Toggle in current song
    if (currentSong.id === songId) {
      setCurrentSong((prev) => ({ ...prev, isFavorite: !prev.isFavorite }));
    }

    // Toggle in history
    const updatedHistory = userHistory.map((s) =>
      s.id === songId ? { ...s, isFavorite: !s.isFavorite } : s
    );
    saveHistory(updatedHistory);

    // Toggle in curated list
    setCuratedList((prev) =>
      prev.map((s) => (s.id === songId ? { ...s, isFavorite: !s.isFavorite } : s))
    );
  };

  const handleDeleteFromHistory = (songId: string) => {
    const updated = userHistory.filter((s) => s.id !== songId);
    saveHistory(updated);
  };

  const handleOpenShareModal = (song: Song) => {
    setModalSong(song);
    setModalType('share');
    setIsModalOpen(true);
  };

  const handleOpenDownloadModal = (song: Song) => {
    setModalSong(song);
    setModalType('download');
    setIsModalOpen(true);
  };

  const handleSelectPresetToGenerate = (preset: BioPreset) => {
    setActiveTab('create');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500/25 selection:text-amber-200">
      {/* Top Bar */}
      <TopNavbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onNewSongClick={() => {
          setActiveTab('create');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        historyCount={userHistory.length}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        {/* Hero Banner Strip */}
        <section className="relative rounded-3xl overflow-hidden border border-slate-800 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 p-6 sm:p-10 shadow-2xl">
          <div className="relative z-10 max-w-2xl space-y-3">
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400 font-semibold uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>AI Music & Bioacoustic Production</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
              Create AI Songs With Lyrics & Studio Sound
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl">
              Apni pasand ke lyrics ya prompt daalein. SurAI aapke alfaaz ko mukammal audio gane, live waveform player, download options aur social media share cards mein tabdeel karta hai.
            </p>
            <div className="pt-2 flex items-center gap-3 flex-wrap">
              <button
                onClick={() => {
                  setActiveTab('create');
                  window.scrollTo({ top: 400, behavior: 'smooth' });
                }}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-bold text-xs sm:text-sm hover:from-amber-300 hover:to-amber-400 transition-all shadow-lg shadow-amber-500/20 active:scale-95 flex items-center gap-2"
              >
                <Music className="w-4 h-4" />
                <span>Start Composing</span>
              </button>
              <button
                onClick={() => setActiveTab('library')}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-medium text-xs sm:text-sm transition-colors flex items-center gap-2"
              >
                <span>Browse Library</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Background studio image with contrast scrim */}
          <div className="absolute top-0 right-0 w-full sm:w-3/5 h-full opacity-25 sm:opacity-40 mix-blend-screen pointer-events-none">
            <img
              src="/src/assets/images/hero_ai_music_studio_1793100110177.jpg"
              alt="Studio"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/70 to-transparent" />
          </div>
        </section>

        {/* Dynamic Tab Views */}
        {activeTab === 'create' && (
          <div className="space-y-10">
            {/* Song Generator Form */}
            <SongGeneratorForm
              onSongGenerated={handleSongGenerated}
              bioPresets={bioPresets}
            />

            {/* Live Audio Player & Karaoke Visualizer */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-300 uppercase tracking-wider">
                  <Music className="w-4 h-4 text-amber-400" />
                  <span>Interactive Audio Player & Waveform Visualizer</span>
                </div>
                <span className="text-xs text-slate-500 font-mono">
                  Real-time Web Audio API & Synced Lyrics
                </span>
              </div>
              <AudioPlayerVisualizer
                song={currentSong}
                isPlaying={isPlaying}
                onTogglePlay={handleTogglePlay}
                onToggleFavorite={handleToggleFavorite}
                onOpenShareModal={handleOpenShareModal}
                onOpenDownloadModal={handleOpenDownloadModal}
                onSeek={handleSeek}
              />
            </div>
          </div>
        )}

        {activeTab === 'library' && (
          <div className="space-y-8">
            {/* Active player on top if song loaded */}
            <AudioPlayerVisualizer
              song={currentSong}
              isPlaying={isPlaying}
              onTogglePlay={handleTogglePlay}
              onToggleFavorite={handleToggleFavorite}
              onOpenShareModal={handleOpenShareModal}
              onOpenDownloadModal={handleOpenDownloadModal}
              onSeek={handleSeek}
            />

            {/* Library Grid */}
            <SongLibraryView
              curatedSongs={curatedList}
              userHistory={userHistory}
              currentSong={currentSong}
              isPlaying={isPlaying}
              onPlaySong={handlePlaySong}
              onTogglePlay={handleTogglePlay}
              onToggleFavorite={handleToggleFavorite}
              onDeleteFromHistory={handleDeleteFromHistory}
              onOpenShareModal={handleOpenShareModal}
              onOpenDownloadModal={handleOpenDownloadModal}
              initialTab="curated"
            />
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-8">
            <AudioPlayerVisualizer
              song={currentSong}
              isPlaying={isPlaying}
              onTogglePlay={handleTogglePlay}
              onToggleFavorite={handleToggleFavorite}
              onOpenShareModal={handleOpenShareModal}
              onOpenDownloadModal={handleOpenDownloadModal}
              onSeek={handleSeek}
            />

            <SongLibraryView
              curatedSongs={curatedList}
              userHistory={userHistory}
              currentSong={currentSong}
              isPlaying={isPlaying}
              onPlaySong={handlePlaySong}
              onTogglePlay={handleTogglePlay}
              onToggleFavorite={handleToggleFavorite}
              onDeleteFromHistory={handleDeleteFromHistory}
              onOpenShareModal={handleOpenShareModal}
              onOpenDownloadModal={handleOpenDownloadModal}
              initialTab="history"
            />
          </div>
        )}

        {activeTab === 'science' && (
          <div className="space-y-8">
            <BioScienceExplorer
              presets={bioPresets}
              onSelectPresetToGenerate={handleSelectPresetToGenerate}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 mt-16 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300">SurAI Music Studio</span>
            <span>·</span>
            <span>AI Song Generator with Lyrics, Bioacoustics, Audio Preview & Social Sharing</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <button onClick={() => setActiveTab('create')} className="hover:text-amber-400 transition-colors">
              Generator
            </button>
            <button onClick={() => setActiveTab('library')} className="hover:text-amber-400 transition-colors">
              Library
            </button>
            <button onClick={() => setActiveTab('science')} className="hover:text-teal-400 transition-colors">
              Bioscience
            </button>
          </div>
        </div>
      </footer>

      {/* Share / Download Modal */}
      <ShareDownloadModal
        song={modalSong}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        type={modalType}
      />
    </div>
  );
}
