import React, { useState } from 'react';
import {
  Sparkles,
  Music2,
  Mic,
  Dna,
  Wand2,
  Globe2,
  Heart,
  Volume2,
  Sliders,
} from 'lucide-react';
import { BioPreset, Song } from '../types/music';

interface SongGeneratorFormProps {
  onSongGenerated: (song: Song) => void;
  bioPresets: BioPreset[];
}

export const SongGeneratorForm: React.FC<SongGeneratorFormProps> = ({
  onSongGenerated,
  bioPresets,
}) => {
  const [creationType, setCreationType] = useState<'song' | 'noha'>('song');
  const [activeInputMode, setActiveInputMode] = useState<'prompt' | 'lyrics'>('prompt');
  const [prompt, setPrompt] = useState('');
  const [lyrics, setLyrics] = useState('');
  const [stylePrompt, setStylePrompt] = useState('Acoustic nylon guitar, warm harmonium, soft sub bass, melodic vocal lead, reverb space');

  // Song parameters
  const [genre, setGenre] = useState('Urdu / Hindi Ghazal & Pop');
  const [mood, setMood] = useState('Soulful & Melodic');
  const [tempo, setTempo] = useState('Medium (105 BPM)');
  const [vocalVoice, setVocalVoice] = useState('Kore');
  const [language, setLanguage] = useState('Urdu (اردو / Roman Urdu)');
  const [enableBioScience, setEnableBioScience] = useState(false);
  const [selectedBioPreset, setSelectedBioPreset] = useState<string>('bio-dopamine');

  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Quick Inspiration Prompts
  const songSamplePrompts = [
    { label: 'Rainy Night Ghazal', text: 'A soulful Urdu romantic ballad about walking through rain in old Lahore with acoustic guitar and violin swells.' },
    { label: 'Cozy Lo-Fi Beats', text: 'Warm chill lo-fi beats with gentle Urdu poetry, rhodes chords, vinyl crackle and peaceful twilight relaxation.' },
    { label: '528Hz DNA Sonification', text: 'A restorative bioacoustic frequency journey translating dopamine codon sequences into uplifting harmonic pentatonic music.' },
    { label: 'Sufi Rock Anthem', text: 'High energy Sufi rock with driving tabla, acoustic riffs, passionate chorus and spiritual elevation.' },
  ];

  const nohaSamplePrompts = [
    { label: 'Sham-e-Ghariban', text: 'Sham-e-Ghariban di ghareebi, Bibi Zainab (s.a) di rida aur jale hue kheemon par dard bhara pur-dard Noha...' },
    { label: 'Hazrat Abbas (a.s) Alamdar', text: 'Wafa ke sultan Hazrat Abbas (a.s) ki wafa, mashk-o-alam aur darya-e-Furat par tishna-labi ka pursa...' },
    { label: 'Ali Asghar (a.s) Jhoola', text: 'Sheerkhwar Hazrat Ali Asghar (a.s) ki pyas, be-sheer ka jhoola aur dukh bhari maadar ki lori...' },
    { label: 'Classical Marsiya (Anees)', text: 'Musaddas Mir Anees ke tarz par Imam Hussain (a.s) ki azeem qurbani aur haq ki baqa par classical Marsiya...' },
  ];

  // Quick Style Prompt Chips
  const songStyleChips = [
    'Acoustic Nylon Guitar & Reverb',
    'Warm Harmonium & Live Tabla',
    'Lo-Fi Rhodes & Vinyl Crackle',
    '808 Sub Bass & Crisp Groove',
    'Sufi Rock Driving Distortion',
    '528Hz Solfeggio Ambient Drone',
    'Sorrowful Cello & Orchestral Swell',
    'Fast Punjabi Dhol & Tumbi',
  ];

  const nohaStyleChips = [
    'Heavy Matam Dhadkan Double Strike',
    'Mournful Ney Flute & Ambient Reverb',
    'Sorrowful Cello & Dark String Drone',
    'Solemn Choral Anjuman Harmony',
    'Sham-e-Ghariban Night Wind Ambience',
    'Classical Musaddas Slow Recitative',
  ];

  // All Languages Catalog
  const languageOptions = [
    { value: 'Urdu (اردو / Roman Urdu)', label: 'Urdu (اردو / Roman Urdu)' },
    { value: 'Punjabi (پنجابی / ਪੰਜਾਬੀ)', label: 'Punjabi (پنجابی / ਪੰਜਾਬੀ)' },
    { value: 'Arabic (العربية / Fusha & Iraqi)', label: 'Arabic (العربية / Fusha & Iraqi)' },
    { value: 'Persian / Farsi (فارسی)', label: 'Persian / Farsi (فارسی)' },
    { value: 'Saraiki (سرائیکی)', label: 'Saraiki (سرائیکی)' },
    { value: 'Sindhi (سنڌي)', label: 'Sindhi (سنڌي)' },
    { value: 'Pashto (پښتو)', label: 'Pashto (پښتو)' },
    { value: 'Hindi (हिन्दी / Hinglish)', label: 'Hindi (हिन्दी / Hinglish)' },
    { value: 'English', label: 'English' },
    { value: 'Bengali (বাংলা)', label: 'Bengali (বাংলা)' },
    { value: 'Turkish (Türkçe)', label: 'Turkish (Türkçe)' },
    { value: 'Spanish (Español)', label: 'Spanish (Español)' },
    { value: 'French (Français)', label: 'French (Français)' },
    { value: 'Multilingual Fusion (Urdu + Arabic + Farsi)', label: 'Multilingual Fusion (Urdu + Arabic + Farsi)' },
  ];

  const handleInsertLyricsTag = (tag: string) => {
    setLyrics((prev) => (prev ? `${prev}\n\n[${tag}]\n` : `[${tag}]\n`));
  };

  const handleAppendStyleChip = (chip: string) => {
    setStylePrompt((prev) => {
      if (!prev.trim()) return chip;
      if (prev.includes(chip)) return prev;
      return `${prev}, ${chip}`;
    });
  };

  const handleSwitchCreationType = (type: 'song' | 'noha') => {
    setCreationType(type);
    if (type === 'noha') {
      setGenre('Traditional Matami Noha (Slow/Dhadkan Beat)');
      setMood('Deeply Mournful & Grief (غم و گریہ)');
      setTempo('Slow Matam (60 BPM)');
      setVocalVoice('Fenrir');
      setStylePrompt('Solemn Matami Dhadkan double strike, mournful Ney flute, sorrowful cello, deep reciter');
    } else {
      setGenre('Urdu / Hindi Ghazal & Pop');
      setMood('Soulful & Melodic');
      setTempo('Medium (105 BPM)');
      setVocalVoice('Kore');
      setStylePrompt('Acoustic nylon guitar, warm harmonium, soft sub bass, melodic vocal lead, reverb space');
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() && !lyrics.trim()) {
      setErrorMessage(
        creationType === 'noha'
          ? 'Meherbani karke Noha ka mozoo ya nohay ke ashaar darj karein.'
          : 'Please enter a song prompt or lyrics to generate.'
      );
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      setLoadingStep(
        creationType === 'noha'
          ? '1/3 Composing reverent Noha verses & Marsiya meter with Gemini 3.8 Flash...'
          : '1/3 Composing poetic lyrics and musical chords with Gemini 3.8 Flash...'
      );

      const songResponse = await fetch('/api/song/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          lyrics,
          stylePrompt,
          genre,
          mood,
          tempo,
          vocalStyle:
            creationType === 'noha'
              ? vocalVoice === 'Fenrir'
                ? 'Solemn Deep Marsiyakhwan'
                : 'Poignant Eulogist'
              : vocalVoice === 'Kore'
              ? 'Soulful Female Voice'
              : vocalVoice === 'Puck'
              ? 'Youthful Male Voice'
              : 'Deep Resonant Voice',
          language,
          compositionType: creationType,
          bioAcousticId: enableBioScience ? selectedBioPreset : '',
        }),
      });

      const songData = await songResponse.json();
      if (!songResponse.ok || !songData.success || !songData.song) {
        throw new Error(songData.error || 'Failed to compose composition');
      }

      const generatedSong: Song = {
        ...songData.song,
        id: `comp-${Date.now()}`,
        compositionType: creationType,
        language,
        stylePrompt,
        createdAt: new Date().toISOString(),
        isFavorite: false,
        coverUrl:
          creationType === 'noha'
            ? '/src/assets/images/cover_sufi_fusion_1793100110421.jpg'
            : enableBioScience
            ? '/src/assets/images/cover_bioacoustic_1793100112208.jpg'
            : genre.toLowerCase().includes('lo-fi')
            ? '/src/assets/images/cover_lofi_chill_1793100111550.jpg'
            : '/src/assets/images/cover_sufi_fusion_1793100110421.jpg',
      };

      // Step 2: Vocal synthesis via Gemini TTS
      setLoadingStep(
        creationType === 'noha'
          ? '2/3 Synthesizing solemn elegiac vocal recitation via Gemini TTS...'
          : '2/3 Synthesizing vocal performance via Gemini TTS...'
      );

      const firstSection = generatedSong.sections[1] || generatedSong.sections[0];
      const vocalSampleText = firstSection?.lines.map((l) => l.lyric).slice(0, 4).join('\n') || '';

      if (vocalSampleText) {
        try {
          const ttsRes = await fetch('/api/song/synthesize-vocals', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              text: vocalSampleText,
              voiceName: vocalVoice,
              style:
                creationType === 'noha'
                  ? 'Solemn, sorrowful, dignified mourning reciter with slow heartfelt cadence'
                  : `${mood} singer with expressive melodic timing`,
            }),
          });
          const ttsData = await ttsRes.json();
          if (ttsData.success && ttsData.audioDataUrl) {
            generatedSong.vocalAudioUrl = ttsData.audioDataUrl;
          }
        } catch (ttsErr) {
          console.log('Vocal synthesis fallback to arrangement:', ttsErr);
        }
      }

      setLoadingStep('3/3 Finalizing audio stems & rhythm...');
      await new Promise((r) => setTimeout(r, 600));

      onSongGenerated(generatedSong);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Error occurred while generating. Please try again.');
    } finally {
      setIsLoading(false);
      setLoadingStep('');
    }
  };

  const activeBioPresetObj = bioPresets.find((p) => p.id === selectedBioPreset);
  const inspirationPrompts = creationType === 'noha' ? nohaSamplePrompts : songSamplePrompts;

  return (
    <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-6 sm:p-8 shadow-xl backdrop-blur-md">
      {/* Primary Category Selector: Song vs Noha */}
      <div className="mb-6 pb-6 border-b border-slate-800/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <Wand2 className="w-5 h-5 text-amber-400" />
              <span>
                {creationType === 'noha' ? 'Noha & Marsiya Generator' : 'AI Song Generator'}
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              {creationType === 'noha'
                ? 'Karbala, Sham-e-Ghariban, Manqabat aur Shahadat par ba-adab aur dard bhare Nohay banayein — All Languages supported.'
                : 'Prompt daalein ya apni shayari/lyrics likhein — SurAI studio aapka mukammal gana, audio aur chords banayega.'}
            </p>
          </div>

          {/* Creation Type Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800 shrink-0 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => handleSwitchCreationType('song')}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                creationType === 'song'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Music2 className="w-3.5 h-3.5" />
              <span>AI Song & Music</span>
            </button>
            <button
              type="button"
              onClick={() => handleSwitchCreationType('noha')}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                creationType === 'noha'
                  ? 'bg-red-900/90 text-white font-bold border border-red-700/60 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Heart className="w-3.5 h-3.5 text-red-400" />
              <span>Noha & Marsiya (نوحہ)</span>
            </button>
          </div>
        </div>

        {/* Sub-mode: Prompt Mode vs Custom Lyrics Mode */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <span>INPUT MODE:</span>
            <span className="text-amber-400 font-semibold uppercase">
              {activeInputMode === 'prompt' ? 'AI Idea / Prompt' : 'Custom Written Lyrics'}
            </span>
          </div>

          <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800">
            <button
              type="button"
              onClick={() => setActiveInputMode('prompt')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                activeInputMode === 'prompt'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Prompt
            </button>
            <button
              type="button"
              onClick={() => setActiveInputMode('lyrics')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                activeInputMode === 'lyrics'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Custom Verses
            </button>
          </div>
        </div>
      </div>

      <form onSubmit={handleGenerate} className="space-y-6">
        {/* Language Selection: "All Languages" */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-300">
              <Globe2 className="w-3.5 h-3.5 text-amber-400" />
              <span>Language (تمام زبانیں / All Languages)</span>
            </label>
            <span className="text-[11px] font-mono text-slate-500">
              Supports 14+ Global & Regional Languages
            </span>
          </div>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-amber-400"
          >
            {languageOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Prompt Input Mode */}
        {activeInputMode === 'prompt' ? (
          <div className="space-y-3">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
              {creationType === 'noha'
                ? 'Noha / Marsiya Topic or Subject (عنوان یا واقعہ)'
                : 'Song Idea or Prompt (English, Urdu, Hindi, Any Language)'}
            </label>
            <textarea
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={
                creationType === 'noha'
                  ? 'e.g. Sham-e-Ghariban, Hazrat Abbas (a.s) ki wafa, ya Sheerkhwar Asghar (a.s) par pur-dard noha...'
                  : 'e.g. Ik dilchasp aur dard bhara Urdu gana banayein jo barish aur purani yaadon ke baray mein ho...'
              }
              className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors"
            />

            {/* Quick Inspiration Pills */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-mono text-slate-500">QUICK SUGGESTIONS:</span>
              {inspirationPrompts.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setPrompt(item.text)}
                  className="text-xs px-2.5 py-1 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-amber-300 border border-slate-700/60 transition-colors"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Custom Lyrics / Verses Mode */
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                {creationType === 'noha'
                  ? 'Your Noha Verses / Kalaam (نوحہ کے اشعار)'
                  : 'Your Custom Lyrics / Shayari (Poetry)'}
              </label>
              {/* Structure helpers */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] font-mono text-slate-500 hidden sm:inline">INSERT:</span>
                {(creationType === 'noha'
                  ? ['Noha Matam (Chorus)', 'Band 1', 'Band 2', 'Salam & Maqta']
                  : ['Verse 1', 'Chorus', 'Verse 2', 'Bridge']
                ).map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleInsertLyricsTag(tag)}
                    className="text-[11px] px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-amber-300 font-mono border border-slate-700 transition-colors"
                  >
                    +{tag}
                  </button>
                ))}
              </div>
            </div>
            <textarea
              rows={5}
              value={lyrics}
              onChange={(e) => setLyrics(e.target.value)}
              placeholder={
                creationType === 'noha'
                  ? `[Noha Matam (Chorus)]\nAye Karbala di dharti, das kithay Abbas gaya...\n\n[Band 1]\nZainab pukardi hai, mera aasra tur gaya...`
                  : `[Verse 1]\nChaand ki dehleez pe baitha koi intezaar hai...\n\n[Chorus]\nTu jo mila toh har lamha noor ban gaya...`
              }
              className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 font-mono text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors leading-relaxed"
            />
            <p className="text-xs text-slate-400">
              {creationType === 'noha'
                ? 'SurAI will organize your Kalaam into classical Bahr meter, Matami pulse rhythm, and timestamps.'
                : 'SurAI will arrange your lyrics into musical phrases, compute chords, and set the rhythm.'}
            </p>
          </div>
        )}

        {/* Dedicated Style Prompt Section */}
        <div className="space-y-3 p-4 sm:p-5 rounded-2xl bg-slate-950/80 border border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-200">
              <Sliders className="w-4 h-4 text-amber-400" />
              <span>
                {creationType === 'noha'
                  ? 'Style Prompt & Acoustic Elements (طرز و سوز)'
                  : 'Style Prompt & Production Stems (طرز و موسیقی)'}
              </span>
            </label>
            <span className="text-[11px] font-mono text-slate-500">
              Instruments, timbre, rhythm & atmosphere
            </span>
          </div>

          <input
            type="text"
            value={stylePrompt}
            onChange={(e) => setStylePrompt(e.target.value)}
            placeholder={
              creationType === 'noha'
                ? 'e.g. Solemn Matami Dhadkan double strike, mournful Ney flute, sorrowful cello, deep reciter'
                : 'e.g. Acoustic nylon guitar, warm harmonium, soft sub bass, rain ambience, reverb echo, female melodic vocal'
            }
            className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 font-mono transition-colors"
          />

          {/* Quick Style Chips */}
          <div className="space-y-1.5 pt-1">
            <div className="text-[11px] font-mono text-slate-400">CLICK TO ADD STYLE ELEMENTS:</div>
            <div className="flex items-center gap-1.5 flex-wrap">
              {(creationType === 'noha' ? nohaStyleChips : songStyleChips).map((chip) => {
                const isActive = stylePrompt.includes(chip);
                return (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => handleAppendStyleChip(chip)}
                    className={`text-[11px] px-2.5 py-1 rounded-lg border font-mono transition-all ${
                      isActive
                        ? 'bg-amber-500/20 border-amber-500/60 text-amber-300 font-semibold shadow-xs'
                        : 'bg-slate-900/90 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    + {chip}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Music / Elegy Parameters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          {/* Genre / Style */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-300">
              {creationType === 'noha' ? 'Noha Style / Tradition' : 'Genre & Style'}
            </label>
            <select
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-amber-400"
            >
              {creationType === 'noha' ? (
                <>
                  <option value="Traditional Matami Noha (Slow/Dhadkan Beat)">Traditional Matami Noha</option>
                  <option value="Classical Marsiya (Musaddas/Anees Style)">Classical Marsiya (Musaddas)</option>
                  <option value="Punjabi & Saraiki Nauha (Dard Bhara Pursadar)">Punjabi & Saraiki Nauha</option>
                  <option value="Arabic & Iraqi Latmiya (Nawha)">Arabic & Iraqi Latmiya</option>
                  <option value="Persian / Farsi Rowzeh & Noha">Persian / Farsi Rowzeh & Noha</option>
                  <option value="Manqabat & Qasida (Reverent Praise)">Manqabat & Qasida</option>
                  <option value="Sham-e-Ghariban Elegy">Sham-e-Ghariban Elegy</option>
                </>
              ) : (
                <>
                  <option value="Urdu / Hindi Ghazal & Pop">Urdu Ghazal & Pop</option>
                  <option value="Lo-Fi Chill & Urdu Poetry">Lo-Fi Chill & Beats</option>
                  <option value="Sufi Rock & Acoustic Fusion">Sufi Rock Fusion</option>
                  <option value="Cyberpunk Synthwave & EDM">Cyber Synthwave & EDM</option>
                  <option value="Acoustic Folk & Indie">Acoustic Indie & Guitar</option>
                  <option value="Punjabi Pop & Bhangra Groove">Punjabi Pop Groove</option>
                  <option value="Bioacoustic Science Ambient">Bioacoustic Ambient</option>
                </>
              )}
            </select>
          </div>

          {/* Mood */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-300">Mood & Emotion</label>
            <select
              value={mood}
              onChange={(e) => setMood(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-amber-400"
            >
              {creationType === 'noha' ? (
                <>
                  <option value="Deeply Mournful & Grief (غم و گریہ)">Deeply Mournful (غم و گریہ)</option>
                  <option value="Heartbreaking Lament (سوز و درد)">Heartbreaking Lament (سوز و درد)</option>
                  <option value="Dignified Spiritual Reverence (عزت و وقار)">Dignified Grief & Reverence</option>
                  <option value="Passion & Matam Surge (جوشِ ماتم)">Passion & Matam (جوشِ ماتم)</option>
                </>
              ) : (
                <>
                  <option value="Soulful & Melodic">Soulful & Melodic</option>
                  <option value="Romantic, Heartfelt & Nostalgic">Romantic & Heartfelt</option>
                  <option value="Cozy, Relaxed & Ambient">Cozy & Relaxed</option>
                  <option value="Euphoric & Mentally Uplifting">Euphoric & Uplifting</option>
                  <option value="Deep, Spiritual & Contemplative">Spiritual Longing</option>
                  <option value="Energetic, High-Vibration & Cyber">High Energy & Driving</option>
                </>
              )}
            </select>
          </div>

          {/* Tempo */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-300">Tempo / Rhythm</label>
            <select
              value={tempo}
              onChange={(e) => setTempo(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-amber-400"
            >
              {creationType === 'noha' ? (
                <>
                  <option value="Slow Matam (56-62 BPM)">Slow Matam (58 BPM)</option>
                  <option value="Heavy Dhadkan Beat (64-70 BPM)">Heavy Dhadkan (66 BPM)</option>
                  <option value="Marsiya Recitative Flow (52 BPM)">Marsiya Recitative (52 BPM)</option>
                </>
              ) : (
                <>
                  <option value="Slow (72-84 BPM)">Slow Ballad (78 BPM)</option>
                  <option value="Medium (95-110 BPM)">Medium Flow (105 BPM)</option>
                  <option value="Upbeat (124-135 BPM)">Upbeat Dance (128 BPM)</option>
                  <option value="Energetic (140+ BPM)">High Energy (140 BPM)</option>
                </>
              )}
            </select>
          </div>

          {/* Vocal Persona */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-300">
              {creationType === 'noha' ? 'Reciter Persona (نوحہ خواں)' : 'AI Vocal Persona'}
            </label>
            <select
              value={vocalVoice}
              onChange={(e) => setVocalVoice(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-amber-400"
            >
              {creationType === 'noha' ? (
                <>
                  <option value="Fenrir">Fenrir (Solemn Deep Marsiyakhwan)</option>
                  <option value="Puck">Puck (Passionate Resonant Reciter)</option>
                  <option value="Kore">Kore (Mournful Melodic Lament)</option>
                  <option value="Zephyr">Zephyr (Quiet Poetic Choral Echo)</option>
                </>
              ) : (
                <>
                  <option value="Kore">Kore (Soulful Melodic Female)</option>
                  <option value="Puck">Puck (Youthful Vibrant Male)</option>
                  <option value="Fenrir">Fenrir (Deep Baritone)</option>
                  <option value="Zephyr">Zephyr (Soft Ethereal Whisper)</option>
                </>
              )}
            </select>
          </div>
        </div>

        {/* Bioscience & Bioacoustic Mode Section (available for both) */}
        <div className="p-4 rounded-xl bg-slate-950/70 border border-teal-900/40 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Dna className="w-4 h-4 text-teal-400" />
              <span className="text-xs sm:text-sm font-semibold text-slate-200">
                Bioscience & Bioacoustic Harmonic Mode (432Hz / 528Hz Resonance)
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={enableBioScience}
                onChange={(e) => setEnableBioScience(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-teal-500"></div>
            </label>
          </div>

          {enableBioScience && (
            <div className="pt-2 border-t border-slate-800/80 space-y-3">
              <p className="text-xs text-slate-400">
                Harmonizes the acoustic carrier waves with 432Hz harmonic string tuning or biological circadian cycles.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {bioPresets.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => setSelectedBioPreset(preset.id)}
                    className={`p-3 text-left rounded-lg border transition-all text-xs ${
                      selectedBioPreset === preset.id
                        ? 'bg-teal-500/15 border-teal-500/70 text-white shadow-sm'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="font-semibold text-teal-300 mb-0.5">{preset.name}</div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      {preset.targetFrequencyHz}Hz · {preset.brainwaveEntrainment}
                    </div>
                  </button>
                ))}
              </div>
              {activeBioPresetObj && (
                <div className="text-[11px] text-slate-400 bg-slate-900/90 p-2.5 rounded-lg border border-slate-800 font-mono">
                  <span className="text-teal-400 font-semibold">Biological Source:</span> {activeBioPresetObj.sequenceOrigin}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Error message */}
        {errorMessage && (
          <div className="p-3 rounded-lg bg-red-950/50 border border-red-800/70 text-red-200 text-xs">
            {errorMessage}
          </div>
        )}

        {/* Submit & Loading state */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3.5 px-6 rounded-xl font-bold text-sm tracking-wide transition-all shadow-lg flex items-center justify-center gap-2 ${
              isLoading
                ? 'bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-700'
                : creationType === 'noha'
                ? 'bg-gradient-to-r from-red-800 via-red-700 to-amber-700 hover:from-red-700 hover:to-amber-600 text-white shadow-red-900/30 active:scale-[0.99]'
                : 'bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-950 shadow-amber-500/20 active:scale-[0.99]'
            }`}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-slate-400 border-t-amber-400 rounded-full animate-spin" />
                <span className="font-mono text-xs text-amber-300">{loadingStep || 'Generating...'}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>
                  {creationType === 'noha'
                    ? 'Generate Noha / Marsiya & Audio (نوحہ تخلیق کریں)'
                    : 'Compose AI Song & Audio'}
                </span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
