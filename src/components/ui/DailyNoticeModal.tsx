import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../stores/gameStore';
import { soundManager } from '../../systems/SoundManager';
import { hapticsManager } from '../../systems/HapticsManager';

const DailyNoticeModal = () => {
    const { lastLoginDate, setLastLoginDate, addItem, addLog } = useGameStore();
    const [isOpen, setIsOpen] = useState(false);
    const [displayText, setDisplayText] = useState('');
    const fullText = `群馬県境対策本部より通達

各位殿

本日も群馬県内での活動を確認いたしました。
引き続き警戒を怠らず、任務を遂行されたし。

なお、本日の配給物資として下記を支給いたします。

- 焼きまんじゅう x 1

以上、群馬県境対策本部`;

    useEffect(() => {
        // Check if we should show the notice
        const today = new Date().toDateString();

        if (lastLoginDate !== today) {
            // New day, show notice
            setIsOpen(true);
            setLastLoginDate(today);

            // Typewriter effect
            let index = 0;
            const interval = setInterval(() => {
                if (index < fullText.length) {
                    setDisplayText(fullText.slice(0, index + 1));
                    index++;
                } else {
                    clearInterval(interval);
                }
            }, 30);

            return () => clearInterval(interval);
        }
    }, [lastLoginDate, setLastLoginDate]);

    const handleClaim = () => {
        // Grant reward
        addItem('yakimanju');
        addLog('> 本日の配給を受け取った', 'heal');

        soundManager.playSe('equip');
        hapticsManager.mediumImpact();

        setIsOpen(false);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4"
                    onClick={() => { }} // Prevent close on backdrop click - must claim
                >
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        className="w-full max-w-md bg-amber-50 border-4 border-red-900 p-6 shadow-2xl relative"
                        style={{
                            fontFamily: 'serif',
                            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)',
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Official Stamp */}
                        <div className="absolute top-4 right-4 w-20 h-20 border-4 border-red-600 rounded-full flex items-center justify-center rotate-12 opacity-70">
                            <div className="text-center">
                                <div className="text-red-600 font-black text-xs">極秘</div>
                                <div className="text-red-600 font-black text-[10px]">機密</div>
                            </div>
                        </div>

                        {/* Header */}
                        <div className="text-center mb-6 border-b-2 border-black pb-3">
                            <h2 className="text-2xl font-black tracking-wider">【重要】</h2>
                            <p className="text-sm mt-1 text-gray-700">群馬県境対策本部</p>
                        </div>

                        {/* Content with typewriter */}
                        <div className="mb-6 min-h-[300px]">
                            <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-gray-900">
                                {displayText}
                            </pre>
                        </div>

                        {/* Claim Button */}
                        <motion.button
                            onClick={handleClaim}
                            disabled={displayText.length < fullText.length}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full py-4 bg-red-900 text-white font-black text-lg
                         rounded shadow-lg disabled:opacity-50 disabled:cursor-not-allowed
                         border-2 border-red-700"
                        >
                            {displayText.length < fullText.length ? '読み込み中...' : '配給を受領する'}
                        </motion.button>

                        {/* Footer Note */}
                        <p className="text-xs text-center text-gray-500 mt-3">
                            ※ 本通達は1日1回のみ発行されます
                        </p>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default DailyNoticeModal;
