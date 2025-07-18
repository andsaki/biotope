import React from 'react';
import Clock from 'react-clock';
import 'react-clock/dist/Clock.css';
import './SimulationClock.css';

interface SimulationClockProps {
  simulatedTime: {
    minutes: number;
    seconds: number;
  };
  isDay: boolean;
}

const SimulationClock: React.FC<SimulationClockProps> = ({ simulatedTime, isDay }) => {
  return (
    <div className="simulation-clock-wrapper">
      <Clock
        value={
          new Date(
            0,
            0,
            0,
            Math.floor(simulatedTime.minutes / 60) % 24,
            simulatedTime.minutes % 60,
            simulatedTime.seconds
          )
        }
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
        {isDay ? 'Day' : 'Night'}
      </div>
    </div>
  );
};

export default SimulationClock;
