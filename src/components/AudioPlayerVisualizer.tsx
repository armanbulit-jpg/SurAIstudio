import React, { useEffect, useRef, useState } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Share2,
  Download,
  Bookmark,
  BookmarkCheck,
  FileText,
  Image as ImageIcon,
  Radio,
  Sliders,
} from 'lucide-react';
import { Song, LyricLine } from '../types/music';
import { studioAudio } from '../utils/audioEngine';

interface AudioPlayerVisualizerProps {
  song: Song | null;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onToggleFavorite: (songId: string) => void;
  onOpenShareModal: (song: Song) => void;
  onOpenDownloadModal: (song: Song) => void;
  onSeek: (timeSec: number) => void;
}

export const AudioPlayerVisualizer: React.FC<AudioPlayerVisualizerProps> = ({
  song,
  isPlaying,
  onTogglePlay,
  onToggleFavorite,
  onOpenShareModal,
  onOpenDownloadModal,
  onSeek,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const lyricsContainerRef = useRef<HTMLDivElement | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [activeLineIndex, setActiveLineIndex] = useState<number>(-1);

  // Flatten lyrics with section names for teleprompter
  const flatLines = React.useMemo(() => {
    if (!song) return [];
    const list: { section: string; line: LyricLine; globalIndex: number }[] = [];
    let idx = 0;
    song.sections.forEach((sec) => {
      sec.lines.forEach((l) => {
        list.push({ section: sec.sectionType, line: l, globalIndex: idx++ });
      });
    });
    return list;
  }, [song]);

  // Sync with audio engine callbacks
  useEffect(() => {
    studioAudio.onTimeUpdate((time) => {
      setCurrentTime(time);

      // Find active lyric line
      if (flatLines.length > 0) {
        let currentIdx = -1;
        for (let i = 0; i < flatLines.length; i++) {
          if (time >= flatLines[i].line.timestampSec) {
            currentIdx = i;
          } else {
            break;
          }
        }
        setActiveLineIndex(currentIdx);
      }
    });

    studioAudio.onEnded(() => {
      if (isLooping && song) {
        studioAudio.playSong(song, 0);
      }
    });
  }, [flatLines, isLooping, song]);

  // Auto-scroll active lyric line into view smoothly
  useEffect(() => {
    if (activeLineIndex >= 0 && lyricsContainerRef.current) {
      const activeEl = lyricsContainerRef.current.querySelector(
        `[data-lyric-index="${activeLineIndex}"]`
      );
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [activeLineIndex]);

  // Real-time Canvas Visualizer Loop
  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const renderVisualizer = () => {
      animId = requestAnimationFrame(renderVisualizer);

      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      const analyser = studioAudio.analyser;
      const bufferLength = analyser ? analyser.frequencyBinCount : 64;
      const dataArray = new Uint8Array(bufferLength);

      if (analyser && isPlaying) {
        analyser.getByteFrequencyData(dataArray);
      } else {
        // Idle gentle breathing animation
        const t = Date.now() * 0.002;
        for (let i = 0; i < 48; i++) {
          dataArray[i] = Math.max(10, Math.sin(t + i * 0.2) * 20 + 25);
        }
      }

      // Draw mirrored futuristic frequency bars
      const barsToDraw = 48;
      const barWidth = (width / barsToDraw) * 0.65;
      const spacing = (width / barsToDraw) * 0.35;

      for (let i = 0; i < barsToDraw; i++) {
        const val = dataArray[i % dataArray.length] || 10;
        const barHeight = Math.max(4, (val / 255) * height * 0.85);

        const x = i * (barWidth + spacing) + spacing / 2;
        const y = height - barHeight;

        // Gradient from amber gold to rich cyan / teal
        const barGrad = ctx.createLinearGradient(0, height, 0, y);
        barGrad.addColorStop(0, '#d97706');
        barGrad.addColorStop(0.6, '#f59e0b');
        barGrad.addColorStop(1, '#38bdf8');

        ctx.fillStyle = barGrad;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, [3, 3, 0, 0]);
        ctx.fill();
      }

      // Center baseline glow line
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.25)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, height - 1);
      ctx.lineTo(width, height - 1);
      ctx.stroke();
    };

    renderVisualizer();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [isPlaying]);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    setIsMuted(val === 0);
    studioAudio.setVolume(val);
  };

  const toggleMute = () => {
    if (isMuted) {
      setIsMuted(false);
      studioAudio.setVolume(volume || 0.8);
    } else {
      setIsMuted(true);
      studioAudio.setVolume(0);
    }
  };

  const handleSliderSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const target = parseFloat(e.target.value);
    setCurrentTime(target);
    onSeek(target);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (!song) {
    return (
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 text-center text-slate-400">
        <Radio className="w-12 h-12 mx-auto text-slate-600 mb-3 animate-pulse" />
        <h3 className="text-lg font-semibold text-white mb-1">No Song Selected</h3>
        <p className="text-sm text-slate-400 max-w-md mx-auto">
          Generate an AI song above or choose any curated track from the Songs Library to preview and play.
        </p>
      </div>
    );
  }

  const duration = song.durationSec || 90;

  return (
    <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-md">
      {/* Visualizer & Song Header Strip */}
      <div className="relative p-6 sm:p-8 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-b border-slate-800/80">
        {/* Visualizer Canvas overlay */}
        <div className="h-28 w-full mb-6 rounded-xl bg-slate-950/70 border border-slate-800/60 p-2 overflow-hidden relative">
          <canvas
            ref={canvasRef}
            width={800}
            height={112}
            className="w-full h-full block"
          />
          {/* Real-time frequency HUD */}
          <div className="absolute top-2 right-3 flex items-center gap-3 text-[11px] font-mono text-slate-400">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              <span>{song.bpm} BPM</span>
            </span>
            <span>·</span>
            <span>KEY: {song.key}</span>
            {song.bioacousticData?.frequencyHz && (
              <>
                <span>·</span>
                <span className="text-teal-400 font-semibold">
                  {song.bioacousticData.frequencyHz}Hz Bio-Harmonic
                </span>
              </>
            )}
          </div>
        </div>

        {/* Song Info & Controls Grid */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Cover & Titles */}
          <div className="flex items-center gap-4">
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden shrink-0 border border-amber-500/30 shadow-lg shadow-amber-500/10">
              <img
                src={song.coverUrl || '/src/assets/images/cover_sufi_fusion_1793100110421.jpg'}
                alt={song.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = 'none';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 text-xs font-mono text-amber-400/90 mb-1">
                <span>{song.genre}</span>
                <span>·</span>
                <span>{song.mood}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight truncate">
                {song.title}
              </h2>
              {song.subtitle && (
                <p className="text-xs sm:text-sm text-slate-300 truncate">{song.subtitle}</p>
              )}
              <p className="text-xs text-slate-400 mt-1">
                By <span className="text-slate-200 font-medium">{song.artist}</span>
                {song.scaleType && (
                  <span className="ml-2 font-mono text-[11px] text-slate-500">
                    ({song.scaleType})
                  </span>
                )}
                {song.language && (
                  <span className="ml-2 font-mono text-[11px] text-amber-400/80">
                    · {song.language.split(' ')[0]}
                  </span>
                )}
              </p>

              {song.stylePrompt && (
                <div className="flex items-center gap-1.5 mt-2 text-[11px] font-mono text-slate-400 bg-slate-950/60 px-2.5 py-1 rounded-lg border border-slate-800 max-w-md">
                  <span className="text-amber-400 font-semibold shrink-0">STYLE:</span>
                  <span className="truncate">{song.stylePrompt}</span>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons (Save, Share, Download) */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0 flex-wrap">
            <button
              onClick={() => onToggleFavorite(song.id)}
              className={`p-2.5 rounded-lg border transition-colors ${
                song.isFavorite
                  ? 'bg-amber-500/15 border-amber-500/50 text-amber-400'
                  : 'bg-slate-800/80 border-slate-700/80 text-slate-300 hover:text-white'
              }`}
              title={song.isFavorite ? 'Saved to Favorites' : 'Save to Favorites'}
            >
              {song.isFavorite ? (
                <BookmarkCheck className="w-4 h-4" />
              ) : (
                <Bookmark className="w-4 h-4" />
              )}
            </button>

            <button
              onClick={() => onOpenShareModal(song)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-200 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors"
            >
              <Share2 className="w-3.5 h-3.5 text-amber-400" />
              <span>Share</span>
            </button>

            <button
              onClick={() => onOpenDownloadModal(song)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </button>
          </div>
        </div>

        {/* Scrub Bar & Transport Controls */}
        <div className="mt-6 space-y-2">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-slate-400 w-11 tabular-nums">
              {formatTime(currentTime)}
            </span>
            <input
              type="range"
              min={0}
              max={duration}
              step={0.5}
              value={currentTime}
              onChange={handleSliderSeek}
              className="flex-1 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400 focus:outline-none"
            />
            <span className="text-xs font-mono text-slate-400 w-11 tabular-nums text-right">
              {formatTime(duration)}
            </span>
          </div>

          {/* Buttons Row */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
              <button
                onClick={() => onSeek(0)}
                className="p-2 text-slate-400 hover:text-white transition-colors"
                title="Restart"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                onClick={() => setIsLooping(!isLooping)}
                className={`px-2 py-1 text-xs rounded transition-colors font-mono ${
                  isLooping
                    ? 'bg-amber-500/20 text-amber-300'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Loop
              </button>
            </div>

            {/* Big Play/Pause Button */}
            <button
              onClick={onTogglePlay}
              className="w-12 h-12 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 flex items-center justify-center hover:scale-105 active:scale-95 transition-transform shadow-lg shadow-amber-500/25"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 fill-slate-950" />
              ) : (
                <Play className="w-5 h-5 fill-slate-950 ml-0.5" />
              )}
            </button>

            {/* Volume control */}
            <div className="flex items-center gap-2">
              <button
                onClick={toggleMute}
                className="text-slate-400 hover:text-white transition-colors"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-4 h-4 text-red-400" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-16 sm:w-20 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
              />
            </div>
          </div>
        </div>

        {/* Chords Progression Bar */}
        {song.chordsProgression && song.chordsProgression.length > 0 && (
          <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center gap-3 text-xs">
            <span className="text-slate-400 font-mono text-[11px]">CHORD SEQUENCE:</span>
            <div className="flex items-center gap-1.5 font-mono">
              {song.chordsProgression.map((chord, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-amber-300 font-semibold"
                >
                  {chord}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Live Synced Lyrics & Teleprompter */}
      <div className="p-6 sm:p-8 bg-slate-950">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
              Live Lyrics Teleprompter & Translation
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            Click any line to jump audio
          </span>
        </div>

        <div
          ref={lyricsContainerRef}
          className="max-h-72 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-slate-800"
        >
          {flatLines.map((item) => {
            const isActive = item.globalIndex === activeLineIndex;
            return (
              <div
                key={item.globalIndex}
                data-lyric-index={item.globalIndex}
                onClick={() => onSeek(item.line.timestampSec)}
                className={`p-3 rounded-xl cursor-pointer transition-all border ${
                  isActive
                    ? 'bg-amber-500/10 border-amber-500/40 text-white shadow-md'
                    : 'bg-slate-900/40 border-transparent text-slate-400 hover:bg-slate-900/80 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 mb-1">
                  <span className="text-amber-500/80 font-medium">[{item.section}]</span>
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.2 rounded bg-slate-800 text-amber-300 font-semibold">
                      {item.line.chord}
                    </span>
                    <span>{formatTime(item.line.timestampSec)}</span>
                  </div>
                </div>

                <div className={`text-base sm:text-lg font-semibold leading-relaxed ${isActive ? 'text-amber-300 font-bold' : ''}`}>
                  {item.line.lyric}
                </div>

                {item.line.translation && (
                  <div className="text-xs sm:text-sm text-slate-400 mt-0.5 italic">
                    ↳ {item.line.translation}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
