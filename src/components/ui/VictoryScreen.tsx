import { motion } from 'framer-motion';
import { useGameStore } from '../../stores/gameStore';
import { usePlayerStore } from '../../stores/playerStore';
import { soundManager } from '../../systems/SoundManager';
import { hapticsManager } from '../../systems/HapticsManager';
import ShareToX from './ShareButtons';

const VictoryScreen = () => {
    const { setMode, currentScenarioId } = useGameStore();
    const { hp, maxHp } = usePlayerStore();

    // Determine chapter name based on scenario
    const getChapterName = () => {
        if (currentScenarioId?.startsWith('c1_')) return '第1章「赤城の霧」';
        if (currentScenarioId?.startsWith('c2_')) return '第2章「妙義の試練」';
        if (currentScenarioId?.startsWith('c3_')) return '第3章「草津の秘湯」';
        return 'チャプター';
    };

    const chapterName = getChapterName();
    const hpPercent = Math.round((hp / maxHp) * 100);

    const shareText = `${chapterName}を突破した！残りHP: ${hp}/${maxHp} (${hpPercent}%) グンマーから逃げ出すことはできるのか...!?`;

    const handleContinue = () => {
        soundManager.playSe('button_click');
        hapticsManager.lightImpact();
        setMode('exploration');
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
        >
            <div className="text-center p-8">
                {/* Victory Animation */}
                <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', damping: 10, stiffness: 100 }}
                    className="mb-8"
                >
                    <div className="text-8xl mb-4">🏆</div>
                </motion.div>

                {/* Title */}
                <motion.h1
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-4xl font-bold text-gunma-accent font-mono mb-4"
                    style={{
                        textShadow: '0 0 20px rgba(57, 255, 20, 0.5), 0 0 40px rgba(57, 255, 20, 0.3)',
                    }}
                >
                    CHAPTER CLEAR!
                </motion.h1>

                {/* Chapter Name */}
                <motion.div
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-xl text-gunma-text mb-6"
                >
                    {chapterName}
                </motion.div>

                {/* Stats */}
                <motion.div
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    className="bg-gunma-konnyaku/50 border border-gunma-accent/30 rounded-lg p-4 mb-8 inline-block"
                >
                    <div className="text-gunma-accent font-mono">
                        残りHP: <span className="text-2xl font-bold">{hp}</span>/{maxHp}
                    </div>
                    <div className="text-sm text-gunma-text/70 mt-1">
                        生存率: {hpPercent}%
                    </div>
                </motion.div>

                {/* Action Buttons */}
                <motion.div
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.9 }}
                    className="flex flex-col gap-4 items-center"
                >
                    {/* Share Button */}
                    <ShareToX
                        text={shareText}
                        hashtags={['GunmaEscape', 'グンマーから逃げられない']}
                    />

                    {/* Continue Button */}
                    <button
                        onClick={handleContinue}
                        className="px-8 py-4 bg-gunma-accent text-black font-bold rounded-lg
                       hover:bg-gunma-accent/80 active:scale-95 transition-all duration-150
                       shadow-lg shadow-gunma-accent/30"
                    >
                        次のチャプターへ →
                    </button>
                </motion.div>

                {/* Decorative Elements */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2 }}
                    className="mt-8 text-gunma-accent/50 text-sm font-mono"
                >
                    ※ グンマーはまだまだ続く...
                </motion.div>
            </div>
        </motion.div>
    );
};

export default VictoryScreen;
