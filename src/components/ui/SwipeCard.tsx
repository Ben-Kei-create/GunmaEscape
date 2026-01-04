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

/**
 * Get card accent color based on type
 */
const getCardAccent = (type: string) => {
  switch (type) {
    case 'battle':
      return 'var(--color-accent-red)';
    case 'story':
      return 'var(--color-accent-blue)';
    case 'treasure':
    case 'reward':
      return 'var(--color-accent-yellow)';
    case 'event':
      return 'var(--color-accent-orange)';
    default:
      return 'var(--color-accent-primary)';
  }
};

const Card = ({ card, index, onSwipe, isTop }: SwipeCardProps) => {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-12, 12]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0.5, 1, 1, 1, 0.5]);

  const acceptOpacity = useTransform(x, [0, 80], [0, 1]);
  const rejectOpacity = useTransform(x, [-80, 0], [1, 0]);

  const { hasSeenSwipeTutorial, setHasSeenSwipeTutorial } = useGameStore();
  const [isDragging, setIsDragging] = useState(false);

  const isStory = card.type === 'story';
  const accentColor = getCardAccent(card.type);

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

  const leftLabel = (card as any).choices?.left?.text || '← スキップ';
  const rightLabel = (card as any).choices?.right?.text || '進む →';

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
        className="w-full h-full rounded-2xl overflow-hidden flex flex-col relative"
        style={{
          background: 'rgba(28, 28, 30, 0.85)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 1px rgba(48, 209, 88, 0.3)',
          border: '1px solid rgba(48, 209, 88, 0.25)'
        }}
      >
        {/* Left Accent Border */}
        <div
          className="absolute left-0 top-4 bottom-4 w-1 rounded-full"
          style={{ background: accentColor }}
        />

        {/* Card Content */}
        <div className="flex-1 p-6 pl-8 flex flex-col">
          {/* Type Badge */}
          <div
            className="inline-flex items-center self-start px-3 py-1 rounded-full mb-4"
            style={{
              background: `${accentColor}20`,
              color: accentColor,
            }}
          >
            <span className="text-[10px] font-bold tracking-widest uppercase">
              {card.type}
            </span>
          </div>

          {/* Title */}
          <h3
            className="text-base font-bold mb-2 leading-tight"
            style={{ color: 'var(--color-accent-primary)' }}
          >
            {card.title}
          </h3>

          {/* Description */}
          <p
            className="text-xs leading-relaxed flex-1 whitespace-pre-wrap overflow-y-auto pr-2"
            style={{
              color: 'var(--color-text-medium)',
              scrollbarWidth: 'thin'
            }}
          >
            {card.text || card.description}
          </p>

          {/* Action Hints */}
          <div className="mt-3 pt-3 border-t" style={{ borderColor: 'rgba(48, 209, 88, 0.15)' }}>
            {isStory ? (
              <motion.div
                className="flex items-center justify-center gap-2 text-xs"
                style={{ color: 'var(--color-accent-primary)' }}
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <span>▼</span>
                <span>タップして続ける</span>
              </motion.div>
            ) : (
              <div className="flex justify-between text-xs font-medium">
                <span style={{ color: 'var(--color-accent-red)' }}>{leftLabel}</span>
                <span style={{ color: 'var(--color-accent-primary)' }}>{rightLabel}</span>
              </div>
            )}
          </div>
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
  const { currentMode, currentCard, hasSeenSwipeTutorial } = useGameStore();

  useEffect(() => {
    getScenarioManager();
  }, []);

  const handleSwipe = (direction: 'left' | 'right', card: CardEvent) => {
    const manager = getScenarioManager();
    manager.processCardAction(card, direction);
  };

  if (currentMode !== 'exploration' || !currentCard) {
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
