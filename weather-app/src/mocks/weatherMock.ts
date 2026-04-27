// Моковые данные прогноза погоды (первые 12 часов)
export const mockWeatherData = {
  list: [
    {
      dt: Math.floor(Date.now() / 1000), // текущее время
      main: {
        temp: 22,
        feels_like: 21,
        humidity: 65,
        pressure: 1013
      },
      weather: [
        {
          id: 800,
          main: "Clear",
          description: "ясно",
          icon: "01d"
        }
      ],
      wind: {
        speed: 3.5,
        deg: 180
      },
      clouds: { all: 0 },
      visibility: 10000,
      dt_txt: new Date().toISOString()
    },
    {
      dt: Math.floor(Date.now() / 1000) + 3 * 3600, // через 3 часа
      main: {
        temp: 21,
        feels_like: 20,
        humidity: 68,
        pressure: 1012
      },
      weather: [
        {
          id: 801,
          main: "Clouds",
          description: "малооблачно",
          icon: "02d"
        }
      ],
      wind: {
        speed: 4.2,
        deg: 190
      },
      clouds: { all: 25 },
      visibility: 10000,
      dt_txt: new Date(Date.now() + 3 * 3600000).toISOString()
    },
    {
      dt: Math.floor(Date.now() / 1000) + 6 * 3600, // через 6 часов
      main: {
        temp: 19,
        feels_like: 18,
        humidity: 72,
        pressure: 1011
      },
      weather: [
        {
          id: 500,
          main: "Rain",
          description: "небольшой дождь",
          icon: "10d"
        }
      ],
      wind: {
        speed: 5.0,
        deg: 200
      },
      clouds: { all: 75 },
      visibility: 8000,
      dt_txt: new Date(Date.now() + 6 * 3600000).toISOString()
    }
  ],
  city: {
    name: "Москва",
    country: "RU"
  }
};

// Моковые данные качества воздуха
export const mockAirQualityData = {
  list: [
    {
      main: {
        aqi: 2  // 1=отлично, 2=хорошо, 3=удовлетворительно, 4=плохо, 5=очень плохо
      },
      components: {
        co: 201.94,      // монооксид углерода
        no: 0.018,       // оксид азота
        no2: 3.85,       // диоксид азота
        o3: 68.66,       // озон
        so2: 0.45,       // диоксид серы
        pm2_5: 1.29,     // мелкие частицы PM2.5
        pm10: 2.37,      // частицы PM10
        nh3: 0.32        // аммиак
      }
    }
  ]
};