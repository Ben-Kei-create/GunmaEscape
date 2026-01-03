import React from 'react';
import { useGameStore } from '../../stores/gameStore';

const StartScreen: React.FC = () => {
    const { startNewGame, continueFromSavePoint, savePoint } = useGameStore();

    return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-black text-gunma-lime relative overflow-hidden font-dotgothic">
            {/* Background Effect */}
            <div className="absolute inset-0 bg-[url('/assets/noise.png')] opacity-10 pointer-events-none"></div>

            {/* Title */}
            <div className="z-10 text-center mb-12 animate-pulse">
                <h1 className="text-4xl md:text-6xl font-bold tracking-widest leading-tight text-shadow-neon">
                    おまえは<br />グンマーから<br />にげられない
                </h1>
                <p className="mt-4 text-sm md:text-base text-gray-400">THE GUNMA ESCAPE</p>
            </div>

            {/* Buttons */}
            <div className="z-10 flex flex-col gap-6 w-64">
                <button
                    onClick={startNewGame}
                    className="w-full py-4 border-2 border-gunma-lime text-gunma-lime hover:bg-gunma-lime hover:text-black transition-all duration-300 font-bold text-xl tracking-widest shadow-[0_0_10px_rgba(57,255,20,0.5)]"
                >
                    GAME START
                </button>

                {savePoint && (
                    <button
                        onClick={continueFromSavePoint}
                        className="w-full py-3 border border-gray-500 text-gray-400 hover:border-gunma-lime hover:text-gunma-lime transition-all duration-300 font-bold tracking-widest"
                    >
                        CONTINUE
                    </button>
                )}
            </div>

            {/* Footer */}
            <div className="absolute bottom-8 text-xs text-gray-600">
                © 2024 BEN-KEI CREATE
            </div>
        </div>
    );
};

export default StartScreen;
