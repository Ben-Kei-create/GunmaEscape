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

import InventoryManager from './components/ui/InventoryManager';
import SwipeCard from './components/ui/SwipeCard';
import SwiftUIFooter from './components/ui/SwiftUIFooter';
import ProgressBar from './components/ui/ProgressBar';
import TurnIndicator from './components/ui/TurnIndicator';
import ItemDetailModal from './components/ui/ItemDetailModal';
import NameEntryModal from './components/ui/NameEntryModal';
import ScenarioMap from './components/ui/ScenarioMap';
import DailyNoticeModal from './components/ui/DailyNoticeModal';
import ProfileScreen from './components/ui/ProfileScreen';
import ReelTuningScreen from './components/ui/ReelTuningScreen';
// MemeMaker removed per user request
import TypewriterLog from './components/ui/TypewriterLog';
import BattleResultBanner from './components/ui/BattleResultBanner';
import RespectRoulette from './components/battle/RespectRoulette';
import VillageScreen from './components/ui/VillageScreen';
import { useGameStore } from './stores/gameStore';
import { usePlayerStore } from './stores/playerStore';
import { soundManager } from './systems/SoundManager';
import { hapticsManager } from './systems/HapticsManager';
import { achievementManager } from './systems/AchievementManager';

function App() {
  const {
    currentMode, isTitleVisible, screenShake, criticalFlash, hasSeenTutorial, setHasSeenTutorial,
    selectedItemForModal, setSelectedItemForModal, equipItem, unequipItem, equippedItems, addLog, addFloatingText,
    incrementStat
  } = useGameStore();
  const { heal } = usePlayerStore();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isReelTuningOpen, setIsReelTuningOpen] = useState(false);

  const [tutorialStep, setTutorialStep] = useState<'tap' | 'swipe' | 'none'>('none');

  const handleModalUse = () => {
    const item = selectedItemForModal;
    if (!item) return;

    // Check cooldown
    if (useGameStore.getState().itemCooldowns[item.id] > 0) {
      soundManager.playSe('cancel');
      return;
    }

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

      // Consumption Logic
      if (item.infinite) {
        if (item.cooldown) {
          useGameStore.getState().setItemCooldown(item.id, item.cooldown);
        }
      } else {
        usePlayerStore.getState().removeItem(item.id);
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


    window.addEventListener('openProfile', handleProfileOpen);
    window.addEventListener('openReelTuning', handleReelTuningOpen);


    return () => {
      window.removeEventListener('openProfile', handleProfileOpen);
      window.removeEventListener('openReelTuning', handleReelTuningOpen);

    };
  }, []);

  return (
    <>
      <div
        className="relative w-full h-screen overflow-hidden font-sans"
        style={{ background: 'var(--color-bg-base)' }}
      >
        {/* Subtle ambient gradient (Apple-style) */}
        <div
          className="absolute inset-0 pointer-events-none z-0 opacity-30"
          style={{
            background: 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(48, 209, 88, 0.15) 0%, transparent 60%)'
          }}
        />

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
              {/* Clean Background - No matrix effect */}

              {/* Settings Button (Overlay) */}
              {/* Settings Button (Overlay) - Only show after tutorial */}
              {hasSeenTutorial && (
                <button
                  onClick={handleSettingsClick}
                  className="absolute top-[calc(env(safe-area-inset-top)+40px)] right-3 z-50 w-10 h-10 flex items-center justify-center
                             rounded-full active:scale-90 transition-all duration-150"
                  style={{
                    background: 'var(--color-bg-elevated)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: 'var(--color-text-medium)'
                  }}
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

              {/* =====================================================================================
                  BATTLE LAYER (Classic Layout)
                  Visible only in Battle Mode
                  ===================================================================================== */}
              <div className={`w-full h-full flex flex-col ${currentMode === 'battle' ? 'block' : 'hidden'}`}>
                {/* 1. VISUAL AREA (45vh) */}
                <div className="relative w-full shrink-0 z-10" style={{ height: '45vh' }}>
                  <div className="w-full h-full relative overflow-hidden border-b border-gunma-accent/30">
                    {/* Battle View (Phaser) - Always mounted to preserve context */}
                    <div className="w-full h-full absolute inset-0 bg-black">
                      <GameCanvas />
                    </div>
                    {/* Shared UI */}
                    <ProgressBar />
                    {/* Battle Only UI */}
                    <FloatingTextDisplay />
                    <TurnIndicator />
                  </div>
                </div>

                {/* Separator */}
                <div className="h-px" style={{ background: 'rgba(48, 209, 88, 0.3)' }} />

                {/* 2. TACTICS AREA - Compact HP and Log */}
                <div
                  className="relative w-full shrink-0 z-20 flex flex-col justify-end pb-2 px-3 gap-1"
                  style={{
                    height: '20vh',
                    background: 'linear-gradient(to bottom, rgba(0,0,0,0.6), rgba(0,0,0,0.9))'
                  }}
                >
                  <TypewriterLog />
                  <div className="w-full relative z-20">
                    <HealthBar />
                  </div>
                </div>

                {/* 3. COCKPIT AREA (Remaining) */}
                <div className="relative flex-1 min-h-0 w-full z-30 overflow-hidden">
                  {/* Log History Background */}
                  <div className="absolute inset-0 z-0 opacity-20 pointer-events-auto p-2 overflow-hidden bg-black/90">
                    <div className="w-full h-full">
                      <LogArea />
                    </div>
                  </div>
                  {/* Control Deck */}
                  <div className="relative z-10 w-full h-full p-3 pb-[calc(env(safe-area-inset-bottom)+12px)] bg-gradient-to-t from-black via-black/90 to-transparent flex flex-col justify-end">
                    <ControlDeck />
                  </div>
                </div>
              </div>

              {/* =====================================================================================
                  EXPLORATION LAYER (SwiftUI Layout)
                  Visible only in Exploration Mode
                  ===================================================================================== */}
              <div className={`w-full h-full flex flex-col relative ${currentMode === 'exploration' ? 'block' : 'hidden'}`}>
                {/* Header (Status Bar + Settings) */}
                <div className="absolute top-0 left-0 right-0 z-40 px-4">
                  {/* Reuse HealthBar for Status (HP/Lv) */}
                  <HealthBar />
                </div>

                {/* Main Content (SwipeCard - Full Screen) */}
                {/* Give top/bottom padding to avoid Header/Footer overlap coverage */}
                <div className="w-full h-full relative z-10 pt-[70px] pb-[90px] px-4">
                  <SwipeCard />
                </div>

                {/* SwiftUI Footer (Floating) */}
                <SwiftUIFooter />
              </div>
            </motion.div>
          </RippleContainer>
        )}

        {/* Overlays */}
        {!isTitleVisible && currentMode === 'gameover' && <GameOverScreen />}
        {!isTitleVisible && currentMode === 'collection' && <CollectionBook />}
        {!isTitleVisible && currentMode === 'victory' && <VictoryScreen />}
        {!isTitleVisible && currentMode === 'village' && (
          <VillageScreen
            isOpen={true}
            onClose={() => useGameStore.getState().setMode('exploration')}
          />
        )}

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
        {/* MemeMaker removed */}

        {/* Phase 41: Battle Result Banner & Village */}
        <BattleResultBanner />

        {/* Phase 42: Respect Roulette */}
        <RespectRoulette />

        {/* Item Detail Modal */}

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


