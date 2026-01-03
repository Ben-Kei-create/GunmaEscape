import { useState, useEffect } from 'react';
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
import VictoryScreen from './components/ui/VictoryScreen';
import TutorialOverlay from './components/ui/TutorialOverlay';
import RippleContainer from './components/ui/RippleContainer';
import GunmaTicker from './components/ui/GunmaTicker';
import QuickInventory from './components/ui/QuickInventory';
import { useGameStore } from './stores/gameStore';
import { soundManager } from './systems/SoundManager';
import { hapticsManager } from './systems/HapticsManager';

function App() {
  const { currentMode, isTitleVisible, screenShake, criticalFlash, hasSeenTutorial, setHasSeenTutorial } = useGameStore();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [tutorialStep, setTutorialStep] = useState<'tap' | 'swipe' | 'none'>('none');

  // Show tutorial on first game start
  useEffect(() => {
    if (!hasSeenTutorial && !isTitleVisible) {
      const timer = setTimeout(() => setTutorialStep('tap'), 500);
      return () => clearTimeout(timer);
    }
  }, [hasSeenTutorial, isTitleVisible]);

  const handleTutorialComplete = () => {
    if (tutorialStep === 'tap') {
      // Could show swipe tutorial next time a swipe card appears
      setTutorialStep('none');
      setHasSeenTutorial(true);
    } else {
      setTutorialStep('none');
    }
  };

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
          <RippleContainer>
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
              {/* Matrix Background */}
              <div className="absolute inset-0 matrix-bg pointer-events-none z-0" />

              {/* Settings Button (top-right) */}
              <button
                onClick={handleSettingsClick}
                className="absolute top-3 right-3 z-30 w-10 h-10 flex items-center justify-center
                           bg-black/50 border border-gunma-accent/50 rounded-full
                           text-gunma-accent hover:bg-gunma-accent/20 hover:border-gunma-accent
                           active:scale-90 transition-all duration-150 shadow-neon"
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

              {/* Top 45%: Visual Area (Phaser Canvas) */}
              <div className="relative z-10" style={{ height: '45vh', minHeight: '40vh' }}>
                <GameCanvas />
              </div>

              {/* Mid 25%: Dual-Pane Command Center (Log & Gear) */}
              <div className="relative z-20 px-2 py-2 flex gap-2" style={{ height: '25vh' }}>
                {/* Left: Log Monitor (70%) */}
                <div className="flex-[7] h-full rounded-xl overflow-hidden glass shadow-lg border border-gunma-accent/30 relative">
                  <LogArea />
                </div>

                {/* Right: Quick Inventory (30%) */}
                <div className="flex-[3] h-full rounded-xl overflow-hidden glass shadow-lg border border-gunma-accent/30 p-2 relative">
                  <QuickInventory />
                </div>
              </div>

              {/* Bottom 30%: Control Deck */}
              <div className="relative z-30" style={{ height: '30vh' }}>
                <ControlDeck />
                <div className="absolute top-[-12px] left-0 right-0 z-40">
                  <HealthBar />
                </div>
              </div>
            </motion.div>
          </RippleContainer>
        )}

        {/* Overlays */}
        {!isTitleVisible && currentMode === 'gameover' && <GameOverScreen />}
        {!isTitleVisible && currentMode === 'collection' && <CollectionBook />}
        {!isTitleVisible && currentMode === 'victory' && <VictoryScreen />}

        {/* Tutorial Overlay */}
        {!isTitleVisible && (
          <TutorialOverlay step={tutorialStep} onComplete={handleTutorialComplete} />
        )}

        {/* Settings Modal */}
        <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />

        {/* Save Indicator */}
        {!isTitleVisible && <SaveIndicator />}

        {/* Global Footer Ticker */}
        <GunmaTicker />
      </div>
    </>
  );
}

export default App;


