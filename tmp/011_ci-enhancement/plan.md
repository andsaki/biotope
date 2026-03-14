# 実装計画: ci-enhancement

## 目的
- Pull Request / main への push 時に型チェック・Lint・ビルドを自動で実行し、基本的な品質検証を CI で担保するため。

## 実装スコープ
### 1. 作成するファイル
- `.github/workflows/ci.yml`: push/pr トリガーで Node をセットアップし、npm ci → tsc → lint → build を実行する新規ワークフロー。

### 2. 変更するファイル
- 既存ファイルの変更は行わない予定。必要に応じて README 等に追記が必要になれば範囲拡張を相談する。

## 実装手順（ステップバイステップ）
1. `.github/workflows/ci.yml` を作成し、push(main) / pull_request(main) トリガーを定義する。
2. `quality-checks` ジョブで `actions/checkout@v4`、`actions/setup-node@v4` (package.json からバージョン取得, npm キャッシュ有効化) を設定する。
3. `npm ci` → `npx tsc --noEmit` → `npm run lint` → `npm run build` の手順を steps に記述し、環境変数や permissions を最小限に設定する。
4. 変更内容を確認し、必要なら dry-run 的に `act` 等で検証（今回はスキップ予定）。
5. 動作確認計画に沿って npm scripts / build 状態を確認し、PR 用情報をまとめる。

## 技術的詳細
- GitHub Actions v4 の公式 actions (`checkout`, `setup-node`) を使用。
- Node バージョンは `actions/setup-node` の `node-version-file` を `package.json` に向けることで Volta の設定と同期。
- npm キャッシュは `cache: 'npm'` オプションでランナー依存の自動キャッシュを利用。
- TypeScript チェックは `npx tsc --noEmit` を直接実行し、Lint/Build は既存 npm scripts を利用。

## テスト計画
- [ ] npm run build
- [ ] 動作確認
- [ ] パフォーマンステスト

## 完了条件
- [ ] `.github/workflows/ci.yml` が追加され、Lint/型チェック/ビルドを行う CI が構成されている。
- [ ] main/pull_request トリガー条件と手順がレビュー可能な形で説明されている。

## 実装時間見積もり
合計: 30分
