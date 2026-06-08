import { create } from 'zustand';

// Supported emotional states for the guide mascot
export type CharacterEmotion = 'idle' | 'thinking' | 'celebrating' | 'helper';

// State definition for the guide character mascot
interface CharacterState {
  isVisible: boolean;
  emotion: CharacterEmotion;
  speechText: string;
  
  // Actions to mutate mascot state
  show: () => void;
  hide: () => void;
  setEmotion: (emotion: CharacterEmotion) => void;
  speak: (text: string, durationMs?: number) => void;
  reset: () => void;
}

let speechTimeout: ReturnType<typeof setTimeout> | null = null;

/**
 * Mascot Guide Global Zustand Store
 * Manages floating guide character's visibility, speech bubbles, and emotional states
 */
export const useCharacterStore = create<CharacterState>((set) => ({
  isVisible: true,
  emotion: 'idle',
  speechText: 'Welcome back, Admin! Ready to manage some learning modules today?',

  // Display the floating mascot
  show: () => set({ isVisible: true }),

  // Dismiss the floating mascot
  hide: () => set({ isVisible: false }),

  // Set the current emotional stance of the mascot
  setEmotion: (emotion: CharacterEmotion) => set({ emotion }),

  // Command the mascot to speak a contextual tip, with an optional auto-expire duration
  speak: (text: string, durationMs?: number) => {
    // Clear any active timers for speech reset
    if (speechTimeout) {
      clearTimeout(speechTimeout);
      speechTimeout = null;
    }

    set({ 
      speechText: text, 
      isVisible: true 
    });

    // If duration is specified, return to idle state after time expires
    if (durationMs) {
      speechTimeout = setTimeout(() => {
        set({ 
          speechText: '', 
          emotion: 'idle' 
        });
      }, durationMs);
    }
  },

  // Reset the character to its standard welcoming state
  reset: () => {
    if (speechTimeout) {
      clearTimeout(speechTimeout);
      speechTimeout = null;
    }
    set({
      isVisible: true,
      emotion: 'idle',
      speechText: 'Welcome back, Admin! Ready to manage some learning modules today?',
    });
  },
}));
