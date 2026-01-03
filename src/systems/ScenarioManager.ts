import { useGameStore } from '../stores/gameStore';
import { usePlayerStore } from '../stores/playerStore';
import { BattleSystem } from './BattleSystem';
import type { CardEvent } from '../types';

const ENEMY_DATA: Record<string, { hp: number; maxHp: number; attack: number; defense: number }> = {
  'event_001': { hp: 50, maxHp: 50, attack: 5, defense: 2 }, // こんにゃくモンスター
};

export class ScenarioManager {
  private battleSystem: BattleSystem;
  private gameStore = useGameStore;
  private playerStore = usePlayerStore;

  constructor() {
    this.battleSystem = new BattleSystem();
  }

  processCardAction(card: CardEvent, direction: 'left' | 'right'): void {
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
        this.moveToNextCard();
        break;
      case 'skip_hotspring':
        this.addLog('> 温泉をスキップしました', 'info');
        this.moveToNextCard();
        break;
      case 'talk_villager':
        this.addLog('> 村人との会話: 「この先は危険だ...」', 'story');
        this.moveToNextCard();
        break;
      case 'ignore_villager':
        this.addLog('> 村人を無視して先に進みました', 'info');
        this.moveToNextCard();
        break;
      default:
        this.addLog(`> アクション: ${effectId}`, 'info');
        this.moveToNextCard();
    }
  }

  private startBattle(card: CardEvent): void {
    const enemyData = ENEMY_DATA[card.id];
    if (!enemyData) {
      this.addLog('> エラー: 敵データが見つかりません', 'error');
      return;
    }

    const enemy = {
      id: card.id,
      name: card.title,
      hp: enemyData.hp,
      maxHp: enemyData.maxHp,
      attack: enemyData.attack,
      defense: enemyData.defense,
    };

    this.battleSystem.startBattle(enemy);
    this.addLog(`> ${enemy.name}との戦闘が開始されました！`, 'battle');
  }

  private healPlayer(amount: number): void {
    const playerState = this.playerStore.getState();
    const newHp = Math.min(playerState.maxHp, playerState.hp + amount);
    this.playerStore.setState({ hp: newHp });
  }

  private moveToNextCard(): void {
    // Get next card logic - load random card from scenarios
    import('../../assets/data/scenarios.json').then((data) => {
      const events = data.events as CardEvent[];
      if (events.length > 0) {
        const randomEvent = events[Math.floor(Math.random() * events.length)];
        this.gameStore.setState({ currentCard: randomEvent });
      }
    });
  }

  private addLog(message: string, type: 'info' | 'battle' | 'heal' | 'damage' | 'critical' | 'victory' | 'defeat' | 'error' | 'story' = 'info'): void {
    const gameState = this.gameStore.getState();
    const currentLogs = (gameState as any).logs || [];
    
    this.gameStore.setState({
      ...gameState,
      logs: [...currentLogs, { message, type, timestamp: Date.now() }],
    } as any);
  }

  getBattleSystem(): BattleSystem {
    return this.battleSystem;
  }
}

