import React from 'react';
import Clock from 'react-clock';
import 'react-clock/dist/Clock.css';
import { tokens } from '@/styles/tokens';
import { useTime } from '../contexts/TimeContext';
import { useIsMobile } from '@/hooks/useIsMobile';

/**
 * シミュレーション時計コンポーネント
 * リアルタイムを表示するアナログ / デジタル時計
 */
const SimulationClock: React.FC = () => {
  const { realTime } = useTime();
  const isMobile = useIsMobile();

  const hours = realTime.hours;
  const minutes = realTime.minutes;
  const seconds = realTime.seconds;

  const digitalDisplay = (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: tokens.spacing.sm,
      }}
    >
      <div
        style={{
          fontFamily: tokens.typography.fontFamily.mono,
          fontSize: isMobile ? '24px' : '18px',
          fontWeight: 700,
          color: tokens.colors.textPrimary,
          textAlign: 'center',
          textShadow: '0 1px 2px rgba(255, 255, 255, 0.8)',
          letterSpacing: '3px',
        }}
      >
        {String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}
      </div>
    </div>
  );

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: tokens.spacing.md,
        zIndex: tokens.zIndex.dropdown,
      }}
    >
      {digitalDisplay}
      {!isMobile && (
        <div
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: tokens.componentSizes.pc.clock,
            height: tokens.componentSizes.pc.clock,
            padding: tokens.spacing.lg,
            border: `3px solid ${tokens.colors.paperBorder}`,
            borderRadius: tokens.radius.full,
            background: tokens.colors.paperBg,
            boxShadow: `${tokens.shadows.lg}, ${tokens.shadows.inset}`,
            filter: 'drop-shadow(0 8px 24px rgba(139, 115, 85, 0.3))',
            transition: tokens.transitions.base,
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              bottom: '10px',
              left: '10px',
              border: `2px solid ${tokens.colors.paperBorder}`,
              borderRadius: tokens.radius.full,
              opacity: 0.4,
              pointerEvents: 'none',
            }}
          />
          <Clock
            value={new Date(2000, 0, 1, hours, minutes, seconds)}
            size={200}
            renderNumbers={true}
            renderSecondHand={false}
            hourHandLength={60}
            hourHandWidth={5}
            minuteHandLength={80}
            minuteHandWidth={4}
            secondHandLength={90}
            secondHandWidth={2}
            hourMarksLength={12}
            hourMarksWidth={4}
            minuteMarksLength={6}
            minuteMarksWidth={2}
            className="custom-clock"
          />
        </div>
      )}
    </div>
  );
};

export default SimulationClock;
