import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GameCanvas from './components/game/GameCanvas';
import LogArea from './components/ui/LogArea';
import ControlDeck from './components/ui/ControlDeck';
import HealthBar from './components/ui/HealthBar';
import GameOverScreen from './components/ui/GameOverScreen';
import CollectionBook from './components/ui/CollectionBook';
import StartScreen from './components/ui/StartScreen';
import SettingsModal from './components/ui/SettingsModal';
import SaveIndicator from './components/ui/SaveIndicator';
import FloatingTextDisplay from './components/ui/FloatingText';
import { useGameStore } from './stores/gameStore';
import { soundManager } from './systems/SoundManager';
import { hapticsManager } from './systems/HapticsManager';

function App() {
  const { currentMode, isTitleVisible, screenShake, criticalFlash } = useGameStore();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleSettingsClick = () => {
    soundManager.playSe('button_click');
    hapticsManager.lightImpact();
    setIsSettingsOpen(true);
  };

  return (
    <>
      <div className="relative w-full h-screen overflow-hidden bg-gunma-bg font-dotgothic">
        {isTitleVisible ? (
          // タイトル画面
          <StartScreen />
        ) : (
          // ゲーム本編
          <motion.div
            className="w-full h-full flex flex-col relative"
            animate={screenShake ? {
              x: [0, -10, 10, -10, 10, -5, 5, 0],
              y: [0, -5, 5, -5, 5, -2, 2, 0],
            } : {}}
            transition={{ duration: 0.5 }}
            style={{
              filter: criticalFlash ? 'invert(1) brightness(1.5)' : 'none',
            }}
          >
            {/* Settings Button (top-right) */}
            <button
              onClick={handleSettingsClick}
              className="absolute top-3 right-3 z-20 w-10 h-10 flex items-center justify-center
                         bg-black/50 border border-gunma-accent/50 rounded-full
                         text-gunma-accent hover:bg-gunma-accent/20 hover:border-gunma-accent
                         active:scale-90 transition-all duration-150"
            >
              ⚙️
            </button>

            {/* Critical Flash Overlay */}
            <AnimatePresence>
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
            </AnimatePresence>

            {/* Floating Damage Text */}
            <FloatingTextDisplay />

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
        )}

        {/* Overlays */}
        {!isTitleVisible && currentMode === 'gameover' && <GameOverScreen />}
        {!isTitleVisible && currentMode === 'collection' && <CollectionBook />}

        {/* Settings Modal */}
        <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />

        {/* Save Indicator */}
        {!isTitleVisible && <SaveIndicator />}
      </div>
    </>
  );
}

export default App;

