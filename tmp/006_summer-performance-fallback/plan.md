# 実装計画: 夏の重い要素の段階的ローディング

## セッション情報

- **セッションID**: 006
- **作成日**: 2026-01-14
- **タスク**: 夏に画面が黒くなる問題を解決（重い要素の段階的表示）

---

## 背景

### ユーザーからのフィードバック

> 夏の時に画面が黒くなっているので重い要素は後から表示できるようにフォールバックして欲しい

**具体的な問題**:
1. 夏の季節に切り替えると画面が黒くなる
2. 蓮の葉（LilyPads）の3Dモデル読み込みに時間がかかる
3. ユーザー体験が悪化（真っ黒な画面が数秒続く）

### 原因分析

**夏に表示される重い要素**:
- **LilyPads（蓮の葉）**: 3Dモデル（`lily.glb`）を使用
  - `src/components/WaterPlantsLarge.tsx` で `{season === "summer" && <LilyPads />}` として表示
  - `useModelScene("lily")` で3Dモデルを読み込み
  - 読み込みに時間がかかり、その間画面が黒くなる

**パフォーマンス調査の結果**（tmp/004_performance-tuning/）:
- SeasonalEffects全体で26M三角形
- Draw Calls 600と高い
- 3Dモデルの読み込みがボトルネック

---

## 改善方針

### 目標

- **段階的なローディング**: 軽い要素を先に表示し、重い3Dモデルは後から読み込む
- **フォールバック表示**: ローディング中は簡易版やプレースホルダーを表示
- **ユーザー体験の向上**: 画面が黒くなる時間を最小化

### 技術的アプローチ

React SuspenseとLazyを活用した段階的ローディング:

1. **Suspenseラッパー**: 重い3Dモデルコンポーネントを`Suspense`でラップ
2. **Fallback表示**: ローディング中は軽量なプレースホルダーを表示
3. **Lazy Loading**: 必要になってから重いコンポーネントを読み込む

---

## 実装内容

### 1. SuspenseラッパーでLilyPadsを包む

**ファイル**: `src/components/WaterPlantsLarge.tsx`

#### Before

```typescript
import LilyPads from "./LilyPads";

// ...

{season === "summer" && <LilyPads />}
```

#### After

```typescript
import React, { Suspense, lazy } from "react";

// 遅延ロード
const LilyPads = lazy(() => import("./LilyPads"));

// Suspenseでラップ
{season === "summer" && (
  <Suspense fallback={null}>
    <LilyPads />
  </Suspense>
)}
```

**変更点**:
- `import LilyPads from "./LilyPads"` → `const LilyPads = lazy(() => import("./LilyPads"))`
- `<LilyPads />` → `<Suspense fallback={null}><LilyPads /></Suspense>`
- `fallback={null}`: ローディング中は何も表示しない（背景が見える）

### 2. より良いフォールバック表示（オプション）

ローディング中に簡易的なプレースホルダーを表示する場合:

```typescript
// 簡易的な蓮の葉プレースホルダー
const LilyPadPlaceholder = () => (
  <group>
    {LILY_DATA.map((data, i) => (
      <mesh key={i} position={data.position} rotation={[Math.PI / 2, 0, data.rotation]}>
        <circleGeometry args={[data.scale * 0.3, 8]} />
        <meshBasicMaterial color="#90C695" opacity={0.3} transparent />
      </mesh>
    ))}
  </group>
);

// Suspenseのfallbackに指定
<Suspense fallback={<LilyPadPlaceholder />}>
  <LilyPads />
</Suspense>
```

**メリット**:
- ローディング中も何かが表示される
- ユーザーは「読み込み中」と認識できる
- 画面が完全に黒くならない

### 3. 事前ロード（オプション）

季節が変わる前に事前に読み込んでおく:

```typescript
// src/hooks/useModelScene.ts または App.tsx
import { preloadModel } from '../utils/modelHelpers';

// 夏が近づいたら事前ロード
useEffect(() => {
  const month = new Date().getMonth() + 1;
  if (month >= 5) { // 5月以降
    preloadModel('lily.glb');
  }
}, []);
```

---

## 実装手順

### ステップ1: LilyPadsをLazy Loadingに変更

- [ ] `src/components/WaterPlantsLarge.tsx` を修正
- [ ] `import LilyPads` を `lazy(() => import("./LilyPads"))` に変更
- [ ] `<LilyPads />` を `<Suspense fallback={null}><LilyPads /></Suspense>` でラップ

### ステップ2: フォールバック表示の追加（オプション）

- [ ] `LilyPadPlaceholder` コンポーネントを作成
- [ ] 簡易的な円形メッシュで蓮の葉を表現
- [ ] `fallback={<LilyPadPlaceholder />}` に変更

### ステップ3: 動作確認

- [ ] 夏の季節に切り替えて動作確認
- [ ] 画面が黒くならないか確認
- [ ] フォールバック表示が正しく機能するか確認
- [ ] 3Dモデルが正しく読み込まれるか確認

### ステップ4: 他の重い要素にも適用（必要に応じて）

- [ ] `FallenLeaves`（落ち葉）も重い場合は同様の対応
- [ ] その他の3Dモデルコンポーネントも検討

---

## 期待される効果

### ユーザー体験の改善

1. **画面が黒くならない**: ローディング中もシーンが表示される
2. **スムーズな遷移**: 軽い要素が先に表示され、重い要素が後から追加
3. **体感速度の向上**: 実際の読み込み時間は同じでも、待たされている感覚が減る

### 技術的メリット

- コード分割（Code Splitting）により初期バンドルサイズが削減
- 必要になるまでLilyPadsのコードが読み込まれない
- 他の季節でのパフォーマンス向上

---

## 考慮事項とトレードオフ

### メリット

✅ 画面が黒くならない
✅ ユーザー体験が向上
✅ コード分割による初期ロード高速化

### デメリット

⚠️ フォールバック表示の実装が必要
⚠️ Suspenseの境界管理が複雑になる可能性
⚠️ 事前ロードを使わない場合、季節切替時に遅延が感じられる

### 推奨事項

1. **まずはシンプルに**: `fallback={null}` で開始
2. **必要に応じて**: プレースホルダーを追加
3. **パフォーマンステスト**: 実際の改善効果を測定

---

## テスト計画

### テストケース

1. **夏への季節切替**:
   - [ ] 画面が黒くならないか
   - [ ] フォールバック表示が正しく機能するか
   - [ ] 蓮の葉が正しく読み込まれるか

2. **他の季節からの切替**:
   - [ ] 春→夏
   - [ ] 秋→夏
   - [ ] 冬→夏

3. **パフォーマンス**:
   - [ ] FPSが60を維持できるか
   - [ ] Draw Callsが増加していないか
   - [ ] Memory使用量が適切か

### テスト手順

```bash
# 開発サーバーを起動
npm run dev

# ブラウザで確認
# 1. 夏以外の季節でロード
# 2. UIから夏に切り替え
# 3. 画面が黒くならないか確認
# 4. 蓮の葉が表示されるか確認

# PerformanceMonitorで確認
# PERFORMANCE_MONITOR = true にして測定
```

---

## 次のステップ

1. **実装**: WaterPlantsLarge.tsxを修正
2. **テスト**: 夏の季節切替で動作確認
3. **フィードバック**: ユーザーに確認
4. **必要に応じて**: フォールバック表示を追加
5. **他の重い要素**: 同様の対応を検討

---

## 参考資料

- React Suspense: https://react.dev/reference/react/Suspense
- React.lazy: https://react.dev/reference/react/lazy
- Code Splitting: https://react.dev/learn/code-splitting
- `tmp/004_performance-tuning/`: パフォーマンス調査結果
- `src/components/LilyPads.tsx`: 蓮の葉コンポーネント
- `src/components/WaterPlantsLarge.tsx`: 水生植物の統合コンポーネント
