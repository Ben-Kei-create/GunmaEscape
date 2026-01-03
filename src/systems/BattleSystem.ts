import { useGameStore } from '../stores/gameStore';
import { usePlayerStore } from '../stores/playerStore';
import type { Enemy } from '../types';

export class BattleSystem {
  private gameStore = useGameStore;
  private playerStore = usePlayerStore;

  startBattle(enemy: Enemy) {
    const gameState = this.gameStore.getState();
    const playerState = this.playerStore.getState();

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

  processPlayerAttack(dice1: number, dice2: number): number {
    const gameState = this.gameStore.getState();
    const battleState = gameState.battleState;
    
    if (!battleState?.isActive || !battleState.enemy) {
      return 0;
    }

    const isCritical = dice1 === dice2;
    let baseDamage = dice1 + dice2;
    
    // Equipment bonus (placeholder)
    const equipmentBonus = 1.0;
    baseDamage = Math.floor(baseDamage * equipmentBonus);

    if (isCritical) {
      baseDamage *= 2;
    }

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
        playerDice1: dice1,
        playerDice2: dice2,
        lastPlayerDamage: finalDamage,
        turn: 'enemy',
      },
    });

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

    const newPlayerHp = Math.max(0, playerState.hp - baseDamage);
    
    this.playerStore.setState({ hp: newPlayerHp });

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

    if (result === 'victory') {
      // Victory rewards (placeholder)
      // Could add items, XP, etc.
      this.gameStore.getState().addLog('> 次のエリアへ進む...', 'info');
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

