import { useGameStore } from '../../stores/gameStore';

const SCENARIO_ORDER = [
    'c1_01_intro',
    'c1_02_realization',
    'c1_03_encounter',
    'c1_04_meet_akagi',
    'c1_05_village',
    'c1_06_bandit_rumor',
    'c1_07_daruma_encounter',
    'c1_08_boss_approach',
    'c1_boss_battle',
    'c1_ending'
];

const ProgressBar = () => {
    const { currentScenarioId, isTitleVisible } = useGameStore();

    if (isTitleVisible || !currentScenarioId) return null;

    const currentIndex = SCENARIO_ORDER.indexOf(currentScenarioId);
    // If not found (e.g. unknown ID), default to 0. If completed (ending), max.
    const progressIndex = currentIndex === -1 ? 0 : currentIndex;
    const progressPercent = (progressIndex / (SCENARIO_ORDER.length - 1)) * 100;

    return (
        <div className="absolute bottom-0 left-0 w-full z-30 pointer-events-none flex justify-center px-4 pb-1">
            <div className="w-full max-w-md h-2 bg-gray-800 rounded-full border border-gunma-accent/30 relative mt-2">
                {/* Fill */}
                <div
                    className="h-full bg-gunma-accent rounded-full transition-all duration-500 shadow-[0_0_5px_#39ff14]"
                    style={{ width: `${progressPercent}%` }}
                />

                {/* Icons */}
                {/* Start */}
                <div className="absolute -top-1 -left-1 w-4 h-4 bg-gray-900 border border-gunma-accent rounded-full flex items-center justify-center text-[8px] text-white">S</div>

                {/* Boss (Skull) */}
                <div className="absolute -top-2 -right-2 text-sm drop-shadow-[0_0_5px_rgba(255,0,0,0.8)] filter grayscale-[0.5]">
                    💀
                </div>

                {/* Middle Event (Example: Village) */}
                <div className="absolute -top-1 left-[45%] w-1 h-3 bg-gray-600" />

                {/* Current Position Indicator */}
                <div
                    className="absolute -top-3 w-6 h-6 flex items-center justify-center transition-all duration-500"
                    style={{ left: `calc(${progressPercent}% - 12px)` }}
                >
                    <span className="text-lg filter drop-shadow-[0_0_2px_#39ff14]">🏃</span>
                </div>
            </div>
        </div>
    );
};

export default ProgressBar;
