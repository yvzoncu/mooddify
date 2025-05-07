'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Loader2, Send } from 'lucide-react';
import EmotionHeaderCard from '@/components/Np-2-Components/IntroPicture';
import EmotionWheelCard from '@/components/new-post-components/EmotionWheelCard';
import { EmotionProvider } from '@/contexts/EmotionContext';
import { useEmotion } from '@/contexts/EmotionContext';
import ContextCard from '@/components/new-post-components/ContextCard';

interface MessageItem {
  id: string;
  content?: string;
  child?: React.ReactNode; // Change to React.ReactNode for better type safety
}

interface StreamingTextProps {
  text: string;
  speed: number;
  onComplete: () => void;
}

export default function Np3() {
  return (
    <EmotionProvider>
      <ChatComponent />
    </EmotionProvider>
  );
}

const StreamingText: React.FC<StreamingTextProps> = ({
  text,
  speed,
  onComplete,
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const index = useRef(0);

  useEffect(() => {
    const interval = setInterval(() => {
      if (index.current < text.length) {
        setDisplayedText((prev) => prev + text.charAt(index.current));
        index.current += 1;
      } else {
        clearInterval(interval);
        onComplete();
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed, onComplete]);

  return <div>{displayedText}</div>;
};

const ChatComponent: React.FC = () => {
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [loading] = useState(false);
  const { selectedEmotion, selectedContexts, selectedTags, selectedSongs } =
    useEmotion();

  useEffect(() => {
    setMessages([
      {
        id: '1',
        child: <EmotionHeaderCard />,
      },
      {
        id: '2',
        child: (
          <StreamingText
            text="Hii! Let’s find your perfect soundtrack based on your mood! Lets start with selecting the mood :)"
            speed={50}
            onComplete={handleStreamingComplete}
          />
        ),
      },
    ]);
  }, []);

  // Watch for changes in selectedEmotion
  useEffect(() => {
    if (selectedEmotion) {
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          id: Date.now().toString(),
          child: (
            <StreamingText
              text={`You selected ${selectedEmotion.label}. Let's select factors influencing your mood!`}
              speed={50}
              onComplete={handleEmotionComplete} // You can add another callback here if needed
            />
          ),
        },
      ]);
    }
  }, [selectedEmotion]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleStreamingComplete = () => {
    setMessages((prevMessages) => [
      ...prevMessages,

      {
        id: '3',
        child: <EmotionWheelCard />,
      },
    ]);
  };

  const handleEmotionComplete = () => {
    setMessages((prevMessages) => [
      ...prevMessages,

      {
        id: '5',
        child: <ContextCard />,
      },
    ]);
  };

  const handleSend = () => {
    if (inputValue.trim()) {
      const newMessage: MessageItem = {
        id: Date.now().toString(),
        content: inputValue,
      };
      setMessages([...messages, newMessage]);
      setInputValue('');
    }
  };

  return (
    <div className="flex flex-col w-full max-w-2xl h-screen mx-auto bg-gray-50">
      {/* Scrollable messages area */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Scrollable messages container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div key={message.id} className="p-3 bg-white rounded-lg shadow-sm">
              {message.content}
              {message.child}
            </div>
          ))}
          <div ref={messagesEndRef} /> {/* Auto-scroll anchor */}
        </div>
      </div>

      {/* Input area at the bottom */}
      <div className="border-t border-gray-200 bg-white mb-4">
        <div className="flex items-center gap-2 mt-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Tell more about your mood..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && inputValue.trim() !== '') {
                handleSend();
              }
            }}
          />
          <button
            onClick={handleSend}
            disabled={!inputValue.trim() || loading}
            className="p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:bg-gray-400"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
