import { useEffect, useState } from 'react';
import { useGameStore } from '../../stores/gameStore';

export default function TurnIndicator() {
    const { battleState, currentMode, isTitleVisible } = useGameStore();
    const [show, setShow] = useState(false);
    const [text, setText] = useState('');
    const [key, setKey] = useState(0); // To force re-render/re-anim

    useEffect(() => {
        if (isTitleVisible || currentMode !== 'battle') {
            setShow(false);
            return;
        }

        if (battleState?.turn === 'player') {
            setText("▶ PLAYER'S TURN");
            setShow(true);
            setKey(prev => prev + 1);
        } else if (battleState?.turn === 'enemy') {
            setText("▶ ENEMY'S TURN");
            setShow(true);
            setKey(prev => prev + 1);
        }

        const timer = setTimeout(() => setShow(false), 2000);
        return () => clearTimeout(timer);
    }, [battleState?.turn, currentMode, isTitleVisible]);

    if (!show || isTitleVisible || currentMode !== 'battle') return null;

    return (
        <div key={key} className="absolute top-1/2 left-0 w-full z-50 pointer-events-none flex justify-center items-center overflow-visible">
            <div className="turn-indicator bg-gunma-accent text-black font-black text-2xl py-2 px-10 tracking-widest skew-x-[-20deg] border-y-4 border-black shadow-[0_0_15px_#39ff14]">
                <span className="skew-x-[20deg] inline-block">{text}</span>
            </div>
        </div>
    );
}
