import { useState, useRef, useEffect } from 'react';

import { useGameStore } from '../../stores/gameStore';
import { soundManager } from '../../systems/SoundManager';
import { hapticsManager } from '../../systems/HapticsManager';
import QuickInventory from './QuickInventory';

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

    const [diceValue, setDiceValue] = useState(1);
    const spinInterval = useRef<NodeJS.Timeout | null>(null);

    // Stop spinning on unmount
    useEffect(() => {
        return () => {
            if (spinInterval.current) clearInterval(spinInterval.current);
        };
    }, []);

    const handleSlotAction = () => {
        if (slotState === 'idle') {
            // Start Spinning
            setSlotState('spinning');
            soundManager.playSe('dice_hit'); // Start sound
            hapticsManager.lightImpact();

            // Cycle numbers 1-6
            spinInterval.current = setInterval(() => {
                setDiceValue(prev => (prev % 6) + 1);
                // Optional: play very short click sound on change?
            }, 50); // Fast cycle
        } else if (slotState === 'spinning') {
            // Stop Spinning
            if (spinInterval.current) {
                clearInterval(spinInterval.current);
                spinInterval.current = null;
            }
            setSlotState('stopped');


            // For "Stop the slot", let's trust the visual value or randomized?
            // User said "Stop the slot on a dice". Usually implies timing skill.
            // Let's use the current diceValue at the moment of stop for "skill", 
            // but 50ms is very fast. Maybe just random is safer for fairness, but user asked for "Stop".
            // Let's stick to the visual value (state) for now - but 50ms is hard. 
            // Actually, let's keep the `diceValue` as is from the interval to reward timing.

            // Since interval might be between ticks, let's just use current `diceValue` 
            // (which is whatever was last set).

            soundManager.playSe('button_click');
            hapticsManager.mediumImpact();

            addLog(`> ダイスロール: ${diceValue}が出た！`, 'battle');

            // Pass diceValue to triggerAttack
            triggerAttack(diceValue);
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

    if (currentMode !== 'battle') return null;

    const isPlayerTurn = battleState?.turn === 'player';
    const isSpinning = slotState === 'spinning';
    const isDisabled = !isPlayerTurn || slotState === 'stopped';

    return (
        <div className="w-full h-full glass crt-scanline p-4 flex flex-col items-center justify-center gap-4 pointer-events-none">
            <div className="text-center mb-2 pointer-events-auto">
                <div className="text-xs text-gunma-accent opacity-70 mb-1">
                    [BATTLE MODE: DICE SLOT]
                </div>
                <div className="text-xs text-gunma-text opacity-50 font-mono">
                    {isSpinning ? 'PRESS TO STOP!' : (isPlayerTurn ? 'ROLL THE DICE' : 'ENEMY TURN...')}
                </div>
            </div>

            <div className="w-full max-w-sm flex gap-3 h-24 pointer-events-auto">
                {/* Dice Slot Button */}
                <button
                    onClick={handleSlotAction}
                    disabled={isDisabled}
                    className={`flex-[3] h-20 text-4xl font-bold rounded-xl transition-all duration-75 shadow-lg relative overflow-hidden flex items-center justify-center border-2
            ${isSpinning
                            ? 'bg-red-900 border-red-500 text-red-100 animate-pulse'
                            : 'bg-black border-gunma-accent text-gunma-accent hover:bg-gunma-accent/10'
                        }
            ${isDisabled ? 'opacity-50 cursor-not-allowed grayscale' : ''}
          `}
                >
                    {/* Dice Value Display */}
                    <div className="flex flex-col items-center justify-center">
                        <span className={`font-mono ${isSpinning ? 'blur-[1px]' : ''}`}>
                            {/* Show Dice Icon or Number */}
                            {['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'][diceValue - 1]}
                        </span>
                        <span className="text-[10px] tracking-widest mt-1 opacity-70">
                            {isSpinning ? 'STOP' : 'ROLL'}
                        </span>
                    </div>

                    {/* Scanline overlay for button */}
                    <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 bg-[length:100%_2px,3px_100%] opacity-20" />
                </button>

                {/* Escape Button */}
                <button
                    onClick={handleEscape}
                    disabled={!isPlayerTurn || isSpinning}
                    className="flex-1 h-20 bg-black border border-gray-600 text-gray-400 rounded-xl flex flex-col items-center justify-center hover:bg-gray-800 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-md"
                >
                    <div className="text-2xl">🏃</div>
                    <div className="text-[10px] font-bold tracking-widest mt-1">ESCAPE</div>
                </button>
            </div>

            <div className="w-full mt-2 pointer-events-auto">
                <QuickInventory />
            </div>
        </div>
    );
}
