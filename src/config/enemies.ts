import type { Enemy } from '../types';

export const ENEMIES: Record<string, Enemy> = {
  'konnyaku_slime': {
    id: 'konnyaku_slime',
    name: 'こんにゃくスライム',
    hp: 15,
    maxHp: 15,
    attack: 2,
    defense: 0,
  },
  'cursed_daruma': {
    id: 'cursed_daruma',
    name: '呪われたダルマ',
    hp: 35,
    maxHp: 35,
    attack: 5,
    defense: 0,
  },
  'haniwa_soldier': {
    id: 'haniwa_soldier',
    name: '埴輪ソルジャー',
    hp: 30,
    maxHp: 30,
    attack: 4,
    defense: 1,
  },
  'boss_gunma_12': {
    id: 'boss_gunma_12',
    name: 'No.12 グンマ（暗鞍のリーダー）',
    hp: 80,
    maxHp: 80,
    attack: 8,
    defense: 1,
  },
};

export const getEnemy = (enemyId: string): Enemy => {
  const enemy = ENEMIES[enemyId];
  if (!enemy) {
    console.warn(`[PHASE 39] Enemy data for '${enemyId}' not found. Using fallback.`);
    // Return a fallback enemy so the game never crashes
    return {
      id: enemyId,
      name: 'UNKNOWN_ENTITY',
      hp: 50,
      maxHp: 50,
      attack: 5,
      defense: 0,
    };
  }
  return enemy;
};






