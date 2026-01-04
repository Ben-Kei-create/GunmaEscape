import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../stores/gameStore';
import { soundManager } from '../../systems/SoundManager';
import { ITEM_CATALOG } from '../../data/items';
import { Item } from '../../types';

const InventoryManager = () => {
    const {
        isInventoryOpen,
        setInventoryOpen,
        equippedItems,
        inventory,
        setSelectedItemForModal,
        unequipItem
    } = useGameStore();

    if (!isInventoryOpen) return null;

    // Group items by ID for the list
    const groupedItems = inventory.reduce((acc, id) => {
        acc[id] = (acc[id] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const uniqueInventoryIds = Object.keys(groupedItems);

    const handleClose = () => {
        soundManager.playSe('button_click'); // Will update to menu_close later
        setInventoryOpen(false);
    };

    const handleItemClick = (item: Item) => {
        soundManager.playSe('button_click');
        setSelectedItemForModal(item);
    };

    const handleUnequip = (slot: 'weapon' | 'armor' | 'accessory') => {
        unequipItem(slot);
        soundManager.playSe('button_click'); // Will update to equip sound
    };

    const renderEquipSlot = (slot: 'weapon' | 'armor' | 'accessory', icon: string, label: string) => {
        const item = equippedItems[slot];
        return (
            <div className="flex flex-col gap-1 w-full bg-black/60 border border-gunma-accent/30 rounded p-2 relative">
                <div className="text-[10px] text-gunma-accent/70 uppercase font-mono">{label}</div>

                {item ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center gap-3"
                    >
                        <div className="text-3xl filter drop-shadow-[0_0_5px_rgba(255,0,255,0.5)]">{item.icon}</div>
                        <div className="flex-1 min-w-0">
                            <div className="font-bold text-sm truncate text-white">{item.name}</div>
                            <div className="text-xs text-gunma-text truncate mb-4">{item.description}</div>
                        </div>
                        <button
                            onClick={() => handleUnequip(slot)}
                            className="bg-gunma-magenta/20 border border-gunma-magenta text-gunma-magenta text-xs px-2 py-1 rounded hover:bg-gunma-magenta/40"
                        >
                            外す
                        </button>
                    </motion.div>
                ) : (
                    <div className="h-12 flex items-center justify-center opacity-30 gap-2">
                        <div className="text-2xl grayscale">{icon}</div>
                        <div className="text-xs">EMPTY</div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <AnimatePresence>
            {isInventoryOpen && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
                >
                    <div className="w-full h-full max-w-md bg-gunma-bg border-2 border-gunma-accent corner-cut relative flex flex-col shadow-neon">
                        {/* Header */}
                        <div className="flex items-center justify-between p-3 border-b border-gunma-accent/50 bg-gunma-accent/10">
                            <div className="flex items-center gap-2">
                                <span className="text-2xl">🎒</span>
                                <h2 className="text-xl font-bold tracking-wider text-white filter drop-shadow-[0_0_5px_#39ff14]">ITEM BOX</h2>
                            </div>
                            <button
                                onClick={handleClose}
                                className="w-8 h-8 flex items-center justify-center border border-gunma-accent/50 rounded-full hover:bg-gunma-accent/20"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-6 log-scrollbar">
                            {/* Equipment Section */}
                            <section>
                                <h3 className="text-sm text-gunma-accent font-bold mb-2 flex items-center gap-2">
                                    <span className="w-1 h-4 bg-gunma-accent" /> EQUIPMENT
                                </h3>
                                <div className="space-y-2">
                                    {renderEquipSlot('weapon', '⚔️', 'WEAPON')}
                                    {renderEquipSlot('armor', '🛡️', 'ARMOR')}
                                    {renderEquipSlot('accessory', '💍', 'ACCESSORY')}
                                </div>
                            </section>

                            <div className="neon-separator opacity-50" />

                            {/* Inventory List */}
                            <section>
                                <h3 className="text-sm text-gunma-accent font-bold mb-2 flex items-center gap-2">
                                    <span className="w-1 h-4 bg-gunma-accent" /> POSSESSION
                                </h3>
                                {uniqueInventoryIds.length === 0 ? (
                                    <div className="text-center text-gray-500 py-8 text-sm">No items in bag.</div>
                                ) : (
                                    <div className="grid grid-cols-1 gap-2">
                                        {uniqueInventoryIds.map(id => {
                                            const count = groupedItems[id];
                                            const item = ITEM_CATALOG[id];
                                            if (!item) return null;

                                            return (
                                                <motion.button
                                                    key={id}
                                                    onClick={() => handleItemClick(item)}
                                                    className="flex items-center gap-3 bg-black/40 border border-gunma-accent/30 p-2 rounded hover:bg-gunma-accent/10 active:scale-98 transition-colors text-left"
                                                >
                                                    <div className="w-10 h-10 flex items-center justify-center bg-black/60 rounded text-2xl relative">
                                                        {item.icon}
                                                        {count > 1 && (
                                                            <div className="absolute -bottom-1 -right-1 bg-gunma-text text-black text-[10px] font-bold px-1 rounded">
                                                                x{count}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="font-bold text-white text-sm">{item.name}</div>
                                                        <div className="text-xs text-gray-400 truncate">{item.description}</div>
                                                    </div>
                                                    {item.type === 'equip' && (
                                                        <div className="text-[10px] bg-blue-900/50 text-blue-300 px-1 rounded border border-blue-500/30">
                                                            E
                                                        </div>
                                                    )}
                                                </motion.button>
                                            );
                                        })}
                                    </div>
                                )}
                            </section>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default InventoryManager;
