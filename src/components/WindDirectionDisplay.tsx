import React from 'react';
import './WindDirectionDisplay.css';

interface WindDirectionDisplayProps {
  windDirection: "North" | "East" | "South" | "West";
}

const windDirectionMap = {
  North: { rotation: 0, label: '北', kanji: '北' },
  East: { rotation: 90, label: '東', kanji: '東' },
  South: { rotation: 180, label: '南', kanji: '南' },
  West: { rotation: 270, label: '西', kanji: '西' },
};

const WindDirectionDisplay: React.FC<WindDirectionDisplayProps> = ({ windDirection }) => {
  const { rotation, kanji } = windDirectionMap[windDirection];

  return (
    <div className="wind-direction-display">
      {/* コンパス本体 */}
      <div className="compass-container">
        {/* 外側のリング */}
        <div className="compass-ring">
          {/* 方位マーク */}
          <div className="compass-mark north">N</div>
          <div className="compass-mark east">E</div>
          <div className="compass-mark south">S</div>
          <div className="compass-mark west">W</div>
        </div>

        {/* 中央の風向き矢印 */}
        <div className="wind-arrow-wrapper" style={{ transform: `rotate(${rotation}deg)` }}>
          <svg width="40" height="40" viewBox="0 0 40 40" className="wind-arrow-svg">
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
        <div className="compass-center"></div>
      </div>

      {/* 風向き表示 */}
      <div className="wind-label">
        <span className="wind-kanji">{kanji}</span>
        <span className="wind-text">の風</span>
      </div>
    </div>
  );
};

export default WindDirectionDisplay;
