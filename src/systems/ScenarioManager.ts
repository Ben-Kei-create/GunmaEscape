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
    if (!nextId) {
      // Chapter complete
      this.addLog('> 第1章が完了しました！', 'victory');
      return;
    }
    
    this.startScenario(nextId);
  }

  onBattleVictory(enemyId: string): void {
    const state = this.gameStore.getState();
    const currentCard = state.currentCard;
    
    if (currentCard?.next) {
      // Advance to next scenario after victory
      setTimeout(() => {
        this.advanceToNext(currentCard.next);
      }, 1000);
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
    // Play swipe sound
    soundManager.playSe('button_click');
    
    // Linear scenario: always advance to next on swipe
    if (card.type === 'enemy' && card.triggerBattleId) {
      this.startBattle(card);
    } else if (card.type === 'story') {
      // Story events: advance on swipe
      if (card.itemGet) {
        this.addLog(`> ${card.itemGet}を入手しました`, 'story');
      }
      
      // Advance to next scenario
      this.advanceToNext(card.next);
    } else {
      // Legacy random system (fallback)
      const effectId = direction === 'right' ? card.onSwipeRight : card.onSwipeLeft;
      
      switch (effectId) {
        case 'battle_start':
          this.startBattle(card);
          break;
        case 'escape_success':
          this.addLog('> 無事に逃げ切れました', 'info');
          this.moveToNextCard();
          break;
        case 'heal_full':
          this.healPlayer(20);
          this.addLog('> 草津温泉で体力が回復しました (+20 HP)', 'heal');
          if (Math.random() < 0.5) {
            this.discoverCard('card_005');
          }
          this.advanceToNext(card.next);
          break;
        default:
          this.advanceToNext(card.next);
      }
    }
  }

  private startBattle(card: CardEvent): void {
    const enemyId = card.enemyId || card.triggerBattleId;
    
    if (!enemyId) {
      this.addLog('> エラー: 敵IDが指定されていません', 'error');
      return;
    }

    const enemyData = getEnemy(enemyId);
    if (!enemyData) {
      this.addLog('> エラー: 敵データが見つかりません', 'error');
      return;
    }

    const enemy = {
      ...enemyData,
    };

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
    import('../../assets/data/scenarios.json').then((data) => {
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

