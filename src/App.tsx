import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import GameCanvas from './components/game/GameCanvas';
import LogArea from './components/ui/LogArea';
import ControlDeck from './components/ui/ControlDeck';
import HealthBar from './components/ui/HealthBar';
import GameOverScreen from './components/ui/GameOverScreen';
import CollectionBook from './components/ui/CollectionBook';
import { useGameStore } from './stores/gameStore';

function App() {
  const { currentMode, screenShake, criticalFlash } = useGameStore();

  return (
    <>
      <motion.div 
        className="w-full h-screen flex flex-col bg-gunma-bg text-gunma-text overflow-hidden relative"
        animate={screenShake ? {
          x: [0, -10, 10, -10, 10, -5, 5, 0],
          y: [0, -5, 5, -5, 5, -2, 2, 0],
        } : {}}
        transition={{ duration: 0.5 }}
        style={{
          filter: criticalFlash ? 'invert(1) brightness(1.5)' : 'none',
        }}
      >
        {/* Critical Flash Overlay */}
        {criticalFlash && (
          <motion.div
            className="absolute inset-0 z-40 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              background: 'linear-gradient(90deg, transparent 0%, rgba(57, 255, 20, 0.3) 50%, transparent 100%)',
            }}
          />
        )}

        {/* Top 40%: Visual Area (Phaser Canvas) */}
        <div className="relative" style={{ height: '40vh', minHeight: '40vh' }}>
          <GameCanvas />
        </div>

        {/* Mid 30%: Log/Message Area */}
        <div className="relative" style={{ height: '30vh', minHeight: '30vh' }}>
          <LogArea />
        </div>

        {/* Bottom 30%: Control Deck */}
        <div className="relative" style={{ height: '30vh', minHeight: '30vh' }}>
          <ControlDeck />
          <div className="absolute top-2 left-0 right-0">
            <HealthBar />
          </div>
        </div>
      </motion.div>

      {/* Game Over Screen */}
      {currentMode === 'gameover' && <GameOverScreen />}

      {/* Collection Book */}
      {currentMode === 'collection' && <CollectionBook />}
    </>
  );
}

export default App;

