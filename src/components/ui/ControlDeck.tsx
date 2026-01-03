import { useGameStore } from '../../stores/gameStore';
import { usePlayerStore } from '../../stores/playerStore';
import { soundManager } from '../../systems/SoundManager';
import { hapticsManager } from '../../systems/HapticsManager';
import SwipeCard from './SwipeCard';

const ControlDeck = () => {
  // ============================================
  // 1. ALL HOOKS AT THE TOP (UNCONDITIONAL)
  // ============================================
  const {
    currentMode,
    setMode,
    triggerDiceRoll,
    startNewGame,
    battleState,
    diceRollResult,
    diceRollResult2,
    setDefending,
    addLog,
    setBattleState,
  } = useGameStore();

  // IMPORTANT: This hook must be called unconditionally at the top!
  const playerState = usePlayerStore();

  // ============================================
  // 2. COMPUTED VALUES (derived from hooks)
  // ============================================
  const isBattleMode = currentMode === 'battle';
  const isExplorationMode = currentMode === 'exploration';
  const isGameOverMode = currentMode === 'gameover';
  const canRoll = battleState?.turn === 'player' && diceRollResult === null && diceRollResult2 === null;
  const hasPotion = playerState.inventory.includes('potion');

  // ============================================
  // 3. EVENT HANDLERS
  // ============================================
  const handleBattleMode = () => {
    soundManager.playSe('button_click');
    hapticsManager.lightImpact();
    setMode('battle');
  };

  const handleExplorationMode = () => {
    soundManager.playSe('button_click');
    hapticsManager.lightImpact();
    setMode('exploration');
    soundManager.playBgm('exploration');
  };

  const handleRollDice = () => {
    soundManager.playSe('button_click');
    hapticsManager.mediumImpact();
    triggerDiceRoll();
  };

  const handleOpenCollection = () => {
    soundManager.playSe('button_click');
    hapticsManager.lightImpact();
    setMode('collection');
  };

  const handleNewGame = () => {
    soundManager.playSe('button_click');
    hapticsManager.mediumImpact();
    startNewGame();
    usePlayerStore.setState({ hp: 100, maxHp: 100 });
    soundManager.playBgm('exploration');
  };

  const handleDefend = () => {
    soundManager.playSe('button_click');
    hapticsManager.lightImpact();

    // Set defending state and switch to enemy turn
    setDefending(true);
    addLog('> 防御態勢を取った!', 'battle');

    // Update battle state to enemy turn
    if (battleState) {
      setBattleState({
        ...battleState,
        turn: 'enemy',
      });
    }
  };

  const handleItem = () => {
    soundManager.playSe('button_click');
    hapticsManager.lightImpact();

    // Check if player has a potion
    if (hasPotion) {
      // Use potion
      const healAmount = 30;
      const newHp = Math.min(playerState.maxHp, playerState.hp + healAmount);
      usePlayerStore.setState({ hp: newHp });
      playerState.removeItem('potion');
      addLog(`> ポーションを使用! HPが${healAmount}回復した`, 'heal');

      // Update battle state to enemy turn
      if (battleState) {
        setBattleState({
          ...battleState,
          turn: 'enemy',
        });
      }
    }
  };

  // ============================================
  // 4. CONDITIONAL RENDERING (AFTER ALL HOOKS)
  // ============================================

  // Exploration Mode
  if (isExplorationMode) {
    return (
      <div className="w-full h-full glass crt-scanline">
        <SwipeCard />
      </div>
    );
  }

  // Battle Mode
  if (isBattleMode) {
    return (
      <div className="w-full h-full glass crt-scanline p-4 flex flex-col items-center justify-center gap-4">
        <div className="text-center mb-2">
          <div className="text-xs text-gunma-accent opacity-70 mb-1">
            [BATTLE MODE]
          </div>
          <div className="text-xs text-gunma-text opacity-50">
            {battleState?.turn === 'player' ? 'コマンドを選択' : '敵のターン...'}
          </div>
        </div>

        <div className="w-full max-w-md flex flex-col gap-3">
          {/* Attack Button */}
          <button
            onClick={handleRollDice}
            disabled={!canRoll}
            className="w-full px-8 py-6 bg-gunma-konnyaku border-2 border-gunma-accent rounded-lg 
                       text-gunma-accent font-mono text-xl font-bold
                       hover:bg-gunma-accent/20 hover:border-gunma-accent
                       active:scale-95 transition-all duration-150
                       shadow-lg shadow-gunma-accent/20
                       disabled:opacity-30 disabled:cursor-not-allowed"
          >
            ⚔️ たたかう
          </button>

          {/* Defend Button */}
          <button
            onClick={handleDefend}
            disabled={!canRoll}
            className="w-full px-6 py-4 bg-gunma-konnyaku border border-blue-400/50 rounded-lg 
                       text-blue-400 font-mono text-lg font-bold
                       hover:bg-blue-400/10 hover:border-blue-400
                       active:scale-95 transition-all duration-150
                       disabled:opacity-30 disabled:cursor-not-allowed"
          >
            🛡️ ぼうぎょ
          </button>

          {/* Item Button */}
          <button
            onClick={handleItem}
            disabled={!canRoll || !hasPotion}
            className="w-full px-6 py-4 bg-gunma-konnyaku border border-green-400/50 rounded-lg 
                       text-green-400 font-mono text-lg font-bold
                       hover:bg-green-400/10 hover:border-green-400
                       active:scale-95 transition-all duration-150
                       disabled:opacity-30 disabled:cursor-not-allowed"
          >
            💊 どうぐ {!hasPotion && '(なし)'}
          </button>
        </div>
      </div>
    );
  }

  // Game Over Mode
  if (isGameOverMode) {
    return (
      <div className="w-full h-full glass crt-scanline p-4 flex flex-col items-center justify-center gap-4">
        <div className="text-center mb-4">
          <div className="text-2xl text-red-500 font-bold mb-2 glitch-text">
            GAME OVER
          </div>
          <div className="text-sm text-gunma-text opacity-70">
            グンマーから逃げられなかった...
          </div>
        </div>
        <button
          onClick={handleExplorationMode}
          className="px-6 py-3 bg-gunma-konnyaku border border-gunma-accent/30 rounded-lg 
                     text-gunma-accent font-mono text-sm
                     hover:bg-gunma-accent/10 hover:border-gunma-accent/50
                     active:scale-95 transition-all duration-150"
        >
          タイトルに戻る
        </button>
      </div>
    );
  }

  // Default/Menu Mode
  return (
    <div className="w-full h-full glass crt-scanline p-4 flex flex-col items-center justify-center gap-4">
      <div className="text-center mb-2">
        <div className="text-xs text-gunma-accent opacity-70 mb-1">
          [CONTROL DECK]
        </div>
        <div className="text-xs text-gunma-text opacity-50">
          Mode: {currentMode.toUpperCase()}
        </div>
      </div>

      <div className="flex flex-col gap-3 w-full max-w-md">
        <div className="flex gap-4">
          <button
            onClick={handleExplorationMode}
            className="flex-1 px-6 py-4 bg-gunma-konnyaku border border-gunma-accent/30 rounded-lg 
                       text-gunma-accent font-mono text-sm font-bold
                       hover:bg-gunma-accent/10 hover:border-gunma-accent/50
                       active:scale-95 transition-all duration-150
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            探索
          </button>

          <button
            onClick={handleBattleMode}
            className="flex-1 px-6 py-4 bg-gunma-konnyaku border border-gunma-accent/30 rounded-lg 
                       text-gunma-accent font-mono text-sm font-bold
                       hover:bg-gunma-accent/10 hover:border-gunma-accent/50
                       active:scale-95 transition-all duration-150
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            バトル
          </button>
        </div>

        <button
          onClick={handleOpenCollection}
          className="w-full px-6 py-3 bg-gunma-konnyaku border border-gunma-accent/30 rounded-lg 
                     text-gunma-accent font-mono text-sm font-bold
                     hover:bg-gunma-accent/10 hover:border-gunma-accent/50
                     active:scale-95 transition-all duration-150"
        >
          📖 図鑑を見る
        </button>

        <button
          onClick={handleNewGame}
          className="w-full px-6 py-3 bg-red-500/20 border border-red-500/50 rounded-lg 
                     text-red-400 font-mono text-sm font-bold
                     hover:bg-red-500/30 hover:border-red-500
                     active:scale-95 transition-all duration-150"
        >
          🎮 New Game
        </button>
      </div>
    </div>
  );
};

export default ControlDeck;

