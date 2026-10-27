import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: '15mb' }));

// Initialise Gemini client with standard telemetry User-Agent
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Scientific Bioacoustic presets grounded in neuroscience & biological resonance
const BIOACOUSTIC_PRESETS = [
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

// Endpoint: Fetch Bioacoustic science presets
app.get('/api/science/bioacoustic-presets', (_req, res) => {
  res.json({ success: true, presets: BIOACOUSTIC_PRESETS });
});

// Endpoint: Generate full AI Song or Noha / Marsiya
app.post('/api/song/generate', async (req, res) => {
  try {
    const {
      prompt = '',
      lyrics = '',
      stylePrompt = '',
      genre = 'Urdu / Hindi Ghazal & Pop',
      mood = 'Soulful & Melodic',
      tempo = 'Medium (105 BPM)',
      vocalStyle = 'Expressive Voice',
      language = 'Roman Urdu & Hindi / English',
      bioAcousticId = '',
      compositionType = 'song', // 'song' | 'noha'
    } = req.body;

    const bioPreset = BIOACOUSTIC_PRESETS.find((p) => p.id === bioAcousticId);
    const isNoha = compositionType === 'noha' || genre.toLowerCase().includes('noha') || genre.toLowerCase().includes('marsiya');

    const systemInstruction = isNoha
      ? `You are an acclaimed master poet, Marsiyakhwan, and composer of traditional Noha, Marsiya (Musaddas/Rubai), Manqabat, and Islamic elegies across all languages (Urdu, Arabic, Persian/Farsi, Punjabi, Sindhi, Saraiki, Pashto, English, Hindi).
You compose with profound spiritual sorrow (Gham-e-Hussain, Karbala, Sham-e-Ghariban, Tishna-labi, Abbas da Alam), dignified grief, and impeccable poetic meter (Bahr / Wazn).
When writing a Noha:
- Provide a poignant, heartbreaking "Radd-e-Amal / Noha Chorus" (the recurring refrain that attendees recite during Matam/mourning).
- Structure the sections as [Noha Matam (Refrain)], [Band 1], [Noha Matam], [Band 2], [Salam / Maqta].
- Strictly follow the acoustic and instrument style directives provided by the user in the Style Prompt.
- Write with pure respect, authentic vocabulary in the user's selected language (${language}), including Roman transliteration if script is non-Latin, plus English/Urdu translation for each line.
- Set a solemn, dignified tempo (52-70 BPM), minor keys (Dm, Em, Am, Bbm), and acoustic instrumentation (Heartbeat / Matami Dhadkan percussion, Ney / Bansuri, Sorrowful Cello/Strings, Reverent Vocal Chorus).
Always output valid JSON adhering strictly to the schema provided.`
      : `You are a world-class AI Master Music Producer, Songwriter, and Bioacoustic Sound Designer supporting all world and regional languages (Urdu, Hindi, Punjabi, Arabic, Persian, English, Spanish, Bengali, Turkish, etc.).
Your task is to generate a complete, structured musical composition based on the user's prompt, style prompt, or provided lyrics.
Always provide rich, evocative, poetically rhyming lyrics with clear Verse 1, Chorus, Verse 2, Chorus, Bridge, and Outro sections.
Meticulously craft the musical arrangement, chord progressions, and instrumentation matching the user's Style Prompt.
If the user provided their own lyrics, refine and structure them musically while keeping their original intent and phrases.
If the user gave a prompt, write beautiful original lyrics in the requested language: ${language}.
Always produce a JSON response adhering strictly to the schema provided.`;

    const userPrompt = isNoha
      ? `Generate a deeply moving, classical Noha / Marsiya elegy:
- Theme / Topic: "${prompt || 'Sham-e-Ghariban tragedy, thirst of Karbala, and courage of Ahl-ul-Bayt'}"
- Style Prompt (Acoustic Style & Instruments): "${stylePrompt || 'Solemn Matami Dhadkan double strike, mournful Ney flute, sorrowful cello, deep reciter'}"
- User provided lyrics (if any): "${lyrics || 'None provided - please compose original Noha verses'}"
- Sub-Style / Genre: ${genre}
- Mood / Emotion: ${mood || 'Deeply Mournful & Soulful'}
- Solemn Tempo: ${tempo || 'Slow Matam (60 BPM)'}
- Vocal Reciter: ${vocalStyle || 'Solemn Marsiyakhwan'}
- Selected Language: ${language}
${bioPreset ? `- Bioacoustic Harmonic Carrier: ${bioPreset.name} (${bioPreset.targetFrequencyHz}Hz harmonic)` : ''}

Generate structured lines with timestamps, chord markers, English translation, and vocal cues.`
      : `Generate a complete musical song with lyrics, structure, chords, and production details:
- Theme / Prompt: "${prompt || 'A moving song about dreams, journey, and soulful connection'}"
- Style Prompt (Production, Stems & Instruments): "${stylePrompt || 'Acoustic nylon guitar, warm harmonium, soft sub bass, melodic vocal lead, reverb space'}"
- User provided lyrics (if any): "${lyrics || 'None provided - please compose original lyrics'}"
- Genre: ${genre}
- Mood: ${mood}
- Desired Tempo: ${tempo}
- Vocal Style: ${vocalStyle}
- Language: ${language}
${bioPreset ? `- Bioacoustic Science Mode Active: ${bioPreset.name} (${bioPreset.sequenceOrigin}, target frequency ${bioPreset.targetFrequencyHz}Hz, ${bioPreset.brainwaveEntrainment})` : ''}

Provide structured lyrics with timestamps (seconds from 0 to approx 90-120s), chord markers, lyrical rhymes, and arrangement instructions.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: userPrompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: 'Catchy song title' },
            subtitle: { type: Type.STRING, description: 'Secondary title / poetic translation' },
            artist: { type: Type.STRING, description: 'Artist / Producer persona' },
            genre: { type: Type.STRING, description: 'Genre category' },
            mood: { type: Type.STRING, description: 'Mood descriptor' },
            key: { type: Type.STRING, description: 'Musical key signature (e.g. Dm, Gmaj, C#m)' },
            bpm: { type: Type.INTEGER, description: 'BPM number between 65 and 150' },
            durationSec: { type: Type.INTEGER, description: 'Duration in seconds (e.g. 75 to 110)' },
            scaleType: { type: Type.STRING, description: 'Scale type e.g. Minor Pentatonic, Bilawal / Major, Bhairavi, Dorian' },
            summary: { type: Type.STRING, description: '2 sentence narrative of the song meaning and vibe' },
            chordsProgression: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Primary chord sequence e.g. ["Dm", "Bb", "C", "Am"]' },
            sections: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  sectionType: { type: Type.STRING, description: 'e.g. Intro, Verse 1, Chorus, Verse 2, Bridge, Outro' },
                  lines: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        lyric: { type: Type.STRING, description: 'Lyric line in target language/Roman script' },
                        translation: { type: Type.STRING, description: 'English meaning or poetic translation' },
                        timestampSec: { type: Type.NUMBER, description: 'Time in seconds when this line is sung' },
                        chord: { type: Type.STRING, description: 'Current musical chord for this bar' },
                        vocalCue: { type: Type.STRING, description: 'Vocal inflection note e.g. [Softly], [Harmonized], [Crescendo]' },
                      },
                      required: ['lyric', 'timestampSec', 'chord'],
                    },
                  },
                },
                required: ['sectionType', 'lines'],
              },
            },
            bioacousticData: {
              type: Type.OBJECT,
              properties: {
                frequencyHz: { type: Type.NUMBER, description: 'Tuning or fundamental frequency (e.g. 432, 528, 111)' },
                binauralBeatHz: { type: Type.NUMBER, description: 'Binaural wave entrainment frequency (e.g. 6.0, 10.0, 40.0)' },
                biologicalMechanism: { type: Type.STRING, description: 'Scientific explanation of sonic effects on neural or cellular states' },
                citationReference: { type: Type.STRING, description: 'Authoritative literature/database reference (e.g. UniProt, PubMed)' },
              },
            },
            instrumentation: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Instruments used in arrangement e.g. ["Acoustic Guitar", "Harmonium", "Sub 808 Bass", "Tabla & Hi-Hats", "Violin Arpeggio"]',
            },
          },
          required: ['title', 'artist', 'genre', 'mood', 'key', 'bpm', 'durationSec', 'summary', 'chordsProgression', 'sections'],
        },
      },
    });

    const parsedJson = JSON.parse(response.text || '{}');

    // Attach bioPreset if not explicitly generated
    if (bioPreset && !parsedJson.bioacousticData) {
      parsedJson.bioacousticData = {
        frequencyHz: bioPreset.targetFrequencyHz,
        binauralBeatHz: bioPreset.id.includes('circadian') ? 6.0 : bioPreset.id.includes('cellular') ? 40.0 : 10.0,
        biologicalMechanism: bioPreset.description,
        citationReference: bioPreset.sequenceOrigin,
      };
    }

    res.json({
      success: true,
      song: parsedJson,
    });
  } catch (error: any) {
    console.error('Error generating song:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate song',
    });
  }
});

// Endpoint: Synthesize Vocal audio using Gemini TTS
app.post('/api/song/synthesize-vocals', async (req, res) => {
  try {
    const {
      text,
      voiceName = 'Kore',
      style = 'Melodic, rhythmic, soulful singer with expressive cadence',
    } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ success: false, error: 'Text is required' });
    }

    // Call gemini-3.8-flash-lite-tts for high efficiency audio generation
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `Sing or rhythmically vocalize the following poetic lyrics with feeling, soul, and melodious cadence:\n\n${text}`,
              speechMetadata: {
                style,
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            // Options: 'Kore', 'Puck', 'Charon', 'Fenrir', 'Zephyr'
            prebuiltVoiceConfig: { voiceName: voiceName || 'Kore' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (!base64Audio) {
      return res.status(500).json({
        success: false,
        error: 'No audio returned from Gemini TTS',
      });
    }

    // In unary default, gemini-3.8-flash-lite-tts returns a complete WAV file (audio/wav, 24kHz mono)
    res.json({
      success: true,
      audioDataUrl: `data:audio/wav;base64,${base64Audio}`,
    });
  } catch (error: any) {
    console.error('Error in TTS vocal synthesis:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Vocal synthesis failed',
    });
  }
});

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Vite dev middleware or static prod files
const isProduction = process.env.NODE_ENV === 'production';
const PORT = 3000;

async function startServer() {
  if (!isProduction) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SurAI Music Studio server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
