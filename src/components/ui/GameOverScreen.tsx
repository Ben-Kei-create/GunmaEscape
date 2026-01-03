import { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../stores/gameStore';
import { usePlayerStore } from '../../stores/playerStore';
import { soundManager } from '../../systems/SoundManager';
import { hapticsManager } from '../../systems/HapticsManager';
import ShareToX from './ShareButtons';

const GameOverScreen = () => {
  const newspaperRef = useRef<HTMLDivElement>(null);
  const { gameOverInfo, setMode, continueFromSavePoint } = useGameStore();
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
    if (!newspaperRef.current) return;

    try {
      const canvas = await html2canvas(newspaperRef.current, {
        backgroundColor: '#f5f5dc',
        scale: 2,
        useCORS: true,
      });

      canvas.toBlob(async (blob) => {
        if (!blob) return;

        const file = new File([blob], 'gunma-newspaper.png', { type: 'image/png' });

        if (navigator.share) {
          try {
            await navigator.share({
              title: '【号外】未開の地グンマーにて、冒険者散る',
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
          a.download = 'gunma-newspaper.png';
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
  };

  const locationName = locationNames[location] || location;
  const cause = gameOverInfo?.cause || '不明な敵';
  const lastDamage = gameOverInfo?.lastDamage || 0;
  const xShareText = `グンマーの${locationName}で${cause}により力尽きた... 最後のダメージ: ${lastDamage}`;

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
              {adState === 'loading' ? 'Looking for ad...' : 'Playing ad...'}
            </div>
            {adState === 'playing' && (
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '80%' }}
                transition={{ duration: 2 }}
                className="h-2 bg-gunma-accent mt-6 rounded-full"
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
        <div
          ref={newspaperRef}
          className="w-full max-w-lg bg-amber-50 p-6 shadow-2xl"
          style={{
            fontFamily: 'serif',
            backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)`,
          }}
        >
          {/* Newspaper Header */}
          <div className="text-center mb-4 border-b-2 border-black pb-3">
            <div className="text-2xl font-bold mb-1" style={{ writingMode: 'vertical-rl', textOrientation: 'upright' }}>
              群馬新聞
            </div>
            <div className="text-xs text-gray-600">明治四十五年 号外</div>
          </div>

          {/* Main Headline */}
          <div className="mb-4 text-center">
            <div className="text-xl font-bold mb-2 border-b border-black pb-2">
              【号外】未開の地グンマーにて、冒険者散る
            </div>
          </div>

          {/* Article Content */}
          <div className="space-y-2 mb-4 text-sm" style={{ writingMode: 'vertical-rl', textOrientation: 'upright' }}>
            <p>{locationName}にて、一人の冒険者が力尽きた。</p>
            <p>{cause}による攻撃。ダメージは{lastDamage}ポイント。</p>
          </div>

          {/* Footer */}
          <div className="text-center text-xs text-gray-500 border-t border-gray-300 pt-3 mb-4">
            <div>おまえはグンマーからにげられない</div>
          </div>

          {/* Ad Revive Button - Premium looking */}
          <motion.button
            onClick={handleAdRevive}
            disabled={adState !== 'idle'}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-3 mb-3 bg-gradient-to-r from-yellow-500 to-amber-500 
                       border-2 border-yellow-300 rounded-lg text-black font-bold
                       shadow-lg shadow-yellow-500/30 flex items-center justify-center gap-2
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="text-xl">▶️</span>
            <span>広告を見て復活 (HP 50%)</span>
          </motion.button>

          {/* Share Buttons */}
          <div className="flex flex-col gap-2 items-center mb-3">
            <ShareToX
              text={xShareText}
              hashtags={['GunmaEscape', 'おまえはグンマーからにげられない']}
            />
          </div>

          {/* Other Buttons */}
          <div className="flex gap-2 flex-wrap justify-center">
            <button
              onClick={handleShare}
              className="px-3 py-2 bg-gunma-accent text-black font-bold rounded-lg text-xs"
            >
              📷 画像
            </button>
            <button
              onClick={() => {
                usePlayerStore.setState({ hp: 100, maxHp: 100 });
                continueFromSavePoint();
                setMode('exploration');
                setTimeout(() => window.location.reload(), 100);
              }}
              className="px-3 py-2 bg-gunma-konnyaku border border-gunma-accent text-gunma-accent font-bold rounded-lg text-xs"
            >
              再開
            </button>
            <button
              onClick={() => {
                useGameStore.getState().startNewGame();
                usePlayerStore.setState({ hp: 100, maxHp: 100 });
                setMode('exploration');
              }}
              className="px-3 py-2 bg-gunma-konnyaku border border-gunma-accent text-gunma-accent font-bold rounded-lg text-xs"
            >
              最初から
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default GameOverScreen;


