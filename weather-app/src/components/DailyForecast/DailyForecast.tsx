import React from 'react';
import './DailyForecast.css';

interface DailyForecastProps {
  forecasts: any[];
}

const DailyForecast: React.FC<DailyForecastProps> = ({ forecasts }) => {
  const formatDay = (dateStr: string) => {
    const date = new Date(dateStr);
    const days = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
    return days[date.getDay()];
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getDate()}.${date.getMonth() + 1}`;
  };

  return (
    <div className="daily-forecast">
      {forecasts.map((forecast, index) => (
        <div key={index} className="daily-item">
          <div className="daily-info">
            <div className="daily-day">{formatDay(forecast.date)}</div>
            <div className="daily-date">{formatDate(forecast.date)}</div>
          </div>
          <img 
            src={`https://openweathermap.org/img/wn/${forecast.iconCode}.png`} 
            alt={forecast.description}
            className="daily-icon"
          />
          <div className="daily-temp">
            <span className="temp-max">{Math.round(forecast.tempMax)}°</span>
            <span className="temp-min">{Math.round(forecast.tempMin)}°</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DailyForecast;