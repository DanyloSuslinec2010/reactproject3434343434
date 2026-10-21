import { act, render, screen } from '@testing-library/react';
import App from './App';

jest.mock('./services/weather', () => ({
  getForecast: () => Promise.resolve(null),
  getWeeklyForecast: () => Promise.resolve(null),
  searchCity: () => Promise.resolve(null),
}));

test('renders the weather dashboard', async () => {
  render(<App />);
  await act(async () => {
    await Promise.resolve();
  });

  expect(screen.getByRole('heading', { name: /feel the rhythm of the weather/i })).toBeInTheDocument();
  expect(screen.getByRole('searchbox', { name: /search for a city/i })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: /stories under the sky/i })).toBeInTheDocument();
});
