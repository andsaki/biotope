# 実装セッション: Issue #31 蓮の葉の上にカエルを配置

- Issue: https://github.com/andsaki/biotope/issues/31
- 開始: 2026-05-09
- 方針: `LilyPads` 内で同じ `LILY_DATA` と波計算を使い、夏季のみカエルを表示する。

## 進捗
- `Frog.tsx` を追加
- `LilyPads.tsx` から夏季の蓮上に表示
- `waterPlants.ts` にカエル位置・ジャンプ・鳴き声定数を追加
- 型チェック / lint / build 実行済み

## 検証
- `volta run npx tsc --noEmit`: pass
- `volta run npm run lint`: pass
- `volta run npm run build`: pass
