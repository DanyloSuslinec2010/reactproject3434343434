// Open-Meteo: безкоштовний API, ключ не потрібен
const GEO_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';

async function getJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Не вдалося отримати дані. Спробуйте пізніше');
  }
  return response.json();
}

// Пошук міста по назві
export async function findCity(name) {
  const data = await getJson(
    `${GEO_URL}?name=${encodeURIComponent(name)}&count=1&language=uk`,
  );

  if (!data.results || data.results.length === 0) {
    throw new Error(`Місто "${name}" не знайдено`);
  }

  const city = data.results[0];
  return {
    id: city.id,
    name: city.name,
    country: city.country || '',
    lat: city.latitude,
    lon: city.longitude,
  };
}

// Поточна погода + мін/макс за сьогодні
export async function fetchCurrent({ lat, lon }) {
  const data = await getJson(
    `${FORECAST_URL}?latitude=${lat}&longitude=${lon}` +
      '&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,surface_pressure' +
      '&daily=temperature_2m_max,temperature_2m_min&forecast_days=1&timezone=auto',
  );

  const { current, daily } = data;
  return {
    temp: Math.round(current.temperature_2m),
    feels: Math.round(current.apparent_temperature),
    humidity: current.relative_humidity_2m,
    wind: Math.round(current.wind_speed_10m),
    pressure: Math.round(current.surface_pressure),
    code: current.weather_code,
    min: Math.round(daily.temperature_2m_min[0]),
    max: Math.round(daily.temperature_2m_max[0]),
    updatedAt: Date.now(),
  };
}

// Погодинний прогноз на сьогодні
export async function fetchHourly({ lat, lon }) {
  const data = await getJson(
    `${FORECAST_URL}?latitude=${lat}&longitude=${lon}` +
      '&hourly=temperature_2m&forecast_days=1&timezone=auto',
  );

  return {
    times: data.hourly.time.map(t => t.slice(11, 16)),
    temps: data.hourly.temperature_2m.map(t => Math.round(t)),
  };
}

// Прогноз на 7 днів
export async function fetchWeek({ lat, lon }) {
  const data = await getJson(
    `${FORECAST_URL}?latitude=${lat}&longitude=${lon}` +
      '&daily=weather_code,temperature_2m_max,temperature_2m_min&forecast_days=7&timezone=auto',
  );

  const { daily } = data;
  return daily.time.map((date, i) => ({
    date,
    code: daily.weather_code[i],
    max: Math.round(daily.temperature_2m_max[i]),
    min: Math.round(daily.temperature_2m_min[i]),
  }));
}
