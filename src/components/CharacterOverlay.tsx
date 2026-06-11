"use client";

import React from 'react';
import { useCharacterStore } from '../store/useCharacterStore';

export const CharacterOverlay: React.FC = () => {
  const { isVisible, emotion, message, dismissCharacter } = useCharacterStore();

  // Provide different mascot appearances based on emotion
  const getMascotDetails = () => {
    switch (emotion) {
      case 'thinking':
        return { emoji: '🤔', bgColor: 'bg-indigo-500' };
      case 'celebrating':
        return { emoji: '🎉', bgColor: 'bg-green-500' };
      case 'helper':
        return { emoji: '💡', bgColor: 'bg-amber-500' };
      case 'idle':
      default:
        return { emoji: '🤖', bgColor: 'bg-blue-500' };
    }
  };

  const mascot = getMascotDetails();

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex items-end gap-3 transition-all duration-300 transform ${
        isVisible
          ? 'translate-y-0 opacity-100 pointer-events-auto'
          : 'translate-y-8 opacity-0 pointer-events-none'
      }`}
    >
      {/* Glassmorphic Speech Bubble */}
      <div
        className="relative max-w-sm p-4 rounded-2xl rounded-br-sm shadow-xl backdrop-blur-md"
        style={{
          backgroundColor: 'var(--glass-bg)',
          borderColor: 'var(--glass-border)',
          borderWidth: '1px',
          color: 'var(--color-text-primary)'
        }}
      >
        <button
          onClick={dismissCharacter}
          className="absolute top-2 right-2 p-1 opacity-60 hover:opacity-100 transition-opacity"
          aria-label="Dismiss message"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <p className="pr-6 text-sm font-medium leading-relaxed">
          {message}
        </p>
      </div>

      {/* Mascot Avatar Container */}
      <div
        className={`relative flex items-center justify-center w-14 h-14 rounded-full shadow-lg border-2 ${mascot.bgColor} text-2xl select-none`}
        style={{ borderColor: 'var(--glass-border)' }}
      >
        {/* Subtle animation for specific active states */}
        {(emotion === 'helper' || emotion === 'celebrating' || emotion === 'thinking') && (
          <div className="absolute inset-0 rounded-full animate-ping opacity-25 bg-current"></div>
        )}
        <span>{mascot.emoji}</span>
      </div>
    </div>
  );
};
