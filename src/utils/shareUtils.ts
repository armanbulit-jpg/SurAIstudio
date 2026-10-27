import { Song } from '../types/music';

// Download formatted lyrics as .txt file
export function downloadLyricsFile(song: Song) {
  let content = `========================================\n`;
  content += `${song.title.toUpperCase()}\n`;
  if (song.subtitle) content += `${song.subtitle}\n`;
  content += `Artist: ${song.artist}\n`;
  content += `Genre: ${song.genre} | Mood: ${song.mood} | Key: ${song.key} | BPM: ${song.bpm}\n`;
  content += `Chords: ${song.chordsProgression?.join(' - ') || 'N/A'}\n`;
  if (song.bioacousticData?.frequencyHz) {
    content += `Bioacoustic Frequency: ${song.bioacousticData.frequencyHz}Hz | Binaural: ${song.bioacousticData.binauralBeatHz}Hz\n`;
    content += `Mechanism: ${song.bioacousticData.biologicalMechanism || ''}\n`;
  }
  content += `========================================\n\n`;

  song.sections.forEach((sec) => {
    content += `[${sec.sectionType.toUpperCase()}]\n`;
    sec.lines.forEach((line) => {
      content += `${line.lyric}  (${line.chord})\n`;
      if (line.translation) {
        content += `  ↳ "${line.translation}"\n`;
      }
    });
    content += `\n`;
  });

  content += `Generated with SurAI Music Studio\n`;

  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${sanitizeFilename(song.title)}_lyrics.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Generate beautiful high-res social media card (PNG)
export async function downloadSongCardImage(song: Song): Promise<void> {
  const canvas = document.createElement('canvas');
  canvas.width = 1200;
  canvas.height = 1200;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Background Gradient
  const grad = ctx.createLinearGradient(0, 0, 1200, 1200);
  grad.addColorStop(0, '#090d16');
  grad.addColorStop(0.5, '#111827');
  grad.addColorStop(1, '#030712');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1200, 1200);

  // Decorative sonic circles
  ctx.strokeStyle = 'rgba(245, 158, 11, 0.15)';
  ctx.lineWidth = 2;
  for (let r = 200; r <= 800; r += 120) {
    ctx.beginPath();
    ctx.arc(600, 600, r, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Header branding
  ctx.fillStyle = '#f59e0b';
  ctx.font = '600 28px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('SURAI MUSIC STUDIO · AI SONG GENERATION', 80, 110);

  // Genre & Key Pill outline
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.strokeRect(80, 140, 480, 48);
  ctx.fillStyle = '#9ca3af';
  ctx.font = '500 20px "JetBrains Mono", monospace';
  ctx.fillText(`${song.genre.toUpperCase()} · ${song.bpm} BPM · ${song.key}`, 100, 172);

  // Song Title
  ctx.fillStyle = '#ffffff';
  ctx.font = '700 64px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(song.title, 80, 270);

  // Subtitle / Artist
  if (song.subtitle) {
    ctx.fillStyle = '#fbbf24';
    ctx.font = '500 32px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(song.subtitle, 80, 320);
  }

  ctx.fillStyle = '#94a3b8';
  ctx.font = '400 24px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(`Composed by ${song.artist}`, 80, 365);

  // Divider
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.beginPath();
  ctx.moveTo(80, 400);
  ctx.lineTo(1120, 400);
  ctx.stroke();

  // Featured Lyrics preview (Chorus or Verse 1)
  const chorusSec = song.sections.find((s) => s.sectionType.toLowerCase().includes('chorus')) || song.sections[0];
  if (chorusSec) {
    ctx.fillStyle = '#d97706';
    ctx.font = '600 22px "JetBrains Mono", monospace';
    ctx.fillText(`// [${chorusSec.sectionType.toUpperCase()}]`, 80, 460);

    let yOffset = 520;
    chorusSec.lines.slice(0, 4).forEach((line) => {
      ctx.fillStyle = '#f8fafc';
      ctx.font = '600 34px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(`"${line.lyric}"`, 80, yOffset);

      if (line.translation) {
        ctx.fillStyle = '#94a3b8';
        ctx.font = '400 22px "Plus Jakarta Sans", sans-serif';
        ctx.fillText(`↳ ${line.translation}`, 80, yOffset + 36);
        yOffset += 84;
      } else {
        yOffset += 56;
      }
    });
  }

  // Bioacoustic badge (if present)
  if (song.bioacousticData?.frequencyHz) {
    ctx.fillStyle = 'rgba(13, 148, 136, 0.15)';
    ctx.fillRect(80, 940, 1040, 100);
    ctx.strokeStyle = '#0d9488';
    ctx.strokeRect(80, 940, 1040, 100);

    ctx.fillStyle = '#2dd4bf';
    ctx.font = '600 20px "JetBrains Mono", monospace';
    ctx.fillText(`BIOACOUSTIC FREQUENCY: ${song.bioacousticData.frequencyHz}Hz · ${song.bioacousticData.binauralBeatHz || 10}Hz BINAURAL PULSE`, 110, 980);

    ctx.fillStyle = '#cbd5e1';
    ctx.font = '400 18px "Plus Jakarta Sans", sans-serif';
    const textDesc = song.bioacousticData.biologicalMechanism || 'Resonant biological harmony';
    ctx.fillText(textDesc.slice(0, 85) + (textDesc.length > 85 ? '...' : ''), 110, 1015);
  }

  // Footer branding
  ctx.fillStyle = '#64748b';
  ctx.font = '400 20px "JetBrains Mono", monospace';
  ctx.fillText('surai-music.studio · Generated with Google AI Studio', 80, 1120);

  // Convert canvas to image download
  const dataUrl = canvas.toDataURL('image/png');
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = `${sanitizeFilename(song.title)}_social_card.png`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// Social share links generator
export function getSocialShareLinks(song: Song) {
  const shareText = `🎵 Listen to "${song.title}" (${song.genre}) - AI Song created on SurAI Music Studio!\n\nLyrics: "${song.sections[0]?.lines[0]?.lyric || ''}"`;
  const url = window.location.href;

  return {
    whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText}\n${url}`)}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(url)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(shareText)}`,
    telegram: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(shareText)}`,
  };
}

export async function shareSongNative(song: Song): Promise<boolean> {
  if (navigator.share) {
    try {
      await navigator.share({
        title: `${song.title} - SurAI Music Studio`,
        text: `Listen to "${song.title}" (${song.genre}) created with AI lyrics & audio: "${song.summary}"`,
        url: window.location.href,
      });
      return true;
    } catch {
      return false;
    }
  }
  return false;
}

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-z0-9_-]/gi, '_').toLowerCase();
}
