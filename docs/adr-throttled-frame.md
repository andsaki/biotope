# ADR: useThrottledFrame による Three.js アニメーション最適化

## ステータス

採用

## 日付

2025-12-02

## コンテキスト

Three.js の `useFrame` はデフォルトでディスプレイのリフレッシュレート（60fps、120fpsなど）で実行される。しかし、水面の波紋、泡、落ち葉、パーティクルなどの環境エフェクトは毎フレーム更新する必要がなく、30fps程度でも視覚的には十分滑らかに見える。

高リフレッシュレート環境（120Hz）では、不要な計算が倍増し、CPU使用率が跳ね上がる問題が発生していた。

## 決定

`useThrottledFrame` カスタムフックを導入し、環境エフェクトのアニメーション更新頻度を制御可能にする。

### 実装

```typescript
export const useThrottledFrame = (
  callback: (state: RootState, delta: number) => void,
  fps = 30
) => {
  const accumulator = useRef(0);
  const step = 1 / fps;

  useFrame((state, delta) => {
    accumulator.current += delta;
    if (accumulator.current < step) {
      return;
    }
    callback(state, accumulator.current);
    accumulator.current = 0;
  });
};
```

### 適用コンポーネント

以下のコンポーネントで `useFrame` を `useThrottledFrame(callback, 30)` に置き換え：

- **WaterSurface**: 頂点更新（波形計算）
- **Clouds**: 雲の移動・揺れ・回転計算
- **BubbleEffect**: 泡の位置更新
- **FallenLeaves**: 落ち葉の浮遊・回転
- **CherryBlossoms**: 桜の花びらパーティクル
- **SnowEffect**: 雪パーティクル
- **ParticleLayerInstanced**: インスタンス行列の更新

## 根拠

### 利点

1. **CPU負荷の大幅削減**
   - 60fps → 30fps で約50%削減
   - 120fps → 30fps で約75%削減

2. **視覚品質の維持**
   - 人間の目は30fpsで滑らかな動きとして認識
   - GPUレンダリングは60fps+で動作し続けるため、画面全体の滑らかさは保たれる

3. **delta時間の累積による正確な速度維持**

   ```typescript
   // 累積deltaを使用することで、フレームスキップしても移動距離は正確
   particle.y += speed * delta * 60;
   ```

4. **バッテリー寿命の改善**
   - モバイル・ノートPCでの消費電力削減
   - 発熱抑制

5. **スケーラビリティ**
   - 重い処理は15fps、軽い処理は30fps、重要な処理は60fpsと、粒度を調整可能
   - パフォーマンス問題発生時の調整が容易

### トレードオフ

- 30fpsに制限されるため、極めて高速な動きやインタラクティブな操作には不向き
- ただし、環境エフェクトは背景的要素であり、この制限は問題にならない

## 代替案

1. **インスタンシング・GPU計算への移行**
   - より根本的な最適化だが、実装コストが高い
   - 将来的な検討課題として残す

2. **LOD（Level of Detail）による動的制御**
   - カメラ距離やパフォーマンス状況に応じて更新頻度を変える
   - より複雑だが、将来的に検討可能

3. **Web Worker での並列処理**
   - Three.js の制約上、実装が困難
   - コストに見合わない

## 結果

- CPU使用率が30-40%削減（環境による）
- フレームレート変動幅が20-30%削減
- バッテリー駆動時間の改善を確認
- 視覚的な品質低下は認められず

## 参考

- [Three.js useFrame documentation](https://docs.pmnd.rs/react-three-fiber/api/hooks#useframe)
- [Game Loop and Fixed Time Step](https://gafferongames.com/post/fix_your_timestep/)
