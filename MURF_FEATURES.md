# Murf AI Features - Complete Implementation Guide

VoiceOS AI demonstrates all major Murf AI capabilities in a production-ready application.

## 1. Falcon Text-to-Speech (TTS)

### Implementation Details

**File**: `src/utils/murfTTS.ts`

```typescript
export async function speakWithMurf(
  text: string,
  options: MurfTTSOptions = {}
): Promise<void>
```

### Features

- **Ultra-Low Latency**: <130ms response time
- **Natural Voice**: Professional, human-like quality
- **Error Handling**: Automatic fallback to browser TTS

### Configuration Options

```typescript
interface MurfTTSOptions {
  voiceId?: string;        // Voice selection
  language?: string;        // Language code (en-US, hi-IN, etc)
  tone?: string;            // conversational, narrative, professional, friendly
  rate?: number;            // Speech rate (0.5 - 2.0)
  pitch?: number;           // Pitch adjustment (0.5 - 2.0)
}
```

### Usage Example

```typescript
await speakWithMurf("Hello, how can I help you?", {
  voiceId: 'en-US-falcon',
  language: 'en-US',
  tone: 'friendly',
  rate: 1.0,
  pitch: 1.0
});
```

## 2. Multiple Voices & Accents

### Available Voices

| ID | Name | Language | Gender | Accent |
|---|---|---|---|---|
| en-US-falcon | Alex | English | Male | American |
| en-GB-falcon | Victoria | English | Female | British |
| hi-IN-falcon | Priya | Hindi | Female | Indian |
| es-ES-falcon | Sofia | Spanish | Female | Spanish |
| fr-FR-falcon | Marie | French | Female | French |
| de-DE-falcon | Lukas | German | Male | German |

### Access via UI

**Settings Panel** → Language dropdown → Voice selection

### Programmatic Access

```typescript
import { AVAILABLE_VOICES, getVoicesByLanguage } from '../utils/murfTTS';

// Get all voices
const allVoices = AVAILABLE_VOICES;

// Get voices for specific language
const hindiVoices = getVoicesByLanguage('Hindi');
```

## 3. Tone Control

### Tone Options

1. **Conversational**: Friendly, casual tone for natural dialogue
2. **Narrative**: Storytelling, engaging presentation
3. **Professional**: Formal, business-appropriate tone
4. **Friendly**: Warm, approachable tone

### Implementation

```typescript
const TONE_OPTIONS = [
  'conversational',
  'narrative',
  'professional',
  'friendly'
];
```

### UI Control

Settings panel → Tone selector (4 buttons)

## 4. Speech Rate & Pitch Control

### Speech Rate (0.5x - 2.0x)

- **0.5x**: Slow, easy-to-understand
- **1.0x**: Normal speed (default)
- **2.0x**: Fast, efficient delivery

### Pitch Adjustment (0.5 - 2.0)

- **0.5**: Lower, deeper voice
- **1.0**: Normal pitch (default)
- **2.0**: Higher, more energetic voice

### Implementation

```typescript
interface MurfTTSOptions {
  rate: number;   // 0.5 - 2.0
  pitch: number;  // 0.5 - 2.0
}
```

### UI Controls

Settings panel → Sliders for both rate and pitch

## 5. Bilingual Voice Interaction

### Language Switching Support

The Murf Falcon model supports seamless code-switching:

```typescript
export async function generateBilingual(
  englishText: string,
  hindiText: string
): Promise<void>
```

### Example Usage

```typescript
await generateBilingual(
  "Welcome to VoiceOS AI",
  "वॉइस ओएस एआई में स्वागत है"
);
```

### Implementation

1. Generate English audio with en-US voice
2. Wait for completion
3. Generate Hindi audio with hi-IN voice
4. Play both sequentially

### UI Access

- Globe icon in header triggers bilingual demo
- Demonstrates English + Hindi in one interaction

## 6. Audio Dubbing

### What is Dubbing?

Converting content to different languages while maintaining the original message.

### Implementation

```typescript
export async function dubAudio(
  originalText: string,
  targetLanguage: string,
  voiceId?: string
): Promise<void>
```

### Supported Language Pairs

- English → Hindi
- English → Spanish
- English → French
- English → German

### UI Interface

**Dubbing Panel** (Volume icon in header)

1. Enter text to dub
2. Select target language
3. Click "Dub Audio"
4. System generates audio in target language

### Use Cases

- **Content Localization**: Adapt videos for different markets
- **Educational Content**: Multilingual learning materials
- **Customer Support**: Support in user's preferred language

## 7. Speech-to-Text (STT)

### Capabilities

1. **Web Speech API Integration**
   - Real-time speech recognition
   - Interim results display
   - Multi-language support

2. **Murf Transcription API**
   - Audio file transcription
   - Accurate speech-to-text conversion

### Implementation

```typescript
export async function transcribeAudio(audioBlob: Blob): Promise<string>

export async function transcribeAudioFile(
  file: File,
  options: TranscriptionOptions = {}
): Promise<string>
```

### Language Support

```typescript
export function setLanguage(language: string): void
```

### Features

- Automatic speech detection
- Interim results during listening
- Final transcript on completion
- Error handling and retry

## 8. Voice Cloning Simulation

### Feature

Emotion-aware voice adjustment to simulate voice cloning:

```typescript
export async function cloneVoice(
  text: string,
  options: VoiceCloneOptions = {}
): Promise<void>
```

### Emotion Tones

- **normal**: Default voice
- **happy**: Higher pitch, faster rate
- **sad**: Lower pitch, slower rate
- **angry**: Increased rate
- **surprised**: Pitch variation

### Implementation

```typescript
const emotionRate = tone === 'happy' ? 1.2 : tone === 'sad' ? 0.8 : 1.0;
const emotionPitch = tone === 'happy' ? 1.15 : tone === 'sad' ? 0.85 : 1.0;
```

## 9. Error Handling & Fallback

### Graceful Degradation

1. **Primary**: Murf Falcon TTS API
2. **Secondary**: Browser Web Speech API (SpeechSynthesis)

### Implementation

```typescript
try {
  // Try Murf API
  await fetch(MURF_API_URL, { /* options */ });
} catch (error) {
  // Fallback to browser TTS
  speakWithBrowserTTS(text);
}
```

### Error Scenarios

- **No API Key**: Uses browser TTS automatically
- **Network Error**: Falls back to browser TTS
- **Rate Limit**: Graceful error handling
- **Unsupported Language**: Uses nearest available

## 10. Performance Optimization

### Latency Reduction

- **Streaming**: Real-time audio playback
- **Caching**: Response caching (if needed)
- **Concurrent**: Handles up to 2 simultaneous requests

### Optimization Techniques

```typescript
// Optimized rate limiting
const rate = Math.max(0.5, Math.min(2.0, userRate));
const pitch = Math.max(0.5, Math.min(2.0, userPitch));

// Efficient error handling
if (!apiKey || apiKey === 'placeholder') {
  return fallbackTTS(text);
}
```

## 11. Advanced Features

### A. Multilingual User Context

```typescript
export function setLanguage(language: string): void {
  const rec = initializeSpeechRecognition();
  if (rec) {
    rec.lang = language; // 'en-US', 'hi-IN', 'es-ES', etc
  }
}
```

### B. Voice Playback Control

```typescript
export function isAudioPlaying(): boolean
export function stopSpeaking(): void
export function resumeAudioContext(): void
```

### C. Language Detection

```typescript
export function getAvailableLanguages(): string[] {
  return Array.from(new Set(AVAILABLE_VOICES.map((v) => v.language)));
}
```

## 12. Integration Points

### In VoiceOS Component

1. **Voice Selection**: Settings panel
2. **Tone Adjustment**: Settings panel
3. **Rate Control**: Settings panel slider
4. **Pitch Control**: Settings panel slider
5. **Language Switch**: Settings panel dropdown
6. **Bilingual Demo**: Globe icon
7. **Dubbing**: Volume icon
8. **Auto Speech**: Microphone interaction

### Database Integration

All voice settings and conversation metadata stored in Supabase:

```sql
-- Conversations table
CREATE TABLE conversations (
  id uuid PRIMARY KEY,
  user_id uuid,
  message text,
  message_type text,
  intent text,
  emotion text,
  timestamp timestamptz
);
```

## 13. API Rate Limiting

### Murf API Limits

- **Concurrent Requests**: 2 maximum
- **Rate Limit**: 1,000 requests per minute
- **Testing Quota**: 100,000 characters

### Implementation

```typescript
// Queue management for concurrent requests
let currentAudio: HTMLAudioElement | null = null;

// Prevents simultaneous playback
if (currentAudio) {
  currentAudio.pause();
  currentAudio = null;
}
```

## 14. Configuration

### Environment Variables

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_MURF_API_KEY=your_murf_api_key
```

### Feature Flags (Optional)

```typescript
const USE_MURF_API = !!import.meta.env.VITE_MURF_API_KEY;
const USE_BROWSER_TTS = !USE_MURF_API;
```

## 15. Testing Murf Features

### Test Scenarios

1. **Basic TTS**
   ```typescript
   await speakWithMurf("Hello World");
   ```

2. **Voice Change**
   - Open Settings → Select different voice
   - Say something → Hear new voice

3. **Tone Adjustment**
   - Change tone to "professional"
   - Say something → Hear professional tone

4. **Rate/Pitch Control**
   - Adjust sliders
   - Say something → Hear differences

5. **Bilingual Demo**
   - Click globe icon
   - Hear English + Hindi

6. **Audio Dubbing**
   - Click volume icon
   - Enter text
   - Select Hindi
   - Click "Dub Audio"

7. **Language Switching**
   - Change language in Settings
   - Speak in that language

## 16. Troubleshooting

### Issue: No Audio Output

**Solution**: Check browser speakers and volume settings

### Issue: Murf API Not Working

**Solution**: Verify API key in `.env` file

### Issue: Speech Recognition Failing

**Solution**:
- Use HTTPS (required for Web Speech API)
- Try Chrome browser
- Check microphone permissions

### Issue: Bilingual Demo Not Working

**Solution**: Ensure both voices are available in AVAILABLE_VOICES

## 17. Best Practices

1. **Always handle errors gracefully**
   ```typescript
   try {
     await speakWithMurf(text);
   } catch (error) {
     console.error('TTS error:', error);
     // Fallback automatically handled
   }
   ```

2. **Respect API limits**
   - Don't make concurrent requests
   - Implement queuing if needed

3. **Optimize for latency**
   - Use appropriate speech rate
   - Pre-generate common responses

4. **Accessibility**
   - Provide visual feedback
   - Support text-only mode
   - Include captions

5. **User Experience**
   - Show loading states
   - Cancel operations smoothly
   - Provide clear feedback

## 18. Comprehensive Checklist

- [x] Falcon TTS Integration
- [x] Multiple Voice Support
- [x] Tone Control
- [x] Rate & Pitch Adjustment
- [x] Bilingual Support
- [x] Audio Dubbing
- [x] Speech-to-Text
- [x] Voice Settings UI
- [x] Error Handling
- [x] Browser Fallback
- [x] Database Integration
- [x] Production Build
- [x] Documentation

## 19. Advanced Scenarios

### Scenario 1: Multilingual Support
```typescript
// User in India
setLanguage('hi-IN');
// System responds in Hindi with Priya voice
```

### Scenario 2: Customer Support
```typescript
// Ticket comes in
const response = await generateResponse(ticket.message, intent, emotion, context);
// Dub to customer's language
await dubAudio(response, customerLanguage);
```

### Scenario 3: Educational Platform
```typescript
// Student confused
if (emotion === 'confused') {
  // Simplify explanation
  // Use slower speech rate
  // Use friendly tone
}
```

## 20. Resource Links

- **Murf API Docs**: https://murf.ai/api
- **Murf Dashboard**: https://murf.ai/studio
- **Web Speech API**: https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API
- **SpeechSynthesis**: https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis

---

**Last Updated**: 2026-03-25
**Version**: 1.0
**Status**: Production Ready
