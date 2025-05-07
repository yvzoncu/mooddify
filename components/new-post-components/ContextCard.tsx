'use client';

import { useEmotion } from '@/contexts/EmotionContext';

export default function ContextCard() {
  const { selectedContexts, toggleContext, selectedEmotion } = useEmotion();

  return (
    <div className="flex flex-col gap-4 mt-20">
      <div className="space-y-4 flex flex-col justify-center">
        <h2 className="text-xl font-bold text-gray-900">
          2- Whats Fueling This Mood? 🧩
        </h2>
      </div>

      {/* Selected Contexts Display - Similar to IntensityCard */}
      {selectedContexts.length > 0 ? (
        <div className="p-3 bg-indigo-50 rounded-lg">
          <div className="flex flex-wrap gap-2 ">
            {selectedContexts.map((c, i) => {
              return (
                <div
                  key={i}
                  onClick={() => toggleContext(c)}
                  className="cursor-pointer flex items-center gap-1 px-3 py-1 rounded-full bg-white shadow-sm border border-gray-200 hover:bg-gray-100"
                >
                  <span>{c.emoji}</span>
                  <span className="text-sm">{c.id}</span>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <p className="text-sm text-gray-500">
          Select 1-3 factors influencing your mood
        </p>
      )}

      <div className="grid grid-cols-3 gap-4">
        {selectedEmotion?.context.map((option) => (
          <button
            key={option.id}
            onClick={() => toggleContext(option)}
            className={`relative group flex flex-col items-center justify-center p-4 rounded-lg transition-all duration-300
           ${
             selectedContexts.includes(option)
               ? 'bg-white shadow-lg border-2 border-indigo-500 transform scale-110'
               : 'bg-gray-100 hover:bg-gray-200 border-2 border-transparent'
           }`}
            aria-label={option.label}
          >
            <span
              className={`text-3xl mb-2 transition-all duration-300 ${
                selectedContexts.includes(option) ? 'scale-110' : ''
              }`}
              style={{
                filter: selectedContexts.includes(option)
                  ? 'drop-shadow(0 0 4px rgba(0,0,0,0.2))'
                  : 'none',
              }}
            >
              {option.emoji}
            </span>
            <span className="text-sm font-medium text-gray-700">
              {option.label}
            </span>

            {/* Tooltip */}
            <div className="absolute z-10 bottom-full mb-2 px-2 py-1 text-xs text-white bg-black rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none w-[200px] break-words text-center">
              {option.info}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
