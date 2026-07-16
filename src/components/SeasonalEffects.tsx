import React from 'react';
import { useSeason, useDayPeriod } from "../contexts";
import CherryBlossoms from './CherryBlossoms';
import SummerEffects from './SummerEffects';
import FallenLeaves from './FallenLeaves';
import SnowEffect from './SnowEffect';
import RainEffect from './RainEffect';
import { Fireflies } from './Fireflies';
import { SeasonalSmallCreatures } from './SeasonalSmallCreatures';
import {
  getRainIntensity,
  getGustIntensity,
  getSnowIntensity,
  shouldShowRain,
  shouldShowSnow,
  type WeatherSnapshot,
} from '@/utils/weather';

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
  const showSnow = shouldShowSnow(weather);
  const rainIntensity = getRainIntensity(weather);
  const gustIntensity = getGustIntensity(weather);
  const snowIntensity = getSnowIntensity(weather);

  return (
    <>
      {season === 'spring' && <CherryBlossoms />}
      {season === 'summer' && <SummerEffects />}
      <SeasonalSmallCreatures />
      {season === 'summer' && !isDay && <Fireflies />}
      {(season === 'autumn' || season === 'winter') && <FallenLeaves />}
      {showSnow && <SnowEffect intensity={snowIntensity} />}
      {showRain && <RainEffect intensity={rainIntensity} gustIntensity={gustIntensity} />}
    </>
  );
};
