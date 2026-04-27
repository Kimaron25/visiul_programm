import React, { useState, useEffect } from 'react';
import SearchBar from './components/SearchBar/SearchBar';
import CurrentWeather from './components/CurrentWeather/CurrentWeather';
import HourlyForecast from './components/HourlyForecast/HourlyForecast';
import DailyForecast from './components/DailyForecast/DailyForecast';
import AirQuality from './components/AirQuality/AirQuality';
import './App.css';

// ВАШ API КЛЮЧ (вставьте сюда)
const API_KEY = '830397ba7de88736061d93269ea0ca4d'; // ЗАМЕНИТЕ НА ВАШ КЛЮЧ

// Функция для определения фона по погоде
const getBackgroundStyle = (weatherCode?: string) => {
  if (!weatherCode) return { background: 'linear-gradient(135deg, #667eea, #764ba2)' };
  
  if (weatherCode.includes('01')) {
    return { background: 'linear-gradient(135deg, #FFD89B, #C7E9FB)' };
  }
  if (weatherCode.includes('02') || weatherCode.includes('03')) {
    return { background: 'linear-gradient(135deg, #B0C4DE, #E0E6F0)' };
  }
  if (weatherCode.includes('09') || weatherCode.includes('10')) {
    return { background: 'linear-gradient(135deg, #4B6F8C, #2C3E50)' };
  }
  if (weatherCode.includes('13')) {
    return { background: 'linear-gradient(135deg, #E6F0FA, #C0D4E8)' };
  }
  return { background: 'linear-gradient(135deg, #667eea, #764ba2)' };
};

function App() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [weatherData, setWeatherData] = useState<any>(null);
  const [airQualityData, setAirQualityData] = useState<any>(null);
  const [city, setCity] = useState('Moscow');
  const [coordinates, setCoordinates] = useState<{ lat: number; lon: number } | null>(null);

  // Получение координат города
  const getCoordinates = async (cityName: string) => {
    try {
      const response = await fetch(
        `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`
      );
      const data = await response.json();
      
      if (data.length === 0) {
        throw new Error('Город не найден');
      }
      
      return {
        lat: data[0].lat,
        lon: data[0].lon,
        name: data[0].name
      };
    } catch (err) {
      throw new Error('Не удалось найти город');
    }
  };

  // Получение прогноза погоды
  const getWeather = async (lat: number, lon: number) => {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
    );
    return await response.json();
  };

  // Получение качества воздуха
  const getAirQuality = async (lat: number, lon: number) => {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`
    );
    return await response.json();
  };

  // Основная функция загрузки всех данных
  const fetchAllData = async (cityName: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // 1. Получаем координаты
      const coords = await getCoordinates(cityName);
      setCoordinates(coords);
      setCity(coords.name);
      
      // 2. Получаем погоду
      const weather = await getWeather(coords.lat, coords.lon);
      setWeatherData(weather);
      
      // 3. Получаем качество воздуха
      const airQuality = await getAirQuality(coords.lat, coords.lon);
      setAirQualityData(airQuality);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки данных');
    } finally {
      setLoading(false);
    }
  };

  // Загрузка при старте
  useEffect(() => {
    fetchAllData('Moscow');
    
    // Обновление каждые 3 часа
    const interval = setInterval(() => {
      if (coordinates) {
        fetchAllData(city);
      }
    }, 3 * 60 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  // Получаем текущую погоду
  const getCurrentWeather = () => {
    if (!weatherData || !weatherData.list || weatherData.list.length === 0) return null;
    
    const current = weatherData.list[0];
    return {
      temp: Math.round(current.main.temp),
      feelsLike: Math.round(current.main.feels_like),
      description: current.weather[0].description,
      iconCode: current.weather[0].icon,
      humidity: current.main.humidity,
      windSpeed: current.wind.speed,
      cityName: city
    };
  };

  // Получаем почасовой прогноз (на 24 часа)
  const getHourlyForecast = () => {
    if (!weatherData || !weatherData.list) return [];
    return weatherData.list.slice(0, 8); // первые 8 записей = 24 часа
  };

  // Получаем дневной прогноз (уникальные дни)
  const getDailyForecast = () => {
    if (!weatherData || !weatherData.list) return [];
    
    const dailyMap = new Map();
    
    weatherData.list.forEach((item: any) => {
      const date = item.dt_txt.split(' ')[0];
      if (!dailyMap.has(date)) {
        dailyMap.set(date, {
          date: date,
          tempMax: item.main.temp_max,
          tempMin: item.main.temp_min,
          iconCode: item.weather[0].icon,
          description: item.weather[0].description
        });
      } else {
        const existing = dailyMap.get(date);
        existing.tempMax = Math.max(existing.tempMax, item.main.temp_max);
        existing.tempMin = Math.min(existing.tempMin, item.main.temp_min);
      }
    });
    
    return Array.from(dailyMap.values()).slice(0, 5);
  };

  // Получаем качество воздуха
  const getAirQualityInfo = () => {
    if (!airQualityData || !airQualityData.list || airQualityData.list.length === 0) return null;
    
    const aqi = airQualityData.list[0].main.aqi;
    const components = airQualityData.list[0].components;
    
    const aqiText = {
      1: { text: 'Отлично', color: '#4CAF50' },
      2: { text: 'Хорошо', color: '#8BC34A' },
      3: { text: 'Удовлетворительно', color: '#FFC107' },
      4: { text: 'Плохо', color: '#FF9800' },
      5: { text: 'Очень плохо', color: '#F44336' }
    }[aqi];
    
    return {
      aqi,
      aqiText: aqiText?.text || 'Нет данных',
      color: aqiText?.color || '#999',
      components
    };
  };

  const currentWeather = getCurrentWeather();
  const hourlyForecast = getHourlyForecast();
  const dailyForecast = getDailyForecast();
  const airQuality = getAirQualityInfo();

  if (loading) {
    return (
      <div className="loading-spinner" style={getBackgroundStyle()}>
        <div className="spinner"></div>
        <span>Загрузка погоды...</span>
      </div>
    );
  }

  return (
    <div className="app" style={getBackgroundStyle(currentWeather?.iconCode)}>
      <div className="container">
        <SearchBar onSearch={fetchAllData} isLoading={loading} />
        
        {error && (
          <div className="error-message">
            <p>⚠️ {error}</p>
            <button onClick={() => fetchAllData(city)}>Повторить</button>
          </div>
        )}
        
        {currentWeather && (
          <>
            <CurrentWeather
              temp={currentWeather.temp}
              feelsLike={currentWeather.feelsLike}
              description={currentWeather.description}
              iconCode={currentWeather.iconCode}
              humidity={currentWeather.humidity}
              windSpeed={currentWeather.windSpeed}
              cityName={currentWeather.cityName}
            />
            
            <HourlyForecast forecasts={hourlyForecast} />
            
            <div className="forecast-section">
              <h2 className="section-title">Прогноз на 5 дней</h2>
              <DailyForecast forecasts={dailyForecast} />
            </div>
            
            {airQuality && (
              <AirQuality airQuality={airQuality} />
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default App;