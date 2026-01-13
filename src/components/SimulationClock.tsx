import React from 'react';
import Clock from 'react-clock';
import 'react-clock/dist/Clock.css';
import { useTime } from '../contexts/TimeContext';
import { useIsMobile } from '@/hooks/useIsMobile';
import styles from './SimulationClock.module.css';

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
    <div className={styles.digitalDisplayWrapper}>
      <div className={`${styles.digitalTime} ${isMobile ? styles.mobile : ''}`}>
        {String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}
      </div>
    </div>
  );

  return (
    <div className={styles.container}>
      {digitalDisplay}
      {!isMobile && (
        <div className={styles.clockContainer}>
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
