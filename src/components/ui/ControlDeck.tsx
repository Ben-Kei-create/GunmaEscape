// import { useState } from 'react';
import { useGameStore } from '../../stores/gameStore';
import { soundManager } from '../../systems/SoundManager';
import { hapticsManager } from '../../systems/HapticsManager';
import SwipeCard from './SwipeCard';

export default function ControlDeck() {
  // 1. Hook Declarations (ALWAYS at the top, UNCONDITIONAL)
  const {
    currentMode,
    slotState,
    setSlotState,
    triggerAttack,
    battleState
  } = useGameStore();

  // 2. Handler Functions
  const handleAttack = () => {
    if (slotState === 'idle') {
      setSlotState('spinning');
      soundManager.playSe('dice_hit'); // Using existing sound for now
      hapticsManager.lightImpact();
    } else if (slotState === 'spinning') {
      setSlotState('stopped');
      soundManager.playSe('button_click');
      hapticsManager.mediumImpact();
      // Trigger attack processing
      triggerAttack();
    }
  };

  // 3. Conditional Rendering (ONLY at the very end)

  // Exploration Mode: Show Swipe Interface
  if (currentMode === 'exploration') {
    return (
      <div className="w-full h-full glass crt-scanline relative">
        <SwipeCard />

        {/* Collection Button (Exploration) */}
        <button
          onClick={() => useGameStore.getState().openCollection('game')}
          className="absolute bottom-4 right-4 w-12 h-12 bg-black border-2 border-gunma-accent rounded-full
                     flex items-center justify-center text-2xl shadow-neon z-50
                     hover:scale-110 active:scale-95 transition-transform"
        >
          📖
        </button>
      </div>
    );
  }

  // Battle Mode: Show Slot Controls
  if (currentMode === 'battle') {
    const isPlayerTurn = battleState?.turn === 'player';

    return (
      <div className="w-full h-full glass crt-scanline p-4 flex flex-col items-center justify-center gap-4">
        <div className="text-center mb-2">
          <div className="text-xs text-gunma-accent opacity-70 mb-1">
            [BATTLE MODE: SLOT]
          </div>
          <div className="text-xs text-gunma-text opacity-50">
            {slotState === 'spinning' ? 'タイミング良く止めろ！' : (isPlayerTurn ? 'ボタンを押して攻撃！' : '敵のターン...')}
          </div>
        </div>

        <div className="w-full max-w-sm flex flex-col gap-3 items-center">
          {/* Main Slot Button */}
          <button
            onClick={handleAttack}
            disabled={!isPlayerTurn || slotState === 'stopped'} // Disable if not player turn or already stopped
            className={`w-full py-6 text-2xl font-black rounded-xl transition-all duration-150 shadow-lg relative overflow-hidden
              ${slotState === 'spinning'
                ? 'bg-red-600 border-4 border-red-500 text-white animate-pulse shadow-red-500/40 scale-105'
                : 'border-warning text-black hover:scale-[1.02] active:scale-95'
              }
              ${(!isPlayerTurn || slotState === 'stopped') ? 'opacity-50 cursor-not-allowed grayscale' : ''}
            `}
          >
            <span className="relative z-10 drop-shadow-md">
              {slotState === 'spinning' ? '🛑 STOP!' : '👊 たたかう'}
            </span>
          </button>
        </div>
      </div>
    );
  }

  // Game Over Mode or others: Hide controls or show minimal
  if (currentMode === 'gameover') {
    return null; // GameOverScreen handles its own UI usually, or we can restore the "Return to Title" button here if needed.
    // Assuming GameOverScreen overlay covers interactions.
  }

  return null;
}
