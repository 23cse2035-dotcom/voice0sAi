import { useState } from 'react';
import { Volume2, Copy, Download } from 'lucide-react';
import { dubAudio, AVAILABLE_VOICES } from '../utils/murfTTS';
import { getAvailableLanguages } from '../utils/murfTTS';

interface DubbingPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DubbingPanel({ isOpen, onClose }: DubbingPanelProps) {
  const [sourceText, setSourceText] = useState('');
  const [targetLanguage, setTargetLanguage] = useState('Hindi');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDubbed, setIsDubbed] = useState(false);

  const languages = getAvailableLanguages();

  const handleDub = async () => {
    if (!sourceText.trim()) {
      alert('Please enter text to dub');
      return;
    }

    setIsProcessing(true);
    try {
      await dubAudio(sourceText, targetLanguage);
      setIsDubbed(true);
    } catch (error) {
      console.error('Dubbing error:', error);
      alert('Failed to dub audio. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(sourceText);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4">
        <div className="p-6 border-b bg-gradient-to-r from-emerald-50 to-blue-50">
          <h2 className="text-2xl font-bold text-gray-900">Audio Dubbing</h2>
          <p className="text-gray-600 text-sm mt-1">Dub your content into different languages</p>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Source Text
            </label>
            <textarea
              value={sourceText}
              onChange={(e) => setSourceText(e.target.value)}
              placeholder="Enter text to dub..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={4}
            />
            <div className="mt-2 flex justify-end">
              <button
                onClick={handleCopy}
                className="text-xs text-gray-600 hover:text-gray-900 flex items-center gap-1"
              >
                <Copy className="w-3 h-3" />
                Copy
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Target Language
            </label>
            <select
              value={targetLanguage}
              onChange={(e) => setTargetLanguage(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              {languages.map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>
          </div>

          {isDubbed && (
            <div className="p-4 bg-green-50 border border-green-300 rounded-lg">
              <p className="text-green-800 text-sm font-medium">
                Audio dubbed successfully to {targetLanguage}
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-4 border-t">
            <button
              onClick={handleDub}
              disabled={isProcessing || !sourceText.trim()}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
            >
              <Volume2 className="w-4 h-4" />
              {isProcessing ? 'Dubbing...' : 'Dub Audio'}
            </button>
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
