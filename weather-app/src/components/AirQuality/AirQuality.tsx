import React from 'react';
import './AirQuality.css';

interface AirQualityProps {
  airQuality: {
    aqi: number;
    aqiText: string;
    color: string;
    components: any;
  };
}

const AirQuality: React.FC<AirQualityProps> = ({ airQuality }) => {
  // Исправляем возможную опечатку в тексте
  const getCorrectText = (text: string) => {
    const corrections: { [key: string]: string } = {
      'Повлетворительно': 'Удовлетворительно',
      'повлетворительно': 'Удовлетворительно',
      'Отлично': 'Отлично',
      'Хорошо': 'Хорошо',
      'Плохо': 'Плохо',
      'Очень плохо': 'Очень плохо'
    };
    return corrections[text] || text;
  };

  const correctText = getCorrectText(airQuality.aqiText);

  return (
    <div className="air-quality">
      <h2 className="section-title">Качество воздуха</h2>
      <div className="air-quality-content">
        <div className="aqi-indicator" style={{ borderColor: airQuality.color }}>
          <div className="aqi-value" style={{ color: airQuality.color }}>
            {airQuality.aqi}
          </div>
          <div className="aqi-text" style={{ color: airQuality.color }}>
            {correctText}
          </div>
        </div>
        <div className="pollutants">
          <div className="pollutant">
            <span>PM2.5</span>
            <span>{airQuality.components?.pm2_5?.toFixed(1)} μg/m³</span>
          </div>
          <div className="pollutant">
            <span>PM10</span>
            <span>{airQuality.components?.pm10?.toFixed(1)} μg/m³</span>
          </div>
          <div className="pollutant">
            <span>NO₂</span>
            <span>{airQuality.components?.no2?.toFixed(1)} μg/m³</span>
          </div>
          <div className="pollutant">
            <span>O₃</span>
            <span>{airQuality.components?.o3?.toFixed(1)} μg/m³</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AirQuality;