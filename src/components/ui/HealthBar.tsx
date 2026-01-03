import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { usePlayerStore } from '../../stores/playerStore';

const HealthBar = () => {
  const { hp, maxHp } = usePlayerStore();
  const [displayHp, setDisplayHp] = useState(hp);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDisplayHp(hp);
    }, 100);
    return () => clearTimeout(timer);
  }, [hp]);

  const percentage = Math.max(0, Math.min(100, (displayHp / maxHp) * 100));
  const isLow = percentage < 30;

  return (
    <div className="w-full max-w-md mx-auto px-4">
      <div className="text-xs text-gunma-accent opacity-70 mb-1 text-center">
        [HP: {Math.floor(displayHp)}/{maxHp}]
      </div>
      <div className="w-full h-6 bg-gunma-konnyaku border border-gunma-accent/30 rounded-lg overflow-hidden relative">
        <motion.div
          className={`h-full ${isLow ? 'bg-red-500' : 'bg-green-500'}`}
          initial={{ width: `${(hp / maxHp) * 100}%` }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          style={{
            background: isLow 
              ? 'linear-gradient(90deg, #ef4444 0%, #dc2626 100%)'
              : 'linear-gradient(90deg, #22c55e 0%, #16a34a 100%)',
            boxShadow: isLow 
              ? '0 0 10px rgba(239, 68, 68, 0.5)'
              : '0 0 10px rgba(34, 197, 94, 0.3)',
          }}
        />
        {isLow && (
          <motion.div
            className="absolute inset-0 bg-red-500 opacity-20"
            animate={{ opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        )}
      </div>
    </div>
  );
};

export default HealthBar;

