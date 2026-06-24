import React from 'react';
import { tokens } from '@/styles/tokens';
import { useIsMobile } from '@/hooks/useIsMobile';
import type { WeatherSnapshot } from '@/utils/weather';

/** 風向き表示コンポーネントのプロパティ */
interface WindDirectionDisplayProps {
  /** 風向き（北/東/南/西） */
  windDirection: "North" | "East" | "South" | "West";
  /** 現在の天気 */
  weather: WeatherSnapshot;
}

/** 風向きと表示情報のマッピング */
const windDirectionMap = {
  North: { rotation: 0, label: '北', kanji: '北' },
  East: { rotation: 90, label: '東', kanji: '東' },
  South: { rotation: 180, label: '南', kanji: '南' },
  West: { rotation: 270, label: '西', kanji: '西' },
};

const formatForecastHour = (date: Date) =>
  `${String(date.getHours()).padStart(2, '0')}時`;

const getWeatherTone = (condition: WeatherSnapshot['condition']) => {
  switch (condition) {
    case 'rain':
      return '雨粒';
    case 'cloudy':
      return 'やわらぐ光';
    case 'clear':
    default:
      return '戻る光';
  }
};

const formatWindSpeed = (speed: number | null) =>
  speed === null ? null : `${speed.toFixed(1)}m/s`;

/**
 * 風向きコンパス表示コンポーネント
 * 現在の風向きを視覚的に表示
 * @param props - コンポーネントのプロパティ
 */
const WindDirectionDisplay: React.FC<WindDirectionDisplayProps> = ({
  windDirection,
  weather,
}) => {
  const { rotation, kanji } = windDirectionMap[windDirection];
  const isMobile = useIsMobile();
  const forecastPreview = weather.forecast.slice(1, 4);
  const windSpeedText = formatWindSpeed(weather.windSpeed);

  return (
    <div
      style={{
        position: isMobile ? 'fixed' : 'absolute',
        top: isMobile ? tokens.positioning.mobile.top : tokens.positioning.pc.top,
        left: isMobile ? tokens.positioning.mobile.left : tokens.positioning.pc.left,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: tokens.spacing.md,
        padding: tokens.spacing.lg,
        border: '1px solid rgba(255, 255, 255, 0.18)',
        borderRadius: '16px',
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0.06))',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        boxShadow: `
          0 8px 32px rgba(0, 0, 0, 0.4),
          inset 0 1px 0 rgba(255, 255, 255, 0.3),
          inset 0 -1px 0 rgba(0, 0, 0, 0.2)
        `,
        opacity: isMobile ? 0.95 : 1,
        transform: isMobile ? 'scale(0.75)' : 'none',
        transformOrigin: 'top left',
      }}
    >

      {/* コンパス本体 */}
      <div
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: tokens.componentSizes.pc.compass,
          height: tokens.componentSizes.pc.compass,
        }}
      >
        {/* 外側のリング */}
        <div
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            border: '2px solid rgba(255, 255, 255, 0.3)',
            borderRadius: tokens.radius.full,
            background: 'radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.1) 100%)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            boxShadow: `
              inset 0 2px 4px rgba(255, 255, 255, 0.3),
              inset 0 -2px 4px rgba(0, 0, 0, 0.2),
              0 4px 12px rgba(0, 0, 0, 0.3)
            `,
          }}
        >
          {/* 方位マーク */}
          <div
            style={{
              position: 'absolute',
              top: '5px',
              left: '50%',
              transform: 'translateX(-50%)',
              fontFamily: tokens.typography.fontFamily.serif,
              fontSize: '16px',
              fontWeight: 600,
              color: 'rgba(255, 255, 255, 0.95)',
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.5), 0 0 8px rgba(255, 255, 255, 0.2)',
            }}
          >
            N
          </div>
          <div
            style={{
              position: 'absolute',
              top: '50%',
              right: '8px',
              transform: 'translateY(-50%)',
              fontFamily: tokens.typography.fontFamily.serif,
              fontSize: '14px',
              fontWeight: 500,
              color: 'rgba(255, 255, 255, 0.85)',
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
            }}
          >
            E
          </div>
          <div
            style={{
              position: 'absolute',
              bottom: '5px',
              left: '50%',
              transform: 'translateX(-50%)',
              fontFamily: tokens.typography.fontFamily.serif,
              fontSize: '14px',
              fontWeight: 500,
              color: 'rgba(255, 255, 255, 0.85)',
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
            }}
          >
            S
          </div>
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '8px',
              transform: 'translateY(-50%)',
              fontFamily: tokens.typography.fontFamily.serif,
              fontSize: '14px',
              fontWeight: 500,
              color: 'rgba(255, 255, 255, 0.85)',
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
            }}
          >
            W
          </div>
        </div>

        {/* 中央の風向き矢印 */}
        <div
          style={{
            position: 'absolute',
            width: '40px',
            height: '40px',
            filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))',
            transform: `rotate(${rotation}deg)`,
            transition: tokens.transitions.slow,
          }}
        >
          <svg width="40" height="40" viewBox="0 0 40 40">
            <defs>
              <linearGradient id="arrowGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#FF6B6B', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: '#EE5A6F', stopOpacity: 1 }} />
              </linearGradient>
            </defs>
            <path
              d="M 20 5 L 25 20 L 20 17 L 15 20 Z"
              fill="url(#arrowGradient)"
              stroke="#fff"
              strokeWidth="1"
            />
          </svg>
        </div>

        {/* 中央の点 */}
        <div
          style={{
            position: 'absolute',
            zIndex: tokens.zIndex.dropdown,
            width: '10px',
            height: '10px',
            borderRadius: tokens.radius.full,
            background: 'radial-gradient(circle at 35% 35%, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.5))',
            border: '1px solid rgba(255, 255, 255, 0.4)',
            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.4), inset 0 1px 2px rgba(255, 255, 255, 0.5)',
          }}
        />
      </div>

      {/* 風向き表示 */}
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          gap: tokens.spacing.xs,
          fontFamily: tokens.typography.fontFamily.serif,
        }}
      >
        <span
          style={{
            fontSize: '22px',
            fontWeight: 500,
            color: 'rgba(255, 255, 255, 0.95)',
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.4)',
          }}
        >
          {kanji}
        </span>
        <span
          style={{
            fontSize: '14px',
            fontWeight: 300,
            color: 'rgba(255, 255, 255, 0.8)',
            textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
          }}
        >
          の風
        </span>
      </div>
      <div
        style={{
          width: '100%',
          paddingTop: tokens.spacing.sm,
          borderTop: '1px solid rgba(255, 255, 255, 0.16)',
          fontFamily: tokens.typography.fontFamily.serif,
          textAlign: 'center',
        }}
      >
        <div
          style={{
            fontSize: '18px',
            fontWeight: 500,
            color: 'rgba(255, 255, 255, 0.95)',
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.4)',
          }}
        >
          {weather.label}
        </div>
        <div
          style={{
            marginTop: '2px',
            fontSize: '11px',
            fontWeight: 300,
            color: 'rgba(255, 255, 255, 0.72)',
            lineHeight: 1.5,
            textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
          }}
        >
          {weather.description}
        </div>
        <div
          style={{
            marginTop: '2px',
            fontSize: '10px',
            fontWeight: 300,
            color: 'rgba(255, 255, 255, 0.52)',
            lineHeight: 1.4,
          }}
        >
          {weather.source === 'open-meteo'
            ? `${weather.location}の実天気`
            : '水辺の天気'}
        </div>
        {windSpeedText && (
          <div
            style={{
              marginTop: '3px',
              fontSize: '10px',
              color: 'rgba(255, 255, 255, 0.58)',
              lineHeight: 1.4,
            }}
          >
            風 {windSpeedText}
          </div>
        )}
        {forecastPreview.length > 0 && (
          <div
            style={{
              width: '100%',
              marginTop: tokens.spacing.sm,
              paddingTop: tokens.spacing.sm,
              borderTop: '1px solid rgba(255, 255, 255, 0.12)',
            }}
          >
            <div
              style={{
                marginBottom: '6px',
                fontSize: '10px',
                letterSpacing: '0.08em',
                color: 'rgba(255, 255, 255, 0.58)',
              }}
            >
              水辺予報
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '6px',
              }}
            >
              {forecastPreview.map((point) => (
                <div
                  key={point.time.toISOString()}
                  style={{
                    minWidth: '34px',
                    padding: '5px 6px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    background: 'rgba(255, 255, 255, 0.07)',
                  }}
                >
                  <div
                    style={{
                      fontSize: '9px',
                      color: 'rgba(255, 255, 255, 0.5)',
                      lineHeight: 1.2,
                    }}
                  >
                    {formatForecastHour(point.time)}
                  </div>
                  <div
                    style={{
                      marginTop: '2px',
                      fontSize: '13px',
                      color: 'rgba(255, 255, 255, 0.9)',
                      lineHeight: 1.2,
                    }}
                  >
                    {point.label}
                  </div>
                </div>
              ))}
            </div>
            <div
              style={{
                marginTop: '6px',
                fontSize: '10px',
                color: 'rgba(255, 255, 255, 0.68)',
                lineHeight: 1.45,
              }}
            >
              {weather.forecastSummary || getWeatherTone(forecastPreview[0].condition)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WindDirectionDisplay;
