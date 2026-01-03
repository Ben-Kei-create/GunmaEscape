import Phaser from 'phaser';
import { useGameStore } from '../stores/gameStore';
import { BattleSystem } from '../systems/BattleSystem';

interface DiceSprite extends Phaser.GameObjects.Container {
  body: Phaser.Physics.Arcade.Body;
}

export class BattleScene extends Phaser.Scene {
  private dice1: DiceSprite | null = null;
  private dice2: DiceSprite | null = null;
  private dice1Value: number = 1;
  private dice2Value: number = 1;
  private isRolling: boolean = false;
  private walls: Phaser.GameObjects.Rectangle[] = [];
  private rollRequestListener: (() => void) | null = null;
  private battleSystem: BattleSystem;
  private currentRoll: 'dice1' | 'dice2' | 'none' = 'none';
  private enemyInfoText: Phaser.GameObjects.Text | null = null;

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

    this.walls = [topWall, bottomWall, leftWall, rightWall];

    // Create dice containers
    this.createDice();

    // Listen for dice roll requests from React
    this.setupRollListener();

    // Display enemy info
    this.updateEnemyInfo();

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

  private createDice() {
    const { width, height } = this.cameras.main;
    const diceSize = 50;
    const spacing = 80;
    
    // Create dice 1
    const diceContainer1 = this.add.container(width / 2 - spacing, height * 0.3) as DiceSprite;
    const diceGraphics1 = this.add.graphics();
    diceGraphics1.fillStyle(0xffffff, 1);
    diceGraphics1.fillRoundedRect(-diceSize / 2, -diceSize / 2, diceSize, diceSize, 8);
    diceGraphics1.lineStyle(2, 0x39ff14, 1);
    diceGraphics1.strokeRoundedRect(-diceSize / 2, -diceSize / 2, diceSize, diceSize, 8);
    
    const numberText1 = this.add.text(0, 0, '1', {
      fontSize: '28px',
      fontFamily: 'monospace',
      color: '#000000',
      fontWeight: 'bold',
    }).setOrigin(0.5);
    
    diceContainer1.add([diceGraphics1, numberText1]);
    this.physics.add.existing(diceContainer1);
    const body1 = diceContainer1.body as Phaser.Physics.Arcade.Body;
    body1.setSize(diceSize, diceSize);
    body1.setBounce(0.6, 0.6);
    body1.setFriction(0.8, 0.8);
    body1.setCollideWorldBounds(true);
    (diceContainer1 as any).numberText = numberText1;
    this.dice1 = diceContainer1;
    
    // Create dice 2
    const diceContainer2 = this.add.container(width / 2 + spacing, height * 0.3) as DiceSprite;
    const diceGraphics2 = this.add.graphics();
    diceGraphics2.fillStyle(0xffffff, 1);
    diceGraphics2.fillRoundedRect(-diceSize / 2, -diceSize / 2, diceSize, diceSize, 8);
    diceGraphics2.lineStyle(2, 0x39ff14, 1);
    diceGraphics2.strokeRoundedRect(-diceSize / 2, -diceSize / 2, diceSize, diceSize, 8);
    
    const numberText2 = this.add.text(0, 0, '1', {
      fontSize: '28px',
      fontFamily: 'monospace',
      color: '#000000',
      fontWeight: 'bold',
    }).setOrigin(0.5);
    
    diceContainer2.add([diceGraphics2, numberText2]);
    this.physics.add.existing(diceContainer2);
    const body2 = diceContainer2.body as Phaser.Physics.Arcade.Body;
    body2.setSize(diceSize, diceSize);
    body2.setBounce(0.6, 0.6);
    body2.setFriction(0.8, 0.8);
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
    
    // Random initial velocity
    const velocityX = Phaser.Math.Between(-300, 300);
    const velocityY = Phaser.Math.Between(-600, -400);
    const angularVelocity = Phaser.Math.Between(-500, 500);

    const body = dice.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(velocityX, velocityY);
    body.setAngularVelocity(angularVelocity);

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
        }
      },
      loop: true,
    });
  }

  private onDiceStopped(dice: DiceSprite, diceType: 'dice1' | 'dice2') {
    // Calculate final dice value (random 1-6 for now)
    const diceValue = Phaser.Math.Between(1, 6);
    (dice as any).numberText.setText(diceValue.toString());
    
    // Send result to React store
    const state = useGameStore.getState();
    if (diceType === 'dice1') {
      this.dice1Value = diceValue;
      state.setDiceRollResult(diceValue);
    } else {
      this.dice2Value = diceValue;
      state.setDiceRollResult2(diceValue);
    }

    this.isRolling = false;
    this.currentRoll = 'none';
  }

  private processPlayerAttack(dice1: number, dice2: number) {
    const damage = this.battleSystem.processPlayerAttack(dice1, dice2);
    const isCritical = dice1 === dice2;
    
    if (isCritical) {
      useGameStore.getState().addLog(`> GUNMA BURST! ${dice1}-${dice2} クリティカル!`, 'critical');
      useGameStore.getState().addLog(`> ${damage} ダメージを与えた!`, 'damage');
    } else {
      useGameStore.getState().addLog(`> ダイス: ${dice1} + ${dice2} = ${dice1 + dice2}`, 'battle');
      useGameStore.getState().addLog(`> ${damage} ダメージを与えた!`, 'damage');
    }
    
    // Enemy turn after delay
    this.time.delayedCall(1500, () => {
      this.processEnemyTurn();
    });
  }

  private processEnemyTurn() {
    const battleState = this.battleSystem.getCurrentBattleState();
    if (!battleState?.isActive || battleState.turn !== 'enemy') {
      return;
    }

    const damage = this.battleSystem.processEnemyAttack();
    useGameStore.getState().addLog(`> ${battleState.enemy!.name}の攻撃! ${damage} ダメージを受けた!`, 'damage');
    useGameStore.getState().triggerScreenShake();
    
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
      if (Math.abs(body.angularVelocity) > 10) {
        this.dice1.setRotation(this.dice1.rotation + body.angularVelocity * 0.001);
      }
    }
    if (this.dice2) {
      const body = this.dice2.body as Phaser.Physics.Arcade.Body;
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
    this.isRolling = false;
    this.dice1 = null;
    this.dice2 = null;
    this.currentRoll = 'none';
  }
}

