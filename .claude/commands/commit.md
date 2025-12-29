---
description: 変更をコミット（AIがメッセージ生成）
allowed-tools: Bash(git status:*), Bash(git diff:*), Bash(git log:*), Bash(git add:*), Bash(git commit:*), Bash(git rm:*)
---

# /commit

変更をレビューし、AIが適切なコミットメッセージを生成してコミットします。

## 実行手順

### 1. 変更の確認

現在の変更を確認：

```bash
!git status
```

ステージングされた変更を確認：

```bash
!git diff --cached
```

ステージングされていない変更がある場合は確認：

```bash
!git diff
```

### 2. コミット履歴の確認

最近のコミットメッセージを確認し、スタイルを把握：

```bash
!git log --oneline -n 10
```

### 3. コミットメッセージの生成

以下の方針でコミットメッセージを生成：

- **既存のスタイルに従う**: `git log`で確認したスタイルを踏襲
- **変更の本質を捉える**: 何を変更したかではなく、なぜ変更したか
- **簡潔に**: 1行目は50文字以内、詳細は本文に
- **絵文字の使用**: 既存のコミットで絵文字が使われていれば使用

**生成ルール**:
- feat: 新機能追加
- fix: バグ修正
- docs: ドキュメント変更
- refactor: リファクタリング
- style: コードスタイル変更
- test: テスト追加・修正
- chore: その他の変更

### 4. ステージングとコミット

**重要**: 必ずユーザーに確認してからコミット実行

変更をステージング（必要な場合）：

```bash
!git add [ファイルパス]
```

コミット実行：

```bash
!git commit -m "$(cat <<'EOF'
コミットメッセージをここに記載

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"
```

### 5. コミット後の確認

```bash
!git log -1 --stat
```

---

## 使用例

```
/commit
```

引数なしで実行すると、AIが自動的に変更を分析してコミットメッセージを生成します。

---

## 注意事項

- コミット前に必ずユーザーに生成したメッセージを確認してもらう
- 秘密情報（.env、credentials.jsonなど）は絶対にコミットしない
- ステージングされていない変更がある場合は、ユーザーに確認する
