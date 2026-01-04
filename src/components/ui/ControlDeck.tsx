import { motion } from 'framer-motion';
import { useGameStore } from '../../stores/gameStore';
import { soundManager } from '../../systems/SoundManager';
import { hapticsManager } from '../../systems/HapticsManager';

/**
 * Apple-Style Battle Control Deck
 * Minimal, clean action buttons with premium feel
 */
export default function ControlDeck() {
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

  const handleAttack = () => {
    if (slotState === 'idle') {
      setSlotState('spinning');
      soundManager.playSe('dice_hit');
      hapticsManager.lightImpact();
    } else if (slotState === 'spinning') {
      setSlotState('stopped');
      soundManager.playSe('button_click');
      hapticsManager.mediumImpact();
      triggerAttack();
    }
  };

  const handleEscape = () => {
    soundManager.playSe('button_click');
    if (currentMode !== 'battle') return;
    if (slotState === 'spinning') return;

    const success = Math.random() > 0.4;
    if (success) {
      addLog('> 逃走に成功した！', 'info');
      setMode('exploration');
    } else {
      addLog('> 回り込まれてしまった！', 'damage');
      soundManager.playSe('damage');
      hapticsManager.heavyImpact();
      triggerScreenShake();
    }
  };

  if (currentMode === 'exploration') {
    return null;
  }

  if (currentMode === 'battle') {
    const isPlayerTurn = battleState?.turn === 'player';
    const isDisabled = !isPlayerTurn || slotState === 'stopped';
    const isSpinning = slotState === 'spinning';

    return (
      <div className="w-full h-full flex flex-col items-center justify-end gap-3 pb-2 px-4 pointer-events-none">
        {/* Status Text */}
        <motion.div
          className="text-center mb-1 pointer-events-auto"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div
            className="text-[10px] font-semibold tracking-widest uppercase mb-1"
            style={{ color: 'var(--color-accent-primary)' }}
          >
            BATTLE MODE
          </div>
          <div
            className="text-xs"
            style={{ color: 'var(--color-text-medium)' }}
          >
            {isSpinning ? 'タイミング良く止めろ！' : (isPlayerTurn ? 'ボタンを押して攻撃！' : '敵のターン...')}
          </div>
        </motion.div>

        {/* Action Buttons - 3 Button Layout */}
        <div className="w-full max-w-sm flex gap-2 pointer-events-auto">
          {/* 攻撃 (Attack) Button */}
          <motion.button
            onClick={handleAttack}
            disabled={isDisabled}
            className="flex-1 h-12 font-bold rounded-xl transition-colors relative overflow-hidden flex items-center justify-center"
            style={{
              background: isSpinning
                ? 'var(--color-accent-red)'
                : 'var(--color-accent-primary)',
              color: '#000000',
              opacity: isDisabled ? 0.4 : 1,
              cursor: isDisabled ? 'not-allowed' : 'pointer'
            }}
            whileTap={isDisabled ? {} : { scale: 0.95 }}
            animate={isSpinning ? {
              boxShadow: [
                '0 0 0 0 rgba(255, 69, 58, 0)',
                '0 0 0 6px rgba(255, 69, 58, 0.3)',
                '0 0 0 0 rgba(255, 69, 58, 0)'
              ]
            } : {}}
            transition={isSpinning ? { duration: 0.8, repeat: Infinity } : {}}
          >
            <span className="text-sm tracking-wide font-bold">
              {isSpinning ? 'STOP!' : '攻撃'}
            </span>
          </motion.button>

          {/* 防御 (Defend) Button */}
          <motion.button
            disabled={!isPlayerTurn || isSpinning}
            className="flex-1 h-12 rounded-xl flex items-center justify-center transition-colors"
            style={{
              background: 'var(--color-bg-elevated)',
              color: 'var(--color-text-high)',
              border: '1px solid rgba(48, 209, 88, 0.3)',
              opacity: (!isPlayerTurn || isSpinning) ? 0.4 : 1,
              cursor: (!isPlayerTurn || isSpinning) ? 'not-allowed' : 'pointer'
            }}
            whileTap={(!isPlayerTurn || isSpinning) ? {} : { scale: 0.95 }}
          >
            <span className="text-sm font-bold">防御</span>
          </motion.button>

          {/* アイテム (Item) Button */}
          <motion.button
            onClick={() => useGameStore.getState().setInventoryOpen(true)}
            disabled={!isPlayerTurn || isSpinning}
            className="flex-1 h-12 rounded-xl flex items-center justify-center transition-colors"
            style={{
              background: 'var(--color-bg-elevated)',
              color: 'var(--color-text-high)',
              border: '1px solid rgba(48, 209, 88, 0.3)',
              opacity: (!isPlayerTurn || isSpinning) ? 0.4 : 1,
              cursor: (!isPlayerTurn || isSpinning) ? 'not-allowed' : 'pointer'
            }}
            whileTap={(!isPlayerTurn || isSpinning) ? {} : { scale: 0.95 }}
          >
            <span className="text-sm font-bold">アイテム</span>
          </motion.button>
        </div>

        {/* Escape Button (Secondary) */}
        <motion.button
          onClick={handleEscape}
          disabled={!isPlayerTurn || isSpinning}
          className="w-full max-w-sm h-10 rounded-xl flex items-center justify-center transition-colors mt-1 pointer-events-auto"
          style={{
            background: 'rgba(28, 28, 30, 0.8)',
            color: 'var(--color-text-medium)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            opacity: (!isPlayerTurn || isSpinning) ? 0.4 : 1,
            cursor: (!isPlayerTurn || isSpinning) ? 'not-allowed' : 'pointer'
          }}
          whileTap={(!isPlayerTurn || isSpinning) ? {} : { scale: 0.97 }}
        >
          <span className="text-xs font-medium tracking-wide">🏃 逃げる</span>
        </motion.button>
      </div>
    );
  }

  if (currentMode === 'gameover') {
    return null;
  }

  return null;
}
