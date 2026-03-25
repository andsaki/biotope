# 実装計画: ローディング進捗が9/15で止まる問題の修正

## 問題の概要
ローディング画面の進捗表示が「9/15」で止まってしまい、最後まで進まない問題が発生していました。

## 原因分析
`src/App.tsx`で3Dモデル（normalFish, flatfish, leaf）をCanvas外でpreloadしていたため、`LoadingTracker`の`useProgress()`がこれらのアセットを追跡できず、進捗カウントに含まれていませんでした。

## 解決策
Canvas外でのpreload呼び出しを削除し、すべてのモデルをCanvas内のSuspenseで読み込むように統一しました。

## 変更内容
### src/App.tsx
```diff
- // 3Dモデルのpreload
- import { preloadModel } from "./hooks/useModelScene";
-
- preloadModel("normalFish");
- preloadModel("flatfish");
- preloadModel("leaf");
```

この変更により、すべてのアセットが`useProgress()`で正しく追跡され、進捗が100%まで表示されるようになります。

## テスト結果
- ✅ 型チェック通過（`npx tsc --noEmit`）
- ✅ ビルド成功（`npm run build`）

## 成果物
- PR: #25
- コミット: 8ebf9c9, 5999936
- Issue: #24（PRマージ時に自動クローズ）

## 追加作業
`.claude/settings.local.json`を`.gitignore`に追加し、ローカル設定ファイルが誤ってコミットされないようにしました。
