import React from 'react';
import './HourlyForecast.css';

interface HourlyForecastProps {
  forecasts: any[];
}

const HourlyForecast: React.FC<HourlyForecastProps> = ({ forecasts }) => {
  const formatTime = (dt_txt: string) => {
    const date = new Date(dt_txt);
    return date.getHours().toString().padStart(2, '0') + ':00';
  };

  return (
    <div className="hourly-forecast">
      <h2 className="section-title">Почасовой прогноз</h2>
      <div className="hourly-list">
        {forecasts.map((forecast, index) => (
          <div key={index} className="hourly-item">
            <div className="hourly-time">{formatTime(forecast.dt_txt)}</div>
            <img 
              src={`https://openweathermap.org/img/wn/${forecast.weather[0].icon}.png`} 
              alt={forecast.weather[0].description}
              className="hourly-icon"
            />
            <div className="hourly-temp">{Math.round(forecast.main.temp)}°</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HourlyForecast;