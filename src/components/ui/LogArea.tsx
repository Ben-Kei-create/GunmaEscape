import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useGameStore, type LogEntry } from '../../stores/gameStore';

const getLogStyle = (type: LogEntry['type']) => {
  switch (type) {
    case 'damage':
      return 'text-red-400 font-bold';
    case 'heal':
      return 'text-green-400 font-semibold';
    case 'critical':
      return 'text-gunma-accent font-bold glitch-text';
    case 'victory':
      return 'text-yellow-400 font-bold text-lg';
    case 'defeat':
      return 'text-red-500 font-bold text-lg';
    case 'battle':
      return 'text-orange-400 font-semibold';
    case 'error':
      return 'text-red-500 font-bold';
    case 'story':
      return 'text-blue-300';
    default:
      return 'text-gunma-text opacity-90';
  }
};

const LogArea = () => {
  const logRef = useRef<HTMLDivElement>(null);
  const { logs, currentMode } = useGameStore();

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [logs]);

  // Show blinking cursor when not in battle (waiting for player input)
  const showCursor = currentMode === 'exploration' && logs.length > 0;

  return (
    <div
      ref={logRef}
      className="w-full h-full overflow-y-auto p-2 relative"
      style={{ scrollBehavior: 'smooth' }}
    >
      <div className="space-y-1 font-mono text-sm leading-relaxed tracking-wide">
        {logs.map((log, index) => (
          <div
            key={index}
            className={getLogStyle(log.type)}
          >
            {log.message}
          </div>
        ))}
      </div>

      {/* Blinking Wait Cursor */}
      {showCursor && (
        <motion.div
          className="absolute bottom-4 right-4 text-gunma-accent text-xl font-bold"
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
        >
          ▼
        </motion.div>
      )}
    </div>
  );
};

export default LogArea;

