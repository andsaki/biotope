import React from 'react';
import { useSeason, useDayPeriod } from "../contexts";
import CherryBlossoms from './CherryBlossoms';
import SummerEffects from './SummerEffects';
import FallenLeaves from './FallenLeaves';
import SnowEffect from './SnowEffect';
import RainEffect from './RainEffect';
import { Fireflies } from './Fireflies';
import { shouldShowRain, type WeatherSnapshot } from '@/utils/weather';

interface SeasonalEffectsProps {
  weather: WeatherSnapshot;
}

/**
 * 季節ごとのエフェクトを統合管理するコンポーネント
 */
export const SeasonalEffects: React.FC<SeasonalEffectsProps> = ({ weather }) => {
  const { season } = useSeason();
  const isDay = useDayPeriod();
  const showRain = shouldShowRain(weather);

  return (
    <>
      {season === 'spring' && <CherryBlossoms />}
      {season === 'summer' && <SummerEffects />}
      {season === 'summer' && !isDay && <Fireflies />}
      {(season === 'autumn' || season === 'winter') && <FallenLeaves />}
      {season === 'winter' && <SnowEffect />}
      {showRain && <RainEffect />}
    </>
  );
};
