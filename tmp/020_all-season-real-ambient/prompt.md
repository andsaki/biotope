# 実装セッション: 全季節×昼夜の環境音を実録寄りで揃える

- 既存: 夏昼/夏夜/秋夜 は実録音済み
- 追加方針: 春昼・春夜・秋昼・冬昼・冬夜 の候補を探して割り当てる
- 優先条件: OGG/OGA、公開ライセンス、サイズ過大でない、季節感が分かる
- テスト: `volta run npx tsc --noEmit`, `volta run npm run lint`, `volta run npm run build`
