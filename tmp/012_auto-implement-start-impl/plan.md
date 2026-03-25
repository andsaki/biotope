# 実装計画: auto-implement-start-impl

## 目的
- Issue #20 で求められているように、`auto-implement-issue` コマンド実行時でも start-impl フロー（tmp/連番ディレクトリ + plan/prompt 作成）を必須ステップとして明文化する
- start-impl を実行する条件と手順を一元化し、自動実行タスクでもテンプレート遵守が保証されるようにする

## 実装スコープ
### 1. 作成するファイル
- `.claude/commands/auto-implement-issue.md`: コマンド手順書。start-impl を行う前提条件・手順・既存 9 ステップとの統合版を記述
- `tmp/013_auto-implement-start-impl/plan.md`: 本ファイル
- `tmp/013_auto-implement-start-impl/prompt.md`: セッションログ

### 2. 変更するファイル
- `README.md`: auto-implement-issue 概要に「start-impl を必ず実行」する旨の注意書きを追記

## 実装手順（ステップバイステップ）
1. tmp/013 ディレクトリ、plan/prompt テンプレートを作成（本ファイル）
2. `.claude/commands/auto-implement-issue.md` を新規追加し、既存のコマンド説明を整理しつつ start-impl の実行手順をステップ0として明記する
3. README の start-impl 節または auto-implement-issue 説明付近に、「自動実行でも start-impl を行う」旨を追加
4. git status で差分を確認し、必要ファイルのみをコミット

## 技術的詳細
- start-impl の実行条件: プロジェクトに `.claude/commands/start-impl.md` が存在する場合、auto-implement-issue でも開始時に tmp ディレクトリ/plan/prompt を作成してログを残す
- `.claude/commands/auto-implement-issue.md` の構成: 既存ユーザー指示の 9 ステップをベースに、ステップ0として start-impl 実行を追加し、進捗表示用のメッセージ例も追記
- README の変更箇所: 開発プロセスや auto-implement-issue の注意事項付近

## テスト計画
- ドキュメントのみのため、ビルド/テストは任意

## 完了条件
- [ ] `.claude/commands/auto-implement-issue.md` に start-impl 実行手順が含まれている
- [ ] README に「auto-implement-issue でも start-impl を行う」旨の注意書きを追加
- [ ] tmp/013 ディレクトリに plan/prompt が存在し進捗が記録されている

## 実装時間見積もり
合計: 25分
