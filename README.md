# Biotope プロジェクト

このプロジェクトは、React、TypeScript、Vite を使用してビオトープ環境をシミュレートするウェブアプリケーションです。池、魚の管理、地面、季節のコンテキストなどのインタラクティブなコンポーネントを備えており、動的な生態系ビジュアライゼーションを作成します。

## 主な機能

- **3Dビオトープ環境**: Three.js を使用した没入型の3D環境
- **リアルタイム時計**: 日本時間（UTC+9）と連動した時計と昼夜の切り替え
- **動的照明システム**: 実時間に応じた太陽の位置と照明の変化
- **リッチな季節エフェクト**:
  - **春**: 桜の花びらが舞う、明るい新緑
  - **夏**: 陽炎エフェクト、強い日差し、きらめく水面
  - **秋**: 紅葉の落ち葉（7色のバリエーション）
  - **冬**: 雪が降る、冷たい照明
  - 季節ごとの照明・色調変化
  - 魚の動きと色の季節変化
  - 水草の色の季節変化
- **インタラクティブな要素**:
  - 水面のアニメーション
  - 日時計（影の動き）
  - 泡のエフェクト
  - **漂流する瓶**: 遠くから漂流してくる瓶をクリックすると季節ごとの便箋が読める
- **レスポンシブデザイン**: 様々な画面サイズに対応

## セットアップ

このテンプレートは、Vite で React を動作させるための最小限のセットアップを提供し、HMR といくつかの ESLint ルールが含まれています。

現在、2 つの公式プラグインが利用可能です：

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) は [Babel](https://babeljs.io/) を使用して Fast Refresh を行います
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) は [SWC](https://swc.rs/) を使用して Fast Refresh を行います

## インストール

**注意**: このプロジェクトは Cloudflare Pages へのデプロイに焦点を当てています。Vercel に関連する設定や統合が存在する場合は、GitHub リポジトリの設定または Vercel ダッシュボードからそれらを削除または無効にしてください。

1. リポジトリをクローンします：

   ```bash
   git clone git@github.com:andsaki/biotope.git
   cd biotope-project
   ```

2. 依存関係をインストールします：

   ```bash
   npm install
   ```

3. 開発サーバーを起動します：
   ```bash
   npm run dev
   ```

## プロジェクト構造

- `src/components/`：UI コンポーネント
  - `Pond.tsx`: 池のメインコンポーネント
  - `FishManager.tsx`: 魚の管理（季節ごとの速度・色変化）
  - `Ground.tsx`: 地面の描画
  - `WaterSurface.tsx`: 水面のアニメーション
  - `WaterPlantsLarge.tsx`: 水草（季節ごとの色変化）
  - `FallenLeaves.tsx`: 秋の紅葉の落ち葉（7色、15枚）
  - `CherryBlossoms.tsx`: 春の桜の花びらエフェクト
  - `SummerEffects.tsx`: 夏の陽炎エフェクト
  - `SnowEffect.tsx`: 冬の雪エフェクト
  - `SundialBase.tsx`, `SundialGnomon.tsx`: 日時計コンポーネント
  - `LightingController.tsx`: 季節ごとの照明システム
  - `Loader.tsx`: ローディング画面
  - `DriftingBottle.tsx`: 漂流する瓶と季節ごとの便箋
- `src/hooks/`: カスタムフック
  - `useRealTime.ts`: 日本時間の取得と昼夜判定
  - `useSimulatedTime.ts`: 時間シミュレーション（旧版）
  - `useWindDirection.ts`: 風向きの管理
  - `useLoader.ts`: ローディング状態の管理
- `src/contexts/`: アプリケーションの状態管理
  - `SeasonContext`: 季節の変化管理
- `src/constants.ts`: アプリケーション定数
- `src/assets/`: 静的資産（**Cloudflare R2へのアップロード対象**）
- `docs/`: ドキュメント
  - `drifting-bottle-feature.md`: 漂流する瓶の機能説明
  - `realtime-clock-feature.md`: リアルタイム時計の機能説明
  - `seasonal-effects-feature.md`: 季節エフェクトの機能説明
  - `sequence-diagrams.md`: シーケンス図

## パフォーマンス最適化

本プロジェクトでは、初期ロード時間の短縮とパフォーマンス向上のため、以下の最適化を適用しています。

### コード分割 (Code Splitting)

`React.lazy` と `Suspense` を使用して、一部の重い3Dコンポーネント（例: `WaterPlantsLarge`, `PottedPlant`, `Rocks`, `BubbleEffect`）を遅延読み込みしています。これにより、初期バンドルサイズが削減され、アプリケーションの起動が高速化されます。

```tsx
// src/App.tsx の例
const WaterPlantsLarge = React.lazy(() => import("./components/WaterPlantsLarge"));
// ...
<Suspense fallback={null}>
  <WaterPlantsLarge />
</Suspense>
```

### バンドル分析

`rollup-plugin-visualizer` を導入し、ビルド後のバンドルサイズの内訳を視覚的に確認できるようにしています。これにより、どのライブラリやモジュールがバンドルサイズを大きくしているかを特定し、最適化の指針とすることができます。

ビルド後に `dist/stats.html` が生成され、ブラウザで自動的に開かれます。

## Cloudflare Pages / R2 へのデプロイ

本プロジェクトは Cloudflare Pages を使用してデプロイされ、静的アセットは Cloudflare R2 にアップロードされます。

### アセットのアップロード

アセット（3Dモデル、テクスチャなど）は `src/assets` ディレクトリに配置されており、GitHub Actions ワークフロー (`.github/workflows/upload-to-r2.yml`) を通じて Cloudflare R2 に自動的にアップロードされます。

`wrangler r2 object put` コマンドは、`src/assets` 内のファイルをR2バケットに同期するように設定されています。

## 技術スタック

- **フレームワーク**: React 18 + TypeScript
- **ビルドツール**: Vite
- **3D描画**: Three.js + @react-three/fiber + @react-three/drei
- **物理エンジン**: @react-three/rapier
- **デプロイ**: Cloudflare Pages
- **ストレージ**: Cloudflare R2

## ESLint 設定の拡張

本番アプリケーションを開発している場合、タイプ対応の lint ルールを有効にするために設定を更新することをお勧めします：

```js
export default tseslint.config([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      // 他の設定...

      // tseslint.configs.recommendedを削除し、これに置き換える
      ...tseslint.configs.recommendedTypeChecked,
      // より厳格なルールを使用する場合はこちら
      ...tseslint.configs.strictTypeChecked,
      // スタイルルールを追加する場合はこちら
      ...tseslint.configs.stylisticTypeChecked,

      // 他の設定...
    ],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.node.json", "./tsconfig.app.json"],
        tsconfigRootDir: import.meta.dirname,
      },
      // 他のオプション...
    },
  },
]);
```

React 固有の lint ルールのために、[eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) および [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) をインストールすることもできます：

```js
// eslint.config.js
import reactX from "eslint-plugin-react-x";
import reactDom from "eslint-plugin-react-dom";

export default tseslint.config([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      // 他の設定...
      // React用のlintルールを有効にする
      reactX.configs["recommended-typescript"],
      // React DOM用のlintルールを有効にする
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.node.json", "./tsconfig.app.json"],
        tsconfigRootDir: import.meta.dirname,
      },
      // 他のオプション...
    },
  },
]);
```
