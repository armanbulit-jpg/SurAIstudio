import React, { useState } from 'react';
import {
  X,
  Download,
  Share2,
  FileText,
  Music,
  Image as ImageIcon,
  Copy,
  Check,
  Send,
  MessageCircle,
  ExternalLink,
} from 'lucide-react';
import { Song } from '../types/music';
import { studioAudio } from '../utils/audioEngine';
import {
  downloadLyricsFile,
  downloadSongCardImage,
  getSocialShareLinks,
  shareSongNative,
} from '../utils/shareUtils';

interface ModalProps {
  song: Song | null;
  isOpen: boolean;
  onClose: () => void;
  type: 'share' | 'download';
}

export const ShareDownloadModal: React.FC<ModalProps> = ({
  song,
  isOpen,
  onClose,
  type,
}) => {
  const [isCopied, setIsCopied] = useState(false);
  const [isRenderingWav, setIsRenderingWav] = useState(false);
  const [isRenderingCard, setIsRenderingCard] = useState(false);

  if (!isOpen || !song) return null;

  const shareLinks = getSocialShareLinks(song);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleNativeShare = async () => {
    const success = await shareSongNative(song);
    if (!success) {
      handleCopyLink();
    }
  };

  const handleDownloadAudio = async () => {
    setIsRenderingWav(true);
    try {
      const wavBlob = await studioAudio.renderToWavBlob(song);
      const url = URL.createObjectURL(wavBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${song.title.replace(/[^a-z0-9_-]/gi, '_').toLowerCase()}.wav`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to export audio:', err);
    } finally {
      setIsRenderingWav(false);
    }
  };

  const handleDownloadCard = async () => {
    setIsRenderingCard(true);
    try {
      await downloadSongCardImage(song);
    } catch (err) {
      console.error('Failed to export card image:', err);
    } finally {
      setIsRenderingCard(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-7 shadow-2xl text-slate-100">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Title */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
            {type === 'share' ? <Share2 className="w-5 h-5" /> : <Download className="w-5 h-5" />}
          </div>
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">
              {type === 'share' ? 'Share Song on Social Media' : 'Download Song & Assets'}
            </h3>
            <p className="text-xs text-slate-400 truncate max-w-xs sm:max-w-sm">
              "{song.title}" · {song.artist}
            </p>
          </div>
        </div>

        {type === 'share' ? (
          /* SHARE VIEW */
          <div className="space-y-5">
            {/* Direct Social Buttons */}
            <div className="grid grid-cols-2 gap-2.5">
              <a
                href={shareLinks.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600/15 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-600/25 transition-colors text-xs font-semibold"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp</span>
              </a>

              <a
                href={shareLinks.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-sky-600/15 border border-sky-500/40 text-sky-300 hover:bg-sky-600/25 transition-colors text-xs font-semibold"
              >
                <Send className="w-4 h-4" />
                <span>Twitter / X</span>
              </a>

              <a
                href={shareLinks.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-blue-600/15 border border-blue-500/40 text-blue-300 hover:bg-blue-600/25 transition-colors text-xs font-semibold"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Facebook</span>
              </a>

              <button
                onClick={handleNativeShare}
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-300 hover:bg-amber-500/25 transition-colors text-xs font-semibold"
              >
                <Share2 className="w-4 h-4" />
                <span>Mobile Share</span>
              </button>
            </div>

            {/* Copy Link Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-400">Direct Share Link</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={window.location.href}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-slate-300 focus:outline-none"
                />
                <button
                  onClick={handleCopyLink}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0"
                >
                  {isCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{isCopied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* Social Media Story Poster Download shortcut */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <ImageIcon className="w-4 h-4 text-amber-400" />
                <span className="text-xs text-slate-300">Instagram & WhatsApp Story Poster</span>
              </div>
              <button
                onClick={handleDownloadCard}
                disabled={isRenderingCard}
                className="text-xs font-semibold text-amber-400 hover:text-amber-300"
              >
                {isRenderingCard ? 'Generating...' : 'Download Card'}
              </button>
            </div>
          </div>
        ) : (
          /* DOWNLOAD VIEW */
          <div className="space-y-3">
            {/* Download Full Audio .WAV */}
            <button
              onClick={handleDownloadAudio}
              disabled={isRenderingWav}
              className="w-full p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-500/50 flex items-center justify-between transition-all group text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
                  <Music className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white group-hover:text-amber-300 transition-colors">
                    Download Audio File (.WAV)
                  </div>
                  <div className="text-xs text-slate-400">
                    High-quality 44.1kHz Stereo musical arrangement & vocal master
                  </div>
                </div>
              </div>
              <div className="text-xs font-mono text-amber-400 font-semibold shrink-0">
                {isRenderingWav ? 'Exporting...' : 'Export'}
              </div>
            </button>

            {/* Download Lyrics .TXT */}
            <button
              onClick={() => downloadLyricsFile(song)}
              className="w-full p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-500/50 flex items-center justify-between transition-all group text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-slate-300 group-hover:scale-105 transition-transform">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white group-hover:text-amber-300 transition-colors">
                    Download Formatted Lyrics (.TXT)
                  </div>
                  <div className="text-xs text-slate-400">
                    Structured with [Verse], [Chorus], chords, translations & timestamps
                  </div>
                </div>
              </div>
              <div className="text-xs font-mono text-slate-300 font-semibold shrink-0">
                Save TXT
              </div>
            </button>

            {/* Download Social Media Poster Image */}
            <button
              onClick={handleDownloadCard}
              disabled={isRenderingCard}
              className="w-full p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-500/50 flex items-center justify-between transition-all group text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-400 group-hover:scale-105 transition-transform">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white group-hover:text-teal-300 transition-colors">
                    Download Social Media Card (.PNG)
                  </div>
                  <div className="text-xs text-slate-400">
                    1200x1200 high-res album lyrics poster with branding & chords
                  </div>
                </div>
              </div>
              <div className="text-xs font-mono text-teal-400 font-semibold shrink-0">
                {isRenderingCard ? 'Drawing...' : 'Save PNG'}
              </div>
            </button>
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-slate-800/80 text-center text-xs text-slate-500 font-mono">
          SurAI Music Studio · 100% Free Export & Share
        </div>
      </div>
    </div>
  );
};
