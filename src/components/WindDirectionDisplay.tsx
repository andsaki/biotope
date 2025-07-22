import React from 'react';
import './WindDirectionDisplay.css';

interface WindDirectionDisplayProps {
  windDirection: "North" | "East" | "South" | "West";
}

const WindDirectionDisplay: React.FC<WindDirectionDisplayProps> = ({ windDirection }) => {
  return (
    <div className="wind-direction-display">
      <h3 style={{ margin: 0, marginBottom: 10 }}>風向き</h3>
      <div className="wind-arrow-container">
        <div className="wind-arrow" style={{ transform: `rotate(${windDirection === "North" ? 0 : windDirection === "East" ? 90 : windDirection === "South" ? 180 : 270}deg)` }}>→</div>
      </div>
      <p>{windDirection}</p>
    </div>
  );
};

export default WindDirectionDisplay;
