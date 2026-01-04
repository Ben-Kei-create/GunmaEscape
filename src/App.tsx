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
import InventoryManager from './components/ui/InventoryManager';
import CRTOverlay from './components/ui/CRTOverlay';
import ProgressBar from './components/ui/ProgressBar';
import TurnIndicator from './components/ui/TurnIndicator';
import ItemDetailModal from './components/ui/ItemDetailModal';
import NameEntryModal from './components/ui/NameEntryModal';
import ScenarioMap from './components/ui/ScenarioMap';
import DailyNoticeModal from './components/ui/DailyNoticeModal';
import ProfileScreen from './components/ui/ProfileScreen';
import ReelTuningScreen from './components/ui/ReelTuningScreen';
import MemeMaker from './components/ui/MemeMaker';
import { useGameStore } from './stores/gameStore';
import { usePlayerStore } from './stores/playerStore';
import { soundManager } from './systems/SoundManager';
import { hapticsManager } from './systems/HapticsManager';
import { achievementManager } from './systems/AchievementManager';

function App() {
  const {
    currentMode, isTitleVisible, screenShake, criticalFlash, hasSeenTutorial, setHasSeenTutorial,
    selectedItemForModal, setSelectedItemForModal, equipItem, unequipItem, equippedItems, addLog, addFloatingText,
    logs, incrementStat
  } = useGameStore();
  const { heal } = usePlayerStore();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isReelTuningOpen, setIsReelTuningOpen] = useState(false);
  const [isMemeMakerOpen, setIsMemeMakerOpen] = useState(false);
  const [tutorialStep, setTutorialStep] = useState<'tap' | 'swipe' | 'none'>('none');

  const handleModalUse = () => {
    const item = selectedItemForModal;
    if (!item) return;

    if (item.type === 'heal') {
      heal(item.value);
      soundManager.playSe('heal');
      hapticsManager.mediumImpact();
      addLog(`> ${item.name}を使用：HP${item.value}回復`, 'heal');
      addFloatingText({
        value: item.value,
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
        type: 'heal'
      });

      // Phase 36: Track konnyaku usage
      if (item.id === 'konnyaku') {
        incrementStat('konnyakuEaten');
        achievementManager.onStatChange();
      }
    } else if (item.type === 'equip') {
      const equippedSlot = (Object.keys(equippedItems) as ('weapon' | 'armor' | 'accessory')[]).find(
        key => equippedItems[key]?.id === item.id
      );

      if (equippedSlot) {
        unequipItem(equippedSlot);
        soundManager.playSe('cancel');
      } else {
        equipItem(item);
        soundManager.playSe('equip');
        hapticsManager.lightImpact();
      }
    }
    setSelectedItemForModal(null);
  };

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

  // Listen for profile open event
  useEffect(() => {
    const handleProfileOpen = () => setIsProfileOpen(true);
    const handleReelTuningOpen = () => setIsReelTuningOpen(true);
    const handleMemeMakerOpen = () => setIsMemeMakerOpen(true);

    window.addEventListener('openProfile', handleProfileOpen);
    window.addEventListener('openReelTuning', handleReelTuningOpen);
    window.addEventListener('openMemeMaker', handleMemeMakerOpen);

    return () => {
      window.removeEventListener('openProfile', handleProfileOpen);
      window.removeEventListener('openReelTuning', handleReelTuningOpen);
      window.removeEventListener('openMemeMaker', handleMemeMakerOpen);
    };
  }, []);

  return (
    <>
      <div className="relative w-full h-screen overflow-hidden bg-gunma-bg font-dotgothic">
        {/* CRT Overlay & Fog */}
        <CRTOverlay />
        <div className="absolute inset-0 pointer-events-none z-0 opacity-20 mix-blend-screen" style={{
          backgroundImage: 'url(/assets/backgrounds/fog.png)',
          backgroundSize: '200% 100%',
          animation: 'fog-slide 60s linear infinite'
        }} />

        {isTitleVisible ? (
          // タイトル画面
          <StartScreen />
        ) : (
          // ゲーム本編
          <RippleContainer>
            <motion.div
              className="w-full h-full flex flex-col relative pt-[calc(env(safe-area-inset-top)+32px)]"
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

              {/* Settings Button (Overlay) */}
              {/* Settings Button (Overlay) - Only show after tutorial */}
              {hasSeenTutorial && (
                <button
                  onClick={handleSettingsClick}
                  className="absolute top-[calc(env(safe-area-inset-top)+40px)] right-3 z-50 w-10 h-10 flex items-center justify-center
                             bg-black/50 border border-gunma-accent/50 rounded-full
                             text-gunma-accent hover:bg-gunma-accent/20 hover:border-gunma-accent
                             active:scale-90 transition-all duration-150 shadow-neon"
                >
                  ⚙️
                </button>
              )}

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

              {/* Floating Damage Text & Turn Indicator */}
              <FloatingTextDisplay />
              <TurnIndicator />

              {/* 1. VISUAL AREA (40vh) */}
              <div className="relative w-full shrink-0 z-10" style={{ height: '40vh' }}>
                <div className="w-full h-full relative corner-cut overflow-hidden border-b-2 border-gunma-accent/50 shadow-[0_0_15px_rgba(57,255,20,0.2)]">
                  <GameCanvas />
                  <ProgressBar />
                </div>
              </div>

              {/* Separator */}
              <div className="neon-separator" />

              {/* 2. TACTICS AREA (20vh) */}
              <div className="relative w-full shrink-0 z-20 bg-black/40 backdrop-blur-sm flex flex-col justify-end pb-2 px-2 gap-2" style={{ height: '22vh' }}>
                {/* Multi-line Log Display (3-4 lines) */}
                <div
                  className="w-full h-20 overflow-y-auto bg-black/60 border-l-2 border-gunma-accent/50 px-2 py-1 log-scrollbar"
                  style={{ scrollBehavior: 'smooth' }}
                >
                  <div className="space-y-0.5 font-mono text-xs">
                    {logs.slice(-6).map((log, index) => {
                      const isRecent = index >= logs.slice(-6).length - 2;
                      return (
                        <div
                          key={index}
                          className={`${isRecent
                              ? 'text-gunma-accent'
                              : 'text-gray-500'
                            } ${log.type === 'damage' ? 'text-red-400' : ''} ${log.type === 'heal' ? 'text-green-400' : ''}`}
                        >
                          {log.message}
                        </div>
                      );
                    })}
                    {logs.length === 0 && (
                      <div className="text-gray-500">&gt; SYSTEM READY</div>
                    )}
                  </div>
                </div>

                {/* HP Bar */}
                <div className="w-full relative z-20">
                  <HealthBar />
                </div>

                {/* Inventory Strip */}
                <div className="w-full h-14 bg-black/60 rounded border-2 border-gunma-accent/20 p-1 shadow-[inset_0_0_10px_rgba(0,0,0,0.8)] relative overflow-hidden">
                  {/* Slot Effect */}
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-b from-black to-transparent opacity-50" />
                  <QuickInventory />
                </div>
              </div>

              {/* 3. COCKPIT AREA (Remaining) */}
              <div className="relative flex-1 min-h-0 w-full z-30 overflow-hidden">
                {/* Log History Background (Behind Cockpit) */}
                <div className="absolute inset-0 z-0 opacity-30 pointer-events-auto p-2 overflow-hidden bg-black/80">
                  <div className="w-full h-full mask-image-b-fade">
                    {/* LogArea - Simple ver before tutorial, Full after */}
                    {hasSeenTutorial ? (
                      <LogArea />
                    ) : (
                      <div className="p-4 text-xs font-mono text-gray-500">
                        SYSTEM INITIALIZING...<br />
                        AWAITING DATA SYNC...
                      </div>
                    )}
                  </div>
                </div>

                {/* Control Deck (Foreground) */}
                <div className="relative z-10 w-full h-full p-2 pb-[calc(env(safe-area-inset-bottom)+16px)] bg-gradient-to-t from-black via-black/80 to-transparent flex flex-col justify-end">
                  <ControlDeck />
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

        {/* Inventory Manager */}
        <InventoryManager />

        {/* Phase 33: Name Entry & Scenario Map */}
        <NameEntryModal />
        <ScenarioMap />

        {/* Phase 36: Daily Login & Profile */}
        <DailyNoticeModal />
        <ProfileScreen isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />

        {/* Phase 38: Reel Tuning & Meme Maker */}
        <ReelTuningScreen isOpen={isReelTuningOpen} onClose={() => setIsReelTuningOpen(false)} />
        <MemeMaker isOpen={isMemeMakerOpen} onClose={() => setIsMemeMakerOpen(false)} />

        {/* Item Detail Modal */}
        <ItemDetailModal
          isOpen={!!selectedItemForModal}
          item={selectedItemForModal}
          isEquipped={!!selectedItemForModal && Object.values(equippedItems).some(e => e?.id === selectedItemForModal.id)}
          onClose={() => setSelectedItemForModal(null)}
          onUse={handleModalUse}
        />

        {/* Save Indicator */}
        {!isTitleVisible && <SaveIndicator />}

        {/* Global Footer Ticker - Only show after tutorial */}
        {hasSeenTutorial && <GunmaTicker />}
      </div>
    </>
  );
}

export default App;


