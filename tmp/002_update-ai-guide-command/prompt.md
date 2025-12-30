# 実装セッション: /update-ai-guide コマンド

## セッション情報

- **開始日時**: 2025-12-29
- **タスク**: セッション内容から ai-guide.md を自動更新するコマンド実装
- **参照**: plan.md

## 進捗状況

### ✅ 完了

- [x] tmp/002_update-ai-guide-command/ の作成
- [x] plan.md の作成
- [x] カスタムスラッシュコマンドの実装方法を調査
  - WebFetch で Claude Code ドキュメントを確認
  - `.claude/commands/` にマークダウンファイルを配置する方式
  - frontmatter で設定可能
  - `$ARGUMENTS` や `$1, $2` で引数を受け取れる
  - `!` で bash コマンド、`@` でファイル参照
- [x] `.claude/commands/` ディレクトリの作成
- [x] `/update-ai-guide` コマンドの実装 (.claude/commands/update-ai-guide.md)
- [x] prompt.md の作成

### 🔄 進行中

なし

### ⏳ 未着手

- [ ] テストと動作確認

## ユーザーからの指示

### 初回指示 (2025-12-29)

> 画像（JSConf JP 2025）の内容を実装して

**画像の内容**:
- `/update-ai-guide` コマンド
- セッションの内容とコミット履歴などから ai-guide を最新化
- 1. セッションコンテキストから変更内容を把握
- 2. 更新が必要な箇所の特定
- 3. ai-guideの更新

**実装方針**:
- カスタムスラッシュコマンドとして実装
- `.claude/commands/update-ai-guide.md` に配置
- セッション分析とコミット履歴からai-guide.mdを自動更新

## 実装の詳細

### 作成ファイル

1. **`.claude/commands/update-ai-guide.md`** - カスタムスラッシュコマンド

**コマンドの機能**:

1. **セッション分析**
   - `tmp/` 配下の最新セッションを自動検出
   - `plan.md` から実装内容を抽出
   - `prompt.md` から課題・解決策を抽出

2. **コミット履歴分析**
   - `git log` で最近のコミットを確認
   - `git diff` で変更ファイルを分析

3. **ai-guide.md更新**
   - 新しいパターン → 「プロジェクト固有の開発Tips」
   - 効果的なプロンプト → 「効果的なプロンプト例」
   - 問題と解決策 → 「トラブルシューティング」
   - 既存の構造を維持、重複を避ける

### 技術的な工夫

- **frontmatter**: `allowed-tools` で必要なツールを限定
- **ファイル参照**: `@` でplan.md、prompt.md、ai-guide.mdを読み込み
- **bashコマンド**: `!` でls、git logなどを実行
- **セクション特定**: ai-guide.mdの各セクションに適切に追加

## 次のアクション

1. コマンドのテスト実行
2. 動作確認と改善

## 課題・メモ

### 調査結果

**カスタムスラッシュコマンドの実装方法**:
- ドキュメント: https://code.claude.com/docs/en/slash-commands.md
- プロジェクト固有: `.claude/commands/` にマークダウンファイルを配置
- Frontmatter で詳細設定可能（allowed-tools、description、model など）
- 引数: `$ARGUMENTS`（全引数）、`$1, $2`（位置引数）
- 特殊記号: `!`（bash）、`@`（ファイル参照）

### 実装のポイント

- セッションディレクトリは `ls -t tmp/ | head -1` で最新を取得
- ai-guide.md の更新時は既存構造を維持
- 重複チェックを行う
- 具体的なコード例を含める

---

最終更新: 2025-12-29 - コマンド実装完了、テスト待ち
