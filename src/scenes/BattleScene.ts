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
  private targetText: Phaser.GameObjects.Text | null = null;

  constructor() {
    super({ key: 'BattleScene' });
    this.battleSystem = new BattleSystem();
  }

  preload() {
    this.load.image('enemy_konnyaku', 'assets/enemies/enemy_konnyaku.png');
    this.load.image('enemy_daruma', 'assets/enemies/enemy_daruma.png');
    this.load.image('boss_gunma', 'assets/enemies/boss_gunma_12.png');
    this.load.image('bg_battle', 'assets/backgrounds/bg_akagi_mist.png');
    this.load.image('dice_texture', 'assets/ui/dice_texture.png');
  }

  create() {
    this.cameras.main.setBackgroundColor('#1a1a1a');
    const { width, height } = this.cameras.main;

    // Background
    const bg = this.add.image(width / 2, height / 2, 'bg_battle');
    bg.setDisplaySize(width, height);
    bg.setAlpha(0.6); // Dim background for UI visibility

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
    this.setupTargetDisplay();

    soundManager.playBgm('battle');
  }

  private setupTargetDisplay() {
    const { width } = this.cameras.main;

    // Generate random target (1-6)
    const target = Phaser.Math.Between(1, 6);
    useGameStore.getState().setTargetSymbol(target);

    // Display target indicator
    this.targetText = this.add.text(width / 2, 20, `🎯 TARGET: [ ${target} ]`, {
      fontSize: '18px',
      fontFamily: 'monospace',
      color: '#ff0',
      backgroundColor: 'rgba(0,0,0,0.7)',
      padding: { x: 10, y: 5 }
    }).setOrigin(0.5, 0);

    // Pulsing animation
    this.tweens.add({
      targets: this.targetText,
      scaleX: 1.1,
      scaleY: 1.1,
      duration: 500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  private createEnemySprite() {
    const { width, height } = this.cameras.main;
    const enemyContainer = this.add.container(width / 2, height * 0.35);

    const { battleState } = useGameStore.getState();
    const enemyName = battleState?.enemy?.name || '';
    const enemyId = battleState?.enemy?.id || '';

    // Determine Sprite Key
    let key = 'enemy_konnyaku';
    if (enemyName.includes('ダルマ') || enemyId.includes('daruma')) key = 'enemy_daruma';
    else if (enemyName.includes('赤城') || enemyName.includes('ボス') || enemyName.includes('Gunma') || enemyId.includes('boss')) key = 'boss_gunma';

    // Phase 39: Emergency Fallback - Check if texture exists
    let sprite: Phaser.GameObjects.Sprite | null = null;
    let fallbackDisplay: Phaser.GameObjects.Container | null = null;

    if (this.textures.exists(key)) {
      // Normal: Load sprite
      sprite = this.add.sprite(0, 0, key);

      // Scale to reasonable size (max 200px)
      const maxSize = 200;
      if (sprite.width > maxSize || sprite.height > maxSize) {
        const scale = maxSize / Math.max(sprite.width, sprite.height);
        sprite.setScale(scale);
      }
      enemyContainer.add(sprite);
    } else {
      // Fallback: Missing asset - show placeholder
      console.warn('[PHASE 39] Missing asset:', key);

      fallbackDisplay = this.add.container(0, 0);

      // Red rectangle placeholder
      const placeholder = this.add.graphics();
      placeholder.fillStyle(0x990000, 1);
      placeholder.fillRect(-60, -80, 120, 160);
      placeholder.lineStyle(4, 0xff0000, 1);
      placeholder.strokeRect(-60, -80, 120, 160);

      // Glitch text
      const glitchText = this.add.text(0, -20, 'NO IMAGE', {
        fontSize: '20px',
        fontFamily: 'monospace',
        color: '#00ff00',
        align: 'center'
      }).setOrigin(0.5);

      const glitchText2 = this.add.text(0, 10, '(GLITCH)', {
        fontSize: '16px',
        fontFamily: 'monospace',
        color: '#ff00ff',
        align: 'center'
      }).setOrigin(0.5);

      const enemyLabel = this.add.text(0, 50, enemyName || 'UNKNOWN', {
        fontSize: '14px',
        fontFamily: 'monospace',
        color: '#ffffff',
        align: 'center'
      }).setOrigin(0.5);

      fallbackDisplay.add([placeholder, glitchText, glitchText2, enemyLabel]);
      enemyContainer.add(fallbackDisplay);

      // Log warning to game
      useGameStore.getState().addLog(`> [WARNING] 画像データ破損: ${key}`, 'error');
    }

    // Add CRT glitch effect occasionally (for both sprite and fallback)
    this.time.addEvent({
      delay: 2000,
      callback: () => {
        if (Math.random() > 0.7) {
          if (sprite) {
            sprite.setTint(0xff00ff);
            sprite.setX(Math.random() * 10 - 5);
            this.time.delayedCall(50, () => {
              sprite?.clearTint();
              sprite?.setX(0);
            });
          } else if (fallbackDisplay) {
            fallbackDisplay.setX(Math.random() * 10 - 5);
            this.time.delayedCall(50, () => {
              fallbackDisplay?.setX(0);
            });
          }
        }
      },
      loop: true
    });

    // Hover animation
    this.tweens.add({
      targets: sprite,
      y: -15,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

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
      const dice = this.createSingleDice(startX + i * spacing, height * 0.75, diceSize, i);
      this.slotDice.push(dice);
    }
  }

  private createSingleDice(x: number, y: number, size: number, index: number): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);
    const { reelDeck } = useGameStore.getState();
    const reelConfig = reelDeck[index];

    // Determine color based on reel config
    let bgColor = 0x222222;
    let borderColor = 0x39ff14;
    if (reelConfig) {
      const colorMap: Record<string, number> = {
        'attack': 0xff4444,
        'defense': 0x4444ff,
        'tech': 0xffff44,
      };
      borderColor = colorMap[reelConfig.type] || 0x39ff14;
    }

    const bg = this.add.graphics();
    bg.fillStyle(bgColor, 1);
    bg.fillRoundedRect(-size / 2, -size / 2, size, size, 8);
    bg.lineStyle(3, borderColor, 1);
    bg.strokeRoundedRect(-size / 2, -size / 2, size, size, 8);

    const text = this.add.text(0, 0, '1', {
      fontSize: '40px',
      fontFamily: 'monospace',
      color: `#${borderColor.toString(16).padStart(6, '0')}`,
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Status Icon (Locked/Slippery)
    const statusText = this.add.text(0, -size / 2 - 20, '', {
      fontSize: '24px',
      align: 'center'
    }).setOrigin(0.5);

    // Border Graphics for highlighting (separate from bg)
    const borderGraphics = this.add.graphics();

    container.add([bg, text, statusText, borderGraphics]);
    (container as any).numberText = text;
    (container as any).bg = bg;
    (container as any).statusText = statusText;
    (container as any).borderGraphics = borderGraphics;
    (container as any).size = size;
    (container as any).reelConfig = reelConfig;

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

        this.updateReelVisuals();

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

  private updateReelVisuals() {
    const { reelStatuses } = useGameStore.getState();
    this.slotDice.forEach((dice, index) => {
      const status = reelStatuses[index] || 'normal';
      const statusText = (dice as any).statusText;
      const borderGraphics = (dice as any).borderGraphics;
      const size = (dice as any).size;

      // Clear previous border
      borderGraphics.clear();

      if (status === 'locked') {
        statusText.setText('🔒');
        borderGraphics.lineStyle(4, 0xff0000, 1);
        borderGraphics.strokeRoundedRect(-size / 2, -size / 2, size, size, 8);
      } else if (status === 'slippery') {
        statusText.setText('💧');
        borderGraphics.lineStyle(4, 0x00ffff, 1);
        borderGraphics.strokeRoundedRect(-size / 2, -size / 2, size, size, 8);
      } else {
        statusText.setText('');
        // No extra border for normal state (bg already has green border)
      }
    });
  }

  private startSpinning() {
    if (this.spinTimer) return;

    soundManager.playSe('dice_hit'); // Reuse sound for start

    this.spinTimer = this.time.addEvent({
      delay: 50,
      callback: () => {
        const { reelStatuses } = useGameStore.getState();
        this.slotDice.forEach((dice, index) => {
          // Skip animation if locked
          if (reelStatuses[index] === 'locked') {
            (dice as any).numberText.setText('1');
            return;
          }

          const val = Phaser.Math.Between(1, 6);
          (dice as any).numberText.setText(val.toString());
          // Subtle scale effect
          dice.setScale(1 + Math.random() * 0.1);
        });
      },
      loop: true
    });
  }



  private stopSpinning() {
    if (this.spinTimer) {
      this.spinTimer.destroy();
      this.spinTimer = null;
    }
  }

  public finalizeSlotResults() {
    if (!this.spinTimer) return;

    this.spinTimer.destroy();
    this.spinTimer = null;

    const state = useGameStore.getState();
    const { reelStatuses } = state;
    const results: number[] = this.slotDice.map((dice, index) => {
      const status = reelStatuses[index] || 'normal';
      let val = Phaser.Math.Between(1, 6);

      // Effect Logic
      if (status === 'locked') {
        val = 1;
        state.addFloatingText({
          value: 'LOCKED!',
          x: dice.x,
          y: dice.y - 60,
          type: 'damage' as any
        });
      } else if (status === 'slippery') {
        // Visual flair for slippery
        state.addFloatingText({
          value: 'SLIP!',
          x: dice.x,
          y: dice.y + 40,
          type: 'info' as any
        });
        // Slippery logic is implicitly just RNG, but we add visual confirmation
      }

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

    // Reset statuses after result (Optional: or keep them for a duration? Plan says reset)
    // Actually plan said resetReelStatuses exists. Let's call it after turn or here?
    // Let's reset here so next turn is fresh.
    state.resetReelStatuses();
    state.setDiceResults(results);
    soundManager.playSe('win');
    hapticsManager.heavyImpact(); // Enhanced "juice" on stop

    // Phase 42: Trigger Respect Roulette
    state.setRouletteActive(true);
    // Reset result just in case
    // (Wait, store action sets logic should probably clear it, but let's assume component or store handled it. 
    // Actually store.setRouletteResult(null) might be needed if not auto-cleared. 
    // I'll assume current store setup or component mount clears it. 
    // Wait, component useEffect sets currentNumber=1. Store result persists? 
    // Let's explicitly clear it here if needed, or rely on component to set it only when stopped.
    // Ideally we clear it first.)
    state.setRouletteResult(null as any);

    // Wait for roulette result
    const checkRoulette = this.time.addEvent({
      delay: 100,
      loop: true,
      callback: () => {
        const { rouletteResult } = useGameStore.getState();
        if (rouletteResult !== null) {
          checkRoulette.destroy();
          this.processPlayerAttack(results, rouletteResult);
          state.setSlotState('idle');
        }
      }
    });
  }

  private processPlayerAttack(results: number[], rouletteVal: number = 0) {
    const state = useGameStore.getState();
    const targetSymbol = state.targetSymbol;

    // Check for target match (Sniper Slot bonus)
    const targetMatches = targetSymbol ? results.filter(r => r === targetSymbol).length : 0;
    const hasSniperBonus = targetMatches > 0;

    // Calculate base damage
    let damage = this.battleSystem.processPlayerAttack(results);

    // Phase 42: Apply Respect Roulette Multiplier
    let rouletteMultiplier = 1.0;
    let rouletteMsg = '';

    if (rouletteVal === 6) {
      rouletteMultiplier = 2.0;
      rouletteMsg = 'TRUE RESPECT! (x2)';
      this.cameras.main.shake(300, 0.02);
      this.createLightningEffect(); // Extra flair
    } else if (rouletteVal === 1) {
      rouletteMultiplier = 0.1;
      rouletteMsg = 'BAD TIMING... (x0.1)';
    }

    // Apply multiplier
    damage = Math.floor(damage * rouletteMultiplier);

    if (rouletteVal !== 0) {
      state.addLog(`> ${rouletteMsg}`, rouletteVal === 6 ? 'critical' : 'damage');
    }

    // Apply 2x bonus for target match
    if (hasSniperBonus) {
      const bonusMultiplier = 1 + (targetMatches * 0.5); // +50% per match, so 1 match = 1.5x, 2 = 2x
      damage = Math.floor(damage * bonusMultiplier);

      // Visual feedback for sniper hit
      state.addLog(`> 🎯 TARGET HIT! x${targetMatches} (${Math.round(bonusMultiplier * 100)}% ダメージ)`, 'critical');

      // Flash the target text
      if (this.targetText) {
        this.tweens.add({
          targets: this.targetText,
          scaleX: 1.5,
          scaleY: 1.5,
          duration: 100,
          yoyo: true,
          repeat: 2
        });
      }
    }

    // Check for critical based on results
    const isAllSame = results.length > 1 && results.every(r => r === results[0]);
    const hasSixMatch = results.filter(r => r === 6).length >= 2;

    this.triggerHitFlash();

    const enemyX = this.enemySprite?.x || 0;
    const enemyY = this.enemySprite?.y || 0;

    state.addFloatingText({
      value: damage,
      x: enemyX,
      y: enemyY,
      type: (isAllSame || hasSixMatch || hasSniperBonus) ? 'critical' : 'damage'
    });

    if (isAllSame || hasSixMatch) {
      state.triggerCriticalFlash();
      hapticsManager.heavyImpact();
      this.createLightningEffect();
    } else if (hasSniperBonus) {
      hapticsManager.heavyImpact();
    } else {
      hapticsManager.mediumImpact();
    }

    // Generate new target for next turn
    const newTarget = Phaser.Math.Between(1, 6);
    state.setTargetSymbol(newTarget);
    if (this.targetText) {
      this.targetText.setText(`🎯 TARGET: [ ${newTarget} ]`);
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
