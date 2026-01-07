/**
 * Enemy Data for Phase 34: Chapters 2 & 3
 */

export interface EnemyData {
    id: string;
    name: string;
    nameJp: string;
    hp: number;
    attack: number;
    defense: number;
    description: string;
    image: string;
}

export const ENEMY_CATALOG: Record<string, EnemyData> = {
    'konnyaku_slime': {
        id: 'konnyaku_slime',
        name: 'Konnyaku Slime',
        nameJp: 'こんにゃくスライム',
        hp: 15,
        attack: 3,
        defense: 0,
        description: 'プルプルした灰色の塊。味噌田楽になりたがっている。',
        image: '/assets/enemies/enemy_konnyaku.png'
    },
    'cursed_daruma': {
        id: 'cursed_daruma',
        name: 'Cursed Daruma',
        nameJp: '呪われただるま',
        hp: 35,
        attack: 5,
        defense: 2,
        description: '高崎産の負の遺産。願いを叶える代わりに命を奪う。',
        image: '/assets/enemies/enemy_daruma.png'
    },
    'boss_gunma_12': {
        id: 'boss_gunma_12',
        name: 'No.12 GUNMA',
        nameJp: 'No.12 グンマ',
        hp: 80,
        attack: 10,
        defense: 4,
        description: '暗鞍の幹部。焼きまんじゅうを載せた荷車を振り回す。',
        image: '/assets/enemies/boss_gunma_12.png'
    },
    'haniwa_guard': {
        id: 'haniwa_guard',
        name: 'Haniwa Guard',
        nameJp: '警備埴輪',
        hp: 30,
        attack: 5,
        defense: 5,
        description: '古墳時代から蘇った国宝級の警備兵。土でできているが異常に硬い。',
        image: '/assets/enemies/enemy_haniwa.png'
    },
    'mad_tractor': {
        id: 'mad_tractor',
        name: 'Mad Tractor',
        nameJp: '暴走トラクター',
        hp: 40,
        attack: 8,
        defense: 3,
        description: 'カラスに操られた無人トラクター。キャベツを武器として発射する。',
        image: '/assets/enemies/enemy_tractor.png'
    },
    'mad_cabbage': {
        id: 'mad_cabbage',
        name: 'Mandragora',
        nameJp: 'マンドラゴラ',
        hp: 20,
        attack: 4,
        defense: 1,
        description: '叫ぶキャベツ。その悲鳴を聞くとHPが減る。',
        image: '/assets/enemies/enemy_mandrake.png'
    },
    'cabbage_overlord': {
        id: 'cabbage_overlord',
        name: 'Cabbage Overlord',
        nameJp: 'キャベツ・オーバーロード',
        hp: 100,
        attack: 12,
        defense: 8,
        description: '嬬恋村の王。巨大なキャベツの集合体。温泉への道を塞いでいる。',
        image: '/assets/enemies/enemy_cabbage_boss.png'
    }
};
