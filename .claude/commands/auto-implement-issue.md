---
description: Issue の完全自動実装フロー
argument-hint: [issue-number]
---

# auto-implement-issue ガイド

`auto-implement-issue $1` を実行する際の必須手順。start-impl が定義されているリポジトリ（`.claude/commands/start-impl.md` が存在する場合）では、**自動実行でも start-impl を行い、tmp/ 直下に plan/prompt を作成すること**。

## ステップ0: start-impl の実行
1. README の「開発プロセス（start-impl）」を確認し、最新の連番ディレクトリを `tmp/` に作成する。
2. `tmp/{連番}_<issue-summary>/plan.md` と `prompt.md` をテンプレートに従って初期化し、Issue 概要・開始日時・進捗を記録する。
3. 以降のステップでも進捗や指示を prompt.md に追記する。

> ⚠️ start-impl 用の tmp ディレクトリが存在しない状態で実装を開始しないこと。

## ステップ1: Issue 情報の取得
- `gh issue view $1` でタイトル/本文/ラベル/担当者を確認。
- `🔍 [1/9] Issue #$1 を読み取り中...` と進捗を出力。

## ステップ2: ブランチ自動作成
- `git branch --show-current` または `git rev-parse --abbrev-ref HEAD` で現在のブランチを確認。
- main/master 上で `git checkout -b <type>/<description>` 形式のブランチを切る。
- 例: `🌿 [2/9] ブランチ作成: feature/add-dark-mode`

## ステップ3: 実装
- Issue 内容をもとに必要ファイルを特定→実装。
- 進捗例: `⚙️ [3/9] 実装中... (3/5 ファイル完了)`

## ステップ4: テスト・ビルド
```bash
npx tsc --noEmit
npm run lint 2>/dev/null || echo "Lint skipped"
npm test 2>/dev/null || echo "Test skipped"
npm run build
```
- 進捗例: `🧪 [4/9] テスト・ビルド実行中...`

## ステップ5: 自動修正（最大3回）
- エラー発生時は原因を特定し修正→再テスト。
- 表示例: `🔧 [4/9] エラー修正中... (試行 1/3)`

## ステップ6: コミット
- `git log --oneline -n 10` で履歴スタイル確認。
- テンプレート:
  ```bash
  git add .
  git commit -m "$(cat <<'EOF'
  <type>: <タイトル>
  
  <詳細な説明>
  
  Closes #$1
  
  🤖 Generated with [Codex CLI](https://openai.com/codex)
  
  Co-Authored-By: OpenAI Codex <noreply@openai.com>
  EOF
  )"
  ```
- 進捗: `💾 [6/9] コミット完了`

## ステップ7: プッシュ
- `git push -u origin $(git branch --show-current)`
- 進捗: `📤 [7/9] プッシュ完了`

## ステップ8: PR 作成
- `gh pr create --title "<type>: <タイトル>" --body "..."`
- 進捗: `🔀 [8/9] PR作成完了: #<PR番号>`

## ステップ9: Issue コメント
- `gh issue comment $1 --body "✅ 実装完了しました。\n\nPR: #<PR_NUMBER>\n\nPRマージ時に自動的にクローズされます。\n\n🤖 Generated with [Codex CLI](https://openai.com/codex)"`
- 進捗: `✅ [9/9] 完了！Issue #$1 → PR #<PR番号>`

## 完了サマリー
```
🎉 全自動実装が完了しました！

Issue: #$1 - <タイトル>
ブランチ: <branch>
PR: #<PR番号>

次のステップ:
1. PR をレビュー: https://github.com/.../<PR番号>
2. 承認後、マージすると Issue が自動クローズされます
```

## 備考
- start-impl を実行した証跡として、全行程で prompt.md を更新すること。
- 重要な変更は `implement-issue` の利用を検討。
- GitHub CLI 認証は `gh auth status` で事前確認。
