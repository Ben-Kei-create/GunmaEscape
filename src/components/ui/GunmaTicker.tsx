import { useEffect, useState } from 'react';
import { useGameStore } from '../../stores/gameStore';
import { tickerMessages } from '../../assets/data/tickerMessages';

const GunmaTicker = () => {
    const [content, setContent] = useState('');
    const { isTitleVisible, currentMode } = useGameStore();

    useEffect(() => {
        // Join messages and duplicate purely for safety, though CSS handles the loop
        const text = tickerMessages.join(' +++ ');
        setContent(text);
    }, []);

    // Only show in Exploration or Battle, and NOT on title
    if (isTitleVisible || (currentMode !== 'exploration' && currentMode !== 'battle')) {
        return null;
    }

    return (
        <div className="fixed top-0 left-0 w-full pt-[env(safe-area-inset-top)] bg-black/80 border-b border-gunma-accent/50 z-40 flex items-center overflow-hidden pointer-events-none">
            {/* Container for the scrolling text */}
            <div className="ticker-wrap w-full py-1">
                <div className="ticker-move">
                    <div className="ticker-item text-gunma-accent font-mono text-xs tracking-widest whitespace-nowrap inline-block px-4 opacity-80">
                        {content} +++ {content}
                    </div>
                </div>
            </div>

            <style>{`
            .ticker-wrap {
                width: 100%;
                overflow: hidden;
                white-space: nowrap;
            }
            .ticker-move {
                display: inline-block;
                white-space: nowrap;
                animation: ticker 120s linear infinite; // Slowed down to 120s
            }
            .ticker-item {
                display: inline-block;
                padding-right: 2rem;
            }
            @keyframes ticker {
                0% {
                    transform: translate3d(0, 0, 0);
                }
                100% {
                    transform: translate3d(-50%, 0, 0);
                }
            }
        `}</style>
        </div>
    );
};

export default GunmaTicker;
