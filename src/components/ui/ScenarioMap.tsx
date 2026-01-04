import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../stores/gameStore';
import { soundManager } from '../../systems/SoundManager';
import chapter1Data from '../../assets/data/chapter1.json';

interface ScenarioNode {
    id: string;
    type: 'story' | 'enemy';
    title: string;
    description: string;
    next: string | null;
}

const ScenarioMap = () => {
    const { isScenarioMapOpen, setScenarioMapOpen, visitedNodes, currentScenarioId } = useGameStore();

    const scenarios: ScenarioNode[] = chapter1Data.chapter1 as ScenarioNode[];

    const handleClose = () => {
        soundManager.playSe('menu_close');
        setScenarioMapOpen(false);
    };

    if (!isScenarioMapOpen) return null;

    const getNodeStatus = (id: string): 'current' | 'visited' | 'locked' => {
        if (id === currentScenarioId) return 'current';
        if (visitedNodes.includes(id)) return 'visited';
        return 'locked';
    };

    const getEndingIcon = (type: string, next: string | null) => {
        if (next === null) return '🏆'; // True ending
        if (type === 'enemy') return '⚔️';
        return '📖';
    };

    return (
        <AnimatePresence>
            {isScenarioMapOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex flex-col bg-black/95 backdrop-blur-md"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-gunma-accent/30 bg-black/80">
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">📊</span>
                            <h2 className="text-xl font-bold text-gunma-accent tracking-wider">SCENARIO CHART</h2>
                        </div>
                        <button
                            onClick={handleClose}
                            className="w-10 h-10 flex items-center justify-center border border-gunma-accent/50 rounded-full hover:bg-gunma-accent/20"
                        >
                            ✕
                        </button>
                    </div>

                    {/* Map Content */}
                    <div className="flex-1 overflow-y-auto p-4 log-scrollbar">
                        <div className="space-y-1">
                            {scenarios.map((node, index) => {
                                const status = getNodeStatus(node.id);
                                const icon = getEndingIcon(node.type, node.next);

                                return (
                                    <motion.div
                                        key={node.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className={`relative flex items-start gap-3 p-3 rounded border transition-colors
                                            ${status === 'current'
                                                ? 'border-gunma-magenta bg-gunma-magenta/20 shadow-[0_0_15px_rgba(255,0,255,0.3)]'
                                                : status === 'visited'
                                                    ? 'border-gunma-accent/50 bg-gunma-accent/10'
                                                    : 'border-gray-700 bg-gray-900/50 opacity-50'}`}
                                    >
                                        {/* Connector Line */}
                                        {index < scenarios.length - 1 && (
                                            <div className={`absolute left-6 top-full w-0.5 h-1 
                                                ${status !== 'locked' ? 'bg-gunma-accent' : 'bg-gray-700'}`}
                                            />
                                        )}

                                        {/* Icon */}
                                        <div className={`w-8 h-8 flex items-center justify-center text-lg rounded-full shrink-0
                                            ${status === 'current'
                                                ? 'bg-gunma-magenta text-white animate-pulse'
                                                : status === 'visited'
                                                    ? 'bg-gunma-accent/20 text-gunma-accent'
                                                    : 'bg-gray-800 text-gray-500'}`}
                                        >
                                            {status === 'locked' ? '🔒' : icon}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className={`font-bold text-sm 
                                                ${status === 'locked' ? 'text-gray-500' : 'text-white'}`}>
                                                {status === 'locked' ? '??? LOCKED ???' : node.title}
                                            </div>
                                            <div className={`text-xs mt-0.5 truncate
                                                ${status === 'locked' ? 'text-gray-600' : 'text-gray-400'}`}>
                                                {status === 'locked' ? '未到達のシナリオ' : node.description}
                                            </div>
                                        </div>

                                        {/* Status Badge */}
                                        {status === 'current' && (
                                            <div className="text-[10px] bg-gunma-magenta text-white px-2 py-0.5 rounded font-bold animate-pulse">
                                                NOW
                                            </div>
                                        )}
                                    </motion.div>
                                );
                            })}
                        </div>

                        {/* Legend */}
                        <div className="mt-6 p-3 border border-gray-700 rounded bg-black/50">
                            <div className="text-xs text-gray-500 font-mono mb-2">LEGEND</div>
                            <div className="flex flex-wrap gap-4 text-xs">
                                <div className="flex items-center gap-1">
                                    <div className="w-3 h-3 bg-gunma-magenta rounded-full animate-pulse" />
                                    <span className="text-gray-400">Current</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <div className="w-3 h-3 bg-gunma-accent/50 rounded-full" />
                                    <span className="text-gray-400">Visited</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <div className="w-3 h-3 bg-gray-700 rounded-full" />
                                    <span className="text-gray-400">Locked</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ScenarioMap;
