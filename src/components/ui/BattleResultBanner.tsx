import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface BattleResultData {
    expGained: number;
    itemsGained: { id: string; name: string; icon: string }[];
    levelUp?: { from: number; to: number };
}

const BattleResultBanner = () => {
    const [result, setResult] = useState<BattleResultData | null>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const handleBattleResult = (e: CustomEvent<BattleResultData>) => {
            setResult(e.detail);
            setIsVisible(true);

            // Auto-hide after 4 seconds
            setTimeout(() => {
                setIsVisible(false);
            }, 4000);
        };

        window.addEventListener('battleResult', handleBattleResult as EventListener);
        return () => {
            window.removeEventListener('battleResult', handleBattleResult as EventListener);
        };
    }, []);

    return (
        <AnimatePresence>
            {isVisible && result && (
                <motion.div
                    initial={{ x: '100%', opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: '100%', opacity: 0 }}
                    transition={{ type: 'spring', damping: 20, stiffness: 200 }}
                    className="fixed top-20 right-4 z-[70] w-64 bg-black/90 border-l-4 border-yellow-400 rounded-lg shadow-lg overflow-hidden"
                >
                    {/* Header */}
                    <div className="bg-gradient-to-r from-yellow-600/30 to-transparent px-3 py-2 border-b border-yellow-400/30">
                        <span className="text-yellow-400 font-bold text-sm">🏆 VICTORY</span>
                    </div>

                    {/* Content */}
                    <div className="p-3 space-y-2">
                        {/* Exp Gained */}
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-400">経験値:</span>
                            <span className="text-yellow-400 font-bold">+{result.expGained} EXP</span>
                        </div>

                        {/* Items Gained */}
                        {result.itemsGained.length > 0 && (
                            <div className="space-y-1">
                                <span className="text-gray-500 text-xs">獲得アイテム:</span>
                                {result.itemsGained.map((item, i) => (
                                    <div key={i} className="flex items-center gap-2 text-sm text-white">
                                        <span>{item.icon}</span>
                                        <span>{item.name}</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Level Up */}
                        {result.levelUp && (
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="bg-yellow-500/20 rounded px-2 py-1 text-center border border-yellow-500/50"
                            >
                                <span className="text-yellow-300 font-bold text-sm">
                                    ⬆️ LEVEL UP! Lv.{result.levelUp.from} → Lv.{result.levelUp.to}
                                </span>
                            </motion.div>
                        )}
                    </div>

                    {/* Progress Bar Animation */}
                    <motion.div
                        className="h-1 bg-yellow-400"
                        initial={{ width: '100%' }}
                        animate={{ width: '0%' }}
                        transition={{ duration: 4, ease: 'linear' }}
                    />
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default BattleResultBanner;
