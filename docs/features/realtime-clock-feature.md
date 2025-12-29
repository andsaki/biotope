# リアルタイム時計機能

## 概要

日本時間（UTC+9）と連動した時計を表示し、実時間に応じて昼夜の切り替えと太陽の位置を制御する機能です。

## 主な機能

### 1. 日本時間の取得

`useRealTime` フックを使用して、ブラウザの現在時刻を日本時間に変換します。

```typescript
const now = new Date();
const japanTime = new Date(
  now.toLocaleString("en-US", { timeZone: "Asia/Tokyo" })
);
```

- **更新間隔**: 1秒ごと
- **取得情報**: 時、分、秒

### 2. 昼夜判定

時刻に基づいて昼と夜を自動的に切り替えます。

- **昼間**: 6:00 〜 18:00 (360分 〜 1080分)
- **夜間**: 18:00 〜 6:00

```typescript
const totalMinutes = hours * 60 + minutes;
setIsDay(
  totalMinutes >= DAY_START_MINUTES && totalMinutes < DAY_END_MINUTES
);
```

定数は `src/constants.ts` で定義：
```typescript
export const DAY_START_MINUTES = 6 * 60;  // 6:00 = 360分
export const DAY_END_MINUTES = 18 * 60;   // 18:00 = 1080分
```

### 3. 時計の表示

#### デザイン要素：
- **アナログ時計**: `react-clock` ライブラリを使用
- **昼/夜インジケーター**: 時計の上部に表示
- **デジタル時刻表示**: 「日本時間: HH:MM:SS」形式

#### レスポンシブデザイン：

**PC版 (769px以上):**
- 時計サイズ: 200px
- 外枠: 220px × 220px、6px白枠
- 背景: 半透明黒 (rgba(0, 0, 0, 0.75))
- 時刻表示: 16px、薄い水色

**モバイル版 (768px以下):**
- 時計サイズ: 100px
- 外枠: 120px × 120px、3px白枠
- 時刻表示: 12px、薄い水色

### 4. 太陽の位置制御

実時間に応じて太陽（directionalLight）の位置を計算します。

```typescript
position={[
  15 * Math.cos(
    ((realTime.hours + realTime.minutes / 60) % 12) * (Math.PI / 6)
  ),
  15,
  15 * Math.sin(
    ((realTime.hours + realTime.minutes / 60) % 12) * (Math.PI / 6)
  ),
]}
```

- **軌道**: 円形のパス（半径15）
- **周期**: 12時間（午前/午後で同じ位置）
- **高度**: Y=15 で固定

### 5. 照明の動的制御

`LightingController` コンポーネントが昼夜に応じて照明を調整します：

**昼間:**
- 環境光: 明るめ
- 太陽光: 強め（黄色）
- 背景色: #4A90E2（青空）

**夜間:**
- 環境光: 暗め
- 月光: 弱め（白色）
- 背景色: #2A2A4E（夜空）

## 使用方法

### 基本的な使い方

```tsx
import { useRealTime } from "./hooks/useRealTime";

function App() {
  const { isDay, realTime } = useRealTime();

  return (
    <div style={{
      backgroundColor: isDay ? "#4A90E2" : "#2A2A4E"
    }}>
      <SimulationClock realTime={realTime} isDay={isDay} />
    </div>
  );
}
```

### Props

#### `useRealTime` の戻り値：

| プロパティ | 型 | 説明 |
|----------|-----|------|
| `isDay` | `boolean` | 昼間かどうか |
| `realTime.hours` | `number` | 時（0-23） |
| `realTime.minutes` | `number` | 分（0-59） |
| `realTime.seconds` | `number` | 秒（0-59） |

#### `SimulationClock` のProps：

| プロパティ | 型 | 説明 |
|----------|-----|------|
| `realTime` | `{ hours, minutes, seconds }` | 日本時間（オプション） |
| `simulatedTime` | `{ minutes, seconds }` | シミュレーション時間（オプション） |
| `isDay` | `boolean` | 昼夜の状態 |

## 技術的な詳細

### タイムゾーン変換

JavaScriptの `toLocaleString` を使用して、ブラウザのタイムゾーンに関係なく日本時間を取得します。

```typescript
const japanTime = new Date(
  now.toLocaleString("en-US", { timeZone: "Asia/Tokyo" })
);
```

このアプローチにより：
- ユーザーの位置に関係なく日本時間を表示
- サーバーとの時刻同期が不要
- ブラウザのタイムゾーン設定に依存しない

### パフォーマンス

- **更新頻度**: 1秒ごと（`setInterval(updateTime, 1000)`）
- **再レンダリング**: 秒が変わるたびに発生
- **CPU負荷**: 最小限（単純な数値計算のみ）

### 太陽の軌道計算

12時間周期で太陽が円を描くように計算：

```typescript
const hourAngle = ((hours + minutes / 60) % 12) * (Math.PI / 6);
// 12時間を2πに変換: 12時間 → 360度 → 2π
// 1時間 = 30度 = π/6

const x = radius * Math.cos(hourAngle);
const z = radius * Math.sin(hourAngle);
```

- 0時/12時: 太陽は東（X軸正方向）
- 6時/18時: 太陽は南（Z軸正方向）

## カスタマイズ

### 昼夜の時間帯を変更

`src/constants.ts` を編集：

```typescript
export const DAY_START_MINUTES = 5 * 60;  // 5:00から昼間
export const DAY_END_MINUTES = 19 * 60;   // 19:00まで昼間
```

### 時計のサイズを変更

`src/components/SimulationClock.tsx`:

```typescript
size={window.innerWidth > 768 ? 250 : 120} // PC: 250px, モバイル: 120px
```

### 太陽の軌道半径を変更

`src/App.tsx`:

```typescript
const radius = 20; // 15 → 20 に変更
position={[
  radius * Math.cos(...),
  15,
  radius * Math.sin(...)
]}
```

### タイムゾーンを変更

他の地域の時刻に変更する場合は `src/hooks/useRealTime.ts` を編集：

```typescript
now.toLocaleString("en-US", { timeZone: "America/New_York" }) // ニューヨーク時間
now.toLocaleString("en-US", { timeZone: "Europe/London" })    // ロンドン時間
```

## シミュレーション時間からの移行

以前は `useSimulatedTime` を使用していましたが、リアルタイム時計に移行しました。

### 主な変更点：

| 項目 | シミュレーション時間 | リアルタイム時計 |
|-----|-----------------|---------------|
| 時間の進み方 | 実時間の144倍速 | 実時間と同期 |
| 1日の長さ | 実時間の10分 | 24時間 |
| 太陽の位置 | 分単位で計算 | 時間単位で計算 |
| 用途 | デモ・テスト | 実運用 |

### 後方互換性

`SimulationClock` コンポーネントは両方のモードをサポート：

```tsx
// リアルタイムモード
<SimulationClock realTime={realTime} isDay={isDay} />

// シミュレーションモード（旧版）
<SimulationClock simulatedTime={simulatedTime} isDay={isDay} />
```

## トラブルシューティング

### 時刻がずれている

ブラウザのシステム時刻を確認してください。`Date` オブジェクトはシステム時刻に依存します。

### 時計が更新されない

1. コンソールでエラーを確認
2. `useEffect` のクリーンアップが正しく動作しているか確認
3. `setInterval` が正しく設定されているか確認

### 昼夜が切り替わらない

`src/constants.ts` の `DAY_START_MINUTES` と `DAY_END_MINUTES` が正しく設定されているか確認してください。

## 今後の改善案

- [ ] タイムゾーン選択機能の追加
- [ ] 日の出・日の入り時刻の計算（緯度経度ベース）
- [ ] 太陽の高度も時間に応じて変化させる
- [ ] 月の満ち欠けの表示
- [ ] アラーム・タイマー機能
- [ ] 時刻表示のフォーマット選択（12時間/24時間）
