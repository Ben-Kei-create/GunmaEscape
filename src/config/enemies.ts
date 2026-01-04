import type { Enemy } from '../types';

export const ENEMIES: Record<string, Enemy> = {
  'konnyaku_slime': {
    id: 'konnyaku_slime',
    name: 'こんにゃくスライム',
    hp: 20, // 30 -> 20 (弱体化: チュートリアル用)
    maxHp: 20,
    attack: 3,
    defense: 0, // 1 -> 0 (ダメージ通りやすく)
  },
  'boss_gunma_12': {
    id: 'boss_gunma_12',
    name: 'No.12 グンマ（暗鞍のリーダー）',
    hp: 120, // 100 -> 120 (耐久アップ)
    maxHp: 120,
    attack: 12, // 8 -> 12 (攻撃力アップ: 緊張感を出す)
    defense: 2, // 3 -> 2 (少し柔らかくして爽快感維持)
  },
};

export const getEnemy = (enemyId: string): Enemy | undefined => {
  return ENEMIES[enemyId];
};



