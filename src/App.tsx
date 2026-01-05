import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
import ItemDetailModal from './components/ui/ItemDetailModal';
import NameEntryModal from './components/ui/NameEntryModal';
import ScenarioMap from './components/ui/ScenarioMap';
import DailyNoticeModal from './components/ui/DailyNoticeModal';
import ProfileScreen from './components/ui/ProfileScreen';
import ReelTuningScreen from './components/ui/ReelTuningScreen';
// MemeMaker removed per user request
import TypewriterLog from './components/ui/TypewriterLog';
import BattleResultBanner from './components/ui/BattleResultBanner';
import VillageScreen from './components/ui/VillageScreen';
import { useGameStore } from './stores/gameStore';
import { usePlayerStore } from './stores/playerStore';
import { soundManager } from './systems/SoundManager';
import { hapticsManager } from './systems/HapticsManager';
import { achievementManager } from './systems/AchievementManager';
import { debugAuto } from './systems/DebugAutomation';

function App() {
  // Debug Exposure
  useEffect(() => {
    (window as any).GunmaDebug = debugAuto;
    console.log('[DEBUG] GunmaDebug exposed. Run GunmaDebug.startChapter1TestBatch() to test.');
  }, []);

  const {
    currentMode, isTitleVisible, screenShake, criticalFlash, hasSeenTutorial, setHasSeenTutorial,
    selectedItemForModal, setSelectedItemForModal, equipItem, unequipItem, equippedItems, addLog, addFloatingText,
    incrementStat,
    // setShowNameEntry,
    // resetGame,
    // heroName,
    battleState,
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

              {/* Floating Text Overlay (Damage Numbers) */}
              <FloatingTextDisplay />

              {/* =====================================================================================
                  BATTLE LAYER - COMPLETELY OVERHAULED
                  Upper half: Enemy display (centered)
                  Lower half: Controls
                  ===================================================================================== */}
              <div className={`w-full h-full flex flex-col relative ${currentMode === 'battle' ? 'block' : 'hidden'}`}>
                {/* Battle Background */}
                <div
                  className="absolute inset-0 z-0 bg-cover bg-center"
                  style={{
                    backgroundImage: 'url(/assets/bg/battle_bg.png)',
                    filter: 'brightness(0.5)'
                  }}
                />
                <div
                  className="absolute inset-0 z-0"
                  style={{
                    background: 'radial-gradient(ellipse at center 40%, rgba(0,30,0,0.4) 0%, rgba(0,0,0,0.8) 100%)'
                  }}
                />

                {/* ============== UPPER HALF: ENEMY DISPLAY ============== */}
                <div className="absolute top-0 left-0 right-0 h-[50%] z-10 flex flex-col items-center justify-center pt-[calc(env(safe-area-inset-top)+20px)]">
                  {/* Enemy Container - CENTERED */}
                  {battleState?.enemy && (
                    <motion.div
                      className="flex flex-col items-center"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: 'spring', damping: 15 }}
                    >
                      {/* Enemy Image - Large and Centered */}
                      <motion.div
                        className="w-40 h-40 rounded-2xl overflow-hidden mb-4 relative"
                        style={{
                          background: 'rgba(0,0,0,0.6)',
                          border: '3px solid rgba(255, 69, 58, 0.8)',
                          boxShadow: '0 0 30px rgba(255, 69, 58, 0.5), inset 0 0 20px rgba(0,0,0,0.5)',
                        }}
                        animate={{
                          y: [0, -8, 0],
                          boxShadow: [
                            '0 0 30px rgba(255, 69, 58, 0.5)',
                            '0 0 40px rgba(255, 69, 58, 0.7)',
                            '0 0 30px rgba(255, 69, 58, 0.5)',
                          ]
                        }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                      >
                        {/* Enemy Sprite Image */}
                        <img
                          src={`/assets/enemies/enemy_${battleState.enemy.id?.includes('daruma') ? 'daruma' : 'konnyaku'}.png`}
                          alt={battleState.enemy.name}
                          className="w-full h-full object-contain p-2"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/assets/bg/exploration_bg.png';
                          }}
                        />
                      </motion.div>

                      {/* Enemy Name */}
                      <div
                        className="text-xl font-black tracking-wider mb-2"
                        style={{
                          color: '#FF453A',
                          textShadow: '0 0 10px rgba(255, 69, 58, 0.8)'
                        }}
                      >
                        {battleState.enemy.name}
                      </div>

                      {/* Enemy HP Bar */}
                      <div className="w-48 h-5 bg-gray-900 rounded-full overflow-hidden relative border-2 border-red-900">
                        <motion.div
                          className="h-full bg-gradient-to-r from-red-600 to-orange-500"
                          initial={{ width: '100%' }}
                          animate={{ width: `${(battleState.enemy.hp / battleState.enemy.maxHp) * 100}%` }}
                          transition={{ duration: 0.5 }}
                          style={{ boxShadow: 'inset 0 -2px 4px rgba(0,0,0,0.3)' }}
                        />
                        <div className="absolute inset-0 text-xs text-white flex items-center justify-center font-bold drop-shadow-md">
                          HP {battleState.enemy.hp}/{battleState.enemy.maxHp}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* ============== CENTER: ACTION AREA ============== */}
                <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
                  {/* SwipeCard will be handled centrally */}
                </div>

                {/* 3. Footer: Player Status (Bottom) */}
                <div
                  className="absolute bottom-0 left-0 w-full z-20 pb-[calc(env(safe-area-inset-bottom)+20px)] px-4 flex flex-col gap-4 bg-gradient-to-t from-black via-black/80 to-transparent pt-10"
                >
                  {/* Player HP Bar */}
                  <HealthBar />

                  {/* Battle Log will go here */}
                </div>   {/* Log Area (Bottom-most, semi-transparent) */}
                <div
                  className="w-full backdrop-blur-md rounded-xl p-3 overflow-hidden relative"
                  style={{
                    background: 'linear-gradient(135deg, rgba(0,20,0,0.7) 0%, rgba(0,0,0,0.8) 100%)',
                    border: '2px solid rgba(0,255,0,0.3)',
                    boxShadow: '0 0 15px rgba(0,255,0,0.2), inset 0 0 20px rgba(0,0,0,0.5)',
                    minHeight: '80px'
                  }}
                >
                  {/* Corner Tech Markers */}
                  <div className="absolute top-1 left-1 w-3 h-3 border-l-2 border-t-2 border-green-500/50" />
                  <div className="absolute top-1 right-1 w-3 h-3 border-r-2 border-t-2 border-green-500/50" />
                  <div className="absolute bottom-1 left-1 w-3 h-3 border-l-2 border-b-2 border-green-500/50" />
                  <div className="absolute bottom-1 right-1 w-3 h-3 border-r-2 border-b-2 border-green-500/50" />
                  <TypewriterLog />
                </div>
              </div>
              {/* =====================================================================================
              EXPLORATION LAYER (SwiftUI Layout)
              Visible only in Exploration Mode
                  ===================================================================================== */}
              <div className={`w-full h-full flex flex-col relative ${currentMode === 'exploration' ? 'block' : 'hidden'}`}>
                {/* Exploration Background with Ken Burns */}
                <motion.div
                  className="absolute inset-0 z-0 bg-cover bg-center"
                  style={{
                    backgroundImage: 'url(/assets/bg/exploration_bg.png)',
                    filter: 'brightness(0.5) saturate(1.1)'
                  }}
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 30, repeat: Infinity, ease: 'easeInOut' }}
                />

                {/* Vignette overlay */}
                <div
                  className="absolute inset-0 z-0"
                  style={{
                    background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.7) 100%)'
                  }}
                />

                {/* Floating Fog/Spore Layer */}
                <div className="absolute inset-0 z-[5] pointer-events-none overflow-hidden">
                  {/* Fog drift */}
                  <motion.div
                    className="absolute inset-0"
                    style={{
                      background: 'linear-gradient(90deg, transparent 0%, rgba(0,50,30,0.1) 50%, transparent 100%)',
                    }}
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                  />
                  <motion.div
                    className="absolute inset-0"
                    style={{
                      background: 'linear-gradient(90deg, transparent 0%, rgba(0,30,20,0.15) 50%, transparent 100%)',
                    }}
                    animate={{ x: ['100%', '-100%'] }}
                    transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
                  />

                  {/* Floating spores */}
                  {[...Array(8)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute rounded-full"
                      style={{
                        width: 3 + Math.random() * 4,
                        height: 3 + Math.random() * 4,
                        left: `${10 + Math.random() * 80}%`,
                        bottom: '-5%',
                        background: 'radial-gradient(circle, rgba(0,255,100,0.6) 0%, transparent 70%)',
                        boxShadow: '0 0 8px rgba(0,255,100,0.4)',
                      }}
                      animate={{
                        y: [0, -window.innerHeight * 1.1],
                        x: [0, (Math.random() - 0.5) * 80],
                        opacity: [0, 0.7, 0.7, 0],
                      }}
                      transition={{
                        duration: 10 + Math.random() * 5,
                        delay: i * 1.5,
                        repeat: Infinity,
                        ease: 'linear',
                      }}
                    />
                  ))}
                </div>

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
      </div >
    </>
  );
}

export default App;


