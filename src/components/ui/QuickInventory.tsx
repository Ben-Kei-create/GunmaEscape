import { motion } from 'framer-motion';
import { useGameStore } from '../../stores/gameStore';
import { soundManager } from '../../systems/SoundManager';
import { Item } from '../../types';
import { ITEM_CATALOG } from '../../data/items';

const QuickInventory = () => {
    const { equippedItems, setSelectedItemForModal, inventory, setInventoryOpen } = useGameStore();

    // Group items by ID
    const groupedItems = inventory.reduce((acc, id) => {
        acc[id] = (acc[id] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const uniqueItemIds = Object.keys(groupedItems);
    const weapon = equippedItems.weapon;

    const handleItemClick = (item: Item) => {
        soundManager.playSe('button_click');
        setSelectedItemForModal(item);
    };

    const handleOpenBag = () => {
        soundManager.playSe('button_click');
        setInventoryOpen(true);
    };

    return (
        <div className="w-full h-full flex items-center justify-center gap-2 px-2">
            {/* Weapon Slot (Shortcut) */}
            <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => weapon && handleItemClick(weapon)}
                className={`h-12 w-12 border rounded flex items-center justify-center relative overflow-hidden group transition-all shrink-0
                    ${weapon
                        ? 'border-gunma-magenta bg-gunma-magenta/10 shadow-[0_0_10px_rgba(255,0,255,0.2)]'
                        : 'border-gunma-accent/30 bg-black/40 opacity-50'}`}
            >
                {weapon ? (
                    <div className="text-2xl filter drop-shadow-[0_0_5px_rgba(255,0,255,0.5)]">
                        {weapon.icon}
                    </div>
                ) : (
                    <div className="text-xl opacity-20">⚔️</div>
                )}
            </motion.button>

            {/* Separator */}
            <div className="w-px h-8 bg-gunma-accent/30" />

            {/* Item Slots */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
                {uniqueItemIds.slice(0, 5).map((itemId) => {
                    const count = groupedItems[itemId];
                    const item = ITEM_CATALOG[itemId];
                    if (!item) return null;

                    // Check if equipped in any slot
                    const isEquipped = Object.values(equippedItems).some(e => e?.id === item.id);

                    return (
                        <motion.button
                            key={itemId}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleItemClick(item)}
                            className={`h-12 w-12 border rounded flex items-center justify-center relative overflow-hidden transition-colors shrink-0
                                ${isEquipped
                                    ? 'border-blue-400 bg-blue-900/20'
                                    : 'border-gunma-accent/50 bg-black/40 hover:bg-gunma-accent/10 active:bg-gunma-accent/20'}`}
                        >
                            <div className="text-2xl">{item.icon}</div>

                            {/* Quantity Badge */}
                            {count > 1 && (
                                <div className="absolute bottom-0 right-0 bg-black/80 text-white text-[10px] font-bold px-1 rounded-tl border-t border-l border-gunma-accent/50 leading-none shadow-md">
                                    x{count}
                                </div>
                            )}
                        </motion.button>
                    );
                })}

                {/* BAG Button */}
                <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={handleOpenBag}
                    className="h-12 w-12 border border-gunma-accent bg-gunma-accent/20 rounded flex items-center justify-center relative overflow-hidden shrink-0 hover:bg-gunma-accent/30"
                >
                    <div className="text-2xl">👜</div>
                    <div className="absolute bottom-0 w-full text-[8px] text-center font-bold bg-black/50 text-gunma-accent">BOX</div>
                </motion.button>
            </div>
        </div>
    );
};

export default QuickInventory;
