import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../stores/gameStore';
import { soundManager } from '../../systems/SoundManager';
import { hapticsManager } from '../../systems/HapticsManager';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const SettingsModal = ({ isOpen, onClose }: SettingsModalProps) => {
    const { settings, updateSettings } = useGameStore();
    const [showResetConfirm, setShowResetConfirm] = useState(false);

    const handleBgmChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const volume = parseInt(e.target.value);
        updateSettings({ bgmVolume: volume });
        soundManager.setBgmVolume(volume / 100);
    };

    const handleSeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const volume = parseInt(e.target.value);
        updateSettings({ seVolume: volume });
        soundManager.setSeVolume(volume / 100);
        // Play test sound
        soundManager.playSe('button_click');
    };

    const handleVibrationToggle = () => {
        const newValue = !settings.vibrationEnabled;
        updateSettings({ vibrationEnabled: newValue });
        if (newValue) {
            hapticsManager.lightImpact();
        }
    };

    const handleResetData = () => {
        localStorage.clear();
        window.location.reload();
    };

    const handleClose = () => {
        soundManager.playSe('button_click');
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
                    onClick={handleClose}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="w-[90%] max-w-md bg-gunma-konnyaku border-2 border-gunma-accent rounded-lg p-6"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gunma-accent font-mono">
                                ⚙️ 設定
                            </h2>
                            <button
                                onClick={handleClose}
                                className="text-gunma-accent hover:text-white text-2xl"
                            >
                                ✕
                            </button>
                        </div>

                        {/* BGM Volume */}
                        <div className="mb-6">
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-gunma-text font-mono text-sm">
                                    🎵 BGM音量
                                </label>
                                <span className="text-gunma-accent font-mono text-sm">
                                    {settings.bgmVolume}%
                                </span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={settings.bgmVolume}
                                onChange={handleBgmChange}
                                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer
                           [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4
                           [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-gunma-accent
                           [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer"
                            />
                        </div>

                        {/* SE Volume */}
                        <div className="mb-6">
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-gunma-text font-mono text-sm">
                                    🔊 効果音量
                                </label>
                                <span className="text-gunma-accent font-mono text-sm">
                                    {settings.seVolume}%
                                </span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={settings.seVolume}
                                onChange={handleSeChange}
                                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer
                           [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4
                           [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-gunma-accent
                           [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer"
                            />
                        </div>

                        {/* Vibration Toggle */}
                        <div className="mb-6">
                            <div className="flex justify-between items-center">
                                <label className="text-gunma-text font-mono text-sm">
                                    📳 振動
                                </label>
                                <button
                                    onClick={handleVibrationToggle}
                                    className={`w-14 h-7 rounded-full transition-colors duration-200 ${settings.vibrationEnabled
                                        ? 'bg-gunma-accent'
                                        : 'bg-gray-600'
                                        }`}
                                >
                                    <div
                                        className={`w-5 h-5 bg-white rounded-full transition-transform duration-200 ${settings.vibrationEnabled ? 'translate-x-8' : 'translate-x-1'
                                            }`}
                                    />
                                </button>
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="border-t border-gunma-accent/30 my-6" />

                        {/* Actions */}
                        <div className="space-y-3">
                            <button
                                onClick={() => {
                                    soundManager.playSe('menu_open');
                                    useGameStore.getState().setScenarioMapOpen(true);
                                    onClose();
                                }}
                                className="w-full py-3 bg-blue-900/30 border border-blue-500/50 rounded-lg
                                         text-blue-400 font-mono text-sm
                                         hover:bg-blue-900/50 hover:border-blue-500
                                         active:scale-95 transition-all duration-150"
                            >
                                📊 シナリオフローチャート
                            </button>

                            {/* Profile Button */}
                            <button
                                onClick={() => {
                                    soundManager.playSe('menu_open');
                                    window.dispatchEvent(new CustomEvent('openProfile'));
                                    onClose();
                                }}
                                className="w-full py-3 bg-purple-900/30 border border-purple-500/50 rounded-lg
                                         text-purple-400 font-mono text-sm
                                         hover:bg-purple-900/50 hover:border-purple-500
                                         active:scale-95 transition-all duration-150"
                            >
                                👤 プロフィール
                            </button>

                            {/* Reel Tuning Button */}
                            <button
                                onClick={() => {
                                    soundManager.playSe('menu_open');
                                    window.dispatchEvent(new CustomEvent('openReelTuning'));
                                    onClose();
                                }}
                                className="w-full py-3 bg-orange-900/30 border border-orange-500/50 rounded-lg
                                         text-orange-400 font-mono text-sm
                                         hover:bg-orange-900/50 hover:border-orange-500
                                         active:scale-95 transition-all duration-150"
                            >
                                🔧 リール改造
                            </button>

                            {/* Meme Maker Button */}
                            <button
                                onClick={() => {
                                    soundManager.playSe('menu_open');
                                    window.dispatchEvent(new CustomEvent('openMemeMaker'));
                                    onClose();
                                }}
                                className="w-full py-3 bg-pink-900/30 border border-pink-500/50 rounded-lg
                                         text-pink-400 font-mono text-sm
                                         hover:bg-pink-900/50 hover:border-pink-500
                                         active:scale-95 transition-all duration-150"
                            >
                                🖼️ ミームメーカー
                            </button>

                            <button
                                onClick={() => {
                                    if (window.confirm('タイトルへ戻りますか？\n（現在の進行状況は失われます）')) {
                                        useGameStore.getState().setIsTitleVisible(true);
                                        onClose();
                                    }
                                }}
                                className="w-full py-3 bg-gunma-accent/10 border border-gunma-accent/50 rounded-lg
                                         text-gunma-accent font-mono text-sm
                                         hover:bg-gunma-accent/20 hover:border-gunma-accent
                                         active:scale-95 transition-all duration-150"
                            >
                                🏠 タイトルへ戻る
                            </button>

                            {/* Reset Data */}
                            {!showResetConfirm ? (
                                <button
                                    onClick={() => setShowResetConfirm(true)}
                                    className="w-full py-3 bg-red-500/20 border border-red-500/50 rounded-lg
                           text-red-400 font-mono text-sm
                           hover:bg-red-500/30 hover:border-red-500
                           active:scale-95 transition-all duration-150"
                                >
                                    🗑️ データを初期化
                                </button>
                            ) : (
                                <div className="space-y-3">
                                    <p className="text-red-400 text-sm font-mono text-center">
                                        本当に全てのデータを削除しますか？
                                    </p>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => setShowResetConfirm(false)}
                                            className="flex-1 py-2 bg-gray-600 border border-gray-500 rounded-lg
                               text-gray-300 font-mono text-sm
                               hover:bg-gray-500 active:scale-95 transition-all"
                                        >
                                            キャンセル
                                        </button>
                                        <button
                                            onClick={handleResetData}
                                            className="flex-1 py-2 bg-red-600 border border-red-500 rounded-lg
                               text-white font-mono text-sm
                               hover:bg-red-500 active:scale-95 transition-all"
                                        >
                                            削除する
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default SettingsModal;
