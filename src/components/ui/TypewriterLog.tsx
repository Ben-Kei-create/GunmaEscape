import { useState, useEffect, useRef } from 'react';
import { useGameStore, type LogEntry } from '../../stores/gameStore';

const getLogStyle = (type: LogEntry['type']) => {
    switch (type) {
        case 'damage':
            return 'text-red-400';
        case 'heal':
            return 'text-green-400';
        case 'critical':
            return 'text-gunma-accent font-bold';
        case 'victory':
            return 'text-yellow-400 font-bold';
        case 'defeat':
            return 'text-red-500 font-bold';
        case 'battle':
            return 'text-orange-400';
        case 'error':
            return 'text-red-500';
        case 'story':
            return 'text-blue-300';
        default:
            return 'text-gunma-accent';
    }
};

const TypewriterLog = () => {
    const { logs } = useGameStore();
    const containerRef = useRef<HTMLDivElement>(null);
    const [displayedText, setDisplayedText] = useState('');
    const [currentLogIndex, setCurrentLogIndex] = useState(-1);
    const [isTyping, setIsTyping] = useState(false);

    // Get the latest log
    const latestLog = logs.length > 0 ? logs[logs.length - 1] : null;
    const olderLogs = logs.slice(-7, -1); // Show up to 6 older logs

    // Detect new log and start typewriter
    useEffect(() => {
        if (logs.length > 0 && logs.length - 1 !== currentLogIndex) {
            setCurrentLogIndex(logs.length - 1);
            setDisplayedText('');
            setIsTyping(true);
        }
    }, [logs.length, currentLogIndex]);

    // Typewriter effect
    useEffect(() => {
        if (!isTyping || !latestLog) return;

        const fullText = latestLog.message;
        let charIndex = 0;

        const interval = setInterval(() => {
            if (charIndex < fullText.length) {
                setDisplayedText(fullText.slice(0, charIndex + 1));
                charIndex++;
            } else {
                setIsTyping(false);
                clearInterval(interval);
            }
        }, 25); // 25ms per character

        return () => clearInterval(interval);
    }, [isTyping, latestLog]);

    // Auto-scroll to bottom
    useEffect(() => {
        if (containerRef.current) {
            containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }
    }, [logs.length, displayedText]);

    return (
        <div
            ref={containerRef}
            className="w-full h-32 overflow-y-auto bg-black/80 border-l-2 border-gunma-accent/50 px-2 py-1 log-scrollbar rounded"
            style={{ scrollBehavior: 'smooth' }}
        >
            {/* ▼ 修正箇所：フォントサイズと折り返し設定を変更しました
               text-[10px]: フォントサイズを10pxに強制
               leading-tight: 行間を詰める
               break-all: 長い単語を強制的に改行してUI崩れを防ぐ
            */}
            <div className="space-y-0.5 font-mono text-[10px] leading-tight break-all">
                {/* Older logs (displayed instantly) */}
                {olderLogs.map((log, index) => (
                    <div
                        key={index}
                        className={`${getLogStyle(log.type)} opacity-60`}
                    >
                        {log.message}
                    </div>
                ))}

                {/* Latest log (typewriter effect) */}
                {latestLog && (
                    <div className={`${getLogStyle(latestLog.type)} relative`}>
                        {displayedText}
                        {/* Blinking cursor during typing */}
                        {isTyping && (
                            <span className="animate-pulse ml-0.5 text-gunma-accent">▌</span>
                        )}
                    </div>
                )}

                {/* Empty state */}
                {logs.length === 0 && (
                    <div className="text-gray-500">&gt; SYSTEM READY</div>
                )}
            </div>
        </div>
    );
};

export default TypewriterLog;