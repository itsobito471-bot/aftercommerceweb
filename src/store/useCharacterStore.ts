import { create } from 'zustand';

export type CharacterEmotion = 'idle' | 'thinking' | 'celebrating' | 'helper';

interface CharacterState {
  isVisible: boolean;
  emotion: CharacterEmotion;
  message: string;
  timeoutId: ReturnType<typeof setTimeout> | null;
  triggerCharacter: (emotion: CharacterEmotion, message: string) => void;
  dismissCharacter: () => void;
}

export const useCharacterStore = create<CharacterState>((set, get) => ({
  isVisible: false,
  emotion: 'idle',
  message: '',
  timeoutId: null,

  triggerCharacter: (emotion: CharacterEmotion, message: string) => {
    const currentTimeout = get().timeoutId;
    if (currentTimeout) {
      clearTimeout(currentTimeout);
    }

    // Auto-hide after 5 seconds
    const newTimeout = setTimeout(() => {
      set({ isVisible: false, message: '', emotion: 'idle', timeoutId: null });
    }, 5000); 

    set({
      isVisible: true,
      emotion,
      message,
      timeoutId: newTimeout,
    });
  },

  dismissCharacter: () => {
    const currentTimeout = get().timeoutId;
    if (currentTimeout) {
      clearTimeout(currentTimeout);
    }
    
    set({ isVisible: false, message: '', emotion: 'idle', timeoutId: null });
  },
}));
