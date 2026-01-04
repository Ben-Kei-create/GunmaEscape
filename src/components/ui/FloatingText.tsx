import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../stores/gameStore';

interface FloatingTextItem {
    id: string;
    value: number | string;
    x: number;
    y: number;
    type: 'damage' | 'heal' | 'critical' | 'gold_critical';
}

const FloatingTextDisplay = () => {
    const { floatingTexts, removeFloatingText } = useGameStore();

    return (
        <div className="fixed inset-0 pointer-events-none z-30 overflow-hidden">
            <AnimatePresence>
                {floatingTexts.map((text: FloatingTextItem) => (
                    <FloatingTextItem
                        key={text.id}
                        text={text}
                        onComplete={() => removeFloatingText(text.id)}
                    />
                ))}
            </AnimatePresence>
        </div>
    );
};

interface FloatingTextItemProps {
    text: FloatingTextItem;
    onComplete: () => void;
}

const FloatingTextItem = ({ text, onComplete }: FloatingTextItemProps) => {
    useEffect(() => {
        const timer = setTimeout(onComplete, 1200);
        return () => clearTimeout(timer);
    }, [onComplete]);

    const getStyle = () => {
        switch (text.type) {
            case 'gold_critical':
                return {
                    color: '#ffd700', // Gold
                    fontSize: '3rem',
                    textShadow: '0 0 15px #ffd700, 2px 2px 4px rgba(0,0,0,0.9)',
                };
            case 'critical':
                return {
                    color: '#ff3914', // Neon Red/Orange
                    fontSize: '2rem',
                    textShadow: '0 0 10px #ff3914, 2px 2px 4px rgba(0,0,0,0.8)',
                };
            case 'heal':
                return {
                    color: '#4ADE80',
                    fontSize: '1.5rem',
                    textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                };
            case 'damage':
            default:
                return {
                    color: '#FF4444',
                    fontSize: '1.5rem',
                    textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                };
        }
    };

    const style = getStyle();

    let content = text.value;
    if (typeof text.value === 'number') {
        const prefix = text.type === 'heal' ? '+' : (text.type === 'damage' ? '-' : '');
        content = `${prefix}${text.value}`;
    }

    return (
        <motion.div
            initial={{
                opacity: 1,
                y: text.y,
                x: text.x,
                scale: (text.type === 'critical' || text.type === 'gold_critical') ? 0 : 0.5,
            }}
            animate={{
                opacity: [1, 1, 0],
                y: text.y - 120, // Move higher
                scale: (text.type === 'critical' || text.type === 'gold_critical') ? [0, 1.5, 1] : 1,
                rotate: (text.type === 'gold_critical') ? [0, -5, 5, 0] : 0,
            }}
            transition={{
                duration: 1.2,
                times: [0, 0.2, 1],
                ease: 'easeOut',
            }}
            className="absolute font-bold font-mono whitespace-nowrap"
            style={{
                ...style,
                transform: 'translateX(-50%)',
            }}
        >
            {content}
        </motion.div>
    );
};

export default FloatingTextDisplay;
