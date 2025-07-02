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
  - **外部ホスティングを利用する**: 大きなファイルを外部のストレージサービスや CDN（例：Amazon S3、Google Cloud Storage、または他のファイルホスティングサービス）にアップロードし、アプリケーション内で URL を介して参照します。手順は以下の通りです：
    1. 選択したストレージサービスにアカウントを作成し、ファイルをアップロードします。ファイルパスは`public/assets/Smoked Fish Raw/weflciqaa_tier_0.bin`と`public/assets/Smoked Fish Raw/weflciqaa_tier_0.gltf`です。
    2. アップロードしたファイルの公開 URL を取得します。サービスによっては、公開アクセスを有効にするための設定が必要な場合があります。
    3. `FishManager.tsx`内で、直接ファイルパスを参照するのではなく、取得した URL を使用するように変更します：
       ```typescript
       const fishModelUrl =
         "https://<your-storage-domain>/<path-to-file>/weflciqaa_tier_0.gltf";
       // URLを使用してモデルを読み込む
       ```
       こうすることで、ビルド出力のサイズを制限し、Cloudflare Pages の制限内に収めることができます。ビルド出力からファイルを除外するとアプリケーションが動作しなくなるため、外部ホスティングが推奨されます。
  - **ファイルの最適化**: ファイルを外部ホスティングせずにサイズを削減する方法を検討します。3D モデルの場合、以下の最適化を試みることができます：
    1. Blender や Maya などの 3D モデリングソフトウェアを使用して、モデルのポリゴン数を減らします。
    2. テクスチャの解像度を下げたり、圧縮形式を適用したりします。
    3. glTF 最適化ツール（例：glTF-Pipeline）を使用して、ファイルを圧縮します。以下のコマンドを試すことができます：
       ```bash
       npx gltf-pipeline -i public/assets/Smoked Fish Raw/weflciqaa_tier_0.gltf -o public/assets/Smoked Fish Raw/optimized_weflciqaa_tier_0.gltf --draco.compressionLevel=7
       ```
       圧縮後、プロジェクト内で新しい最適化されたファイルパスを参照するように更新してください。
  - **GitHub から外部ストレージへの自動アップロードを設定する**: GitHub へのプッシュ時に自動的にファイルを外部ストレージにアップロードするワークフローを設定できます。以下の手順で設定してください：
    1. GitHub リポジトリの「Settings」タブに移動します。
    2. 「Secrets and variables」セクションで「Actions」を選択し、「New repository secret」をクリックします。
    3. 使用するストレージサービスの認証情報をシークレットとして追加します（例：AWS の場合は`AWS_ACCESS_KEY_ID`と`AWS_SECRET_ACCESS_KEY`、Google Cloud の場合はサービスアカウントキーなど）。
    4. `.github/workflows/upload-to-storage.yml`ファイルを作成し、選択したストレージサービスにファイルをアップロードする GitHub Actions ワークフローを定義します。現在の`.github/workflows/upload-to-r2.yml`を参考に、適切なツールやコマンドに置き換えてください。
    5. 必要に応じて、ワークフロー内のバケット名やファイルパスをプロジェクトに合わせて調整します。
       こうすることで、GitHub にプッシュするたびに、指定したアセットが自動的に外部ストレージにアップロードされます。

## 追加リソース

- [Cloudflare Pages ドキュメント](https://developers.cloudflare.com/pages/)
- [Vite デプロイガイド](https://vite.dev/guide/static-deploy.html#cloudflare)

これらの手順に従うことで、Biotope プロジェクトを Cloudflare Pages に正常にデプロイし、Cloudflare のグローバル CDN を活用して高速かつ安全な配信を実現できるはずです。
