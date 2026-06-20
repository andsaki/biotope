# 実装計画: issue-70-bottle-letter-polish

## Issue
- #70: なんかつまんない
- URL: https://github.com/andsaki/biotope/issues/70
- 添付画像を確認済み

## 目的
漂流瓶を開いた時の便りカードが、説明文と履歴の羅列に見えて体験として単調になっている。
カード内に情報を詰めるのではなく、手紙は短く読ませ、閉じた後に水面へ小さな変化が残るようにして「読んだ意味」を画面側へ返す。

## 実装スコープ
### 1. 作成するファイル
- なし

### 2. 変更するファイル
- `src/components/DriftingBottle/MessageCard.tsx`
  - 便りカードを短い本文と今日のしるしだけに絞る。
  - 履歴・観察ログの表示はカードから外し、保存処理だけ維持する。
- `src/components/DriftingBottle/index.tsx`
  - API 失敗時のフォールバック文言を、空通知ではなく便りとして読める文面に変更する。
  - 便りを閉じた後、水面に光の輪と粒が数秒残る演出を追加する。
- `src/utils/bottleJournal.ts`
  - 今日のしるしを localStorage に保存し、次回以降も瓶の周辺に蓄積表示できるようにする。
- `tmp/027_issue-70-bottle-letter-polish/prompt.md`
  - 実装内容と検証結果を記録する。

## 実装手順（ステップバイステップ）
1. 既存の `MessageCard` と `bottleJournal` の責務を確認する。
2. カードは日付、今日のしるし、本文、送り主だけに絞る。
3. 履歴セクションと観察ログの表示をカードから外す。
4. 便りを閉じた時にだけ発火する読後演出を `DriftingBottle` に追加する。
5. 今日のしるしを保存し、過去分を瓶の周辺に小さな光として表示する。
6. モバイル幅でカードがはみ出さないよう、inline style の幅・余白・スケールを調整する。
7. `npm run build`、`npx tsc --noEmit`、`npm run lint` を実行する。
8. Playwright または Chrome で desktop/mobile 表示を確認する。

## 技術的詳細
- 新しい依存関係は追加しない。
- 既存の `Html` ベースの 3D 内 UI を維持する。
- `MessageCard` 内の inline style 方式を踏襲し、CSS ファイルへの大きな移動は行わない。
- 保存済み journal のスキーマは変更しない。既存 localStorage データと互換性を保つ。
- Gemini/API の取得ロジックは変更しない。
- 読後演出は `THREE.MeshBasicMaterial` と既存の `useFrame` だけで実装し、新しい依存関係は追加しない。
- 保存済みのしるしは日付ごとに1件にまとめ、最大10件まで保持する。

## テスト計画
- [x] `npx tsc --noEmit`
- [x] `npm run lint`
- [x] `npm run build`
- [x] desktop viewport で瓶の便りカードを確認
- [x] mobile viewport で瓶の便りカードを確認
- [x] 実アプリの初期描画が非blankであることを確認
- [x] localStorage に保存済みしるしを入れた状態で実アプリを確認

## 完了条件
- [x] 便りカードが添付画像より単調に見えない
- [x] カード内の情報量が小さい紙面に対して過剰ではない
- [x] 便りを閉じた後に水辺側へ変化が残る
- [x] 今日のしるしが次回以降も水辺に蓄積される
- [x] 既存 journal localStorage との互換性を壊していない
- [x] 型チェック、lint、build が通る

## 実装時間見積もり
合計: 45分
