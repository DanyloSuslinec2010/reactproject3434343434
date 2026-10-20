const GEO_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const WEATHER_URL = 'https://api.open-meteo.com/v1/forecast';

async function request(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Не вдалося отримати дані. Спробуйте пізніше.');
  }
  return response.json();
}

export async function findCity(name) {
  const params = new URLSearchParams({
    name: name.trim(),
    count: '1',
    language: 'uk',
  });
  const data = await request(`${GEO_URL}?${params}`);

  if (!data.results || data.results.length === 0) {
    throw new Error(`Місто "${name}" не знайдено`);
  }

  const city = data.results[0];
  return {
    id: String(city.id),
    name: city.name,
    country: city.country || '',
    lat: city.latitude,
    lon: city.longitude,
  };
}

export async function getCurrentWeather({ lat, lon }) {
  const params = new URLSearchParams({
    latitude: lat,
    longitude: lon,
    current:
      'temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,surface_pressure',
    daily: 'temperature_2m_max,temperature_2m_min,sunrise,sunset',
    timezone: 'auto',
    forecast_days: '1',
    wind_speed_unit: 'ms',
  });
  const data = await request(`${WEATHER_URL}?${params}`);
  const c = data.current;

  return {
    temp: Math.round(c.temperature_2m),
    feelsLike: Math.round(c.apparent_temperature),
    humidity: c.relative_humidity_2m,
    pressure: Math.round(c.surface_pressure * 0.75006),
    wind: Math.round(c.wind_speed_10m),
    code: c.weather_code,
    max: Math.round(data.daily.temperature_2m_max[0]),
    min: Math.round(data.daily.temperature_2m_min[0]),
    sunrise: data.daily.sunrise[0].slice(11, 16),
    sunset: data.daily.sunset[0].slice(11, 16),
    updatedAt: Date.now(),
  };
}

export async function getHourlyForecast({ lat, lon }) {
  const params = new URLSearchParams({
    latitude: lat,
    longitude: lon,
    hourly: 'temperature_2m',
    timezone: 'auto',
    forecast_days: '1',
  });
  const data = await request(`${WEATHER_URL}?${params}`);

  return data.hourly.time.map((time, i) => ({
    time: time.slice(11, 16),
    temp: Math.round(data.hourly.temperature_2m[i]),
  }));
}

export async function getWeekForecast({ lat, lon }) {
  const params = new URLSearchParams({
    latitude: lat,
    longitude: lon,
    daily: 'weather_code,temperature_2m_max,temperature_2m_min',
    timezone: 'auto',
    forecast_days: '7',
  });
  const data = await request(`${WEATHER_URL}?${params}`);

  return data.daily.time.map((date, i) => ({
    date,
    code: data.daily.weather_code[i],
    max: Math.round(data.daily.temperature_2m_max[i]),
    min: Math.round(data.daily.temperature_2m_min[i]),
  }));
}
