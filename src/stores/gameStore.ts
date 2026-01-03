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
  setMode: (mode: 'exploration' | 'battle' | 'menu' | 'gameover' | 'collection' | 'victory') => void;
  setCurrentCard: (card: CardEvent | undefined) => void;
  setBattleResult: (result: { damage: number; diceRoll: number } | undefined) => void;
  setBattleState: (state: BattleState | undefined) => void;
  rollDiceRequest: boolean;
  triggerDiceRoll: () => void;
  clearDiceRollRequest: () => void;
  stopDiceRequest: boolean;
  triggerDiceStop: () => void;
  clearDiceStopRequest: () => void;
  diceRollResult: number | null;
  diceRollResult2: number | null;
  setDiceRollResult: (result: number) => void;
  setDiceRollResult2: (result: number) => void;
  // Slot Battle System
  playerDiceCount: number;
  upgradeDiceCount: () => void;
  diceResults: number[];
  setDiceResults: (results: number[]) => void;
  slotState: 'idle' | 'spinning' | 'stopped';
  setSlotState: (state: 'idle' | 'spinning' | 'stopped') => void;
  triggerAttack: () => void; // request stop
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
  isDefending: boolean;
  setDefending: (defending: boolean) => void;
  // Settings
  settings: {
    bgmVolume: number;
    seVolume: number;
    vibrationEnabled: boolean;
  };
  updateSettings: (settings: Partial<GameStore['settings']>) => void;
  // Save indicator
  isSaving: boolean;
  // Floating text
  floatingTexts: Array<{
    id: string;
    value: number;
    x: number;
    y: number;
    type: 'damage' | 'heal' | 'critical';
  }>;
  addFloatingText: (text: { value: number; x: number; y: number; type: 'damage' | 'heal' | 'critical' }) => void;
  removeFloatingText: (id: string) => void;
  // Tutorial
  hasSeenTutorial: boolean;
  setHasSeenTutorial: (seen: boolean) => void;
  // Collection/Discovery
  discoveredItems: string[];
  discoverItem: (itemId: string) => void;
  // Easter egg
  gunmaModeTaps: number;
  incrementGunmaModeTaps: () => void;
  resetGunmaModeTaps: () => void;
  collectionSource: 'title' | 'game' | null;
  openCollection: (source: 'title' | 'game') => void;
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
      stopDiceRequest: false,
      diceRollResult: null,
      diceRollResult2: null,
      playerDiceCount: 1,
      diceResults: [],
      slotState: 'idle',
      logs: [
        { message: '> G-OS v2.3.1 起動完了', type: 'info', timestamp: Date.now() },
        { message: '> グンマー県内の異常を検出...', type: 'info', timestamp: Date.now() },
        { message: '> 探索モード: 有効', type: 'info', timestamp: Date.now() },
      ],
      screenShake: false,
      criticalFlash: false,
      gameOverInfo: null,
      isDefending: false,
      settings: {
        bgmVolume: 50,
        seVolume: 70,
        vibrationEnabled: true,
      },
      isSaving: false,
      floatingTexts: [],
      hasSeenTutorial: false,
      discoveredItems: [],
      gunmaModeTaps: 0,

      collectionSource: null,
      openCollection: (source) => set({
        currentMode: 'collection',
        collectionSource: source,
        isTitleVisible: false
      }),

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
      // Legacy dice roll actions removed
      triggerDiceRoll: () => { },
      clearDiceRollRequest: () => { },
      triggerDiceStop: () => { },
      clearDiceStopRequest: () => { },
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
      // Slot Battle Actions
      upgradeDiceCount: () => set((state) => ({ playerDiceCount: Math.min(state.playerDiceCount + 1, 5) })),
      setDiceResults: (results) => set({ diceResults: results }),
      setSlotState: (state) => set({ slotState: state }),
      triggerAttack: () => set({ slotState: 'stopped' }), // Simplified trigger

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
      setDefending: (defending) => set({ isDefending: defending }),
      updateSettings: (newSettings) => set((state) => ({
        settings: { ...state.settings, ...newSettings }
      })),
      addFloatingText: (text) => set((state) => ({
        floatingTexts: [...state.floatingTexts, { ...text, id: Date.now().toString() + Math.random() }]
      })),
      removeFloatingText: (id) => set((state) => ({
        floatingTexts: state.floatingTexts.filter(t => t.id !== id)
      })),
      setHasSeenTutorial: (seen) => set({ hasSeenTutorial: seen }),
      discoverItem: (itemId) => set((state) => ({
        discoveredItems: state.discoveredItems.includes(itemId)
          ? state.discoveredItems
          : [...state.discoveredItems, itemId]
      })),
      incrementGunmaModeTaps: () => set((state) => ({ gunmaModeTaps: state.gunmaModeTaps + 1 })),
      resetGunmaModeTaps: () => set({ gunmaModeTaps: 0 }),
    }),
    {
      name: 'gunma-game-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        currentScenarioId: state.currentScenarioId,
        savePoint: state.savePoint,
        settings: state.settings,
        hasSeenTutorial: state.hasSeenTutorial,
        discoveredItems: state.discoveredItems,
        playerDiceCount: state.playerDiceCount,
      }),
      onRehydrateStorage: () => (state) => {
        // Show save indicator briefly on load
        if (state) {
          state.isSaving = true;
          setTimeout(() => {
            useGameStore.setState({ isSaving: false });
          }, 1000);
        }
      },
    }
  )
);

