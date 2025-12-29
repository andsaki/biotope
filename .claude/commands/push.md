---
description: 現在のブランチをリモートにプッシュ
allowed-tools: Bash(git push:*), Bash(git status:*), Bash(git log:*)
---

# /push

現在のブランチをリモートリポジトリにプッシュします。

## 実行手順

### 1. 現在のブランチと状態を確認

```bash
!git status
```

### 2. プッシュ対象のコミットを確認

```bash
!git log --oneline -n 5
```

### 3. プッシュ実行

```bash
!git push
```

初めてプッシュする場合や上流ブランチが設定されていない場合：

```bash
!git push -u origin [ブランチ名]
```

---

## 使用例

```
/push
```

引数なしで実行すると、現在のブランチをプッシュします。

---

## 注意事項

- コミットされていない変更がある場合は警告
- main/masterブランチへのforce pushは絶対に避ける
- プッシュ前に必ずユーザーに確認する
