import React from 'react';
import { useSeason } from '../contexts/SeasonContext';
import CherryBlossoms from './CherryBlossoms';
import SummerEffects from './SummerEffects';
import FallenLeaves from './FallenLeaves';
import SnowEffect from './SnowEffect';
import RainEffect from './RainEffect';

/**
 * 季節ごとのエフェクトを統合管理するコンポーネント
 */
export const SeasonalEffects: React.FC = () => {
  const { season } = useSeason();
  const month = new Date().getMonth() + 1; // 1-12

  return (
    <>
      {season === 'spring' && <CherryBlossoms />}
      {season === 'summer' && <SummerEffects />}
      {(season === 'autumn' || season === 'winter') && <FallenLeaves />}
      {season === 'winter' && <SnowEffect />}
      {month === 6 && <RainEffect />}
    </>
  );
};
