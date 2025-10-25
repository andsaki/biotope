/** 時間帯の種類 */
export type TimeOfDay = "morning" | "afternoon" | "evening" | "night";

/**
 * 時刻から時間帯を判定する
 * @param hour - 時刻（0-23）
 * @returns 時間帯（朝: 5-10時、昼: 11-16時、夕: 17-20時、夜: 21-4時）
 */
export const getTimeOfDay = (hour: number): TimeOfDay => {
  if (hour >= 5 && hour < 11) return "morning";
  if (hour >= 11 && hour < 17) return "afternoon";
  if (hour >= 17 && hour < 21) return "evening";
  return "night";
};
