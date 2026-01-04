import { create } from 'zustand';
import type { PlayerState } from '../types';

interface PlayerStore extends PlayerState {
  setHp: (hp: number) => void;
  setSanity: (sanity: number) => void;
  addItem: (item: string) => void;
  removeItem: (item: string) => void;
  setLocation: (location: string) => void;
  heal: (amount: number) => void;
}

export const usePlayerStore = create<PlayerStore>((set) => ({
  hp: 100,
  maxHp: 100,
  sanity: 50,
  inventory: [],
  equippedDice: [],
  location: 'Myogi_Mt_Layer1',
  setHp: (hp) => set({ hp }),
  setSanity: (sanity) => set({ sanity }),
  heal: (amount) => set((state) => ({
    hp: Math.min(state.maxHp, state.hp + amount)
  })),
  addItem: (item) => set((state) => ({
    inventory: [...state.inventory, item]
  })),
  removeItem: (item) => set((state) => ({
    inventory: state.inventory.filter(i => i !== item)
  })),
  setLocation: (location) => set({ location }),
}));



