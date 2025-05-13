'use client';

import { Globe, ArrowUp, Loader2 } from 'lucide-react';

interface ChatInputProps {
  inputText: string;
  setInputText: (text: string) => void;
  onSend: () => Promise<void>;
  onPlus?: () => void;
  onGlobe?: () => void;
  loading?: boolean;
  rightPanel: boolean;
}

const ChatInput = ({
  inputText,
  setInputText,
  onSend,
  onPlus,
  onGlobe,
  loading = false,
  rightPanel,
}: ChatInputProps) => {
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !loading) {
      onSend();
    }
  };

  return (
    <div
      className={`bg-gray-800 rounded-lg p-4 flex flex-col left-0 right-0 mx-auto z-10 mb-4 ${
        rightPanel ? 'w-full max-w-xl' : 'w-xl max-w-xl'
      }`}
    >
      <input
        type="text"
        placeholder="Explain how you feel or current state of mind"
        className="w-full bg-transparent outline-none mb-3"
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        onKeyDown={handleKeyPress}
        disabled={loading}
      />
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <button
            className="p-2 rounded-full hover:bg-gray-700"
            onClick={onPlus}
            disabled={loading}
          >
            <span className="text-xl">+</span>
          </button>
          <button
            className="p-2 rounded-full hover:bg-gray-700"
            onClick={onGlobe}
            disabled={loading}
          >
            <Globe size={20} />
          </button>
        </div>
        <button
          className="p-2 rounded-full bg-gray-700 hover:bg-gray-600"
          onClick={onSend}
          disabled={loading}
        >
          {loading ? (
            <Loader2 size={20} className="animate-spin" />
          ) : (
            <ArrowUp size={20} />
          )}
        </button>
      </div>
    </div>
  );
};

export default ChatInput;
