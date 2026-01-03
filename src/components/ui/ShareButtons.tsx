import { soundManager } from '../../systems/SoundManager';
import { hapticsManager } from '../../systems/HapticsManager';

interface ShareToXProps {
    text: string;
    hashtags?: string[];
    url?: string;
}

const ShareToX = ({ text, hashtags = ['GunmaEscape'], url = 'https://gunma-escape.app' }: ShareToXProps) => {
    const handleShare = () => {
        soundManager.playSe('button_click');
        hapticsManager.lightImpact();

        const hashtagsStr = hashtags.join(',');
        const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}&hashtags=${hashtagsStr}`;
        window.open(tweetUrl, '_blank');
    };

    return (
        <button
            onClick={handleShare}
            className="flex items-center gap-2 px-6 py-3 bg-black border border-white/30 rounded-lg
                 text-white font-bold hover:bg-white/10 active:scale-95 transition-all duration-150"
        >
            {/* X Logo */}
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            <span>Post to X</span>
        </button>
    );
};

export default ShareToX;
