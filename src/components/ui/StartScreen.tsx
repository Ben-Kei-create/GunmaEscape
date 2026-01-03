import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../../stores/gameStore';
import { soundManager } from '../../systems/SoundManager';
import { hapticsManager } from '../../systems/HapticsManager';

const StartScreen: React.FC = () => {
    const { startNewGame, continueFromSavePoint, savePoint, gunmaModeTaps, incrementGunmaModeTaps, resetGunmaModeTaps, addLog } = useGameStore();
    const [easterEggActive, setEasterEggActive] = useState(false);
    const [screenShake, setScreenShake] = useState(false);
    const tapTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const handleTitleTap = () => {
        incrementGunmaModeTaps();
        hapticsManager.lightImpact();

        // Reset counter if no tap for 2 seconds
        if (tapTimeoutRef.current) {
            clearTimeout(tapTimeoutRef.current);
        }
        tapTimeoutRef.current = setTimeout(() => {
            resetGunmaModeTaps();
        }, 2000);
    };

    useEffect(() => {
        if (gunmaModeTaps >= 10 && !easterEggActive) {
            // Trigger easter egg!
            setEasterEggActive(true);
            setScreenShake(true);
            soundManager.playSe('win');
            hapticsManager.heavyImpact();

            // Add mysterious log
            addLog('> 群馬県民モード解放...', 'critical');
            addLog('> ダルマ弁当の加護を得た', 'heal');
            addLog('> ???「おっきりこみ」を覚えた', 'story');

            setTimeout(() => {
                setScreenShake(false);
            }, 1000);
        }
    }, [gunmaModeTaps, easterEggActive, addLog]);

    useEffect(() => {
        return () => {
            if (tapTimeoutRef.current) {
                clearTimeout(tapTimeoutRef.current);
            }
        };
    }, []);

    return (
        <motion.div
            className="w-full h-full flex flex-col items-center justify-center bg-black text-gunma-lime relative overflow-hidden font-dotgothic"
            animate={screenShake ? {
                x: [0, -20, 20, -20, 20, -10, 10, 0],
                y: [0, -10, 10, -10, 10, -5, 5, 0],
            } : {}}
            transition={{ duration: 0.5 }}
        >
            {/* Background Effect */}
            <div className="absolute inset-0 bg-[url('/assets/noise.png')] opacity-10 pointer-events-none"></div>

            {/* Easter Egg Flash */}
            {easterEggActive && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 0.5, 0] }}
                    transition={{ duration: 0.5 }}
                    className="absolute inset-0 bg-gunma-accent pointer-events-none z-20"
                />
            )}

            {/* Title - Tappable for Easter Egg */}
            <motion.div
                className="z-10 text-center mb-12 cursor-pointer select-none"
                onClick={handleTitleTap}
                animate={easterEggActive ? { scale: [1, 1.1, 1] } : { opacity: [0.8, 1, 0.8] }}
                transition={{ duration: easterEggActive ? 0.5 : 2, repeat: easterEggActive ? 0 : Infinity }}
            >
                <h1 className="text-4xl md:text-6xl font-bold tracking-widest leading-tight text-shadow-neon">
                    おまえは<br />
                    <span className={easterEggActive ? 'text-yellow-400' : ''}>グンマー</span>
                    から<br />にげられない
                </h1>
                <p className="mt-4 text-sm md:text-base text-gray-400">THE GUNMA ESCAPE</p>

                {/* Easter Egg Counter (hidden but functional) */}
                {gunmaModeTaps > 0 && gunmaModeTaps < 10 && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-2 text-xs text-gray-600"
                    >
                        {gunmaModeTaps}/10
                    </motion.div>
                )}

                {/* Easter Egg Activated Message */}
                {easterEggActive && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mt-4 text-yellow-400 font-bold text-lg"
                    >
                        🐸 群馬県民モード解放 🐸
                    </motion.div>
                )}
            </motion.div>

            {/* Buttons */}
            <div className="z-10 flex flex-col gap-6 w-64">
                <button
                    onClick={startNewGame}
                    className="w-full py-4 border-2 border-gunma-accent text-gunma-accent hover:bg-gunma-accent hover:text-black transition-all duration-300 font-bold text-xl tracking-widest shadow-neon"
                >
                    GAME START
                </button>

                <button
                    onClick={() => useGameStore.getState().openCollection('title')}
                    className="w-full py-3 border border-gunma-magenta text-gunma-magenta hover:bg-gunma-magenta hover:text-black transition-all duration-300 font-bold tracking-widest"
                >
                    ZUKAN
                </button>

                {savePoint && (
                    <button
                        onClick={continueFromSavePoint}
                        className="w-full py-3 border border-gray-500 text-gray-400 hover:border-gunma-accent hover:text-gunma-accent transition-all duration-300 font-bold tracking-widest"
                    >
                        CONTINUE
                    </button>
                )}
            </div>

            {/* Footer */}
            <div className="absolute bottom-8 text-xs text-gray-600">
                © 2024 BEN-KEI CREATE
            </div>
        </motion.div>
    );
};

export default StartScreen;

