# 用語集 - Biotopeプロジェクト

このドキュメントは、Biotopeプロジェクト固有の技術用語とドメイン用語を定義します。

---

## プロジェクト固有の用語

### Biotope（ビオトープ）
生物が自然に生息できる環境を再現したエコシステム。このプロジェクトでは3Dシミュレーションとして実装。

### トークンベースデザイン
デザインシステムの手法の一つ。色、スペーシング、タイポグラフィなどの値を定数（トークン）として管理し、一貫性を保つ。Biotopeでは`src/constants/`配下で厳密に管理。

### 定数ファイル
マジックナンバーを排除し、すべての数値・設定を定数化したファイル群。`src/constants/`配下に配置し、`UPPER_SNAKE_CASE`で命名。

---

## 技術用語

### Three.js関連

#### InstancedMesh
同じジオメトリとマテリアルを持つ大量のオブジェクトを効率的に描画する手法。個別の`<mesh>`より大幅にパフォーマンスが向上。

**使用例**:
- パーティクルシステム（雪、桜、落ち葉）
- 魚の群れ
- 泡エフェクト

#### useFrame
React Three Fiberのフック。毎フレーム（60fps）実行される関数を登録。アニメーションやオブジェクトの更新に使用。

**注意**: `useFrame`内で`setState`を呼ぶと再レンダリングが発生し、パフォーマンスが低下する。

#### useThrottledFrame
Biotopeプロジェクトで実装されたカスタムフック。`useFrame`の実行頻度を制限（例: 30fps）し、重い処理のパフォーマンスを改善。

**使用例**:
```typescript
useThrottledFrame((delta) => {
  // 30fpsで実行される処理
}, 1000 / 30); // 約33ms間隔
```

#### GLTF / GLB
3Dモデルのファイル形式。GLTFはJSON + 外部ファイル、GLBはバイナリ形式（単一ファイル）。Biotopeでは主にGLBを使用。

#### BoxHelper
Three.jsのデバッグツール。オブジェクトのバウンディングボックスを可視化し、位置やサイズを確認できる。

---

### React関連

#### useMemo
Reactのフック。重い計算結果をキャッシュし、依存配列が変わらない限り再計算しない。

**Biotopeでの使用例**:
- パーティクルの初期位置計算
- 3Dモデルのクローン生成
- マテリアルの生成

#### React.memo
Reactのコンポーネントメモ化。propsが変わらない限り再レンダリングをスキップ。

**Biotopeでの使用**:
- すべての季節エフェクトコンポーネント
- パフォーマンス重視のコンポーネント

#### ref
Reactで直接DOMやThree.jsオブジェクトにアクセスするための仕組み。`useState`と異なり、値の変更が再レンダリングを引き起こさない。

**Biotopeでの重要性**:
- `useFrame`内でのオブジェクト更新は必ずrefを使用
- 再レンダリングを避けることでパフォーマンスを維持

---

### Cloudflare関連

#### Cloudflare Pages
静的サイトホスティングサービス。GitHubと連携し、コミット時に自動デプロイ。Biotopeのフロントエンドをホスト。

#### Cloudflare R2
オブジェクトストレージサービス。S3互換。Biotopeでは3Dモデル（.glbファイル）の配信に使用。

**メリット**:
- エグレス料金無料
- 高速配信
- GitHub Actionsで自動アップロード

#### Cloudflare KV
Key-Valueストレージ。エッジで高速にアクセス可能。Biotopeでは日替わりメッセージのキャッシュに使用。

**特徴**:
- TTL（有効期限）設定が可能
- `expirationTtl`で自動削除

#### Cloudflare Workers AI
Cloudflareのエッジで動作するAI推論サービス。Biotopeでは日替わりメッセージの生成に使用。

**使用モデル**:
- `@cf/meta/llama-3.1-8b-instruct`

#### Cloudflare Functions
Cloudflare Pages上で動作するサーバーレス関数。`functions/`配下に配置。

**Biotopeでの使用**:
- `/api/daily-message`: 日替わりメッセージAPI

**型定義**:
```typescript
interface Env {
  GEMINI_API_KEY: string;
  DAILY_MESSAGE_CACHE: KVNamespace;
}
```

#### Gemini API
GoogleのAI APIサービス。Biotopeでは日替わりメッセージの生成に使用。

**使用モデル**:
- `gemini-2.5-flash`: 最新の推奨モデル（高速・高品質）

**重要な特徴**:
- **思考プロセス（Thoughts）**: gemini-2.5-flashは内部的に思考プロセスを使用
- **thoughtsTokenCount**: 生成時に500-1000トークンを思考に消費
- **maxOutputTokens設定**: 思考プロセス分を考慮して大きめに設定（2000推奨）

**注意点**:
- `gemini-1.5-flash`は存在しない（404エラー）
- `maxOutputTokens`が小さいとメッセージが途中で切れる（finishReason: "MAX_TOKENS"）

---

### TypeScript関連

#### as const
TypeScriptの型アサーション。オブジェクトや配列を読み取り専用のリテラル型に変換。

**Biotopeでの使用**:
```typescript
export const FISH_SPEED = {
  SPRING: 0.015,
  SUMMER: 0.02,
} as const;
```

#### 型アノテーション
変数や関数の型を明示的に指定する構文。`as`アサーションより型安全性が高い。

**推奨**:
```typescript
const matrix: THREE.Matrix4 = new THREE.Matrix4();
```

**非推奨**:
```typescript
const matrix = new THREE.Matrix4() as THREE.Matrix4;
```

---

## 開発フロー関連

### セッションディレクトリ
`tmp/XXX_feature-name/`形式のディレクトリ。各開発タスクごとに作成し、計画（plan.md）と履歴（prompt.md）を記録。

**命名規則**:
- `tmp/{連番}_{機能名}/`
- 例: `tmp/001_rain-effect/`, `tmp/002_star-constellation/`

### plan.md
実装計画を記録するマークダウンファイル。セッション開始時に作成し、ユーザーの承認を得てから実装開始。

### prompt.md
AIとのやりとり履歴を記録するファイル。ユーザーからの指示、作業内容、課題を時系列で記録。

---

## パフォーマンス関連

### FPS（Frames Per Second）
1秒あたりのフレーム数。Biotopeでは60FPSを目標とし、常にパフォーマンスモニタリングを実施。

### 描画コール（Draw Calls）
GPUへの描画命令の回数。少ないほど高速。InstancedMeshで削減可能。

### ジオメトリ共有
同じ形状のオブジェクトで1つのジオメトリを再利用する手法。メモリとパフォーマンスの最適化。

### マテリアル共有
同じ見た目のオブジェクトで1つのマテリアルを再利用する手法。描画コールの削減に貢献。

---

## デザイン関連

### 季節エフェクト
春・夏・秋・冬の季節ごとに表示されるビジュアルエフェクト。

**実装例**:
- 春: 桜の花びら
- 夏: 蓮の葉
- 秋: 落ち葉
- 冬: 雪

### 昼夜サイクル
ゲーム内時間に応じて変化する照明と環境。リアルタイムで計算され、`isDay`フラグで判定。

---

## 参考

このドキュメントは継続的に更新されます。新しい用語や概念が追加された場合は、`/update-ai-guide`コマンドで自動的に反映されます。
