import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../stores/gameStore';
import { soundManager } from '../../systems/SoundManager';
import { hapticsManager } from '../../systems/HapticsManager';

const NameEntryModal = () => {
    const { isNameEntryOpen, setNameEntryOpen, setPlayerName, startNewGame } = useGameStore();
    const [name, setName] = useState('');

    const handleConfirm = () => {
        const finalName = name.trim() || '旅人';
        soundManager.playSe('equip');
        hapticsManager.mediumImpact();
        setPlayerName(finalName);
        setNameEntryOpen(false);
        startNewGame();
    };

    const handleSkip = () => {
        soundManager.playSe('button_click');
        setPlayerName('旅人');
        setNameEntryOpen(false);
        startNewGame();
    };

    if (!isNameEntryOpen) return null;

    return (
        <AnimatePresence>
            {isNameEntryOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
                >
                    <motion.div
                        initial={{ scale: 0.9, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.9, y: 20 }}
                        className="w-full max-w-sm bg-gunma-bg border-2 border-gunma-accent corner-cut p-6 shadow-neon space-y-6"
                    >
                        {/* Header */}
                        <div className="text-center space-y-2">
                            <div className="text-4xl">🪪</div>
                            <h2 className="text-xl font-bold text-gunma-accent tracking-wider">SOUL INJECTION</h2>
                            <p className="text-xs text-gray-400 font-mono">
                                あなたの名前を教えてください<br />
                                <span className="text-gunma-magenta">（群馬県警への登録用）</span>
                            </p>
                        </div>

                        {/* Input */}
                        <div className="space-y-2">
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="旅人"
                                maxLength={12}
                                className="w-full bg-black border-2 border-gunma-accent/50 rounded p-3 text-center text-xl text-white font-bold
                                           focus:outline-none focus:border-gunma-accent focus:shadow-neon
                                           placeholder:text-gray-600"
                            />
                            <div className="text-xs text-gray-500 text-center">
                                {name.length}/12文字
                            </div>
                        </div>

                        {/* Buttons */}
                        <div className="flex gap-3">
                            <button
                                onClick={handleSkip}
                                className="flex-1 py-3 bg-gray-800 border border-gray-600 text-gray-400 rounded font-mono
                                           hover:bg-gray-700 active:scale-95 transition-all"
                            >
                                スキップ
                            </button>
                            <button
                                onClick={handleConfirm}
                                className="flex-1 py-3 bg-gunma-accent/20 border border-gunma-accent text-gunma-accent rounded font-mono font-bold
                                           hover:bg-gunma-accent/30 active:scale-95 transition-all shadow-neon"
                            >
                                決定
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default NameEntryModal;
