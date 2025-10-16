# Biotope プロジェクト

React、TypeScript、Three.jsを使用したビオトープ環境シミュレーションWebアプリケーション。

🌐 **Live Demo**: https://biotope.pages.dev/

## 主な機能

- **3Dビオトープ環境**: Three.js + React Three Fiberによる没入型3D環境
- **リアルタイム時計**: 日本時間（UTC+9）と連動した昼夜サイクル
- **動的照明**: 実時間に応じた太陽の位置と照明変化
- **季節エフェクト**:
  - **春**: 桜の花びら
  - **夏**: 陽炎エフェクト、強い日差し
  - **秋**: 紅葉の落ち葉（7色）
  - **冬**: 雪、冷たい照明
- **インタラクティブ要素**:
  - 水面アニメーション
  - 日時計（影の動き）
  - 漂流する瓶（クリックで季節の便箋表示）
  - 風向きコンパス
- **レスポンシブデザイン**: PC/モバイル対応

## 技術スタック

- **フロントエンド**: React 19 + TypeScript
- **ビルドツール**: Vite 7
- **3D描画**: Three.js + @react-three/fiber + @react-three/drei
- **物理エンジン**: @react-three/rapier
- **デプロイ**: Cloudflare Pages
- **ストレージ**: Cloudflare R2

## セットアップ

1. リポジトリをクローン:
   ```bash
   git clone git@github.com:andsaki/biotope.git
   cd biotope-project
   ```

2. 依存関係をインストール:
   ```bash
   npm install
   ```

3. 開発サーバーを起動:
   ```bash
   npm run dev
   ```

4. ビルド:
   ```bash
   npm run build
   ```

## プロジェクト構造

```
src/
├── components/          # UIコンポーネント
│   ├── FishManager.tsx      # 魚の管理
│   ├── Ground.tsx           # 地面
│   ├── WaterSurface.tsx     # 水面
│   ├── DriftingBottle.tsx   # 漂流する瓶
│   ├── SeasonalEffects.tsx  # 季節エフェクト統合
│   ├── Sun.tsx              # 太陽
│   ├── SceneLights.tsx      # ライティング
│   └── UI.tsx               # メインUI
├── hooks/               # カスタムフック
│   ├── useRealTime.ts       # 日本時間管理
│   ├── useWindDirection.ts  # 風向き管理
│   └── useLoader.ts         # ローディング管理
├── contexts/            # 状態管理
│   └── SeasonContext.tsx    # 季節管理
├── utils/               # ユーティリティ
│   └── sunPosition.ts       # 太陽位置計算
├── constants.ts         # アプリケーション定数
└── assets/              # 静的資産（R2アップロード対象）
```

## パフォーマンス最適化

### コード分割
`React.lazy` と `Suspense` で重い3Dコンポーネントを遅延読み込み。

### React.memo
主要コンポーネントをメモ化して不要な再レンダリングを防止。

### レンダリング効率化
- **FishManager**: refベースの時間管理で計算削減
- **ParticleLayer**: 更新頻度を50%削減（2フレームに1回）

### Viteビルド最適化
```ts
// vite.config.ts
export default defineConfig({
  build: {
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'three-vendor': ['three', '@react-three/fiber', '@react-three/drei', '@react-three/rapier'],
        },
      },
    },
  },
});
```

## CI/CD

### GitHub Actions ワークフロー

1. **upload-to-r2.yml**: アセットをCloudflare R2に自動アップロード
   - アセット変更時のみ実行（paths指定）
   - npmキャッシュでWranglerインストール高速化
   - 並列アップロードで10ファイルを同時処理
   - Actions v4で高速化

2. **cache-warm.yml**: 毎日15:00 JSTにキャッシュウォーム

### デプロイ
Cloudflare Pagesに自動デプロイ。アセットはR2から配信。

## ドキュメント

- [`docs/drifting-bottle-feature.md`](docs/drifting-bottle-feature.md): 漂流する瓶の機能説明
- [`docs/realtime-clock-feature.md`](docs/realtime-clock-feature.md): リアルタイム時計の機能説明
- [`docs/seasonal-effects-feature.md`](docs/seasonal-effects-feature.md): 季節エフェクトの機能説明
- [`docs/refactoring-summary.md`](docs/refactoring-summary.md): リファクタリング概要

## ライセンス

MIT
