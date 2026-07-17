import React, { useState } from 'react';
import { tokens } from '@/styles/tokens';
import { useIsMobile } from '@/hooks/useIsMobile';
import type { WeatherLocationStatus } from '@/hooks/useWeather';
import type { WeatherSnapshot } from '@/utils/weather';
import { WindCompass } from './WindCompass';
import { WindWeatherDetails } from './WindWeatherDetails';

/** 風向き表示コンポーネントのプロパティ */
interface WindDirectionDisplayProps {
  /** 風向き（北/東/南/西） */
  windDirection: "North" | "East" | "South" | "West";
  /** 現在の天気 */
  weather: WeatherSnapshot;
  locationStatus: WeatherLocationStatus;
  onRequestPreciseLocation: () => void;
}

/** 風向きと表示情報のマッピング */
const windDirectionMap = {
  North: { rotation: 0, label: '北', kanji: '北' },
  East: { rotation: 90, label: '東', kanji: '東' },
  South: { rotation: 180, label: '南', kanji: '南' },
  West: { rotation: 270, label: '西', kanji: '西' },
};

const panelSize = {
  mobile: {
    width: '176px',
    compass: '92px',
    padding: '14px',
    gap: '12px',
  },
  pc: {
    width: '180px',
    compass: tokens.componentSizes.pc.compass,
    padding: tokens.spacing.lg,
    gap: tokens.spacing.md,
  },
} as const;

/**
 * 風向きコンパス表示コンポーネント
 * 現在の風向きを視覚的に表示
 * @param props - コンポーネントのプロパティ
 */
const WindDirectionDisplay: React.FC<WindDirectionDisplayProps> = ({
  windDirection,
  weather,
  locationStatus,
  onRequestPreciseLocation,
}) => {
  const { rotation, kanji } = windDirectionMap[windDirection];
  const [expanded, setExpanded] = useState(false);
  const isMobile = useIsMobile();
  const size = isMobile ? panelSize.mobile : panelSize.pc;
  const sourceText = weather.locationSource === 'browser'
    ? '現在地の実天気'
    : weather.source === 'open-meteo'
      ? '現在地付近の実天気'
      : '水辺の天気';

  return (
    <div
      style={{
        position: isMobile ? 'fixed' : 'absolute',
        top: isMobile ? tokens.positioning.mobile.top : tokens.positioning.pc.top,
        left: isMobile ? tokens.positioning.mobile.left : tokens.positioning.pc.left,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: size.gap,
        boxSizing: 'border-box',
        width: size.width,
        padding: size.padding,
        border: '1px solid rgba(255, 255, 255, 0.28)',
        borderRadius: '16px',
        background: 'linear-gradient(145deg, rgba(44, 48, 88, 0.9), rgba(36, 25, 42, 0.88))',
        backdropFilter: 'blur(18px) saturate(150%)',
        WebkitBackdropFilter: 'blur(18px) saturate(150%)',
        boxShadow: `
          0 8px 32px rgba(0, 0, 0, 0.4),
          inset 0 1px 0 rgba(255, 255, 255, 0.22),
          inset 0 -1px 0 rgba(0, 0, 0, 0.28)
        `,
        opacity: 1,
        transform: 'none',
        transformOrigin: 'top left',
      }}
    >
      <button
        type="button"
        aria-expanded={expanded}
        aria-label={expanded ? '天気パネルを閉じる' : '天気パネルを開く'}
        onClick={() => setExpanded((current) => !current)}
        style={{
          width: '100%',
          padding: 0,
          border: 0,
          background: 'transparent',
          color: 'inherit',
          font: 'inherit',
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: size.gap,
          WebkitTapHighlightColor: 'transparent',
        }}
      >

      <WindCompass rotation={rotation} size={size.compass} />

      {/* 風向き表示 */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'baseline',
          gap: tokens.spacing.xs,
          fontFamily: tokens.typography.fontFamily.serif,
        }}
      >
        <span
          style={{
            fontSize: isMobile ? '20px' : '22px',
            fontWeight: 700,
            color: 'rgba(255, 255, 255, 0.98)',
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.4)',
          }}
        >
          {kanji}
        </span>
        <span
          style={{
            fontSize: '14px',
            fontWeight: 500,
            color: 'rgba(255, 255, 255, 0.86)',
            textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
          }}
        >
          の風
        </span>
        <span
          aria-hidden="true"
          style={{
            position: 'absolute',
            right: 0,
            top: '50%',
            width: '24px',
            height: '24px',
            borderRadius: '999px',
            display: 'grid',
            placeItems: 'center',
            transform: 'translateY(-50%)',
            border: '1px solid rgba(255, 255, 255, 0.24)',
            background: 'rgba(255, 255, 255, 0.1)',
            color: 'rgba(255, 255, 255, 0.9)',
            fontSize: '14px',
            lineHeight: 1,
          }}
        >
          {expanded ? '-' : '+'}
        </span>
      </div>
      {!expanded && (
        <div
          style={{
            width: '100%',
            display: 'grid',
            gridTemplateColumns: '1fr auto',
            alignItems: 'center',
            gap: '8px',
            paddingTop: '10px',
            borderTop: '1px solid rgba(255, 255, 255, 0.22)',
            fontFamily: tokens.typography.fontFamily.serif,
          }}
        >
          <div
            style={{
              minWidth: 0,
              textAlign: 'left',
            }}
          >
            <div
              style={{
                fontSize: '16px',
                fontWeight: 700,
                color: 'rgba(255, 255, 255, 0.98)',
                lineHeight: 1.2,
              }}
            >
              {weather.label}
            </div>
            <div
              style={{
                marginTop: '2px',
                fontSize: '10px',
                fontWeight: 500,
                color: 'rgba(255, 255, 255, 0.74)',
                lineHeight: 1.35,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {sourceText}
            </div>
          </div>
        </div>
      )}
      </button>
      {expanded && (
        <WindWeatherDetails
          weather={weather}
          sourceText={sourceText}
          isMobile={isMobile}
          locationStatus={locationStatus}
          onRequestPreciseLocation={onRequestPreciseLocation}
        />
      )}
    </div>
  );
};

export default WindDirectionDisplay;
