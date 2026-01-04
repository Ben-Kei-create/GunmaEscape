import { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../stores/gameStore';
import { usePlayerStore } from '../../stores/playerStore';
import { soundManager } from '../../systems/SoundManager';
import { hapticsManager } from '../../systems/HapticsManager';
import ShareToX from './ShareButtons';

const GameOverScreen = () => {
  const reportRef = useRef<HTMLDivElement>(null);
  const { gameOverInfo, setMode, continueFromSavePoint, startNewGame } = useGameStore();
  const { location, maxHp } = usePlayerStore();
  const [adState, setAdState] = useState<'idle' | 'loading' | 'playing'>('idle');

  const handleAdRevive = async () => {
    soundManager.playSe('button_click');
    hapticsManager.lightImpact();

    // Stage 1: Looking for ad
    setAdState('loading');
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Stage 2: Playing ad
    setAdState('playing');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Revive with 50% HP
    const reviveHp = Math.floor(maxHp / 2);
    usePlayerStore.setState({ hp: reviveHp });
    continueFromSavePoint();
    setMode('exploration');

    soundManager.playSe('win');
    hapticsManager.heavyImpact();
  };

  const handleShare = async () => {
    if (!reportRef.current) return;

    try {
      const canvas = await html2canvas(reportRef.current, {
        backgroundColor: '#000000',
        scale: 2,
        useCORS: true,
      });

      canvas.toBlob(async (blob) => {
        if (!blob) return;

        const file = new File([blob], 'gunma_death_report.png', { type: 'image/png' });

        if (navigator.share) {
          try {
            await navigator.share({
              title: 'GUNMA DEATH REPORT',
              text: 'おまえはグンマーからにげられない',
              files: [file],
            });
          } catch (err) {
            console.log('Share cancelled or failed:', err);
          }
        } else {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'gunma_death_report.png';
          a.click();
          URL.revokeObjectURL(url);
        }
      });
    } catch (error) {
      console.error('Failed to capture image:', error);
    }
  };

  const locationNames: Record<string, string> = {
    'Myogi_Mt_Layer1': '妙義山1合目',
    'Myogi_Mt_Layer2': '妙義山2合目',
    'Myogi_Mt_Layer3': '妙義山3合目',
    'Haruna_Mt': '榛名山',
    'Kusatsu': '草津温泉',
    'Kusatsu_Onsen': '草津温泉',
    'Akagi_Mt': '赤城山',
    'c1_01_intro': '赤城山麓',
    'c2_01_border_gate': '群馬県境',
  };

  const locationName = locationNames[location] || location;
  const cause = gameOverInfo?.cause || '不明な死因';

  // Aptitude Logic
  const inventoryCount = useGameStore.getState().inventory.length;
  const aptitude = Math.min(100, (maxHp + inventoryCount * 5) % 100);

  let aptitudeTitle = '一般通過旅行者';
  if (aptitude < 20) aptitudeTitle = '東京のもやしっ子';
  else if (aptitude < 50) aptitudeTitle = 'グンマの養分';
  else if (aptitude < 80) aptitudeTitle = '名誉群馬県民(仮)';
  else aptitudeTitle = '真のグンマー';

  const xShareText = `【GUNMA DEATH REPORT】\n死因: ${cause}\n地点: ${locationName}\n群馬適性: ${aptitude}%\n称号: ${aptitudeTitle}\n#GunmaEscape #おまえはグンマーからにげられない`;

  return (
    <>
      {/* Ad Mock Overlay */}
      <AnimatePresence>
        {adState !== 'idle' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black flex items-center justify-center flex-col"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="text-4xl mb-6"
            >
              📺
            </motion.div>
            <div className="text-white font-mono text-lg">
              {adState === 'loading' ? 'Searching Signal...' : 'Playing Ad...'}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 overflow-y-auto">
        <div className="flex flex-col items-center w-full max-w-md">

          {/* Report Card */}
          <div
            ref={reportRef}
            className="w-full bg-black border-4 border-red-600 p-6 relative mb-6 shadow-[0_0_30px_rgba(255,0,0,0.3)]"
          >
            {/* Stamps */}
            <div className="absolute top-10 right-4 transform rotate-12 border-4 border-red-600 px-2 py-1 text-red-600 font-black text-4xl opacity-80 pointer-events-none">
              REJECTED
            </div>

            {/* Header */}
            <div className="text-center mb-6 border-b border-red-800 pb-4">
              <h1 className="text-3xl font-black text-white tracking-widest font-mono">DEATH REPORT</h1>
              <p className="text-red-500 text-xs tracking-[0.5em] mt-1">死亡診断書</p>
            </div>

            {/* Content Table */}
            <div className="space-y-4 font-mono text-sm">
              <div className="flex justify-between border-b border-gray-800 pb-2">
                <span className="text-gray-500">SUBJECT (氏名)</span>
                <span className="text-white font-bold">{useGameStore.getState().playerName || '旅人'}</span>
              </div>
              <div className="flex justify-between border-b border-gray-800 pb-2">
                <span className="text-gray-500">LOCATION (死亡地点)</span>
                <span className="text-white">{locationName}</span>
              </div>
              <div className="flex justify-between border-b border-gray-800 pb-2">
                <span className="text-gray-500">CAUSE (死因)</span>
                <span className="text-red-500 font-bold">{cause}</span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-800 pb-2">
                <span className="text-gray-500">APTITUDE (群馬適性)</span>
                <div className="text-right">
                  <span className="text-2xl font-black text-gunma-accent">{aptitude}%</span>
                  <div className="text-xs text-gray-400">{aptitudeTitle}</div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-8 text-center">
              <p className="text-gray-600 text-xs text-left mb-2">
                OFFICIAL COMMENT:
              </p>
              <p className="text-white font-serif italic text-lg border-l-2 border-red-600 pl-4 py-2 bg-gray-900/50">
                "おまえはグンマーから<br />にげられない"
              </p>
            </div>

            {/* QR Code Placeholder (Visual flair) */}
            <div className="absolute bottom-4 right-4 w-12 h-12 bg-white p-1">
              <div className="w-full h-full bg-black" style={{ backgroundImage: 'radial-gradient(white 2px, transparent 2px)', backgroundSize: '4px 4px' }}></div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="w-full space-y-3">
            <motion.button
              onClick={handleAdRevive}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 bg-gradient-to-r from-gunma-accent to-green-600 
                           rounded text-black font-black text-lg
                           shadow-[0_0_15px_rgba(57,255,20,0.4)] flex items-center justify-center gap-2"
            >
              <span>▶️ REVIVE (50% HP)</span>
            </motion.button>

            <ShareToX
              text={xShareText}
              hashtags={['GunmaEscape']}
            />

            <div className="grid grid-cols-2 gap-3 mt-4">
              <button
                onClick={handleShare}
                className="py-3 border border-gray-600 text-gray-400 font-mono text-xs hover:bg-gray-800 rounded"
              >
                [ SAVE IMAGE ]
              </button>
              <button
                onClick={() => {
                  startNewGame();
                  usePlayerStore.setState({ hp: 100, maxHp: 100 });
                  setMode('exploration');
                }}
                className="py-3 border border-red-900 text-red-500 font-mono text-xs hover:bg-red-900/20 rounded"
              >
                [ GIVE UP ]
              </button>
            </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default GameOverScreen;
