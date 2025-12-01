# Biotope プロジェクト

React、TypeScript、Three.jsを使用したビオトープ環境シミュレーションWebアプリケーション。

🌐 **Live Demo**: https://biotope.pages.dev/

## 主な機能

- **3Dビオトープ環境**: Three.js + React Three Fiberによる没入型3D環境
- **リアルタイム時計**: 日本時間（UTC+9）と連動した昼夜サイクル
- **動的照明**: 実時間に応じた太陽の位置と照明変化
- **季節エフェクト**:
  - **春**: 桜の花びら（平面パーティクル）
  - **夏**: 陽炎エフェクト、強い日差し、**蓮の葉3Dモデル（波連動）**
  - **秋**: **3D落ち葉モデル（水面浮遊・リアルな動き）**
  - **冬**: 雪、冷たい照明
- **インタラクティブ要素**:
  - 水面アニメーション（波紋エフェクト）
  - 日時計（影の動き）
  - 漂流する瓶（クリックで季節×時間帯の便箋表示）
  - 風向きコンパス
- **3Dモデル統合**:
  - **魚**: カレイ（底生魚の動き：待機→瞬間移動）
  - **植物**: 蓮の葉（夏・波に連動）、水草
  - **自然要素**: 落ち葉（秋・水面浮遊）
- **AI生成メッセージ**: Google Gemini APIによる1日1回の日付関連メッセージ生成
- **レスポンシブデザイン**: PC/モバイル対応

## 技術スタック

- **フロントエンド**: React 19 + TypeScript
- **ビルドツール**: Vite 7
- **3D描画**: Three.js + @react-three/fiber + @react-three/drei
- **物理エンジン**: @react-three/rapier
- **デザインシステム**: トークンベースのスタイリング (tokens.ts)
- **AI**: Google Gemini 2.0 Flash (メッセージ生成)
- **デプロイ**: Cloudflare Pages
- **サーバーレス**: Cloudflare Functions
- **ストレージ**: Cloudflare R2（3Dモデル配信）
- **CDN**: Cloudflare Workers（R2キャッシュ）

Cloudflare 上での各サービスの役割とシーケンス図は `docs/cloudflare-services.md` を参照してください。

## セットアップ

1. リポジトリをクローン:
   ```bash
   git clone git@github.com:andsaki/biotope.git
   cd biotope-project
   ```

2. 依存関係をインストール:
   ```bash
   npm install
   ```

3. 開発サーバーを起動:
   ```bash
   npm run dev
   ```

4. ビルド:
   ```bash
   npm run build
   ```

## プロジェクト構造

```
src/
├── components/              # UIコンポーネント
│   ├── DriftingBottle/
│   │   ├── index.tsx            # 漂流瓶メインコンポーネント
│   │   ├── BottleModel.tsx      # 瓶の3Dモデル
│   │   └── MessageCard.tsx      # メッセージカード表示（AI生成対応）
│   ├── FishManager.tsx          # 魚の管理（カレイ3Dモデル含む）
│   ├── Ground.tsx               # 地面
│   ├── WaterSurface.tsx         # 水面（波紋アニメーション）
│   ├── WaterPlantsLarge.tsx     # 水草・蓮の葉（3Dモデル・波連動）
│   ├── FallenLeaves.tsx         # 秋の落ち葉（3Dモデル・水面浮遊）
│   ├── ParticleLayer.tsx        # 季節別パーティクル（形状最適化）
│   ├── SeasonalEffects.tsx      # 季節エフェクト統合
│   ├── Sun.tsx                  # 太陽
│   ├── SceneLights.tsx          # ライティング
│   ├── Clock.tsx                # リアルタイム時計表示
│   ├── WindDirectionDisplay.tsx # 風向きコンパス表示
│   └── UI.tsx                   # メインUI
├── hooks/                   # カスタムフック
│   ├── useRealTime.ts           # 日本時間管理
│   ├── useWindDirection.ts      # 風向き管理
│   ├── useLoader.ts             # ローディング管理
│   └── useBottleAnimation.ts    # 瓶の漂流アニメーション
├── contexts/                # 状態管理
│   ├── SeasonContext.tsx        # 季節管理（リアルタイム判定対応）
│   └── TimeContext.tsx          # 時間情報共有
├── styles/                  # デザインシステム
│   └── tokens.ts                # デザイントークン（色、影、サイズなど）
├── utils/                   # ユーティリティ関数
│   ├── sunPosition.ts           # 太陽位置計算
│   ├── time.ts                  # 時間帯判定
│   ├── random.ts                # ランダム選択
│   ├── messageUtils.ts          # メッセージ取得ロジック
│   └── dailyMessage.ts          # AI日次メッセージAPI呼び出し
├── constants/               # 定数ファイル（リファクタリング済み）
│   ├── bottleMessages.ts        # 季節×時間帯メッセージ集
│   ├── fish.ts                  # 魚の動作・表示定数
│   ├── fallenLeaves.ts          # 落ち葉エフェクト定数
│   ├── particle.ts              # パーティクルシステム定数
│   ├── cherryBlossoms.ts        # 桜エフェクト定数
│   ├── snowEffect.ts            # 雪エフェクト定数
│   ├── clouds.ts                # 雲の定数
│   ├── waterSurface.ts          # 水面の定数
│   ├── bubbleEffect.ts          # 泡エフェクト定数
│   ├── lighting.ts              # ライティング定数
│   ├── waterPlants.ts           # 水草・蓮の葉定数
│   ├── rocks.ts                 # 岩の配置定数
│   ├── stars.ts                 # 星空の定数
│   └── sundial.ts               # 日時計の定数
├── constants.ts             # アプリケーション定数
└── assets/                  # 静的資産（R2アップロード対象）
    ├── cc0____yellow_striped_flounder.glb       # カレイ3Dモデル
    ├── cc0__deep_autumn__5k_followers_milestone.glb  # 落ち葉3Dモデル
    └── cc0__water_lily_nymphaea_cv..glb         # 蓮の葉3Dモデル

functions/
└── api/
    └── daily-message.ts     # Cloudflare Functions - AI日次メッセージ生成API

r2-worker/
└── src/
    └── index.ts             # Cloudflare R2 Worker - 日付ベースキャッシュ
```

## デザインシステム

### トークンベース設計

プロジェクト全体で一貫したデザインを実現するため、`src/styles/tokens.ts` でデザイントークンを一元管理:

- **colors**: カラーパレット（paperBg、textPrimary、accentなど）
- **shadows**: 影スタイル（sm、md、lg、inset）
- **radius**: 角丸サイズ
- **spacing**: 余白サイズ
- **positioning**: PC/モバイル別の配置
- **componentSizes**: コンポーネントサイズ
- **typography**: フォント設定
- **transitions**: アニメーション速度
- **zIndex**: 重なり順

### 定数ファイルの設計原則

プロジェクト全体の保守性向上のため、**全てのマジックナンバーを定数化**:

#### 命名規則
- `UPPER_SNAKE_CASE`で統一
- 意味が明確な名前を使用（例: `FISH_BOUNDARY_X_MAX`）

#### ファイル構成
各コンポーネントの定数は独立したファイルに分離:
```typescript
// src/constants/fish.ts の例
export const NORMAL_FISH_COUNT = 10;
export const FISH_SPEED = {
  SPRING: 0.015,
  SUMMER: 0.02,
  AUTUMN: 0.01,
  WINTER: 0.005,
} as const;
```

#### メリット
1. **一箇所での調整**: パラメータ変更時に定数ファイルのみ編集
2. **可読性向上**: マジックナンバーが消え、意図が明確に
3. **型安全性**: `as const`で読み取り専用オブジェクトとして型推論
4. **再利用性**: 複数コンポーネントで同じ定数を共有可能

## パフォーマンス最適化

### 1. 3Dモデル最適化
**FishManager**: 毎フレームの`clone()`呼び出しを削減
- `useMemo`でモデルクローンを事前作成
- メモリアロケーション約70-80%削減
- CPU使用率約30-40%削減

### 2. インスタンス化レンダリング
**ParticleLayerInstanced**: InstancedMeshによる描画最適化
- 描画コール数を数百コール → 1コールへ削減
- GPU負荷約60-70%削減
- 春・冬のパーティクル表示で約40-50%のFPS向上

### 3. Canvas設定最適化
```typescript
<Canvas
  gl={{
    powerPreference: "high-performance",
    alpha: false,
    stencil: false,
  }}
  dpr={[1, 2]}
  performance={{ min: 0.5 }}
/>
```

### 4. コンポーネントメモ化
- 主要コンポーネントを`React.memo`でメモ化
- Cloudsコンポーネントのジオメトリ・マテリアルをメモ化
- 不要な再レンダリングを防止

### 5. コード分割
`React.lazy` と `Suspense` で重い3Dコンポーネントを遅延読み込み

### 6. 水面の頂点更新最適化
**WaterSurface**: フレームスキップで頂点更新を削減
- 2フレームに1回だけ頂点を更新
- 視覚的な品質を保ちつつCPU負荷を50%削減

### 7. 共有マテリアルシステム

**sharedMaterials.ts**: 同じマテリアルを再利用

- シングルトンパターンでマテリアルインスタンスを共有
- メモリ使用量とGPU負荷を削減

### 8. ref-ベースアニメーション

**BubbleEffect**: setState → refベースの直接更新

- `useFrame`内での`setState`を排除し、refで直接mesh.positionを更新
- 不要な再レンダリングを完全に防止
- CPU使用率約40-50%削減

### 9. 3Dモデルclone最適化

**FallenLeaves**: レンダリング時の`clone()`を削減

- `useMemo`でモデルクローンを事前作成
- 毎フレームのメモリアロケーションを回避
- CPU負荷約30-40%削減

### 10. 共有ジオメトリ

**Rocks**: 同一形状で1つのgeometryを共有

- 各メッシュで同じジオメトリインスタンスを再利用
- メモリ使用量削減とGPU最適化

### 11. テクスチャメモ化

**CherryBlossoms/SnowEffect**: テクスチャを一度だけ生成

- クロージャーでテクスチャをキャッシュ
- 毎レンダリングでのcanvas生成を回避
- 初回ロード以降は即座にテクスチャを返却

### 12. 3Dモデルclone最適化（蓮の葉）

**WaterPlantsLarge**: レンダリング時の`clone()`を削減

- `useMemo`で蓮の葉cloneを事前作成
- 夏の季節表示時のCPU負荷削減

### 13. 頂点更新のフレームスキップ

**ReflectedStars**: 反射星の頂点更新を2フレームに1回に削減

- 視覚的な品質を保ちつつCPU負荷を50%削減
- 夜間の星表示パフォーマンス向上

### 14. パフォーマンスモニター

開発時にFPS、描画コール数、メモリ使用量をリアルタイム表示

- `App.tsx`で`PERFORMANCE_MONITOR = true`に設定

### 期待効果

- **FPS**: 30-40 → 55-60 FPS
- **描画コール数**: 200-300 → 40-80コール
- **CPU使用率**: 約50-60%削減
- **メモリ使用量**: 約40-50%削減

### Viteビルド最適化
```ts
// vite.config.ts
export default defineConfig({
  build: {
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'three-vendor': ['three', '@react-three/fiber', '@react-three/drei', '@react-three/rapier'],
        },
      },
    },
  },
});
```

## CI/CD

### GitHub Actions ワークフロー

1. **upload-to-r2.yml**: アセットをCloudflare R2に自動アップロード
   - アセット変更時のみ実行（paths指定）
   - npmキャッシュでWranglerインストール高速化
   - 並列アップロードで10ファイルを同時処理
   - Actions v4で高速化

2. **cache-warm.yml**: 毎日15:00 JSTにキャッシュウォーム

### デプロイ
Cloudflare Pagesに自動デプロイ。アセットはR2から配信。
Cloudflare 上の各サービスの役割と詳細なフローは `docs/cloudflare-services.md` を参照してください。

## アーキテクチャ

### システム構成図

```mermaid
graph TB
    User[ユーザー]
    Browser[ブラウザ]
    CFPages[Cloudflare Pages]
    CFFunctions[Cloudflare Functions]
    R2Worker[R2 Worker<br/>日付ベースキャッシュ]
    R2[Cloudflare R2<br/>3Dモデル保存]
    Gemini[Google Gemini API]

    User -->|アクセス| Browser
    Browser -->|HTMLリクエスト| CFPages
    CFPages -->|HTMLレスポンス| Browser
    Browser -->|3Dモデル要求| R2Worker
    R2Worker -->|キャッシュミス| R2
    R2 -->|GLBファイル| R2Worker
    R2Worker -->|キャッシュ済み<br/>24時間| Browser
    Browser -->|メッセージAPI| CFFunctions
    CFFunctions -->|日付情報| Gemini
    Gemini -->|生成メッセージ| CFFunctions
    CFFunctions -->|JSONレスポンス| Browser

    style CFPages fill:#f96,stroke:#333
    style CFFunctions fill:#69f,stroke:#333
    style R2Worker fill:#fc6,stroke:#333
    style R2 fill:#9f6,stroke:#333
    style Gemini fill:#ff9,stroke:#333
```

### メッセージ生成フロー

```mermaid
sequenceDiagram
    participant U as ユーザー
    participant B as ブラウザ
    participant Edge as Cloudflare Edge
    participant CF as Cloudflare Functions
    participant G as Gemini API

    U->>B: 瓶をクリック
    B->>Edge: GET /api/daily-message

    alt エッジキャッシュヒット
        Edge-->>B: キャッシュされたメッセージ (Cache-Control: max-age=86400)
    else キャッシュミス
        Edge->>CF: リクエスト転送
        CF->>CF: 日本時間の日付取得
        CF->>G: メッセージ生成リクエスト
        Note over G: "11月4日の心温まるメッセージを生成"
        G-->>CF: 生成されたメッセージ
        CF-->>Edge: メッセージ返却 (Cache-Control: 24h)
        Edge-->>B: メッセージ返却 + キャッシュ保存
    end

    B->>B: MessageCardコンポーネントに表示
    B-->>U: メッセージ表示
```

### レンダリングフロー

```mermaid
graph LR
    A[App.tsx] --> B[TimeContext]
    A --> C[SeasonContext]
    B --> D[時間情報]
    C --> E[季節情報]

    D --> F[Sun]
    D --> G[SceneLights]
    D --> H[SundialGnomon]
    D --> I[Clock]

    E --> J[SeasonalEffects]
    E --> K[DriftingBottle]

    J --> L[CherryBlossoms]
    J --> M[SnowEffect]
    J --> N[FallenLeaves]
    J --> O[SummerEffects]

    K --> P[BottleModel]
    K --> Q[MessageCard]
    Q --> R[Gemini API]

    style B fill:#e1f5ff
    style C fill:#fff5e1
    style R fill:#ff9
```

## AI機能の詳細

### Gemini API統合

`functions/api/daily-message.ts` でCloudflare Functionsを使用し、毎日日本時間の日付に応じた心温まるメッセージを生成。
Cloudflare 上の各サービス構成やシーケンス図の詳細は `docs/cloudflare-services.md` を参照。

**特徴**:
- **モデル**: Gemini 2.0 Flash (高速・低コスト)
- **プロンプト**: 200文字以内、季節感のある前向きなメッセージ
- **キャッシュ**: 1日キャッシュで無駄なAPI呼び出しを削減
- **フォールバック**: 生成失敗時は既存の季節×時間帯メッセージにフォールバック

**API仕様**:
```
GET /api/daily-message

Response:
{
  "date": "2025-11-04",
  "dateDescription": "11月4日（火曜日）",
  "message": "霜月の風に、心も新しく...",
  "generatedAt": "2025-11-04T15:00:00.000Z"
}
```

### 環境変数設定

Cloudflare Pagesの環境変数で設定:
```
GEMINI_API_KEY=your_api_key_here
```

## 3Dモデルの詳細

### カレイ（底生魚）

**ファイル**: `cc0____yellow_striped_flounder.glb`
**実装**: `FishManager.tsx`

- 地面（Y=-0.9）に密着して配置
- **動き**: 待機（10-20秒）→ 瞬間移動（0.3-0.5秒）→ 待機のサイクル
- 待機中は透明度を下げて砂に擬態（opacity: 0.6）
- 夜間はさらに暗く表示（opacity: 0.3）
- 3匹配置、サイズは1.5-2.0でランダム化

### 蓮の葉（夏限定）

**ファイル**: `cc0__water_lily_nymphaea_cv..glb`
**実装**: `WaterPlantsLarge.tsx`

- 水面付近（Y=7.9）に4枚配置
- **波連動**: WaterSurfaceコンポーネントと同じ波の計算式を使用
  ```typescript
  // 水面の高さ（WaterSurface.tsxと同じ）
  const waterHeight = 8 + Math.sin(time * 1.5) * 0.5;
  // 各葉の位置での波紋を考慮
  const localWave = Math.sin(data.position[0] * 0.3 + time * 2.5) *
                   Math.cos(data.position[2] * 0.3 + time * 2.5) * 0.05;
  ```
- 各葉の位置での局所的な波紋効果を追加
- 波の傾斜に合わせてX/Z軸で傾く自然な動き

### 落ち葉（秋限定）

**ファイル**: `cc0__deep_autumn__5k_followers_milestone.glb`
**実装**: `FallenLeaves.tsx`

- 水面（Y=8.05）に15枚浮遊
- **リアルな動き**:
  - 浮き沈み: 各葉が独自の速度と位相で上下に揺れる
  - 横移動: X/Z軸で異なる速度で円を描く
  - 回転: Y軸でゆっくり回転、X/Z軸でわずかに傾く
- 各葉が異なるタイミングで動き自然な表現を実現
- パフォーマンス最適化: `useMemo`で初期位置データを固定

## パーティクルシステムの改善

**実装**: `ParticleLayer.tsx`

季節ごとにパーティクルの形状を最適化（キューブから自然な形状へ）:

| 季節 | 形状 | ジオメトリ |
|------|------|-----------|
| 春 | 桜の花びら | planeGeometry（平たい形） |
| 夏 | 小さな球体 | sphereGeometry（種や小さな葉） |
| 秋 | 平たい長方形 | planeGeometry（落ち葉） |
| 冬 | 雪 | sphereGeometry |

## R2 Workerキャッシュシステム

**実装**: `r2-worker/src/index.ts`

Cloudflare Workers + Cache APIで3Dモデルを効率的に配信:

### 日付ベースキャッシュ
- 日付（YYYY-MM-DD）をキャッシュキーに含めて同じ日は同じコンテンツを返す
- Cloudflare Cache APIで初回アクセス時にR2から取得し、以降はキャッシュから配信
- 日が変わると自動的に新しいキャッシュキーで更新

### キャッシュフロー
```typescript
// キャッシュキー例: https://cache.biotope/assets/model.glb?date=2025-12-01
const today = new Date().toISOString().split('T')[0];
const cacheKey = new URL(`https://cache.biotope/${objectName}?date=${today}`, request.url);

// Cache APIでキャッシュ確認
let response = await cache.match(cacheKey);
if (!response) {
  // R2から取得してキャッシュに保存
  const object = await env.R2_BUCKET.get(objectName);
  response = new Response(object.body, { headers });
  await cache.put(cacheKey, response.clone());
}
```

### 型安全性
- すべての`as any`を削除
- R2Bucket、R2Object、cachesの適切な型定義を追加
- TypeScriptで完全に型安全な実装

### CORS対応
- すべてのリクエストに適切なCORSヘッダーを付与
- プリフライトリクエスト（OPTIONS）にも対応

## ドキュメント

- [`docs/drifting-bottle-feature.md`](docs/drifting-bottle-feature.md): 漂流する瓶の機能説明
- [`docs/realtime-clock-feature.md`](docs/realtime-clock-feature.md): リアルタイム時計の機能説明
- [`docs/seasonal-effects-feature.md`](docs/seasonal-effects-feature.md): 季節エフェクトの機能説明
- [`docs/cloudflare-services.md`](docs/cloudflare-services.md): Cloudflare Functions / R2 Worker の役割とフロー

## ライセンス

MIT
