import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore, type LogEntry } from '../../stores/gameStore';

/**
 * Apple-Style Typewriter Log Display
 * Clean, minimal battle log with fade effect
 */

const getLogColor = (type: LogEntry['type']) => {
    switch (type) {
        case 'damage':
            return 'var(--color-accent-red)';
        case 'heal':
            return 'var(--color-accent-primary)';
        case 'critical':
            return 'var(--color-accent-yellow)';
        case 'victory':
            return 'var(--color-accent-yellow)';
        case 'defeat':
            return 'var(--color-accent-red)';
        case 'battle':
            return 'var(--color-accent-orange)';
        case 'error':
            return 'var(--color-accent-red)';
        case 'info':
            return 'var(--color-accent-blue)';
        default:
            return 'var(--color-text-medium)';
    }
};

const TypewriterLog = () => {
    const { logs, currentMode } = useGameStore();
    const [displayText, setDisplayText] = useState('');
    const [currentLogIndex, setCurrentLogIndex] = useState(-1);
    const [isTyping, setIsTyping] = useState(false);
    const [isSkipped, setIsSkipped] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Get latest 3 logs
    const recentLogs = logs.slice(-3);

    // Typewriter effect for the latest log
    useEffect(() => {
        if (logs.length === 0) return;

        const latestIndex = logs.length - 1;
        if (latestIndex !== currentLogIndex) {
            setCurrentLogIndex(latestIndex);
            setIsTyping(true);
            setIsSkipped(false);
            setDisplayText('');

            const message = logs[latestIndex].message;
            let charIndex = 0;

            const typeInterval = setInterval(() => {
                if (charIndex < message.length) {
                    setDisplayText(message.substring(0, charIndex + 1));
                    charIndex++;
                } else {
                    setIsTyping(false);
                    clearInterval(typeInterval);
                }
            }, 30);

            return () => clearInterval(typeInterval);
        }
    }, [logs, currentLogIndex]);

    // Skip typewriter on tap
    const handleTap = () => {
        if (isTyping && logs.length > 0) {
            setIsSkipped(true);
            setIsTyping(false);
            setDisplayText(logs[logs.length - 1].message);
        }
    };

    if (currentMode !== 'battle' || logs.length === 0) {
        return null;
    }

    const latestLog = logs[logs.length - 1];
    const olderLogs = recentLogs.slice(0, -1);

    return (
        <div
            ref={containerRef}
            className="w-full px-4 py-3 relative"
            onClick={handleTap}
        >
            {/* Older Logs (faded) */}
            <AnimatePresence>
                {olderLogs.map((log, idx) => (
                    <motion.div
                        key={`old-${logs.length - 3 + idx}`}
                        className="text-xs mb-0.5 font-medium"
                        style={{
                            color: getLogColor(log.type),
                            opacity: 0.4
                        }}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 0.4, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                    >
                        {log.message}
                    </motion.div>
                ))}
            </AnimatePresence>

            {/* Latest Log (full opacity, typewriter) */}
            <motion.div
                className="text-sm font-medium"
                style={{ color: getLogColor(latestLog.type) }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
            >
                {isTyping && !isSkipped ? displayText : latestLog.message}

                {/* Blinking cursor while typing */}
                {isTyping && !isSkipped && (
                    <motion.span
                        className="inline-block w-0.5 h-4 ml-0.5 align-middle"
                        style={{ background: getLogColor(latestLog.type) }}
                        animate={{ opacity: [1, 0, 1] }}
                        transition={{ duration: 0.8, repeat: Infinity }}
                    />
                )}
            </motion.div>

            {/* Tap to skip indicator */}
            {isTyping && (
                <motion.div
                    className="text-[10px] mt-2 text-right"
                    style={{ color: 'var(--color-text-low)' }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                >
                    タップでスキップ ▼
                </motion.div>
            )}
        </div>
    );
};

export default TypewriterLog;