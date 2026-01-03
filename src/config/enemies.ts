import type { Enemy } from '../types';

export const ENEMIES: Record<string, Enemy> = {
  'konnyaku_slime': {
    id: 'konnyaku_slime',
    name: 'こんにゃくスライム',
    hp: 30,
    maxHp: 30,
    attack: 3,
    defense: 1,
  },
  'boss_gunma_12': {
    id: 'boss_gunma_12',
    name: 'No.12 グンマ（暗鞍のリーダー）',
    hp: 100,
    maxHp: 100,
    attack: 8,
    defense: 3,
  },
};

export const getEnemy = (enemyId: string): Enemy | undefined => {
  return ENEMIES[enemyId];
};

