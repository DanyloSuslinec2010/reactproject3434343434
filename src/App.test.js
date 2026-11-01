import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { webcrypto } from 'crypto';
import { TextEncoder } from 'util';
import App from './App';

const mockGetForecast = jest.fn(() => Promise.resolve(null));
const mockGetWeeklyForecast = jest.fn();
const mockSearchCity = jest.fn();
const mockGetNews = jest.fn();
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

jest.mock('./services/newsApi', () => ({
  getNews: (...args) => mockGetNews(...args),
}));

beforeEach(() => {
  Object.defineProperty(global, 'TextEncoder', {
    configurable: true,
    value: TextEncoder,
  });
  Object.defineProperty(window, 'crypto', {
    configurable: true,
    value: webcrypto,
  });
  window.localStorage.clear();
  mockGetForecast.mockClear();
  mockGetForecast.mockResolvedValue(mockWeather);
  mockGetWeeklyForecast.mockClear();
  mockGetNews.mockReset();
  mockGetNews.mockResolvedValue([{
    id: 'news-1',
    title: 'Latest weather story',
    source: 'weather.example.com',
    points: 12,
    date: '2026-11-01T10:00:00Z',
    url: 'https://example.com/weather-story',
  }]);
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
  expect(screen.queryByRole('region', { name: 'Kyiv weather details' })).not.toBeInTheDocument();
  expect(screen.queryByRole('heading', { name: 'Hourly forecast' })).not.toBeInTheDocument();
  expect(screen.queryByRole('heading', { name: '7-day forecast' })).not.toBeInTheDocument();
  fireEvent.click(screen.getAllByRole('button', { name: 'Hourly forecast' })[0]);
  expect(screen.getByRole('heading', { name: 'Hourly forecast' })).toBeInTheDocument();
  expect(screen.getByRole('region', { name: 'Kyiv weather details' })).toBeInTheDocument();
  expect(screen.getByText('Temperature')).toBeInTheDocument();
  expect(screen.getByText('Feels like 6°C')).toBeInTheDocument();
  expect(screen.getByText('1007 hPa')).toBeInTheDocument();
  expect(screen.getByText('3.17 m/s')).toBeInTheDocument();
  expect(screen.getByText('>24 km')).toBeInTheDocument();
  expect(screen.getByText('Min °C')).toBeInTheDocument();
  expect(screen.getByText('Max °C')).toBeInTheDocument();
  fireEvent.click(screen.getAllByRole('button', { name: 'Hourly forecast' })[0]);
  expect(screen.queryByRole('heading', { name: 'Hourly forecast' })).not.toBeInTheDocument();
  expect(screen.queryByRole('region', { name: 'Kyiv weather details' })).not.toBeInTheDocument();
  expect(await screen.findByText('Latest weather story')).toBeInTheDocument();
  expect(screen.getByText('Source: weather.example.com')).toBeInTheDocument();
  expect(document.querySelectorAll('.news-grid .news-card')).toHaveLength(4);
  expect(document.querySelector('.news-section a')).not.toBeInTheDocument();
  expect(screen.queryByText(/right now in/i)).not.toBeInTheDocument();
  expect(screen.queryByText(/kyiv \/ today/i)).not.toBeInTheDocument();
  expect(screen.queryByText('Overcast')).not.toBeInTheDocument();
  fireEvent.click(screen.getAllByRole('button', { name: 'Weekly forecast' })[0]);
  await waitFor(() => expect(document.querySelectorAll('.week-row')).toHaveLength(7));
  fireEvent.click(screen.getAllByRole('button', { name: 'Weekly forecast' })[0]);
  expect(screen.queryByRole('heading', { name: '7-day forecast' })).not.toBeInTheDocument();
});

test('refreshes news automatically every 15 minutes', async () => {
  jest.useFakeTimers();
  mockGetNews
    .mockResolvedValueOnce([{
      id: 'news-1',
      title: 'Latest weather story',
      source: 'weather.example.com',
      points: 12,
      date: '2026-11-01T10:00:00Z',
    }])
    .mockResolvedValueOnce([{
      id: 'news-2',
      title: 'Updated weather story',
      source: 'forecast.example.com',
      points: 14,
      date: '2026-11-01T10:15:00Z',
    }]);

  try {
    render(<App />);
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(screen.getByText('Latest weather story')).toBeInTheDocument();
    expect(document.querySelectorAll('.news-grid .news-card')).toHaveLength(4);
    const firstImageBeforeRefresh = document.querySelector('.news-card__image').style.backgroundImage;

    await act(async () => {
      jest.advanceTimersByTime(15 * 60 * 1000);
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(screen.getByText('Updated weather story')).toBeInTheDocument();
    expect(document.querySelectorAll('.news-grid .news-card')).toHaveLength(4);
    expect(document.querySelector('.news-card__image').style.backgroundImage)
      .not.toBe(firstImageBeforeRefresh);
    expect(document.querySelector('.news-section a')).not.toBeInTheDocument();
    expect(mockGetNews).toHaveBeenCalledTimes(2);
  } finally {
    jest.useRealTimers();
  }
});

test('refreshes news when the browser tab regains focus', async () => {
  mockGetNews
    .mockResolvedValueOnce([{
      id: 'news-before-focus',
      title: 'Earlier weather story',
      date: '2026-11-01T10:00:00Z',
    }])
    .mockResolvedValueOnce([{
      id: 'news-after-focus',
      title: 'Fresh weather story',
      date: '2026-11-01T11:00:00Z',
    }]);

  render(<App />);
  expect(await screen.findByText('Earlier weather story')).toBeInTheDocument();

  act(() => {
    window.dispatchEvent(new Event('focus'));
  });

  expect(await screen.findByText('Fresh weather story')).toBeInTheDocument();
  expect(mockGetNews).toHaveBeenCalledTimes(2);
});

test('updates the standalone weather section when another city is selected', async () => {
  mockGetForecast.mockImplementation((place) => Promise.resolve({
    ...mockWeather,
    current: {
      ...mockWeather.current,
      temperature_2m: place.name === 'London' ? 22 : 10,
      apparent_temperature: place.name === 'London' ? 19 : 6,
    },
  }));
  render(<App />);
  await act(async () => {
    await Promise.resolve();
  });

  await waitFor(() => {
    expect(within(screen.getByText('London').closest('.city-card')).getByText('22°C')).toBeInTheDocument();
  });
  fireEvent.click(screen.getByText('London').closest('.city-card').querySelector('.city-card__main'));

  expect(screen.getByRole('region', { name: 'London weather details' })).toBeInTheDocument();
  const londonDetails = screen.getByRole('region', { name: 'London weather details' });
  expect(within(londonDetails).getByText('22°C')).toBeInTheDocument();
  expect(within(londonDetails).getByText('Feels like 19°C')).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: /hourly forecast/i })).toBeInTheDocument();
  expect(screen.queryByText(/right now in/i)).not.toBeInTheDocument();
  expect(screen.queryByText('Overcast')).not.toBeInTheDocument();
  fireEvent.click(screen.getAllByRole('button', { name: 'Weekly forecast' })[1]);
  await waitFor(() => expect(document.querySelectorAll('.week-row')).toHaveLength(7));
  expect(mockGetWeeklyForecast).toHaveBeenCalledWith(expect.objectContaining({ name: 'London' }));
  fireEvent.click(screen.getAllByRole('button', { name: 'Weekly forecast' })[1]);
  expect(screen.queryByRole('heading', { name: '7-day forecast' })).not.toBeInTheDocument();
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
  fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'Alex Morgan' } });
  fireEvent.change(screen.getByLabelText('E-Mail'), { target: { value: 'alex@example.com' } });
  fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'secret-password' } });
  fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Sign up' }));

  await waitFor(() => expect(screen.getByText('Hi, Alex Morgan')).toBeInTheDocument());
  expect(JSON.parse(window.localStorage.getItem('weather-user'))).toEqual({
    name: 'Alex Morgan',
    email: 'alex@example.com',
  });
  expect(JSON.parse(window.localStorage.getItem('weather-credentials'))['alex@example.com'])
    .toMatchObject({ name: 'Alex Morgan' });
  expect(JSON.parse(window.localStorage.getItem('weather-credentials'))['alex@example.com'].hash)
    .not.toBe('secret-password');
});

test('signs back in with the registered email and password', async () => {
  render(<App />);

  fireEvent.click(screen.getAllByRole('button', { name: 'Sign up' })[0]);
  fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'Alex Morgan' } });
  fireEvent.change(screen.getByLabelText('E-Mail'), { target: { value: 'alex@example.com' } });
  fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'secret-password' } });
  fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Sign up' }));
  await waitFor(() => expect(screen.getByText('Hi, Alex Morgan')).toBeInTheDocument());

  fireEvent.click(screen.getByRole('button', { name: 'Log out' }));
  fireEvent.click(screen.getAllByRole('button', { name: 'Sign up' })[0]);
  fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Log In' }));
  fireEvent.change(screen.getByLabelText('E-Mail'), { target: { value: 'ALEX@example.com' } });
  fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'secret-password' } });
  fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Log In' }));

  await waitFor(() => expect(screen.getByText('Hi, Alex Morgan')).toBeInTheDocument());
});

test('does not sign in with an incorrect password', async () => {
  render(<App />);

  fireEvent.click(screen.getAllByRole('button', { name: 'Sign up' })[0]);
  fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'Alex Morgan' } });
  fireEvent.change(screen.getByLabelText('E-Mail'), { target: { value: 'alex@example.com' } });
  fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'secret-password' } });
  fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Sign up' }));
  await waitFor(() => expect(screen.getByText('Hi, Alex Morgan')).toBeInTheDocument());

  fireEvent.click(screen.getByRole('button', { name: 'Log out' }));
  fireEvent.click(screen.getAllByRole('button', { name: 'Sign up' })[0]);
  fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Log In' }));
  fireEvent.change(screen.getByLabelText('E-Mail'), { target: { value: 'alex@example.com' } });
  fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'wrong-password' } });
  fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Log In' }));

  expect(await screen.findByText('Email or password is incorrect.')).toBeInTheDocument();
  expect(screen.queryByText('Hi, Alex Morgan')).not.toBeInTheDocument();
});

test('lets a user sign out and register again', async () => {
  window.localStorage.setItem('weather-user', JSON.stringify({
    name: 'Alex Morgan',
    email: 'alex@example.com',
  }));
  render(<App />);

  fireEvent.click(screen.getByRole('button', { name: 'Log out' }));

  expect(screen.queryByText('Hi, Alex Morgan')).not.toBeInTheDocument();
  expect(window.localStorage.getItem('weather-user')).toBeNull();
  fireEvent.click(screen.getAllByRole('button', { name: 'Sign up' })[0]);
  fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'Taylor Reed' } });
  fireEvent.change(screen.getByLabelText('E-Mail'), { target: { value: 'taylor@example.com' } });
  fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'secret-password' } });
  fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Sign up' }));

  await waitFor(() => expect(screen.getByText('Hi, Taylor Reed')).toBeInTheDocument());
  expect(JSON.parse(window.localStorage.getItem('weather-user'))).toEqual({
    name: 'Taylor Reed',
    email: 'taylor@example.com',
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
