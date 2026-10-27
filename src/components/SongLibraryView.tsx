import React, { useState } from 'react';
import {
  Search,
  Play,
  Pause,
  Bookmark,
  BookmarkCheck,
  Download,
  Share2,
  Trash2,
  Music,
  Clock,
  Sparkles,
  Dna,
} from 'lucide-react';
import { Song } from '../types/music';

interface SongLibraryViewProps {
  curatedSongs: Song[];
  userHistory: Song[];
  currentSong: Song | null;
  isPlaying: boolean;
  onPlaySong: (song: Song) => void;
  onTogglePlay: () => void;
  onToggleFavorite: (songId: string) => void;
  onDeleteFromHistory: (songId: string) => void;
  onOpenShareModal: (song: Song) => void;
  onOpenDownloadModal: (song: Song) => void;
  initialTab?: 'curated' | 'history';
}

export const SongLibraryView: React.FC<SongLibraryViewProps> = ({
  curatedSongs,
  userHistory,
  currentSong,
  isPlaying,
  onPlaySong,
  onTogglePlay,
  onToggleFavorite,
  onDeleteFromHistory,
  onOpenShareModal,
  onOpenDownloadModal,
  initialTab = 'curated',
}) => {
  const [activeTab, setActiveTab] = useState<'curated' | 'history'>(initialTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string>('All');

  const sourceList = activeTab === 'curated' ? curatedSongs : userHistory;

  const genres = ['All', 'Noha & Marsiya', 'Urdu Ghazal', 'Lo-Fi Chill', 'Sufi Rock', 'Bioacoustic', 'Electronic'];

  const filteredSongs = sourceList.filter((song) => {
    const matchesSearch =
      song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (song.subtitle && song.subtitle.toLowerCase().includes(searchQuery.toLowerCase())) ||
      song.genre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (song.language && song.language.toLowerCase().includes(searchQuery.toLowerCase())) ||
      song.sections.some((s) => s.lines.some((l) => l.lyric.toLowerCase().includes(searchQuery.toLowerCase())));

    const matchesGenre =
      selectedGenre === 'All' ||
      (selectedGenre === 'Noha & Marsiya'
        ? song.compositionType === 'noha' || song.genre.toLowerCase().includes('noha') || song.genre.toLowerCase().includes('marsiya')
        : song.genre.toLowerCase().includes(selectedGenre.toLowerCase()));

    return matchesSearch && matchesGenre;
  });

  return (
    <div className="space-y-6">
      {/* Header & Mode Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Music className="w-5 h-5 text-amber-400" />
            <span>{activeTab === 'curated' ? 'Songs Library' : 'My Generated Songs'}</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {activeTab === 'curated'
              ? 'Browse studio master tracks across Sufi, Lo-Fi, Pop, and Bioacoustic sonification.'
              : `Aapki banayi hui tamam songs ki history (${userHistory.length} songs saved).`}
          </p>
        </div>

        {/* Library Switcher */}
        <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-xl border border-slate-800 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('curated')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'curated'
                ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Studio Masters ({curatedSongs.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'history'
                ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            My Creations ({userHistory.length})
          </button>
        </div>
      </div>

      {/* Search & Genre Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, lyrics, or genre..."
            className="w-full pl-10 pr-4 py-2 bg-slate-900/90 border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400"
          />
        </div>

        {/* Genre buttons */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {genres.map((g) => (
            <button
              key={g}
              onClick={() => setSelectedGenre(g)}
              className={`px-3 py-1.5 text-xs rounded-lg whitespace-nowrap shrink-0 transition-colors ${
                selectedGenre === g
                  ? 'bg-slate-800 text-amber-300 font-medium border border-amber-500/30'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800/80'
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* Song Cards Grid */}
      {filteredSongs.length === 0 ? (
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-12 text-center text-slate-400">
          <Music className="w-10 h-10 mx-auto text-slate-600 mb-2" />
          <p className="text-sm font-medium text-slate-300">No songs found</p>
          <p className="text-xs text-slate-500 mt-1">
            {activeTab === 'history'
              ? 'Aapne abhi koi song generate nahi kiya. "Studio Generator" par jakar pehla gana banayein!'
              : 'Try searching for different keywords or select "All".'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSongs.map((song) => {
            const isThisPlaying = currentSong?.id === song.id && isPlaying;
            const isSelected = currentSong?.id === song.id;

            return (
              <div
                key={song.id}
                className={`group relative bg-slate-900/90 border rounded-2xl p-4 sm:p-5 transition-all hover:border-slate-700 flex flex-col justify-between ${
                  isSelected
                    ? 'border-amber-500/50 shadow-lg shadow-amber-500/5 bg-slate-900'
                    : 'border-slate-800/80'
                }`}
              >
                <div>
                  {/* Top Cover & Title Row */}
                  <div className="flex items-start gap-3.5 mb-3">
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-slate-700/80 bg-slate-950">
                      <img
                        src={song.coverUrl || '/src/assets/images/cover_sufi_fusion_1793100110421.jpg'}
                        alt={song.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          (e.currentTarget as HTMLElement).style.display = 'none';
                        }}
                      />
                      {/* Play overlay */}
                      <button
                        onClick={() => {
                          if (isSelected) {
                            onTogglePlay();
                          } else {
                            onPlaySong(song);
                          }
                        }}
                        className="absolute inset-0 bg-slate-950/50 hover:bg-slate-950/70 flex items-center justify-center transition-colors"
                      >
                        {isThisPlaying ? (
                          <Pause className="w-6 h-6 fill-amber-400 text-amber-400" />
                        ) : (
                          <Play className="w-6 h-6 fill-amber-400 text-amber-400 ml-0.5" />
                        )}
                      </button>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 text-[11px] font-mono text-amber-400/90 mb-0.5 truncate">
                        {song.compositionType === 'noha' ? (
                          <span className="text-red-400 font-semibold">NOHA / MARSIYA</span>
                        ) : (
                          <span>{song.genre}</span>
                        )}
                        <span>·</span>
                        <span>{song.bpm} BPM</span>
                        {song.language && (
                          <>
                            <span>·</span>
                            <span className="text-slate-400">{song.language.split(' ')[0]}</span>
                          </>
                        )}
                      </div>
                      <h3 className="text-base font-bold text-white tracking-tight truncate group-hover:text-amber-300 transition-colors">
                        {song.title}
                      </h3>
                      {song.subtitle && (
                        <p className="text-xs text-slate-400 truncate">{song.subtitle}</p>
                      )}
                      <p className="text-xs text-slate-400 mt-0.5 truncate">
                        By {song.artist}
                      </p>
                    </div>
                  </div>

                  {/* Summary / Lyrics Snippet */}
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-3">
                    {song.summary || song.sections[0]?.lines[0]?.lyric}
                  </p>

                  {/* Bioacoustic Tag (if any) */}
                  {song.bioacousticData?.frequencyHz && (
                    <div className="mb-3 flex items-center gap-1.5 text-[11px] font-mono text-teal-300 bg-teal-950/40 border border-teal-800/40 px-2 py-1 rounded-lg">
                      <Dna className="w-3 h-3 text-teal-400 shrink-0" />
                      <span className="truncate">{song.bioacousticData.frequencyHz}Hz Bio-Harmonic</span>
                    </div>
                  )}
                </div>

                {/* Bottom Action Footer */}
                <div className="pt-3 border-t border-slate-800/70 flex items-center justify-between">
                  <div className="flex items-center gap-1 text-[11px] font-mono text-slate-400">
                    <Clock className="w-3 h-3 text-slate-500" />
                    <span>{Math.floor(song.durationSec / 60)}:{(song.durationSec % 60).toString().padStart(2, '0')}</span>
                    <span>·</span>
                    <span>{song.key}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onToggleFavorite(song.id)}
                      className={`p-1.5 rounded-lg border transition-colors ${
                        song.isFavorite
                          ? 'text-amber-400 border-amber-500/40 bg-amber-500/10'
                          : 'text-slate-400 border-transparent hover:text-white hover:bg-slate-800'
                      }`}
                      title={song.isFavorite ? 'Saved' : 'Save'}
                    >
                      {song.isFavorite ? (
                        <BookmarkCheck className="w-4 h-4" />
                      ) : (
                        <Bookmark className="w-4 h-4" />
                      )}
                    </button>

                    <button
                      onClick={() => onOpenShareModal(song)}
                      className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                      title="Share Song"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => onOpenDownloadModal(song)}
                      className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                      title="Download Song"
                    >
                      <Download className="w-4 h-4" />
                    </button>

                    {activeTab === 'history' && (
                      <button
                        onClick={() => onDeleteFromHistory(song.id)}
                        className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg hover:bg-red-950/40 transition-colors ml-1"
                        title="Delete from history"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
