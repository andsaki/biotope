# Vite+ 調査レポート (Issue #18)

最終更新: 2025-03-14

## 参考資料
- [新時代のフロントエンドツールチェイン Vite+ を試してみた](https://azukiazusa.dev/blog/try-vite-plus/)
- [Announcing Vite+ Alpha | VoidZero](https://voidzero.dev/posts/announcing-vite-plus-alpha)
- [Vite+ 公式サイト](https://viteplus.dev/)
- [voidzero-dev/vite-plus（GitHub）](https://github.com/voidzero-dev/vite-plus)

## Vite+ の概要
Vite+ は Vite / Vitest / Oxlint / Oxfmt / Rolldown / tsdown といった人気ツールを `vp` CLI 1つに統合し、開発〜テスト〜ビルド〜Lint/Format〜パッケージングまでの体験を統一する新しいツールチェイン。Node.js ランタイムやパッケージマネージャの切り替えも Vite+ が管理するため、プロジェクトごとに異なる環境を素早く再現できる。

### 統合コンポーネントの要点
- **Vite 8 + Rolldown**: `vp dev`/`vp build` で Rust 製バンドラ Rolldown を活用。ビルド時間の短縮と Vite 8 の API を前提とする。
- **Vitest 4.1+**: `vp test` で watch なしの単発実行、`vp test watch` で監視実行。設定は `vite.config.ts` の `test` フィールド。
- **Oxlint / tsgolint**: `vp check` で型チェック込みの lint を実行。`typeCheck: true` にすると TypeScript エラーも同時検出。
- **Oxfmt**: `vp check` に含まれるフォーマッタ。`fmt.printWidth` などを `vite.config.ts` で設定。
- **tsdown**: `vp pack` でライブラリ出力 (CJS/ESM, d.ts 生成など)。
- **Vite Task**: `vp run` でタスクを実行。依存 (`dependsOn`)、キャッシュ、環境変数を細かく定義可能。
- **Node ランタイム管理**: `vp env pin/install/current` で `.node-version` を起点に Node 22 系列を自動管理。Volta 等との併用は要調整。
- **vpx**: `npx` 相当のワンショット実行。

### 代表的なコマンド
| コマンド | 役割 | 備考 |
| --- | --- | --- |
| `vp dev` | Vite 8 開発サーバー | 現状の `npm run dev` に相当。 |
| `vp build` | Vite 8 + Rolldown ビルド | `tsc -b` 相当タスクは `vp run` で組み合わせる想定。 |
| `vp preview` | ビルド成果物のプレビュー | Cloudflare Pages との併用時は別途 Wrangler タスクが必要。 |
| `vp check` | Oxfmt + Oxlint + tsgolint | ESLint/Prettier/tsc を置き換える候補。 |
| `vp test` / `vp test watch` | Vitest 実行 | watch はサブコマンド指定。 |
| `vp run <task>` | Vite Task（タスクランナー） | `dependsOn` や `env` でキャッシュ条件を制御。 |
| `vp migrate` | 既存 Vite プロジェクトの移行 | Vite 8 / Vitest 4.1 以上が必須。 |
| `vp env pin 22` | `.node-version` を作成し Node 22.x を固定 | Volta との二重管理は要整理。 |

## Biotope プロジェクトとの適合性評価
| 観点 | 現状 | Vite+ 導入時の影響 |
| --- | --- | --- |
| Vite バージョン | 既に Vite 8 へアップグレード済み | `vp migrate` 実行前提を満たす。 |
| テスト環境 | Vitest 未導入 | `vp test` を使うには Vitest セットアップが必要。 |
| Lint/Format | ESLint + Oxfmt 無し | `vp check` で Oxlint/Oxfmt へ移行する場合、React Hooks ルール等を再定義する必要。 |
| Node 管理 | Volta で Node 20.19.0 を固定 | `.node-version` による Node 22 系列固定とぶつかるため運用ルール要検討。 |
| Cloudflare Dev サーバー | `npm run dev:wrangler` で Vite + Wrangler を並列 | `vp run` で `wrangler pages dev` をラップするタスクを定義する必要がある。 |
| CI | npm scripts 基準 | `vp` コマンドへ置き換えるにはワークフロー修正が必要。 |

### メリット
- `vp check` ひとつでフォーマット・Lint・型チェックを統合でき、CI が高速化する余地がある。
- Vite Task により `dependsOn` やキャッシュキーが明示できるため、複雑な dev スクリプトを整理できる。
- Node ランタイムの自動切り替えで開発者の環境差異を減らせる。

### 懸念点
1. **Alpha 版**: 2025-03 時点でまだ Alpha。重大なプロダクションには追加検証が不可欠。
2. **Volta との競合**: `.node-version` と `package.json#volta` を両立させる運用を決める必要。
3. **Wrangler 連携**: `vp dev` では Cloudflare Pages 側が起動しないため、`vp run` でラップするか従来タスクを残す必要。
4. **Lint ルール差分**: Oxlint は ESLint プラグインと互換でないため、ルール移行にコストがかかる。

## 導入ステップ案
1. **Vite 8 / Vitest 4.1 への完全移行**: 既に Vite 8 は導入済み。次は Vitest を追加し `vp test` 実行環境を整える。
2. **`vp` CLI のローカルセットアップ**:
   ```bash
   curl -fsSL https://vite.plus | bash
   source ~/.zshrc
   vp env pin 22
   ```
   `.node-version` が生成され Node 22.22.1 がデフォルトでインストールされる。
3. **`vp migrate` の実行**: 既存プロジェクトで `vp migrate` を試し、`vite.config.ts` に `lint` / `fmt` / `run.tasks` が追加される内容を確認。
4. **タスク移行**: `package.json` の `scripts` を最小限にし、`vp run` タスクに依存関係やキャッシュ条件を記述。Cloudflare 開発サーバー用のタスクも `dependsOn` 付きで管理。
5. **チェック/CI 更新**: ESLint/tsc の代わりに `vp check` を採用し、CI ワークフローを新コマンドに差し替える。
6. **Volta vs Vite+ 管理の整理**: `.node-version` と Volta の併用方針を決定。場合によっては Volta 設定を削除し、Vite+ 管理に一本化する。

## 推奨アクション
- **短期**: Vitest を導入し CI で使える形にしてから、専用の PoC ブランチで `vp migrate` を試す。
- **中期**: `vp check` と Vite Task を段階的に導入して、Lint/Format/ビルドの統合とキャッシュ戦略を検証する。
- **長期**: Node バージョン管理を Vite+ に統一するか、Volta を継続するかの方針を確定させる。

本レポートは Issue #18 の回答として、Vite+ の導入可能性を評価する材料を提供する。追加で得た知見があれば本ドキュメントを随時更新する。
