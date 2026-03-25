import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, List, MessageSquare, Loader2, Globe, Volume2 } from 'lucide-react';
import { WaveAnimation } from './WaveAnimation';
import { MessageBubble } from './MessageBubble';
import { TaskList } from './TaskList';
import { Settings } from './Settings';
import { DubbingPanel } from './DubbingPanel';
import { Message, Task, UserContext } from '../types';
import { startListening, stopListening, setLanguage } from '../utils/speechRecognition';
import {
  speakWithMurf,
  stopSpeaking,
  AVAILABLE_VOICES,
  generateBilingual,
  cloneVoice,
  isAudioPlaying,
  MurfTTSOptions,
} from '../utils/murfTTS';
import { detectIntent, getIntentCategory } from '../utils/intentDetection';
import { detectEmotion } from '../utils/emotionAnalysis';
import { generateResponse } from '../utils/aiProcessor';
import {
  saveMessage,
  getConversationHistory,
  updateUserContext,
  getUserContext,
} from '../services/conversationService';
import {
  createTask,
  getTasks,
  completeTask,
  deleteTask,
  extractTaskFromText,
} from '../services/taskService';

const GUEST_USER_ID = '00000000-0000-0000-0000-000000000000';

export function VoiceOS() {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [userContext, setUserContext] = useState<UserContext>({
    conversationContext: {},
  });
  const [activeTab, setActiveTab] = useState<'chat' | 'tasks'>('chat');
  const [isProcessing, setIsProcessing] = useState(false);

  const [selectedVoice, setSelectedVoice] = useState(AVAILABLE_VOICES[0].id);
  const [selectedTone, setSelectedTone] = useState<MurfTTSOptions['tone']>('conversational');
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [speechRate, setSpeechRate] = useState(1.0);
  const [pitch, setPitch] = useState(1.0);
  const [isDubbingOpen, setIsDubbingOpen] = useState(false);
  const [showBilingual, setShowBilingual] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadData = async () => {
    const history = await getConversationHistory(GUEST_USER_ID);
    setMessages(history);

    const userTasks = await getTasks(GUEST_USER_ID);
    setTasks(userTasks);

    const context = await getUserContext(GUEST_USER_ID);
    setUserContext(context);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const addMessage = async (
    text: string,
    type: 'user' | 'assistant',
    intent?: string,
    emotion?: string
  ) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      message: text,
      messageType: type,
      intent,
      emotion,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);
    await saveMessage(GUEST_USER_ID, text, type, intent, emotion);
  };

  const handleVoiceInput = async (transcript: string) => {
    setIsListening(false);
    setIsProcessing(true);

    const intent = detectIntent(transcript);
    const emotion = detectEmotion(transcript);
    const category = getIntentCategory(intent);

    await addMessage(transcript, 'user', intent, emotion);

    const newContext: UserContext = {
      ...userContext,
      lastIntent: intent,
      lastTopic: category === 'learning' ? transcript : userContext.lastTopic,
    };
    setUserContext(newContext);
    await updateUserContext(GUEST_USER_ID, newContext);

    let response = '';

    if (intent === 'task_create') {
      const { title, dueDate } = extractTaskFromText(transcript);
      const newTask = await createTask(GUEST_USER_ID, title, '', dueDate);
      if (newTask) {
        setTasks((prev) => [newTask, ...prev]);
        response = await generateResponse(transcript, intent, emotion, newContext);
      } else {
        response = 'Sorry, I could not create the task. Please try again.';
      }
    } else if (intent === 'task_list') {
      const userTasks = await getTasks(GUEST_USER_ID);
      setTasks(userTasks);
      if (userTasks.length === 0) {
        response = 'You have no tasks at the moment.';
      } else {
        const taskList = userTasks
          .filter((t) => !t.completed)
          .map((t) => t.title)
          .join(', ');
        response = `You have ${userTasks.filter((t) => !t.completed).length} tasks: ${taskList}`;
      }
      setActiveTab('tasks');
    } else {
      response = await generateResponse(transcript, intent, emotion, newContext);
    }

    await addMessage(response, 'assistant');

    setIsSpeaking(true);
    setIsProcessing(false);

    try {
      await speakWithMurf(response, {
        voiceId: selectedVoice,
        tone: selectedTone,
        rate: speechRate,
        pitch: pitch,
      });
    } catch (error) {
      console.error('TTS error:', error);
    } finally {
      setIsSpeaking(false);
    }
  };

  const handleMicClick = () => {
    if (isListening) {
      stopListening();
      setIsListening(false);
    } else if (isSpeaking || isAudioPlaying()) {
      stopSpeaking();
      setIsSpeaking(false);
    } else {
      setIsListening(true);
      startListening(
        handleVoiceInput,
        (error) => {
          console.error('Speech recognition error:', error);
          setIsListening(false);
        }
      );
    }
  };

  const handleLanguageChange = (language: string) => {
    setSelectedLanguage(language);
    const langCode = language === 'Hindi' ? 'hi-IN' : language === 'Spanish' ? 'es-ES' : 'en-US';
    setLanguage(langCode);
  };

  const handleBilingualDemo = async () => {
    setIsProcessing(true);
    try {
      await generateBilingual(
        'Welcome to VoiceOS AI. This is an English message.',
        'वॉइस ओएस एआई में स्वागत है। यह एक हिंदी संदेश है।'
      );
      await addMessage('Bilingual demo: English and Hindi', 'assistant');
    } catch (error) {
      console.error('Bilingual error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCompleteTask = async (taskId: string) => {
    const success = await completeTask(taskId);
    if (success) {
      setTasks((prev) =>
        prev.map((task) => (task.id === taskId ? { ...task, completed: true } : task))
      );
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    const success = await deleteTask(taskId);
    if (success) {
      setTasks((prev) => prev.filter((task) => task.id !== taskId));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">VoiceOS AI</h1>
          <p className="text-gray-600">Advanced Real-Time Voice-First Intelligent Assistant</p>
        </header>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="flex items-center justify-between border-b p-4 bg-gray-50">
            <div className="flex gap-1">
              <button
                onClick={() => setActiveTab('chat')}
                className={`flex items-center justify-center gap-2 px-4 py-2 font-medium rounded-lg transition-colors ${
                  activeTab === 'chat'
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                Chat
              </button>
              <button
                onClick={() => setActiveTab('tasks')}
                className={`flex items-center justify-center gap-2 px-4 py-2 font-medium rounded-lg transition-colors ${
                  activeTab === 'tasks'
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <List className="w-4 h-4" />
                Tasks ({tasks.filter((t) => !t.completed).length})
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsDubbingOpen(true)}
                title="Audio Dubbing"
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <Volume2 className="w-5 h-5 text-gray-700" />
              </button>
              <button
                onClick={handleBilingualDemo}
                title="Bilingual Demo"
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors flex items-center gap-1"
              >
                <Globe className="w-5 h-5 text-gray-700" />
              </button>
              <Settings
                selectedVoice={selectedVoice}
                selectedTone={selectedTone}
                selectedLanguage={selectedLanguage}
                speechRate={speechRate}
                pitch={pitch}
                onVoiceChange={setSelectedVoice}
                onToneChange={(tone) => setSelectedTone(tone as MurfTTSOptions['tone'])}
                onLanguageChange={handleLanguageChange}
                onRateChange={setSpeechRate}
                onPitchChange={setPitch}
              />
            </div>
          </div>

          <div className="h-[500px] overflow-y-auto p-6">
            {activeTab === 'chat' ? (
              <div className="space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center text-gray-500 py-12">
                    <Mic className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium mb-2">Welcome to VoiceOS AI</p>
                    <p className="text-sm">Press the microphone to start talking</p>
                    <div className="mt-8 space-y-4">
                      <div className="text-left max-w-md mx-auto space-y-2">
                        <p className="font-medium text-gray-700 text-sm">Productivity:</p>
                        <ul className="text-sm space-y-1 text-gray-600">
                          <li>"Add a meeting at 6 PM"</li>
                          <li>"What are my tasks?"</li>
                        </ul>
                      </div>
                      <div className="text-left max-w-md mx-auto space-y-2">
                        <p className="font-medium text-gray-700 text-sm">Learning:</p>
                        <ul className="text-sm space-y-1 text-gray-600">
                          <li>"Explain recursion"</li>
                          <li>"I didn't understand, simplify"</li>
                        </ul>
                      </div>
                      <div className="text-left max-w-md mx-auto space-y-2">
                        <p className="font-medium text-gray-700 text-sm">Features:</p>
                        <ul className="text-sm space-y-1 text-gray-600">
                          <li>Change voice, tone, and speed in Settings</li>
                          <li>Use Dubbing to translate audio to other languages</li>
                          <li>Click Globe icon for bilingual demo</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    {messages.map((message) => (
                      <MessageBubble key={message.id} message={message} />
                    ))}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>
            ) : (
              <TaskList
                tasks={tasks}
                onCompleteTask={handleCompleteTask}
                onDeleteTask={handleDeleteTask}
              />
            )}
          </div>

          <div className="border-t bg-gray-50 p-6">
            <div className="flex flex-col items-center gap-4">
              <WaveAnimation isActive={isListening || isSpeaking} />

              <button
                onClick={handleMicClick}
                disabled={isProcessing}
                className={`w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-lg ${
                  isProcessing
                    ? 'bg-gray-400 cursor-not-allowed'
                    : isListening
                    ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                    : isSpeaking
                    ? 'bg-emerald-500 hover:bg-emerald-600'
                    : 'bg-blue-500 hover:bg-blue-600 hover:scale-110'
                }`}
              >
                {isProcessing ? (
                  <Loader2 className="w-10 h-10 text-white animate-spin" />
                ) : isListening ? (
                  <Mic className="w-10 h-10 text-white" />
                ) : isSpeaking ? (
                  <MicOff className="w-10 h-10 text-white" />
                ) : (
                  <Mic className="w-10 h-10 text-white" />
                )}
              </button>

              <p className="text-sm text-gray-600">
                {isProcessing
                  ? 'Processing...'
                  : isListening
                  ? 'Listening... Speak now'
                  : isSpeaking
                  ? 'Speaking...'
                  : 'Press to talk'}
              </p>
            </div>
          </div>
        </div>

        <DubbingPanel isOpen={isDubbingOpen} onClose={() => setIsDubbingOpen(false)} />

        <footer className="mt-8 text-center text-sm text-gray-500">
          <p>Powered by Murf Falcon TTS API</p>
          <p className="mt-1">Murf AI Voice Hackathon 2026</p>
        </footer>
      </div>
    </div>
  );
}
