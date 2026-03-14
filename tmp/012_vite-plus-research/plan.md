# 実装計画: vite-plus-research-relocation

## 目的
- READMEのstart-impl要件に合わせて、Vite+調査タスクの作業記録を`tmp/`配下へ整理する
- `docs/`以下から調査ドキュメントを移動し、過去タスクとの整合性と更新履歴を明示する
- ユーザー指示に応じて調査ドキュメントを削除するなど、最新の管理方針に追随する
- 今後の追加調査やPoCへ繋げやすいよう、必要なドキュメント構造を README から把握できるようにする

## 実装スコープ
### 1. 作成・移動・削除するファイル
- `tmp/012_vite-plus-research/vite-plus.md`: 既存の調査レポートを`docs/`から移動（2025-03-14時点で削除指示あり）
- `tmp/012_vite-plus-research/plan.md`: 本ファイル
- `tmp/012_vite-plus-research/prompt.md`: セッションログ

### 2. 変更するファイル
- `README.md`: ドキュメント一覧のリンク先を`tmp`配下に差し替え

## 実装手順（ステップバイステップ）
1. `tmp/012_vite-plus-research/` ディレクトリを作成し、`plan.md`/`prompt.md` のテンプレートを初期化する
2. 既存の `docs/research/vite-plus.md` を新ディレクトリへ移動し、履歴を保持する
3. README のドキュメント一覧を更新して新しいパスへのリンクを掲載する（削除時はエントリを削除）
4. 不要になった `vite-plus.md` をユーザー要望に応じて削除し、README から該当リンクを除去する
5. `git status` で差分を確認し、必要に応じてコミットする

## 技術的詳細
- README のリンク表記は他ドキュメントと同じ Markdown 形式 (`[text](path)`) を踏襲する
- `tmp/`配下の命名規則は連番 + スネークケースとし、既存の `tmp/010_*` などに合わせる
- `plan.md`/`prompt.md` は過去タスクと同様、日本語テンプレートで記述して履歴を残す

## テスト計画
- [ ] `volta run npx tsc --noEmit`（リンク変更のみのため任意）
- [ ] `volta run npm run lint`（任意）
- 本タスクはドキュメント移動のみのため、自動テストは必須ではない

## 完了条件
- [ ] `tmp/012_vite-plus-research/` に `plan.md` と `prompt.md` が存在し、内容が更新されている
- [ ] Vite+ 調査ドキュメントについて、最新のユーザー指示（移動 or 削除）が反映された状態になっている
- [ ] README のリンクが実在するパスのみを指している
- [ ] `git status` で意図しない差分がない

## 実装時間見積もり
合計: 15分
