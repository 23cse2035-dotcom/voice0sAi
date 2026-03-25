interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

export interface TranscriptionOptions {
  language?: string;
  useWebSpeechAPI?: boolean;
}

let recognition: SpeechRecognition | null = null;
let isListeningActive = false;

export function initializeSpeechRecognition(): SpeechRecognition | null {
  const SpeechRecognitionAPI =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognitionAPI) {
    console.error('Speech recognition not supported');
    return null;
  }

  if (!recognition) {
    recognition = new SpeechRecognitionAPI();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
  }

  return recognition;
}

export function startListening(
  onResult: (text: string) => void,
  onError?: (error: string) => void
): void {
  const rec = initializeSpeechRecognition();

  if (!rec) {
    onError?.('Speech recognition not supported in this browser');
    return;
  }

  isListeningActive = true;
  let finalTranscript = '';

  rec.onstart = () => {
    isListeningActive = true;
  };

  rec.onresult = (event: SpeechRecognitionEvent) => {
    let interimTranscript = '';

    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript;

      if (event.results[i].isFinal) {
        finalTranscript += transcript + ' ';
      } else {
        interimTranscript += transcript;
      }
    }

    if (finalTranscript) {
      onResult(finalTranscript.trim());
    }
  };

  rec.onerror = (event: SpeechRecognitionErrorEvent) => {
    console.error('Speech recognition error:', event.error);
    onError?.(event.error);
  };

  rec.onend = () => {
    isListeningActive = false;
  };

  try {
    rec.start();
  } catch (error) {
    console.error('Error starting recognition:', error);
    onError?.('Failed to start speech recognition');
    isListeningActive = false;
  }
}

export function stopListening(): void {
  if (recognition) {
    try {
      recognition.stop();
    } catch (error) {
      console.warn('Error stopping recognition:', error);
    }
    isListeningActive = false;
  }
}

export function setLanguage(language: string): void {
  const rec = initializeSpeechRecognition();
  if (rec) {
    rec.lang = language;
  }
}

export function isListening(): boolean {
  return isListeningActive;
}

export async function transcribeAudio(audioBlob: Blob): Promise<string> {
  const apiKey = import.meta.env.VITE_MURF_API_KEY;

  if (!apiKey || apiKey === 'your_murf_api_key_here') {
    console.warn('Murf API key not configured for transcription');
    return '';
  }

  const formData = new FormData();
  formData.append('audio', audioBlob);

  try {
    const response = await fetch('https://api.murf.ai/v1/transcribe', {
      method: 'POST',
      headers: {
        'api-key': apiKey,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Transcription failed: ${response.statusText}`);
    }

    const result = await response.json();
    return result.text || '';
  } catch (error) {
    console.error('Transcription error:', error);
    return '';
  }
}

export async function transcribeAudioFile(
  file: File,
  options: TranscriptionOptions = {}
): Promise<string> {
  const { language = 'en-US' } = options;

  setLanguage(language);
  return transcribeAudio(file);
}

export function isSpeechRecognitionSupported(): boolean {
  return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
}
