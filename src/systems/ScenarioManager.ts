import { useGameStore } from '../stores/gameStore';
import { usePlayerStore } from '../stores/playerStore';
import { useCardStore } from '../stores/cardStore';
import { BattleSystem, setVictoryCallback } from './BattleSystem';
import { getEnemy } from '../config/enemies';
import { soundManager } from './SoundManager';
import type { CardEvent } from '../types';
import chapter1Data from '../assets/data/chapter1.json';

export class ScenarioManager {
  private battleSystem: BattleSystem;
  private gameStore = useGameStore;
  private playerStore = usePlayerStore;
  private cardStore = useCardStore;
  private chapter1Scenarios: CardEvent[] = [];

  constructor() {
    this.battleSystem = new BattleSystem();
    this.chapter1Scenarios = chapter1Data.chapter1 as CardEvent[];

    // Set victory callback for scenario progression
    setVictoryCallback((enemyId: string) => {
      this.onBattleVictory(enemyId);
    });

    // Load current scenario on init
    this.loadCurrentScenario();
  }

  loadCurrentScenario(): void {
    const state = this.gameStore.getState();
    const scenarioId = state.currentScenarioId;

    if (!scenarioId) {
      // Start new game
      this.startScenario('c1_01_intro');
      return;
    }

    const scenario = this.chapter1Scenarios.find(s => s.id === scenarioId);
    if (scenario) {
      this.gameStore.setState({ currentCard: scenario });
    }
  }

  startScenario(scenarioId: string): void {
    this.gameStore.getState().setCurrentScenarioId(scenarioId);
    const scenario = this.chapter1Scenarios.find(s => s.id === scenarioId);
    if (scenario) {
      this.gameStore.setState({ currentCard: scenario });

      // Log story text if available
      if (scenario.text) {
        this.addLog(scenario.text, 'story');
        // Play text advance sound
        soundManager.playSe('text_advance');
      }
    }
  }

  advanceToNext(nextId: string | null | undefined): void {
    console.log(`[ScenarioManager] Advancing to: ${nextId}`);

    if (!nextId) {
      // Chapter complete
      console.log('[ScenarioManager] Chapter Complete. Returning to title.');
      this.addLog('> 第1章「赤城の霧」完', 'victory');
      this.addLog('> Thank you for playing!', 'info');

      // Return to title after delay
      setTimeout(() => {
        this.gameStore.getState().setIsTitleVisible(true);
        // Reset game state for next play? Or just show title.
        // Maybe play a jingle?
        soundManager.playSe('win');
      }, 4000);
      return;
    }

    this.startScenario(nextId);
  }

  onBattleVictory(_enemyId: string): void {
    console.log(`[ScenarioManager] Battle Victory against ${_enemyId}`);
    const state = this.gameStore.getState();
    const currentCard = state.currentCard;

    if (currentCard?.next) {
      console.log(`[ScenarioManager] Advancing to next scenario from battle: ${currentCard.next}`);
      // Advance to next scenario after victory
      setTimeout(() => {
        this.advanceToNext(currentCard.next);
      }, 2000); // 2 seconds delay to see victory log
    } else {
      console.warn(`[ScenarioManager] No next scenario defined after battle victory for card ${currentCard?.id}`);
      // Fallback or end game
      if (currentCard?.id === 'c1_boss_battle') {
        this.advanceToNext(null); // End game
      }
    }
  }

  private discoverCard(cardId: string): void {
    const cardStoreState = this.cardStore.getState();
    if (!cardStoreState.hasCard(cardId)) {
      cardStoreState.addCard(cardId);
      import('../assets/data/legacyCards.json').then((data) => {
        const allCards = data.cards as any[];
        const card = allCards.find(c => c.id === cardId);
        if (card) {
          this.addLog(`> 【カード発見】${card.name}を図鑑に登録しました！`, 'story');
        }
      });
    }
  }

  processCardAction(card: CardEvent, direction: 'left' | 'right'): void {
    console.log(`[ScenarioManager] Processing card action: ${card.id}, type: ${card.type}, direction: ${direction}, next: ${card.next}`);

    // Play swipe sound
    soundManager.playSe('button_click');

    // 修正: ストーリータイプなら方向に関わらず次に進む
    if (card.type === 'story') {
      if (card.itemGet) {
        this.addLog(`> ${card.itemGet}を入手しました`, 'story');
      }

      if (card.next) {
        console.log(`[ScenarioManager] Advancing Story to: ${card.next}`);
        this.advanceToNext(card.next);
      } else {
        console.warn('[ScenarioManager] Story card has no next ID');
        // If it's the ending (next is intentionally null), advanceToNext(null) handles it?
        // Let's assume null is handled by advanceToNext(null) for chapter complete
        this.advanceToNext(card.next);
      }
      return;
    }

    // Enemy events: linear scenario battle trigger
    if (card.type === 'enemy' && card.triggerBattleId) {
      console.log(`[ScenarioManager] Enemy card swiped. Starting battle: ${card.triggerBattleId}`);
      this.startBattle(card);
      return;
    }

    // Legacy random system (fallback)
    const effectId = direction === 'right' ? card.onSwipeRight : card.onSwipeLeft;
    console.log(`[ScenarioManager] Legacy effect: ${effectId}`);

    if (!effectId && card.next) {
      // If no effect but next exists, just advance (fallback for mixed content)
      this.advanceToNext(card.next);
      return;
    }

    switch (effectId) {
      case 'battle_start':
        this.startBattle(card);
        break;
      case 'escape_success':
        this.addLog('> 無事に逃げ切れました', 'info');
        // If it's a legacy card, move to random next. If linear, use card.next
        if (card.next) {
          this.advanceToNext(card.next);
        } else {
          this.moveToNextCard();
        }
        break;
      case 'heal_full':
        this.healPlayer(20);
        this.addLog('> 草津温泉で体力が回復しました (+20 HP)', 'heal');
        if (Math.random() < 0.5) {
          this.discoverCard('card_005');
        }
        if (card.next) {
          this.advanceToNext(card.next);
        } else {
          this.moveToNextCard(); // Fallback for legacy
        }
        break;
      default:
        if (card.next) {
          this.advanceToNext(card.next);
        } else {
          console.warn(`[ScenarioManager] No next action defined for card ${card.id}`);
        }
    }
  }

  private startBattle(card: CardEvent): void {
    const enemyId = card.enemyId || card.triggerBattleId;

    if (!enemyId) {
      this.addLog('> エラー: 敵IDが指定されていません', 'error');
      return;
    }

    // getEnemy now always returns a valid enemy (with fallback)
    const enemy = getEnemy(enemyId);

    this.battleSystem.startBattle(enemy);
    this.addLog(`> ${enemy.name}との戦闘が開始されました！`, 'battle');

    // Log story text if available
    if (card.text) {
      this.addLog(card.text, 'story');
    }
  }

  private healPlayer(amount: number): void {
    const playerState = this.playerStore.getState();
    const newHp = Math.min(playerState.maxHp, playerState.hp + amount);
    this.playerStore.setState({ hp: newHp });
  }

  private moveToNextCard(): void {
    // Legacy random card system (kept for backward compatibility)
    import('../assets/data/scenarios.json').then((data) => {
      const events = data.events as CardEvent[];
      if (events.length > 0) {
        const randomEvent = events[Math.floor(Math.random() * events.length)];
        this.gameStore.setState({ currentCard: randomEvent });
      }
    });
  }

  continueFromSavePoint(): void {
    const state = this.gameStore.getState();
    const savePoint = state.savePoint;

    if (savePoint) {
      this.startScenario(savePoint);
      this.addLog('> セーブポイントから再開しました', 'info');
    } else {
      this.startScenario('c1_01_intro');
    }
  }

  private addLog(message: string, type: 'info' | 'battle' | 'heal' | 'damage' | 'critical' | 'victory' | 'defeat' | 'error' | 'story' = 'info'): void {
    this.gameStore.getState().addLog(message, type);
  }

  getBattleSystem(): BattleSystem {
    return this.battleSystem;
  }
}
export const scenarioManager = new ScenarioManager();
