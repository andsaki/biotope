# 実装計画: vite-plus-research

## 目的
- Issue #18 の要件に沿って Vite+ の機能・導入手順・Biotope プロジェクトへの影響を整理したレポートを再整備する
- start-impl のルールに従って `tmp/012_vite-plus-research/` に作業記録 (plan/prompt) を残し、後追いできるようにする
- README から調査レポートへ辿れる導線を復活させ、チームが Vite+ の検討状況を把握できるようにする

## 実装スコープ
### 1. 作成するファイル
- `tmp/012_vite-plus-research/vite-plus.md`: Vite+ の概要、代表的なコマンド、Biotope への適用評価、導入ステップ、推奨アクションをまとめたレポート
- `tmp/012_vite-plus-research/plan.md`: 本ファイル
- `tmp/012_vite-plus-research/prompt.md`: セッションログ

### 2. 変更するファイル
- `README.md`: ドキュメント一覧に Vite+ 調査レポートへのリンクを再追加

## 実装手順（ステップバイステップ）
1. `tmp/012_vite-plus-research/` に plan/prompt テンプレートを用意し、Issue 情報と実装計画を記録する
2. 以前の調査内容と最新の Vite+ 情報を元に `vite-plus.md` を作成し、概要・コマンド・適用評価・導入手順・推奨アクションを記述する
3. README のドキュメント一覧から新しいレポートを参照できるようにリンクを追加する
4. `git status` で差分を確認し、必要なファイルのみをコミット対象に含める
5. TypeScript/Lint/Build までは行わず（ドキュメントのみのため）、内容確認後に PR を作成する

## 技術的詳細
- レポートは Markdown で構成し、各セクションに短い説明と表/箇条書きを使って読みやすくする
- Vite+ の必要 Node バージョン、`vp` コマンド群、`vp migrate` の前提 (Vite 8 / Vitest 4.1+) など、導入判断に必要な情報を明示する
- README のリンクは `tmp/012_vite-plus-research/vite-plus.md` を直接指すようにし、不要なリンクは追加しない

## テスト計画
- [ ] ドキュメント更新のみのため自動テストは実行しない（必要なら `volta run npx tsc --noEmit` を任意で実行）

## 完了条件
- [ ] `tmp/012_vite-plus-research/plan.md` と `prompt.md` が存在し、最新内容を記録している
- [ ] `tmp/012_vite-plus-research/vite-plus.md` に Issue #18 を満たす調査レポートが含まれている
- [ ] README から該当レポートへアクセスできる
- [ ] 必要ファイルのみコミットされている

## 実装時間見積もり
合計: 30分
