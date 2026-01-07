import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../stores/gameStore';
import { soundManager } from '../../systems/SoundManager';
import { hapticsManager } from '../../systems/HapticsManager';

// Random jungle backgrounds
const JUNGLE_BACKGROUNDS = [
    '/assets/bg/title_jungle_1.png',
    '/assets/bg/title_jungle_2.png',
    '/assets/bg/title_jungle_3.png',
];

// Boot sequence messages
const BOOT_MESSAGES = [
    'SYSTEM INITIALIZING...',
    'LOADING GUNMA MODULE...',
    'DANGER LEVEL: ████████ MAXIMUM',
    'ESCAPE PROBABILITY: 0.00%',
    'BOOT SEQUENCE COMPLETE',
    '',
];

// Glitch text component
const GlitchText: React.FC<{ text: string; className?: string }> = ({ text, className }) => (
    <motion.span
        className={`relative inline-block ${className}`}
        animate={{
            x: [0, -2, 2, -1, 1, 0],
            textShadow: [
                '0 0 0 transparent',
                '-2px 0 #ff0000, 2px 0 #00ffff',
                '2px 0 #ff0000, -2px 0 #00ffff',
                '0 0 0 transparent',
            ],
        }}
        transition={{
            duration: 0.3,
            repeat: Infinity,
            repeatDelay: 2 + Math.random() * 3,
        }}
    >
        {text}
    </motion.span>
);

// Floating spore particle
const Spore: React.FC<{ delay: number }> = ({ delay }) => {
    const size = 2 + Math.random() * 4;
    const startX = Math.random() * 100;
    const duration = 8 + Math.random() * 6;

    return (
        <motion.div
            className="absolute rounded-full pointer-events-none"
            style={{
                width: size,
                height: size,
                left: `${startX}%`,
                bottom: '-5%',
                background: 'radial-gradient(circle, rgba(0,255,100,0.8) 0%, rgba(0,255,100,0) 70%)',
                boxShadow: '0 0 6px rgba(0,255,100,0.6)',
            }}
            animate={{
                y: [0, -window.innerHeight * 1.2],
                x: [0, (Math.random() - 0.5) * 100],
                opacity: [0, 0.8, 0.8, 0],
                scale: [0.5, 1, 1, 0.3],
            }}
            transition={{
                duration,
                delay,
                repeat: Infinity,
                ease: 'linear',
            }}
        />
    );
};

// Static noise component for CRT effect
const StaticNoise: React.FC = () => (
    <div
        className="absolute inset-0 pointer-events-none z-50"
        style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            opacity: 0.5,
            mixBlendMode: 'overlay',
        }}
    />
);

const StartScreen: React.FC = () => {
    const { continueFromSavePoint, savePoint, gunmaModeTaps, incrementGunmaModeTaps, resetGunmaModeTaps, addLog } = useGameStore();
    const [bootPhase, setBootPhase] = useState<'noise' | 'boot' | 'logo' | 'ready'>('noise');
    const [bootLine, setBootLine] = useState(0);
    const [easterEggActive, setEasterEggActive] = useState(false);
    const [screenShake, setScreenShake] = useState(false);
    const [hasTapped, setHasTapped] = useState(false);
    const tapTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Random background on mount
    const backgroundImage = useMemo(() => {
        return JUNGLE_BACKGROUNDS[Math.floor(Math.random() * JUNGLE_BACKGROUNDS.length)];
    }, []);

    // Boot sequence
    useEffect(() => {
        // Phase 1: Noise (0.5s)
        const noiseTimer = setTimeout(() => {
            setBootPhase('boot');
            soundManager.playSe('button_click');
        }, 500);

        return () => clearTimeout(noiseTimer);
    }, []);

    // Boot messages sequence
    useEffect(() => {
        if (bootPhase !== 'boot') return;

        if (bootLine < BOOT_MESSAGES.length) {
            const timer = setTimeout(() => {
                setBootLine(prev => prev + 1);
                if (bootLine < BOOT_MESSAGES.length - 1) {
                    soundManager.playSe('text_advance');
                }
            }, 300);
            return () => clearTimeout(timer);
        } else {
            // Boot complete, show logo
            setTimeout(() => {
                setBootPhase('logo');
                soundManager.playBgm('title');
            }, 500);
        }
    }, [bootPhase, bootLine]);

    // Logo reveal complete
    useEffect(() => {
        if (bootPhase === 'logo') {
            const timer = setTimeout(() => {
                setBootPhase('ready');
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [bootPhase]);

    const handleScreenTap = () => {
        if (bootPhase !== 'ready') {
            // Skip boot sequence
            setBootPhase('ready');
            soundManager.playBgm('title');
            return;
        }

        if (!hasTapped) {
            setHasTapped(true);
            soundManager.playSe('button_click');
            hapticsManager.lightImpact();
            return;
        }
    };

    const handleTitleTap = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!hasTapped && bootPhase === 'ready') {
            handleScreenTap();
        }

        incrementGunmaModeTaps();
        hapticsManager.lightImpact();

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
            className="w-full h-full min-h-screen relative overflow-hidden bg-black text-green-400 font-mono select-none"
            onClick={handleScreenTap}
        >
            {/* ===== NOISE PHASE ===== */}
            <AnimatePresence>
                {bootPhase === 'noise' && (
                    <motion.div
                        className="absolute inset-0 z-50 bg-black"
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <StaticNoise />
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent animate-pulse" />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ===== BOOT PHASE ===== */}
            <AnimatePresence>
                {bootPhase === 'boot' && (
                    <motion.div
                        className="absolute inset-0 z-40 bg-black flex flex-col items-start justify-center p-8"
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="font-mono text-sm text-green-500 space-y-1">
                            {BOOT_MESSAGES.slice(0, bootLine).map((msg, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    &gt; {msg}
                                </motion.div>
                            ))}
                            <span className="animate-pulse">_</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ===== MAIN CONTENT (Logo + Ready) ===== */}
            {(bootPhase === 'logo' || bootPhase === 'ready') && (
                <>
                    {/* Ken Burns Background */}
                    <motion.div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{
                            backgroundImage: `url('${backgroundImage}')`,
                            filter: 'brightness(0.4) saturate(1.2)',
                        }}
                        initial={{ scale: 1.2, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 2 }}
                    />
                    <motion.div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{
                            backgroundImage: `url('${backgroundImage}')`,
                            filter: 'brightness(0.4) saturate(1.2)',
                        }}
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
                    />

                    {/* Fog Overlay */}
                    <motion.div
                        className="absolute inset-0 pointer-events-none"
                        style={{
                            background: 'linear-gradient(180deg, rgba(0,20,0,0.5) 0%, rgba(0,0,0,0.3) 50%, rgba(0,30,0,0.6) 100%)',
                        }}
                        animate={{ opacity: [0.6, 0.8, 0.6] }}
                        transition={{ duration: 8, repeat: Infinity }}
                    />

                    {/* Vignette */}
                    <div
                        className="absolute inset-0 pointer-events-none"
                        style={{
                            background: 'radial-gradient(ellipse at center, transparent 20%, rgba(0,0,0,0.9) 100%)',
                        }}
                    />

                    {/* Scanlines */}
                    <div
                        className="absolute inset-0 pointer-events-none opacity-10"
                        style={{
                            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,0,0.1) 2px, rgba(0,255,0,0.1) 4px)',
                        }}
                    />

                    {/* Floating Spores */}
                    {[...Array(12)].map((_, i) => (
                        <Spore key={i} delay={i * 0.6} />
                    ))}

                    {/* Main Content */}
                    <motion.div
                        className="w-full h-full min-h-screen flex flex-col items-center justify-between relative z-10"
                        style={{
                            paddingTop: 'calc(env(safe-area-inset-top) + 100px)',
                            paddingBottom: 'calc(env(safe-area-inset-bottom) + 60px)'
                        }}
                        animate={screenShake ? {
                            x: [0, -20, 20, -20, 20, -10, 10, 0],
                            y: [0, -10, 10, -10, 10, -5, 5, 0],
                        } : {}}
                        transition={{ duration: 0.5 }}
                    >
                        {/* ===== TITLE AREA ===== */}
                        <motion.div
                            className="text-center cursor-pointer flex-shrink-0"
                            onClick={handleTitleTap}
                            initial={{ opacity: 0, scale: 0.8, filter: 'blur(10px)' }}
                            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                            transition={{ duration: 1.5, delay: bootPhase === 'logo' ? 0.5 : 0 }}
                        >
                            <div className="relative mb-4">
                                <h1 className="text-4xl md:text-5xl font-black tracking-wider leading-relaxed relative z-10">
                                    <GlitchText text="おまえは" className="block" />
                                    <span
                                        className={`block text-5xl md:text-6xl ${easterEggActive ? 'text-yellow-400' : 'text-[#00FF00]'}`}
                                        style={{ textShadow: '0 0 30px rgba(0,255,0,0.8), 0 0 60px rgba(0,255,0,0.4)' }}
                                    >
                                        <GlitchText text="グンマー" />
                                    </span>
                                    <GlitchText text="から" className="block" />
                                    <GlitchText text="にげられない" className="block" />
                                </h1>

                                {/* Glitch shadows */}
                                <motion.div
                                    className="absolute inset-0 text-4xl md:text-5xl font-black tracking-wider leading-relaxed text-red-500 opacity-0 z-0"
                                    animate={{ opacity: [0, 0.7, 0], x: [0, -4, 0] }}
                                    transition={{ duration: 0.15, repeat: Infinity, repeatDelay: 3 }}
                                    style={{ clipPath: 'inset(20% 0 60% 0)' }}
                                >
                                    おまえは<br />グンマー<br />から<br />にげられない
                                </motion.div>
                                <motion.div
                                    className="absolute inset-0 text-4xl md:text-5xl font-black tracking-wider leading-relaxed text-cyan-400 opacity-0 z-0"
                                    animate={{ opacity: [0, 0.7, 0], x: [0, 4, 0] }}
                                    transition={{ duration: 0.15, repeat: Infinity, repeatDelay: 4 }}
                                    style={{ clipPath: 'inset(60% 0 10% 0)' }}
                                >
                                    おまえは<br />グンマー<br />から<br />にげられない
                                </motion.div>
                            </div>

                            <motion.p
                                className="text-sm md:text-base tracking-[0.5em] text-gray-400"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 1.5, duration: 1 }}
                            >
                                THE GUNMA ESCAPE
                            </motion.p>

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

                        {/* ===== SPACER ===== */}
                        <div className="flex-1" />

                        {/* ===== BUTTON AREA ===== */}
                        <div className="w-full flex flex-col items-center px-8 flex-shrink-0">
                            {bootPhase === 'ready' && (
                                <>
                                    {!hasTapped ? (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: [0.3, 1, 0.3] }}
                                            transition={{ duration: 2, repeat: Infinity }}
                                            className="text-lg tracking-widest text-[#00FF00] font-bold"
                                            style={{ textShadow: '0 0 15px rgba(0,255,0,0.8)' }}
                                        >
                                            TAP SCREEN TO ENTER...
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            initial={{ y: 30, opacity: 0 }}
                                            animate={{ y: 0, opacity: 1 }}
                                            transition={{ duration: 0.4 }}
                                            className="flex flex-col gap-4 w-full max-w-xs"
                                        >
                                            <button
                                                onClick={(e) => { e.stopPropagation(); useGameStore.getState().setNameEntryOpen(true); }}
                                                className="w-full py-4 rounded-lg font-bold text-xl tracking-widest transition-all duration-200 active:scale-95"
                                                style={{
                                                    background: 'rgba(0,255,0,0.15)',
                                                    border: '2px solid #00FF00',
                                                    color: '#00FF00',
                                                    boxShadow: '0 0 20px rgba(0,255,0,0.4), inset 0 0 20px rgba(0,255,0,0.1)',
                                                }}
                                            >
                                                GAME START
                                            </button>

                                            <button
                                                onClick={(e) => { e.stopPropagation(); useGameStore.getState().openCollection('title'); }}
                                                className="w-full py-3 rounded-lg font-bold tracking-widest transition-all duration-200 active:scale-95"
                                                style={{
                                                    background: 'rgba(255,0,255,0.1)',
                                                    border: '1px solid #FF00FF',
                                                    color: '#FF00FF',
                                                    boxShadow: '0 0 10px rgba(255,0,255,0.3)',
                                                }}
                                            >
                                                ZUKAN
                                            </button>

                                            {savePoint && (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); continueFromSavePoint(); }}
                                                    className="w-full py-3 rounded-lg font-bold tracking-widest transition-all duration-200 active:scale-95"
                                                    style={{
                                                        background: 'rgba(100,100,100,0.1)',
                                                        border: '1px solid #666',
                                                        color: '#888',
                                                    }}
                                                >
                                                    CONTINUE
                                                </button>
                                            )}

                                            {/* DEBUG: Run Test Batch */}
                                            <button
                                                onClick={(e) => { e.stopPropagation(); (window as any).GunmaDebug?.startChapter1TestBatch(); }}
                                                className="w-full py-2 rounded-lg font-bold text-sm tracking-widest transition-all duration-200 active:scale-95 mt-4 opacity-50 hover:opacity-100"
                                                style={{
                                                    background: 'rgba(255, 0, 0, 0.1)',
                                                    border: '1px dashed #FF0000',
                                                    color: '#FF0000',
                                                }}
                                            >
                                                [DEBUG] RUN TEST BATCH
                                            </button>
                                        </motion.div>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="text-[10px] text-gray-600 tracking-widest opacity-50 flex-shrink-0 mt-4">
                            © 2024 BEN-KEI CREATE / GUNMA PROJECT
                        </div>
                    </motion.div>
                </>
            )}
        </div>
    );
};

export default StartScreen;
