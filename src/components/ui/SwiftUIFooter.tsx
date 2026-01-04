import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../stores/gameStore';
import { soundManager } from '../../systems/SoundManager';
import { hapticsManager } from '../../systems/HapticsManager';
import { useState } from 'react';

/**
 * Modern Footer Bar (SwiftUI / iOS Style)
 * Glassmorphism design with:
 * - Log button (Left)
 * - Blank spacer (Center)
 * - Menu buttons (Right)
 */
const SwiftUIFooter = () => {
    const { logs, setInventoryOpen, openCollection } = useGameStore();
    const [isLogHistoryOpen, setLogHistoryOpen] = useState(false);

    const handleMenuClick = (action: string) => {
        soundManager.playSe('button_click');
        hapticsManager.lightImpact();

        switch (action) {
            case 'bag':
                setInventoryOpen(true);
                break;
            case 'legacy':
                openCollection('game');
                break;
            case 'map':
                useGameStore.getState().addLog('> マップ機能は現在開発中です', 'info');
                break;
        }
    };

    const handleLogOpen = () => {
        soundManager.playSe('button_click');
        hapticsManager.lightImpact();
        setLogHistoryOpen(true);
    };

    return (
        <>
            {/* Main Footer Bar - Glassmorphism Style */}
            <motion.div
                className="absolute bottom-4 left-4 right-4 h-[70px] z-50 rounded-2xl overflow-hidden flex items-center px-2"
                style={{
                    background: 'rgba(20, 23, 27, 0.6)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    boxShadow: '0 4px 30px rgba(0, 0, 0, 0.3)'
                }}
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
                {/* 1. Log Button (Left) */}
                <button
                    onClick={handleLogOpen}
                    className="w-14 h-14 flex items-center justify-center rounded-xl text-[var(--color-accent-primary)] hover:bg-white/10 active:scale-90 transition-all"
                >
                    <span className="text-2xl">📜</span>
                </button>

                {/* 2. Spacer (Center - Blank) */}
                <div className="flex-1" />

                {/* 3. Menu Buttons (Right) */}
                <div className="flex items-center gap-1">
                    {[
                        { id: 'map', icon: '🗺️', label: 'MAP' },
                        { id: 'bag', icon: '🎒', label: 'BAG' },
                        { id: 'legacy', icon: '🃏', label: 'LEGACY' }
                    ].map(item => (
                        <button
                            key={item.id}
                            onClick={() => handleMenuClick(item.id)}
                            className="w-14 h-14 flex flex-col items-center justify-center rounded-xl text-white/80 hover:text-white hover:bg-white/10 active:scale-90 transition-all"
                        >
                            <span className="text-xl">{item.icon}</span>
                            <span className="text-[8px] font-bold tracking-wider opacity-60 mt-0.5">{item.label}</span>
                        </button>
                    ))}
                </div>
            </motion.div>

            {/* Log History Modal */}
            <AnimatePresence>
                {isLogHistoryOpen && (
                    <motion.div
                        className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setLogHistoryOpen(false)}
                    >
                        <motion.div
                            className="w-full max-w-lg h-[60vh] rounded-2xl overflow-hidden flex flex-col"
                            style={{
                                background: 'rgba(20, 23, 27, 0.95)',
                                border: '1px solid rgba(255, 255, 255, 0.1)'
                            }}
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            onClick={e => e.stopPropagation()}
                        >
                            {/* Modal Header */}
                            <div className="p-4 border-b border-white/10 flex justify-between items-center">
                                <h3 className="font-bold text-[var(--color-accent-primary)] tracking-widest text-sm">LOG HISTORY</h3>
                                <button
                                    onClick={() => setLogHistoryOpen(false)}
                                    className="w-8 h-8 flex items-center justify-center rounded-full text-white/60 hover:text-white hover:bg-white/10 active:scale-90 transition-all"
                                >
                                    ✕
                                </button>
                            </div>

                            {/* Log Content */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-2 log-scrollbar">
                                {logs.slice().reverse().map((log, i) => (
                                    <div
                                        key={i}
                                        className={`text-sm py-2 border-b border-white/5 ${log.type === 'info' ? 'text-cyan-400' :
                                                log.type === 'story' ? 'text-white' :
                                                    log.type === 'heal' ? 'text-green-400' :
                                                        log.type === 'damage' ? 'text-red-400' :
                                                            log.type === 'battle' ? 'text-orange-400' :
                                                                'text-gray-400'
                                            }`}
                                    >
                                        <span className="opacity-40 text-[10px] mr-2 font-mono">
                                            {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                        {log.message}
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default SwiftUIFooter;
