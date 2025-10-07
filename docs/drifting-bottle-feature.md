# 漂流する瓶の機能

## 概要

水面を漂流する瓶をクリックすると、中に入っている便箋を読むことができる機能です。遠くから30秒かけてゆっくりと漂流してきます。

## 主な機能

### 1. 漂流アニメーション

- **開始位置**: 左奥の遠く `(-15, 8.2, 10)`
- **目的地**: 指定された位置（デフォルト: `[-3, 8.2, 2]`）
- **所要時間**: 30秒
- **イージング**: Cubic ease-out で自然な減速

### 2. 揺れと傾きの動き

- **上下の揺れ**: `Math.sin(time * 2) * 0.1`
- **左右の揺れ**: `Math.sin(time * 0.5) * 0.5`
- **X軸の傾き**: `Math.sin(time * 0.5) * 0.4`
- **Z軸の傾き**: `Math.cos(time * 0.4) * 0.5`
- **Y軸の回転**: `Math.sin(time * 0.3) * 0.3 + time * 0.05`

### 3. 瓶のデザイン

#### 構成要素:
- **瓶の本体**: 透明な円柱（緑がかったガラス）
- **瓶の首**: 細くなった円柱
- **コルク栓**: 茶色の円柱
- **便箋**: 中に巻かれた紙

#### マテリアル:
```typescript
meshPhysicalMaterial {
  color: "#88ccaa"
  transparent: true
  opacity: 0.6
  roughness: 0.1
  metalness: 0.1
  transmission: 0.9
  thickness: 0.5
}
```

### 4. インタラクション

#### ホバー効果:
- 白いワイヤーフレームのハイライト表示
- `opacity: 0.2`

#### クリック時:
- 便箋の内容をポップアップ表示
- 和紙風のデザイン（`background: rgba(245, 230, 211, 0.98)`）
- 閉じるボタン付き

### 5. 便箋の内容

5種類のランダムなメッセージから1つが表示されます：

1. **船乗りからの挨拶**
2. **夕日の思い出**
3. **春の便り**
4. **水面を眺める時間**
5. **世界の繋がり**

すべてのメッセージに「— 漂流者より」の署名が付きます。

## 使用方法

### 基本的な使い方

```tsx
import { DriftingBottle } from "./components/DriftingBottle";

<DriftingBottle
  position={[-3, 8.2, 2]}
  onMessageRead={() => console.log("メッセージが読まれました")}
/>
```

### Props

| プロパティ | 型 | 説明 |
|----------|-----|-----|
| `position` | `[number, number, number]` | 瓶の目的地の座標 (X, Y, Z) |
| `onMessageRead` | `() => void` | 便箋が開かれた時のコールバック（オプション） |

### 複数の瓶を配置

```tsx
<DriftingBottle position={[-3, 8.2, 2]} />
<DriftingBottle position={[4, 8.2, -1]} />
<DriftingBottle position={[0, 8.2, 5]} />
```

## 技術的な詳細

### アニメーションロジック

```typescript
// 開始時刻を記録
if (startTimeRef.current === null) {
  startTimeRef.current = time;
}

const elapsedTime = time - startTimeRef.current;

// 進行度を計算（0〜1）
const driftProgress = Math.min(elapsedTime / 30, 1);

// イージング適用
const easeProgress = 1 - Math.pow(1 - driftProgress, 3);

// 現在位置を計算
const currentX = startX + (targetX - startX) * easeProgress;
const currentZ = startZ + (targetZ - startZ) * easeProgress;
```

### 水面の高さ

水面のY座標は `8` 付近で変動します（`WaterSurface.tsx` 参照）。
瓶のY座標は `8.2` に設定されており、常に水面に浮かんでいるように見えます。

## カスタマイズ

### メッセージの追加

`getRandomMessage()` 関数の `messages` 配列に新しいメッセージを追加できます：

```typescript
const messages = [
  // 既存のメッセージ...
  `新しいメッセージ`,
];
```

### 漂流時間の変更

30秒の部分を変更します：

```typescript
const driftProgress = Math.min(elapsedTime / 60, 1); // 60秒に変更
```

### 開始位置の変更

```typescript
const startX = -20; // もっと遠くから
const startZ = 15;  // もっと奥から
```

### 揺れの強さを調整

```typescript
bottleRef.current.rotation.x = Math.sin(time * 0.5) * 0.6; // 0.4 → 0.6 でもっと傾く
```

## パフォーマンス

- **レンダリングコスト**: 低
- **メッシュ数**: 5個（本体、首、栓、便箋、ハイライト）
- **アニメーション**: `useFrame` で毎フレーム更新
- **HTML要素**: 便箋表示時のみレンダリング

## 今後の改善案

- [ ] 瓶が複数の場所からランダムに出現
- [ ] 瓶の色や形のバリエーション
- [ ] メッセージの投稿機能（サーバー連携）
- [ ] 瓶を開けた履歴の保存
- [ ] 音響効果（波の音、瓶を開ける音）
- [ ] 夜間は瓶がほんのり光る演出
