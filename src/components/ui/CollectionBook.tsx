import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCardStore } from '../../stores/cardStore';
import { useGameStore } from '../../stores/gameStore';
import { soundManager } from '../../systems/SoundManager';
import { hapticsManager } from '../../systems/HapticsManager';
import type { LegacyCard } from '../../types';
import legacyCardsData from '../../assets/data/legacyCards.json';

const CollectionBook = () => {
  const { collectedCards, hasCard } = useCardStore();
  const { setMode } = useGameStore();
  const [selectedCard, setSelectedCard] = useState<LegacyCard | null>(null);
  const cards = legacyCardsData.cards as LegacyCard[];

  const getRarityColor = (rarity: LegacyCard['rarity']) => {
    switch (rarity) {
      case 'common':
        return 'border-gray-400';
      case 'rare':
        return 'border-blue-400';
      case 'epic':
        return 'border-purple-400';
      case 'legendary':
        return 'border-yellow-400';
      default:
        return 'border-gray-400';
    }
  };

  const getRarityText = (rarity: LegacyCard['rarity']) => {
    switch (rarity) {
      case 'common':
        return '普通';
      case 'rare':
        return '珍しい';
      case 'epic':
        return '極めて珍しい';
      case 'legendary':
        return '伝説';
      default:
        return '普通';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-4xl max-h-[90vh] bg-amber-50 rounded-lg shadow-2xl overflow-hidden"
        style={{
          fontFamily: 'serif',
          backgroundImage: `
            repeating-linear-gradient(
              0deg,
              rgba(139, 69, 19, 0.1) 0px,
              transparent 2px,
              transparent 4px
            )
          `,
        }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-700 to-amber-800 p-4 text-white border-b-2 border-amber-900">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold" style={{ writingMode: 'vertical-rl', textOrientation: 'upright' }}>
              群馬遺産図鑑
            </h2>
            <div className="text-sm">
              収集率: {collectedCards.length}/{cards.length}
            </div>
            <button
              onClick={() => {
                soundManager.playSe('button_click');
                hapticsManager.lightImpact();
                if (useGameStore.getState().collectionSource === 'title') {
                  useGameStore.getState().setIsTitleVisible(true);
                } else {
                  setMode('exploration');
                }
              }}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 rounded text-white font-semibold transition-colors"
            >
              閉じる
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {cards.map((card) => {
              const isCollected = hasCard(card.id);
              return (
                <motion.div
                  key={card.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    if (isCollected) {
                      soundManager.playSe('button_click');
                      hapticsManager.lightImpact();
                      setSelectedCard(card);
                    }
                  }}
                  className={`
                    relative p-4 rounded-lg border-2 cursor-pointer
                    ${isCollected ? `${getRarityColor(card.rarity)} bg-white shadow-md` : 'border-gray-300 bg-gray-100 opacity-60'}
                    transition-all
                  `}
                >
                  {isCollected ? (
                    <>
                      {/* Card Image Placeholder */}
                      <div className="w-full h-32 bg-gradient-to-br from-amber-100 to-amber-200 rounded mb-2 flex items-center justify-center border border-amber-300">
                        <div className="text-amber-700 font-bold text-lg">{card.name}</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-sm mb-1">{card.name}</div>
                        <div className="text-xs text-gray-600">{getRarityText(card.rarity)}</div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-full h-32 bg-gray-300 rounded mb-2 flex items-center justify-center">
                        <div className="text-4xl text-gray-500">?</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-sm text-gray-400">未発見</div>
                      </div>
                    </>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Card Detail Modal */}
        <AnimatePresence>
          {selectedCard && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              onClick={() => setSelectedCard(null)}
            >
              <motion.div
                initial={{ scale: 0.8, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.8, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-lg p-6 max-w-md w-full shadow-2xl"
              >
                <div className={`border-2 ${getRarityColor(selectedCard.rarity)} rounded-lg p-4 mb-4`}>
                  <div className="w-full h-48 bg-gradient-to-br from-amber-100 to-amber-200 rounded mb-4 flex items-center justify-center border border-amber-300">
                    <div className="text-amber-700 font-bold text-xl">{selectedCard.name}</div>
                  </div>
                  <h3 className="text-2xl font-bold mb-2">{selectedCard.name}</h3>
                  <div className="text-sm text-gray-600 mb-4">
                    <span className="font-semibold">種類:</span> {selectedCard.category}
                    <span className="ml-4 font-semibold">レアリティ:</span> {getRarityText(selectedCard.rarity)}
                  </div>
                  <p className="text-gray-700 mb-4">{selectedCard.description}</p>
                  <div className="bg-amber-50 p-3 rounded border border-amber-200">
                    <div className="font-semibold text-amber-900 mb-1">効果:</div>
                    <div className="text-amber-800">{selectedCard.effect.description}</div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    soundManager.playSe('button_click');
                    hapticsManager.lightImpact();
                    setSelectedCard(null);
                  }}
                  className="w-full px-4 py-2 bg-amber-600 hover:bg-amber-700 rounded text-white font-semibold transition-colors"
                >
                  閉じる
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default CollectionBook;

