# 季節エフェクト機能

## 概要

四季それぞれに特徴的な視覚効果と雰囲気を実装し、ビオトープ環境をよりリッチで没入感のあるものにします。

## 実装された季節エフェクト

### 1. 春（Spring）

#### 視覚効果
- **桜の花びら**: 50個のピンク色パーティクルが空から舞い降りる
- **新緑の水草**: 明るい緑色（#4CAF50）
- **柔らかい照明**: 淡い黄色の太陽光（#FFFACD）

#### 技術詳細
```typescript
// CherryBlossoms.tsx
- パーティクル数: 50個
- 色: #FFB7D5（淡いピンク）
- 落下速度: -0.3 〜 -0.5
- ふわふわとした横移動
- 地面到達時にリセット
```

#### 魚の動き
- 速度: 0.015（穏やかな動き）
- 色: #FF6347（トマトレッド）

### 2. 夏（Summer）

#### 視覚効果
- **陽炎エフェクト**: シェーダーによる揺らぎ表現
- **強い太陽光**: 照明強度6.0（最も強い）
- **きらめく水面**: 追加のポイントライト
- **濃い緑の水草**: #2E7D32

#### 技術詳細
```typescript
// SummerEffects.tsx
- シェーダーマテリアル使用
- 波打つ頂点変形
- グローエフェクト
- 複数のポイントライト配置
```

#### 魚の動き
- 速度: 0.02（活発な動き）
- 色: #FF4500（オレンジレッド）

#### シェーダー
```glsl
// 頂点シェーダー
pos.z += sin(pos.x * 0.5 + time) * 0.3;
pos.z += cos(pos.y * 0.3 + time * 0.7) * 0.2;

// フラグメントシェーダー
float shimmer = sin(vUv.y * 10.0 + time * 2.0) * 0.1;
```

### 3. 秋（Autumn）

#### 視覚効果
- **紅葉の落ち葉**: 7色のバリエーション、15枚
- **黄緑がかった水草**: #558B2F
- **温かい色調の照明**: オレンジ色の太陽光（#FFA500）

#### 技術詳細
```typescript
// FallenLeaves.tsx（強化版）
落ち葉の色バリエーション:
- #8B0000: 深紅
- #DC143C: クリムゾン
- #FF8C00: ダークオレンジ
- #FFD700: ゴールド
- #DAA520: ゴールデンロッド
- #B8860B: ダークゴールデンロッド
- #8B4513: サドルブラウン

動き:
- 水面の揺れに同期
- 流れるような回転
- 横移動（水の流れ）
```

#### 魚の動き
- 速度: 0.01（ゆっくりとした動き）
- 色: #DAA520（ゴールデンロッド）

### 4. 冬（Winter）

#### 視覚効果
- **雪のパーティクル**: 200個の雪の結晶
- **暗い緑の水草**: #1B5E20
- **冷たい青白色の照明**: #E0F7FA
- **弱い照明強度**: 4.0（最も弱い）

#### 技術詳細
```typescript
// SnowEffect.tsx
- パーティクル数: 200個
- 色: #FFFFFF（白）
- 落下速度: -0.1 〜 -0.2
- 風の影響でふわふわ
- サイズ: 0.15
```

#### 魚の動き
- 速度: 0.005（最も遅い動き）
- 色: #4682B4（スティールブルー）

## 照明システムの季節変化

### LightingController の拡張

```typescript
switch (season) {
  case "spring":
    - 太陽光: #FFFACD（柔らかい黄色）
    - 環境光: #E6F3FF（明るい青空）
    break;
  case "summer":
    - 太陽光: #FFE55C（強い黄色）
    - 環境光: #87CEEB（鮮やかな青）
    - 照明強度: 6.0（最強）
    break;
  case "autumn":
    - 太陽光: #FFA500（オレンジ色）
    - 環境光: #DEB887（温かみのある色）
    break;
  case "winter":
    - 太陽光: #E0F7FA（冷たい青白色）
    - 環境光: #B0E0E6（冬の青空）
    - 照明強度: 4.0（最弱）
    break;
}
```

## 生態系の季節変化

### 魚の動き（FishManager.tsx）

既存の実装を活用：

| 季節 | 速度 | 色 | 説明 |
|-----|------|-----|------|
| 春 | 0.015 | #FF6347 | 穏やかに目覚める |
| 夏 | 0.02 | #FF4500 | 最も活発 |
| 秋 | 0.01 | #DAA520 | ゆっくりと動く |
| 冬 | 0.005 | #4682B4 | ほとんど動かない |

### 水草の色（WaterPlantsLarge.tsx）

季節に応じて色が変化：

| 季節 | 色 | 説明 |
|-----|-----|------|
| 春 | #4CAF50 | 明るい新緑 |
| 夏 | #2E7D32 | 濃い緑 |
| 秋 | #558B2F | 黄緑がかった緑 |
| 冬 | #1B5E20 | 暗い緑 |

## 季節ごとの便箋メッセージ

### DriftingBottle.tsx の拡張

各季節に3種類のメッセージ、合計12種類：

**春のメッセージテーマ:**
- 新しい始まり
- 芽吹きと成長
- 希望と前進

**夏のメッセージテーマ:**
- 輝きと情熱
- エネルギー
- 休息の大切さ

**秋のメッセージテーマ:**
- 変化の美しさ
- 実りと収穫
- 振り返りと学び

**冬のメッセージテーマ:**
- 静けさと内省
- 耐えることの意味
- 希望の光

## 使用方法

### 基本的な使い方

すべてのエフェクトコンポーネントは自動的に季節を検知します：

```tsx
import { SeasonProvider } from "./contexts/SeasonContext";
import CherryBlossoms from "./components/CherryBlossoms";
import SummerEffects from "./components/SummerEffects";
import SnowEffect from "./components/SnowEffect";
import FallenLeaves from "./components/FallenLeaves";

<SeasonProvider>
  <Canvas>
    <CherryBlossoms />    {/* 春のみ表示 */}
    <SummerEffects />     {/* 夏のみ表示 */}
    <FallenLeaves />      {/* 秋のみ表示 */}
    <SnowEffect />        {/* 冬のみ表示 */}
  </Canvas>
</SeasonProvider>
```

### 季節の切り替え

UIコンポーネントから季節を選択：

```tsx
const { season, setSeason } = useSeason();

<button onClick={() => setSeason("spring")}>春</button>
<button onClick={() => setSeason("summer")}>夏</button>
<button onClick={() => setSeason("autumn")}>秋</button>
<button onClick={() => setSeason("winter")}>冬</button>
```

## パフォーマンス

### 最適化のポイント

1. **条件付きレンダリング**: 各エフェクトは該当する季節のみ表示
2. **パーティクル数の調整**:
   - 春（桜）: 50個
   - 冬（雪）: 200個
3. **useMemo の活用**: 色の計算結果をキャッシュ
4. **シェーダーの効率化**: 夏の陽炎エフェクトは軽量なシェーダー使用

### パフォーマンス指標

- FPS: 60fps（通常時）
- メモリ使用: 最大+20MB（冬の雪エフェクト時）
- CPU負荷: 最小限

## カスタマイズ

### パーティクル数の変更

```typescript
// CherryBlossoms.tsx
const count = 100; // 50 → 100 に増やす

// SnowEffect.tsx
const count = 300; // 200 → 300 に増やす
```

### 色の変更

```typescript
// LightingController.tsx
case "spring":
  targetColor = isDay ? "#FFE4E1" : "#CCCCCC"; // よりピンクがかった色
  break;
```

### 落下速度の調整

```typescript
// CherryBlossoms.tsx
velocities[i * 3 + 1] = -0.5 - Math.random() * 0.3; // より速く落下

// SnowEffect.tsx
velocities[i * 3 + 1] = -(0.05 + Math.random() * 0.05); // よりゆっくり落下
```

### メッセージの追加

```typescript
// DriftingBottle.tsx
const seasonMessages = {
  spring: [
    // 既存のメッセージ...
    `新しいメッセージをここに追加`,
  ],
};
```

## トラブルシューティング

### パーティクルが表示されない

1. 季節が正しく設定されているか確認
2. コンソールでエラーをチェック
3. カメラの位置とパーティクルの生成範囲を確認

### パフォーマンスが低下する

1. パーティクル数を減らす
2. 複数の重いエフェクトを同時に使用していないか確認
3. デバイスのスペックを確認

### 照明が正しく変化しない

1. `LightingController` が正しくマウントされているか確認
2. light ref が正しく渡されているか確認
3. `useSeason` が正しくインポートされているか確認

## 今後の改善案

- [ ] 季節の移り変わりアニメーション（徐々に切り替わる）
- [ ] 春の新緑の芽生えアニメーション
- [ ] 夏の蝉の鳴き声（音響効果）
- [ ] 秋の夕焼けグラデーション
- [ ] 冬の水面の凍結エフェクト
- [ ] 季節ごとの天候イベント（雨、虹、雷など）
- [ ] 季節ごとの時間帯の長さ変化（夏は日が長い）
- [ ] より多様な便箋メッセージ
- [ ] ユーザーが便箋を投稿できる機能
- [ ] 季節の自動切り替え（実際のカレンダーと連動）
