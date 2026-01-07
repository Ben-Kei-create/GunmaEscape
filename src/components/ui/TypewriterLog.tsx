import { useState, useEffect } from 'react';

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

const TypewriterLog = () => {
    const { logs, currentMode } = useGameStore();
    const [displayText, setDisplayText] = useState('');
    const [currentLogIndex, setCurrentLogIndex] = useState(-1);
    const [isTyping, setIsTyping] = useState(false);
    const [isSkipped, setIsSkipped] = useState(false);

    // Get latest 3 logs
    const recentLogs = logs.slice(-3);

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

    const handleTap = () => {
        if (isTyping && logs.length > 0) {
            setIsSkipped(true);
            setIsTyping(false);
            setDisplayText(logs[logs.length - 1].message);
        }
    };

    if (currentMode !== 'battle' || logs.length === 0) return null;

    const latestLog = logs[logs.length - 1];
    const olderLogs = recentLogs.slice(0, -1);

    return (
        <div
            className="w-full h-full bg-black/60 border-t-2 border-gunma-accent/30 p-2 font-mono text-sm overflow-hidden relative"
            onClick={handleTap}
        >
            {/* Scanline background only for log area */}
            <div className="absolute inset-0 pointer-events-none opacity-10"
                style={{ background: 'linear-gradient(transparent 50%, rgba(57, 255, 20, 0.1) 50%)', backgroundSize: '100% 4px' }} />

            <div className="flex flex-col justify-end h-full relative z-10">
                {/* Older Logs */}
                {olderLogs.map((log, idx) => (
                    <div key={`old-${logs.length - 3 + idx}`} className={`mb-1 ${getLogStyle(log.type, true)}`}>
                        {log.message}
                    </div>
                ))}

                {/* Latest Log with Typewriter */}
                <div className={`leading-relaxed ${getLogStyle(latestLog.type, false)}`}>
                    <span className="mr-2 text-gunma-accent">{'>'}</span>
                    {isTyping && !isSkipped ? displayText : latestLog.message}
                    {isTyping && !isSkipped && <span className="animate-pulse">_</span>}
                </div>

                {/* Skip Indicator */}
                {isTyping && (
                    <div className="absolute right-2 bottom-2 text-[10px] text-gunma-accent opacity-50 animate-pulse">
                        TAP TO SKIP
                    </div>
                )}
            </div>
        </div>
    );
};

export default TypewriterLog;