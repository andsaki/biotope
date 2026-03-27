import React from 'react';
import { useSeason, useDayPeriod } from "../contexts";
import CherryBlossoms from './CherryBlossoms';
import SummerEffects from './SummerEffects';
import FallenLeaves from './FallenLeaves';
import SnowEffect from './SnowEffect';
import RainEffect from './RainEffect';
import { Fireflies } from './Fireflies';

/**
 * 季節ごとのエフェクトを統合管理するコンポーネント
 */
export const SeasonalEffects: React.FC = () => {
  const { season } = useSeason();
  const isDay = useDayPeriod();
  const month = new Date().getMonth() + 1; // 1-12

  return (
    <>
      {season === 'spring' && <CherryBlossoms />}
      {season === 'summer' && <SummerEffects />}
      {season === 'summer' && !isDay && <Fireflies />}
      {(season === 'autumn' || season === 'winter') && <FallenLeaves />}
      {season === 'winter' && <SnowEffect />}
      {month === 6 && <RainEffect />}
    </>
  );
};
