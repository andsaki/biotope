# アーキテクチャ - 水辺の四季プロジェクト

このドキュメントでは、水辺の四季プロジェクトの設計方針、アーキテクチャパターン、ベストプラクティスを説明します。

---

## プロジェクト概要

### 技術スタック

BioTope は React + TypeScript + Three.js で構築された 3D ビオトープシミュレーションです。

- **フロントエンド**: React 19、TypeScript、Three.js (React Three Fiber)
- **ビルドツール**: Vite
- **デプロイ**: Cloudflare Pages
- **インフラ**: Cloudflare R2 (3Dモデル配信)、KV (キャッシュ)、Workers AI (メッセージ生成)

### パフォーマンス目標

- **60FPS維持**: すべてのビジュアルエフェクトで60fpsを目標
- **描画コール削減**: InstancedMeshによる最適化
- **メモリ効率**: ジオメトリ・マテリアルの共有

---

## AI開発の基本方針

水辺の四季プロジェクトでは、AIアシスタントと効率的に協働するために以下の方針を採用しています。

### 1. 段階的な実装

大きな機能は小さなステップに分割し、各ステップで動作確認を行います。

**理由**:
- デバッグが容易
- 問題の早期発見
- プロジェクトの複雑性を管理

### 2. 既存パターンの踏襲

新しいコードは既存のパターンを踏襲し、一貫性を保ちます。

**重要な規則**:
- `src/constants/`の命名規則（`UPPER_SNAKE_CASE`）
- コンポーネント構造（React.memo、refベースのアニメーション）
- ファイル配置（機能ごとに定数ファイルを作成）
- **デザインパターン**: ガラスモーフィズムの統一適用

### 3. パフォーマンス優先

新機能追加時も60FPS維持を最優先します。

**チェック項目**:
- `PERFORMANCE_MONITOR = true`で確認
- FPS が 55-60 を維持するか検証
- 描画コールが増加していないか確認

### 4. 型安全性

TypeScriptの型推論を最大限活用し、`any`は避けます。

**方針**:
- 型アノテーションを優先（`as`アサーション回避）
- `as const`で定数の型を固定
- 厳密な型定義を行う

### 5. デザインの一貫性

**重要**: 水辺の四季プロジェクトは独自の美的方向性を持ちます。

**デザイン原則**:
- **水のコンテキスト**: 紙ではなく水/ガラスの質感
- **ガラスモーフィズム**: 半透明、blur、多層シャドウ
- **アンチパターンの排除**: ジェネリックな「AI生成っぽい」デザインを避ける
- **没入感の重視**: リアリティ > パフォーマンス（視覚品質を優先）

**参照**:
- `docs/design-guide.md`: 水辺の四季専用デザインガイド
- `docs/ai-guide/glossary.md`: デザインアンチパターン

---

## アーキテクチャパターン

### 1. 定数管理の徹底

**原則**: すべてのマジックナンバーを定数化

#### 定数ファイルの命名規則

```typescript
// ❌ 悪い例
const fishCount = 10;
const speed = 0.015;

// ✅ 良い例
export const NORMAL_FISH_COUNT = 10;
export const FISH_SPEED = {
  SPRING: 0.015,
  SUMMER: 0.02,
  AUTUMN: 0.01,
  WINTER: 0.005,
} as const;
```

**ルール**:
- `UPPER_SNAKE_CASE` で統一
- 意味が明確な名前を使用
- `as const` で読み取り専用にする

#### 定数ファイルの配置

新しいコンポーネントを作成する際は、対応する定数ファイルも作成：

```
src/
├── components/
│   └── NewEffect.tsx          # 新しいエフェクト
├── constants/
│   └── newEffect.ts            # 対応する定数ファイル
```

### 2. コンテキストの分割

不要な再レンダリングを防ぐため、コンテキストは用途別に分割：

```typescript
// ❌ 悪い例: すべての時間情報を1つのコンテキストに
const TimeContext = createContext({ realTime, isDay, season });

// ✅ 良い例: 用途別に分割
const DayPeriodContext = createContext({ isDay }); // 昼夜判定のみ
const ClockTimeContext = createContext({ realTime }); // 時計表示のみ
```

**メリット**:
- 必要なコンポーネントのみ再レンダリング
- パフォーマンス向上
- 依存関係の明確化

### 3. TypeScript型安全性

#### as const の活用

```typescript
// 定数オブジェクトは as const で型を固定
export const FISH_SPEED = {
  SPRING: 0.015,
  SUMMER: 0.02,
} as const;

// 型推論が効く
type Season = keyof typeof FISH_SPEED; // 'SPRING' | 'SUMMER'
```

#### 型アノテーションの推奨

```typescript
// ❌ 避けるべき: as アサーション
const matrix = new THREE.Matrix4() as THREE.Matrix4;

// ✅ 推奨: 型アノテーション
const matrix: THREE.Matrix4 = new THREE.Matrix4();

// ✅ または型推論に任せる
const matrix = new THREE.Matrix4(); // 型推論で THREE.Matrix4 になる
```

**理由**: `as`アサーションは型安全性を損なう可能性があり、型アノテーションの方が明示的で安全です。

#### 厳密な型定義

```typescript
// ❌ 悪い例
function updatePosition(pos: any) { ... }

// ✅ 良い例
function updatePosition(pos: [number, number, number]) { ... }
// または
function updatePosition(pos: THREE.Vector3) { ... }
```

---

## よくある開発パターン

### パターン1: 新しい季節エフェクトの追加

**ステップ**:

1. **定数ファイルの作成** (`src/constants/newEffect.ts`)

   ```typescript
   export const NEW_EFFECT_COUNT = 100;
   export const NEW_EFFECT_SPEED = 0.01;
   export const NEW_EFFECT_SIZE = {
     MIN: 0.1,
     MAX: 0.3,
   } as const;
   ```

2. **コンポーネントの作成** (`src/components/NewEffect.tsx`)
   - InstancedMesh を使用
   - ref ベースのアニメーション
   - React.memo でメモ化

3. **SeasonalEffects.tsxに統合**

   ```typescript
   {season === 'spring' && <NewEffect />}
   ```

4. **パフォーマンステスト**
   - `PERFORMANCE_MONITOR = true` で確認
   - FPS が 55-60 を維持するか確認

### パターン2: 3Dモデルの統合

**ステップ**:

1. **モデルファイルの配置** (`src/assets/model.glb`)

2. **R2へのアップロード** (GitHub Actionsで自動)

3. **事前ロード**

   ```typescript
   preloadModel('model.glb');
   ```

4. **コンポーネントでの利用**

   ```typescript
   const scene = useModelScene('model.glb');
   const clones = useMemo(() =>
     Array.from({ length: 5 }, () => scene.clone()),
   [scene]);
   ```

### パターン3: パフォーマンス最適化

**チェックリスト**:

- [ ] `useFrame` 内で `setState` を削除（refに置き換え）
- [ ] 重い計算を `useMemo` でキャッシュ
- [ ] コンポーネントを `React.memo` でメモ化
- [ ] InstancedMesh で描画コール削減
- [ ] ジオメトリ・マテリアルを共有
- [ ] useThrottledFrame で更新頻度を下げる（30fps）
- [ ] Three.jsオブジェクトの再利用（Color、Vector3など）

**パフォーマンス測定の手順**:

1. **PerformanceMonitorを有効化**

   ```typescript
   // src/App.tsx
   const PERFORMANCE_MONITOR = import.meta.env.DEV; // 開発モードで自動有効化
   ```

2. **ベースライン測定**

   全機能有効時の指標を記録：
   - FPS（目標: 60）
   - Draw Calls（目標: <200）
   - Triangles（目標: <10M）
   - Memory

3. **ボトルネック特定**

   コンポーネントを段階的に無効化してボトルネックを特定：
   ```typescript
   // SeasonalEffects全体を無効化
   // {season && <SeasonalEffects />}

   // 個別エフェクトを無効化
   // {season === 'winter' && <SnowEffect />}
   ```

4. **最適化実施**

   ボトルネックに対して以下の手法を適用：
   - 高ポリゴンモデルの簡略化（Blenderなど）
   - パーティクル化（3Dモデル → PlaneGeometry + テクスチャ）
   - LOD（Level of Detail）の導入
   - 表示数の削減

5. **視覚品質の確認**

   **重要**: パフォーマンス改善が視覚品質を損なう場合は採用しない
   - ビオトープはリアリティが重要
   - ペラペラのテクスチャは没入感を損なう
   - 視覚品質 > パフォーマンス の優先順位

**実例: 落ち葉の最適化検証（2025-12-31）**

| 手法 | Triangle数 | 視覚品質 | 採用 |
|------|-----------|---------|------|
| 元の3Dモデル（leaf.glb） | 11,520,000 | 高品質 | ✅ 採用 |
| PlaneGeometry + テクスチャ | 30 | 不自然（板状） | ❌ 却下 |

**結論**: Triangle数を99.9997%削減できたが、視覚品質の低下が著しく却下。パフォーマンスより体験を優先。

### パターン8: Three.jsオブジェクトの再利用でGC負荷削減

**目的**: 毎フレーム新しいオブジェクトを作成するとGCが頻繁に発生し、パフォーマンスが低下する

**実装手順**:

1. **Color オブジェクトの再利用**

   ```typescript
   // ❌ 悪い例: 毎フレーム新しいColorを作成
   useFrame(() => {
     light.color = new THREE.Color(0xffffff); // GCの原因
   });

   // ✅ 良い例: useRefで保持して.set()で再利用
   const colorRef = useRef(new THREE.Color());
   useFrame(() => {
     light.color = colorRef.current.set(0xffffff); // オブジェクト再利用
   });
   ```

2. **Vector3 オブジェクトの再利用**

   ```typescript
   // ❌ 悪い例: 毎フレーム新しいVector3を作成
   useFrame(() => {
     mesh.position.copy(new THREE.Vector3(x, y, z));
   });

   // ✅ 良い例: useRefで保持して.set()で再利用
   const positionRef = useRef(new THREE.Vector3());
   useFrame(() => {
     mesh.position.copy(positionRef.current.set(x, y, z));
   });
   ```

3. **ジオメトリの共有**

   ```typescript
   // ❌ 悪い例: 同じジオメトリを複数回作成
   <mesh><circleGeometry args={[5, 32]} /></mesh>
   <mesh><circleGeometry args={[5, 32]} /></mesh>

   // ✅ 良い例: useMemoで1つだけ作成して共有
   const geometry = useMemo(() => new THREE.CircleGeometry(5, 32), []);
   <mesh geometry={geometry} />
   <mesh geometry={geometry} />
   ```

**期待効果**:
- GC負荷削減: 毎フレームのオブジェクト生成がなくなる
- CPU使用率: 5-10%削減
- フレームレート安定性: GCによるスパイクが減少

**適用箇所**:
- LightingController.tsx: Color オブジェクト再利用
- Pond.tsx: CircleGeometry 共有
- WaterPlantsLarge.tsx: CylinderGeometry 共有

**参考実装**:
- tmp/008_performance-improvement/plan.md
- src/components/LightingController.tsx:39-42

### パターン4: Cloudflare KVを使った日次キャッシュ

**ステップ**:

1. **KV namespaceの設定** (`wrangler.toml`)

   ```toml
   [[kv_namespaces]]
   binding = "KV"
   id = "your-kv-id"
   preview_id = "your-preview-kv-id"
   ```

2. **Cloudflare Functionの作成** (`functions/api/endpoint.ts`)

   ```typescript
   export const onRequest: PagesFunction<Env> = async (context) => {
     const { KV } = context.env;
     const today = new Date().toISOString().split('T')[0];
     const cacheKey = `data:${today}`;

     // キャッシュチェック
     const cached = await KV.get(cacheKey);
     if (cached) {
       return new Response(cached, {
         headers: { 'Content-Type': 'application/json' },
       });
     }

     // 新規生成
     const result = await generateData();
     await KV.put(cacheKey, JSON.stringify(result), {
       expirationTtl: 86400, // 24時間
     });

     return new Response(JSON.stringify(result));
   };
   ```

3. **型定義** (`functions/types.ts`)

   ```typescript
   export interface Env {
     KV: KVNamespace;
     AI: Ai;
   }
   ```

4. **ローカルテスト**

   ```bash
   npm run preview  # wrangler pages dev
   ```

### パターン5: 3Dモデルの初期位置設定

**課題**: 3Dモデルが読み込み後に意図しない位置に配置される

**解決策**:

1. **useEffectで初期位置を確実に設定**

   ```typescript
   const fishRef = useRef<THREE.Group>(null);

   useEffect(() => {
     if (fishRef.current) {
       fishRef.current.position.set(x, y, z);
       fishRef.current.rotation.set(rx, ry, rz);
       console.log('Initial position set:', fishRef.current.position);
     }
   }, [x, y, z, rx, ry, rz]);
   ```

2. **定数ファイルで位置を管理**

   ```typescript
   // src/constants/fish.ts
   export const FLOUNDER_Y_POSITION = -0.9; // 地面に密着
   export const FLOUNDER_INITIAL_POSITION: [number, number, number] = [
     0,
     FLOUNDER_Y_POSITION,
     0
   ];
   ```

3. **デバッグ手法**

   ```typescript
   // Three.js BoxHelperで可視化
   import { BoxHelper } from 'three';

   useEffect(() => {
     if (fishRef.current) {
       const box = new BoxHelper(fishRef.current, 0xff0000);
       scene.add(box);
     }
   }, [scene]);
   ```

### パターン6: ガラスモーフィズムUIの実装

**目的**: 統一感のある半透明UIを実装

**実装手順**:

1. **基本スタイルの定義**

   ```typescript
   const glassStyle = {
     background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0.06))',
     backdropFilter: 'blur(20px) saturate(180%)',
     WebkitBackdropFilter: 'blur(20px) saturate(180%)',
     border: '1px solid rgba(255, 255, 255, 0.18)',
     borderRadius: '16px',
     boxShadow: `
       0 8px 32px rgba(0, 0, 0, 0.4),
       inset 0 1px 0 rgba(255, 255, 255, 0.3),
       inset 0 -1px 0 rgba(0, 0, 0, 0.2)
     `,
   };
   ```

2. **hoverステートの追加**

   ```typescript
   const [isHovered, setIsHovered] = useState(false);

   const hoverStyle = isHovered ? {
     background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.22), rgba(255, 255, 255, 0.12))',
     transform: 'scale(1.05) translateY(-2px)',
     boxShadow: '0 12px 40px rgba(0, 0, 0, 0.5)',
   } : {};
   ```

3. **テキストの視認性確保**

   ```typescript
   const textStyle = {
     color: 'rgba(255, 255, 255, 0.95)',
     textShadow: '0 2px 4px rgba(0, 0, 0, 0.4)',
     fontWeight: 500,
   };
   ```

**注意点**:
- `backdrop-filter`はパフォーマンスに影響するため、必要最小限に
- モバイルでは`-webkit-backdrop-filter`も併記
- 夜間シーンでは特に視認性が重要

**適用箇所**:
- UIパネル（`src/components/UI.tsx`）
- 風向きコンパス（`src/components/WindDirectionDisplay.tsx`）
- ボタン類

**参考**:
- `docs/design-guide.md`: ガラスモーフィズムの詳細仕様

### パターン7: ローディング進捗の追跡

**目的**: Three.jsのアセット読み込み状況をリアルタイムで表示

**実装手順**:

1. **LoadingTrackerコンポーネントをCanvas内に配置**

   ```typescript
   // src/App.tsx
   const LoadingTracker = ({
     onLoaded,
     onProgress
   }: {
     onLoaded: () => void;
     onProgress: (progress: number, loadingText: string) => void;
   }) => {
     const { active, progress, loaded, total } = useProgress();

     useEffect(() => {
       if (active) {
         const percentComplete = (loaded / total) * 100;
         const text = `3Dモデルを読み込み中... (${loaded}/${total})`;
         onProgress(percentComplete, text);
       } else {
         onProgress(100, "完了");
         onLoaded();
       }
     }, [active, progress, loaded, total, onLoaded, onProgress]);

     return null;
   };
   ```

2. **親コンポーネントで進捗状態を管理**

   ```typescript
   const [loadingProgress, setLoadingProgress] = useState(0);
   const [loadingText, setLoadingText] = useState("初期化中...");

   const handleProgress = useCallback((progress: number, text: string) => {
     setLoadingProgress(progress);
     setLoadingText(text);
   }, []);
   ```

3. **Loaderコンポーネントにpropsを渡す**

   ```typescript
   {isLoading && <Loader progress={loadingProgress} loadingText={loadingText} />}
   ```

4. **CSS Modulesでスタイル管理**

   ```css
   /* Loader.module.css */
   .progressContainer {
     display: flex;
     flex-direction: column;
     align-items: center;
     gap: 12px;
   }

   .percentage {
     font-size: clamp(32px, 5vw, 48px);
     background: linear-gradient(135deg, #ffffff 0%, #8ec6d9 100%);
     background-clip: text;
     -webkit-background-clip: text;
     color: transparent;
   }

   .progressBar {
     width: 200px;
     height: 3px;
     background: rgba(142, 202, 230, 0.2);
   }

   .progressBarFill {
     height: 100%;
     background: linear-gradient(90deg, #8ec6d9, #b8dde8, #ffffff);
     transition: width 0.3s ease-out;
   }
   ```

**重要な注意点**:
- `useProgress`はCanvas内でのみ使用可能
- Canvas外で使用するとエラーが発生
- LoadingTrackerをCanvas内に配置する必要がある
- 進捗状態はCanvas外の親コンポーネントで管理

**適用箇所**:
- src/App.tsx（LoadingTracker）
- src/components/Loader.tsx（パーセンテージ表示）
- src/components/Loader.module.css（スタイル）

**参考**:
- docs/ai-guide/feature.md の「ローディングインジケーター（進捗表示）の実装」

---

## Cloudflare統合パターン

### KVストレージの活用

```typescript
// Cloudflare Functions でのKV利用
export const onRequest: PagesFunction<Env> = async (context) => {
  const { KV } = context.env;

  // キャッシュキーの生成（日付ベース）
  const today = new Date().toISOString().split('T')[0];
  const cacheKey = `daily-message:${today}`;

  // キャッシュから取得
  const cached = await KV.get(cacheKey);
  if (cached) {
    return new Response(cached, {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // 新規生成してキャッシュに保存
  const result = await generateMessage();
  await KV.put(cacheKey, JSON.stringify(result), {
    expirationTtl: 86400, // 24時間
  });

  return new Response(JSON.stringify(result));
};
```

**ポイント**:
- 日付ベースのキーでキャッシュ管理
- `expirationTtl`で自動削除
- `wrangler.toml`でKV namespaceを設定

### R2ストレージとの連携

```typescript
// 環境に応じた3Dモデルの読み込み
const isDevelopment = import.meta.env.MODE === 'development';

export function useModelScene(filename: string) {
  const modelPath = isDevelopment
    ? `/assets/${filename}`           // ローカル: public/assets/
    : `https://r2.domain.com/${filename}`; // 本番: R2

  const { scene } = useGLTF(modelPath);
  return scene;
}
```

---

## プロジェクト構造

```
biotope-project/
├── src/
│   ├── components/        # Reactコンポーネント
│   ├── constants/         # 定数ファイル（トークンベース）
│   ├── contexts/          # Reactコンテキスト
│   ├── hooks/             # カスタムフック
│   ├── utils/             # ユーティリティ関数
│   └── assets/            # 3Dモデル、画像
├── functions/             # Cloudflare Functions
│   ├── api/               # APIエンドポイント
│   └── types.ts           # 型定義
├── docs/                  # ドキュメント
│   └── ai-guide/          # AI開発ガイド
│       ├── glossary.md    # 用語集
│       ├── architecture.md # アーキテクチャ
│       └── feature.md     # 機能とTips
├── tmp/                   # セッションディレクトリ（Git管理外）
└── wrangler.toml          # Cloudflare設定
```

---

## まとめ

### 開発時の心得

1. **段階的に進める**: 小さな変更を積み重ねる
2. **既存パターンを踏襲**: `src/constants/`、コンポーネント構造を維持
3. **パフォーマンスを意識**: 60FPS維持が最優先
4. **型安全性を保つ**: `any` を避け、適切な型定義を行う
5. **テストを怠らない**: 変更後は必ず動作確認

### AIとの効果的な協働

- **具体的な要件を伝える**: 曖昧な指示ではなく、明確な目標と制約を提示
- **既存コードを参照させる**: 「〇〇.tsx を参考に」と具体的なファイルを指定
- **制約を明示する**: パフォーマンス要件、命名規則、アーキテクチャパターンを伝える
- **段階的に確認**: 大きな変更は plan.md でレビューしてから実装

---

## 参考リソース

- [glossary.md](./glossary.md): 用語集
- [feature.md](./feature.md): 機能とTips
- [README.md](../../README.md): プロジェクト全体の概要
