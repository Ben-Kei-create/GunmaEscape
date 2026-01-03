export interface Dice {
  id: string;
  name: string;
  faces: number[]; // e.g., [1,1,1,2,2,6]
  texture: string;
  effect?: 'fire' | 'heal' | 'stun';
}

export interface CardEvent {
  id: string;
  type: 'enemy' | 'item' | 'story' | 'trap';
  title: string;
  description: string;
  image: string; // Asset path
  onSwipeRight: string; // EffectID
  onSwipeLeft: string; // EffectID
}

export interface PlayerState {
  hp: number;
  maxHp: number;
  sanity: number; // MP equivalent
  inventory: string[];
  equippedDice: Dice[];
  location: string; // e.g., "Myogi_Mt_Layer3"
}

export interface Enemy {
  id: string;
  name: string;
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
}

export interface BattleState {
  isActive: boolean;
  turn: 'player' | 'enemy';
  enemy?: Enemy;
  playerDice1: number | null;
  playerDice2: number | null;
  lastPlayerDamage: number;
  lastEnemyDamage: number;
}

export interface GameState {
  currentMode: 'exploration' | 'battle' | 'menu' | 'gameover';
  currentCard?: CardEvent;
  battleResult?: {
    damage: number;
    diceRoll: number;
  };
  battleState?: BattleState;
}

