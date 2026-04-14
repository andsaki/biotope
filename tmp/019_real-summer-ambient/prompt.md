# 実装セッション: 夏の環境音を実録音へ置き換える

- 実録音源候補
  - 夏昼: `Singing_cicada_audio.ogg` (CC BY-SA 4.0)
  - 夏夜: `Field_cricket_unedited.ogg` (CC BY-SA 3.0)
- 方針: 実録サンプルがある季節・時間帯はサンプルを優先し、既存の秋夜鈴虫も維持する
- テスト: `volta run npx tsc --noEmit`, `volta run npm run lint`, `volta run npm run build`
