import Phaser from 'phaser';
import { useGameStore } from '../stores/gameStore';
import { BattleSystem } from '../systems/BattleSystem';
import { soundManager } from '../systems/SoundManager';
import { hapticsManager } from '../systems/HapticsManager';

export class BattleScene extends Phaser.Scene {
  private slotDice: Phaser.GameObjects.Container[] = [];
  private battleSystem: BattleSystem;
  private enemyInfoText: Phaser.GameObjects.Text | null = null;
  private enemySprite: Phaser.GameObjects.Container | null = null;
  private sparkParticles: Phaser.GameObjects.Particles.ParticleEmitter | null = null;
  private isProcessingTurn: boolean = false;
  private spinTimer: Phaser.Time.TimerEvent | null = null;

  constructor() {
    super({ key: 'BattleScene' });
    this.battleSystem = new BattleSystem();
  }

  create() {
    this.cameras.main.setBackgroundColor('#1a1a1a');
    const { width, height } = this.cameras.main;

    // Create particle texture
    const graphics = this.add.graphics();
    graphics.fillStyle(0xffffff);
    graphics.fillCircle(0, 0, 4);
    graphics.generateTexture('particle', 8, 8);
    graphics.destroy();

    // Setup particles for impact
    this.sparkParticles = this.add.particles(0, 0, 'particle', {
      scale: { start: 0.8, end: 0 },
      speed: { min: 50, max: 150 },
      angle: { min: 0, max: 360 },
      lifespan: 300,
      tint: 0x39ff14,
      blendMode: 'ADD',
      frequency: -1,
    });

    this.createEnemySprite();
    this.updateDiceCount();
    this.setupStoreListener();
    this.updateEnemyInfo();

    soundManager.playBgm('battle');

    this.add.text(width / 2, height * 0.9, '[たたかう]ボタンでスロット開始', {
      fontSize: '14px',
      fontFamily: 'monospace',
      color: '#39ff14',
    }).setOrigin(0.5);
  }

  private createEnemySprite() {
    const { width, height } = this.cameras.main;
    const enemyContainer = this.add.container(width / 2, height * 0.35);

    // Simple enemy representation
    const enemyBody = this.add.graphics();
    enemyBody.fillStyle(0x333333, 1);
    enemyBody.fillCircle(0, 0, 60);
    enemyBody.lineStyle(3, 0x39ff14, 1);
    enemyBody.strokeCircle(0, 0, 60);

    const eye1 = this.add.graphics();
    eye1.fillStyle(0xff0000, 1);
    eye1.fillCircle(-25, -15, 8);

    const eye2 = this.add.graphics();
    eye2.fillStyle(0xff0000, 1);
    eye2.fillCircle(25, -15, 8);

    enemyContainer.add([enemyBody, eye1, eye2]);
    this.enemySprite = enemyContainer;
  }

  private updateDiceCount() {
    const { width, height } = this.cameras.main;
    const { playerDiceCount } = useGameStore.getState();

    // Clear existing dice
    this.slotDice.forEach(d => d.destroy());
    this.slotDice = [];

    const diceSize = 80; // Larger size as requested
    const spacing = 100;
    const totalWidth = (playerDiceCount - 1) * spacing;
    const startX = width / 2 - totalWidth / 2;

    for (let i = 0; i < playerDiceCount; i++) {
      // Adjusted Y position to 0.75 to be lower and avoid overlap with enemy
      const dice = this.createSingleDice(startX + i * spacing, height * 0.75, diceSize);
      this.slotDice.push(dice);
    }
  }

  private createSingleDice(x: number, y: number, size: number): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);

    const bg = this.add.graphics();
    bg.fillStyle(0x222222, 1);
    bg.fillRoundedRect(-size / 2, -size / 2, size, size, 8);
    bg.lineStyle(3, 0x39ff14, 1);
    bg.strokeRoundedRect(-size / 2, -size / 2, size, size, 8);

    const text = this.add.text(0, 0, '1', {
      fontSize: '40px',
      fontFamily: 'monospace',
      color: '#39ff14',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    container.add([bg, text]);
    (container as any).numberText = text;
    (container as any).bg = bg;

    return container;
  }

  private setupStoreListener() {
    this.time.addEvent({
      delay: 100,
      callback: () => {
        const state = useGameStore.getState();
        const { slotState, battleState, currentMode } = state;

        // CRITICAL FIX: Sticky Enemy
        // If mode is not battle, force cleanup everything immediately
        if (currentMode !== 'battle') {
          this.cleanupScene();
          return;
        }

        if (!battleState?.isActive) return;

        // Sync dice count if changed
        if (state.playerDiceCount !== this.slotDice.length) {
          this.updateDiceCount();
        }

        if (slotState === 'spinning') {
          if (!this.spinTimer) {
            this.startSpinning();
          }
        } else if (slotState === 'stopped') {
          // If we just entered stopped state and haven't finalized yet (spinTimer exists), do it.
          // However, React sets 'stopped' immediately.
          // We need to detect the transition or just check if we are spinning.
          if (this.spinTimer) {
            this.finalizeSlotResults();
          }
        } else if (slotState === 'idle' && this.spinTimer) {
          this.stopSpinning();
        }

        if (battleState.turn === 'enemy' && !this.isProcessingTurn) {
          this.isProcessingTurn = true;
          this.time.delayedCall(1000, () => {
            this.processEnemyTurn();
            this.isProcessingTurn = false;
          });
        }

        // Keep enemy info updated
        this.updateEnemyInfo();

        // Handle battle end
        const result = this.battleSystem.checkBattleEnd();
        if (result && battleState.turn !== 'enemy') {
          this.handleBattleEnd(result);
        }
      },
      loop: true
    });
  }

  private startSpinning() {
    if (this.spinTimer) return;

    soundManager.playSe('dice_hit'); // Reuse sound for start

    this.spinTimer = this.time.addEvent({
      delay: 50,
      callback: () => {
        this.slotDice.forEach(dice => {
          const val = Phaser.Math.Between(1, 6);
          (dice as any).numberText.setText(val.toString());
          // Subtle scale effect
          dice.setScale(1 + Math.random() * 0.1);
        });
      },
      loop: true
    });
  }

  public finalizeSlotResults() {
    if (!this.spinTimer) return;

    this.spinTimer.destroy();
    this.spinTimer = null;

    const state = useGameStore.getState();
    const results: number[] = this.slotDice.map(dice => {
      const val = Phaser.Math.Between(1, 6);
      (dice as any).numberText.setText(val.toString());
      dice.setScale(1.2);
      this.tweens.add({
        targets: dice,
        scale: 1,
        duration: 200,
        ease: 'Back.out'
      });

      // Impact effect
      this.sparkParticles?.setPosition(dice.x, dice.y);
      this.sparkParticles?.explode(10);

      // Individual dice popup
      state.addFloatingText({
        value: val,
        x: dice.x,
        y: dice.y - 40,
        type: 'info' as any
      });

      return val;
    });

    state.setDiceResults(results);
    soundManager.playSe('win');
    hapticsManager.mediumImpact();

    // Process damage after a short delay so player can see the dice
    this.time.delayedCall(800, () => {
      this.processPlayerAttack(results);
      state.setSlotState('idle');
    });
  }

  private stopSpinning() {
    if (this.spinTimer) {
      this.spinTimer.destroy();
      this.spinTimer = null;
    }
  }

  private processPlayerAttack(results: number[]) {
    const damage = this.battleSystem.processPlayerAttack(results);

    // Check for critical based on results
    const isAllSame = results.length > 1 && results.every(r => r === results[0]);
    const hasSixMatch = results.filter(r => r === 6).length >= 2;

    this.triggerHitFlash();

    const enemyX = this.enemySprite?.x || 0;
    const enemyY = this.enemySprite?.y || 0;

    useGameStore.getState().addFloatingText({
      value: damage,
      x: enemyX,
      y: enemyY,
      type: (isAllSame || hasSixMatch) ? 'critical' : 'damage'
    });

    if (isAllSame || hasSixMatch) {
      useGameStore.getState().triggerCriticalFlash();
      hapticsManager.heavyImpact();
      this.createLightningEffect();
    } else {
      hapticsManager.mediumImpact();
    }
  }

  private triggerHitFlash() {
    if (!this.enemySprite) return;
    this.tweens.add({
      targets: this.enemySprite,
      alpha: { from: 1, to: 0.3 },
      duration: 50,
      yoyo: true,
      repeat: 2
    });
  }

  private createLightningEffect() {
    const { width, height } = this.cameras.main;
    const lightning = this.add.graphics();
    lightning.lineStyle(4, 0x39ff14, 1);
    lightning.beginPath();
    lightning.moveTo(width / 2, 0);

    for (let i = 1; i < 5; i++) {
      lightning.lineTo(width / 2 + Phaser.Math.Between(-50, 50), height * 0.2 * i);
    }
    lightning.lineTo(this.enemySprite?.x || width / 2, this.enemySprite?.y || height / 2);
    lightning.strokePath();
    lightning.setBlendMode('ADD');

    this.tweens.add({
      targets: lightning,
      alpha: 0,
      duration: 300,
      onComplete: () => lightning.destroy()
    });
  }

  private processEnemyTurn() {
    const battleState = this.battleSystem.getCurrentBattleState();
    if (!battleState?.isActive || battleState.turn !== 'enemy') return;

    const damage = this.battleSystem.processEnemyAttack();
    useGameStore.getState().addLog(`> 敵の攻撃! ${damage} ダメージを受けた!`, 'damage');
    useGameStore.getState().triggerScreenShake();

    soundManager.playSe('damage');
    hapticsManager.vibrate();

    // Check battle end
    const result = this.battleSystem.checkBattleEnd();
    if (result) {
      this.time.delayedCall(1000, () => this.handleBattleEnd(result));
    }
  }

  private handleBattleEnd(result: 'victory' | 'defeat') {
    this.battleSystem.endBattle(result);
    if (result === 'victory') {
      soundManager.playSe('win');
      soundManager.playBgm('exploration');
    }
    useGameStore.getState().setSlotState('idle');
  }

  private updateEnemyInfo() {
    const battleState = this.battleSystem.getCurrentBattleState();
    const { width, height } = this.cameras.main;

    if (this.enemyInfoText) this.enemyInfoText.destroy();

    if (battleState?.enemy) {
      this.enemyInfoText = this.add.text(
        width / 2,
        height * 0.1,
        `${battleState.enemy.name}\nHP: ${battleState.enemy.hp}/${battleState.enemy.maxHp}`,
        {
          fontSize: '18px',
          fontFamily: 'monospace',
          color: '#39ff14',
          align: 'center',
          fontStyle: 'bold'
        }
      ).setOrigin(0.5);
    }
  }

  private cleanupScene() {
    this.slotDice.forEach(d => d.destroy());
    this.slotDice = [];
    if (this.enemySprite) {
      this.enemySprite.destroy();
      this.enemySprite = null;
    }
    if (this.enemyInfoText) {
      this.enemyInfoText.destroy();
      this.enemyInfoText = null;
    }
    if (this.spinTimer) {
      this.spinTimer.destroy();
      this.spinTimer = null;
    }
    if (this.sparkParticles) {
      this.sparkParticles.destroy();
      this.sparkParticles = null;
    }
  }

  shutdown() {
    this.cleanupScene();
  }
}
