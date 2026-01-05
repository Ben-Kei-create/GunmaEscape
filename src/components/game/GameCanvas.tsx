import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { useGameStore } from '../../stores/gameStore';
import { BattleScene } from '../../scenes/BattleScene';
import { soundManager } from '../../systems/SoundManager';

class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  create() {
    // Initial scene setup
    this.cameras.main.setBackgroundColor('#1a1a1a');

    // Play exploration BGM
    soundManager.playBgm('exploration');

    // Placeholder text
    this.add.text(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2,
      '探索モード',
      {
        fontSize: '24px',
        fontFamily: 'monospace',
        color: '#39ff14',
      }
    ).setOrigin(0.5);
  }
}

const GameCanvas = () => {
  const gameRef = useRef<HTMLDivElement>(null);
  const phaserGameRef = useRef<Phaser.Game | null>(null);
  const { currentMode } = useGameStore();

  useEffect(() => {
    if (!gameRef.current || phaserGameRef.current) return;

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.CANVAS, // Changed from AUTO to avoid WebGL framebuffer errors
      width: window.innerWidth,
      height: window.innerHeight * 0.5, // 50vh - upper half of screen for monster
      parent: gameRef.current,
      backgroundColor: 'transparent', // Transparent so React background shows through
      transparent: true,
      render: {
        antialias: false,
        pixelArt: true,
        roundPixels: true
      },
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { x: 0, y: 300 },
          debug: false,
        },
      },
      scene: [BootScene, BattleScene],
      scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
    };

    phaserGameRef.current = new Phaser.Game(config);

    return () => {
      if (phaserGameRef.current) {
        phaserGameRef.current.destroy(true);
        phaserGameRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!phaserGameRef.current) return;

    const scene = phaserGameRef.current.scene.getScene('BattleScene');
    if (currentMode === 'battle' && scene) {
      phaserGameRef.current.scene.start('BattleScene');
    } else if (currentMode === 'exploration' && scene) {
      phaserGameRef.current.scene.start('BootScene');
    }
  }, [currentMode]);

  return (
    <div
      ref={gameRef}
      className="w-full h-full"
      style={{
        backgroundColor: 'transparent',
        position: 'relative',
      }}
    />
  );
};

export default GameCanvas;

