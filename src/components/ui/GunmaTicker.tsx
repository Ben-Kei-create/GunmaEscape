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
        <div className="fixed bottom-0 left-0 w-full h-8 bg-black border-t-2 border-gunma-accent z-50 flex items-center overflow-hidden">
            {/* Container for the scrolling text */}
            <div className="ticker-wrap w-full">
                <div className="ticker-move">
                    <div className="ticker-item text-gunma-accent font-mono text-sm tracking-widest whitespace-nowrap inline-block px-4">
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
