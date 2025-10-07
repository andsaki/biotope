import React from 'react';
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

const SimulationClock: React.FC<SimulationClockProps> = ({ realTime, simulatedTime, isDay }) => {
  // リアルタイムがある場合はそれを使用、なければシミュレーション時間を使用
  const hours = realTime ? realTime.hours : Math.floor((simulatedTime?.minutes || 0) / 60) % 24;
  const minutes = realTime ? realTime.minutes : (simulatedTime?.minutes || 0) % 60;
  const seconds = realTime ? realTime.seconds : (simulatedTime?.seconds || 0);

  return (
    <div className="clock-container">
      <div className="simulation-clock-wrapper">
        <Clock
          value={new Date(0, 0, 0, hours, minutes, seconds)}
          size={window.innerWidth > 768 ? 200 : 100} // Adjust size based on screen width
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
        <div className="day-night-indicator">
          {isDay ? '昼' : '夜'}
        </div>
      </div>
      {realTime && (
        <div className="time-display">
          日本時間: {String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </div>
      )}
    </div>
  );
};

export default SimulationClock;
