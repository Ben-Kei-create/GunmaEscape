import { useGameStore } from '../../stores/gameStore';
import { usePlayerStore } from '../../stores/playerStore';
import { soundManager } from '../../systems/SoundManager';
import { hapticsManager } from '../../systems/HapticsManager';
import SwipeCard from './SwipeCard';

const ControlDeck = () => {
  const { currentMode, setMode, triggerDiceRoll, startNewGame } = useGameStore();

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

  if (currentMode === 'exploration') {
    return (
      <div className="w-full h-full glass crt-scanline">
        <SwipeCard />
      </div>
    );
  }

  if (currentMode === 'battle') {
    const { battleState, diceRollResult, diceRollResult2 } = useGameStore();
    const canRoll = battleState?.turn === 'player' && diceRollResult === null && diceRollResult2 === null;
    
    return (
      <div className="w-full h-full glass crt-scanline p-4 flex flex-col items-center justify-center gap-4">
        <div className="text-center mb-2">
          <div className="text-xs text-gunma-accent opacity-70 mb-1">
            [BATTLE MODE]
          </div>
          <div className="text-xs text-gunma-text opacity-50">
            {battleState?.turn === 'player' ? 'ダイスを振って攻撃' : '敵のターン...'}
          </div>
        </div>

        <button
          onClick={handleRollDice}
          disabled={!canRoll}
          className="w-full max-w-md px-8 py-6 bg-gunma-konnyaku border-2 border-gunma-accent rounded-lg 
                     text-gunma-accent font-mono text-xl font-bold
                     hover:bg-gunma-accent/20 hover:border-gunma-accent
                     active:scale-95 transition-all duration-150
                     shadow-lg shadow-gunma-accent/20
                     disabled:opacity-30 disabled:cursor-not-allowed"
        >
          [ ROLL DICE ]
        </button>
      </div>
    );
  }

  if (currentMode === 'gameover') {
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
            disabled={currentMode === 'exploration'}
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
            disabled={currentMode === 'battle'}
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
          onClick={() => {
            soundManager.playSe('button_click');
            hapticsManager.mediumImpact();
            startNewGame();
            usePlayerStore.setState({ hp: 100, maxHp: 100 });
            soundManager.playBgm('exploration');
          }}
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

