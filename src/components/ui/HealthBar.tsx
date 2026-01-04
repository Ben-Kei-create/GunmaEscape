import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { usePlayerStore } from '../../stores/playerStore';
import { useGameStore } from '../../stores/gameStore';

const HealthBar = () => {
  const { hp, maxHp } = usePlayerStore();
  const { playerLevel, playerExp, expToNextLevel } = useGameStore();
  const [displayHp, setDisplayHp] = useState(hp);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDisplayHp(hp);
    }, 100);
    return () => clearTimeout(timer);
  }, [hp]);

  const percentage = Math.max(0, Math.min(100, (displayHp / maxHp) * 100));
  const expPercentage = Math.max(0, Math.min(100, (playerExp / expToNextLevel) * 100));
  const isLow = percentage < 30;

  return (
    <div className="w-full max-w-md mx-auto px-4">
      {/* Level and HP Display */}
      <div className="flex justify-between items-center text-xs mb-1 font-mono tracking-wider">
        <div className="text-yellow-400 font-bold">
          Lv.{playerLevel}
        </div>
        <div className="text-[var(--color-text-medium)]">
          HP
        </div>
      </div>

      {/* HP Bar (Antigravity Design) */}
      <div className="w-full h-6 bg-[var(--color-bg-surface)] rounded-[4px] overflow-hidden relative border border-white/10 shadow-sm">

        {/* Trailing Gauge (Delayed White) */}
        <motion.div
          className="absolute top-0 bottom-0 left-0 bg-white"
          initial={{ width: `${(hp / maxHp) * 100}%` }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: "circOut", delay: 0.2 }}
        />

        {/* Main Gauge */}
        <motion.div
          className="absolute top-0 bottom-0 left-0"
          initial={{ width: `${(hp / maxHp) * 100}%` }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          style={{
            background: isLow
              ? 'var(--color-state-danger)'
              : 'var(--color-state-info)'
          }}
        />

        {/* Value Text (Overlay) */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="text-[10px] font-bold text-black/80 drop-shadow-none font-mono tracking-widest">
            {Math.floor(displayHp)} / {maxHp}
          </span>
        </div>
      </div>

      {/* Exp Bar */}
      <div className="w-full h-1 bg-[var(--color-bg-surface)] rounded-full mt-1 overflow-hidden opacity-60">
        <motion.div
          className="h-full bg-yellow-400"
          initial={{ width: 0 }}
          animate={{ width: `${expPercentage}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
    </div>
  );
};

export default HealthBar;
