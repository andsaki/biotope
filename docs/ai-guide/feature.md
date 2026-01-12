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

**重要**: `/start-impl`コマンドを使用する際は、以下の手順を必ず守ってください:

1. ✅ セッションディレクトリとファイルを作成
2. ✅ plan.md に実装計画を詳細に記述
3. ✅ plan.md をユーザーに提示
4. 🛑 **ユーザーの承認を待つ（ここで必ず停止）**
5. ✅ 承認後に実装開始

**絶対に避けるべき**:
- ❌ plan.md を作成せずに実装開始
- ❌ ユーザー承認を得ずにコード変更
- ❌ 「後で記録すればいい」という考え方

**なぜ重要か**:
- 手戻りを防止（事前計画で問題を発見）
- ユーザーと認識を合わせる（誤解を防ぐ）
- 品質向上（計画的な実装）
- 後から振り返りができる

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

### パフォーマンスチューニング

```
3Dシーンのパフォーマンスを測定・分析して、ボトルネックを特定してください。

手順:
1. PERFORMANCE_MONITORを有効化（src/App.tsx）
2. ベースライン測定（FPS, Draw Calls, Triangles, Memory）
3. SeasonalEffectsを無効化してボトルネック特定
4. 個別エフェクトを段階的に無効化して原因を絞り込む
5. 測定結果を報告

重要:
- 最適化案を実施する前に必ず相談すること
- 視覚品質を損なう最適化は採用しない
- ビオトープは「リアリティ重視」のプロジェクトです

参考:
- docs/ai-guide/architecture.md の「パターン3: パフォーマンス最適化」
- tmp/004_performance-tuning/ の調査結果
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

### UIコンポーネントのガラスモーフィズム化

```
UIパネルをガラスモーフィズムスタイルに変更してください。

現状の問題:
- 便箋風の不透明な背景（コンテキストに合わない）
- 茶色のボーダー（水のテーマと不一致）
- 控えめなシャドウ（深みがない）

新しいデザイン要件:
- 半透明のガラス効果（backdrop-filter: blur(20px) saturate(180%)）
- 白ベースの半透明背景
- 多層のbox-shadow（外側 + inset）
- テキストは白色（rgba(255, 255, 255, 0.95)）
- text-shadowで夜間の視認性確保
- hover時の立体的なフィードバック

実装手順:
1. docs/design-guide.md のガラスモーフィズム仕様を確認
2. 基本スタイルを適用:
   ```typescript
   background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0.06))',
   backdropFilter: 'blur(20px) saturate(180%)',
   WebkitBackdropFilter: 'blur(20px) saturate(180%)',
   border: '1px solid rgba(255, 255, 255, 0.18)',
   boxShadow: `
     0 8px 32px rgba(0, 0, 0, 0.4),
     inset 0 1px 0 rgba(255, 255, 255, 0.3),
     inset 0 -1px 0 rgba(0, 0, 0, 0.2)
   `
   ```
3. hoverステートを実装:
   - `transform: 'scale(1.05) translateY(-2px)'`
   - boxShadowを強化
4. テキストスタイルを更新:
   - `color: 'rgba(255, 255, 255, 0.95)'`
   - `textShadow: '0 2px 4px rgba(0, 0, 0, 0.4)'`

適用対象:
- UIパネル（src/components/UI.tsx）
- 風向きコンパス（src/components/WindDirectionDisplay.tsx）
- 季節ボタン
- 閉じるボタン

参考実装:
- src/components/UI.tsx（既存の実装）
- docs/design-guide.md（詳細仕様）
- docs/ai-guide/architecture.md（パターン6）

重要な注意事項:
- 便箋風デザインは**アンチパターン**（絶対使用禁止）
- `backdrop-filter`はパフォーマンスに影響するため必要最小限に
- 夜間シーンでの視認性テスト必須
```

### 没入感のあるローディング画面デザイン

```
ローディング画面を深海から水面へ浮上する没入感のあるデザインにリニューアルしてください。

要件:
- 深海→水面への立体的なグラデーション背景
- SVGフィルターによるグレインテクスチャ
- 浮遊する気泡アニメーション（12個、ランダムな動き）
- 魚の影が横切るアニメーション（3種類）
- 光の屈折レイヤー（動的アニメーション）
- タイトルにグラデーション + グロー効果 + 反射エフェクト
- 水滴と波紋によるローディングアニメーション

デザインのポイント:
- 複数のradial-gradientを重ねて深海の立体感を表現
- backgroundClip: "text"でグラデーションテキスト
- SVG Data URLでノイズフィルターを生成（feTurbulence）
- 複数レイヤーのアニメーションで動きに深みを出す

参考実装:
- src/components/Loader.tsx
- インラインスタイル + <style>タグでアニメーション定義
- clamp()でレスポンシブなフォントサイズ
```

**AIの実装例**:

主要な技術的要素：

```typescript
// SVGフィルターによるグレインテクスチャ
backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='3.5' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.15'/%3E%3C/svg%3E")`

// グラデーションテキストエフェクト
background: "linear-gradient(135deg, #ffffff 0%, #e8f4f8 30%, #b8dde8 60%, #8ec6d9 100%)",
backgroundClip: "text",
WebkitBackgroundClip: "text",
color: "transparent"

// 複数のradial-gradientを重ねた立体的な背景
background: `
  radial-gradient(ellipse at 20% 80%, rgba(8, 51, 71, 0.95) 0%, transparent 45%),
  radial-gradient(ellipse at 80% 20%, rgba(18, 87, 111, 0.85) 0%, transparent 50%),
  radial-gradient(ellipse at 50% 50%, rgba(31, 108, 129, 0.7) 0%, transparent 65%),
  linear-gradient(180deg, #061420 0%, #0f2d3d 30%, #1a4a5e 60%, #2d6a7d 100%)
`
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

### Gemini APIプロンプトの改善

```
現在のプロンプトをもっとこだわりたいです。
マインドフルネス型に改善してください。

要件:
- 「今、ここ」への意識を重視
- 五感への訴求を強化
- 呼吸・身体感覚に意識を向ける表現
- 静けさと穏やかさを感じさせる
- 具体的な表現例を含める

参考実装:
- functions/api/daily-message.ts の generateDailyMessage()
- プロンプトに「マインドフルネスの実践者」ペルソナを設定
- 表現例を提示してAIの生成品質を向上
```

**AIの提案例**:

プロンプト改善案を複数提示し、ユーザーに選択させる:
1. 感情に寄り添うメンタルケア型
2. 自然描写重視の情景型
3. マインドフルネス型（「今、ここ」重視）
4. プロジェクト特化型（ビオトープ連動）

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

### 問題7: Gemini APIがfallbackメッセージを返す

**症状**:

- レスポンスヘッダーに `x-message-source: fallback` が含まれる
- レスポンスボディの `source` フィールドが `"fallback"`
- Gemini APIで生成されたメッセージが返されない

**診断手順**:

1. **APIレスポンスを確認**

   ```bash
   curl -i https://your-app.pages.dev/api/daily-message
   # x-message-source ヘッダーを確認
   ```

2. **利用可能なモデルを確認**

   ```bash
   curl -s 'https://generativelanguage.googleapis.com/v1beta/models?key=YOUR_API_KEY' | grep -A 2 '"name"'
   ```

**原因と解決策**:

#### 原因1: モデル名が間違っている

```typescript
// ❌ 間違い: gemini-1.5-flash は存在しない
const response = await fetch(
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`
);

// ✅ 正しい: gemini-2.5-flash を使用
const response = await fetch(
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`
);
```

#### 原因2: APIキーが設定されていない

```bash
# Cloudflare Pages のシークレット確認
npx wrangler pages secret list --project-name=your-project

# シークレットが存在しない場合は設定
npx wrangler pages secret put GEMINI_API_KEY --project-name=your-project
```

#### 原因3: Quota超過

```json
{
  "error": {
    "code": 429,
    "message": "You exceeded your current quota..."
  }
}
```

**解決策**: APIキーのプランを確認、または別のモデルを試す

### 問題8: Gemini APIで生成されたメッセージが途中で切れる

**症状**:

- メッセージが途中で終わる（例: "年の瀬の寒さも深まり、きら"）
- レスポンスの `finishReason` が `"MAX_TOKENS"`
- `thoughtsTokenCount` が 500-1000 トークン消費されている

**原因**:

gemini-2.5-flashは内部的に「思考プロセス」を使用し、`maxOutputTokens`の大部分を思考に消費してしまう。

**診断**:

```bash
curl -s -X POST 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=YOUR_KEY' \
  -H 'Content-Type: application/json' \
  -d '{"contents":[{"parts":[{"text":"テストメッセージを生成してください"}]}]}' \
  | jq '.usageMetadata'
```

出力例:
```json
{
  "promptTokenCount": 97,
  "candidatesTokenCount": 17,  // ← 実際の出力が少ない
  "totalTokenCount": 593,
  "thoughtsTokenCount": 479    // ← 思考プロセスが大量消費
}
```

**解決策**:

`maxOutputTokens`を大きめに設定（2000推奨）:

```typescript
generationConfig: {
  temperature: 0.9,
  maxOutputTokens: 2000,  // 思考プロセス分を考慮
}
```

**検証**:

```json
{
  "finishReason": "STOP",  // ← MAX_TOKENS から STOP に変わる
  "thoughtsTokenCount": 1040,
  "candidatesTokenCount": 72  // ← 完全なメッセージが生成される
}
```

### 問題9: Cloudflare Functions で Env 型が見つからない

**症状**:

```
名前 'Env' が見つかりません。ts(2304)
```

**原因**:

Cloudflare Functions の環境変数型定義が不足している。

**解決策**:

関数ファイルの先頭に型定義を追加:

```typescript
/// <reference types="@cloudflare/workers-types" />

interface Env {
  GEMINI_API_KEY: string;
  DAILY_MESSAGE_CACHE: KVNamespace;
}

export const onRequest = async (context: EventContext<Env, string, Record<string, unknown>>) => {
  const apiKey = context.env.GEMINI_API_KEY;
  const cache = context.env.DAILY_MESSAGE_CACHE;
  // ...
};
```

**検証**:

```bash
npm run build  # TypeScriptエラーが解消されることを確認
```

### 問題10: パフォーマンスが低下する（FPSが60未満）

**症状**:

- FPSが60を下回る（特に30-50FPS）
- 画面がカクつく
- Triangle数が異常に多い（10M以上）
- Draw Callsが多い（200以上）

**診断手順**:

1. **PerformanceMonitorを有効化**

   ```typescript
   // src/App.tsx
   const PERFORMANCE_MONITOR = import.meta.env.DEV; // または true
   ```

2. **ベースライン測定**

   すべての機能が有効な状態で測定：
   ```
   FPS: ?
   Draw Calls: ?
   Triangles: ?
   Memory: ?
   ```

3. **ボトルネック特定**

   コンポーネントを段階的に無効化：

   ```typescript
   // src/App.tsx - SeasonalEffects全体を無効化
   {/* <MemoizedSeasonalEffects /> */}
   ```

   改善した場合 → SeasonalEffectsがボトルネック

   さらに個別エフェクトを特定：
   ```typescript
   // src/components/SeasonalEffects.tsx
   {season === 'winter' && (
     <>
       {/* <SnowEffect /> */}
       {/* <FallenLeaves /> */}
     </>
   )}
   ```

4. **原因の特定**

   各コンポーネントのTriangle数を確認：
   - 3Dモデルのポリゴン数が多すぎる
   - 表示数が多すぎる
   - useFrameで重い処理をしている

**実例: FallenLeavesのボトルネック（2025-12-31）**

**調査結果**:
- leaf.glb: 768,000ポリゴン/個
- LEAF_COUNT: 15個
- 合計Triangle数: **11,520,000**

**最適化案の検証**:

| 手法 | Triangle数 | 視覚品質 | 結果 |
|------|-----------|---------|------|
| 元の3Dモデル | 11,520,000 | 高品質（リアル） | ✅ 採用 |
| PlaneGeometry + Canvas APIテクスチャ | 30 | 低品質（板状、不自然） | ❌ 却下 |

**結論**:
- Triangle数を99.9997%削減できたが、視覚品質が著しく低下
- ビオトープは「リアリティ」が重要なため、視覚品質を優先
- **パフォーマンス < 視覚品質** の原則

**今後の改善案**:

1. **LOD（Level of Detail）導入**:
   - カメラから遠い葉は低ポリゴンモデルを使用
   - 視覚品質を保ちつつパフォーマンス改善

2. **Blenderでモデル簡略化**:
   - 768,000ポリゴン → 10,000~50,000ポリゴンに削減
   - 95%削減しても視覚品質を維持

3. **表示数の動的調整**:
   - デバイス性能に応じてLEAF_COUNTを調整（15 → 5~10）

### 問題11: ローディング画面が正しく表示されない

**症状**:

- 初期ロード時に黒い画面が続く
- ローディングインジケーターが表示されない、または一部のみ表示される
- 波紋エフェクトは表示されるが、メインカード（タイトルなど）が表示されない

**原因**:

1. **`useProgress`をCanvas外で使用**: `@react-three/drei`の`useProgress`はCanvas内でしか動作しない
2. **タイマーベースのローディング**: 実際の3Dモデルのロード状態を監視していない
3. **HTMLタグの閉じ忘れ**: JSX構文エラーでコンポーネントが正しくレンダリングされない

**解決策**:

#### 解決策1: タイマーベースのシンプルなローディング

```typescript
// App.tsx
const AppContent = () => {
  const [isLoading, setIsLoading] = useState(true);

  // 最低表示時間（2秒）を設定
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="App">
      {isLoading && <Loader />}
      <Canvas>
        {/* 3Dシーン */}
      </Canvas>
    </div>
  );
};
```

```typescript
// Loader.tsx - Canvas外で使用するシンプルなローディング
const Loader = () => (
  <div style={{ /* スタイル */ }}>
    <div className="loader-card">
      <h1>Biotope</h1>
      <div className="loader-dots">
        <div className="loader-dot" />
        <div className="loader-dot" />
        <div className="loader-dot" />
      </div>
      <p>ビオトープの世界へようこそ</p>
    </div>
  </div>
);
```

#### 解決策2: HTMLタグの構文エラーを確認

閉じタグの不足を確認：

```typescript
// ❌ 悪い例: 閉じタグが不足
<div>
  <p>テキスト</p>

</div>  // ← 閉じタグが1つ足りない

// ✅ 良い例: 正しく閉じる
<div>
  <p>テキスト</p>
</div>
```

#### 解決策3: CSSの外部ファイル化

インラインスタイルを避け、CSSファイルに分離：

```css
/* Loader.css */
.loader-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: linear-gradient(135deg, #87CEEB 0%, #4A90E2 100%);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
}

.loader-card {
  background: rgba(245, 230, 211, 0.95);
  padding: 60px 50px;
  border-radius: 8px;
  animation: floatIn 1.5s ease-out;
}

@keyframes floatIn {
  from {
    opacity: 0;
    transform: translateY(-50px) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
```

**検証手順**:

1. ブラウザの開発者ツール（F12）でコンソールエラーを確認
2. Elements タブでローディング要素が存在するか確認
3. Computed スタイルで実際のスタイルが適用されているか確認
4. ネットワークタブで3Dモデルのロード状況を確認

**注意点**:

- `useProgress`はCanvas内（`<Html>`コンポーネント内）でのみ使用可能
- タイマーベースのローディングは簡易的だが、確実に表示される
- 実際のロード進捗を表示したい場合は、Canvas内で実装する必要がある

---

## まとめ

このドキュメントは継続的に更新されます。新しいTipsやプロンプト例が見つかった場合は、`/update-ai-guide`コマンドで自動的に反映されます。

---

## 参考リソース

- [glossary.md](./glossary.md): 用語集
- [architecture.md](./architecture.md): アーキテクチャとパターン
- [README.md](../../README.md): プロジェクト全体の概要
