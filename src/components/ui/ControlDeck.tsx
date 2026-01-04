// import { useState } from 'react';
import { useGameStore } from '../../stores/gameStore';
import { soundManager } from '../../systems/SoundManager';
import { hapticsManager } from '../../systems/HapticsManager';

import QuickInventory from './QuickInventory';

export default function ControlDeck() {
  // 1. Hook Declarations (ALWAYS at the top, UNCONDITIONAL)
  const {
    currentMode,
    slotState,
    setSlotState,
    triggerAttack,
    battleState,
    addLog,
    setMode,
    triggerScreenShake
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

  const handleEscape = () => {
    soundManager.playSe('button_click');
    if (currentMode !== 'battle') return;
    if (slotState === 'spinning') return;

    const success = Math.random() > 0.4; // 60% chance
    if (success) {
      addLog('> 逃走に成功した！', 'info');
      // soundManager.playSe('run'); 
      setMode('exploration');
    } else {
      addLog('> 回り込まれてしまった！', 'damage');
      soundManager.playSe('damage');
      hapticsManager.heavyImpact();
      triggerScreenShake();
    }
  };

  // 3. Conditional Rendering (ONLY at the very end)

  // Exploration Mode: Handled by App.tsx and ExplorationDeck
  if (currentMode === 'exploration') {
    return null;
  }

  // Battle Mode: Show Slot Controls
  if (currentMode === 'battle') {
    const isPlayerTurn = battleState?.turn === 'player';

    return (
      <div className="w-full h-full glass crt-scanline p-4 flex flex-col items-center justify-center gap-4 pointer-events-none">
        <div className="text-center mb-2 pointer-events-auto">
          <div className="text-xs text-gunma-accent opacity-70 mb-1">
            [BATTLE MODE: SLOT]
          </div>
          <div className="text-xs text-gunma-text opacity-50">
            {slotState === 'spinning' ? 'タイミング良く止めろ！' : (isPlayerTurn ? 'ボタンを押して攻撃！' : '敵のターン...')}
          </div>
        </div>

        <div className="w-full max-w-sm flex gap-3 h-24 pointer-events-auto">
          {/* Main Slot Button (Flex 3) */}
          <button
            onClick={handleAttack}
            disabled={!isPlayerTurn || slotState === 'stopped'}
            className={`flex-[3] h-16 text-lg font-bold rounded-xl transition-all duration-150 shadow-md relative overflow-hidden flex items-center justify-center
              ${slotState === 'spinning'
                ? 'bg-red-600 text-white animate-pulse'
                : 'bg-[var(--color-accent-primary)] text-black hover:brightness-90 active:scale-95'
              }
              ${(!isPlayerTurn || slotState === 'stopped') ? 'opacity-50 cursor-not-allowed grayscale' : ''}
            `}
          >
            {/* Simple Text Label without TextShadow */}
            <span className="tracking-widest">
              {slotState === 'spinning' ? 'STOP' : 'TATAKAU'}
            </span>
          </button>

          {/* Escape Button (Flex 1) */}
          <button
            onClick={handleEscape}
            disabled={!isPlayerTurn || slotState === 'spinning'}
            className="flex-1 h-16 bg-[var(--color-bg-surface)] text-[var(--color-text-medium)] rounded-xl flex flex-col items-center justify-center hover:bg-white/10 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-md"
          >
            <div className="text-xl">🏃</div>
            <div className="text-[10px] font-bold tracking-widest mt-1">ESCAPE</div>
          </button>
        </div>

        {/* Phase 42: Quick Inventory (Shortcuts) */}
        <div className="w-full mt-2 pointer-events-auto">
          <QuickInventory />
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
