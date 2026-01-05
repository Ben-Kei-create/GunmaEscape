import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { usePlayerStore } from '../../stores/playerStore';

/**
 * Apple-Style Minimal Health Bar
 * Clean, elegant, and functional
 */
const HealthBar = () => {
  const { hp, maxHp } = usePlayerStore();
  const [displayHp, setDisplayHp] = useState(hp);

  useEffect(() => {
    if (hp !== displayHp) {
      const timer = setTimeout(() => {
        setDisplayHp(hp);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [hp, displayHp]);

  const hpPercentage = Math.max(0, Math.min(100, (displayHp / maxHp) * 100));
  // Calculate colors based on HP - Simple Green Gradient
  const getGradient = () => {
    if (hpPercentage < 30) return 'linear-gradient(to right, #FF3B30, #FF9500)';
    if (hpPercentage < 60) return 'linear-gradient(to right, #FFCC00, #FFD60A)';
    return 'linear-gradient(to right, #28CD41, #32D74B)'; // Green
  };

  return (
    <div className="w-full mb-2">
      {/* HP Bar Container */}
      <div
        className="h-9 w-full bg-gray-900 rounded-lg overflow-hidden relative border border-gray-700 shadow-inner"
      >
        {/* Fill */}
        <motion.div
          className="h-full absolute left-0 top-0"
          style={{
            background: getGradient(),
            width: `${hpPercentage}%`,
            boxShadow: '0 0 10px rgba(40, 205, 65, 0.5)'
          }}
          animate={{ width: `${hpPercentage}%` }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
        />

        {/* Text (Centered) */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className="text-xs font-bold tracking-wide drop-shadow-md"
            style={{ color: '#FFFFFF', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}
          >
            HP {Math.floor(displayHp)}/{maxHp}
          </span>
        </div>
      </div>
    </div>
  );
};

export default HealthBar;


