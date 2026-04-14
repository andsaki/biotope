# 実装セッション: Issue #30 水面クリックでインタラクティブな波紋を発生させる

- 自動実装モード
- 方針: `WaterSurface` の既存頂点変形に、クリック起点の減衰付き波紋を合成する
- クリック位置は R3F のポインタイベントからローカル座標へ変換して記録する
- テスト: `volta run npx tsc --noEmit`, `volta run npm run lint`, `volta run npm run build`
