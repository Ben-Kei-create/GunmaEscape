import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../stores/gameStore';
import { soundManager } from '../../systems/SoundManager';
import { hapticsManager } from '../../systems/HapticsManager';

const RespectRoulette = () => {
    const { isRouletteActive, setRouletteActive, setRouletteResult } = useGameStore();
    const [currentNumber, setCurrentNumber] = useState(1);
    const [isStopping, setIsStopping] = useState(false);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (isRouletteActive) {
            setCurrentNumber(1);
            setIsStopping(false);

            // Start intense loop
            intervalRef.current = setInterval(() => {
                setCurrentNumber(prev => (prev % 6) + 1);
                // Play tick sound very fast? Maybe too annoying.
            }, 50); // 20fps

            return () => {
                if (intervalRef.current) clearInterval(intervalRef.current);
            };
        }
    }, [isRouletteActive]);

    const handleStop = () => {
        if (isStopping) return;
        setIsStopping(true);

        if (intervalRef.current) clearInterval(intervalRef.current);

        // Determine result (slight bias or pure timing? Let's stick to pure timing for now, logic handled by stop timing)


        // Determine effect based on number
        let result = currentNumber;

        // Feedback
        if (result === 6) {
            hapticsManager.heavyImpact();
            soundManager.playSe('win'); // Critical sound
        } else if (result === 1) {
            hapticsManager.notificationError();
            soundManager.playSe('cancel');
        } else {
            hapticsManager.lightImpact();
            soundManager.playSe('button_click');
        }

        // Delay slightly to show result then close
        setTimeout(() => {
            setRouletteResult(result);
            setRouletteActive(false);
        }, 800);
    };

    return (
        <AnimatePresence>
            {isRouletteActive && (
                <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm" onClick={handleStop}>

                    <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.5, opacity: 0 }}
                        className="relative"
                    >
                        {/* Roulette UI Image */}
                        <div
                            className="w-[300px] h-[75px] bg-contain bg-center bg-no-repeat relative flex items-center justify-center"
                            style={{ backgroundImage: 'url(/assets/ui/ui_dice_roulette.png)' }}
                        >
                            {/* Number Display */}
                            <div className={`text-4xl font-black font-mono relative z-10 
                    ${currentNumber === 6 ? 'text-green-400 drop-shadow-[0_0_10px_#00ff00]' :
                                    currentNumber === 1 ? 'text-gray-500' : 'text-blue-200'}`}
                            >
                                {isStopping ? currentNumber : [1, 2, 3, 4, 5, 6].map(n =>
                                    <span key={n} className={n === currentNumber ? 'inline' : 'hidden'}>{n}</span>
                                )}
                            </div>

                            {/* Scroller Blur Effect when spinning */}
                            {!isStopping && (
                                <div className="absolute inset-0 bg-gradient-to-tb from-black/20 via-transparent to-black/20 animate-pulse" />
                            )}
                        </div>

                        {/* Instruction */}
                        <div className="text-center mt-8 text-white font-bold animate-bounce tracking-widest text-shadow-neon">
                            TAP TO STOP!
                        </div>
                    </motion.div>

                    {/* Flash Effect on Critical */}
                    {isStopping && currentNumber === 6 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: [0, 1, 0] }}
                            transition={{ duration: 0.3 }}
                            className="absolute inset-0 bg-white mix-blend-overlay pointer-events-none"
                        />
                    )}

                </div>
            )}
        </AnimatePresence>
    );
};

export default RespectRoulette;
