import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../stores/gameStore';

const SaveIndicator = () => {
    const [showSaving, setShowSaving] = useState(false);
    const { currentScenarioId, savePoint, settings } = useGameStore();

    // Watch for state changes that trigger save
    useEffect(() => {
        // Show indicator when important state changes
        setShowSaving(true);
        const timer = setTimeout(() => {
            setShowSaving(false);
        }, 2000);

        return () => clearTimeout(timer);
    }, [currentScenarioId, savePoint, settings]);

    return (
        <AnimatePresence>
            {showSaving && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.3 }}
                    className="fixed bottom-4 right-4 z-40 flex items-center gap-2 
                     bg-black/60 border border-gunma-accent/50 rounded-lg px-3 py-2"
                >
                    {/* Floppy disk icon */}
                    <motion.div
                        animate={{ opacity: [1, 0.5, 1] }}
                        transition={{ duration: 0.5, repeat: Infinity }}
                        className="text-gunma-accent"
                    >
                        💾
                    </motion.div>
                    <span className="text-gunma-accent font-mono text-xs">
                        SAVING...
                    </span>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default SaveIndicator;
