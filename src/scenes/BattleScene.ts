import Phaser from 'phaser';
import { useGameStore } from '../stores/gameStore';
import { BattleSystem } from '../systems/BattleSystem';
import { soundManager } from '../systems/SoundManager';
import { hapticsManager } from '../systems/HapticsManager';

interface DiceSprite extends Phaser.GameObjects.Container {
  body: Phaser.Physics.Arcade.Body;
}

// Configuration constants
const DICE_TIMEOUT_MS = 3000; // Force stop dice after 3 seconds if physics doesn't settle

export class BattleScene extends Phaser.Scene {
  private dice1: DiceSprite | null = null;
  private dice2: DiceSprite | null = null;
  private isRolling: boolean = false;
  // private walls: Phaser.GameObjects.Rectangle[] = [];
  private rollRequestListener: (() => void) | null = null;
  private battleSystem: BattleSystem;
  private currentRoll: 'dice1' | 'dice2' | 'none' = 'none';
  private enemyInfoText: Phaser.GameObjects.Text | null = null;
  private enemySprite: Phaser.GameObjects.Container | null = null;
  private impactParticles: Phaser.GameObjects.Particles.ParticleEmitter | null = null;
  private sparkParticles: Phaser.GameObjects.Particles.ParticleEmitter | null = null;
  private isProcessingEnemyTurn: boolean = false;

  constructor() {
    super({ key: 'BattleScene' });
    this.battleSystem = new BattleSystem();
  }

  create() {
    this.cameras.main.setBackgroundColor('#1a1a1a');

    const { width, height } = this.cameras.main;

    // Create walls for collision
    const wallThickness = 20;
    const topWall = this.add.rectangle(width / 2, -wallThickness / 2, width, wallThickness, 0x39ff14, 0.3);
    const bottomWall = this.add.rectangle(width / 2, height + wallThickness / 2, width, wallThickness, 0x39ff14, 0.3);
    const leftWall = this.add.rectangle(-wallThickness / 2, height / 2, wallThickness, height, 0x39ff14, 0.3);
    const rightWall = this.add.rectangle(width + wallThickness / 2, height / 2, wallThickness, height, 0x39ff14, 0.3);

    this.physics.add.existing(topWall as Phaser.GameObjects.GameObject, true);
    this.physics.add.existing(bottomWall as Phaser.GameObjects.GameObject, true);
    this.physics.add.existing(leftWall as Phaser.GameObjects.GameObject, true);
    this.physics.add.existing(rightWall as Phaser.GameObjects.GameObject, true);

    // this.walls = [topWall, bottomWall, leftWall, rightWall];

    // Create particle texture programmatically
    const graphics = this.add.graphics();
    graphics.fillStyle(0xffffff);
    graphics.fillCircle(0, 0, 4);
    graphics.generateTexture('particle', 8, 8);
    graphics.destroy();

    // Create particle system for impact effects
    this.impactParticles = this.add.particles(0, 0, 'particle', {
      scale: { start: 0.5, end: 0 },
      speed: { min: 20, max: 60 },
      lifespan: 300,
      blendMode: 'ADD',
    });

    this.impactParticles.setVisible(false);

    // Create spark particles
    // Create spark particles
    this.sparkParticles = this.add.particles(0, 0, 'particle', {
      scale: { start: 0.5, end: 0 },
      speed: { min: 30, max: 80 },
      angle: { min: 0, max: 360 },
      lifespan: 200,
      tint: 0x39ff14,
      blendMode: 'ADD',
      frequency: -1,
    });

    // Create enemy sprite
    this.createEnemySprite();

    // Create dice containers
    this.createDice();

    // Listen for dice roll requests from React
    this.setupRollListener();

    // Display enemy info
    this.updateEnemyInfo();

    // Play battle BGM
    soundManager.playBgm('battle');

    // Display instruction
    this.add.text(
      width / 2,
      height * 0.85,
      '右下の[ROLL DICE]ボタンを押してください',
      {
        fontSize: '12px',
        fontFamily: 'monospace',
        color: '#39ff14',
      }
    ).setOrigin(0.5);
  }

  private createEnemySprite() {
    const { width, height } = this.cameras.main;

    // Create placeholder enemy sprite (will be replaced with actual graphics)
    const enemyContainer = this.add.container(width / 2, height * 0.5);

    // Simple enemy representation
    const enemyBody = this.add.graphics();
    enemyBody.fillStyle(0x8b4513, 1); // Brown color for konnyaku monster
    enemyBody.fillCircle(0, 0, 40);
    enemyBody.lineStyle(2, 0x654321, 1);
    enemyBody.strokeCircle(0, 0, 40);

    const eye1 = this.add.graphics();
    eye1.fillStyle(0xff0000, 1);
    eye1.fillCircle(-15, -10, 5);

    const eye2 = this.add.graphics();
    eye2.fillStyle(0xff0000, 1);
    eye2.fillCircle(15, -10, 5);

    enemyContainer.add([enemyBody, eye1, eye2]);
    this.enemySprite = enemyContainer;
  }

  private triggerHitFlash() {
    if (!this.enemySprite) return;

    // Flash red
    this.tweens.add({
      targets: this.enemySprite,
      alpha: { from: 1, to: 0.3 },
      duration: 50,
      yoyo: true,
      repeat: 2,
      ease: 'Power2',
    });

    // Shake
    const originalX = this.enemySprite.x;
    const originalY = this.enemySprite.y;
    this.tweens.add({
      targets: this.enemySprite,
      x: { from: originalX - 5, to: originalX + 5 },
      y: { from: originalY - 5, to: originalY + 5 },
      duration: 100,
      yoyo: true,
      repeat: 2,
      ease: 'Power2',
      onComplete: () => {
        if (this.enemySprite) {
          this.enemySprite.setPosition(originalX, originalY);
        }
      },
    });
  }

  private createPixelArtDice(graphics: Phaser.GameObjects.Graphics, size: number) {
    // Wood texture pattern
    const woodColor = 0x8b6914;
    const darkWood = 0x654321;
    const lightWood = 0xcd853f;

    // Base wood color
    graphics.fillStyle(woodColor, 1);
    graphics.fillRoundedRect(-size / 2, -size / 2, size, size, 4);

    // Wood grain pattern (vertical lines)
    graphics.lineStyle(1, darkWood, 0.5);
    for (let i = -size / 2; i < size / 2; i += 3) {
      graphics.moveTo(i, -size / 2);
      graphics.lineTo(i, size / 2);
    }
    graphics.strokePath();

    // Highlight
    graphics.lineStyle(1, lightWood, 0.3);
    graphics.moveTo(-size / 2, -size / 2);
    graphics.lineTo(size / 2, -size / 2);
    graphics.strokePath();

    // Border
    graphics.lineStyle(2, 0x39ff14, 1);
    graphics.strokeRoundedRect(-size / 2, -size / 2, size, size, 4);
  }

  private createDice() {
    const { width, height } = this.cameras.main;
    const diceSize = 50;
    const spacing = 80;

    // Create dice 1
    const diceContainer1 = this.add.container(width / 2 - spacing, height * 0.3) as DiceSprite;
    const diceGraphics1 = this.add.graphics();
    this.createPixelArtDice(diceGraphics1, diceSize);

    const numberText1 = this.add.text(0, 0, '1', {
      fontSize: '28px',
      fontFamily: 'monospace',
      color: '#000000',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    diceContainer1.add([diceGraphics1, numberText1]);
    this.physics.add.existing(diceContainer1);
    const body1 = diceContainer1.body as Phaser.Physics.Arcade.Body;
    body1.setSize(diceSize, diceSize);
    body1.setBounce(0.3, 0.3);
    body1.setFriction(1.2, 1.2);
    body1.setDrag(400, 400);
    body1.setCollideWorldBounds(true);
    (diceContainer1 as any).numberText = numberText1;
    this.dice1 = diceContainer1;

    // Create dice 2
    const diceContainer2 = this.add.container(width / 2 + spacing, height * 0.3) as DiceSprite;
    const diceGraphics2 = this.add.graphics();
    this.createPixelArtDice(diceGraphics2, diceSize);

    const numberText2 = this.add.text(0, 0, '1', {
      fontSize: '28px',
      fontFamily: 'monospace',
      color: '#000000',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    diceContainer2.add([diceGraphics2, numberText2]);
    this.physics.add.existing(diceContainer2);
    const body2 = diceContainer2.body as Phaser.Physics.Arcade.Body;
    body2.setSize(diceSize, diceSize);
    body2.setBounce(0.3, 0.3);
    body2.setFriction(1.2, 1.2);
    body2.setDrag(400, 400);
    body2.setCollideWorldBounds(true);
    (diceContainer2 as any).numberText = numberText2;
    this.dice2 = diceContainer2;
  }

  private updateEnemyInfo() {
    const battleState = this.battleSystem.getCurrentBattleState();
    const { width, height } = this.cameras.main;

    if (this.enemyInfoText) {
      this.enemyInfoText.destroy();
    }

    if (battleState?.enemy) {
      const enemy = battleState.enemy;
      this.enemyInfoText = this.add.text(
        width / 2,
        height * 0.1,
        `${enemy.name}\nHP: ${enemy.hp}/${enemy.maxHp}`,
        {
          fontSize: '16px',
          fontFamily: 'monospace',
          color: '#39ff14',
          align: 'center',
        }
      ).setOrigin(0.5);
    }
  }

  private setupRollListener() {
    // Poll gameStore for roll requests and battle state
    const checkRollRequest = () => {
      const state = useGameStore.getState();
      const battleState = state.battleState;

      if (!battleState?.isActive) {
        return;
      }

      // Update enemy info
      if (battleState.enemy) {
        this.updateEnemyInfo();
      }

      // Only process dice rolls during player turn
      if (battleState.turn === 'player') {
        if (state.rollDiceRequest && !this.isRolling && this.currentRoll === 'none' && state.diceRollResult === null) {
          // Start rolling first dice
          this.currentRoll = 'dice1';
          this.rollDice(this.dice1!, 'dice1');
          state.clearDiceRollRequest();
        } else if (state.diceRollResult !== null && state.diceRollResult2 === null && !this.isRolling && this.currentRoll === 'none') {
          // First dice done, roll second dice
          this.currentRoll = 'dice2';
          this.rollDice(this.dice2!, 'dice2');
        } else if (state.diceRollResult !== null && state.diceRollResult2 !== null && this.currentRoll === 'none') {
          // Both dice rolled, process attack
          this.processPlayerAttack(state.diceRollResult, state.diceRollResult2);
          // Reset dice results after processing
          useGameStore.setState({ diceRollResult: null, diceRollResult2: null });
        }
      } else if (battleState.turn === 'enemy' && !this.isProcessingEnemyTurn) {
        // Process enemy turn (triggered by Defend or Item commands)
        this.isProcessingEnemyTurn = true;
        this.time.delayedCall(500, () => {
          this.processEnemyTurn();
          this.isProcessingEnemyTurn = false;
        });
      }

      // Check battle end
      const battleResult = this.battleSystem.checkBattleEnd();
      if (battleResult && battleState.turn !== 'enemy') {
        this.handleBattleEnd(battleResult);
      }
    };

    this.rollRequestListener = () => {
      checkRollRequest();
    };

    this.time.addEvent({
      delay: 100,
      callback: this.rollRequestListener,
      loop: true,
    });
  }

  private rollDice(dice: DiceSprite, diceType: 'dice1' | 'dice2') {
    if (this.isRolling) return;

    this.isRolling = true;
    const { width, height } = this.cameras.main;

    // Reset dice position
    dice.setPosition(diceType === 'dice1' ? width / 2 - 80 : width / 2 + 80, height * 0.9);
    dice.setRotation(0);

    // Random initial velocity (reduced for more realistic physics)
    const velocityX = Phaser.Math.Between(-200, 200);
    const velocityY = Phaser.Math.Between(-400, -300);
    const angularVelocity = Phaser.Math.Between(-300, 300);

    const body = dice.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(velocityX, velocityY);
    body.setAngularVelocity(angularVelocity);

    // Add strong damping to ensure dice stops quickly
    body.setDamping(true);
    body.setDrag(500, 500);
    body.setAngularDrag(500);

    // Store reference to dice for collision detection
    (dice as any).isRolling = true;

    // Animate dice rotation and number changes
    let rollCount = 0;
    const rollInterval = this.time.addEvent({
      delay: 100,
      callback: () => {
        if (dice) {
          rollCount++;
          const randomValue = Phaser.Math.Between(1, 6);
          (dice as any).numberText.setText(randomValue.toString());

          // Rotate visual
          dice.setRotation(dice.rotation + 0.5);

          if (rollCount > 20) {
            rollInterval.destroy();
          }
        }
      },
      loop: true,
    });

    // Check when dice stops
    const checkStop = this.time.addEvent({
      delay: 100,
      callback: () => {
        if (!dice) return;

        const body = dice.body as Phaser.Physics.Arcade.Body;
        const speed = Math.abs(body.velocity.x) + Math.abs(body.velocity.y);
        const angularSpeed = Math.abs(body.angularVelocity);

        if (speed < 10 && angularSpeed < 10) {
          // Dice has stopped
          this.onDiceStopped(dice, diceType);
          checkStop.destroy();
          rollInterval.destroy();
          // Create impact particles on stop
          this.createImpactParticles(dice.x, dice.y);
        }
      },
      loop: true,
    });

    // Failsafe: Force stop after timeout if physics doesn't settle
    this.time.delayedCall(DICE_TIMEOUT_MS, () => {
      if (this.isRolling && this.currentRoll !== 'none') {
        console.warn('[BattleScene] Dice timeout - forcing stop');
        checkStop.destroy();
        rollInterval.destroy();
        // Force stop the dice
        body.setVelocity(0, 0);
        body.setAngularVelocity(0);
        this.onDiceStopped(dice, diceType);
        this.createImpactParticles(dice.x, dice.y);
      }
    });
  }

  private onDiceStopped(dice: DiceSprite, diceType: 'dice1' | 'dice2') {
    // Calculate final dice value (random 1-6 for now)
    const diceValue = Phaser.Math.Between(1, 6);
    (dice as any).numberText.setText(diceValue.toString());

    // Send result to React store
    const state = useGameStore.getState();
    if (diceType === 'dice1') {
      // this.dice1Value = diceValue;
      state.setDiceRollResult(diceValue);
    } else {
      // this.dice2Value = diceValue;
      state.setDiceRollResult2(diceValue);
    }

    this.isRolling = false;
    this.currentRoll = 'none';
  }

  private createImpactParticles(x: number, y: number) {
    if (!this.impactParticles || !this.sparkParticles) return;

    // Create spark particles at impact point
    this.sparkParticles.setPosition(x, y);
    this.sparkParticles.explode(8);

    // Play sound and haptic feedback
    soundManager.playSe('dice_hit');
    hapticsManager.lightImpact();
  }

  private processPlayerAttack(dice1: number, dice2: number) {
    const damage = this.battleSystem.processPlayerAttack(dice1, dice2);
    const isCritical = dice1 === dice2;

    // Trigger hit flash
    this.triggerHitFlash();

    // Get enemy position for floating text
    const enemyX = this.enemySprite ? this.enemySprite.x : this.cameras.main.width / 2;
    const enemyY = this.enemySprite ? this.enemySprite.y : this.cameras.main.height * 0.3;

    // Add floating damage text
    useGameStore.getState().addFloatingText({
      value: damage,
      x: enemyX,
      y: enemyY,
      type: isCritical ? 'critical' : 'damage',
    });

    if (isCritical) {
      // Critical flash effect
      useGameStore.getState().triggerCriticalFlash();
      useGameStore.getState().addLog(`> GUNMA BURST! ${dice1}-${dice2} クリティカル!`, 'critical');
      useGameStore.getState().addLog(`> ${damage} ダメージを与えた!`, 'damage');

      // Lightning effect
      this.createLightningEffect();

      // Strong haptic feedback for critical
      hapticsManager.heavyImpact();
    } else {
      useGameStore.getState().addLog(`> ダイス: ${dice1} + ${dice2} = ${dice1 + dice2}`, 'battle');
      useGameStore.getState().addLog(`> ${damage} ダメージを与えた!`, 'damage');

      // Medium haptic for normal hit
      hapticsManager.mediumImpact();
    }

    // Enemy turn after delay
    this.time.delayedCall(1500, () => {
      this.processEnemyTurn();
    });
  }

  private createLightningEffect() {
    const { width, height } = this.cameras.main;

    // Create lightning-like lines
    for (let i = 0; i < 3; i++) {
      const lightning = this.add.graphics();
      const startX = Phaser.Math.Between(0, width);
      const startY = 0;
      const endX = Phaser.Math.Between(0, width);
      const endY = height;

      lightning.lineStyle(3, 0x39ff14, 1);
      lightning.beginPath();
      lightning.moveTo(startX, startY);

      // Zigzag pattern
      const segments = 5;
      for (let j = 1; j < segments; j++) {
        const midX = Phaser.Math.Linear(startX, endX, j / segments) + Phaser.Math.Between(-30, 30);
        const midY = Phaser.Math.Linear(startY, endY, j / segments);
        lightning.lineTo(midX, midY);
      }

      lightning.lineTo(endX, endY);
      lightning.strokePath();
      lightning.setBlendMode('ADD');

      // Fade out
      this.tweens.add({
        targets: lightning,
        alpha: { from: 1, to: 0 },
        duration: 200,
        onComplete: () => lightning.destroy(),
      });
    }
  }

  private processEnemyTurn() {
    const battleState = this.battleSystem.getCurrentBattleState();
    if (!battleState?.isActive || battleState.turn !== 'enemy') {
      return;
    }

    const damage = this.battleSystem.processEnemyAttack();
    useGameStore.getState().addLog(`> ${battleState.enemy!.name}の攻撃! ${damage} ダメージを受けた!`, 'damage');
    useGameStore.getState().triggerScreenShake();

    // Play damage sound and strong haptic
    soundManager.playSe('damage');
    hapticsManager.vibrate();

    // Check battle end
    const battleResult = this.battleSystem.checkBattleEnd();
    if (battleResult) {
      this.time.delayedCall(1000, () => {
        this.handleBattleEnd(battleResult);
      });
    }
  }

  private handleBattleEnd(result: 'victory' | 'defeat') {
    if (result === 'victory') {
      useGameStore.getState().addLog('> VICTORY! 敵を倒しました!', 'victory');
      soundManager.playSe('win');
      hapticsManager.notification();

      // Switch back to exploration BGM
      soundManager.playBgm('exploration');
    } else {
      useGameStore.getState().addLog('> GAME OVER...', 'defeat');
    }

    this.battleSystem.endBattle(result);
    this.updateEnemyInfo();
  }

  update() {
    // Update dice visual rotation based on physics
    if (this.dice1) {
      const body = this.dice1.body as Phaser.Physics.Arcade.Body;

      // Check for wall collisions to create particles (reduced sensitivity)
      if (Math.abs(body.velocity.x) > 100 || Math.abs(body.velocity.y) > 100) {
        const prevX = (this.dice1 as any).prevX || this.dice1.x;
        const prevY = (this.dice1 as any).prevY || this.dice1.y;

        // Detect sudden velocity change (collision)
        if (Math.abs(this.dice1.x - prevX) > 5 || Math.abs(this.dice1.y - prevY) > 5) {
          // Check if hitting a wall (high velocity)
          if (Math.abs(body.velocity.x) > 100 || Math.abs(body.velocity.y) > 100) {
            const prevVx = (this.dice1 as any).prevVx || 0;
            const prevVy = (this.dice1 as any).prevVy || 0;
            const vxChange = Math.abs(body.velocity.x - prevVx);
            const vyChange = Math.abs(body.velocity.y - prevVy);

            // Sudden velocity change indicates collision
            if (vxChange > 100 || vyChange > 100) {
              this.createImpactParticles(this.dice1.x, this.dice1.y);
            }
          }
        }

        (this.dice1 as any).prevX = this.dice1.x;
        (this.dice1 as any).prevY = this.dice1.y;
        (this.dice1 as any).prevVx = body.velocity.x;
        (this.dice1 as any).prevVy = body.velocity.y;
      }

      if (Math.abs(body.angularVelocity) > 10) {
        this.dice1.setRotation(this.dice1.rotation + body.angularVelocity * 0.001);
      }
    }
    if (this.dice2) {
      const body = this.dice2.body as Phaser.Physics.Arcade.Body;

      // Check for wall collisions (reduced sensitivity)
      if (Math.abs(body.velocity.x) > 100 || Math.abs(body.velocity.y) > 100) {
        const prevX = (this.dice2 as any).prevX || this.dice2.x;
        const prevY = (this.dice2 as any).prevY || this.dice2.y;

        if (Math.abs(this.dice2.x - prevX) > 5 || Math.abs(this.dice2.y - prevY) > 5) {
          // Check if hitting a wall (high velocity)
          if (Math.abs(body.velocity.x) > 100 || Math.abs(body.velocity.y) > 100) {
            const prevVx = (this.dice2 as any).prevVx || 0;
            const prevVy = (this.dice2 as any).prevVy || 0;
            const vxChange = Math.abs(body.velocity.x - prevVx);
            const vyChange = Math.abs(body.velocity.y - prevVy);

            // Sudden velocity change indicates collision
            if (vxChange > 100 || vyChange > 100) {
              this.createImpactParticles(this.dice2.x, this.dice2.y);
            }
          }
        }

        (this.dice2 as any).prevVx = body.velocity.x;
        (this.dice2 as any).prevVy = body.velocity.y;

        (this.dice2 as any).prevX = this.dice2.x;
        (this.dice2 as any).prevY = this.dice2.y;
      }

      if (Math.abs(body.angularVelocity) > 10) {
        this.dice2.setRotation(this.dice2.rotation + body.angularVelocity * 0.001);
      }
    }
  }

  shutdown() {
    // Clean up listeners
    if (this.rollRequestListener) {
      this.time.removeAllEvents();
    }
    if (this.impactParticles) {
      this.impactParticles.destroy();
    }
    this.isRolling = false;
    this.dice1 = null;
    this.dice2 = null;
    this.currentRoll = 'none';
    this.enemySprite = null;
  }
}

