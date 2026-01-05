import { useEffect, useState } from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { useGameStore } from '../../stores/gameStore';
import type { CardEvent } from '../../types';
import { ScenarioManager } from '../../systems/ScenarioManager';

interface SwipeCardProps {
  card: CardEvent;
  index: number;
  onSwipe: (direction: 'left' | 'right', card: CardEvent) => void;
  isTop: boolean;
}



const Card = ({ card, index, onSwipe, isTop }: SwipeCardProps) => {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-12, 12]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0.5, 1, 1, 1, 0.5]);

  const acceptOpacity = useTransform(x, [0, 80], [0, 1]);
  const rejectOpacity = useTransform(x, [-80, 0], [1, 0]);

  const { hasSeenSwipeTutorial, setHasSeenSwipeTutorial } = useGameStore();
  const [isDragging, setIsDragging] = useState(false);

  const isStory = card.type === 'story';
  // const accentColor = getCardAccent(card.type); // Unused in new design

  const handleDragStart = () => {
    setIsDragging(true);
    if (!hasSeenSwipeTutorial && !isStory) {
      setHasSeenSwipeTutorial(true);
    }
  };

  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    setIsDragging(false);
    const threshold = 100;
    if (info.offset.x > threshold) {
      onSwipe('right', card);
    } else if (info.offset.x < -threshold) {
      onSwipe('left', card);
    }
  };

  const handleClick = () => {
    if (isStory) {
      import('../../systems/SoundManager').then(({ soundManager }) => {
        soundManager.playSe('button_click');
      });
      import('../../systems/HapticsManager').then(({ hapticsManager }) => {
        hapticsManager.lightImpact();
      });
      onSwipe('right', card);
    }
  };

  // Dynamic labels based on card type or properties
  const getLeftLabel = () => {
    if (card.leftText) return card.leftText;
    if (card.type === 'battle') return '🛡️ 防御/回避';
    return (card as any).choices?.left?.text || '← スキップ';
  };

  const getRightLabel = () => {
    if (card.rightText) return card.rightText;
    if (card.type === 'battle') return '⚔️ 攻撃';
    return (card as any).choices?.right?.text || '進む →';
  };

  const leftLabel = getLeftLabel();
  const rightLabel = getRightLabel();

  // Stack cards (not top)
  if (!isTop) {
    return (
      <motion.div
        className="absolute inset-0 w-full h-full"
        style={{
          scale: 1 - (index * 0.04),
          y: index * 6,
          zIndex: 10 - index,
        }}
        initial={{ scale: 1 - (index * 0.04) }}
      >
        <div
          className="w-full h-full rounded-3xl p-6 flex flex-col overflow-hidden"
          style={{
            background: 'var(--color-bg-elevated)',
            border: '1px solid rgba(255, 255, 255, 0.05)'
          }}
        >
          <div className="opacity-40 text-xs text-white/60">
            [{card.type.toUpperCase()}]
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className={`absolute inset-0 w-full h-full ${isStory ? 'cursor-pointer' : 'cursor-grab active:cursor-grabbing'}`}
      style={{
        x,
        rotate,
        opacity,
        zIndex: 100,
      }}
      drag={isStory ? false : "x"}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.15}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={handleClick}
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileDrag={{ scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
    >
      {/* Main Card - Glassmorphism Design */}
      <div
        className="w-full h-full rounded-3xl overflow-hidden flex flex-col relative"
        style={{
          background: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          boxShadow: '0 0 25px rgba(0, 255, 204, 0.4)',
          border: '2px solid rgba(0, 255, 204, 0.5)'
        }}
      >
        {/* Card Image - Top 40% */}
        {(card as any).image && (
          <div
            className="w-full h-[40%] bg-cover bg-center"
            style={{
              backgroundImage: `url(${(card as any).image || '/assets/bg/exploration_bg.png'})`,
              borderTopLeftRadius: '1.5rem',
              borderTopRightRadius: '1.5rem'
            }}
          />
        )}

        {/* Card Content - Scrollable */}
        <div className="flex-1 p-6 flex flex-col items-center overflow-y-auto">
          {/* Type Badge - [STORY] */}
          <div
            className="px-3 py-1 rounded-md mb-4"
            style={{
              background: '#00FFCC',
              color: '#000000',
            }}
          >
            <span className="text-xs font-black tracking-widest uppercase">
              [{card.type.toUpperCase()}]
            </span>
          </div>

          {/* Title */}
          <h3
            className="text-2xl font-black mb-4 text-center leading-tight drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]"
            style={{ color: '#FFFFFF' }}
          >
            {card.title}
          </h3>

          {/* Description */}
          <div className="w-full px-2">
            <p
              className="text-sm leading-relaxed whitespace-pre-wrap text-center font-medium"
              style={{
                color: 'rgba(255, 255, 255, 0.9)',
                textShadow: '0 1px 2px rgba(0,0,0,0.5)'
              }}
            >
              {card.text || card.description}
            </p>
          </div>

          {/* Tap to continue animation */}
          {isStory && (
            <div className="mt-auto mb-8">
              <motion.div
                className="flex flex-col items-center gap-1"
                animate={{ y: [0, 5, 0], opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <span className="text-[10px] font-bold tracking-widest text-[#00FFCC]">
                  ▼ タップして続ける
                </span>
                <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-[#00FFCC]" />
              </motion.div>
            </div>
          )}

          {/* Action Hints */}
          {!isStory && (
            <div className="w-full flex justify-between px-4 mt-auto mb-6">
              <div className="text-left">
                <span className="block text-xs text-gray-400 mb-1">← NO</span>
                <span style={{ color: 'var(--color-accent-red)', fontWeight: 'bold' }}>{leftLabel}</span>
              </div>
              <div className="text-right">
                <span className="block text-xs text-gray-400 mb-1">YES →</span>
                <span style={{ color: 'var(--color-accent-primary)', fontWeight: 'bold' }}>{rightLabel}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Accept Overlay */}
      {!isStory && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center pointer-events-none rounded-3xl"
          style={{
            opacity: acceptOpacity,
            background: 'rgba(48, 209, 88, 0.15)'
          }}
        >
          <div
            className="px-8 py-4 rounded-2xl"
            style={{
              background: 'rgba(48, 209, 88, 0.2)',
              border: '2px solid var(--color-accent-primary)'
            }}
          >
            <span
              className="text-2xl font-bold"
              style={{ color: 'var(--color-accent-primary)' }}
            >
              {rightLabel.replace('→', '').trim() || 'YES'}
            </span>
          </div>
        </motion.div>
      )}

      {/* Reject Overlay */}
      {!isStory && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center pointer-events-none rounded-3xl"
          style={{
            opacity: rejectOpacity,
            background: 'rgba(255, 69, 58, 0.15)'
          }}
        >
          <div
            className="px-8 py-4 rounded-2xl"
            style={{
              background: 'rgba(255, 69, 58, 0.2)',
              border: '2px solid var(--color-accent-red)'
            }}
          >
            <span
              className="text-2xl font-bold"
              style={{ color: 'var(--color-accent-red)' }}
            >
              {leftLabel.replace('←', '').trim() || 'NO'}
            </span>
          </div>
        </motion.div>
      )}

      {/* Swipe Tutorial */}
      {!isStory && !hasSeenSwipeTutorial && !isDragging && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center pointer-events-none z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <motion.div
            className="text-5xl"
            animate={{
              x: [-20, 20, -20],
              opacity: [0.4, 1, 0.4],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            👆
          </motion.div>
          <motion.p
            className="absolute bottom-24 text-sm font-medium px-4 py-2 rounded-full"
            style={{
              background: 'var(--color-bg-surface)',
              color: 'var(--color-text-medium)'
            }}
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            ← スワイプして選択 →
          </motion.p>
        </motion.div>
      )}
    </motion.div>
  );
};

let globalScenarioManager: ScenarioManager | null = null;

const getScenarioManager = () => {
  if (!globalScenarioManager) {
    globalScenarioManager = new ScenarioManager();
  }
  return globalScenarioManager;
};

const SwipeCard = () => {
  // ALL HOOKS MUST BE CALLED FIRST - before any conditional returns
  const { currentMode, currentCard, hasSeenSwipeTutorial, setCurrentCard } = useGameStore();
  const [isLoading, setIsLoading] = useState(false);

  // Force-load mechanism: If no card, load scenario data
  useEffect(() => {
    // If in exploration mode and no card, force load from scenario
    if (currentMode === 'exploration' && !currentCard) {
      setIsLoading(true);
      console.log('[SwipeCard] No card found, force-loading from scenario...');

      const manager = getScenarioManager();

      // Try to start scenario from beginning
      try {
        manager.startScenario('c1_01_intro');
        console.log('[SwipeCard] Force-loaded initial card via startScenario');
      } catch (e) {
        // Fallback: Create emergency placeholder card
        const fallbackCard: CardEvent = {
          id: 'emergency_fallback',
          type: 'story',
          title: 'グンマー深淵へようこそ',
          description: '探索を開始します。画面をタップしてください。',
          text: '探索を開始します。画面をタップしてください。',
          image: '/assets/bg/exploration_bg.png',
          next: 'c1_01_intro'
        };
        setCurrentCard(fallbackCard);
        console.log('[SwipeCard] Using fallback card');
      }

      setTimeout(() => setIsLoading(false), 300);
    }
  }, [currentMode, currentCard, setCurrentCard]);

  useEffect(() => {
    getScenarioManager();
  }, []);

  const handleSwipe = (direction: 'left' | 'right', card: CardEvent) => {
    const manager = getScenarioManager();
    manager.processCardAction(card, direction);
  };

  // CONDITIONAL RETURNS AFTER ALL HOOKS
  // Don't render in battle mode
  if (currentMode === 'battle') {
    return null;
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <motion.div
          className="flex flex-col items-center gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="w-12 h-12 rounded-full border-4 border-t-transparent"
            style={{ borderColor: '#00FFCC', borderTopColor: 'transparent' }}
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
          <span className="text-sm text-[#00FFCC] tracking-widest">読み込み中...</span>
        </motion.div>
      </div>
    );
  }

  if (!currentCard) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center">
          <motion.div
            className="text-sm mb-2"
            style={{ color: 'var(--color-text-medium)' }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            探索モードでカードを表示
          </motion.div>
          <div
            className="text-xs"
            style={{ color: 'var(--color-text-low)' }}
          >
            スワイプしてイベントを処理
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative flex items-center justify-center p-6">
      {/* Subtle Arrow Guides (tutorial only) */}
      {!hasSeenSwipeTutorial && currentCard.type !== 'story' && (
        <>
          <motion.div
            className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold z-40"
            style={{ color: 'var(--color-accent-red)' }}
            animate={{ opacity: [0.2, 0.6, 0.2], x: [-3, 0, -3] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            ◀
          </motion.div>
          <motion.div
            className="absolute right-4 top-1/2 -translate-y-1/2 text-2xl font-bold z-40"
            style={{ color: 'var(--color-accent-primary)' }}
            animate={{ opacity: [0.2, 0.6, 0.2], x: [3, 0, 3] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            ▶
          </motion.div>
        </>
      )}

      <Card
        key={currentCard.id}
        card={currentCard}
        index={0}
        onSwipe={handleSwipe}
        isTop={true}
      />
    </div>
  );
};

export default SwipeCard;
