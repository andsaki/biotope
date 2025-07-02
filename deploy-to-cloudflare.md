# Biotope プロジェクトを Cloudflare Pages にデプロイする

このガイドでは、Biotope プロジェクトを Cloudflare Pages にデプロイするためのステップバイステップの手順を説明します。

## 前提条件

- Cloudflare アカウントを持ち、Cloudflare Pages にアクセスできること。
- プロジェクトリポジトリが GitHub、GitLab、または Bitbucket にホストされていること（Cloudflare Pages はこれらのプラットフォームとの直接統合をサポートしています）。

## デプロイ手順

1. **Cloudflare にログイン**: [https://dash.cloudflare.com](https://dash.cloudflare.com)から Cloudflare ダッシュボードにアクセスします。

2. **Pages に移動**: Cloudflare ダッシュボードから、サイドバーの「Pages」を選択します。

3. **新しいプロジェクトを作成**: 「プロジェクトを作成」をクリックし、「Git に接続」を選択してリポジトリをリンクします。リポジトリプロバイダー（GitHub、GitLab、または Bitbucket）を選択し、Cloudflare がリポジトリにアクセスできるように認証します。

4. **リポジトリを選択**: リストから`biotope-project`リポジトリを選択します。

5. **ビルド設定を構成**:

   - **プロジェクト名**: プロジェクトの名前を入力します（例：`biotope-project`）。
   - **本番ブランチ**: `main`または主要ブランチに設定します。
   - **フレームワークプリセット**: `None`を選択します。
   - **ビルドコマンド**: 既存のビルドスクリプトを使用します：`npm run build`。
   - **ビルド出力ディレクトリ**: `dist`に設定します（Vite ビルドのデフォルト出力ディレクトリです）。
   - **ルートディレクトリ**: デフォルトのままにします（リポジトリのルート）。

6. **環境変数（オプション）**: プロジェクトに環境変数が必要な場合は、「環境変数」セクションで追加します。

7. **デプロイ**: 「保存してデプロイ」をクリックしてデプロイプロセスを開始します。Cloudflare Pages はリポジトリをクローンし、ビルドコマンドを実行し、出力を`pages.dev`サブドメインにデプロイします。

8. **カスタムドメイン（オプション）**: デプロイ後、Pages の設定で「カスタムドメイン」に移動し、指示に従ってドメインを追加することでカスタムドメインを設定できます。

## 自動デプロイ

Cloudflare Pages は、接続されたリポジトリの本番ブランチに変更をプッシュするたびに自動的に更新をデプロイします。必要に応じて他のブランチのデプロイトリガーを構成することもできます。

## トラブルシューティング

- **ビルドエラー**: Cloudflare Pages のデプロイログを確認してビルドエラーがないかチェックします。`package.json`にすべての依存関係が正しく指定されていることを確認してください。
- **デプロイの問題**: サイトが期待通りに表示されない場合、ビルド出力ディレクトリを確認し、ビルドスクリプトが期待される出力を`dist`に生成していることを確認してください。
- **ファイルサイズ制限の問題**: Cloudflare Pages は 1 ファイルあたり 25 MiB までのサイズ制限があります。`assets/Smoked Fish Raw/weflciqaa_tier_0.bin`のような大きなファイルが含まれる場合、デプロイが失敗することがあります。このファイルは`FishManager.tsx`コンポーネントで使用されている 3D モデル（燻製魚）のデータであり、プロジェクトにとって必要なアセットです。以下の方法でサイズの問題を解決し、アプリケーションの機能を維持できます：
  - **Cloudflare R2 を利用する**: 大きなファイルを Cloudflare R2 にアップロードし、アプリケーション内で URL を介して参照します。Cloudflare R2 を使用する手順は以下の通りです：
    1. Cloudflare ダッシュボードにログインし、「R2」セクションに移動します。
    2. 新しいバケットを作成します（例：`biotope-assets`）。
    3. 作成したバケットに`weflciqaa_tier_0.bin`をアップロードします。ファイルパスは`public/assets/Smoked Fish Raw/weflciqaa_tier_0.bin`です。
    4. アップロードしたファイルの公開 URL を取得します。Cloudflare R2 では、カスタムドメインを設定するか、R2 のデフォルトドメイン（例：`https://<account-id>.r2.cloudflarestorage.com/<bucket-name>/weflciqaa_tier_0.bin`）を使用します。必要に応じて、公開アクセスを有効にするためにバケットの設定を調整します。
    5. `FishManager.tsx`内で、直接ファイルパスを参照するのではなく、取得した URL を使用するように変更します：
       ```typescript
       const fishModelUrl =
         "https://<your-r2-domain>/<bucket-name>/weflciqaa_tier_0.gltf";
       // URLを使用してモデルを読み込む
       ```
       こうすることで、ビルド出力のサイズを制限し、Cloudflare Pages の制限内に収めることができます。ビルド出力からファイルを除外するとアプリケーションが動作しなくなるため、Cloudflare R2 での外部ホスティングが推奨されます。
  - **GitHub から Cloudflare R2 への自動アップロードを設定する**: GitHub へのプッシュ時に自動的にファイルを Cloudflare R2 にアップロードするワークフローを設定できます。以下の手順で設定してください：
    1. GitHub リポジトリの「Settings」タブに移動します。
    2. 「Secrets and variables」セクションで「Actions」を選択し、「New repository secret」をクリックします。
    3. 以下のシークレットを追加します：
       - `CLOUDFLARE_API_TOKEN`: Cloudflare アカウントの API トークン（Cloudflare ダッシュボードの「My Profile」→「API Tokens」で作成）。
       - `CLOUDFLARE_ACCOUNT_ID`: Cloudflare アカウント ID（Cloudflare ダッシュボードの「Account Home」で確認）。
    4. `.github/workflows/upload-to-r2.yml`ファイルがリポジトリに含まれていることを確認します。このファイルは、プッシュ時に指定したファイルを Cloudflare R2 にアップロードする GitHub Actions ワークフローを定義しています。
    5. 必要に応じて、ワークフロー内のバケット名やファイルパスをプロジェクトに合わせて調整します。
       こうすることで、GitHub にプッシュするたびに、指定したアセットが自動的に Cloudflare R2 にアップロードされます。

## 追加リソース

- [Cloudflare Pages ドキュメント](https://developers.cloudflare.com/pages/)
- [Vite デプロイガイド](https://vite.dev/guide/static-deploy.html#cloudflare)

これらの手順に従うことで、Biotope プロジェクトを Cloudflare Pages に正常にデプロイし、Cloudflare のグローバル CDN を活用して高速かつ安全な配信を実現できるはずです。
