'use client';
import React, { useState } from 'react';

const EMOJI_CATEGORIES = [
  { label: '😀', emojis: ['😀','😁','😂','🤣','😃','😄','😅','😆','😉','😊','😋','😎','😍','🥰','😘','😗','😙','😚','🙂','🤗','🤩','🤔','🤨','😐','😑','😶','🙄','😏','😣','😥','😮','🤐','😯','😪','😫','😴','😌','😛','😜','😝','🤤','😒','😓','😔','😕'] },
  { label: '❤️', emojis: ['❤️','🧡','💛','💚','💙','💜','🖤','🤍','🤎','💔','❣️','💕','💞','💓','💗','💖','💘','💝','💟','♥️','🫶','👍','👎','👊','✊','🤛','🤜','👏','🙌','👐','🤲','🤝','🙏'] },
  { label: '🎉', emojis: ['🎉','🎊','🎈','🎁','🎂','🍰','🥳','✨','🌟','⭐','💫','🔥','💥','🎯','🏆','🥇','🎮','🎲','🎵','🎶','🎤','🎸','🎺','🎷'] },
  { label: '🌿', emojis: ['🌸','🌺','🌻','🌹','🌷','🌼','💐','🌿','🍀','🍃','🌱','🌲','🌳','🌴','🌵','🍁','🍂','🍄','🐚','🌊','🌈','☀️','🌤️','⛅','🌥️','☁️','🌦️','🌧️','❄️','🌙','⭐'] },
];

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
  onClose: () => void;
}

export function EmojiPicker({ onSelect, onClose }: EmojiPickerProps) {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="absolute bottom-full right-0 mb-2 w-72 bg-[#0f0f17]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50">
      {/* Category tabs */}
      <div className="flex border-b border-white/5 px-2 pt-2">
        {EMOJI_CATEGORIES.map((cat, i) => (
          <button
            key={i}
            onClick={() => setActiveTab(i)}
            className={`flex-1 py-2 text-lg rounded-t-lg transition-colors ${
              i === activeTab ? 'bg-white/10' : 'hover:bg-white/5'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Emoji grid */}
      <div className="h-48 overflow-y-auto p-2">
        <div className="grid grid-cols-8 gap-0.5">
          {EMOJI_CATEGORIES[activeTab].emojis.map((emoji, i) => (
            <button
              key={i}
              onClick={() => {
                onSelect(emoji);
                onClose();
              }}
              className="w-8 h-8 flex items-center justify-center text-lg rounded-lg hover:bg-white/10 transition-colors"
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
