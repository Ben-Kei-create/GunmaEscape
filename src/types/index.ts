export interface Dice {
  id: string;
  name: string;
  faces: number[]; // e.g., [1,1,1,2,2,6]
  texture: string;
  effect?: 'fire' | 'heal' | 'stun';
}

export interface CardEvent {
  id: string;
  type: 'enemy' | 'item' | 'story' | 'trap' | 'battle'; // Added 'battle'
  title: string;
  description: string;
  text?: string; // Story text for linear scenarios
  image: string; // Asset path
  onSwipeRight?: string; // EffectID (optional for linear scenarios)
  onSwipeLeft?: string; // EffectID (optional for linear scenarios)
  next?: string; // Next scenario ID for linear progression
  leftNext?: string; // Branching: Next ID for Left Swipe
  rightNext?: string; // Branching: Next ID for Right Swipe
  enemyId?: string; // Enemy ID for enemy events
  itemGet?: string; // Item to get
  triggerBattleId?: string; // Battle to trigger
  meta?: any; // For battle intent or other dynamic data
  leftText?: string; // Custom Label for Left Swipe
  rightText?: string; // Custom Label for Right Swipe
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

export interface LegacyCard {
  id: string;
  name: string;
  description: string;
  category: 'food' | 'landmark' | 'history' | 'culture';
  effect: {
    type: 'heal' | 'reward' | 'dice_min';
    value?: number;
    description: string;
  };
  image: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface GameState {
  currentMode: 'exploration' | 'battle' | 'menu' | 'gameover' | 'collection' | 'victory' | 'village';
  currentCard?: CardEvent;
  battleResult?: {
    damage: number;
    diceRoll: number;
  };
  battleState?: BattleState;
}

export interface Item {
  id: string;
  name: string;
  icon: string;
  type: 'heal' | 'buff' | 'equip' | 'key';
  value: number;
  description: string;
  effectType?: 'attack_boost' | 'defense_boost' | 'critical_rate';
  slot?: 'weapon' | 'armor' | 'accessory';
  infinite?: boolean; // If true, item is not consumed on use
  cooldown?: number; // Number of turns to wait before using again
}

