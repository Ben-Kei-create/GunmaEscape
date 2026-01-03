import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface RippleEffect {
    id: number;
    x: number;
    y: number;
}

interface RippleContainerProps {
    children: React.ReactNode;
}

const RippleContainer = ({ children }: RippleContainerProps) => {
    const [ripples, setRipples] = useState<RippleEffect[]>([]);

    const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const newRipple: RippleEffect = {
            id: Date.now(),
            x,
            y,
        };

        setRipples(prev => [...prev, newRipple]);

        // Remove ripple after animation
        setTimeout(() => {
            setRipples(prev => prev.filter(r => r.id !== newRipple.id));
        }, 600);
    }, []);

    return (
        <div
            className="relative w-full h-full overflow-hidden"
            onClick={handleClick}
        >
            {children}

            {/* Ripple Effects */}
            <AnimatePresence>
                {ripples.map(ripple => (
                    <motion.div
                        key={ripple.id}
                        className="absolute pointer-events-none rounded-full bg-white/20"
                        style={{
                            left: ripple.x,
                            top: ripple.y,
                            transform: 'translate(-50%, -50%)',
                        }}
                        initial={{ width: 0, height: 0, opacity: 0.5 }}
                        animate={{ width: 100, height: 100, opacity: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                    />
                ))}
            </AnimatePresence>
        </div>
    );
};

export default RippleContainer;
