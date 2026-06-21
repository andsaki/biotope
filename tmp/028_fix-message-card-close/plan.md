# 実装計画: fix-message-card-close

## Issue
- メッセージカード右上の閉じるボタンが押せない。

## 目的
`Html` で表示している便りカード内のクリックが 3D Canvas 側へ伝播したり、テキスト選択に吸われたりして閉じられない状態を解消する。

## 変更するファイル
- `src/components/DriftingBottle/MessageCard.tsx`
  - 閉じるボタンの pointer/click イベントで DOM 伝播を停止する。
  - 閉じるボタンを最前面かつ操作可能にする。
- `src/components/DriftingBottle/index.tsx`
  - close handler をイベント非依存にする。

## テスト計画
- [x] `npx tsc --noEmit`
- [x] `npm run lint`
- [x] `npm run build`
- [x] Playwright + Google Chrome で閉じるボタンの動作確認
