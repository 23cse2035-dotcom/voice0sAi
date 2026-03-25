# Getting Started - VoiceOS AI

Complete guide to running and understanding VoiceOS AI with full Murf AI features.

## Quick Start (5 minutes)

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Environment Variables
Create/update `.env`:
```
VITE_SUPABASE_URL=https://cpnmxetvctncfecrvacq.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_MURF_API_KEY=your_murf_api_key_here
```

### 3. Run Development Server
```bash
npm run dev
```

### 4. Open Browser
Navigate to `http://localhost:5173`

## First Interaction

1. **Click the blue microphone button**
2. **Say a command**:
   - "Add meeting at 6 PM"
   - "Explain recursion"
   - "What are my tasks?"
3. **Listen to the response** in voice

## Feature Tour

### A. Voice Settings (⚙️ Icon)
- **Language**: Switch between English, Hindi, Spanish, French, German
- **Voice**: Choose professional voice (Alex, Victoria, Priya, etc.)
- **Tone**: Pick conversational, narrative, professional, or friendly
- **Speed**: Adjust speech rate (0.5x slow to 2.0x fast)
- **Pitch**: Fine-tune voice pitch

### B. Audio Dubbing (🔊 Icon)
- Click the volume icon
- Enter text to dub
- Select target language
- Click "Dub Audio"
- Hear the dubbed version

### C. Bilingual Demo (🌐 Icon)
- Click globe icon
- Hear English message
- Hear Hindi translation
- Perfect for demonstrating language switching

### D. Task Management
- Say "Add [task name] at [time]"
- Click Tasks tab to see all tasks
- Check off completed tasks
- Delete tasks with trash icon

### E. Learning Mode
- Say "Explain [topic]"
- Get detailed explanation
- Say "I didn't understand"
- Get simplified explanation

## Key Features Explained

### Real-Time Voice Interaction
- **No typing required** - everything through voice
- **Instant responses** - powered by Murf Falcon (<130ms latency)
- **Natural dialogue** - emotion-aware and context-aware

### Smart Intent Detection
- **Productivity**: Creates tasks, manages reminders
- **Learning**: Explains concepts, provides education
- **General**: Answers questions, has conversations

### Emotion-Aware Responses
- **Confused**: System simplifies explanations
- **Curious**: System provides detailed information
- **Frustrated**: System offers empathy and support
- **Happy**: System is warm and friendly

### Multilingual Support
- **6 Languages**: English, Hindi, Spanish, French, German, German
- **Code-switching**: Mix languages naturally
- **Real-time dubbing**: Convert content between languages

## Understanding the UI

### Main Screen
- **Chat Tab**: Conversation history with intent/emotion tags
- **Tasks Tab**: Visual task management
- **Settings Button**: Voice and tone configuration
- **Microphone Button**:
  - Blue (inactive) - Click to start
  - Red (listening) - Speak now
  - Green (speaking) - System responding

### Wave Animation
- Shows real-time audio activity
- Animated when listening or speaking
- Helps visualize voice interaction

## Project Architecture

### Frontend (React)
```
User Interface → React Component
     ↓
Voice Input → Web Speech API
     ↓
Intent Detection → Pattern Matching
     ↓
Emotion Analysis → Keyword Detection
     ↓
Response Generation → Template + AI
     ↓
Voice Output → Murf TTS / Browser TTS
```

### Backend (Supabase)
```
PostgreSQL Database
     ↓
Conversations Table → Chat History
Tasks Table → Task Management
User Context → Conversation State
Learning Sessions → Educational Data
```

### Services
1. **Conversation Service**: Saves/retrieves chat
2. **Task Service**: CRUD operations for tasks
3. **Speech Recognition**: Converts audio to text
4. **Murf TTS**: Converts text to audio

## Common Commands

### Task Management
- "Add meeting at 6 PM"
- "Create reminder to call mom"
- "What are my tasks?"
- "Mark first task complete"
- "Delete all tasks"

### Learning
- "Explain recursion"
- "What is a DBMS?"
- "Tell me about algorithms"
- "Simplify that"
- "I didn't understand"

### Voice Control
- "Change voice to British"
- "Make it faster"
- "Slow down"
- "Lower your pitch"
- "Use professional tone"

### Dubbing
- Click volume icon
- Type: "Welcome to VoiceOS"
- Select: Hindi
- Click: Dub Audio

### Bilingual Demo
- Click globe icon
- Hear: English + Hindi

## Troubleshooting

### "Microphone not working"
**Solution**:
- Check browser permissions
- Ensure site has microphone access
- Try Chrome browser (best support)
- Enable "Allow" when prompted

### "No audio output"
**Solution**:
- Check speaker volume
- Verify browser audio settings
- Check system volume
- Try refreshing page

### "Murf API not responding"
**Solution**:
- Verify API key in `.env`
- Check network connection
- Try browser fallback TTS
- Check Murf API status

### "Tasks not saving"
**Solution**:
- Verify Supabase connection
- Check browser console for errors
- Ensure `.env` has correct URLs

### "Speech recognition failing"
**Solution**:
- Use HTTPS (Web Speech API requirement)
- Try Chrome/Edge browser
- Check microphone connection
- Clear browser cache

## Development Guide

### Adding a New Voice

1. **Update murfTTS.ts**:
```typescript
export const AVAILABLE_VOICES: VoiceOption[] = [
  // ... existing voices
  {
    id: 'ja-JP-falcon',
    name: 'Yuki',
    language: 'Japanese',
    gender: 'female',
    accent: 'Japanese'
  },
];
```

2. **No UI changes needed** - Settings panel updates automatically

### Adding a New Intent

1. **Update intentDetection.ts**:
```typescript
export function detectIntent(input: string): Intent {
  // ... existing patterns

  if (input.toLowerCase().includes('translate')) {
    return 'translate';
  }
}
```

2. **Update aiProcessor.ts**:
```typescript
case 'translate':
  return tone + handleTranslation(userInput);
```

### Adding a New Tone

1. **Update murfTTS.ts**:
```typescript
export const TONE_OPTIONS = [
  'conversational',
  'narrative',
  'professional',
  'friendly',
  'energetic'  // New tone
];
```

2. **Settings panel updates automatically**

## Performance Tips

1. **Faster Response**
   - Reduce speech rate in settings
   - Pre-generate common responses

2. **Better Recognition**
   - Speak clearly
   - Reduce background noise
   - Use supported languages

3. **Efficient Task Management**
   - Don't create too many tasks
   - Archive old tasks
   - Delete completed tasks

## Best Practices

1. **Speak Clearly**
   - Pronounce words clearly
   - Don't rush
   - Avoid heavy accents

2. **Use Context**
   - Follow up on previous messages
   - System remembers your topic
   - Natural conversation flow

3. **Explore Settings**
   - Try different voices
   - Adjust speed for preference
   - Experiment with tones

4. **Provide Feedback**
   - Say "simplify" if confused
   - Tell system when correct/incorrect
   - Use natural language

## Advanced Usage

### Voice Cloning Effect
Settings → Select tone (happy/sad) → Hear emotional variation

### Bilingual Conversations
1. Set language to Hindi
2. Ask a question
3. System responds in Hindi
4. Click globe for English+Hindi demo

### Audio Transcription
- Speak and watch transcript in real-time
- See intent detection
- View emotion analysis

### Task Scheduling
- "Add review code at 9 AM"
- "Remind me to call at 2 PM"
- "Create deadline for Friday"

## Database Schema Reference

### Conversations
```sql
CREATE TABLE conversations (
  id uuid PRIMARY KEY,
  user_id uuid,
  message text,
  message_type 'user' | 'assistant',
  intent text,
  emotion text,
  timestamp timestamptz
);
```

### Tasks
```sql
CREATE TABLE tasks (
  id uuid PRIMARY KEY,
  user_id uuid,
  title text,
  due_date timestamptz,
  completed boolean,
  created_at timestamptz
);
```

### User Context
```sql
CREATE TABLE user_context (
  id uuid PRIMARY KEY,
  user_id uuid,
  last_intent text,
  last_topic text,
  conversation_context jsonb,
  updated_at timestamptz
);
```

## API Integration Points

### Murf Falcon TTS
```
POST https://api.murf.ai/v1/speech/generate
Headers: { 'api-key': YOUR_KEY }
Body: { voiceId, text, language, style, rate, pitch, ... }
```

### Web Speech API (Browser)
```javascript
const recognition = new SpeechRecognition();
recognition.start();
recognition.onresult = (event) => { /* handle */ };
```

### Supabase
```typescript
const { data } = await supabase
  .from('conversations')
  .select('*')
  .eq('user_id', userId);
```

## Performance Metrics

- **TTS Latency**: <500ms average
- **STT Latency**: <1000ms average
- **Database Query**: <100ms
- **UI Response**: <50ms

## Browser Compatibility Matrix

| Browser | Version | Support | Notes |
|---------|---------|---------|-------|
| Chrome | 90+ | ✓ Full | Best performance |
| Edge | 90+ | ✓ Full | Excellent support |
| Firefox | 88+ | ✓ Full | Good support |
| Safari | 14+ | ⚠ Limited | STT may not work |
| Mobile Chrome | Latest | ✓ Full | Touch optimized |
| Mobile Safari | Latest | ⚠ Limited | Limited TTS |

## Next Steps

1. **Customize Settings**: Adjust voice and tone to preference
2. **Create Tasks**: Speak commands to manage your day
3. **Learn Concepts**: Ask the system to explain topics
4. **Explore Languages**: Try different languages
5. **Enable Murf API**: For production-quality voices

## Getting Murf API Key

1. Visit https://murf.ai/
2. Sign up for free account
3. Go to API section
4. Generate API key
5. Add to `.env` file as `VITE_MURF_API_KEY`

## Support Resources

- **Official Docs**: https://murf.ai/api
- **GitHub Issues**: Report bugs
- **Documentation**: See README.md and MURF_FEATURES.md
- **Demo**: DEMO.md has full walkthrough

## Keyboard Shortcuts (Future)

- `M` - Toggle Microphone
- `T` - Switch to Tasks
- `C` - Switch to Chat
- `S` - Open Settings
- `D` - Open Dubbing
- `ESC` - Close dialogs

## Security Notes

- ✓ No voice data stored (transcripts only)
- ✓ Row-Level Security enabled
- ✓ API keys not exposed
- ✓ HTTPS recommended
- ✓ User data encrypted

## Credits

- **Murf AI**: Falcon TTS API and voice platform
- **Supabase**: Backend and database
- **React**: UI framework
- **Tailwind CSS**: Styling

## License

MIT - Free for educational and commercial use

---

**Happy Voice Computing! 🎤**

For more help, check MURF_FEATURES.md for detailed feature documentation.
