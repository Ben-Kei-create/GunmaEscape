import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore, ReelConfig } from '../../stores/gameStore';
import { soundManager } from '../../systems/SoundManager';
import { hapticsManager } from '../../systems/HapticsManager';

interface ReelTuningScreenProps {
    isOpen: boolean;
    onClose: () => void;
}

const ReelTuningScreen = ({ isOpen, onClose }: ReelTuningScreenProps) => {
    const { reelDeck, availableReels, setReelDeck, playerDiceCount } = useGameStore();
    const [selectedSlot, setSelectedSlot] = useState<number | null>(null);

    if (!isOpen) return null;

    const handleSlotClick = (index: number) => {
        if (index >= playerDiceCount) return; // Can't modify slots beyond current dice count
        setSelectedSlot(selectedSlot === index ? null : index);
        soundManager.playSe('button_click');
        hapticsManager.lightImpact();
    };

    const handleReelSelect = (reel: ReelConfig) => {
        if (selectedSlot === null) return;

        const newDeck = [...reelDeck];
        newDeck[selectedSlot] = reel;
        setReelDeck(newDeck);

        soundManager.playSe('equip');
        hapticsManager.mediumImpact();
        setSelectedSlot(null);
    };

    const handleRemoveReel = () => {
        if (selectedSlot === null) return;

        const newDeck = [...reelDeck];
        newDeck[selectedSlot] = null;
        setReelDeck(newDeck);

        soundManager.playSe('cancel');
        setSelectedSlot(null);
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[95] bg-black/95 flex flex-col p-4 overflow-y-auto"
            >
                {/* Header */}
                <div className="flex justify-between items-center mb-6 border-b border-gunma-accent/30 pb-4">
                    <h2 className="text-2xl font-black text-gunma-accent font-mono flex items-center gap-2">
                        🔧 REEL TUNING
                    </h2>
                    <button
                        onClick={() => {
                            soundManager.playSe('cancel');
                            onClose();
                        }}
                        className="text-gunma-accent hover:text-white text-2xl"
                    >
                        ✕
                    </button>
                </div>

                {/* Reel Slots (Garage Style) */}
                <div className="bg-gradient-to-b from-gray-900 to-black border-2 border-gunma-accent/30 rounded-xl p-6 mb-6">
                    <p className="text-gray-400 text-sm mb-4 font-mono">SLOT CONFIGURATION</p>

                    <div className="flex justify-center gap-3 flex-wrap">
                        {reelDeck.map((slot, index) => (
                            <motion.button
                                key={index}
                                onClick={() => handleSlotClick(index)}
                                disabled={index >= playerDiceCount}
                                whileHover={index < playerDiceCount ? { scale: 1.05 } : {}}
                                whileTap={index < playerDiceCount ? { scale: 0.95 } : {}}
                                className={`
                  w-16 h-20 rounded-lg border-2 flex flex-col items-center justify-center gap-1
                  transition-all duration-200
                  ${index >= playerDiceCount ? 'bg-gray-900 opacity-30 cursor-not-allowed' : 'bg-black/60 cursor-pointer'}
                  ${selectedSlot === index ? 'border-white shadow-[0_0_15px_rgba(255,255,255,0.5)]' : ''}
                  ${slot && index < playerDiceCount ? `border-2` : 'border-gunma-accent/30'}
                `}
                                style={slot && index < playerDiceCount ? { borderColor: slot.color } : {}}
                            >
                                {index < playerDiceCount ? (
                                    slot ? (
                                        <>
                                            <span className="text-2xl">{slot.icon}</span>
                                            <span className="text-[10px] text-gray-400 font-mono">#{index + 1}</span>
                                        </>
                                    ) : (
                                        <>
                                            <span className="text-gray-600 text-xl">+</span>
                                            <span className="text-[10px] text-gray-500 font-mono">#{index + 1}</span>
                                        </>
                                    )
                                ) : (
                                    <>
                                        <span className="text-gray-700 text-xl">🔒</span>
                                        <span className="text-[10px] text-gray-700 font-mono">#{index + 1}</span>
                                    </>
                                )}
                            </motion.button>
                        ))}
                    </div>

                    {/* Remove Button */}
                    {selectedSlot !== null && reelDeck[selectedSlot] && (
                        <motion.button
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            onClick={handleRemoveReel}
                            className="mt-4 mx-auto block px-4 py-2 bg-red-900/30 border border-red-500/50 
                        text-red-400 text-sm rounded hover:bg-red-900/50"
                        >
                            リールを外す
                        </motion.button>
                    )}
                </div>

                {/* Available Reels */}
                <div className="flex-1">
                    <p className="text-gray-400 text-sm mb-3 font-mono">AVAILABLE REELS</p>

                    <div className="grid grid-cols-1 gap-3">
                        {availableReels.map((reel) => (
                            <motion.button
                                key={reel.id}
                                onClick={() => handleReelSelect(reel)}
                                disabled={selectedSlot === null}
                                whileHover={selectedSlot !== null ? { scale: 1.02 } : {}}
                                whileTap={selectedSlot !== null ? { scale: 0.98 } : {}}
                                className={`
                  w-full p-4 rounded-lg border-2 text-left
                  transition-all duration-200 flex items-center gap-4
                  ${selectedSlot !== null
                                        ? 'bg-black/60 border-gunma-accent/50 cursor-pointer hover:border-gunma-accent'
                                        : 'bg-black/30 border-gray-800 opacity-50 cursor-not-allowed'}
                `}
                                style={selectedSlot !== null ? { borderColor: reel.color + '80' } : {}}
                            >
                                <div
                                    className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
                                    style={{ backgroundColor: reel.color + '30' }}
                                >
                                    {reel.icon}
                                </div>
                                <div className="flex-1">
                                    <p className="text-white font-bold">{reel.name}</p>
                                    <p className="text-gray-400 text-xs font-mono uppercase">{reel.type}</p>
                                </div>
                                {selectedSlot !== null && (
                                    <div className="text-gunma-accent text-xl">→</div>
                                )}
                            </motion.button>
                        ))}
                    </div>

                    {selectedSlot === null && (
                        <p className="text-center text-gray-500 text-sm mt-4">
                            スロットを選択してからリールを装着してください
                        </p>
                    )}
                </div>

                {/* Reel Type Legend */}
                <div className="mt-6 p-4 bg-black/40 rounded-lg border border-gray-800">
                    <p className="text-gray-500 text-xs mb-2 font-mono">REEL TYPES</p>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="flex items-center gap-2">
                            <span>⚔️</span>
                            <span className="text-red-400">ATTACK</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span>🛡️</span>
                            <span className="text-blue-400">DEFENSE</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span>⚡</span>
                            <span className="text-yellow-400">TECH</span>
                        </div>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default ReelTuningScreen;
