# 実装セッション: Issue #59 雪の速度が違和感

Issue: https://github.com/andsaki/biotope/issues/59

## 初期確認
- タイトル: 雪の速度が違和感
- 本文なし
- 対象候補: `src/components/SnowEffect.tsx`, `src/constants/snowEffect.ts`

## 実装メモ
- 雪の `SNOW_ANIMATION_SPEED` を 60 から 1 に変更し、落下速度を実時間ベースに調整
- 横揺れを毎フレームの位置加算から `delta` 付きの風速として扱うよう変更
- 30fps throttle を外し、雪だけ `useFrame` で毎フレーム更新して滑らかさを優先
- ユーザー指摘により、loading fallback の青フラッシュとタイトル未表示/切り替わりのガタつきを修正
- Loader の終了時に 450ms の fade-out を追加し、3D 画面への遷移を滑らかにした

## 確認
- `npm run build` 成功
- `npm run lint` 成功
- Chrome MCP で画面表示とコンソールを確認
- 冬切り替え時にエラーが出ないことを確認
- loading の簡易 fallback を本 Loader と近い構図に揃えた
