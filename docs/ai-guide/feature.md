# 機能と開発Tips - 水辺の四季プロジェクト

このドキュメントでは、水辺の四季プロジェクトの具体的な開発Tips、効果的なプロンプト例、トラブルシューティングを説明します。

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
- src/components/Loader.module.css（CSS Modules化）
- clamp()でレスポンシブなフォントサイズ
```

### ローディングインジケーター（進捗表示）の実装

```
ローディング画面にパーセンテージインジケーターを追加してください。

要件:
- リアルタイムで0-100%の進捗を表示
- 読み込み中のアイテム数を表示（例: 11/15）
- プログレスバーで視覚的に進捗を確認
- @react-three/dreiのuseProgressフックを活用
- Three.jsのDefaultLoadingManagerも併用

実装手順:
1. **LoadingTrackerコンポーネントを拡張**

   App.tsx内でThree.jsの読み込み状況を監視：

   ```typescript
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

2. **App.tsxで進捗状態を管理**

   ```typescript
   const [loadingProgress, setLoadingProgress] = useState(0);
   const [loadingText, setLoadingText] = useState("初期化中...");

   const handleProgress = useCallback((progress: number, text: string) => {
     setLoadingProgress(progress);
     setLoadingText(text);
   }, []);

   return (
     <div className="App">
       {isLoading && <Loader progress={loadingProgress} loadingText={loadingText} />}
       <Canvas>
         <LoadingTracker onLoaded={handleAssetsLoaded} onProgress={handleProgress} />
         {/* ... */}
       </Canvas>
     </div>
   );
   ```

3. **Loaderコンポーネントにprops追加**

   ```typescript
   interface LoaderProps {
     progress?: number; // 0-100
     loadingText?: string;
   }

   const Loader = ({ progress = 0, loadingText = "読み込み中..." }: LoaderProps) => (
     <div className={styles.container}>
       {/* パーセンテージ表示 */}
       <div className={styles.progressContainer}>
         <div className={styles.percentage}>
           {Math.round(progress)}%
         </div>
         <div className={styles.loadingText}>
           {loadingText}
         </div>
         <div className={styles.progressBar}>
           <div
             className={styles.progressBarFill}
             style={{ width: `${progress}%` }}
           />
         </div>
       </div>
     </div>
   );
   ```

4. **CSS Modulesでスタイル管理**

   Loader.module.cssに420行以上のスタイルを整理：

   ```css
   .progressContainer {
     display: flex;
     flex-direction: column;
     align-items: center;
     gap: 12px;
     opacity: 0;
     animation: fadeInUp 1s ease-out 0.3s forwards;
   }

   .percentage {
     font-size: clamp(32px, 5vw, 48px);
     font-weight: 300;
     color: transparent;
     background: linear-gradient(135deg, #ffffff 0%, #b8dde8 50%, #8ec6d9 100%);
     background-clip: text;
     -webkit-background-clip: text;
     letter-spacing: 0.1em;
     text-shadow: 0 0 40px rgba(142, 202, 230, 0.8);
   }

   .progressBar {
     width: 200px;
     height: 3px;
     background: rgba(142, 202, 230, 0.2);
     border-radius: 2px;
     overflow: hidden;
   }

   .progressBarFill {
     height: 100%;
     background: linear-gradient(90deg, #8ec6d9, #b8dde8, #ffffff);
     transition: width 0.3s ease-out;
   }
   ```

技術的なポイント:
- `useProgress`はCanvas内でしか使えない（LoadingTrackerをCanvas内に配置）
- GLTFモデルの読み込み状況をリアルタイム追跡
- 完了後800ms待ってからフェードアウト
- CSS Modulesで他のコンポーネントと設計を統一

デザインのポイント:
- 深海テーマと調和したグラデーション
- グロー効果で視認性確保
- スムーズなプログレスバーアニメーション

参考実装:
- src/App.tsx（LoadingTracker）
- src/components/Loader.tsx（パーセンテージ表示）
- src/components/Loader.module.css（CSS Modules）
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

#### 例1: 短く心温まるメッセージへの改善

```
現在のメッセージが長すぎて読むのが大変です。
もっと短く、心温まる、1日に少し彩を添えるようなメッセージに変更してください。

現状の問題:
- メッセージが200文字と長い
- 瞑想的で重厚な表現
- 読むのに時間がかかる

改善要件:
- 60-80文字以内（2行程度）に短縮
- 前向きで軽やかな表現
- 心が温まる、ほっとする言葉選び
- 朝の始まりに彩を添える雰囲気

参考実装:
- functions/api/daily-message.ts の generateDailyMessage()
- プロンプトに「優しい言葉で人々を励ます詩人」ペルソナを設定
- 良い例と避けるべき表現を明示
```

**AIの実装例**:

```typescript
const prompt = `あなたは優しい言葉で人々を励ます詩人です。今日は${dateStr}です。

朝の始まりに心がほっと温まり、1日に少し彩を添えるような短いメッセージを書いてください。

【条件】
- 60-80文字以内（2行程度）
- ${dateStr}の季節の美しさを優しく描く
- 前向きで軽やかな表現
- 心が温まる、ほっとする言葉選び
- です・ます調
- メッセージのみを出力（説明や前置きは不要）

【良い例】
- 「冬の朝、温かい飲み物で一息つきませんか。小さな幸せが、あなたを待っていますよ。」（45文字）
- 「春の風が背中を押してくれます。今日も一歩ずつ、自分のペースで。」（36文字）
- 「夏の光が窓から差し込む朝。深呼吸して、新しい1日を迎えましょう。」（36文字）

【避けるべき表現】
- 長い描写や説明
- 重厚で瞑想的な表現
- 指示的・説教的な内容`;
```

**フォールバックメッセージも同じトーンに**:

```typescript
const FALLBACK_MESSAGES: Record<string, string[]> = {
  冬: [
    '{date}、冬の朝は冷たいけれど、温かさも見つかります。ゆっくりと。',
    '{date}の空気、凛として清々しい。温かいものでほっとひと息を。',
    '{date}、白い息も素敵でしょ。小さな幸せを集める1日に。',
    '{date}の朝、温もりを大切に。今日もあなたらしく輝いてください。'
  ],
  // 他の季節も同様に短く軽やかに
};
```

#### 例2: マインドフルネス型プロンプト（参考・非推奨）

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

**注意**: マインドフルネス型は深く瞑想的な表現になり、メッセージが長くなる傾向があります（200文字以上）。水辺の四季の日替わりメッセージには**軽やかで短いメッセージ**が適しています。

**AIの提案例**:

プロンプト改善案を複数提示し、ユーザーに選択させる:
1. **心温まる励まし型**（推奨）- 短く軽やかで前向き
2. 感情に寄り添うメンタルケア型 - 優しく寄り添う
3. 自然描写重視の情景型 - 季節の美しさを描写
4. マインドフルネス型（「今、ここ」重視）- 瞑想的で深い

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

### 問題11: 日替わりメッセージの時間帯が正しく反映されない

**症状**:

- 夜なのに「朝」のメッセージが表示される
- 時間帯に関係なく同じ内容のメッセージが生成される
- フォールバックメッセージも時間帯を考慮していない

**原因**:

1. **Geminiプロンプトに時間帯情報が含まれていない**: プロンプトに「朝の始まりに」などの固定表現があり、時間帯の判定がない
2. **フォールバックメッセージが季節のみで分類**: 時間帯による分類がなく、季節だけで選択されている
3. **日付表記に時間帯が含まれていない**: 「1月16日（金曜日）、冬」のように時間帯情報がない

**解決策**:

#### 解決策1: 時間帯判定関数を追加

```typescript
// functions/api/daily-message.ts

/**
 * 時刻から時間帯を判定
 */
function getTimeOfDay(hour: number): '朝' | '昼' | '夕方' | '夜' {
  if (hour >= 5 && hour < 11) return '朝';
  if (hour >= 11 && hour < 17) return '昼';
  if (hour >= 17 && hour < 21) return '夕方';
  return '夜';
}
```

#### 解決策2: 日付表記に時間帯を追加

```typescript
/**
 * 日付から日本語の表現を生成
 */
function getDateDescription(date: Date): string {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const dayOfWeek = ['日', '月', '火', '水', '木', '金', '土'][date.getDay()];
  const season = getSeason(month);
  const timeOfDay = getTimeOfDay(date.getHours()); // 追加

  return `${month}月${day}日（${dayOfWeek}曜日）、${season}の${timeOfDay}`;
  // 例: 「1月16日（金曜日）、冬の夜」
}
```

#### 解決策3: フォールバックメッセージを時間帯別に分類

```typescript
const FALLBACK_MESSAGES: Record<string, Record<string, string[]>> = {
  冬: {
    朝: [
      '{date}の冬の朝。凍える空気も、温かな光が優しく包み込みます。',
      '{date}、冬の朝は冷たいけれど、温かさも見つかります。ゆっくりと。'
    ],
    昼: [
      '{date}の午後、冬の空気が凛として清々しい。温かいものでひと息を。',
      '{date}、冬の日差しが優しい。小さな幸せを集める1日に。'
    ],
    夕方: [
      '{date}の夕暮れ、冬の寒さが身に染みます。温もりを大切に。',
      '{date}の夕方、冬の空が美しい。今日もお疲れさまでした。'
    ],
    夜: [
      '{date}の冬の夜、静かで穏やか。ゆっくりお休みください。',
      '{date}、冬の夜。温かくして、明日も良い日になりますように。'
    ]
  },
  // 他の季節も同様...
};

function buildFallbackMessage(date: Date, dateDescription: string): string {
  const season = getSeason(date.getMonth() + 1);
  const timeOfDay = getTimeOfDay(date.getHours());
  const seasonMessages = FALLBACK_MESSAGES[season] ?? FALLBACK_MESSAGES['春'];
  const messages = seasonMessages[timeOfDay] ?? seasonMessages['朝'];
  const index = (date.getDate() - 1) % messages.length;
  return messages[index].replace('{date}', dateDescription);
}
```

#### 解決策4: Geminiプロンプトに時間帯を明示

```typescript
async function generateDailyMessage(apiKey: string, dateStr: string): Promise<string> {
  const prompt = `あなたは優しい言葉で人々を励ます詩人です。今日は${dateStr}です。

この時間帯に心がほっと温まり、1日に少し彩を添えるような短いメッセージを書いてください。

【条件】
- 60-80文字以内（2行程度）
- ${dateStr}の季節と時間帯（朝・昼・夕方・夜）の美しさを優しく描く
- 時間帯に合った表現を使う（朝なら始まり、夜なら休息など）
- 前向きで軽やかな表現
- 心が温まる、ほっとする言葉選び
- です・ます調
- メッセージのみを出力（説明や前置きは不要）

【良い例】
- 朝：「冬の朝、温かい飲み物で一息つきませんか。小さな幸せが、あなたを待っていますよ。」（45文字）
- 昼：「春の風が背中を押してくれます。今日も一歩ずつ、自分のペースで。」（36文字）
- 夕方：「夏の夕暮れ、少し涼しくなってきましたね。今日もお疲れさまでした。」（37文字）
- 夜：「秋の夜、静かで穏やか。ゆっくりお休みください。明日も良い日に。」（35文字）

【避けるべき表現】
- 長い描写や説明
- 重厚で瞑想的な表現
- 指示的・説教的な内容
- 時間帯に合わない表現（夜なのに「朝」と言うなど）`;

  // API呼び出し...
}
```

**検証**:

```bash
# APIをテスト（現在の時間帯に応じたメッセージが返されるか確認）
curl -s https://your-app.pages.dev/api/daily-message | jq '.dateDescription, .message'

# 期待される出力例（夜の場合）:
# "1月16日（金曜日）、冬の夜"
# "冬の夜、静かで穏やか。ゆっくりお休みください。明日も良い日に。"
```

**重要な注意点**:

- 時間帯判定の基準は `src/utils/time.ts` の `getTimeOfDay()` と同じにする
- 日本時間（JST）で判定することを確認（`toLocaleString('en-US', { timeZone: 'Asia/Tokyo' })`）
- キャッシュは日付単位なので、同じ日の時間帯変化には対応しない（仕様）

### 問題12: ParticleLayerInstancedが巨大な板や球体として表示される

**症状**:

- 季節のパーティクル（桜の花びら、雪、落ち葉）が巨大な板や球体として表示される
- 春: ピンク色の巨大な板
- 夏: 緑色の巨大な球体
- 秋: 茶色い巨大な板
- 冬: 白い巨大な球体

**原因**:

`src/constants/particle.ts` の `PARTICLE_GEOMETRY_SIZE` が大きすぎる：

```typescript
// ❌ 問題のあるサイズ
export const PARTICLE_GEOMETRY_SIZE = {
  SPRING_WIDTH: 1.5,  // 桜の花びら (幅) - 巨大な板
  SPRING_HEIGHT: 1.0, // 桜の花びら (高さ)
  AUTUMN_WIDTH: 1.2,  // 落ち葉 (幅) - 巨大な板
  AUTUMN_HEIGHT: 1.8, // 落ち葉 (高さ)
  WINTER_SEGMENTS: 8,
  SUMMER_SEGMENTS: 6,
} as const;

// ParticleLayerInstanced.tsx での球体サイズ
geometry = new THREE.SphereGeometry(0.5, ...) // 半径0.5 - 巨大な球体
```

**解決策**:

パーティクルのジオメトリサイズを1/10に縮小：

```typescript
// ✅ 修正後のサイズ
export const PARTICLE_GEOMETRY_SIZE = {
  SPRING_WIDTH: 0.15,  // 桜の花びら (幅) - 1/10に縮小
  SPRING_HEIGHT: 0.10, // 桜の花びら (高さ)
  AUTUMN_WIDTH: 0.12,  // 落ち葉 (幅)
  AUTUMN_HEIGHT: 0.18, // 落ち葉 (高さ)
  WINTER_SEGMENTS: 8,
  SUMMER_SEGMENTS: 6,
} as const;
```

`src/components/ParticleLayerInstanced.tsx` の球体サイズも修正：

```typescript
// 夏の球体
case "summer":
  geometry = new THREE.SphereGeometry(
    0.05,  // 半径を0.5から0.05に縮小
    PARTICLE_GEOMETRY_SIZE.SUMMER_SEGMENTS,
    PARTICLE_GEOMETRY_SIZE.SUMMER_SEGMENTS
  );
  break;

// 冬の球体
case "winter":
  geometry = new THREE.SphereGeometry(
    0.05,  // 半径を0.5から0.05に縮小
    PARTICLE_GEOMETRY_SIZE.WINTER_SEGMENTS,
    PARTICLE_GEOMETRY_SIZE.WINTER_SEGMENTS
  );
  break;

// デフォルト
default:
  geometry = new THREE.SphereGeometry(0.05, 8, 8); // 0.5から0.05に縮小
```

**デバッグ手順**:

1. **問題の特定**: コンポーネントを段階的にコメントアウトして原因を特定
   ```typescript
   // src/App.tsx
   {/* <MemoizedParticleLayerInstanced /> */}
   ```

2. **サイズの確認**: 定数ファイルのサイズが適切か確認
   ```bash
   grep -A 10 "PARTICLE_GEOMETRY_SIZE" src/constants/particle.ts
   ```

3. **修正の適用**: 定数とコンポーネントの両方を修正

4. **視覚確認**: ブラウザで小さなパーティクルとして表示されることを確認

**重要なポイント**:

- PlaneGeometry のサイズは `args={[width, height, 1]}` で指定
- SphereGeometry のサイズは `args={[radius, segments, segments]}` で指定
- 適切なサイズは `0.05〜0.2` 程度（視覚的に自然なパーティクルサイズ）
- 季節ごとにサイズを微調整可能（`PARTICLE_SIZE_MODIFIER`）

**検証**:

```bash
# 開発サーバーで確認
npm run dev

# ブラウザで季節を切り替えて視覚確認
# - 春: 小さなピンクの花びらが舞う
# - 夏: 小さな緑の粒子が浮遊
# - 秋: 小さな落ち葉が舞う
# - 冬: 小さな雪の結晶が降る
```

### 問題13: ローディング画面が正しく表示されない

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
      <h1>水辺の四季</h1>
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
