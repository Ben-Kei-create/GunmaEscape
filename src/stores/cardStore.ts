import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { LegacyCard } from '../types';

interface CardStore {
  collectedCards: string[]; // Array of card IDs
  addCard: (cardId: string) => void;
  hasCard: (cardId: string) => boolean;
  getAllCollectedCards: () => string[];
  resetCollection: () => void;
}

export const useCardStore = create<CardStore>()(
  persist(
    (set, get) => ({
      collectedCards: [],
      addCard: (cardId: string) => {
        const current = get().collectedCards;
        if (!current.includes(cardId)) {
          set({ collectedCards: [...current, cardId] });
        }
      },
      hasCard: (cardId: string) => {
        return get().collectedCards.includes(cardId);
      },
      getAllCollectedCards: () => {
        return get().collectedCards;
      },
      resetCollection: () => {
        set({ collectedCards: [] });
      },
    }),
    {
      name: 'gunma-card-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

