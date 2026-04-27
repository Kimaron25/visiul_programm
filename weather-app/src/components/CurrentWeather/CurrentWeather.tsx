import React from 'react';
import './CurrentWeather.css';

interface CurrentWeatherProps {
  temp: number;
  feelsLike: number;
  description: string;
  iconCode: string;
  humidity: number;
  windSpeed: number;
  cityName: string;
}

const CurrentWeather: React.FC<CurrentWeatherProps> = ({
  temp,
  feelsLike,
  description,
  iconCode,
  humidity,
  windSpeed,
  cityName
}) => {
  const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@4x.png`;

  return (
    <div className="current-weather">
      <h2 className="city-name">{cityName}</h2>
      <div className="weather-main">
        <img src={iconUrl} alt={description} className="weather-icon" />
        <div className="temperature">
          <span className="temp-value">{Math.round(temp)}</span>
          <span className="temp-unit">°C</span>
        </div>
      </div>
      <p className="weather-description">{description}</p>
      <div className="weather-details">
        <div className="detail">
          <span className="detail-label">Ощущается как</span>
          <span className="detail-value">{Math.round(feelsLike)}°C</span>
        </div>
        <div className="detail">
          <span className="detail-label">Влажность</span>
          <span className="detail-value">{humidity}%</span>
        </div>
        <div className="detail">
          <span className="detail-label">Ветер</span>
          <span className="detail-value">{windSpeed} м/с</span>
        </div>
      </div>
    </div>
  );
};

export default CurrentWeather;