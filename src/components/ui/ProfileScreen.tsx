import { motion } from 'framer-motion';
import { useGameStore } from '../../stores/gameStore';
import { soundManager } from '../../systems/SoundManager';
import { hapticsManager } from '../../systems/HapticsManager';
import titlesData from '../../assets/data/titles.json';

interface ProfileScreenProps {
    isOpen: boolean;
    onClose: () => void;
}

interface TitleData {
    id: string;
    name: string;
    desc: string;
    condition: string;
}

const ProfileScreen = ({ isOpen, onClose }: ProfileScreenProps) => {
    const { playerName, titles, currentTitle, setCurrentTitle, stats } = useGameStore();

    if (!isOpen) return null;

    const allTitles = titlesData.titles as TitleData[];
    const currentTitleData = allTitles.find((t) => t.id === currentTitle);

    // Calculate Gunma Aptitude (群馬適性)
    const aptitude = Math.min(
        100,
        Math.floor((stats.totalSteps * 0.5 + stats.enemiesDefeated * 2 + titles.length * 10) % 101)
    );

    const handleTitleSelect = (titleId: string) => {
        if (titles.includes(titleId)) {
            setCurrentTitle(currentTitle === titleId ? null : titleId);
            soundManager.playSe('equip');
            hapticsManager.lightImpact();
        }
    };

    return (
        <div className="fixed inset-0 z-[90] bg-black/90 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="w-full max-w-2xl bg-gradient-to-br from-gray-900 to-black border-2 border-gunma-accent rounded-lg p-6 shadow-[0_0_30px_rgba(57,255,20,0.3)]"
            >
                {/* Header */}
                <div className="flex justify-between items-center mb-6 border-b border-gunma-accent/30 pb-4">
                    <h2 className="text-2xl font-black text-gunma-accent font-mono">PROFILE</h2>
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

                {/* Player Card */}
                <div className="bg-black/60 border-2 border-gunma-accent/50 rounded-lg p-6 mb-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-xs text-gray-500 mb-1">NAME</p>
                            <p className="text-xl font-bold text-white">{playerName}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 mb-1">TITLE</p>
                            <p className="text-lg text-gunma-accent">
                                {currentTitleData ? `『${currentTitleData.name}』` : '---'}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 mb-1">GUNMA APTITUDE</p>
                            <div className="flex items-baseline gap-2">
                                <p className="text-3xl font-black text-gunma-accent">{aptitude}</p>
                                <span className="text-gray-500">%</span>
                            </div>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 mb-1">TITLES UNLOCKED</p>
                            <p className="text-2xl font-bold text-white">{titles.length} / {allTitles.length}</p>
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="bg-black/40 border border-gunma-accent/30 rounded p-4 mb-6">
                    <p className="text-xs text-gray-500 mb-3">STATISTICS</p>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-400">Deaths:</span>
                            <span className="text-white font-mono">{stats.totalDeaths}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-400">Steps:</span>
                            <span className="text-white font-mono">{stats.totalSteps}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-400">Enemies:</span>
                            <span className="text-white font-mono">{stats.enemiesDefeated}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-400">Konnyaku:</span>
                            <span className="text-white font-mono">{stats.konnyakuEaten}</span>
                        </div>
                    </div>
                </div>

                {/* Titles List */}
                <div>
                    <p className="text-sm text-gray-400 mb-3 uppercase tracking-wide">Available Titles</p>
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                        {allTitles.map((title) => {
                            const isUnlocked = titles.includes(title.id);
                            const isEquipped = currentTitle === title.id;

                            return (
                                <motion.button
                                    key={title.id}
                                    onClick={() => handleTitleSelect(title.id)}
                                    disabled={!isUnlocked}
                                    whileHover={isUnlocked ? { scale: 1.02 } : {}}
                                    whileTap={isUnlocked ? { scale: 0.98 } : {}}
                                    className={`w-full text-left p-3 rounded border-2 transition-all ${isEquipped
                                            ? 'bg-gunma-accent/20 border-gunma-accent'
                                            : isUnlocked
                                                ? 'bg-black/40 border-gray-700 hover:border-gunma-accent/50'
                                                : 'bg-black/20 border-gray-800 opacity-50 cursor-not-allowed'
                                        }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <p className={`font-bold ${isUnlocked ? 'text-white' : 'text-gray-600'}`}>
                                                {isUnlocked ? title.name : '？？？'}
                                            </p>
                                            <p className={`text-xs mt-1 ${isUnlocked ? 'text-gray-400' : 'text-gray-700'}`}>
                                                {isUnlocked ? title.desc : title.condition}
                                            </p>
                                        </div>
                                        {isEquipped && (
                                            <div className="ml-2 text-gunma-accent text-xl">✓</div>
                                        )}
                                    </div>
                                </motion.button>
                            );
                        })}
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default ProfileScreen;
