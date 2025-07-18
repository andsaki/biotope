import React, { useState, useEffect } from 'react';
import Clock from 'react-clock';
import 'react-clock/dist/Clock.css';
import './UI.css'; // Import styles

const CustomClock: React.FC = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timerId = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => {
      clearInterval(timerId);
    };
  }, []);

  return (
    <div className="clock-wrapper">
      <Clock
          value={time}
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
  );
};

export default CustomClock;
