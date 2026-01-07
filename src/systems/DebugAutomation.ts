import { useGameStore } from '../stores/gameStore';
import { scenarioManager } from './ScenarioManager';
import { soundManager } from './SoundManager';

export class DebugAutomation {
    private isRunning: boolean = false;
    private intervalId: number | null = null;
    private stepCount: number = 0;
    private maxSteps: number = 500; // Increased limit
    private battleTurnWait: number = 0;

    startChapter1TestBatch() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.stepCount = 0;
        this.battleTurnWait = 0;
        console.log('🚀 [DebugAutomation] Starting Chapter 1 Test Batch (Full Simulation)...');

        // Force start from beginning
        useGameStore.getState().startNewGame();
        useGameStore.getState().setMode('exploration');

        // Start loop
        // We use a faster interval but handle logic states carefully
        this.intervalId = window.setInterval(() => this.processStep(), 1000);
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
        const { currentMode, currentCard, battleState, slotState } = state;

        console.log(`[DebugAutomation] Step ${this.stepCount}: Mode=${currentMode}, Card=${currentCard?.id || 'null'}, Slot=${slotState}`);

        // 1. Victory Screen / Game Over
        if (currentMode === 'victory' || currentMode === 'gameover') {
            console.log('  -> End screen detected. Returning to exploration...');
            if (currentMode === 'victory') {
                useGameStore.getState().setMode('exploration');
            } else {
                // Game Over - restart?
                console.warn('  -> GAME OVER DETECTED. Restarting...');
                this.stop();
                this.startChapter1TestBatch();
            }
            return;
        }

        // 2. Battle Mode (REAL SIMULATION)
        if (currentMode === 'battle') {
            if (!battleState?.isActive || !battleState.enemy) {
                console.warn('  -> Battle mode active but state invalid??');
                return;
            }

            if (this.battleTurnWait > 0) {
                this.battleTurnWait--;
                return;
            }

            // Player Turn Logic
            if (battleState.turn === 'player') {
                if (slotState === 'idle') {
                    console.log('  -> Battle: Starting Spin...');
                    // Simulate Start Button
                    useGameStore.getState().setSlotState('spinning');
                    soundManager.playSe('dice_hit');
                    this.battleTurnWait = 1; // Wait 1s (1 tick)
                } else if (slotState === 'spinning') {
                    console.log('  -> Battle: Stopping Spin...');
                    // Simulate Stop Button with a Good Roll (4, 5, or 6)
                    const goodRoll = [4, 5, 6][Math.floor(Math.random() * 3)];

                    // Direct Store Update (Simulate ControlDeck)
                    // We need to set state to stopped AND set the dice value
                    useGameStore.getState().triggerAttack(goodRoll);

                    console.log(`  -> Rolled: ${goodRoll}`);
                    soundManager.playSe('button_click');

                    // Wait for animation/turn process
                    this.battleTurnWait = 3;
                } else if (slotState === 'stopped') {
                    // Waiting for BattleScene to resolve...
                    console.log('  -> Battle: Waiting for resolution...');
                }
            } else {
                console.log('  -> Enemie\'s Turn. Waiting...');
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

            console.log(`  -> Processing Card: ${currentCard.id} (${currentCard.type})`);

            // Decision Logic
            let direction: 'left' | 'right' = 'right';

            // Always fight enemies in this test batch
            if (currentCard.type === 'enemy') {
                console.log('  -> Enemy Encounter! Choosing FIGHT (Right).');
                direction = 'right';
            }
            // Story/Event: Right usually continues
            else {
                direction = 'right';
            }

            // Execute Swipe
            scenarioManager.processCardAction(currentCard, direction);

            // Check completion
            if (currentCard.id === 'c1_ending') {
                console.log('🎉 [DebugAutomation] Chapter 1 Completed Successfully!');
                this.stop();
            }
        }
    }
}

export const debugAuto = new DebugAutomation();
