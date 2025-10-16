import React, { useState, useEffect } from 'react';
import Clock from 'react-clock';
import 'react-clock/dist/Clock.css';
import './SimulationClock.css';

interface SimulationClockProps {
  realTime?: {
    hours: number;
    minutes: number;
    seconds: number;
  };
  simulatedTime?: {
    minutes: number;
    seconds: number;
  };
  isDay: boolean;
}

const SimulationClock: React.FC<SimulationClockProps> = ({ realTime, simulatedTime }) => {
  // リアルタイムがある場合はそれを使用、なければシミュレーション時間を使用
  const hours = realTime ? realTime.hours : Math.floor((simulatedTime?.minutes || 0) / 60) % 24;
  const minutes = realTime ? realTime.minutes : (simulatedTime?.minutes || 0) % 60;
  const seconds = realTime ? realTime.seconds : (simulatedTime?.seconds || 0);

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
