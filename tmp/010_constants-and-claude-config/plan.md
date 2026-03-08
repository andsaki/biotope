# 実装計画: constants-and-claude-config

## 目的
- シミュレーションで共通利用する時間・カラー関連の定数を一元管理して保守性を高める
- Claude/Codex作業用の許可リストをリポジトリで共有し、開発作業の手続きや制約を明示する

## 実装スコープ
### 1. 作成するファイル
- src/constants.ts: 時間進行とカラーパレット関連の定数をまとめるモジュール
- .claude/settings.local.json: ローカルCLI自動化に必要な許可コマンドを列挙した設定

### 2. 変更するファイル
- なし（新規追加のみ）

## 実装手順（ステップバイステップ）
1. TypeScriptで `SIMULATED_SECONDS_PER_REAL_SECOND` などの日照・時間定数と `COLORS` オブジェクトを定義した `src/constants.ts` を作成する
2. Claude/Codexで必要な `Bash(...)` や `mcp__...` 権限を列挙した `.claude/settings.local.json` を作成する
3. `npx tsc --noEmit` と `npm run lint` を実行し、コンパイルとLintが通ることを確認する

## 技術的詳細
- `COLORS` オブジェクトには `as const` を付与してリテラル型を維持し、利用側での型安全性を確保する
- `settings.local.json` は既存の `.claude/` ドキュメントに倣い、JSON形式で許可／拒否セクションを明示する
- 時間関連の定数は今後のカスタムフックやアニメーション計算で流用できるよう、単独ファイルに切り出す

## テスト計画
- [x] npx tsc --noEmit
- [x] npm run lint
- [ ] npm run build（必要に応じて）
- [ ] 動作確認（UIでの挙動確認は別タスク）

## 完了条件
- [x] `src/constants.ts` が追加され、シミュレーションで必要な定数群を提供している
- [x] `.claude/settings.local.json` に作業許可リストが定義されている
- [x] TypeScriptとESLintチェックが成功している
- [ ] settingsファイルの共有方針についてチーム承認済み

## 実装時間見積もり
合計: 30分
