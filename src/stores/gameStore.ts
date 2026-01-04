import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { GameState, CardEvent, BattleState, Item } from '../types';
import { ITEM_CATALOG, INITIAL_INVENTORY_IDS } from '../data/items';

export interface LogEntry {
  message: string;
  type: 'info' | 'battle' | 'heal' | 'damage' | 'critical' | 'victory' | 'defeat' | 'error' | 'story';
  timestamp: number;
}

// Phase 38: Reel Customization
export interface ReelConfig {
  id: string;
  type: 'attack' | 'defense' | 'tech';
  name: string;
  icon: string;
  color: string;
}

interface GameStore extends GameState {
  currentScenarioId: string | null;
  savePoint: string | null; // Last scenario ID before game over
  inventory: string[];
  addItem: (itemId: string) => void;
  removeItem: (itemId: string) => void;
  equippedItems: {
    weapon: Item | null;
    armor: Item | null;
    accessory: Item | null;
  };
  isInventoryOpen: boolean;
  setInventoryOpen: (isOpen: boolean) => void;
  selectedItemForModal: Item | null;
  setCurrentScenarioId: (id: string | null) => void;
  setSavePoint: (id: string | null) => void;
  equipItem: (item: Item) => void;
  unequipItem: (slot: 'weapon' | 'armor' | 'accessory') => void;
  setSelectedItemForModal: (item: Item | null) => void;
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
  // Phase 41: Level System
  playerLevel: number;
  playerExp: number;
  expToNextLevel: number;
  addExp: (amount: number) => void;
  diceResults: number[];
  setDiceResults: (results: number[]) => void;
  slotState: 'idle' | 'spinning' | 'stopped';
  setSlotState: (state: 'idle' | 'spinning' | 'stopped') => void;
  // Phase 42: Respect Roulette
  isRouletteActive: boolean;
  setRouletteActive: (active: boolean) => void;
  rouletteResult: number | null;
  setRouletteResult: (result: number) => void;
  // Phase 35: Battle Interference
  reelStatuses: ('normal' | 'slippery' | 'locked')[];
  setReelStatus: (index: number, status: 'normal' | 'slippery' | 'locked') => void;
  resetReelStatuses: () => void;
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
  // Phase 35: Progressive UI
  hasSeenTutorial: boolean;
  setHasSeenTutorial: (seen: boolean) => void;
  // Phase 36: Achievement System
  titles: string[];
  currentTitle: string | null;
  stats: {
    totalDeaths: number;
    totalSteps: number;
    konnyakuEaten: number;
    enemiesDefeated: number;
  };
  addTitle: (titleId: string) => void;
  setCurrentTitle: (titleId: string | null) => void;
  incrementStat: (stat: 'totalDeaths' | 'totalSteps' | 'konnyakuEaten' | 'enemiesDefeated', amount?: number) => void;
  // Phase 36: Daily Login
  lastLoginDate: string | null;
  setLastLoginDate: (date: string) => void;
  // Phase 42: Infinite Item Cooldowns
  itemCooldowns: Record<string, number>;
  setItemCooldown: (itemId: string, turns: number) => void;
  decrementItemCooldowns: () => void;
  // Phase 37: Swipe Tutorial
  hasSeenSwipeTutorial: boolean;
  setHasSeenSwipeTutorial: (seen: boolean) => void;
  // Phase 38: Reel Customization
  reelDeck: (ReelConfig | null)[];
  availableReels: ReelConfig[];
  setReelDeck: (deck: (ReelConfig | null)[]) => void;
  addAvailableReel: (reel: ReelConfig) => void;
  // Phase 40: Sniper Slot
  targetSymbol: number | null;
  setTargetSymbol: (symbol: number | null) => void;
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
    value: number | string;
    x: number;
    y: number;
    type: 'damage' | 'heal' | 'critical' | 'gold_critical'; // Added gold_critical for Yaku
  }>;
  addFloatingText: (text: { value: number | string; x: number; y: number; type: 'damage' | 'heal' | 'critical' | 'gold_critical' }) => void;
  removeFloatingText: (id: string) => void;
  // Tutorial
  // Collection/Discovery
  discoveredItems: string[];
  discoverItem: (itemId: string) => void;
  // Easter egg
  gunmaModeTaps: number;
  incrementGunmaModeTaps: () => void;
  resetGunmaModeTaps: () => void;
  collectionSource: 'title' | 'game' | null;
  openCollection: (source: 'title' | 'game') => void;
  // Phase 33: Narrative System
  playerName: string;
  setPlayerName: (name: string) => void;
  visitedNodes: string[];
  addVisitedNode: (nodeId: string) => void;
  isScenarioMapOpen: boolean;
  setScenarioMapOpen: (isOpen: boolean) => void;
  isNameEntryOpen: boolean;
  setNameEntryOpen: (isOpen: boolean) => void;
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
      // Phase 41: Level System
      playerLevel: 1,
      playerExp: 0,
      expToNextLevel: 100,
      itemCooldowns: {},
      addExp: (amount) => set((state) => {
        let newExp = state.playerExp + amount;
        let newLevel = state.playerLevel;
        let newExpToNext = state.expToNextLevel;

        // Level up logic
        while (newExp >= newExpToNext) {
          newExp -= newExpToNext;
          newLevel++;
          newExpToNext = Math.floor(100 * Math.pow(1.2, newLevel - 1)); // Each level requires 20% more exp
          state.addLog(`> LEVEL UP! Lv.${newLevel}`, 'victory');
        }

        return {
          playerExp: newExp,
          playerLevel: newLevel,
          expToNextLevel: newExpToNext
        };
      }),
      diceResults: [],
      slotState: 'idle',
      isRouletteActive: false,
      setRouletteActive: (active) => set({ isRouletteActive: active }),
      rouletteResult: null,
      setRouletteResult: (result) => set({ rouletteResult: result }),
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
      // Phase 36: Achievements & Daily Login
      titles: [],
      currentTitle: null,
      stats: {
        totalDeaths: 0,
        totalSteps: 0,
        konnyakuEaten: 0,
        enemiesDefeated: 0,
      },
      lastLoginDate: null,
      // Phase 37: Swipe Tutorial
      hasSeenSwipeTutorial: false,
      // Phase 38: Reel Customization
      reelDeck: [null, null, null, null, null],
      availableReels: [
        { id: 'reel_attack_1', type: 'attack', name: 'アタックリール', icon: '⚔️', color: '#ff4444' },
        { id: 'reel_defense_1', type: 'defense', name: 'ディフェンスリール', icon: '🛡️', color: '#4444ff' },
        { id: 'reel_tech_1', type: 'tech', name: 'テクノリール', icon: '⚡', color: '#ffff44' },
      ],
      // Phase 40: Sniper Slot
      targetSymbol: null,
      setTargetSymbol: (symbol) => set({ targetSymbol: symbol }),

      collectionSource: null,
      openCollection: (source) => set({
        currentMode: 'collection',
        collectionSource: source,
        isTitleVisible: false
      }),

      // Phase 33: Narrative System
      playerName: '旅人',
      setPlayerName: (name) => set({ playerName: name }),
      visitedNodes: [],
      addVisitedNode: (nodeId) => set((state) => ({
        visitedNodes: state.visitedNodes.includes(nodeId)
          ? state.visitedNodes
          : [...state.visitedNodes, nodeId]
      })),
      isScenarioMapOpen: false,
      setScenarioMapOpen: (isOpen) => set({ isScenarioMapOpen: isOpen }),
      setItemCooldown: (itemId, turns) => set((state) => ({
        itemCooldowns: { ...state.itemCooldowns, [itemId]: turns }
      })),
      decrementItemCooldowns: () => set((state) => {
        const newCooldowns = { ...state.itemCooldowns };
        Object.keys(newCooldowns).forEach(id => {
          if (newCooldowns[id] > 0) newCooldowns[id]--;
        });
        return { itemCooldowns: newCooldowns };
      }),
      isNameEntryOpen: false,
      setNameEntryOpen: (isOpen) => set({ isNameEntryOpen: isOpen }),

      setIsTitleVisible: (visible) => set({ isTitleVisible: visible }),

      setCurrentScenarioId: (id) => set({ currentScenarioId: id, savePoint: id }),
      setSavePoint: (id) => set({ savePoint: id }),


      // ...
      inventory: INITIAL_INVENTORY_IDS,
      addItem: (itemId) => set((state) => ({ inventory: [...state.inventory, itemId] })),
      removeItem: (itemId) => set((state) => {
        const idx = state.inventory.indexOf(itemId);
        if (idx === -1) return {};
        const newInv = [...state.inventory];
        newInv.splice(idx, 1);
        return { inventory: newInv };
      }),
      equippedItems: {
        weapon: ITEM_CATALOG['gunma_branch'],
        armor: null,
        accessory: null
      },
      isInventoryOpen: false,
      setInventoryOpen: (isOpen) => set({ isInventoryOpen: isOpen }),
      equipItem: (item) => {
        const { equippedItems, addItem, removeItem } = get();
        const slot = item.slot || 'accessory';
        const oldItem = equippedItems[slot];

        if (oldItem) {
          addItem(oldItem.id);
        }
        removeItem(item.id);
        set({
          equippedItems: {
            ...equippedItems,
            [slot]: item
          }
        });
        get().addLog(`> ${item.name}を装備しました`, 'info');
      },
      unequipItem: (slot) => {
        const { equippedItems, addItem } = get();
        const item = equippedItems[slot];
        if (item) {
          addItem(item.id);
          set({
            equippedItems: {
              ...equippedItems,
              [slot]: null
            }
          });
          get().addLog(`> 装備を外しました`, 'info');
        }
      },
      selectedItemForModal: null,
      setSelectedItemForModal: (item) => set({ selectedItemForModal: item }),

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
          equippedItems: { weapon: ITEM_CATALOG['gunma_branch'], armor: null, accessory: null },
          selectedItemForModal: null,
          visitedNodes: ['c1_01_intro'],
          inventory: INITIAL_INVENTORY_IDS,
          reelStatuses: [],
          hasSeenTutorial: false,
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

      // Phase 35: Battle Interference
      reelStatuses: [],
      setReelStatus: (index, status) => set((state) => {
        const newStatuses = [...state.reelStatuses];
        // Ensure array is long enough
        while (newStatuses.length <= index) newStatuses.push('normal');
        newStatuses[index] = status;
        return { reelStatuses: newStatuses };
      }),
      resetReelStatuses: () => set({ reelStatuses: [] }),
      setHasSeenTutorial: (seen) => set({ hasSeenTutorial: seen }),

      // Phase 37: Swipe Tutorial
      setHasSeenSwipeTutorial: (seen) => set({ hasSeenSwipeTutorial: seen }),

      // Phase 38: Reel Customization Actions
      setReelDeck: (deck) => set({ reelDeck: deck }),
      addAvailableReel: (reel) => set((state) => ({
        availableReels: [...state.availableReels, reel]
      })),

      // Phase 36: Achievement Actions
      addTitle: (titleId) => set((state) => ({
        titles: state.titles.includes(titleId) ? state.titles : [...state.titles, titleId]
      })),
      setCurrentTitle: (titleId) => set({ currentTitle: titleId }),
      incrementStat: (stat, amount = 1) => set((state) => ({
        stats: { ...state.stats, [stat]: state.stats[stat] + amount }
      })),
      setLastLoginDate: (date) => set({ lastLoginDate: date }),

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
        titles: state.titles,
        currentTitle: state.currentTitle,
        stats: state.stats,
        lastLoginDate: state.lastLoginDate,
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

