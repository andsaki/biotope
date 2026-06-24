# 実装セッション: weather-location-source

## セッション情報
- 開始日時: 2026-06-25
- タスク: 天気APIの東京固定をやめる

## 完了
- [x] 東京駅固定の座標を削除
- [x] Cloudflare request.cf の緯度経度を Open-Meteo に渡す
- [x] 位置情報がない時は 204 を返して fallback に任せる
- [x] 東京前提の天気説明文を削除
- [x] Open-Meteo の hourly forecast を API レスポンスに追加
- [x] フロントの `WeatherSnapshot` を current + forecast + 水辺状態 helper に拡張
- [x] 雨量で `RainEffect` の密度/速度/透明度を変更
- [x] 雨量/雲量で水面の波、反射、自動波紋を変更
- [x] 雨/曇りで魚の泳ぐ深さと速度を変更
- [x] 雲量/雨量で雲と光量を変更
- [x] 実風向きが取れる場合は風向き表示に反映
- [x] 水辺予報と風速を UI に追加
- [x] 便りの観察ログに今後の天気の気配を追加

## 検証
- [x] `npx tsc --noEmit`
- [x] `npm run lint`
- [x] `npm run build`
- [x] Playwright + Google Chrome で実画面確認
