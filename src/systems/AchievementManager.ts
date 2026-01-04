import { useGameStore } from '../stores/gameStore';
import titlesData from '../assets/data/titles.json';

interface TitleData {
    id: string;
    name: string;
    desc: string;
    condition: string;
}

class AchievementManager {
    private static instance: AchievementManager;

    private constructor() {
        // Private constructor for singleton
    }

    public static getInstance(): AchievementManager {
        if (!AchievementManager.instance) {
            AchievementManager.instance = new AchievementManager();
        }
        return AchievementManager.instance;
    }

    /**
     * Check all achievements and unlock any that meet their conditions
     */
    public checkAchievements(): void {
        const store = useGameStore.getState();
        const { stats, titles: unlockedTitles } = store;

        (titlesData.titles as TitleData[]).forEach((title) => {
            // Skip if already unlocked
            if (unlockedTitles.includes(title.id)) return;

            // Evaluate condition
            if (this.evaluateCondition(title.condition, stats)) {
                this.unlockTitle(title.id);
            }
        });
    }

    /**
     * Evaluate a condition string against current stats
     */
    private evaluateCondition(
        condition: string,
        stats: { totalDeaths: number; totalSteps: number; konnyakuEaten: number; enemiesDefeated: number }
    ): boolean {
        try {
            // Simple condition parser (e.g., "totalDeaths >= 1")
            const match = condition.match(/(\w+)\s*(>=|<=|>|<|==)\s*(\d+)/);
            if (!match) return false;

            const [, statName, operator, valueStr] = match;
            const statValue = stats[statName as keyof typeof stats];
            const targetValue = parseInt(valueStr, 10);

            if (statValue === undefined) return false;

            switch (operator) {
                case '>=':
                    return statValue >= targetValue;
                case '<=':
                    return statValue <= targetValue;
                case '>':
                    return statValue > targetValue;
                case '<':
                    return statValue < targetValue;
                case '==':
                    return statValue === targetValue;
                default:
                    return false;
            }
        } catch (error) {
            console.error('Failed to evaluate condition:', condition, error);
            return false;
        }
    }

    /**
     * Unlock a title and show notification
     */
    public unlockTitle(titleId: string): void {
        const store = useGameStore.getState();
        const titleData = (titlesData.titles as TitleData[]).find((t) => t.id === titleId);

        if (!titleData) {
            console.warn('Title not found:', titleId);
            return;
        }

        // Add to store
        store.addTitle(titleId);

        // Show toast notification
        store.addLog(`> 🏆 称号獲得: 『${titleData.name}』`, 'victory');
        store.addFloatingText({
            value: `🏆 ${titleData.name}`,
            x: window.innerWidth / 2,
            y: window.innerHeight / 3,
            type: 'gold_critical',
        });
    }

    /**
     * Convenience method to check achievements after a stat change
     */
    public onStatChange(): void {
        // Slight delay to ensure state is updated
        setTimeout(() => this.checkAchievements(), 100);
    }
}

export const achievementManager = AchievementManager.getInstance();
