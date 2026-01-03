import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { GameState, CardEvent, BattleState } from '../types';

export interface LogEntry {
  message: string;
  type: 'info' | 'battle' | 'heal' | 'damage' | 'critical' | 'victory' | 'defeat' | 'error' | 'story';
  timestamp: number;
}

interface GameStore extends GameState {
  currentScenarioId: string | null;
  savePoint: string | null; // Last scenario ID before game over
  setCurrentScenarioId: (id: string | null) => void;
  setSavePoint: (id: string | null) => void;
  startNewGame: () => void;
  setMode: (mode: 'exploration' | 'battle' | 'menu' | 'gameover' | 'collection') => void;
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
  criticalFlash: boolean;
  triggerCriticalFlash: () => void;
  gameOverInfo: {
    cause: string;
    location: string;
    lastDamage: number;
  } | null;
  setGameOverInfo: (info: { cause: string; location: string; lastDamage: number }) => void;
  continueFromSavePoint: () => void;
  isTitleVisible: boolean;
  setIsTitleVisible: (visible: boolean) => void;
}

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      isTitleVisible: true,
      currentMode: 'exploration',
      currentCard: undefined,
      battleResult: undefined,
      battleState: undefined,
      currentScenarioId: null,
      savePoint: null,
      rollDiceRequest: false,
      diceRollResult: null,
      diceRollResult2: null,
      logs: [
        { message: '> G-OS v2.3.1 起動完了', type: 'info', timestamp: Date.now() },
        { message: '> グンマー県内の異常を検出...', type: 'info', timestamp: Date.now() },
        { message: '> 探索モード: 有効', type: 'info', timestamp: Date.now() },
      ],
      screenShake: false,
      criticalFlash: false,
      gameOverInfo: null,

      setIsTitleVisible: (visible) => set({ isTitleVisible: visible }),

      setCurrentScenarioId: (id) => set({ currentScenarioId: id, savePoint: id }),
      setSavePoint: (id) => set({ savePoint: id }),

      startNewGame: () => {
        set({
          isTitleVisible: false,
          currentScenarioId: 'c1_01_intro',
          savePoint: null,
          currentMode: 'exploration',
          currentCard: undefined,
          battleState: undefined,
          diceRollResult: null,
          diceRollResult2: null,
          logs: [],
        });
      },
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
      triggerCriticalFlash: () => {
        set({ criticalFlash: true });
        setTimeout(() => set({ criticalFlash: false }), 300);
      },
      setGameOverInfo: (info) => set({ gameOverInfo: info }),
      continueFromSavePoint: () => {
        const state = get();
        if (state.savePoint) {
          set({ currentScenarioId: state.savePoint, currentMode: 'exploration' });
          // ScenarioManager will load the scenario
        } else {
          // No save point, start from beginning
          set({ currentScenarioId: 'c1_01_intro', currentMode: 'exploration' });
        }
      },
    }),
    {
      name: 'gunma-game-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        currentScenarioId: state.currentScenarioId,
        savePoint: state.savePoint,
      }),
    }
  )
);

