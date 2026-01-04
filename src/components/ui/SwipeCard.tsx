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
  const rotate = useTransform(x, [-200, 200], [-20, 20]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);

  const acceptOpacity = useTransform(x, [0, 100], [0, 1]);
  const rejectOpacity = useTransform(x, [-100, 0], [1, 0]);

  const { hasSeenSwipeTutorial, setHasSeenSwipeTutorial } = useGameStore();
  const [isDragging, setIsDragging] = useState(false);

  // Determine if this is a story card (tap-to-advance) or action card (swipe-to-choose)
  const isStory = card.type === 'story';

  const handleDragStart = () => {
    setIsDragging(true);
    // Mark swipe tutorial as seen on first drag
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
      // Story cards: tap to advance (always progress forward)
      import('../../systems/SoundManager').then(({ soundManager }) => {
        soundManager.playSe('button_click');
      });
      import('../../systems/HapticsManager').then(({ hapticsManager }) => {
        hapticsManager.lightImpact();
      });
      onSwipe('right', card); // Always advance story
    }
    // Non-story cards: do nothing on click (require swipe)
  };

  // Get choice labels from card data or use defaults
  const leftLabel = (card as any).choices?.left?.text || '← 逃げる';
  const rightLabel = (card as any).choices?.right?.text || '戦う →';

  if (!isTop) {
    return (
      <motion.div
        className="absolute inset-0 w-full h-full"
        style={{
          scale: 1 - (index * 0.05),
          y: index * 8,
          zIndex: 10 - index,
        }}
        initial={{ scale: 1 - (index * 0.05) }}
      >
        <div className="w-full h-full bg-gunma-konnyaku border-2 border-gunma-accent/30 rounded-xl glass p-6 flex flex-col">
          <div className="text-gunma-accent text-xs mb-2 opacity-60">
            [{card.type.toUpperCase()}]
          </div>
          <h3 className="text-gunma-text text-lg font-bold mb-2">{card.title}</h3>
          <p className="text-gunma-text text-sm opacity-80 flex-1">{card.description}</p>
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
      dragElastic={0.2}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={handleClick}
      initial={{ scale: 1 }}
      whileDrag={isStory ? {} : { scale: 1.05 }}
    >
      <div className="w-full h-full bg-gunma-konnyaku border-2 border-gunma-accent/50 rounded-xl glass p-6 flex flex-col shadow-2xl">
        <div className="text-gunma-accent text-xs mb-1 font-bold tracking-wider">
          [{card.type.toUpperCase()}]
        </div>
        <h3 className="text-gunma-text text-base font-bold mb-2 leading-tight">{card.title}</h3>
        <p className="text-gunma-text text-xs leading-relaxed opacity-90 flex-1 mb-2 whitespace-pre-wrap overflow-y-auto scrollbar-thin">
          {card.text || card.description}
        </p>

        {/* Visual Cues: Different for Story vs Action */}
        {isStory ? (
          // Story Card: Tap indicator
          <div className="flex items-center justify-center gap-2 text-sm text-gunma-accent opacity-80 font-bold">
            <motion.span
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              ▼ タップして続ける
            </motion.span>
          </div>
        ) : (
          // Action Card: Swipe indicators with dynamic labels
          <div className="flex gap-2 text-sm text-gunma-text opacity-80 font-bold">
            <span className="text-red-400">{leftLabel}</span>
            <span className="ml-auto text-green-400">{rightLabel}</span>
          </div>
        )}
      </div>

      {/* Accept Overlay with dynamic label */}
      {!isStory && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          style={{ opacity: acceptOpacity }}
        >
          <div className="bg-green-500/20 border-4 border-green-500 rounded-xl px-8 py-4">
            <span className="text-green-500 text-2xl font-bold">{rightLabel.replace('→', '').trim() || 'YES'}</span>
          </div>
        </motion.div>
      )}

      {/* Reject Overlay with dynamic label */}
      {!isStory && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          style={{ opacity: rejectOpacity }}
        >
          <div className="bg-red-500/20 border-4 border-red-500 rounded-xl px-8 py-4">
            <span className="text-red-500 text-2xl font-bold">{leftLabel.replace('←', '').trim() || 'NO'}</span>
          </div>
        </motion.div>
      )}

      {/* Swipe Tutorial Hand Animation */}
      {!isStory && !hasSeenSwipeTutorial && !isDragging && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center pointer-events-none z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <motion.div
            className="text-6xl"
            animate={{
              x: [-30, 30, -30],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            👆
          </motion.div>
          <motion.p
            className="absolute bottom-20 text-white text-sm font-bold bg-black/70 px-4 py-2 rounded-lg"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            ← 左右にスワイプ →
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
    // Initialize scenario manager
    getScenarioManager();
  }, []);

  const handleSwipe = (direction: 'left' | 'right', card: CardEvent) => {
    const manager = getScenarioManager();
    manager.processCardAction(card, direction);
  };

  if (currentMode !== 'exploration' || !currentCard) {
    return (
      <div className="w-full h-full flex items-center justify-center text-gunma-text opacity-50">
        <div className="text-center">
          <div className="text-sm mb-2">[探索モードでカードを表示]</div>
          <div className="text-xs opacity-60">スワイプしてイベントを処理</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative flex items-center justify-center p-4">
      {/* Static Arrow Guides (show during tutorial) */}
      {!hasSeenSwipeTutorial && currentCard.type !== 'story' && (
        <>
          <motion.div
            className="absolute left-2 top-1/2 -translate-y-1/2 text-red-400 text-3xl font-bold z-40"
            animate={{ opacity: [0.3, 1, 0.3], x: [-5, 0, -5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            ◀
          </motion.div>
          <motion.div
            className="absolute right-2 top-1/2 -translate-y-1/2 text-green-400 text-3xl font-bold z-40"
            animate={{ opacity: [0.3, 1, 0.3], x: [5, 0, 5] }}
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
