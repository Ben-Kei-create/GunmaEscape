import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import html2canvas from 'html2canvas';
import { soundManager } from '../../systems/SoundManager';
import { hapticsManager } from '../../systems/HapticsManager';

interface MemeMakerProps {
    isOpen: boolean;
    onClose: () => void;
}

const BACKGROUNDS = [
    { id: 'bg_akagi', name: '赤城山', url: '/assets/backgrounds/bg_akagi.webp' },
    { id: 'bg_myogi', name: '妙義山', url: '/assets/backgrounds/bg_myogi.webp' },
    { id: 'bg_haruna', name: '榛名山', url: '/assets/backgrounds/bg_haruna.webp' },
    { id: 'bg_kusatsu', name: '草津温泉', url: '/assets/backgrounds/bg_kusatsu.webp' },
    { id: 'bg_default', name: '群馬の闇', url: '/assets/backgrounds/bg_default.webp' },
];

const MemeMaker = ({ isOpen, onClose }: MemeMakerProps) => {
    const previewRef = useRef<HTMLDivElement>(null);
    const [topText, setTopText] = useState('When you enter Gunma...');
    const [bottomText, setBottomText] = useState('Passport is Required.');
    const [selectedBg, setSelectedBg] = useState(BACKGROUNDS[0]);
    const [isGenerating, setIsGenerating] = useState(false);

    if (!isOpen) return null;

    const handleGenerate = async () => {
        if (!previewRef.current) return;

        setIsGenerating(true);
        soundManager.playSe('button_click');
        hapticsManager.mediumImpact();

        try {
            const canvas = await html2canvas(previewRef.current, {
                backgroundColor: '#000000',
                scale: 2,
                useCORS: true,
            });

            canvas.toBlob(async (blob) => {
                setIsGenerating(false);
                if (!blob) return;

                const file = new File([blob], 'gunma_meme.png', { type: 'image/png' });

                if (navigator.share) {
                    try {
                        await navigator.share({
                            title: 'GUNMA MEME',
                            text: `${topText} ${bottomText} #GunmaEscape`,
                            files: [file],
                        });
                    } catch (err) {
                        console.log('Share cancelled:', err);
                    }
                } else {
                    // Fallback: download
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'gunma_meme.png';
                    a.click();
                    URL.revokeObjectURL(url);
                }
            });
        } catch (error) {
            console.error('Failed to generate meme:', error);
            setIsGenerating(false);
        }
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[95] bg-black flex flex-col"
            >
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b border-gunma-accent/30">
                    <h2 className="text-xl font-black text-gunma-accent font-mono">
                        🖼️ MEME MAKER
                    </h2>
                    <button
                        onClick={() => {
                            soundManager.playSe('cancel');
                            onClose();
                        }}
                        className="text-gunma-accent hover:text-white text-2xl"
                    >
                        ✕
                    </button>
                </div>

                {/* Preview Area (CRT Style) */}
                <div className="flex-1 flex items-center justify-center p-4 overflow-hidden">
                    <div
                        ref={previewRef}
                        className="relative w-full max-w-md aspect-square rounded-lg overflow-hidden"
                        style={{
                            backgroundImage: `url(${selectedBg.url})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                        }}
                    >
                        {/* CRT Overlay */}
                        <div
                            className="absolute inset-0 pointer-events-none"
                            style={{
                                background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.1) 0px, rgba(0,0,0,0.1) 1px, transparent 1px, transparent 2px)',
                                boxShadow: 'inset 0 0 50px rgba(0,0,0,0.5)',
                            }}
                        />

                        {/* Top Text */}
                        <div className="absolute top-4 left-0 right-0 text-center px-4">
                            <p
                                className="text-white text-2xl font-black uppercase"
                                style={{
                                    textShadow: '2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000',
                                    fontFamily: 'Impact, sans-serif',
                                }}
                            >
                                {topText}
                            </p>
                        </div>

                        {/* Bottom Text */}
                        <div className="absolute bottom-4 left-0 right-0 text-center px-4">
                            <p
                                className="text-white text-2xl font-black uppercase"
                                style={{
                                    textShadow: '2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000',
                                    fontFamily: 'Impact, sans-serif',
                                }}
                            >
                                {bottomText}
                            </p>
                        </div>

                        {/* Watermark */}
                        <div className="absolute bottom-2 right-2 text-white/30 text-xs font-mono">
                            #GunmaEscape
                        </div>
                    </div>
                </div>

                {/* Controls */}
                <div className="p-4 space-y-4 bg-gray-900/80 border-t border-gunma-accent/30">
                    {/* Text Inputs */}
                    <div className="space-y-2">
                        <input
                            type="text"
                            value={topText}
                            onChange={(e) => setTopText(e.target.value)}
                            placeholder="上段テキスト..."
                            className="w-full px-4 py-3 bg-black border border-gunma-accent/50 rounded-lg
                       text-white font-mono text-sm focus:outline-none focus:border-gunma-accent"
                        />
                        <input
                            type="text"
                            value={bottomText}
                            onChange={(e) => setBottomText(e.target.value)}
                            placeholder="下段テキスト..."
                            className="w-full px-4 py-3 bg-black border border-gunma-accent/50 rounded-lg
                       text-white font-mono text-sm focus:outline-none focus:border-gunma-accent"
                        />
                    </div>

                    {/* Background Selection */}
                    <div>
                        <p className="text-gray-500 text-xs mb-2 font-mono">BACKGROUND</p>
                        <div className="flex gap-2 overflow-x-auto pb-2">
                            {BACKGROUNDS.map((bg) => (
                                <button
                                    key={bg.id}
                                    onClick={() => {
                                        setSelectedBg(bg);
                                        soundManager.playSe('button_click');
                                    }}
                                    className={`
                    flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2
                    ${selectedBg.id === bg.id ? 'border-gunma-accent' : 'border-gray-700'}
                  `}
                                >
                                    <div
                                        className="w-full h-full"
                                        style={{
                                            backgroundImage: `url(${bg.url})`,
                                            backgroundSize: 'cover',
                                            backgroundPosition: 'center',
                                        }}
                                    />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Generate Button */}
                    <motion.button
                        onClick={handleGenerate}
                        disabled={isGenerating}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full py-4 bg-gradient-to-r from-gunma-accent to-green-600 
                      rounded-lg text-black font-black text-lg
                      shadow-[0_0_15px_rgba(57,255,20,0.4)]
                      disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isGenerating ? '生成中...' : '📤 GENERATE & SHARE'}
                    </motion.button>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default MemeMaker;
