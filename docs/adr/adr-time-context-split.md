# ADR: 時間コンテキストを昼夜判定と時計に分割する

## 背景

- `TimeProvider` は `useRealTime` の結果（1秒ごとに更新される `realTime` と `isDay`）をそのまま1つの `TimeContext` に渡していた。
- 3D 系コンポーネント（`FishManager`, `LightingController`, `Stars`, `ReflectedStars` など）は昼夜情報だけを参照しており、時計の秒単位更新は不要。
- しかしコンテキスト値が `{ isDay, realTime }` のオブジェクトのため、RealTime の変更が入るたびにコンテキストの再生成が発生し、上記コンポーネントを含む大きなツリーが毎秒リレンダーしていた。
- R3F のアニメーションは `useFrame` 内で動き続けるため、React の再レンダリングはほぼ無駄な計算負荷になっていた。

## 決定

- `TimeContext` を「昼夜情報 (`DayPeriodContext`)」と「時計 (`RealTimeContext`)」の2レイヤーに分割。
- `useDayPeriod` と `useClockTime` を公開し、`useTime` は両者をそのまま合成するヘルパーに縮小。
- 昼夜だけを使うコンポーネントは `useDayPeriod` のみに依存させ、`SimulationClock` など実際に時刻が必要な箇所だけ `useClockTime` / `useTime` を使う。

## 影響

- 1秒ごとの時計更新で 3D サブツリー全体が再レンダリングされる問題を解消し、React レンダリング負荷を大幅に削減。
- `FishManager` のような重いコンポーネントは R3F の `useFrame` が担うアニメーションだけに集中でき、CPU が GPU フレーム処理に専念。
- コード上も「昼夜だけが欲しい」という意図が明確になり、今後 `realTime` を参照するコンポーネントをレビューしやすくなった。
