const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';

async function readResponse(response) {
  if (!response.ok) {
    throw new Error(`Weather service returned ${response.status}.`);
  }

  return response.json();
}

export async function searchCity(query) {
  const params = new URLSearchParams({
    name: query,
    count: '1',
    language: 'en',
    format: 'json',
  });
  const response = await fetch(`${GEOCODING_URL}?${params.toString()}`);
  const result = await readResponse(response);
  const city = result.results?.[0];

  if (!city) {
    throw new Error('No city found. Check the spelling and try again.');
  }

  return {
    id: `${city.name.toLowerCase()}-${city.country_code.toLowerCase()}-${city.latitude.toFixed(2)}-${city.longitude.toFixed(2)}`,
    name: city.name,
    country: city.country,
    latitude: city.latitude,
    longitude: city.longitude,
  };
}

export async function getForecast(place) {
  const params = new URLSearchParams({
    latitude: String(place.latitude),
    longitude: String(place.longitude),
    current: [
      'temperature_2m',
      'relative_humidity_2m',
      'apparent_temperature',
      'is_day',
      'precipitation',
      'weather_code',
      'wind_speed_10m',
    ].join(','),
    hourly: 'temperature_2m,precipitation_probability',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset',
    timezone: 'auto',
    forecast_days: '1',
  });
  const response = await fetch(`${FORECAST_URL}?${params.toString()}`);
  return readResponse(response);
}

export async function getWeeklyForecast(place) {
  const params = new URLSearchParams({
    latitude: String(place.latitude),
    longitude: String(place.longitude),
    daily: 'weather_code,temperature_2m_max,temperature_2m_min',
    timezone: 'auto',
    forecast_days: '7',
  });
  const response = await fetch(`${FORECAST_URL}?${params.toString()}`);
  return readResponse(response);
}
