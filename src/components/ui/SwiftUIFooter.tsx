import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../stores/gameStore';
import { soundManager } from '../../systems/SoundManager';
import { scenarioManager } from '../../systems/ScenarioManager';
import { useState } from 'react';

const SwiftUIFooter = () => {
    const {
        logs,
        currentCard,
        setInventoryOpen,
        openCollection
    } = useGameStore();

    // Get latest story/info log
    const lastLog = logs.slice().reverse().find(l => ['story', 'info', 'hero'].includes(l.type))?.message || '...';

    // Log History Modal State
    const [isLogHistoryOpen, setLogHistoryOpen] = useState(false);

    const handleMenuClick = (action: string) => {
        soundManager.playSe('button_click');
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

    const handleMessageTap = () => {
        // Advance scenario if it's a story card
        if (currentCard?.type === 'story') {
            soundManager.playSe('button_click');
            scenarioManager.processCardAction(currentCard, 'right');
        }
    };

    return (
        <>
            {/* Main Footer Bar */}
            <motion.div
                className="absolute bottom-4 left-4 right-4 h-[70px] z-50 rounded-2xl overflow-hidden backdrop-blur-md bg-black/60 border border-white/10 shadow-lg flex items-center px-1"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
                {/* 1. Log Button (Left) */}
                <button
                    onClick={() => setLogHistoryOpen(true)}
                    className="w-14 h-full flex items-center justify-center text-gunma-accent hover:bg-white/5 active:scale-95 transition-all"
                >
                    <div className="text-2xl filter drop-shadow-[0_0_5px_rgba(57,255,20,0.5)]">📜</div>
                </button>

                {/* 2. Message Area (Center) */}
                <div
                    onClick={handleMessageTap}
                    className="flex-1 h-[54px] mx-1 bg-black/40 rounded-xl flex items-center px-4 relative overflow-hidden active:scale-[0.99] transition-transform cursor-pointer border border-white/5"
                >
                    {/* Blinking Indicator */}
                    {currentCard?.type === 'story' && (
                        <div className="absolute right-2 bottom-2 w-2 h-2 bg-gunma-accent rounded-full animate-pulse" />
                    )}

                    <div className="truncate text-sm text-white font-medium tracking-wide w-full pr-4">
                        {/* Strip '>' prefix if present */}
                        {lastLog.replace(/^>\s*/, '')}
                    </div>
                </div>

                {/* 3. Menu Tabs (Right) */}
                <div className="flex items-center h-full gap-1 pl-1">
                    {[
                        { id: 'bag', icon: '🎒' },
                        { id: 'map', icon: '🗺️' },
                        { id: 'legacy', icon: '🃏' }
                    ].map(item => (
                        <button
                            key={item.id}
                            onClick={() => handleMenuClick(item.id)}
                            className="w-12 h-full flex flex-col items-center justify-center text-white/80 hover:text-white hover:bg-white/5 active:scale-95 transition-all"
                        >
                            <span className="text-xl mb-0.5">{item.icon}</span>
                            {/* Optional Label 
                            <span className="text-[9px] font-bold opacity-70">{item.id.toUpperCase()}</span>
                            */}
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
                            className="w-full max-w-lg h-[60vh] bg-black border border-gunma-accent rounded-xl overflow-hidden flex flex-col shadow-neon"
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="p-4 bg-gunma-accent/10 border-b border-gunma-accent/30 flex justify-between items-center">
                                <h3 className="font-bold text-gunma-accent tracking-widest">LOG HISTORY</h3>
                                <button onClick={() => setLogHistoryOpen(false)} className="text-gray-400 hover:text-white">✕</button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-4 space-y-3 log-scrollbar">
                                {logs.map((log, i) => (
                                    <div key={i} className={`text-sm border-b border-white/5 pb-2 ${log.type === 'info' ? 'text-cyan-400' :
                                            log.type === 'story' ? 'text-white' :
                                                log.type === 'battle' ? 'text-red-400' :
                                                    'text-gray-400'
                                        }`}>
                                        <span className="opacity-50 text-[10px] mr-2">{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
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
