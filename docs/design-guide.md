# Biotope Design Guide

このドキュメントは、**Biotopeプロジェクト専用のデザイン指針**です。水辺の生態系をテーマにした没入型3D体験を構築するための、統一された美的方向性とベストプラクティスを定義します。

## プロジェクトのデザイン哲学

### コアコンセプト

**「水中から水面へ - 生命の流れを感じる体験」**

ビオトープ（水辺の生態系）という自然のシステムを、技術とアートの融合で表現します。ジェネリックな「自然っぽい」デザインではなく、**水の物理的・光学的特性**を正確に再現し、**日本的な季節感**と融合させた独自の美学を追求します。

## デザイン原則

### 1. Purpose（目的）

- **問題解決**: 時間・季節の経過を視覚的に体験する、瞑想的なデジタル空間の提供
- **ターゲット**: 自然との繋がりを求める人、リラクゼーション、教育目的
- **体験**: 受動的な観察と能動的なインタラクション（季節変更、時間観察）の両立

### 2. Tone（美的方向性）

**選択した方向性: 静謐な最小主義 × 有機的な流動性**

- **静謐さ**: 過度なアニメーションを避け、自然のリズムに従う
- **流動性**: 水の動き、光の屈折、生物の自然な動作
- **透明性**: ガラスモーフィズムによる深度と層の表現
- **季節性**: 日本の四季を色・光・エフェクトで繊細に表現

### 3. Color Palette（カラーパレット）

#### 基本色

```typescript
// 水のグラデーション（深度による変化）
const waterDepths = {
  deep: '#0a1f2e',      // 深海 - 夜
  middle: '#1a4a5e',    // 中層
  surface: '#2d6a7d',   // 水面
  shallow: '#4a8fa8',   // 浅瀬
};

// UIレイヤー（ガラスモーフィズム）
const uiGlass = {
  light: 'rgba(255, 255, 255, 0.12)',
  lighter: 'rgba(255, 255, 255, 0.25)',
  border: 'rgba(255, 255, 255, 0.18)',
  text: 'rgba(255, 255, 255, 0.95)',
  textMuted: 'rgba(255, 255, 255, 0.7)',
};

// 季節のアクセント
const seasonalAccents = {
  spring: {
    primary: '#FFB7C3',   // 桜色
    secondary: '#98D8C8', // 若葉
  },
  summer: {
    primary: '#4ECDC4',   // 青緑
    secondary: '#FFE66D', // 陽光
  },
  autumn: {
    primary: '#FF6B6B',   // 紅葉
    secondary: '#FFD93D', // 銀杏
  },
  winter: {
    primary: '#E8F4F8',   // 雪
    secondary: '#B8D4E0', // 氷
  },
};
```

### 4. Typography（タイポグラフィ）

#### フォント選択

```typescript
const typography = {
  // 主要フォント: Noto Serif JP（和の静謐さ）
  primary: "'Noto Serif JP', serif",

  // 数字・時刻表示: モノスペース
  mono: "'Courier New', monospace",

  // 階層
  hierarchy: {
    hero: 'clamp(56px, 10vw, 110px)',      // ローディング
    h1: 'clamp(32px, 5vw, 48px)',         // メインタイトル
    h2: 'clamp(20px, 3vw, 28px)',         // セクション
    body: 'clamp(14px, 2vw, 18px)',       // 本文
    caption: 'clamp(12px, 1.5vw, 14px)',  // キャプション
  },

  // ウェイト
  weight: {
    light: 200,
    regular: 400,
    medium: 500,
  },

  // レターツーシング
  letterSpacing: {
    tight: '0.05em',
    normal: '0.1em',
    wide: '0.2em',
    wider: '0.3em',
  },
};
```

#### タイポグラフィルール

1. **日本語テキスト**: 必ず `letter-spacing: 0.1em` 以上
2. **グローエフェクト**: 夜間UIには `text-shadow` で視認性向上
3. **階層の明確化**: font-sizeとweightで明確に区別

### 5. Motion & Animation（動きとアニメーション）

#### アニメーション原則

```typescript
const motion = {
  // イージング
  easing: {
    natural: 'cubic-bezier(0.22, 1, 0.36, 1)',     // メイン
    gentle: 'cubic-bezier(0.4, 0, 0.2, 1)',        // hover
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)', // 特殊
  },

  // デュレーション
  duration: {
    instant: '0.15s',
    fast: '0.3s',
    base: '0.5s',
    slow: '0.8s',
    verySlow: '2s',
  },

  // ディレイ（連続表示）
  stagger: {
    base: 0.1,      // 100ms間隔
    slow: 0.2,      // 200ms間隔
  },
};
```

#### アニメーション分類

**1. 環境アニメーション（自然現象）**
- 水面の波: `2-4s` の緩やかなループ
- 気泡の上昇: `4-10s` のランダムな動き
- 魚の動き: `10-20s` の不規則なパターン
- 光の屈折: `8-12s` の微細な変化

**2. UIアニメーション（インタラクション）**
- hover: `0.3s` の即座の反応
- パネル開閉: `0.5s` のスムーズな展開
- ボタンクリック: `scale + translateY` の立体感
- ページロード: `1.5-2s` の段階的なフェードイン

**3. トランジション（状態変化）**
- 季節変更: `3-5s` のクロスフェード
- 昼夜切り替え: `2-3s` のグラデーション変化
- メッセージ表示: `0.8s` のスライド + フェード

#### 禁止事項

❌ **使用禁止**:
- ジェネリックな bouncing dots
- 単純な回転ローディング
- 過度な parallax（酔いの原因）
- 予測不可能な動き

✅ **推奨**:
- 自然の物理法則に従った動き
- 予測可能で安心感のあるアニメーション
- パフォーマンスを考慮した軽量な実装

### 6. Visual Effects（視覚効果）

#### ガラスモーフィズム

```typescript
const glassmorphism = {
  // 標準UIパネル
  standard: {
    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0.06))',
    backdropFilter: 'blur(20px) saturate(180%)',
    border: '1px solid rgba(255, 255, 255, 0.18)',
    boxShadow: `
      0 8px 32px rgba(0, 0, 0, 0.4),
      inset 0 1px 0 rgba(255, 255, 255, 0.3),
      inset 0 -1px 0 rgba(0, 0, 0, 0.2)
    `,
  },

  // ホバー時
  hover: {
    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.22), rgba(255, 255, 255, 0.12))',
    transform: 'scale(1.05) translateY(-2px)',
    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.5)',
  },

  // アクティブ時
  active: {
    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.25), rgba(255, 255, 255, 0.15))',
    boxShadow: `
      0 4px 12px rgba(0, 0, 0, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.3)
    `,
  },
};
```

#### 深度レイヤー

```typescript
const depth = {
  background: 0,      // 3D環境
  water: 1,           // 水面
  particles: 2,       // パーティクル
  objects: 3,         // 漂流物
  ui: 100,            // UIボタン
  panel: 200,         // UIパネル
  modal: 300,         // モーダル
};
```

#### 光と影

```typescript
const lighting = {
  // 夜間（現在の実装）
  night: {
    ambient: 0.2,
    directional: 0.4,
    point: 0.6,
    shadowResolution: 512,
  },

  // 昼間
  day: {
    ambient: 0.5,
    directional: 0.8,
    point: 0.3,
    shadowResolution: 1024,
  },

  // グロー効果
  glow: {
    text: '0 0 20px rgba(142, 202, 230, 0.5)',
    ui: '0 0 30px rgba(255, 255, 255, 0.2)',
    accent: '0 0 40px rgba(255, 107, 107, 0.6)',
  },
};
```

### 7. Spatial Design（空間設計）

#### レイアウト原則

**PCレイアウト**:
```
┌────────────────────────────────────────┐
│ [コンパス]              [季節ボタン]   │
│                                        │
│                                        │
│           3Dビオトープ空間              │
│                                        │
│                                        │
│                [時計パネル]             │
└────────────────────────────────────────┘
```

**モバイルレイアウト**:
```
┌──────────────┐
│ [C]      [季] │
│              │
│   3D空間     │
│              │
│              │
│    [時計]    │
└──────────────┘
```

#### 余白（スペーシング）

```typescript
const spacing = {
  xs: '4px',      // 最小間隔
  sm: '8px',      // 小
  md: '16px',     // 中（標準）
  lg: '24px',     // 大
  xl: '32px',     // 特大
  xxl: '48px',    // 超大
};
```

### 8. Responsive Design（レスポンシブ）

#### ブレークポイント

```typescript
const breakpoints = {
  mobile: '0px',        // ~767px
  tablet: '768px',      // 768px~1023px
  desktop: '1024px',    // 1024px~1439px
  wide: '1440px',       // 1440px~
};
```

#### レスポンシブ戦略

1. **モバイルファースト**: 基本はモバイル、段階的に拡張
2. **clamp()の活用**: `clamp(min, prefer, max)` で流動的なサイズ
3. **transform scale()**: モバイルではUIを0.75倍に縮小
4. **タッチ最適化**: 最小タップ領域 48x48px

### 9. Performance（パフォーマンス）

#### 最適化ガイドライン

**Three.js / 3D**:
- `useFrame` を最小限に（`useThrottledFrame` で30fps化）
- GLTFモデルは `useMemo` で事前clone
- InstancedMesh でパーティクルを描画
- 夜間は shadow resolution を 1024→512 へ削減

**React**:
- 重いコンポーネントは `React.memo` でメモ化
- Context を細分化（TimeContext → DayPeriod + ClockTime）
- `useMemo` で計算結果をキャッシュ
- `React.lazy` + `Suspense` でコード分割

**CSS / Animation**:
- `backdrop-filter` は重い - 必要最小限に
- `transform` と `opacity` のみアニメーション（GPU加速）
- 複雑な `box-shadow` は控えめに

#### 目標パフォーマンス

- FPS: 55-60 (安定)
- 初期ロード: <3秒
- インタラクション遅延: <100ms
- メモリ使用量: <500MB

## コンポーネント別デザイン仕様

### Loader（ローディング画面）

**目的**: 水中から浮上する没入体験の導入

**要素**:
- 深海グラデーション背景（5層）
- 浮遊する気泡（12個、ランダム配置）
- グレインテクスチャオーバーレイ
- グラデーションテキスト（clamp: 56-110px）
- 波紋ローディング（4層の同心円）
- 魚の影（3匹、異なる速度）

**配色**:
```typescript
background: linear-gradient(180deg,
  #061420 0%,
  #0f2d3d 30%,
  #1a4a5e 60%,
  #2d6a7d 100%
);
```

### UI Panel（四季セレクタ + 時計）

**目的**: 非侵襲的なコントロール

**スタイル**:
- ガラスモーフィズム
- 右上配置、スライドイン展開
- 閉じるボタンは円形、回転アニメーション

**インタラクション**:
- hover: `scale(1.05) translateY(-2px)`
- active: 内側グローの強化
- transition: `0.3s cubic-bezier(0.4, 0, 0.2, 1)`

### Wind Direction Compass（風向きコンパス）

**目的**: 環境情報の視覚化

**デザイン**:
- 透明な円形ゲージ
- N/E/S/W のラベル
- 赤い矢印（グラデーション）
- 方位の漢字表示

### Message Card（メッセージカード）

**目的**: AI生成メッセージの表示

**未実装**: 次のステップで改善予定
- 現在は便箋風デザイン
- ガラスモーフィズム化が必要

## 季節別デザイン仕様

### 春（Spring）

**色**: 桜色 `#FFB7C3` + 若葉 `#98D8C8`
**エフェクト**:
- 桜の花びら（平面パーティクル）
- 柔らかい光
- 明るい水色

### 夏（Summer）

**色**: 青緑 `#4ECDC4` + 陽光 `#FFE66D`
**エフェクト**:
- 蓮の葉（3Dモデル、波連動）
- 強い日差し
- 陽炎エフェクト

### 秋（Autumn）

**色**: 紅葉 `#FF6B6B` + 銀杏 `#FFD93D`
**エフェクト**:
- 落ち葉（3Dモデル、水面浮遊）
- 温かみのある照明
- 深い色調

### 冬（Winter）

**色**: 雪 `#E8F4F8` + 氷 `#B8D4E0`
**エフェクト**:
- 雪（球体パーティクル）
- 冷たい照明
- 静謐な雰囲気

## アンチパターン（避けるべきもの）

### ❌ 絶対に使わない

1. **ジェネリックなグラデーション**
   - 単調な青グラデーション（`#87CEEB` → `#4A90E2`）
   - Material Design風の紫-青グラデーション

2. **ありふれたローディング**
   - Bouncing dots（...）
   - 単純な回転ローディング
   - プログレスバーのみ

3. **便箋風デザイン（旧スタイル）**
   - 不透明なベージュ背景
   - 2重の茶色ボーダー
   - 水のコンテキストに合わない

4. **過度なアニメーション**
   - 常に動き続ける要素
   - 予測不可能なモーション
   - 60fps以上の不要な更新

5. **アクセシビリティ無視**
   - 低コントラスト
   - 小さすぎるタップ領域
   - キーボードナビゲーション不可

### ✅ 常に使う

1. **水の物理特性**
   - 光の屈折と反射
   - 波紋の自然な広がり
   - 気泡の浮力

2. **日本的な季節感**
   - 繊細な色の変化
   - 漢字の美しい配置
   - 静謐な余白

3. **パフォーマンス最適化**
   - 60fps維持
   - メモリ効率
   - 軽量な初期ロード

4. **アクセシビリティ**
   - WCAG AA準拠のコントラスト
   - キーボード操作可能
   - レスポンシブデザイン

## 実装チェックリスト

新しいUIコンポーネントを追加する際の確認項目：

### デザイン

- [ ] ガラスモーフィズムスタイルを適用
- [ ] 適切な `backdrop-filter` と `blur` 値
- [ ] 多層の `box-shadow`（外側 + inset）
- [ ] 白ベースのテキスト（`rgba(255, 255, 255, 0.95)`）
- [ ] `text-shadow` で視認性確保
- [ ] レスポンシブ対応（clamp使用）

### アニメーション

- [ ] `cubic-bezier` イージング
- [ ] hover時の適切なフィードバック
- [ ] 60fps維持（`transform` + `opacity` のみ）
- [ ] `transition` の duration 適切
- [ ] 過度なアニメーションなし

### パフォーマンス

- [ ] 重いコンポーネントは `React.memo`
- [ ] 計算結果は `useMemo`
- [ ] Three.js は `useThrottledFrame`
- [ ] 不要な再レンダリングなし

### アクセシビリティ

- [ ] コントラスト比 4.5:1 以上
- [ ] タップ領域 48x48px 以上
- [ ] `aria-label` 適切
- [ ] キーボード操作可能

## 将来の改善項目

1. **Message Card のリデザイン**
   - 便箋風 → ガラスモーフィズム化
   - アニメーション強化

2. **季節トランジション**
   - クロスフェードの改善
   - 中間状態の追加

3. **サウンドデザイン**
   - 水の音、鳥の声
   - インタラクション音

4. **追加エフェクト**
   - 雨のエフェクト
   - より多様な魚

## 参考リソース

- [Claude Code Frontend Design Skill](https://github.com/anthropics/claude-code/blob/main/plugins/frontend-design/skills/frontend-design/SKILL.md)
- [Glassmorphism CSS Generator](https://ui.glass/generator/)
- [Three.js Performance Tips](https://discoverthreejs.com/tips-and-tricks/)
- [React Performance Optimization](https://react.dev/learn/render-and-commit)

---

**最終更新**: 2026-01-13
**バージョン**: 1.0.0
