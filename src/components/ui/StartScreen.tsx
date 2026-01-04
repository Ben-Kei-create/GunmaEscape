import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../../stores/gameStore';
import { soundManager } from '../../systems/SoundManager';
import { hapticsManager } from '../../systems/HapticsManager';

const StartScreen: React.FC = () => {
    const { continueFromSavePoint, savePoint, gunmaModeTaps, incrementGunmaModeTaps, resetGunmaModeTaps, addLog } = useGameStore();
    const [easterEggActive, setEasterEggActive] = useState(false);
    const [screenShake, setScreenShake] = useState(false);
    const [hasTapped, setHasTapped] = useState(false);
    const tapTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        // Start Title BGM
        soundManager.playBgm('title');
        return () => {
            // Cleanup handled by next BGM play usually, but we could stop.
        };
    }, []);

    const handleScreenTap = () => {
        if (!hasTapped) {
            setHasTapped(true);
            soundManager.playSe('button_click'); // Ideally heavy decide sound
            hapticsManager.lightImpact();
            return;
        }
    };

    const handleTitleTap = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent screen tap if we want to isolate logic, but actually we want both?
        // If not tapped yet, handleTitleTap should ALSO trigger screen tap logic?
        if (!hasTapped) {
            handleScreenTap();
        }

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
            setEasterEggActive(true);
            setScreenShake(true);
            soundManager.playSe('win');
            hapticsManager.heavyImpact();
            addLog('> 群馬県民モード解放...', 'critical');
            addLog('> ダルマ弁当の加護を得た', 'heal');
            addLog('> ???「おっきりこみ」を覚えた', 'story');
            setTimeout(() => setScreenShake(false), 1000);
        }
    }, [gunmaModeTaps, easterEggActive, addLog]);

    useEffect(() => {
        return () => {
            if (tapTimeoutRef.current) clearTimeout(tapTimeoutRef.current);
        };
    }, []);

    return (
        <div
            className="w-full h-full relative overflow-hidden bg-black text-gunma-lime font-dotgothic select-none"
            onClick={handleScreenTap}
        >
            {/* Dynamic Background (Ken Burns) */}
            <div
                className="absolute inset-0 bg-cover bg-center opacity-60"
                style={{
                    backgroundImage: "url('/assets/backgrounds/bg_title.png')",
                    animation: 'ken-burns 20s infinite alternate ease-in-out'
                }}
            />
            {/* Vignette Overlay */}
            <div className="absolute inset-0 bg-radial-gradient-vignette pointer-events-none" />

            {/* Particles */}
            {[...Array(20)].map((_, i) => (
                <div
                    key={i}
                    className="absolute w-1 h-1 bg-gunma-accent shadow-[0_0_5px_#39ff14] opacity-0"
                    style={{
                        left: `${Math.random() * 100}%`,
                        animation: `particle-rise ${5 + Math.random() * 5}s infinite linear`,
                        animationDelay: `${Math.random() * 5}s`
                    }}
                />
            ))}

            <motion.div
                className="w-full h-full flex flex-col items-center justify-center relative z-10"
                animate={screenShake ? {
                    x: [0, -20, 20, -20, 20, -10, 10, 0],
                    y: [0, -10, 10, -10, 10, -5, 5, 0],
                } : {}}
                transition={{ duration: 0.5 }}
            >
                {/* Title Logo Area */}
                <motion.div
                    className="mb-24 text-center cursor-pointer relative"
                    onClick={handleTitleTap}
                    initial={{ opacity: 0, scale: 1.2 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 2.0, ease: "easeOut" }}
                >
                    {/* Glitch Effect Layers */}
                    <div className="relative">
                        <h1 className="text-5xl md:text-7xl font-bold tracking-widest leading-tight text-shadow-neon mix-blend-screen relative z-10">
                            おまえは<br />
                            <span className={easterEggActive ? 'text-yellow-400' : 'text-gunma-accent'}>グンマー</span>
                            から<br />にげられない
                        </h1>
                        {/* Glitch Shadows (CSS animation could be used, or just simple offset duplicates) */}
                        <h1 className="absolute top-0 left-0 w-full text-5xl md:text-7xl font-bold tracking-widest leading-tight text-red-500 opacity-50 z-0 animate-glitch-1" style={{ clipPath: 'inset(10% 0 80% 0)' }}>
                            おまえは<br />グンマーから<br />にげられない
                        </h1>
                        <h1 className="absolute top-0 left-0 w-full text-5xl md:text-7xl font-bold tracking-widest leading-tight text-blue-500 opacity-50 z-0 animate-glitch-2" style={{ clipPath: 'inset(80% 0 5% 0)' }}>
                            おまえは<br />グンマーから<br />にげられない
                        </h1>
                    </div>

                    <p className="mt-4 text-sm md:text-base text-gray-400 tracking-[0.5em]">THE GUNMA ESCAPE</p>

                    {/* Easter Egg Feedback */}
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

                {/* Interaction Area */}
                <div className="absolute bottom-20 w-full flex flex-col items-center h-32 justify-end">
                    {!hasTapped ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: [0, 1, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="text-xl tracking-widest text-gunma-accent animate-pulse font-bold"
                        >
                            TAP SCREEN TO ENTER...
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.5 }}
                            className="flex flex-col gap-4 w-64"
                        >
                            <button
                                onClick={(e) => { e.stopPropagation(); useGameStore.getState().setNameEntryOpen(true); }}
                                className="w-full py-4 border-2 border-gunma-accent text-gunma-accent bg-black/50 backdrop-blur hover:bg-gunma-accent hover:text-black transition-all duration-200 font-bold text-xl tracking-widest shadow-[0_0_15px_rgba(57,255,20,0.5)] active:scale-95"
                            >
                                GAME START
                            </button>

                            <button
                                onClick={(e) => { e.stopPropagation(); useGameStore.getState().openCollection('title'); }}
                                className="w-full py-3 border border-gunma-magenta text-gunma-magenta bg-black/50 backdrop-blur hover:bg-gunma-magenta hover:text-black transition-all duration-200 font-bold tracking-widest active:scale-95"
                            >
                                ZUKAN
                            </button>

                            {savePoint && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); continueFromSavePoint(); }}
                                    className="w-full py-3 border border-gray-500 text-gray-400 bg-black/50 backdrop-blur hover:border-gunma-accent hover:text-gunma-accent transition-all duration-200 font-bold tracking-widest active:scale-95"
                                >
                                    CONTINUE
                                </button>
                            )}
                        </motion.div>
                    )}
                </div>

                {/* Footer */}
                <div className="absolute bottom-4 text-[10px] text-gray-600 tracking-widest opacity-50">
                    © 2024 BEN-KEI CREATE / GUNMA PROJECT
                </div>
            </motion.div>
        </div>
    );
};

export default StartScreen;
