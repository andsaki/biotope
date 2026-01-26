# 実装計画: パフォーマンス改善

## 目的
プロジェクトのパフォーマンスボトルネックを解消し、FPS向上とCPU使用率の削減を実現する。特に毎フレームの再レンダリングや重複したジオメトリ作成を最適化する。

## 実装スコープ

### 1. 変更するファイル

#### 緊急度：高（即座に効果が見込める最適化）

**1.1 src/components/LightingController.tsx**
- 問題: 毎フレーム新しい `THREE.Color` オブジェクトを作成（80, 86行目）
- 変更: Color オブジェクトを useRef で保持し、`.set()` メソッドで再利用
- 期待効果: GC負荷の削減、CPU使用率5-10%削減

**1.2 src/components/Pond.tsx**
- 問題: 同じ circleGeometry を2回作成（41-48行目と49-56行目）
- 変更: ジオメトリを useMemo で1つだけ作成し、両方のメッシュで共有
- 期待効果: メモリ使用量の削減

#### 緊急度：中（安定性を保ちつつ効果的な最適化）

**1.3 src/components/Ground.tsx**
- 問題: React.memo が未使用で不要な再レンダリングの可能性
- 変更: React.memo でラップ
- 期待効果: 再レンダリング削減

**1.4 src/components/SceneLights.tsx**
- 問題: Props を受け取るが React.memo なし
- 変更: React.memo でラップ
- 期待効果: 再レンダリング削減

**1.5 src/components/Clouds.tsx**
- 問題: timeScale を props で受け取るが React.memo なし
- 変更: React.memo でラップ
- 期待効果: 再レンダリング削減

**1.6 src/components/WaterPlantsLarge.tsx**
- 問題: 各水草が cylinderGeometry を個別作成（27-42行目）
- 変更: cylinderGeometry を useMemo で共有
- 期待効果: メモリ使用量削減、初期化時間短縮

**1.7 src/components/FishManager.tsx**
- 問題: React.memo が未使用
- 変更: React.memo でラップ
- 期待効果: 再レンダリング削減

**1.8 src/components/WaterSurface.tsx**
- 問題: React.memo が未使用
- 変更: React.memo でラップ
- 期待効果: 再レンダリング削減

**1.9 src/components/BubbleEffect.tsx**
- 問題: React.memo が未使用
- 変更: React.memo でラップ
- 期待効果: 再レンダリング削減

### 2. 作成するファイル
なし（既存ファイルの最適化のみ）

### 3. 今回スキップする項目（将来的な検討事項）

以下は影響範囲が大きいか、既に最適化が進んでいるため今回は対象外とする：

- **ParticleLayer.tsx の置き換え**: ParticleLayerInstanced.tsx への完全移行は影響範囲が大きいため別途検討
- **FishManager.tsx の計算最適化**: 三角関数のキャッシュなどは複雑なため別セッションで対応
- **ReflectedStars.tsx**: 既に2フレームに1回のスキップがあり、十分最適化されている
- **TimeContext**: 現在の設計が適切で、大きな変更は不要

## 実装手順（ステップバイステップ）

### ステップ1: LightingController.tsx の最適化
1. Color オブジェクトを useRef で保持
2. 毎フレームの更新を `.set()` メソッドで行う
3. 動作確認

### ステップ2: Pond.tsx のジオメトリ共有
1. circleGeometry を useMemo で1つだけ作成
2. 両方の mesh で同じジオメトリを参照
3. 動作確認

### ステップ3: React.memo の追加（複数コンポーネント）
1. Ground.tsx に React.memo 追加
2. SceneLights.tsx に React.memo 追加
3. Clouds.tsx に React.memo 追加
4. WaterPlantsLarge.tsx に React.memo 追加
5. FishManager.tsx に React.memo 追加
6. WaterSurface.tsx に React.memo 追加
7. BubbleEffect.tsx に React.memo 追加
8. 動作確認

### ステップ4: WaterPlantsLarge.tsx のジオメトリ共有
1. cylinderGeometry を useMemo で共有
2. 各水草で同じジオメトリを参照
3. 動作確認

## 技術的詳細

### Color オブジェクトの再利用パターン
```typescript
// Before
useFrame(() => {
  light.color = new THREE.Color(0xffffff); // 毎フレーム新規作成
});

// After
const colorRef = useRef(new THREE.Color());
useFrame(() => {
  light.color = colorRef.current.set(0xffffff); // 再利用
});
```

### ジオメトリ共有パターン
```typescript
// Before
<mesh><circleGeometry args={[5, 32]} /></mesh>
<mesh><circleGeometry args={[5, 32]} /></mesh>

// After
const geometry = useMemo(() => new THREE.CircleGeometry(5, 32), []);
<mesh geometry={geometry} />
<mesh geometry={geometry} />
```

### React.memo パターン
```typescript
// Before
const Component = () => { ... };
export default Component;

// After
const Component = () => { ... };
export default React.memo(Component);
```

## テスト計画
- [ ] npm run build（型チェック）
- [ ] 開発サーバーで動作確認
  - [ ] 各季節での表示確認
  - [ ] 昼夜の切り替え確認
  - [ ] パフォーマンスモニターでFPS確認
- [ ] ブラウザの開発者ツールでメモリリーク確認
- [ ] パフォーマンスプロファイラで改善効果を測定

## 完了条件
- [ ] すべての最適化を実装
- [ ] ビルドエラーなし
- [ ] 既存機能に影響なし
- [ ] FPS が改善している（パフォーマンスモニター確認）
- [ ] メモリ使用量が削減されている

## 期待効果

### 総合的な改善見込み
- CPU使用率: 10-20%削減
- メモリ使用量: 5-10%削減
- FPS: 微増（安定性向上）
- 再レンダリング回数: 30-40%削減

### 各最適化の個別効果
1. LightingController Color 再利用: GC負荷削減、CPU 5-10%削減
2. Pond ジオメトリ共有: メモリ微削減
3. React.memo 追加（7コンポーネント）: 再レンダリング30-40%削減、CPU 5-10%削減
4. WaterPlantsLarge ジオメトリ共有: メモリ削減

## リスク評価
- **低リスク**: すべて既存のベストプラクティスに従った定型的な最適化
- **影響範囲**: 各コンポーネント内部のみ、他への影響なし
- **ロールバック**: 各変更が独立しているため、問題があれば個別に戻せる

## 実装時間見積もり
- ステップ1: 10分
- ステップ2: 5分
- ステップ3: 20分（7コンポーネント）
- ステップ4: 10分
- テスト: 15分

**合計: 約60分**
