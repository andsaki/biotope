# 実装計画: weather-location-source

## 背景
天気APIが東京駅固定になっていて、「水辺の四季」の体験に対して現実の東京が唐突に出ていた。

## 目的
東京固定をやめ、本番では Cloudflare のリクエスト位置情報を使い、位置情報が取れない環境では既存の「水辺の天気」フォールバックに任せる。
さらに、天気を単なる `晴/曇/雨` 表示ではなく、水辺の光・雨・波・魚・便りに影響する状態モデルとして扱う。

## 変更
- `functions/api/weather.ts`
  - 東京駅の固定座標を削除
  - `request.cf.latitude` / `request.cf.longitude` を使って Open-Meteo を呼び出す
  - 表示地点名は `city`、`region`、`country`、`現在地` の順で決定
  - 位置情報がない場合は `204 No Content` を返し、フロントの fallback に落とす
  - 東京前提の説明文を「近くの空/光/雨」に変更
- `src/utils/weather.ts`
  - current に加えて直近 hourly forecast を保持する。
  - 降水量、雲量、風速、風向き、水辺予報の summary を扱う。
  - 雨の強さ、雲量、水面反射、水面の荒れ方を導出する helper を追加する。
- `src/components/RainEffect.tsx`
  - 雨量に応じて雨粒数、速度、透明度を変える。
- `src/components/WaterSurface.tsx`
  - 雨量で自動波紋を発生させる。
  - 雲量/雨量で水面反射と波の荒れ方を変える。
- `src/components/FishManager.tsx`
  - 雨/曇りでは魚が少し深く、ゆっくり泳ぐ。
- `src/components/Clouds.tsx`
  - 雲量/雨量で雲の濃さを変える。
- `src/components/LightingController.tsx`
  - 雲量/雨量で光量を落とす。
- `src/components/WindDirectionDisplay.tsx`
  - 今の天気だけでなく、次の数時間の「水辺予報」と風速を表示する。
- `src/utils/bottleJournal.ts`
  - 便りの観察ログに今後の天気の気配を混ぜる。

## 検証
- [x] `npx tsc --noEmit`
- [x] `npm run lint`
- [x] `npm run build`
- [x] Playwright + Google Chrome で実画面確認
