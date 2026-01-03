import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../stores/gameStore';

interface FloatingTextItem {
    id: string;
    value: number;
    x: number;
    y: number;
    type: 'damage' | 'heal' | 'critical';
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
        const timer = setTimeout(onComplete, 1000);
        return () => clearTimeout(timer);
    }, [onComplete]);

    const getStyle = () => {
        switch (text.type) {
            case 'critical':
                return {
                    color: '#FFD700',
                    fontSize: '2rem',
                    textShadow: '0 0 10px #FFD700, 2px 2px 4px rgba(0,0,0,0.8)',
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
    const prefix = text.type === 'heal' ? '+' : '-';

    return (
        <motion.div
            initial={{
                opacity: 1,
                y: text.y,
                x: text.x,
                scale: text.type === 'critical' ? 1.5 : 1,
            }}
            animate={{
                opacity: 0,
                y: text.y - 60,
                scale: text.type === 'critical' ? 1 : 0.8,
            }}
            exit={{ opacity: 0 }}
            transition={{
                duration: 0.8,
                ease: 'easeOut',
            }}
            className="absolute font-bold font-mono"
            style={{
                ...style,
                transform: 'translateX(-50%)',
            }}
        >
            {text.type === 'critical' && (
                <motion.span
                    animate={{
                        x: [-2, 2, -2, 2, 0],
                        rotate: [-5, 5, -5, 5, 0],
                    }}
                    transition={{ duration: 0.3 }}
                >
                    {prefix}{text.value}!
                </motion.span>
            )}
            {text.type !== 'critical' && (
                <span>{prefix}{text.value}</span>
            )}
        </motion.div>
    );
};

export default FloatingTextDisplay;
