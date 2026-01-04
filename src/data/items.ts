import { Item } from '../types';

export const ITEM_CATALOG: Record<string, Item> = {
    'gunma_branch': {
        id: 'gunma_branch',
        name: '群馬の枯れ木',
        icon: '🥖',
        type: 'equip',
        slot: 'weapon',
        value: 5,
        description: 'その辺に落ちていた手頃な枝。とりあえず武器にはなる。',
        effectType: 'attack_boost'
    },
    'wind_amulet': {
        id: 'wind_amulet',
        name: '風の護符',
        icon: '🧿',
        type: 'equip',
        slot: 'accessory',
        value: 10,
        description: '上州のからっ風を防ぐお守り。防御力が上がり、吹き飛ばされにくくなる。',
        effectType: 'defense_boost'
    },
    'yakimanju': {
        id: 'yakimanju',
        name: '焼きまんじゅう',
        icon: '🍡',
        type: 'heal',
        value: 20,
        description: '群馬県民のソウルフード。甘じょっぱい味噌ダレが体力を回復させる。'
    },
    'konjac': {
        id: 'konjac',
        name: '味噌田楽',
        icon: '🍢',
        type: 'heal',
        value: 10,
        description: 'プルプルのこんにゃく。低カロリーで健康的。小腹が満たされる。'
    },
    'gunma_passport': {
        id: 'gunma_passport',
        name: '群馬パスポート',
        icon: '📕',
        type: 'key',
        value: 0,
        description: '群馬県への入国に必要な特殊なパスポート。なぜ日本国内で必要なのかは不明。'
    },
    'fresh_cabbage': {
        id: 'fresh_cabbage',
        name: '新鮮キャベツ',
        icon: '🥬',
        type: 'heal',
        value: 15,
        description: '嬬恋村産の極上キャベツ。みずみずしくて栄養満点。'
    },
    'cabbage_shield': {
        id: 'cabbage_shield',
        name: 'キャベツの盾',
        icon: '🛡️',
        type: 'equip',
        slot: 'armor',
        value: 15,
        description: 'キャベツ・オーバーロードの葉で作られた盾。意外と硬い。',
        effectType: 'defense_boost'
    }
};

export const INITIAL_INVENTORY_IDS = ['wind_amulet', 'yakimanju', 'yakimanju', 'konjac'];
