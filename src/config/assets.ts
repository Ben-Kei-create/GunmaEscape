export const ASSETS = {
  // Images
  images: {
    konnyakuMonster: '/assets/images/konnyaku_monster.png',
    villager: '/assets/images/villager.png',
    hotspring: '/assets/images/hotspring.png',
    diceWood: '/assets/images/dice_wood.png',
    diceStone: '/assets/images/dice_stone.png',
  },
  
  // Background colors by location
  backgrounds: {
    Myogi_Mt_Layer1: { color: '#2d5016', overlay: 'rgba(0, 0, 0, 0.3)' },
    Myogi_Mt_Layer2: { color: '#1a3310', overlay: 'rgba(0, 0, 0, 0.4)' },
    Myogi_Mt_Layer3: { color: '#0f1f08', overlay: 'rgba(0, 0, 0, 0.5)' },
    Haruna_Mt: { color: '#3d2817', overlay: 'rgba(139, 69, 19, 0.2)' },
    Kusatsu: { color: '#1a1a2e', overlay: 'rgba(100, 150, 200, 0.1)' },
    default: { color: '#1a1a1a', overlay: 'rgba(0, 0, 0, 0.3)' },
  },
} as const;

export const getBackgroundForLocation = (location: string) => {
  return ASSETS.backgrounds[location as keyof typeof ASSETS.backgrounds] || ASSETS.backgrounds.default;
};



