# 機能と開発Tips - Biotopeプロジェクト

このドキュメントでは、Biotopeプロジェクトの具体的な開発Tips、効果的なプロンプト例、トラブルシューティングを説明します。

---

## 開発ワークフロー

### `/start-impl` コマンドを使った実装フロー

開発タスクを開始する際は、以下のワークフローに従います：

#### 1. セッション用ディレクトリの作成

**重要**: セッションごとに外部ファイルで管理します

```bash
# セッション用ディレクトリを作成
mkdir -p tmp/001_feature-name/
```

**ディレクトリ命名規則**:
- `tmp/` 配下に作成（`.gitignore`で除外済み）
- `{連番}_{機能名}/` の形式
- 例: `tmp/001_rain-effect/`, `tmp/002_star-constellation/`

**ディレクトリ構造**:

```
tmp/001_feature-name/
├── plan.md      # 実装計画
└── prompt.md    # やりとり履歴
```

**メリット**:
- 実装計画とどこまで実装したかの履歴があれば、それを読んでっていうだけで思い出してもらえる
- 過去のセッションを参照しやすい
- プロジェクトルートが汚れない
- Git管理外なのでコミット不要

#### 2. 実装開始の許可を得る

**重要**: コードの変更は勝手に実施してはいけません

1. まず、`tmp/XXX_feature/plan.md` に作業のプランニングを作成します
2. `plan.md` をユーザーに提示し、実装の許可を得ます
3. 許可が得られるまで、ユーザーと相談しつつプランニングを繰り返します

#### 3. 作業の実施

`plan.md` に記載されたプランに従って、作業を実施します：

- ユーザーから指示があるたびに `prompt.md` を更新します
- 作業完了後にも `prompt.md` を更新します
- **作業完了ごとに、以下を必ず実施**:
  - テストの実施
  - 型チェック (`npm run build`)
  - フォーマットの実施 (`npm run lint`)

#### セッション管理

- **セッション開始時**: `tmp/XXX_feature/` を作成し、`plan.md` と `prompt.md` を生成
- **セッション中**: 継続的に `prompt.md` を更新し、進捗と課題を記録
- **セッション完了後**: 履歴が残るので、後から参照可能

---

## プロジェクト固有の開発Tips

### 1. Three.jsとReactの最適化

#### useFrame の使い方

```typescript
// ❌ 悪い例: 毎フレームsetStateを呼ぶ
useFrame(() => {
  setPosition([x, y, z]); // 再レンダリングが発生
});

// ✅ 良い例: refで直接更新
const meshRef = useRef<THREE.Mesh>(null);
useFrame(() => {
  if (meshRef.current) {
    meshRef.current.position.set(x, y, z); // 再レンダリングなし
  }
});
```

#### メモ化の活用

```typescript
// 重い計算はuseMemoでキャッシュ
const particles = useMemo(() => {
  return Array.from({ length: COUNT }, (_, i) => ({
    position: [Math.random() * 10, Math.random() * 10, Math.random() * 10],
    rotation: Math.random() * Math.PI,
  }));
}, [season]); // seasonが変わった時だけ再計算

// コンポーネント全体をメモ化
export default React.memo(SeasonalEffect);
```

#### InstancedMeshの活用

同じジオメトリを大量に表示する場合：

```typescript
// ❌ 悪い例: 個別のMesh
{particles.map((p, i) => (
  <mesh key={i} position={p.position}>
    <sphereGeometry args={[0.1]} />
    <meshBasicMaterial />
  </mesh>
))}

// ✅ 良い例: InstancedMesh
<instancedMesh ref={meshRef} args={[undefined, undefined, COUNT]}>
  <sphereGeometry args={[0.1]} />
  <meshBasicMaterial />
</instancedMesh>
```

**AIへのプロンプト例**:

```
新しいパーティクルシステムを追加してください。
1000個の小さな球体をInstancedMeshで描画し、
useFrameではsetStateを使わずrefで更新してください。
```

### 2. 3Dモデルの読み込み

#### 共通のヘルパーを使用

```typescript
import { useModelScene } from '../utils/modelHelpers';

// R2 / ローカルを自動で切り替え
const scene = useModelScene('cc0____yellow_striped_flounder.glb');
```

#### 事前ロードでパフォーマンス改善

```typescript
// コンポーネント外で事前ロード
preloadModel('fish.glb');
preloadModel('leaf.glb');

function MyComponent() {
  const fishScene = useModelScene('fish.glb'); // 即座に利用可能
  // ...
}
```

**AIへのプロンプト例**:

```
新しい3Dモデル「butterfly.glb」を追加してください。
useModelSceneヘルパーを使い、コンポーネント外で
preloadModelを呼んでください。
```

---

## 効果的なプロンプト例

### 新機能の追加

```
夏限定で蛍のエフェクトを追加してください。

要件:
- SeasonalEffects.tsx に統合
- 定数は src/constants/firefly.ts に分離
- 30-50個の小さな光る球体
- ゆっくり浮遊する動き（refベースのアニメーション）
- 夜間のみ表示
- パフォーマンス: InstancedMesh を使用

既存の FallenLeaves.tsx を参考に実装してください。
```

### パフォーマンス最適化

```
WaterSurface コンポーネントのパフォーマンスを改善してください。

現状の課題:
- 頂点更新が重い（毎フレーム実行）
- CPU使用率が高い

改善方針:
- useThrottledFrame で30fpsに間引く
- 重複した Math.sin 計算を削減
- マテリアルを useMemo でキャッシュ

既存の最適化パターン（README.mdの「パフォーマンス最適化」参照）
に従ってください。
```

### バグ修正

```
カレイが水面に浮いてしまう問題を修正してください。

期待する動作:
- 地面（Y=-0.9）に密着
- 砂に擬態（opacity: 0.6）
- 待機→瞬間移動のサイクル

関連ファイル:
- src/components/FishManager.tsx
- src/constants/fish.ts

デバッグ手順:
1. 現在のY座標をログ出力
2. FLOUNDER_Y_POSITION 定数を確認
3. 初期位置設定のロジックを確認
```

### リファクタリング

```
BubbleEffect.tsx のマジックナンバーを定数化してください。

要件:
- 新しいファイル src/constants/bubbleEffect.ts を作成
- UPPER_SNAKE_CASE で命名
- 以下の値を定数化:
  - 泡の数（現在: 50）
  - 上昇速度（現在: 0.02）
  - サイズ範囲（現在: 0.05-0.15）
  - 生成範囲（X/Z座標）

既存の src/constants/fish.ts を参考にしてください。
```

### 3Dモデルのデバッグと位置調整

```
カレイの3Dモデルが正しく地面に配置されるようにしてください。

現状の問題:
- カレイが水面に浮いている
- 地面との接触が不自然

要件:
- Y座標を地面（-0.9）に固定
- 初期位置を確実に設定
- デバッグログで座標を確認

確認事項:
1. FishManager.tsx で初期位置設定のロジック
2. FLOUNDER_Y_POSITION 定数の値
3. useEffect での初期化が正しく実行されているか
4. 3Dモデルのバウンディングボックスを確認

デバッグ手順:
- console.log で fishRef.current.position を確認
- Three.js の BoxHelper で位置を可視化
- 初期化タイミングを検証
```

### Cloudflare Functions開発

```
日替わりメッセージAPIを実装してください。

要件:
- エンドポイント: /api/daily-message
- Cloudflare KV でキャッシュ（24時間）
- AI生成メッセージ（季節感を考慮）
- CORS対応

実装手順:
1. functions/api/daily-message.ts を作成
2. KV namespace を wrangler.toml に設定
3. キャッシュキーは日付ベース（YYYY-MM-DD）
4. 季節情報を判定してプロンプトに反映
5. エラーハンドリング（AI生成失敗時のフォールバック）

参考:
- Cloudflare Pages Functions のドキュメント
- KV の TTL 設定（expirationTtl: 86400）
```

---

## トラブルシューティング

### 問題1: FPSが低下する

**診断**:

```typescript
// App.tsx で有効化
const PERFORMANCE_MONITOR = true;
```

**一般的な原因**:
- `useFrame` 内での `setState`
- 大量の個別Mesh（InstancedMeshに置き換え）
- 毎フレームの重い計算（useMemoでキャッシュ）

**AIへのプロンプト**:

```
パフォーマンスモニターで以下の問題が出ています:
- FPS: 30
- 描画コール: 200

原因を調査し、README.mdの最適化手法を適用してください。
```

### 問題2: 3Dモデルが表示されない

**チェックリスト**:
- [ ] モデルファイルが `src/assets/` に存在するか
- [ ] R2にアップロードされているか（本番環境）
- [ ] `useModelScene` でエラーが出ていないか（コンソール確認）
- [ ] モデルのスケールが適切か（大きすぎ/小さすぎ）

**デバッグ手順**:

```typescript
const scene = useModelScene('model.glb');
console.log('Model scene:', scene); // シーンオブジェクトを確認
console.log('Children:', scene.children); // 子要素を確認
```

### 問題3: TypeScriptエラー

**よくあるエラー**:

#### `any` 型の使用

```typescript
// ❌ エラー
const data: any = ...;

// ✅ 修正
const data: { position: [number, number, number]; rotation: number } = ...;
```

#### 定数の型推論

```typescript
// ❌ エラー
export const CONFIG = { speed: 0.1 }; // { speed: number }

// ✅ 修正
export const CONFIG = { speed: 0.1 } as const; // { readonly speed: 0.1 }
```

**AIへのプロンプト**:

```
以下のTypeScriptエラーを修正してください:

[エラーメッセージをコピー]

プロジェクトの型安全性の方針に従い、any は使わず、
適切な型定義を追加してください。
```

### 問題4: ビルドエラー

**確認手順**:

```bash
# 型チェック
npm run build

# リント
npm run lint
```

**一般的な原因**:
- 未使用のインポート
- 型の不一致
- 定数ファイルのインポート忘れ

### 問題5: Cloudflare KV namespace not found

**症状**:

- ローカル開発で `KV is not defined` エラー
- デプロイ後に 500 エラー

**解決策**:

1. **wrangler.toml を確認**

   ```toml
   [[kv_namespaces]]
   binding = "KV"
   id = "本番環境のKV namespace ID"
   preview_id = "プレビュー環境のKV namespace ID"
   ```

2. **KV namespaceの作成**

   ```bash
   # 本番用
   npx wrangler kv:namespace create "KV"

   # プレビュー用
   npx wrangler kv:namespace create "KV" --preview
   ```

3. **型定義の追加**

   ```typescript
   // functions/types.ts
   export interface Env {
     KV: KVNamespace;
   }
   ```

4. **ローカルテスト**

   ```bash
   npm run preview  # wrangler pages dev で確認
   ```

### 問題6: 3Dモデルの初期位置が反映されない

**症状**:

- useEffectで位置を設定しても、モデルが元の位置に戻る
- console.logでは正しい値が出力される

**原因**:

- モデルの読み込みタイミングの問題
- useFrameで位置が上書きされている
- 複数回レンダリングされている

**解決策**:

1. **依存配列を正しく設定**

   ```typescript
   useEffect(() => {
     if (fishRef.current) {
       fishRef.current.position.set(x, y, z);
     }
   }, [x, y, z]); // 依存配列を明示
   ```

2. **useFrameで位置が上書きされていないか確認**

   ```typescript
   useFrame(() => {
     if (fishRef.current) {
       // position.setを使っていないか確認
       // fishRef.current.position.set(...) // NG
       fishRef.current.position.y += delta; // OK (相対的な変更)
     }
   });
   ```

3. **初期化フラグを使う**

   ```typescript
   const initializedRef = useRef(false);

   useEffect(() => {
     if (fishRef.current && !initializedRef.current) {
       fishRef.current.position.set(x, y, z);
       initializedRef.current = true;
       console.log('Position initialized once');
     }
   }, [x, y, z]);
   ```

---

## まとめ

このドキュメントは継続的に更新されます。新しいTipsやプロンプト例が見つかった場合は、`/update-ai-guide`コマンドで自動的に反映されます。

---

## 参考リソース

- [glossary.md](./glossary.md): 用語集
- [architecture.md](./architecture.md): アーキテクチャとパターン
- [README.md](../../README.md): プロジェクト全体の概要
