# Biotope プロジェクト

このプロジェクトは、React、TypeScript、Vite を使用してビオトープ環境をシミュレートするウェブアプリケーションです。池、魚の管理、地面、季節のコンテキストなどのインタラクティブなコンポーネントを備えており、動的な生態系ビジュアライゼーションを作成します。

## セットアップ

このテンプレートは、Vite で React を動作させるための最小限のセットアップを提供し、HMR といくつかの ESLint ルールが含まれています。

現在、2 つの公式プラグインが利用可能です：

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) は [Babel](https://babeljs.io/) を使用して Fast Refresh を行います
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) は [SWC](https://swc.rs/) を使用して Fast Refresh を行います

## インストール

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

- `src/components/`：`Pond`、`FishManager`、`Ground`、`ParticleLayer`などの UI コンポーネントが含まれています。
- `src/contexts/`：季節の変化のための`SeasonContext`など、アプリケーションの状態を管理します。
- `src/assets/`：アプリケーションで使用される静的資産。

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
