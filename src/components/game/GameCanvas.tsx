import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { useGameStore } from '../../stores/gameStore';
import { usePlayerStore } from '../../stores/playerStore';
import { BattleScene } from '../../scenes/BattleScene';
import { getBackgroundForLocation } from '../../config/assets';

class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  create() {
    // Initial scene setup
    this.cameras.main.setBackgroundColor('#1a1a1a');
    
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
  const { location } = usePlayerStore();

  useEffect(() => {
    if (!gameRef.current || phaserGameRef.current) return;

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: window.innerWidth,
      height: window.innerHeight * 0.4, // 40vh
      parent: gameRef.current,
      backgroundColor: getBackgroundForLocation(location).color,
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { y: 300 },
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
      className="w-full h-full crt-scanline"
      style={{ 
        backgroundColor: getBackgroundForLocation(location).color,
        position: 'relative',
      }}
    />
  );
};

export default GameCanvas;

