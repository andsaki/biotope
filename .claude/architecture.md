# システムアーキテクチャ

## 全体構成

```
┌─────────────┐
│   ユーザー   │
└──────┬──────┘
       │
       ↓
┌─────────────────────────────────────┐
│         ブラウザ                     │
│  ┌──────────────────────────────┐  │
│  │   React App (Three.js)       │  │
│  │  - 3D ビオトープ環境          │  │
│  │  - リアルタイム時計           │  │
│  │  - 季節エフェクト             │  │
│  └──────────────────────────────┘  │
└───┬──────────────────────────┬──────┘
    │                          │
    ↓                          ↓
┌────────────────┐    ┌─────────────────┐
│ Cloudflare R2  │    │ Cloudflare Pages │
│  (アセット)     │    │  (HTML/JS/CSS)   │
└────────────────┘    └────────┬─────────┘
                               │
                               ↓
                    ┌──────────────────────┐
                    │ Cloudflare Functions │
                    │  /api/daily-message  │
                    └──────────┬───────────┘
                               │
                               ↓
                    ┌──────────────────────┐
                    │   Gemini 2.0 Flash   │
                    │  (AI メッセージ生成)  │
                    └──────────────────────┘
```

## データフロー

### 1. ページロード
```
User → Browser → Cloudflare Pages (HTML)
                 ↓
              Cloudflare R2 (アセット)
                 ↓
              Browser (React起動)
```

### 2. AI メッセージ取得
```
User clicks bottle
  ↓
Browser → Cloudflare Edge
  ↓
Cache Check?
  ├─ HIT  → Return cached (24h TTL)
  └─ MISS → Cloudflare Functions
              ↓
            Gemini API (生成)
              ↓
            Edge Cache (保存 24h)
              ↓
            Browser (表示)
```

### 3. リアルタイム更新
```
useRealTime Hook (1秒ごと)
  ↓
TimeContext (時間情報配信)
  ├─ Sun (太陽位置)
  ├─ SceneLights (照明)
  ├─ SundialGnomon (日時計)
  └─ Clock (時計表示)

SeasonContext (季節判定)
  ├─ SeasonalEffects
  │   ├─ CherryBlossoms (春)
  │   ├─ SummerEffects (夏)
  │   ├─ FallenLeaves (秋)
  │   └─ SnowEffect (冬)
  └─ DriftingBottle (季節別メッセージ)
```

## キャッシュ戦略

### ブラウザキャッシュ
- 静的アセット: R2から配信、長期キャッシュ
- HTML/JS/CSS: Cloudflare Pagesから配信

### エッジキャッシュ
- AI生成メッセージ: 24時間 TTL
- Cache-Control: `public, max-age=86400`

### メモリキャッシュ
- React.memo: コンポーネントの再レンダリング防止
- useMemo: 計算結果のキャッシュ
- useCallback: 関数のメモ化

## Cloudflare Functions 詳細

### エントリーポイント
```typescript
// functions/api/daily-message.ts
export const onRequest = async (context: EventContext<Env, string, Record<string, unknown>>) => {
  // 処理
}
```

### 実行環境
- **ランタイム**: Cloudflare Workers (V8 Isolate)
- **NOT Lambda**: AWS Lambdaではない
- **エッジ実行**: 世界中のエッジロケーションで実行
- **コールドスタート**: ほぼゼロ（V8 Isolate）

### 環境変数
```typescript
interface Env {
  GEMINI_API_KEY: string;
}

// アクセス方法
const apiKey = context.env.GEMINI_API_KEY;
```

### レスポンス形式
```typescript
return new Response(
  JSON.stringify({ message: "..." }),
  {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=86400',
      'Access-Control-Allow-Origin': '*',
    },
  }
);
```

## Three.js レンダリングパイプライン

```
Canvas (React Three Fiber)
  ↓
Scene Setup
  ├─ PerspectiveCamera
  ├─ OrbitControls
  └─ Lighting System
      ├─ AmbientLight
      ├─ DirectionalLight (Sun)
      └─ HemisphereLight
  ↓
3D Objects
  ├─ Ground (地面)
  ├─ WaterSurface (水面)
  ├─ Pond (池)
  ├─ FishManager (魚)
  ├─ BottleModel (瓶)
  ├─ Sun (太陽)
  └─ Seasonal Effects (季節エフェクト)
  ↓
Post Processing
  ├─ Fog (霧)
  └─ Tone Mapping
  ↓
Render to Canvas
```

## パフォーマンス最適化戦略

### 1. コード分割
```typescript
const DriftingBottle = lazy(() => import('./components/DriftingBottle'));
const SeasonalEffects = lazy(() => import('./components/SeasonalEffects'));
```

### 2. レンダリング最適化
- 60fps維持のため、重い処理を分散
- パーティクルの更新頻度制限（2フレームに1回）
- 魚の移動計算は ref で管理（再レンダリング回避）

### 3. バンドルサイズ最適化
```typescript
manualChunks: {
  'react-vendor': ['react', 'react-dom'],           // ~140KB
  'three-vendor': ['three', '@react-three/fiber', ...], // ~600KB
}
```

### 4. ネットワーク最適化
- R2でアセット配信（エッジから高速配信）
- 画像最適化（適切なサイズとフォーマット）
- API レスポンスを24時間キャッシュ

## セキュリティ

### CORS設定
```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};
```

### 環境変数
- `GEMINI_API_KEY`: Cloudflare Pages の環境変数で管理
- コードにハードコードしない
- クライアント側には露出しない（Functions内でのみ使用）

## デプロイフロー

```
Git Push
  ↓
GitHub Actions
  ├─ Build (npm run build)
  ├─ Upload Assets to R2
  └─ Deploy to Cloudflare Pages
      ↓
    Cloudflare Edge
      ├─ Pages (静的ファイル)
      ├─ Functions (API)
      └─ R2 (アセット)
```

## モニタリング

### 推奨モニタリング項目
- Cloudflare Analytics (トラフィック、キャッシュヒット率)
- Functions実行時間・エラー率
- Gemini API使用量・コスト
- ブラウザコンソールエラー
- Core Web Vitals (LCP, FID, CLS)
