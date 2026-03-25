export interface MurfTTSOptions {
  voiceId?: string;
  language?: string;
  tone?: 'conversational' | 'narrative' | 'professional' | 'friendly';
  rate?: number;
  pitch?: number;
}

export interface VoiceOption {
  id: string;
  name: string;
  language: string;
  gender: 'male' | 'female' | 'neutral';
  accent: string;
}

export interface VoiceCloneOptions {
  tone?: 'normal' | 'happy' | 'sad' | 'angry' | 'surprised';
  emotion?: number;
}

const DEFAULT_VOICE_ID = 'en-US-falcon';
const MURF_API_URL = 'https://api.murf.ai/v1/speech/generate';

let currentAudio: HTMLAudioElement | null = null;

export const AVAILABLE_VOICES: VoiceOption[] = [
  { id: 'en-US-falcon', name: 'Alex', language: 'English', gender: 'male', accent: 'American' },
  { id: 'en-GB-falcon', name: 'Victoria', language: 'English', gender: 'female', accent: 'British' },
  { id: 'hi-IN-falcon', name: 'Priya', language: 'Hindi', gender: 'female', accent: 'Indian' },
  { id: 'es-ES-falcon', name: 'Sofia', language: 'Spanish', gender: 'female', accent: 'Spanish' },
  { id: 'fr-FR-falcon', name: 'Marie', language: 'French', gender: 'female', accent: 'French' },
  { id: 'de-DE-falcon', name: 'Lukas', language: 'German', gender: 'male', accent: 'German' },
];

export const TONE_OPTIONS: MurfTTSOptions['tone'][] = [
  'conversational',
  'narrative',
  'professional',
  'friendly',
];

export async function speakWithMurf(
  text: string,
  options: MurfTTSOptions = {}
): Promise<void> {
  const {
    voiceId = DEFAULT_VOICE_ID,
    language = 'en-US',
    tone = 'conversational',
    rate = 1.0,
    pitch = 1.0,
  } = options;

  const apiKey = import.meta.env.VITE_MURF_API_KEY;

  if (!apiKey || apiKey === 'your_murf_api_key_here') {
    return speakWithBrowserTTS(text, { rate, pitch });
  }

  try {
    const response = await fetch(MURF_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify({
        voiceId,
        text,
        language,
        style: tone,
        rate: Math.max(0.5, Math.min(2.0, rate)),
        pitch: Math.max(0.5, Math.min(2.0, pitch)),
        sampleRate: 24000,
        format: 'MP3',
      }),
    });

    if (!response.ok) {
      throw new Error(`Murf API error: ${response.statusText}`);
    }

    const audioBlob = await response.blob();
    await playAudioBlob(audioBlob);
  } catch (error) {
    console.warn('Murf TTS failed, falling back to browser TTS:', error);
    speakWithBrowserTTS(text, { rate, pitch });
  }
}

async function playAudioBlob(audioBlob: Blob): Promise<void> {
  return new Promise((resolve, reject) => {
    stopSpeaking();

    const audioUrl = URL.createObjectURL(audioBlob);
    currentAudio = new Audio(audioUrl);

    currentAudio.onended = () => {
      URL.revokeObjectURL(audioUrl);
      currentAudio = null;
      resolve();
    };

    currentAudio.onerror = (error) => {
      URL.revokeObjectURL(audioUrl);
      currentAudio = null;
      reject(error);
    };

    currentAudio.play().catch(reject);
  });
}

function speakWithBrowserTTS(
  text: string,
  options: { rate?: number; pitch?: number } = {}
): Promise<void> {
  return new Promise((resolve) => {
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = options.rate || 1.1;
    utterance.pitch = options.pitch || 1.0;
    utterance.volume = 1.0;

    const voices = window.speechSynthesis.getVoices();
    const preferredVoice =
      voices.find((v) => v.lang.startsWith('en') && v.name.includes('Female')) ||
      voices.find((v) => v.lang.startsWith('en'));

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onend = () => resolve();
    utterance.onerror = () => resolve();

    window.speechSynthesis.speak(utterance);
  });
}

export function stopSpeaking(): void {
  window.speechSynthesis.cancel();
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }
}

export function getVoicesByLanguage(language: string): VoiceOption[] {
  return AVAILABLE_VOICES.filter((v) =>
    v.language.toLowerCase().includes(language.toLowerCase())
  );
}

export async function generateBilingual(
  englishText: string,
  hindiText: string
): Promise<void> {
  try {
    await speakWithMurf(englishText, { voiceId: 'en-US-falcon', language: 'en-US' });
    await new Promise((resolve) => setTimeout(resolve, 500));
    await speakWithMurf(hindiText, { voiceId: 'hi-IN-falcon', language: 'hi-IN' });
  } catch (error) {
    console.error('Bilingual speech error:', error);
  }
}

export async function cloneVoice(
  text: string,
  options: VoiceCloneOptions = {}
): Promise<void> {
  const { tone = 'normal', emotion = 0.5 } = options;

  const emotionRate = tone === 'happy' ? 1.2 : tone === 'sad' ? 0.8 : 1.0;
  const emotionPitch = tone === 'happy' ? 1.15 : tone === 'sad' ? 0.85 : 1.0;

  await speakWithMurf(text, {
    tone: 'conversational',
    rate: emotionRate * emotion,
    pitch: emotionPitch,
  });
}

export async function dubAudio(
  originalText: string,
  targetLanguage: string,
  voiceId?: string
): Promise<void> {
  const langMap: Record<string, string> = {
    hindi: 'hi-IN',
    spanish: 'es-ES',
    french: 'fr-FR',
    german: 'de-DE',
    english: 'en-US',
  };

  const language = langMap[targetLanguage.toLowerCase()] || targetLanguage;
  const voice =
    voiceId || AVAILABLE_VOICES.find((v) => v.language.toLowerCase() === targetLanguage.toLowerCase())?.id;

  if (!voice) {
    console.warn(`No voice found for language: ${targetLanguage}`);
    return;
  }

  await speakWithMurf(originalText, {
    voiceId: voice,
    language,
    tone: 'conversational',
  });
}

export function isAudioPlaying(): boolean {
  if (currentAudio) {
    return !currentAudio.paused;
  }
  return window.speechSynthesis.speaking;
}

export function getAvailableLanguages(): string[] {
  return Array.from(new Set(AVAILABLE_VOICES.map((v) => v.language)));
}
