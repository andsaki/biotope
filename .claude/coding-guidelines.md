# コーディングガイドライン

## 基本方針

### TypeScript
- 厳格な型定義を使用
- `any` の使用は避ける
- インターフェースで明確な型定義

### React
- 関数コンポーネント使用
- 適切な場所で `React.memo` を使用
- Hooksの依存配列を正確に管理
- 重い処理は `useMemo`/`useCallback` で最適化

### Three.js
- `@react-three/fiber` の宣言的な記法を使用
- パフォーマンスを意識した実装
- 不要な再レンダリングを避ける

## プロジェクト固有のルール

### Context の使用
- 時間情報: `TimeContext` を使用
- 季節情報: `SeasonContext` を使用
- プロップドリリングを避ける

### メッセージ機能
- AI生成メッセージ優先
- フォールバックとして静的メッセージを保持
- `bottleMessages.ts` は**削除禁止**（フォールバック用）

### パフォーマンス
- 3Dコンポーネントは `React.lazy` で遅延読み込み
- 大量のパーティクルは更新頻度を制限
- 重い計算は `useMemo` でキャッシュ

### スタイリング
- **原則**: インラインスタイルは避け、CSSファイルに分離
- **動的な値**: CSS変数（`--custom-property`）を使用
- **定数化が必要な場合**: インラインスタイルオブジェクトを定数化し、TypeScript の `as const` で型安全性を確保
- **デザイントークン**: `src/styles/tokens.ts` のトークンを使用

### ファイル構成
```
components/     # 再利用可能なUIコンポーネント
contexts/       # Context API
hooks/          # カスタムフック
utils/          # ユーティリティ関数
constants/      # 定数・静的データ
```

## よくあるパターン

### Context を使うコンポーネント
```tsx
import { useTime } from '../contexts/TimeContext';
import { useSeason } from '../contexts/SeasonContext';

export const MyComponent = memo(() => {
  const { hour, timeOfDay } = useTime();
  const { currentSeason } = useSeason();

  // ...
});
```

### メモ化されたコンポーネント
```tsx
import { memo } from 'react';

export const MyComponent = memo(({ prop1, prop2 }: Props) => {
  // ...
});

MyComponent.displayName = 'MyComponent';
```

### スタイル定義

**推奨: CSSファイルに分離**
```tsx
// App.css
.App-container {
  position: absolute;
  top: 0;
  left: 0;
}

// App.tsx
<div className="App-container" />
```

**動的な値はCSS変数を使用**
```tsx
// App.css
.App {
  background-color: var(--app-background-color, #4A90E2);
}

// App.tsx
<div
  className="App"
  style={{
    "--app-background-color": backgroundColor,
  } as React.CSSProperties}
/>
```

**定数化が必要な場合（例外的）**
```tsx
const STYLES = {
  container: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
  },
  button: {
    cursor: 'pointer' as const,
  },
} as const;
```

## 禁止事項

❌ `bottleMessages.ts` の削除（フォールバック用）
❌ Context の不適切な使用（無駄な再レンダリング）
❌ `any` 型の多用
❌ useEffect の依存配列の省略
❌ エッジキャッシュを無視したAPI実装

## コミットメッセージ

形式:
```
<動詞>: <簡潔な説明>

- 詳細な変更内容
- 理由や背景

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

例:
```
メッセージの文字数制限を50文字→200文字に拡張

- プロンプトの文字数制限を200文字に変更
- maxOutputTokensを100→300に増加
- README.mdの説明も更新

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```
