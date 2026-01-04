
import { motion, AnimatePresence } from 'framer-motion';
import { Item } from '../../types';
import { soundManager } from '../../systems/SoundManager';

interface ItemDetailModalProps {
    isOpen: boolean;
    item: Item | null;
    isEquipped: boolean;
    onClose: () => void;
    onUse: () => void;
}

const ItemDetailModal = ({ isOpen, item, isEquipped, onClose, onUse }: ItemDetailModalProps) => {
    if (!item) return null;

    const handleUse = () => {
        onUse();
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={onClose}>
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.8, opacity: 0, y: 20 }}
                        className="w-full max-w-sm bg-black border-2 border-gunma-accent shadow-[0_0_20px_rgba(57,255,20,0.3)] relative overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Decorative glitch lines */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gunma-accent to-transparent opacity-50 animate-pulse" />
                        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gunma-magenta to-transparent opacity-50 animate-pulse delay-75" />

                        {/* Header */}
                        <div className="bg-gunma-accent/10 p-3 border-b border-gunma-accent/30 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gunma-accent font-mono tracking-wider flex items-center gap-2">
                                <span className="text-2xl">{item.icon}</span>
                                {item.name}
                            </h2>
                            <div className="px-2 py-0.5 text-[10px] bg-gunma-accent text-black font-bold rounded">
                                {item.type.toUpperCase()}
                            </div>
                        </div>

                        {/* Body */}
                        <div className="p-6 flex gap-4">
                            {/* Large Icon Area */}
                            <div className="w-24 h-24 bg-gunma-bg border border-gunma-accent/50 flex items-center justify-center rounded bg-grid-pattern relative shrink-0">
                                <div className="text-6xl filter drop-shadow-[0_0_10px_rgba(57,255,20,0.5)]">
                                    {item.icon}
                                </div>
                                {/* Corner markers */}
                                <div className="absolute top-1 left-1 w-2 h-2 border-l border-t border-gunma-accent" />
                                <div className="absolute top-1 right-1 w-2 h-2 border-r border-t border-gunma-accent" />
                                <div className="absolute bottom-1 left-1 w-2 h-2 border-l border-b border-gunma-accent" />
                                <div className="absolute bottom-1 right-1 w-2 h-2 border-r border-b border-gunma-accent" />
                            </div>

                            {/* Description */}
                            <div className="flex-1 space-y-2">
                                <p className="text-sm text-gunma-text leading-relaxed font-mono">
                                    {item.description}
                                </p>
                                {item.value > 0 && (
                                    <div className="text-xs text-gunma-accent/80 mt-2 border-t border-gunma-accent/30 pt-2">
                                        効果: {item.type === 'heal' ? 'HP回復' : 'ボーナス'} +{item.value}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Footer / Actions */}
                        <div className="p-4 border-t border-gunma-accent/30 bg-black/50 flex gap-3">
                            <button
                                onClick={() => {
                                    soundManager.playSe('button_click');
                                    onClose();
                                }}
                                className="flex-1 py-3 bg-gray-800 border border-gray-600 text-gray-400 font-mono rounded hover:bg-gray-700 active:scale-95 transition-all"
                            >
                                キャンセル
                            </button>

                            {item.type === 'equip' ? (
                                <button
                                    onClick={handleUse}
                                    className={`flex-1 py-3 border font-mono rounded font-bold shadow-lg active:scale-95 transition-all
                                        ${isEquipped
                                            ? 'bg-red-900/50 border-red-500 text-red-500 hover:bg-red-900/80'
                                            : 'bg-blue-900/50 border-blue-500 text-blue-400 hover:bg-blue-900/80'}`}
                                >
                                    {isEquipped ? '外す' : '装備する'}
                                </button>
                            ) : (
                                <button
                                    onClick={handleUse}
                                    className="flex-1 py-3 bg-gunma-accent/20 border border-gunma-accent text-gunma-accent font-mono rounded font-bold shadow-[0_0_10px_rgba(57,255,20,0.2)] hover:bg-gunma-accent/30 active:scale-95 transition-all"
                                >
                                    {item.type === 'heal' ? '食べる' : '使う'}
                                </button>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default ItemDetailModal;
