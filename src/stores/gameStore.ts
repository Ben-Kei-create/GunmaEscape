import { create } from 'zustand';
import type { GameState, CardEvent, BattleState } from '../types';

export interface LogEntry {
  message: string;
  type: 'info' | 'battle' | 'heal' | 'damage' | 'critical' | 'victory' | 'defeat' | 'error' | 'story';
  timestamp: number;
}

interface GameStore extends GameState {
  setMode: (mode: 'exploration' | 'battle' | 'menu' | 'gameover') => void;
  setCurrentCard: (card: CardEvent | undefined) => void;
  setBattleResult: (result: { damage: number; diceRoll: number } | undefined) => void;
  setBattleState: (state: BattleState | undefined) => void;
  rollDiceRequest: boolean;
  triggerDiceRoll: () => void;
  clearDiceRollRequest: () => void;
  diceRollResult: number | null;
  diceRollResult2: number | null;
  setDiceRollResult: (result: number) => void;
  setDiceRollResult2: (result: number) => void;
  logs: LogEntry[];
  addLog: (message: string, type?: LogEntry['type']) => void;
  clearLogs: () => void;
  screenShake: boolean;
  triggerScreenShake: () => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  currentMode: 'exploration',
  currentCard: undefined,
  battleResult: undefined,
  battleState: undefined,
  rollDiceRequest: false,
  diceRollResult: null,
  diceRollResult2: null,
  logs: [
    { message: '> G-OS v2.3.1 起動完了', type: 'info', timestamp: Date.now() },
    { message: '> グンマー県内の異常を検出...', type: 'info', timestamp: Date.now() },
    { message: '> 探索モード: 有効', type: 'info', timestamp: Date.now() },
  ],
  screenShake: false,
  setMode: (mode) => set({ currentMode: mode }),
  setCurrentCard: (card) => set({ currentCard: card }),
  setBattleResult: (result) => set({ battleResult: result }),
  setBattleState: (state) => set({ battleState: state }),
  triggerDiceRoll: () => {
    set({ rollDiceRequest: true, diceRollResult: null, diceRollResult2: null });
  },
  clearDiceRollRequest: () => set({ rollDiceRequest: false }),
  setDiceRollResult: (result: number) => {
    const current = get();
    if (current.diceRollResult === null) {
      set({ diceRollResult: result });
    } else {
      // Second dice roll
      set({ diceRollResult2: result, rollDiceRequest: false });
    }
  },
  setDiceRollResult2: (result: number) => {
    set({ diceRollResult2: result });
  },
  addLog: (message, type = 'info') => {
    set((state) => ({
      logs: [...state.logs, { message, type, timestamp: Date.now() }],
    }));
  },
  clearLogs: () => set({ logs: [] }),
  triggerScreenShake: () => {
    set({ screenShake: true });
    setTimeout(() => set({ screenShake: false }), 500);
  },
}));

