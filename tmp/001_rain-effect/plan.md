# 実装計画: 雨エフェクトの追加

## 目的

梅雨時期（6月）に雨粒のパーティクルエフェクトを追加し、季節感をより豊かにする。

## 実装スコープ

### 1. 定数ファイルの作成

**ファイル**: `src/constants/rainEffect.ts`

```typescript
// 雨粒の数
export const RAIN_DROP_COUNT = 500;

// 雨粒のサイズ
export const RAIN_DROP_SIZE = {
  WIDTH: 0.02,
  HEIGHT: 0.3,
} as const;

// 雨粒の速度
export const RAIN_DROP_SPEED = {
  Y: -0.5,  // 落下速度
  X_VARIATION: 0.05,  // 風による横ブレ
} as const;

// 雨粒の生成範囲
export const RAIN_SPAWN_AREA = {
  X_MIN: -15,
  X_MAX: 15,
  Y: 20,  // 高い位置から生成
  Z_MIN: -15,
  Z_MAX: 15,
} as const;

// 雨粒の色
export const RAIN_COLOR = '#b0c4de';  // 薄い青
export const RAIN_OPACITY = 0.6;
```

### 2. RainEffectコンポーネントの作成

**ファイル**: `src/components/RainEffect.tsx`

**実装方針**:
- InstancedMesh でパフォーマンス最適化
- CylinderGeometry で雨粒の形状（細長い円柱）
- ref ベースのアニメーションで再レンダリング防止
- 地面（Y=0）に到達したら上部にリセット

**主要機能**:
1. 初期化: useMemo で雨粒の初期位置・速度を生成
2. アニメーション: useFrame で落下処理
3. リセット: Y座標が0以下になったら上部に戻す

### 3. SeasonalEffects.tsxへの統合

**変更箇所**: `src/components/SeasonalEffects.tsx`

```typescript
import RainEffect from './RainEffect';

// 6月（梅雨）に雨エフェクトを表示
{month === 6 && <RainEffect />}
```

### 4. パフォーマンス考慮事項

- InstancedMesh使用で描画コール数を1に削減
- useThrottledFrameは不要（雨は滑らかに落ちる必要がある）
- 雨粒数500は一般的なPCで60FPS維持可能な範囲
- React.memoでコンポーネントをメモ化

## 技術的詳細

### コンポーネント構造

```
RainEffect
├── useMemo: 初期位置・速度の生成
├── useRef: InstancedMeshの参照
└── useFrame: 毎フレームの更新処理
    ├── Y座標を減算（落下）
    ├── X座標に風のブレを加算
    └── Y < 0 でリセット
```

### 既存パターンの踏襲

- **定数管理**: `src/constants/rainEffect.ts` に分離
- **命名規則**: UPPER_SNAKE_CASE
- **最適化**: InstancedMesh + refベースアニメーション
- **メモ化**: React.memo でコンポーネントをラップ

## テスト計画

1. **動作確認**:
   - 日付を6月に変更して雨が表示されるか
   - 雨粒が滑らかに落下するか
   - 地面で消えて上部にリセットされるか

2. **パフォーマンステスト**:
   - `PERFORMANCE_MONITOR = true` で確認
   - FPS が 55-60 を維持するか
   - 描画コール数が増加しすぎていないか

3. **型チェック**:
   - `npm run build` でエラーなし
   - `npm run lint` でwarningなし

## 想定される課題と対策

### 課題1: 雨粒が多すぎてFPS低下

**対策**: `RAIN_DROP_COUNT` を300に減らす

### 課題2: 雨の動きが不自然

**対策**: `RAIN_DROP_SPEED.Y` を調整（-0.3 〜 -0.7の範囲）

### 課題3: 6月以外にも梅雨を表現したい

**対策**: 条件を拡張 `{(month === 6 || month === 7) && <RainEffect />}`

## 完了条件

- [ ] `src/constants/rainEffect.ts` が作成され、すべての定数が定義されている
- [ ] `src/components/RainEffect.tsx` が作成され、雨エフェクトが動作する
- [ ] `SeasonalEffects.tsx` に統合され、6月に表示される
- [ ] FPS が 55-60 を維持している
- [ ] `npm run build` がエラーなく完了
- [ ] `npm run lint` がwarningなく完了

## 実装時間見積もり

- 定数ファイル作成: 5分
- コンポーネント作成: 15分
- 統合とテスト: 10分
- **合計**: 約30分

---

**次のステップ**: この計画でよろしければ、実装を開始します。変更点があればお知らせください。
