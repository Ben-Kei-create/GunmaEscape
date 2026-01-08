#不条理サバイバルアドベンチャーゲーム / 2Dドット絵 / ローグライト

## 技術スタック

- **Language:** TypeScript
- **Framework:** React 18
- **Game Engine:** Phaser 3
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **Animation:** Framer Motion
- **State Management:** Zustand
- **Mobile Wrapper:** Capacitor (iOS)

## セットアップ

```bash
npm install
npm run dev
```

## プロジェクト構造

```
src/
├── assets/             # Images, JSON, Sounds
├── components/
│   ├── game/           # Phaser Game Components (Dice, Enemy)
│   └── ui/             # React UI Components (SwipeCard, HUD, Dialog)
├── config/             # Game Constants
├── hooks/              # Custom React Hooks
├── scenes/             # Phaser Scenes (Boot, Battle, Map)
├── stores/             # Zustand Stores (PlayerState, GameState)
├── types/              # TypeScript Interfaces
└── utils/              # Helper functions
```

## Phase 1 完了項目

- ✅ Vite + React + TypeScript + Tailwind セットアップ
- ✅ Phaser 3 のインストールと React コンポーネント内へのマウント
- ✅ UI Layout の実装（上部Canvas、中部Log、下部Deck）
- ✅ ダークテーマと基本的な「G-OS」スタイルの適用

## 次のステップ

1. Tinder風スワイプの実装 (`SwipeCard.tsx`)
2. ダイス物理演算の実装 (`BattleScene.ts`)
3. シナリオデータの流し込み






