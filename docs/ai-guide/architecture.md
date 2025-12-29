# アーキテクチャ - Biotopeプロジェクト

このドキュメントでは、Biotopeプロジェクトの設計方針、アーキテクチャパターン、ベストプラクティスを説明します。

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

Biotopeプロジェクトでは、AIアシスタントと効率的に協働するために以下の方針を採用しています。

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
