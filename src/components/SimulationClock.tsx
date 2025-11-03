import React, { useState, useEffect } from 'react';
import Clock from 'react-clock';
import 'react-clock/dist/Clock.css';
import './SimulationClock.css';
import { useTime } from '../contexts/TimeContext';

/**
 * シミュレーション時計コンポーネント
 * リアルタイムを表示するアナログ時計
 */
const SimulationClock: React.FC = () => {
  const { realTime } = useTime();

  const hours = realTime.hours;
  const minutes = realTime.minutes;
  const seconds = realTime.seconds;

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="clock-container">
      {isMobile ? (
        // SP: デジタル表示のみ
        <div className="digital-clock-wrapper">
          <div className="digital-time">
            {String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}
          </div>
        </div>
      ) : (
        // PC: アナログ時計
        <div className="simulation-clock-wrapper">
          <Clock
            value={new Date(0, 0, 0, hours, minutes, seconds)}
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
