# 実装計画: Issue #28 季節・時間帯別の環境音を追加

## ゴール
- 季節と時間帯に応じた環境音の再生を実現し、UIにミュートボタンを追加する
- 受け入れ基準を満たす

## メモ
- 季節: `SeasonContext`
- 時間帯: `TimeContext`
- UIベース: `src/components/UI.tsx`
- 新規フック: `src/hooks/useAmbientSound.ts`

## 実装ステップ
1. 季節/昼夜に応じた環境音フック `useAmbientSound` を作成（Web Audio APIベース）
2. UIにミュートボタンを追加してフックの制御を提供
3. ビルド/テストで回帰が無いことを確認し、PRを作成
