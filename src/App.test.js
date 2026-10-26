import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import App from './App';

const mockGetForecast = jest.fn(() => Promise.resolve(null));
const mockGetWeeklyForecast = jest.fn();
const mockSearchCity = jest.fn();
const mockWeather = {
  current: {
    time: '2026-10-26T12:00',
    temperature_2m: 10,
    apparent_temperature: 6,
    relative_humidity_2m: 68,
    wind_speed_10m: 11.412,
    pressure_msl: 1007.2,
    visibility: 24140,
    precipitation: 0,
    weather_code: 3,
  },
  hourly: {
    time: Array.from({ length: 24 }, (_, hour) => `2026-10-26T${String(hour).padStart(2, '0')}:00`),
    temperature_2m: Array.from({ length: 24 }, (_, hour) => 8 + hour % 6),
    precipitation_probability: Array.from({ length: 24 }, () => 0),
  },
  daily: {
    time: ['2026-10-26'],
    temperature_2m_min: [7],
    temperature_2m_max: [13],
    sunrise: ['2026-10-26T06:43'],
    sunset: ['2026-10-26T16:44'],
  },
};

jest.mock('react-chartjs-2', () => ({
  Line: () => null,
}));

jest.mock('./services/weather', () => ({
  getForecast: (...args) => mockGetForecast(...args),
  getWeeklyForecast: (...args) => mockGetWeeklyForecast(...args),
  searchCity: (...args) => mockSearchCity(...args),
}));

beforeEach(() => {
  window.localStorage.clear();
  mockGetForecast.mockClear();
  mockGetForecast.mockResolvedValue(mockWeather);
  mockGetWeeklyForecast.mockClear();
  mockSearchCity.mockReset();
  mockSearchCity.mockResolvedValue({
    id: 'paris-france',
    name: 'Paris',
    country: 'France',
    latitude: 48.85,
    longitude: 2.35,
  });
  mockGetWeeklyForecast.mockResolvedValue({
    daily: {
      time: [
        '2026-10-26', '2026-10-27', '2026-10-28', '2026-10-29',
        '2026-10-30', '2026-10-31', '2026-11-01',
      ],
      weather_code: [0, 1, 2, 3, 45, 51, 61],
      temperature_2m_max: [13, 14, 12, 11, 10, 9, 8],
      temperature_2m_min: [7, 8, 6, 5, 4, 3, 2],
    },
  });
});

test('renders the weather dashboard', async () => {
  render(<App />);
  await act(async () => {
    await Promise.resolve();
  });

  expect(screen.getByRole('heading', { name: /weather dashboard/i })).toBeInTheDocument();
  expect(screen.getByText(/create your personal list of favorite cities/i)).toBeInTheDocument();
  expect(screen.getByRole('searchbox', { name: /search for a city/i })).toBeInTheDocument();
  expect(screen.queryByText(/your places, your forecast/i)).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: /use my location/i })).not.toBeInTheDocument();
  expect(screen.queryByText(/live weather/i)).not.toBeInTheDocument();
  expect(screen.getByRole('heading', { name: /stories under the sky/i })).toBeInTheDocument();
  expect(screen.getAllByText('Feels like')).toHaveLength(1);
  expect(screen.getByText('1007 hPa')).toBeInTheDocument();
  expect(screen.getByText('3.17 m/s')).toBeInTheDocument();
  expect(screen.getByText('>24 km')).toBeInTheDocument();
  expect(screen.getByText('Min °C')).toBeInTheDocument();
  expect(screen.getByText('Max °C')).toBeInTheDocument();
  expect(screen.getByRole('region', { name: 'Kyiv weather details' })).toBeInTheDocument();
  expect(screen.queryByText(/right now in/i)).not.toBeInTheDocument();
  expect(screen.queryByText(/kyiv \/ today/i)).not.toBeInTheDocument();
  expect(screen.queryByText('Overcast')).not.toBeInTheDocument();
  expect(screen.getByRole('heading', { name: /hourly forecast/i })).toBeInTheDocument();
  expect(document.querySelector('.hourly-chart')).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: /7-day forecast/i })).toBeInTheDocument();
  expect(screen.getByText(/choose weekly forecast on a city card/i)).toBeInTheDocument();
  fireEvent.click(screen.getAllByRole('button', { name: 'Weekly forecast' })[0]);
  await waitFor(() => expect(document.querySelectorAll('.week-row')).toHaveLength(7));
});

test('updates the standalone weather section when another city is selected', async () => {
  render(<App />);
  await act(async () => {
    await Promise.resolve();
  });

  fireEvent.click(screen.getAllByRole('button', { name: 'See more' })[1]);

  expect(screen.getByRole('region', { name: 'London weather details' })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: /hourly forecast/i })).toBeInTheDocument();
  expect(screen.queryByText(/right now in/i)).not.toBeInTheDocument();
  expect(screen.queryByText('Overcast')).not.toBeInTheDocument();
  fireEvent.click(screen.getAllByRole('button', { name: 'Weekly forecast' })[1]);
  await waitFor(() => expect(document.querySelectorAll('.week-row')).toHaveLength(7));
  expect(mockGetWeeklyForecast).toHaveBeenCalledWith(expect.objectContaining({ name: 'London' }));
});

test('keeps an intentionally empty city list after reload', async () => {
  window.localStorage.setItem('weather-cities', '[]');

  render(<App />);

  expect(screen.getByText('Your city list is empty.')).toBeInTheDocument();
  expect(window.localStorage.getItem('weather-cities')).toBe('[]');
  expect(mockGetForecast).not.toHaveBeenCalled();
});

test('saves a registered user profile and greets them in the header', async () => {
  render(<App />);

  fireEvent.click(screen.getAllByRole('button', { name: 'Sign up' })[0]);
  fireEvent.change(screen.getByLabelText('Your name'), { target: { value: 'Alex Morgan' } });
  fireEvent.change(screen.getByLabelText('Email address'), { target: { value: 'alex@example.com' } });
  fireEvent.click(screen.getByRole('button', { name: 'Create account' }));

  await waitFor(() => expect(screen.getByText('Hi, Alex Morgan')).toBeInTheDocument());
  expect(JSON.parse(window.localStorage.getItem('weather-user'))).toEqual({
    name: 'Alex Morgan',
    email: 'alex@example.com',
  });
});

test('searches for and adds a city with its current forecast', async () => {
  render(<App />);

  fireEvent.change(screen.getByRole('searchbox', { name: /search for a city/i }), {
    target: { value: 'Paris' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Search location' }));

  await waitFor(() => expect(screen.getByText('Paris')).toBeInTheDocument());
  expect(mockSearchCity).toHaveBeenCalledWith('Paris');
  expect(mockGetForecast).toHaveBeenCalledWith(expect.objectContaining({ name: 'Paris' }));
  expect(JSON.parse(window.localStorage.getItem('weather-cities'))).toEqual(
    expect.arrayContaining([expect.objectContaining({ name: 'Paris' })]),
  );
});
