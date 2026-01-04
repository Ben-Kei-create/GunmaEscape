import { motion } from 'framer-motion';

const CRTOverlay = () => {
    return (
        <div className="fixed inset-0 z-[60] pointer-events-none overflow-hidden select-none">
            {/* Scanlines */}
            <div
                className="absolute inset-0 opacity-10"
                style={{
                    background: 'repeating-linear-gradient(0deg, transparent 0px, transparent 1px, #fff 2px, transparent 3px)',
                    backgroundSize: '100% 4px'
                }}
            />

            {/* Vignette */}
            <div
                className="absolute inset-0"
                style={{
                    background: 'radial-gradient(circle at center, transparent 60%, rgba(0,0,0,0.6) 100%)'
                }}
            />

            {/* Subtle Flicker */}
            <motion.div
                className="absolute inset-0 bg-white"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.02, 0, 0, 0.01, 0] }}
                transition={{
                    duration: 5,
                    repeat: Infinity,
                    times: [0, 0.05, 0.1, 0.8, 0.85, 1],
                    ease: "linear"
                }}
                style={{ mixBlendMode: 'overlay' }}
            />
        </div>
    );
};

export default CRTOverlay;
