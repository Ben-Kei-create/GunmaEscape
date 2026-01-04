import { useGameStore } from '../stores/gameStore';
import { usePlayerStore } from '../stores/playerStore';
import { useCardStore } from '../stores/cardStore';
import type { Enemy } from '../types';
import legacyCardsData from '../assets/data/legacyCards.json';
import type { LegacyCard } from '../types';
import { achievementManager } from './AchievementManager';

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

    // Check for criticals (Yaku)
    const isAllSame = adjustedResults.length > 1 && adjustedResults.every(r => r === adjustedResults[0]);
    const isAllSix = adjustedResults.every(r => r === 6);

    // Check Straight
    let isStraight = adjustedResults.length > 1;
    if (isStraight) {
      const sorted = [...adjustedResults].sort((a, b) => a - b);
      for (let i = 1; i < sorted.length; i++) {
        if (sorted[i] !== sorted[i - 1] + 1) {
          isStraight = false;
          break;
        }
      }
    }

    let multiplier = 1.0;

    // Visual Yaku Name
    let yakuName: string | null = null;

    if (isAllSix) {
      multiplier = 5.0;
      yakuName = 'GOD GUNMA!';
    } else if (isAllSame) {
      multiplier = 2.0;
      yakuName = 'FEVER!!';
    } else if (isStraight) {
      multiplier = 1.5;
      yakuName = 'STRAIGHT!';
    }

    // Equipment bonus
    const { equippedItems } = this.gameStore.getState();
    let equipmentMultiplier = 1.0;

    Object.values(equippedItems).forEach(item => {
      if (item?.effectType === 'attack_boost') {
        // value 10 -> +10% damage
        equipmentMultiplier += (item.value / 100);
      }
    });

    baseDamage = Math.floor(baseDamage * multiplier * equipmentMultiplier);

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

    if (yakuName) {
      // Use window center for floating text since we don't have enemy sprite reference
      this.gameStore.getState().addFloatingText({
        value: yakuName,
        x: window.innerWidth / 2,
        y: window.innerHeight * 0.4,
        type: 'gold_critical'
      });

      this.gameStore.getState().addLog(`> ${yakuName} ダメージ${multiplier}倍!`, 'critical');
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

    // Player defense (Equipment)
    let playerDefense = 0;
    Object.values(gameState.equippedItems).forEach(item => {
      if (item?.effectType === 'defense_boost') {
        playerDefense += item.value;
      }
    });

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

    // Phase 35: Enemy Interference
    this.processEnemySkills();

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

  private processEnemySkills() {
    const gameState = this.gameStore.getState();
    const enemy = gameState.battleState?.enemy;
    const playerDiceCount = gameState.playerDiceCount;

    if (!enemy) return;

    // Reset previous statuses
    // gameState.resetReelStatuses(); // Only reset if we want fresh status each turn. Let's keep it persistent for one turn.
    // Actually, we should probably clear it at start of player turn? 
    // Let's assume it clears on attack execution or turn start. 
    // For now, let's just apply new ones.

    // 30% chance to trigger interference
    if (Math.random() > 0.3) {
      const targetIndex = Math.floor(Math.random() * playerDiceCount);

      // Determine skill based on enemy type
      if (enemy.id.includes('konnyaku')) {
        // Konnyaku Gel: Slippery
        gameState.setReelStatus(targetIndex, 'slippery');
        gameState.addLog(`> ${enemy.name}はこんにゃくゲルを吐き出した！リールが滑りやすくなった！`, 'battle');
        // Visual effect trigger handled in BattleScene via store listener
      } else if (enemy.id.includes('daruma') || enemy.id.includes('haniwa')) {
        // Daruma Stare / Haniwa Curse: Locked
        gameState.setReelStatus(targetIndex, 'locked');
        gameState.addLog(`> ${enemy.name}の呪い！リールが封印された！`, 'battle');
        gameState.triggerCriticalFlash(); // Re-use flash for curse effect
      } else if (enemy.id.includes('boss') || enemy.id.includes('overlord')) {
        // Boss can use both
        const type = Math.random() > 0.5 ? 'slippery' : 'locked';
        gameState.setReelStatus(targetIndex, type);
        const skillName = type === 'slippery' ? '汚染されたゲル' : '王の威圧';
        gameState.addLog(`> ${enemy.name}の${skillName}！リールが妨害された！`, 'battle');
      }
    }
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

      // Tutorial Complete Logic
      if (!this.gameStore.getState().hasSeenTutorial) {
        this.gameStore.getState().setHasSeenTutorial(true);
        this.gameStore.getState().addLog('> システムが完全同期しました。全機能が解放されます。', 'story');
      }

      this.gameStore.getState().addLog('> 次のエリアへ進む...', 'info');

      // Discover card on victory
      if (battleState?.enemy?.id) {
        discoverCardOnVictory(battleState.enemy.id);
      }

      // Call victory callback to advance scenario
      if (victoryCallback && battleState?.enemy?.id) {
        victoryCallback(battleState.enemy.id);
      }

      // Phase 36: Track enemy defeats
      this.gameStore.getState().incrementStat('enemiesDefeated');
      achievementManager.onStatChange();
    } else if (result === 'defeat') {
      // Set game over info
      const cause = battleState?.enemy?.name || '不明な敵';
      const lastDamage = battleState?.lastEnemyDamage || 0;
      this.gameStore.getState().setGameOverInfo({
        cause,
        location: playerState.location,
        lastDamage,
      });

      // Phase 36: Track deaths
      this.gameStore.getState().incrementStat('totalDeaths');
      achievementManager.onStatChange();
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

