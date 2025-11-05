import React from 'react';
import { tokens } from '@/styles/tokens';

/** 風向き表示コンポーネントのプロパティ */
interface WindDirectionDisplayProps {
  /** 風向き（北/東/南/西） */
  windDirection: "North" | "East" | "South" | "West";
}

/** 風向きと表示情報のマッピング */
const windDirectionMap = {
  North: { rotation: 0, label: '北', kanji: '北' },
  East: { rotation: 90, label: '東', kanji: '東' },
  South: { rotation: 180, label: '南', kanji: '南' },
  West: { rotation: 270, label: '西', kanji: '西' },
};

/**
 * 風向きコンパス表示コンポーネント
 * 現在の風向きを視覚的に表示
 * @param props - コンポーネントのプロパティ
 */
const WindDirectionDisplay: React.FC<WindDirectionDisplayProps> = ({ windDirection }) => {
  const { rotation, kanji } = windDirectionMap[windDirection];
  const [isMobile, setIsMobile] = React.useState(window.innerWidth <= 768);

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
        border: `2px solid ${tokens.colors.paperBorder}`,
        borderRadius: tokens.radius.md,
        background: tokens.colors.paperBg,
        boxShadow: tokens.shadows.lg,
        opacity: isMobile ? 0.95 : 1,
        transform: isMobile ? 'scale(0.75)' : 'none',
        transformOrigin: 'top left',
      }}
    >
      {/* 装飾的なボーダー */}
      <div
        style={{
          position: 'absolute',
          top: tokens.spacing.sm,
          right: tokens.spacing.sm,
          bottom: tokens.spacing.sm,
          left: tokens.spacing.sm,
          border: `1px solid ${tokens.colors.paperBorder}`,
          borderRadius: tokens.radius.sm,
          pointerEvents: 'none',
        }}
      />

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
            border: `3px solid ${tokens.colors.textSecondary}`,
            borderRadius: tokens.radius.full,
            background: 'radial-gradient(circle, rgba(255, 255, 255, 0.95) 0%, rgba(245, 230, 211, 0.8) 100%)',
            boxShadow: `${tokens.shadows.inset}, ${tokens.shadows.sm}`,
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
              fontWeight: 'bold',
              color: tokens.colors.textSecondary,
              textShadow: '0 1px 2px rgba(255, 255, 255, 0.8)',
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
              fontWeight: 'bold',
              color: tokens.colors.textSecondary,
              textShadow: '0 1px 2px rgba(255, 255, 255, 0.8)',
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
              fontWeight: 'bold',
              color: tokens.colors.textSecondary,
              textShadow: '0 1px 2px rgba(255, 255, 255, 0.8)',
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
              fontWeight: 'bold',
              color: tokens.colors.textSecondary,
              textShadow: '0 1px 2px rgba(255, 255, 255, 0.8)',
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
            width: '8px',
            height: '8px',
            borderRadius: tokens.radius.full,
            background: tokens.colors.textSecondary,
            boxShadow: tokens.shadows.sm,
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
            fontWeight: 'bold',
            color: tokens.colors.textPrimary,
          }}
        >
          {kanji}
        </span>
        <span
          style={{
            fontSize: '14px',
            fontWeight: 500,
            color: tokens.colors.textSecondary,
          }}
        >
          の風
        </span>
      </div>
    </div>
  );
};

export default WindDirectionDisplay;
