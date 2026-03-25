import { useState } from 'react';
import { Settings as SettingsIcon, X } from 'lucide-react';
import {
  AVAILABLE_VOICES,
  TONE_OPTIONS,
  getAvailableLanguages,
  VoiceOption,
} from '../utils/murfTTS';

interface SettingsProps {
  selectedVoice: string;
  selectedTone: string;
  selectedLanguage: string;
  speechRate: number;
  pitch: number;
  onVoiceChange: (voiceId: string) => void;
  onToneChange: (tone: string) => void;
  onLanguageChange: (language: string) => void;
  onRateChange: (rate: number) => void;
  onPitchChange: (pitch: number) => void;
}

export function Settings({
  selectedVoice,
  selectedTone,
  selectedLanguage,
  speechRate,
  pitch,
  onVoiceChange,
  onToneChange,
  onLanguageChange,
  onRateChange,
  onPitchChange,
}: SettingsProps) {
  const [isOpen, setIsOpen] = useState(false);

  const languages = getAvailableLanguages();
  const voicesForLanguage = AVAILABLE_VOICES.filter(
    (v) => v.language === selectedLanguage
  );

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
        title="Voice Settings"
      >
        <SettingsIcon className="w-6 h-6 text-gray-700" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-50 to-blue-100">
              <h2 className="text-2xl font-bold text-gray-900">Voice Settings</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-white rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Language
                </label>
                <select
                  value={selectedLanguage}
                  onChange={(e) => onLanguageChange(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  {languages.map((lang) => (
                    <option key={lang} value={lang}>
                      {lang}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Voice
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {voicesForLanguage.map((voice) => (
                    <button
                      key={voice.id}
                      onClick={() => onVoiceChange(voice.id)}
                      className={`p-3 rounded-lg border-2 transition-all text-left ${
                        selectedVoice === voice.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      <div className="font-medium text-gray-900">{voice.name}</div>
                      <div className="text-xs text-gray-600">
                        {voice.gender} · {voice.accent}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tone
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {TONE_OPTIONS.map((tone) => (
                    <button
                      key={tone}
                      onClick={() => onToneChange(tone)}
                      className={`p-2 rounded-lg border-2 transition-all capitalize text-sm font-medium ${
                        selectedTone === tone
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 text-gray-700 hover:border-blue-300'
                      }`}
                    >
                      {tone}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Speech Rate: {speechRate.toFixed(1)}x
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="2.0"
                  step="0.1"
                  value={speechRate}
                  onChange={(e) => onRateChange(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
                <div className="flex justify-between text-xs text-gray-600 mt-2">
                  <span>Slower (0.5x)</span>
                  <span>Faster (2.0x)</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Pitch: {pitch.toFixed(1)}
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="2.0"
                  step="0.1"
                  value={pitch}
                  onChange={(e) => onPitchChange(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
                <div className="flex justify-between text-xs text-gray-600 mt-2">
                  <span>Lower (0.5)</span>
                  <span>Higher (2.0)</span>
                </div>
              </div>

              <div className="pt-4 border-t">
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
