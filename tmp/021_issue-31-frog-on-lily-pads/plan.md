# 実装計画: Issue #31 蓮の葉の上にカエルを配置

## 目的
夏季の蓮の葉の上に、鳴き声・ジャンプ・クリック反応を持つ軽量なカエルを追加する。

## 実装スコープ
- `src/components/Frog.tsx` を新規作成
- `src/components/LilyPads.tsx` に夏季蓮の葉と同期する配置を追加
- 必要な定数を `src/constants/waterPlants.ts` に追加

## 実装手順
1. 既存の蓮の葉位置と波アニメーションを確認
2. 軽量プリミティブでカエルモデルを作成
3. Web Audio APIで短い鳴き声を生成し、ランダム/クリックで鳴らす
4. ランダム/クリックのジャンプアニメーションを追加
5. 蓮の葉の波に合わせて位置を同期
6. 型チェック・lint・buildを実行

## テスト計画
- `volta run npx tsc --noEmit`
- `volta run npm run lint`
- `volta run npm run build`
