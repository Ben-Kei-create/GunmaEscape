import { motion } from 'framer-motion';
import { useGameStore } from '../../stores/gameStore';
import { soundManager } from '../../systems/SoundManager';

const ExplorationDeck = () => {
    const { setInventoryOpen, openCollection } = useGameStore();

    const handleMenuClick = (action: string) => {
        soundManager.playSe('button_click');
        switch (action) {
            case 'inventory':
                setInventoryOpen(true);
                break;
            case 'legacy':
                openCollection('game');
                break;
            case 'map':
                console.log('Map clicked - To be implemented');
                // Future: setMapOpen(true);
                break;
            case 'quest':
                console.log('Quest clicked - To be implemented');
                // Future: setQuestOpen(true);
                break;
        }
    };

    const menuItems = [
        { id: 'inventory', icon: '🎒', label: 'BAG' },
        { id: 'legacy', icon: '🃏', label: 'LEGACY' },
        { id: 'map', icon: '🗺️', label: 'MAP' },
        { id: 'quest', icon: '📒', label: 'QUEST' },
    ];

    return (
        <div className="w-full h-full glass crt-scanline p-2 flex items-center justify-between gap-2">
            {menuItems.map((item) => (
                <motion.button
                    key={item.id}
                    onClick={() => handleMenuClick(item.id)}
                    className="flex-1 h-16 flex flex-col items-center justify-center bg-black/40 border border-gunma-accent/30 rounded hover:bg-gunma-accent/10 hover:border-gunma-accent active:scale-95 transition-all text-gunma-text/70 hover:text-white"
                    whileTap={{ scale: 0.95 }}
                >
                    <div className="text-2xl mb-1 filter drop-shadow-[0_0_5px_rgba(57,255,20,0.3)]">
                        {item.icon}
                    </div>
                    <div className="text-[10px] font-bold tracking-widest">
                        {item.label}
                    </div>
                </motion.button>
            ))}
        </div>
    );
};

export default ExplorationDeck;
