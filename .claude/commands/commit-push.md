---
description: コミット＋プッシュを一括実行
allowed-tools: Bash(git:*)
---

# /commit-push

変更をレビューし、AIが生成したコミットメッセージでコミット後、リモートにプッシュします。

## 実行手順

### 1. 変更の確認

現在の変更を確認：

```bash
!git status
!git diff --cached
!git diff
```

### 2. コミット履歴の確認

最近のコミットメッセージを確認し、スタイルを把握：

```bash
!git log --oneline -n 10
```

### 3. コミットメッセージの生成

既存のスタイルに従って、変更内容から適切なコミットメッセージを生成。

**生成ルール**:
- 既存のコミットメッセージのスタイルを踏襲
- 変更の本質を簡潔に表現
- 絵文字の使用は既存スタイルに合わせる

### 4. ステージングとコミット

**重要**: 必ずユーザーに生成したメッセージを確認してからコミット実行

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

### 5. プッシュ実行

コミットが成功したら、プッシュ：

```bash
!git push
```

初めてプッシュする場合：

```bash
!git push -u origin [ブランチ名]
```

### 6. 完了確認

```bash
!git log -1 --stat
!git status
```

---

## 使用例

```
/commit-push
```

引数なしで実行すると、AIが自動的に変更を分析してコミット→プッシュを実行します。

---

## 注意事項

- コミット・プッシュ前に必ずユーザーに確認する
- 秘密情報は絶対にコミットしない
- main/masterブランチへのforce pushは避ける
- コミットに失敗した場合はプッシュしない
