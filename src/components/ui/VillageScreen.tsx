import { motion } from 'framer-motion';
import { useGameStore } from '../../stores/gameStore';
import { usePlayerStore } from '../../stores/playerStore';
import { soundManager } from '../../systems/SoundManager';
import { hapticsManager } from '../../systems/HapticsManager';

interface VillageScreenProps {
    isOpen: boolean;
    onClose: () => void;
}

const VillageScreen = ({ isOpen, onClose }: VillageScreenProps) => {
    const { addLog, playerLevel } = useGameStore();
    const { heal, maxHp, hp } = usePlayerStore();

    if (!isOpen) return null;

    const handleRest = () => {
        soundManager.playSe('heal');
        hapticsManager.lightImpact();
        heal(maxHp - hp); // Heal to full
        addLog('> 集落で休息した。HPが全回復した。', 'heal');
    };

    const handleTalkToOkinu = () => {
        soundManager.playSe('button_click');
        addLog('> 【オキヌ】「グンマの霧は深い...油断するな」', 'story');
        addLog('> 【オキヌ】「スロットを止めて敵を攻撃するんじゃ」', 'story');
        addLog('> 【オキヌ】「🎯ターゲットを狙うとダメージが上がる」', 'story');
    };

    const handleExplore = () => {
        soundManager.playSe('button_click');
        hapticsManager.lightImpact();
        addLog('> 探索に出発した...', 'info');
        onClose();
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] flex flex-col"
        >
            {/* Background */}
            <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: 'url(/assets/backgrounds/bg_village_tamura.png)' }}
            />
            <div className="absolute inset-0 bg-black/40" />

            {/* Content */}
            <div className="relative flex-1 flex flex-col items-center justify-center p-6">
                {/* Title */}
                <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="text-center mb-8"
                >
                    <h1 className="text-2xl font-black text-gunma-accent mb-2">
                        田村の集落 (Tamura Village)
                    </h1>
                    <p className="text-gray-400 text-sm">安らぎの場所...だが油断は禁物</p>
                </motion.div>

                {/* NPC Display */}
                <div className="flex gap-4 mb-8">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="flex flex-col items-center"
                    >
                        <img
                            src="/assets/npcs/npc_guide_okinu.png"
                            alt="オキヌ"
                            className="w-24 h-32 object-cover rounded-lg border-2 border-gunma-accent/50 shadow-lg"
                        />
                        <span className="text-xs text-gray-400 mt-1">案内人 オキヌ</span>
                    </motion.div>
                </div>

                {/* Actions */}
                <div className="w-full max-w-xs space-y-3">
                    {/* Rest */}
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleRest}
                        disabled={hp === maxHp}
                        className="w-full py-4 bg-gradient-to-r from-green-800 to-green-600 rounded-lg
                     border-2 border-green-400/50 text-white font-bold text-lg
                     shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        💤 休憩 (HP全回復)
                    </motion.button>

                    {/* Talk */}
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleTalkToOkinu}
                        className="w-full py-4 bg-gradient-to-r from-purple-800 to-purple-600 rounded-lg
                     border-2 border-purple-400/50 text-white font-bold text-lg shadow-lg"
                    >
                        💬 案内人と話す
                    </motion.button>

                    {/* Explore */}
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleExplore}
                        className="w-full py-4 bg-gradient-to-r from-gunma-accent/80 to-green-600 rounded-lg
                     border-2 border-gunma-accent text-black font-bold text-lg shadow-lg"
                    >
                        🗡️ 探索に出る
                    </motion.button>
                </div>

                {/* Player Info */}
                <div className="absolute bottom-6 left-6 text-xs text-gray-500 font-mono">
                    Lv.{playerLevel} | HP: {hp}/{maxHp}
                </div>
            </div>
        </motion.div>
    );
};

export default VillageScreen;
