import { motion } from 'framer-motion';
import { useGameStore } from '../../stores/gameStore';
import { usePlayerStore } from '../../stores/playerStore';
import { soundManager } from '../../systems/SoundManager';
import { hapticsManager } from '../../systems/HapticsManager';

const QuickInventory = () => {
    const { addLog, addFloatingText } = useGameStore();
    const { heal } = usePlayerStore();

    // Mock inventory for now - effectively we give the player infinite Yakimanju for testing/fun
    // In a real implementation this would come from an inventory helper in the store.
    const items = [
        { id: 'yakimanju', name: '焼きまんじゅう', icon: '🍡', type: 'heal', value: 20 },
        { id: 'konjac', name: '味噌田楽', icon: '🍢', type: 'buff', value: 0 }
    ];

    const handleItemClick = (item: any) => {
        if (item.type === 'heal') {
            heal(item.value);
            soundManager.playSe('heal');
            hapticsManager.mediumImpact();

            addLog(`> ${item.name}を使った！ HPが${item.value}回復！`, 'heal');

            // Floating text effect centered on screen or random position? 
            // We don't have exact coordinates here easily, so let's put it in center.
            addFloatingText({
                value: item.value,
                x: window.innerWidth / 2,
                y: window.innerHeight / 2,
                type: 'heal'
            });
        } else {
            // Placeholder for other items
            soundManager.playSe('button_click');
            addLog(`> ${item.name}はまだ使えないようだ...`, 'info');
        }
    };

    return (
        <div className="w-full h-full flex flex-col gap-2">
            {/* Header */}
            <div className="text-[10px] text-gunma-accent tracking-widest text-center border-b border-gunma-accent/30 pb-1">
                GEAR / ITEM
            </div>

            {/* Equipment Slot (Fixed) */}
            <div className="flex-1 border border-gunma-magenta/50 bg-black/40 rounded p-1 flex flex-col items-center justify-center relative overflow-hidden group">
                <label className="absolute top-0 left-1 text-[8px] text-gunma-magenta">MAIN</label>
                <div className="text-2xl filter drop-shadow-[0_0_5px_rgba(255,0,255,0.5)]">
                    🗡️
                </div>
                <div className="text-[9px] text-gunma-text mt-1">風の護符</div>
            </div>

            {/* Item Slots */}
            {items.map((item, index) => (
                <motion.button
                    key={item.id}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleItemClick(item)}
                    className="flex-1 border border-gunma-accent/50 bg-black/40 rounded p-1 flex flex-col items-center justify-center relative overflow-hidden hover:bg-gunma-accent/10 active:bg-gunma-accent/20 transition-colors"
                >
                    <label className="absolute top-0 left-1 text-[8px] text-gunma-accent">ITEM {index + 1}</label>
                    <div className="text-2xl">{item.icon}</div>
                    <div className="text-[9px] text-gunma-text mt-1">{item.name}</div>
                </motion.button>
            ))}
        </div>
    );
};

export default QuickInventory;
