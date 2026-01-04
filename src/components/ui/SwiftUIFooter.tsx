import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../stores/gameStore';
import { soundManager } from '../../systems/SoundManager';
import { hapticsManager } from '../../systems/HapticsManager';
import { useState } from 'react';

/**
 * Apple-Style Tab Bar Footer
 * iOS-inspired clean navigation with blur background
 */
const SwiftUIFooter = () => {
    const { logs, setInventoryOpen, openCollection } = useGameStore();
    const [isLogHistoryOpen, setLogHistoryOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<string | null>(null);

    const handleMenuClick = (action: string) => {
        soundManager.playSe('button_click');
        hapticsManager.lightImpact();
        setActiveTab(action);

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

        // Reset active state after animation
        setTimeout(() => setActiveTab(null), 200);
    };

    const handleLogOpen = () => {
        soundManager.playSe('button_click');
        hapticsManager.lightImpact();
        setLogHistoryOpen(true);
    };

    const menuItems = [
        { id: 'map', icon: '🗺️', label: 'MAP' },
        { id: 'bag', icon: '🎒', label: 'BAG' },
        { id: 'legacy', icon: '🃏', label: 'LEGACY' }
    ];

    return (
        <>
            {/* Main Footer Bar - iOS Tab Bar Style */}
            <motion.div
                className="absolute left-4 right-4 h-14 z-50 rounded-2xl overflow-hidden flex items-center px-3"
                style={{
                    bottom: 'calc(env(safe-area-inset-bottom, 16px) + 12px)',
                    background: 'rgba(28, 28, 30, 0.9)',
                    backdropFilter: 'blur(40px)',
                    WebkitBackdropFilter: 'blur(40px)',
                    border: '1px solid rgba(48, 209, 88, 0.2)',
                    boxShadow: '0 4px 24px rgba(0, 0, 0, 0.4), 0 0 1px rgba(48, 209, 88, 0.2)'
                }}
                initial={{ y: 80, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{
                    type: 'spring',
                    stiffness: 400,
                    damping: 30,
                    delay: 0.1
                }}
            >
                {/* Log Button (Left) */}
                <motion.button
                    onClick={handleLogOpen}
                    className="w-12 h-12 flex items-center justify-center rounded-xl"
                    whileTap={{ scale: 0.92 }}
                    style={{
                        color: 'var(--color-text-medium)'
                    }}
                >
                    <span className="text-xl">📜</span>
                </motion.button>

                {/* Spacer */}
                <div className="flex-1" />

                {/* Menu Buttons (Right) */}
                <div className="flex items-center gap-1">
                    {menuItems.map(item => (
                        <motion.button
                            key={item.id}
                            onClick={() => handleMenuClick(item.id)}
                            className="w-14 h-12 flex flex-col items-center justify-center rounded-xl"
                            whileTap={{ scale: 0.92 }}
                            animate={{
                                backgroundColor: activeTab === item.id
                                    ? 'rgba(255, 255, 255, 0.1)'
                                    : 'transparent'
                            }}
                        >
                            <span className="text-lg">{item.icon}</span>
                            <span
                                className="text-[9px] font-semibold tracking-wider mt-0.5"
                                style={{ color: 'var(--color-text-low)' }}
                            >
                                {item.label}
                            </span>
                        </motion.button>
                    ))}
                </div>
            </motion.div >

            {/* Log History Modal - Apple Sheet Style */}
            <AnimatePresence>
                {
                    isLogHistoryOpen && (
                        <motion.div
                            className="fixed inset-0 z-[100] flex items-end justify-center"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setLogHistoryOpen(false)}
                        >
                            {/* Backdrop */}
                            <motion.div
                                className="absolute inset-0"
                                style={{ background: 'rgba(0, 0, 0, 0.5)' }}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                            />

                            {/* Sheet */}
                            <motion.div
                                className="relative w-full max-w-lg rounded-t-3xl overflow-hidden flex flex-col"
                                style={{
                                    background: 'var(--color-bg-elevated)',
                                    maxHeight: '70vh'
                                }}
                                initial={{ y: '100%' }}
                                animate={{ y: 0 }}
                                exit={{ y: '100%' }}
                                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                                onClick={e => e.stopPropagation()}
                            >
                                {/* Handle Bar */}
                                <div className="flex justify-center py-3">
                                    <div
                                        className="w-9 h-1 rounded-full"
                                        style={{ background: 'var(--color-bg-tertiary)' }}
                                    />
                                </div>

                                {/* Header */}
                                <div
                                    className="px-5 pb-3 flex justify-between items-center"
                                    style={{ borderBottom: '0.5px solid rgba(255,255,255,0.1)' }}
                                >
                                    <h3
                                        className="font-semibold text-base"
                                        style={{ color: 'var(--color-text-high)' }}
                                    >
                                        Log History
                                    </h3>
                                    <button
                                        onClick={() => setLogHistoryOpen(false)}
                                        className="w-8 h-8 flex items-center justify-center rounded-full"
                                        style={{
                                            background: 'var(--color-bg-tertiary)',
                                            color: 'var(--color-text-medium)'
                                        }}
                                    >
                                        ✕
                                    </button>
                                </div>

                                {/* Log Content */}
                                <div
                                    className="flex-1 overflow-y-auto px-5 py-4 space-y-3"
                                    style={{ scrollbarWidth: 'thin' }}
                                >
                                    {logs.slice().reverse().map((log, i) => (
                                        <div
                                            key={i}
                                            className="text-sm py-2"
                                            style={{
                                                borderBottom: '0.5px solid rgba(255,255,255,0.05)',
                                                color: log.type === 'info' ? 'var(--color-accent-blue)' :
                                                    log.type === 'story' ? 'var(--color-text-high)' :
                                                        log.type === 'heal' ? 'var(--color-accent-primary)' :
                                                            log.type === 'damage' ? 'var(--color-accent-red)' :
                                                                log.type === 'battle' ? 'var(--color-accent-orange)' :
                                                                    'var(--color-text-medium)'
                                            }}
                                        >
                                            <span
                                                className="text-[10px] mr-2 font-mono"
                                                style={{ color: 'var(--color-text-low)' }}
                                            >
                                                {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                            {log.message}
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        </motion.div>
                    )
                }
            </AnimatePresence >
        </>
    );
};

export default SwiftUIFooter;
