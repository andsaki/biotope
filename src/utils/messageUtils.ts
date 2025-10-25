import { MESSAGES, SENDERS, type Season } from "../constants/bottleMessages";
import { getTimeOfDay } from "../utils/time";
import { getRandomItem } from "../utils/random";

/**
 * 季節と時刻に応じたランダムなメッセージと送り主を取得する
 * @param season - 季節（春/夏/秋/冬）
 * @param hour - 時刻（0-23）
 * @returns メッセージと送り主の情報
 */
export const getRandomMessage = (
  season: Season,
  hour: number
): { message: string; sender: string } => {
  const timeOfDay = getTimeOfDay(hour);
  const timeMessages = MESSAGES[season][timeOfDay];
  const message = getRandomItem(timeMessages);
  const sender = getRandomItem([...SENDERS]);

  return { message, sender };
};
