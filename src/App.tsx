import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import GameCanvas from './components/game/GameCanvas';
import LogArea from './components/ui/LogArea';
import ControlDeck from './components/ui/ControlDeck';
import HealthBar from './components/ui/HealthBar';
import { useGameStore } from './stores/gameStore';

function App() {
  const { currentMode, screenShake } = useGameStore();

  return (
    <motion.div 
      className="w-full h-screen flex flex-col bg-gunma-bg text-gunma-text overflow-hidden"
      animate={screenShake ? {
        x: [0, -10, 10, -10, 10, -5, 5, 0],
        y: [0, -5, 5, -5, 5, -2, 2, 0],
      } : {}}
      transition={{ duration: 0.5 }}
    >
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
  );
}

export default App;

