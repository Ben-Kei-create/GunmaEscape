import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../stores/gameStore';
import { soundManager } from '../../systems/SoundManager';

interface TutorialOverlayProps {
    step: 'tap' | 'swipe' | 'none';
    onComplete: () => void;
}

const TutorialOverlay = ({ step, onComplete }: TutorialOverlayProps) => {
    if (step === 'none') return null;

    const handleInteraction = () => {
        soundManager.playSe('button_click');
        onComplete();
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center"
                onClick={handleInteraction}
            >
                <div className="text-center">
                    {step === 'tap' && (
                        <>
                            {/* Tapping Hand Animation */}
                            <motion.div
                                className="text-8xl mb-6"
                                animate={{
                                    y: [0, 10, 0],
                                    scale: [1, 0.9, 1],
                                }}
                                transition={{
                                    duration: 0.8,
                                    repeat: Infinity,
                                    ease: 'easeInOut',
                                }}
                            >
                                👆
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="text-gunma-accent font-mono text-xl"
                            >
                                タップして進む
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 0.6 }}
                                transition={{ delay: 0.6 }}
                                className="text-gunma-text/60 font-mono text-sm mt-4"
                            >
                                画面をタップしてストーリーを進めよう
                            </motion.div>
                        </>
                    )}

                    {step === 'swipe' && (
                        <>
                            {/* Swiping Hand Animation */}
                            <motion.div
                                className="text-8xl mb-6"
                                animate={{
                                    x: [-50, 50, -50],
                                }}
                                transition={{
                                    duration: 1.5,
                                    repeat: Infinity,
                                    ease: 'easeInOut',
                                }}
                            >
                                👆
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="text-gunma-accent font-mono text-xl"
                            >
                                スワイプで選択
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 0.6 }}
                                transition={{ delay: 0.6 }}
                                className="text-gunma-text/60 font-mono text-sm mt-4"
                            >
                                左右にスワイプして選択しよう
                            </motion.div>
                            <div className="flex justify-center gap-8 mt-6">
                                <motion.div
                                    animate={{ x: [-5, 0, -5] }}
                                    transition={{ duration: 1, repeat: Infinity }}
                                    className="text-red-400 font-mono"
                                >
                                    ← NO
                                </motion.div>
                                <motion.div
                                    animate={{ x: [5, 0, 5] }}
                                    transition={{ duration: 1, repeat: Infinity }}
                                    className="text-green-400 font-mono"
                                >
                                    YES →
                                </motion.div>
                            </div>
                        </>
                    )}

                    {/* Tap to dismiss hint */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0.3, 0.6, 0.3] }}
                        transition={{ delay: 1, duration: 2, repeat: Infinity }}
                        className="text-gunma-text/40 font-mono text-xs mt-8"
                    >
                        [ タップして閉じる ]
                    </motion.div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

// Hook to manage tutorial state
export const useTutorial = () => {
    const { hasSeenTutorial, setHasSeenTutorial } = useGameStore();

    const showTapTutorial = !hasSeenTutorial;

    const completeTutorial = () => {
        setHasSeenTutorial(true);
    };

    return { showTapTutorial, completeTutorial };
};

export default TutorialOverlay;
