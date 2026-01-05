import { useGameStore } from '../stores/gameStore';
import { scenarioManager } from './ScenarioManager';
import { soundManager } from './SoundManager';

export class DebugAutomation {
    private isRunning: boolean = false;
    private intervalId: number | null = null;
    private stepCount: number = 0;
    private maxSteps: number = 100; // Safety brake

    startChapter1TestBatch() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.stepCount = 0;
        console.log('🚀 [DebugAutomation] Starting Chapter 1 Test Batch...');

        // Force start from beginning
        useGameStore.getState().startNewGame();
        useGameStore.getState().setMode('exploration');

        // Start loop
        this.intervalId = window.setInterval(() => this.processStep(), 1500);
    }

    stop() {
        this.isRunning = false;
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        console.log('🛑 [DebugAutomation] Test Batch Stopped.');
    }

    private processStep() {
        if (!this.isRunning) return;
        this.stepCount++;

        if (this.stepCount > this.maxSteps) {
            console.warn('⚠️ [DebugAutomation] Max steps reached. Stopping.');
            this.stop();
            return;
        }

        const state = useGameStore.getState();
        const { currentMode, currentCard, battleState } = state;

        console.log(`[DebugAutomation] Step ${this.stepCount}: Mode=${currentMode}, Card=${currentCard?.id || 'null'}`);

        // 1. Victory Screen / Game Over
        if (currentMode === 'victory' || currentMode === 'gameover') {
            console.log('  -> Victory/GameOver screen detected. Clicking through...');
            // Simulate click
            // Usually these screens have a "next" or "restart" action.
            // Victory screen usually returns to exploration automatically or via click.
            // We can force mode back to exploration if stuck, or trigger the cleanup.

            // If victory, usually we want to proceed.
            if (currentMode === 'victory') {
                // Force exploration if it doesn't happen automatically
                useGameStore.getState().setMode('exploration');
            }
            return;
        }

        // 2. Battle Mode
        if (currentMode === 'battle') {
            if (battleState && battleState.enemy && battleState.enemy.hp > 0) {
                console.log(`  -> Battle Mode: Fighting ${battleState.enemy.name}. FORCING VICTORY.`);

                // Instant Kill

                // Apply massive damage to enemy
                useGameStore.setState(prev => {
                    if (!prev.battleState || !prev.battleState.enemy) return prev;
                    return {
                        battleState: {
                            ...prev.battleState,
                            enemy: {
                                ...prev.battleState.enemy,
                                hp: 0
                            }
                        }
                    };
                });

                // Trigger victory logic via ScenarioManager or BattleSystem
                // Since we can't easily access the private battleSystem instance inside BattleScene, 
                // we'll use the callback exposed in BattleSystem or just rely on the store update if there's a listener.
                // But ScenarioManager has an 'onBattleVictory'.

                setTimeout(() => {
                    scenarioManager.onBattleVictory(battleState.enemy!.id);
                    useGameStore.getState().setMode('victory'); // Show victory screen briefly
                    soundManager.playSe('win');
                }, 500);
            }
            return;
        }

        // 3. Exploration Mode
        if (currentMode === 'exploration') {
            if (!currentCard) {
                console.log('  -> No current card. Loading scenario...');
                scenarioManager.loadCurrentScenario();
                return;
            }

            console.log(`  -> Swiping card: ${currentCard.id}`);
            // Swipe Right for everything in Chapter 1 (linear story)
            scenarioManager.processCardAction(currentCard, 'right');

            // Check if we finished
            if (currentCard.id === 'c1_ending') {
                console.log('🎉 [DebugAutomation] Chapter 1 Completed Successfully!');
                this.stop();
            }
        }
    }
}

export const debugAuto = new DebugAutomation();
