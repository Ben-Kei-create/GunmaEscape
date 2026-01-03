import { useGameStore } from '../stores/gameStore';
import { usePlayerStore } from '../stores/playerStore';
import { useCardStore } from '../stores/cardStore';
import type { Enemy } from '../types';
import legacyCardsData from '../assets/data/legacyCards.json';
import type { LegacyCard } from '../types';

// Victory callback to advance scenario
let victoryCallback: ((enemyId: string) => void) | null = null;

export const setVictoryCallback = (callback: (enemyId: string) => void) => {
  victoryCallback = callback;
};

// Card discovery on victory
export const discoverCardOnVictory = (enemyId: string) => {
  const cardStore = useCardStore.getState();

  // Map enemy IDs to potential card discoveries
  const cardRewards: Record<string, string[]> = {
    'event_001': ['card_004'], // Konnyaku monster -> Konnyaku card
  };

  const possibleCards = cardRewards[enemyId] || [];
  if (possibleCards.length > 0) {
    const cardId = possibleCards[Math.floor(Math.random() * possibleCards.length)];
    if (!cardStore.hasCard(cardId)) {
      cardStore.addCard(cardId);
      import('../assets/data/legacyCards.json').then((data) => {
        const allCards = data.cards as LegacyCard[];
        const card = allCards.find(c => c.id === cardId);
        if (card) {
          useGameStore.getState().addLog(`> 【カード発見】${card.name}を図鑑に登録しました！`, 'story');
        }
      });
    }
  }
};

export class BattleSystem {
  private gameStore = useGameStore;
  private playerStore = usePlayerStore;
  private cardStore = useCardStore;

  private getActiveCards(): LegacyCard[] {
    const collectedCards = this.cardStore.getState().getAllCollectedCards();
    const allCards = legacyCardsData.cards as LegacyCard[];
    return allCards.filter(card => collectedCards.includes(card.id));
  }

  private applyCardEffects() {
    const activeCards = this.getActiveCards();
    const playerState = this.playerStore.getState();
    let healed = false;
    let healAmount = 0;

    activeCards.forEach(card => {
      if (card.effect.type === 'heal') {
        // Heal per turn effect
        if (playerState.hp < playerState.maxHp) {
          const heal = card.effect.value || 0;
          healAmount += heal;
          healed = true;
        }
      }
    });

    if (healed && healAmount > 0) {
      const newHp = Math.min(playerState.maxHp, playerState.hp + healAmount);
      this.playerStore.setState({ hp: newHp });
      if (healAmount > 0) {
        this.gameStore.getState().addLog(`> カード効果によりHPが${healAmount}回復した`, 'heal');
      }
    }
  }

  startBattle(enemy: Enemy) {
    // const gameState = this.gameStore.getState();
    const playerState = this.playerStore.getState();

    // Apply battle start card effects (like Kusatsu Onsen)
    const activeCards = this.getActiveCards();
    activeCards.forEach(card => {
      if (card.effect.type === 'heal' && card.id === 'card_005') {
        // Kusatsu Onsen: heal on battle start
        const heal = card.effect.value || 0;
        const newHp = Math.min(playerState.maxHp, playerState.hp + heal);
        this.playerStore.setState({ hp: newHp });
        this.gameStore.getState().addLog(`> ${card.name}の効果: HPが${heal}回復した`, 'heal');
      }
    });

    this.gameStore.setState({
      battleState: {
        isActive: true,
        turn: 'player',
        enemy: { ...enemy },
        playerDice1: null,
        playerDice2: null,
        lastPlayerDamage: 0,
        lastEnemyDamage: 0,
      },
      currentMode: 'battle',
    });
  }

  processPlayerAttack(results: number[]): number {
    const gameState = this.gameStore.getState();
    const battleState = gameState.battleState;

    if (!battleState?.isActive || !battleState.enemy) {
      return 0;
    }

    // Apply card effects that modify dice minimum value
    const activeCards = this.getActiveCards();
    let minDiceValue = 1;

    activeCards.forEach(card => {
      if (card.effect.type === 'dice_min' && card.effect.value) {
        minDiceValue = Math.max(minDiceValue, card.effect.value);
      }
    });

    // Apply minimum dice value
    const adjustedResults = results.map(r => Math.max(r, minDiceValue));

    if (results.some(r => r < minDiceValue)) {
      const card = activeCards.find(c => c.effect.type === 'dice_min');
      if (card) {
        this.gameStore.getState().addLog(`> ${card.name}の効果: ダイスの最小値が${minDiceValue}になった`, 'battle');
      }
    }

    // Calculate sum of dice
    const diceSum = adjustedResults.reduce((sum, r) => sum + r, 0);
    let baseDamage = diceSum;

    // Check for criticals (matches or 6s)
    const isAllSame = adjustedResults.length > 1 && adjustedResults.every(r => r === adjustedResults[0]);
    const hasSixMatch = adjustedResults.length > 1 && adjustedResults.filter(r => r === 6).length >= 2;
    const isAllSix = adjustedResults.every(r => r === 6);

    let multiplier = 1.0;
    let criticalType: 'none' | 'match' | 'six' | 'god' = 'none';

    if (isAllSix) {
      multiplier = 5.0;
      criticalType = 'god';
    } else if (hasSixMatch) {
      multiplier = 3.0;
      criticalType = 'six';
    } else if (isAllSame) {
      multiplier = 2.0;
      criticalType = 'match';
    }

    // Equipment bonus (placeholder)
    const equipmentBonus = 1.0;
    baseDamage = Math.floor(baseDamage * multiplier * equipmentBonus);

    const finalDamage = Math.max(1, baseDamage);
    const newEnemyHp = Math.max(0, battleState.enemy.hp - finalDamage);

    // Update battle state
    this.gameStore.setState({
      battleState: {
        ...battleState,
        enemy: {
          ...battleState.enemy!,
          hp: newEnemyHp,
        },
        lastPlayerDamage: finalDamage,
        turn: 'enemy',
      },
    });

    if (criticalType !== 'none') {
      const logs: Record<string, string> = {
        'match': `> ZOROME! ${adjustedResults.join('-')} ダメージ2倍!`,
        'six': `> GUNMA 666! ダメージ3倍!`,
        'god': `> GOD GUNMA! ダメージ5倍!`,
      };
      this.gameStore.getState().addLog(logs[criticalType], 'critical');
    }

    return finalDamage;
  }

  processEnemyAttack(): number {
    const gameState = this.gameStore.getState();
    const battleState = gameState.battleState;
    const playerState = this.playerStore.getState();

    if (!battleState?.isActive || !battleState.enemy) {
      return 0;
    }

    // Enemy dice roll (1-6)
    const enemyDice = Math.floor(Math.random() * 6) + 1;
    let baseDamage = enemyDice + battleState.enemy.attack;

    // Player defense (placeholder)
    const playerDefense = 0;
    baseDamage = Math.max(1, baseDamage - playerDefense);

    // Apply defense if player is defending
    if (gameState.isDefending) {
      baseDamage = Math.floor(baseDamage / 2);
      this.gameStore.getState().addLog('> 防御態勢! ダメージを半減した', 'battle');
      // Reset defending state after use
      this.gameStore.getState().setDefending(false);
    }

    const newPlayerHp = Math.max(0, playerState.hp - baseDamage);

    this.playerStore.setState({ hp: newPlayerHp });

    // Apply per-turn card effects (heal effects)
    this.applyCardEffects();

    // Update battle state
    this.gameStore.setState({
      battleState: {
        ...battleState,
        lastEnemyDamage: baseDamage,
        turn: 'player',
      },
    });

    return baseDamage;
  }

  checkBattleEnd(): 'victory' | 'defeat' | null {
    const gameState = this.gameStore.getState();
    const battleState = gameState.battleState;
    const playerState = this.playerStore.getState();

    if (!battleState?.isActive) {
      return null;
    }

    if (battleState.enemy && battleState.enemy.hp <= 0) {
      return 'victory';
    }

    if (playerState.hp <= 0) {
      return 'defeat';
    }

    return null;
  }

  endBattle(result: 'victory' | 'defeat') {
    const gameState = this.gameStore.getState();
    const battleState = gameState.battleState;
    const playerState = this.playerStore.getState();

    if (result === 'victory') {
      // Apply card effects that increase victory rewards
      const activeCards = this.getActiveCards();
      let rewardMultiplier = 1.0;

      activeCards.forEach(card => {
        if (card.effect.type === 'reward' && card.effect.value) {
          rewardMultiplier = Math.max(rewardMultiplier, card.effect.value);
          this.gameStore.getState().addLog(`> ${card.name}の効果: 報酬が${rewardMultiplier}倍になった!`, 'victory');
        }
      });

      this.gameStore.getState().addLog('> 次のエリアへ進む...', 'info');

      // Discover card on victory
      if (battleState?.enemy?.id) {
        discoverCardOnVictory(battleState.enemy.id);
      }

      // Call victory callback to advance scenario
      if (victoryCallback && battleState?.enemy?.id) {
        victoryCallback(battleState.enemy.id);
      }
    } else if (result === 'defeat') {
      // Set game over info
      const cause = battleState?.enemy?.name || '不明な敵';
      const lastDamage = battleState?.lastEnemyDamage || 0;
      this.gameStore.getState().setGameOverInfo({
        cause,
        location: playerState.location,
        lastDamage,
      });
    }

    this.gameStore.setState({
      battleState: {
        ...battleState!,
        isActive: false,
      },
      currentMode: result === 'victory' ? 'exploration' : 'gameover',
      diceRollResult: null,
      diceRollResult2: null,
    });
  }

  getCurrentBattleState() {
    return this.gameStore.getState().battleState;
  }
}

