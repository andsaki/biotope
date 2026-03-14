# Vite+ 調査レポート (Issue #18)

最終更新: 2025-03-14

## 参考資料
- [新時代のフロントエンドツールチェイン Vite+ を試してみた](https://azukiazusa.dev/blog/try-vite-plus/)
- [VoidZero: Announcing Vite+ Alpha](https://voidzero.dev/posts/announcing-vite-plus-alpha)
- [Vite+ 公式ドキュメント](https://viteplus.dev/)
- [voidzero-dev/vite-plus リポジトリ](https://github.com/voidzero-dev/vite-plus)

## Vite+ の概要
Vite+ は Vite, Vitest, Oxlint, Oxfmt, Rolldown, tsdown など既存のフロントエンドツールを 1 つの CLI (`vp`) に統合した新しい開発体験を提供するツールチェイン。Node.js ランタイムやパッケージマネージャーの切り替えも Vite+ が管理し、タスク定義、キャッシュ、依存解決まで一貫して扱える点が特徴。

### 統合される主要コンポーネント
- **Vite 8**: 開発サーバー (`vp dev`), ビルド (`vp build`). Rolldown を同梱し Rust 製バンドラを同一 CLI で扱える。
- **Vitest 4.1+**: `vp test` でテスト実行。デフォルトでは watch 無効、`vp test watch` で監視実行。
- **Oxlint / tsgolint**: `vp check` でリンティングと型チェックをまとめて実行。`vite.config.ts` の `lint.options` で型チェックをオンにできる。
- **Oxfmt**: `vp check` 内でフォーマット検証。`vite.config.ts` の `fmt` セクションで `printWidth` などを設定。
- **tsdown**: `vp pack` でライブラリビルド (d.ts 生成、CJS/ESM 両対応)。
- **Vite Task**: `vp run` によるタスクランナー。キャッシュ、依存関係 (`dependsOn`)、環境変数キーにより実行結果を制御。`package.json` の `scripts` よりも柔軟。
- **Node ランタイム管理**: `vp env on/off/pin/install/current` コマンドで `.node-version` を起点にプロジェクトごとの Node バージョンを切替。
- **vpx**: `npx` 相当のワンショット実行。

### 代表的なコマンド
| コマンド | 概要 | 備考 |
| --- | --- | --- |
| `vp dev` | Vite 開発サーバー起動 | 現在の `npm run dev` 相当。 | 
| `vp build` | Vite 8 + Rolldown でビルド | `tsc -b` を事前に別タスク化する想定。 |
| `vp preview` | ビルド済みファイルのローカルサーバー | 現行の `vite preview` に対応。 |
| `vp check` | Oxfmt + Oxlint + tsgolint をまとめて実行 | ESLint・tsc の複合置き換え候補。 |
| `vp test` | Vitest 実行 | `vp test watch` で watch モード。 |
| `vp run <task>` | `vite.config.ts` の `run.tasks` に定義したタスク実行 | 例: `build` 実行前に `lint` を依存として指定。 |
| `vp migrate` | 既存 Vite プロジェクトを Vite+ に移行 | Vite 8 / Vitest 4.1 以上が必須。 |
| `vp env pin 22` | `.node-version` を生成し Node 22 系列を固定 | Volta の `package.json#volta` と競合する点に注意。 |

## Biotope プロジェクトとの親和性評価
| 観点 | 現状 | Vite+ 導入時の影響 |
| --- | --- | --- |
| Vite バージョン | `vite@^7.0.0` (Rollup) | `vp` は Vite 8 ＋ Rolldown 前提。`chore/upgrade-vite-v8` ブランチの作業が前提条件。 |
| テスト | Vitest 未導入 | `vp test` を活かすには Vitest セットアップが必要。 |
| Lint/Format | ESLint + `npm run lint`, フォーマッタ未統合 | `vp check` で Oxlint/Oxfmt をまとめられるが、既存 ESLint ルールをそのまま移植できない。段階的移行推奨。 |
| Node バージョン管理 | Volta (`package.json#volta`) で Node 20.17 固定 | `.node-version` で 22 系列を pin する設計。Volta との二重管理を解消する運用が必要。 |
| Cloudflare 連携 | `npm run dev:wrangler` で `vite` + `wrangler pages dev` を並列実行 | `vp run` タスクで `wrangler` を `dependsOn` 付きで呼び出す形に整理できるが、Wrangler 自体は別管理。 |
| CI/CD | npm scripts 基準 | `vp` 採用後は CI ジョブも `vp` コマンドに置き換える必要がある。 |

**メリット**
- `vp check` によりフォーマット・リンティング・型チェックを一本化でき、CI 時間の短縮が期待できる。
- `vp run` タスクにキャッシュと依存情報を持たせられるため、大量の 3D アセットを扱う現行プロジェクトでもビルドの再利用性が向上する可能性。
- Node バージョンの自動切替により開発者ごとの差異を減らせる。

**懸念点・課題**
1. **アルファ段階**: 公式発表は 2025 年 3 月時点で Alpha。クリティカルな本番ワークフローに即投入するには追加検証が必要。
2. **Vite 8 依存**: 既存コードで非推奨 API (特に `vite.config.ts` まわり) が使われている可能性があるため、先に Vite 8 へのアップグレードとビルド検証が必須。
3. **Volta との二重管理**: `.node-version` ベースの `vp env` と Volta の `package.json#volta` が競合するため、どちらかに統一する運用ルールを決める必要がある。
4. **Wrangler との統合**: `vp dev` では Cloudflare Pages 側の開発サーバーを起動しないため、`vp run` のカスタムタスク定義で Wrangler を呼び出すラッパーを作る必要がある。
5. **Oxlint 互換性**: 現在の ESLint 設定 (React Hooks ルールなど) をそのまま Oxlint へ移行できないため、ルールを写経 or 近似ルールへ置換する検討が必要。

## 導入手順案
1. **`vp` CLI のセットアップ**
   - `curl -fsSL https://vite.plus | bash` (macOS/Linux)。インストール後 `source ~/.zshrc`。
   - プロジェクトディレクトリで `vp env pin 22` を実行し `.node-version` を追加。Node 22.22.1 がデフォルトでインストールされる。
2. **既存依存関係のアップグレード**
   - `npm install vite@^8.0.0 @vitejs/plugin-react@^5 vitest@^2` 等、Vite 8 / Vitest 4.1+ 系列へ更新。
   - `tsconfig` やプラグインの破壊的変更を検証。`chore/upgrade-vite-v8` ブランチをリベースして使用。
3. **`vp migrate` の実行**
   - 依存アップグレード後に `vp migrate` を実行し、`vite.config.ts` に `lint`, `fmt`, `run.tasks` など Vite+ 固有フィールドを生成。
   - 生成結果をレビューし、既存の Vite プラグイン設定・環境変数参照を反映。
4. **タスク置き換え**
   - `package.json` の `scripts` を最小限にし、`vp run` へ移行 (例: `dev` タスクに Wrangler 連携を `dependsOn` で表現)。
   - CI では `vp check`, `vp test`, `vp build` を段階的に採用。
5. **Lint/Format ルール移行**
   - Oxlint/Oxfmt の設定を `vite.config.ts` に追加し、React Hooks ルール等の互換ルールを確認。
   - 既存の ESLint は暫定的に併用し、完全移行後に削除する二段階方式が安全。
6. **開発者ドキュメント更新**
   - README, docs/cloudflare-services.md などに `vp` ベースのコマンドを記載。
   - `.node-version` / Volta どちらを採用するか最終判断し、ルールを共有。

## 結論と推奨アクション
- 直ちに本番へ導入するのではなく、**Vite 8 + Vitest 4 系列へのアップグレード完了後に Vite+ の PoC ブランチ**を切って評価するのが現実的。
- 先行タスクとして以下を推奨:
  1. `chore/upgrade-vite-v8` ブランチの作業を完了し、Vite 8 ビルドを安定化させる。
  2. Vitest を導入し、`vp test` への移行コストを下げる。
  3. Volta から `.node-version` への一本化ポリシーを決定。
- その後に `vp migrate` を試し、`package.json` スクリプトが `vp` に置き換え可能か、Cloudflare Pages のデプロイや R2 Worker への影響を検証する。

本ドキュメントは Issue #18 に対する調査報告として残し、上述のステップが完了した段階でアップデートする。
