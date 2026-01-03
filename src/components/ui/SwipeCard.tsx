import { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { useGameStore } from '../../stores/gameStore';
import type { CardEvent } from '../../types';
import scenariosData from '../../assets/data/scenarios.json';
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

  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 100;
    if (info.offset.x > threshold) {
      onSwipe('right', card);
    } else if (info.offset.x < -threshold) {
      onSwipe('left', card);
    }
  };

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
      className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing"
      style={{
        x,
        rotate,
        opacity,
        zIndex: 100,
      }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.2}
      onDragEnd={handleDragEnd}
      initial={{ scale: 1 }}
      whileDrag={{ scale: 1.05 }}
    >
      <div className="w-full h-full bg-gunma-konnyaku border-2 border-gunma-accent/50 rounded-xl glass p-6 flex flex-col shadow-2xl">
        <div className="text-gunma-accent text-xs mb-2">
          [{card.type.toUpperCase()}]
        </div>
        <h3 className="text-gunma-text text-xl font-bold mb-3">{card.title}</h3>
        <p className="text-gunma-text text-sm opacity-90 flex-1 mb-4">{card.description}</p>
        
        <div className="flex gap-2 text-xs text-gunma-text opacity-60">
          <span>← 逃げる</span>
          <span className="ml-auto">戦う →</span>
        </div>
      </div>

      {/* Accept Overlay */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{ opacity: acceptOpacity }}
      >
        <div className="bg-gunma-accent/20 border-4 border-gunma-accent rounded-xl px-8 py-4">
          <span className="text-gunma-accent text-2xl font-bold glitch-text">FIGHT</span>
        </div>
      </motion.div>

      {/* Reject Overlay */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{ opacity: rejectOpacity }}
      >
        <div className="bg-red-500/20 border-4 border-red-500 rounded-xl px-8 py-4">
          <span className="text-red-500 text-2xl font-bold">RUN</span>
        </div>
      </motion.div>
    </motion.div>
  );
};

const SwipeCard = () => {
  const { currentMode, setCurrentCard } = useGameStore();
  const [cards, setCards] = useState<CardEvent[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const scenarioManagerRef = useRef<ScenarioManager | null>(null);

  useEffect(() => {
    if (!scenarioManagerRef.current) {
      scenarioManagerRef.current = new ScenarioManager();
    }
  }, []);

  useEffect(() => {
    const events = scenariosData.events as CardEvent[];
    setCards(events);
    if (events.length > 0) {
      setCurrentCard(events[0]);
    }
  }, [setCurrentCard]);

  const handleSwipe = (direction: 'left' | 'right', card: CardEvent) => {
    if (scenarioManagerRef.current) {
      scenarioManagerRef.current.processCardAction(card, direction);
    }

    const nextIndex = currentIndex + 1;
    if (nextIndex < cards.length) {
      setCurrentIndex(nextIndex);
      setCurrentCard(cards[nextIndex]);
    } else {
      setCurrentCard(undefined);
    }
  };

  if (currentMode !== 'exploration' || cards.length === 0 || currentIndex >= cards.length) {
    return (
      <div className="w-full h-full flex items-center justify-center text-gunma-text opacity-50">
        <div className="text-center">
          <div className="text-sm mb-2">[探索モードでカードを表示]</div>
          <div className="text-xs opacity-60">スワイプしてイベントを処理</div>
        </div>
      </div>
    );
  }

  const visibleCards = cards.slice(currentIndex, Math.min(currentIndex + 3, cards.length));

  return (
    <div className="w-full h-full relative flex items-center justify-center p-4">
      {visibleCards.map((card, idx) => (
        <Card
          key={card.id}
          card={card}
          index={idx}
          onSwipe={handleSwipe}
          isTop={idx === 0}
        />
      ))}
    </div>
  );
};

export default SwipeCard;

