import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore, type LogEntry } from '../../stores/gameStore';

const getLogStyle = (type: LogEntry['type'], isOld: boolean) => {
  const baseStyle = isOld ? 'opacity-50' : '';

  switch (type) {
    case 'damage':
      return `text-red-400 font-bold ${baseStyle}`;
    case 'heal':
      return `text-green-400 font-semibold ${baseStyle}`;
    case 'critical':
      return `text-gunma-accent font-bold ${isOld ? 'opacity-50' : 'glitch-text'}`;
    case 'victory':
      return `text-yellow-400 font-bold text-lg ${baseStyle}`;
    case 'defeat':
      return `text-red-500 font-bold text-lg ${baseStyle}`;
    case 'battle':
      return `text-orange-400 font-semibold ${baseStyle}`;
    case 'error':
      return `text-red-500 font-bold ${baseStyle}`;
    case 'story':
      return `text-blue-300 ${baseStyle}`;
    default:
      return `text-gunma-text ${isOld ? 'opacity-40' : 'opacity-90'}`;
  }
};

const LogArea = () => {
  const logRef = useRef<HTMLDivElement>(null);
  const { logs, currentMode } = useGameStore();
  const isUserScrolledUp = useRef(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (logRef.current && !isUserScrolledUp.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [logs]);

  const handleScroll = () => {
    if (!logRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = logRef.current;
    // If user is not near bottom, mark as scrolled up
    const isNearBottom = scrollHeight - (scrollTop + clientHeight) < 50;
    isUserScrolledUp.current = !isNearBottom;
  };

  // Show blinking cursor when not in battle (waiting for player input)
  const showCursor = currentMode === 'exploration' && logs.length > 0;

  // Determine which logs are "old" (all except last 3)
  const isOldLog = (index: number) => index < logs.length - 3;

  return (
    <>
      {/* Normal View */}
      <div
        ref={logRef}
        onScroll={handleScroll}
        className="w-full h-full overflow-y-auto p-2 relative log-scrollbar"
        style={{ scrollBehavior: 'smooth' }}
      >
        <div className="space-y-1 font-mono text-sm leading-relaxed tracking-wide">
          {logs.map((log, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
              className={getLogStyle(log.type, isOldLog(index))}
            >
              {log.message}
            </motion.div>
          ))}
        </div>

        {/* Expand Button */}
        <button
          onClick={() => setIsExpanded(true)}
          className="absolute bottom-2 right-2 px-2 py-1 bg-black/70 border border-gunma-accent/50 
                   rounded text-gunma-accent text-xs font-mono hover:bg-gunma-accent/20
                   transition-colors z-10"
        >
          LOG ▼
        </button>

        {/* Blinking Wait Cursor */}
        {showCursor && !isExpanded && (
          <motion.div
            className="absolute bottom-4 left-4 text-gunma-accent text-xl font-bold"
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
          >
            ▼
          </motion.div>
        )}
      </div>

      {/* Expanded Full History Modal */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] bg-black/95 flex flex-col"
            onClick={() => setIsExpanded(false)}
          >
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="flex-1 flex flex-col m-4 border-2 border-gunma-accent/50 rounded-lg overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex justify-between items-center p-3 border-b border-gunma-accent/30 bg-black">
                <h3 className="text-gunma-accent font-mono font-bold">SYSTEM LOG HISTORY</h3>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="text-gunma-accent hover:text-white text-xl"
                >
                  ✕
                </button>
              </div>

              {/* Log Content */}
              <div className="flex-1 overflow-y-auto p-4 log-scrollbar bg-black/80">
                <div className="space-y-2 font-mono text-sm">
                  {logs.map((log, index) => (
                    <div
                      key={index}
                      className={`flex gap-2 ${getLogStyle(log.type, false)}`}
                    >
                      <span className="text-gray-600 text-xs shrink-0">
                        [{new Date(log.timestamp).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}]
                      </span>
                      <span>{log.message}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="p-3 border-t border-gunma-accent/30 bg-black text-center">
                <span className="text-gray-500 text-xs font-mono">
                  {logs.length} entries • Tap outside to close
                </span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default LogArea;
