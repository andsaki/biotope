/**
 * 配列からランダムに1つの要素を取得する
 * @param array - 対象の配列
 * @returns ランダムに選ばれた要素
 */
export const getRandomItem = <T>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)];
};
