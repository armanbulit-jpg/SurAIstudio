import React from 'react';
import { Music, Sparkles } from 'lucide-react';

interface TopNavbarProps {
  activeTab: 'create' | 'library' | 'history' | 'science';
  onSelectTab: (tab: 'create' | 'library' | 'history' | 'science') => void;
  onNewSongClick: () => void;
  historyCount: number;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  activeTab,
  onSelectTab,
  onNewSongClick,
  historyCount,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single text wordmark */}
        <button
          onClick={() => onSelectTab('create')}
          className="flex items-center gap-2.5 text-left text-lg font-bold tracking-tight text-white hover:text-amber-400 transition-colors whitespace-nowrap shrink-0 group"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
            <Music className="w-4 h-4 text-slate-950" />
          </div>
          <span>SurAI Music Studio</span>
        </button>

        {/* Zone 2: 4 Clean single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-300">
          <button
            onClick={() => onSelectTab('create')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-white ${
              activeTab === 'create'
                ? 'text-amber-400 border-b-2 border-amber-400 pb-0.5'
                : 'text-slate-400'
            }`}
          >
            Studio Generator
          </button>
          <button
            onClick={() => onSelectTab('library')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-white ${
              activeTab === 'library'
                ? 'text-amber-400 border-b-2 border-amber-400 pb-0.5'
                : 'text-slate-400'
            }`}
          >
            Songs Library
          </button>
          <button
            onClick={() => onSelectTab('history')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-white flex items-center gap-1.5 ${
              activeTab === 'history'
                ? 'text-amber-400 border-b-2 border-amber-400 pb-0.5'
                : 'text-slate-400'
            }`}
          >
            <span>My Creations</span>
            {historyCount > 0 && (
              <span className="text-xs font-mono text-amber-300">({historyCount})</span>
            )}
          </button>
          <button
            onClick={() => onSelectTab('science')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-white ${
              activeTab === 'science'
                ? 'text-amber-400 border-b-2 border-amber-400 pb-0.5'
                : 'text-slate-400'
            }`}
          >
            Bioacoustic Science
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onNewSongClick}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 rounded-lg hover:from-amber-300 hover:to-amber-400 transition-all shadow-md shadow-amber-500/15 whitespace-nowrap shrink-0 active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Generate Song</span>
          </button>
        </div>
      </div>
    </header>
  );
};
