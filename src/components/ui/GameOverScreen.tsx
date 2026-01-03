import { useRef } from 'react';
import html2canvas from 'html2canvas';
import { useGameStore } from '../../stores/gameStore';
import { usePlayerStore } from '../../stores/playerStore';

const GameOverScreen = () => {
  const newspaperRef = useRef<HTMLDivElement>(null);
  const { gameOverInfo, setMode } = useGameStore();
  const { location } = usePlayerStore();

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
            // User cancelled or error
            console.log('Share cancelled or failed:', err);
          }
        } else {
          // Fallback: download
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div 
        ref={newspaperRef}
        className="w-full max-w-lg bg-amber-50 p-8 shadow-2xl"
        style={{
          fontFamily: 'serif',
          backgroundImage: `
            repeating-linear-gradient(
              0deg,
              transparent,
              transparent 2px,
              rgba(0,0,0,0.03) 2px,
              rgba(0,0,0,0.03) 4px
            )
          `,
        }}
      >
        {/* Newspaper Header */}
        <div className="text-center mb-6 border-b-2 border-black pb-4">
          <div className="text-3xl font-bold mb-2" style={{ writingMode: 'vertical-rl', textOrientation: 'upright' }}>
            群馬新聞
          </div>
          <div className="text-sm text-gray-600">明治四十五年 号外</div>
        </div>

        {/* Main Headline */}
        <div className="mb-6 text-center">
          <div className="text-2xl font-bold mb-2 border-b border-black pb-2">
            【号外】未開の地グンマーにて、冒険者散る
          </div>
        </div>

        {/* Article Content (Vertical Writing) */}
        <div className="space-y-4 mb-6" style={{ writingMode: 'vertical-rl', textOrientation: 'upright' }}>
          <p className="text-lg leading-relaxed">
            {locationName}にて、一人の冒険者がその命を落とした。
          </p>
          <p className="text-lg leading-relaxed">
            {cause}による最後の一撃は、その命を瞬時に奪ったという。
          </p>
          <p className="text-lg leading-relaxed">
            受けたダメージは推定{lastDamage}ポイント。
          </p>
          <p className="text-lg leading-relaxed">
            この未開の地グンマーは、今日も静かにその謎を包み続けている。
          </p>
          <p className="text-lg leading-relaxed">
            関係者は深い悲しみと共に、彼の勇敢な探索を称えている。
          </p>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-gray-500 border-t border-gray-300 pt-4">
          <div>おまえはグンマーからにげられない</div>
          <div className="mt-1">© 2024 Gunma Escape Project</div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex gap-4 justify-center">
          <button
            onClick={handleShare}
            className="px-6 py-3 bg-gunma-accent text-black font-bold rounded-lg hover:bg-gunma-accent/80 transition-colors"
          >
            シェア
          </button>
          <button
            onClick={() => {
              const gameStore = useGameStore.getState();
              usePlayerStore.setState({ hp: 100, maxHp: 100 });
              gameStore.continueFromSavePoint();
              setMode('exploration');
              
              // ScenarioManager will load the scenario on next render
              setTimeout(() => {
                window.location.reload();
              }, 100);
            }}
            className="px-6 py-3 bg-gunma-konnyaku border border-gunma-accent text-gunma-accent font-bold rounded-lg hover:bg-gunma-accent/10 transition-colors"
          >
            セーブポイントから再開
          </button>
          <button
            onClick={() => {
              const gameStore = useGameStore.getState();
              gameStore.startNewGame();
              usePlayerStore.setState({ hp: 100, maxHp: 100 });
              setMode('exploration');
            }}
            className="px-6 py-3 bg-gunma-konnyaku border border-gunma-accent text-gunma-accent font-bold rounded-lg hover:bg-gunma-accent/10 transition-colors"
          >
            最初から
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameOverScreen;

