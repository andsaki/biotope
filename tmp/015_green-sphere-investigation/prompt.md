# 実装セッション: green-sphere-investigation

## セッション情報
- 開始日時: 2026-03-29
- タスク: Issue #32「謎の緑の球体がある」の原因を特定し修正方針を立案
- 参照: plan.md

## 進捗状況
### ✅ 完了
- [x] plan.md 作成
- [x] 現象再現と原因調査（ParticleLayerInstanced の instancedMatrix 更新ロジックが原因と判明）
- [x] 修正実装（Object3D + setMatrixAt 方式へリファクタ）
- [x] ドキュメント更新（docs/ai-guide/feature.md に原因/解決策を反映）

### 🔄 進行中
- [ ] テスト（`npm run dev` での視覚確認）

## ユーザーからの指示
- Issue #32 より: 夜間シーンに緑の球体が浮かんでいるため原因解明と対策が必要
