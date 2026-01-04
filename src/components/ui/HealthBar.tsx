import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { usePlayerStore } from '../../stores/playerStore';
import { useGameStore } from '../../stores/gameStore';

/**
 * Apple-Style Minimal Health Bar
 * Clean, elegant, and functional
 */
const HealthBar = () => {
  const { hp, maxHp } = usePlayerStore();
  const { playerLevel, playerExp, expToNextLevel } = useGameStore();
  const [displayHp, setDisplayHp] = useState(hp);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (hp !== displayHp) {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        setDisplayHp(hp);
        setIsAnimating(false);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [hp, displayHp]);

  const percentage = Math.max(0, Math.min(100, (displayHp / maxHp) * 100));
  const expPercentage = Math.max(0, Math.min(100, (playerExp / expToNextLevel) * 100));
  const isLow = percentage < 30;
  const isCritical = percentage < 15;

  return (
    <div className="w-full max-w-md mx-auto px-4">
      {/* Level Badge & HP Label */}
      <div className="flex justify-between items-center mb-2">
        {/* Level Pill Badge */}
        <motion.div
          className="flex items-center gap-2"
          initial={false}
          animate={isAnimating ? { scale: [1, 1.05, 1] } : {}}
        >
          <div
            className="px-3 py-1 rounded-full text-xs font-semibold tracking-wide"
            style={{
              background: 'var(--color-bg-elevated)',
              color: 'var(--color-accent-yellow)',
              border: '1px solid rgba(255, 214, 10, 0.3)'
            }}
          >
            Lv.{playerLevel}
          </div>
        </motion.div>

        {/* HP Value */}
        <div
          className="text-xs font-medium tracking-wider"
          style={{ color: 'var(--color-text-medium)' }}
        >
          <span style={{ color: isLow ? 'var(--color-accent-red)' : 'var(--color-text-high)' }}>
            {Math.floor(displayHp)}
          </span>
          <span style={{ color: 'var(--color-text-low)' }}> / {maxHp}</span>
        </div>
      </div>

      {/* HP Bar Container */}
      <div
        className="w-full h-2 rounded-full overflow-hidden relative"
        style={{
          background: 'var(--color-bg-surface)',
          boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.3)'
        }}
      >
        {/* Trailing Ghost (damage indicator) */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: 'rgba(255, 69, 58, 0.4)',
            width: `${(hp / maxHp) * 100}%`
          }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
        />

        {/* Main HP Bar */}
        <motion.div
          className="absolute inset-0 rounded-full"
          initial={{ width: `${percentage}%` }}
          animate={{
            width: `${percentage}%`,
            background: isCritical
              ? ['var(--color-accent-red)', 'rgba(255, 69, 58, 0.6)', 'var(--color-accent-red)']
              : isLow
                ? 'var(--color-accent-orange)'
                : 'var(--color-accent-primary)'
          }}
          transition={{
            width: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
            background: isCritical ? { duration: 0.8, repeat: Infinity } : { duration: 0.3 }
          }}
        />
      </div>

      {/* EXP Bar (subtle, under HP) */}
      <div className="mt-2 flex items-center gap-2">
        <span
          className="text-[10px] font-medium"
          style={{ color: 'var(--color-text-low)' }}
        >
          EXP
        </span>
        <div
          className="flex-1 h-1 rounded-full overflow-hidden"
          style={{ background: 'var(--color-bg-surface)' }}
        >
          <motion.div
            className="h-full rounded-full"
            style={{ background: 'var(--color-accent-yellow)' }}
            initial={{ width: 0 }}
            animate={{ width: `${expPercentage}%` }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>
      </div>
    </div>
  );
};

export default HealthBar;
