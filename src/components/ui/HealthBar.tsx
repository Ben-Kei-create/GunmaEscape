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
      <div className="flex justify-between items-center text-xs mb-1">
        <div className="text-yellow-400 font-bold">
          Lv.{playerLevel}
        </div>
        <div className="text-gunma-accent opacity-70">
          [HP: {Math.floor(displayHp)}/{maxHp}]
        </div>
      </div>

      {/* HP Bar */}
      <div className="w-full h-6 bg-black border-2 border-gunma-accent rounded overflow-hidden relative shadow-neon">
        {/* Grid Background */}
        <div className="absolute inset-0 opacity-20"
          style={{ backgroundImage: 'linear-gradient(90deg, transparent 95%, #39ff14 95%)', backgroundSize: '10px 100%' }} />

        <motion.div
          className="h-full relative"
          initial={{ width: `${(hp / maxHp) * 100}%` }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          style={{
            background: isLow
              ? 'linear-gradient(90deg, #ff00ff 0%, #ff0000 100%)'
              : 'linear-gradient(90deg, #39ff14 0%, #2dd012 100%)',
          }}
        >
          {/* Gloss Highlight */}
          <div className="absolute top-0 left-0 w-full h-1/2 bg-white/20" />
        </motion.div>

        {/* ECG Scanner Line */}
        <motion.div
          className="absolute top-0 bottom-0 w-8 bg-gradient-to-r from-transparent via-white/80 to-transparent skew-x-12"
          animate={{ left: ['-20%', '120%'] }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        />

        {isLow && (
          <motion.div
            className="absolute inset-0 bg-gunma-magenta mix-blend-overlay"
            animate={{ opacity: [0, 0.5, 0] }}
            transition={{ duration: 0.5, repeat: Infinity }}
          />
        )}
      </div>

      {/* Exp Bar */}
      <div className="w-full h-2 bg-black/50 border border-yellow-500/30 rounded-sm mt-1 overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-yellow-600 to-yellow-400"
          initial={{ width: 0 }}
          animate={{ width: `${expPercentage}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
      <div className="text-[10px] text-yellow-500/60 text-right mt-0.5">
        EXP: {playerExp}/{expToNextLevel}
      </div>
    </div>
  );
};

export default HealthBar;
