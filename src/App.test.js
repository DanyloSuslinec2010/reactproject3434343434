import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import App from './App';
import { theme } from './theme';

<<<<<<< Updated upstream
beforeEach(() => {
  window.localStorage.clear();
});

const renderApp = () =>
  render(
    <ThemeProvider theme={theme}>
      <App />
    </ThemeProvider>,
  );

test('renders the weather header and navigation', () => {
  renderApp();

  expect(screen.getByRole('banner')).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Міста' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Реєстрація' })).toBeInTheDocument();
});

test('registers a user and shows their name in the header', async () => {
  renderApp();

  fireEvent.click(screen.getByRole('button', { name: 'Реєстрація' }));
  fireEvent.change(screen.getByLabelText("Ім'я"), {
    target: { value: 'Анна' },
  });
  fireEvent.change(screen.getByLabelText('Email'), {
    target: { value: 'anna@example.com' },
  });
  fireEvent.change(screen.getByLabelText('Пароль'), {
    target: { value: 'secret1' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Зареєструватися' }));

  await waitFor(() => {
    expect(JSON.parse(window.localStorage.getItem('weather-user'))).toEqual({
      name: 'Анна',
      email: 'anna@example.com',
    });
  });
  expect(screen.getByText('Анна')).toBeInTheDocument();
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});

test('validates the required registration fields', async () => {
  renderApp();

  fireEvent.click(screen.getByRole('button', { name: 'Реєстрація' }));
  fireEvent.click(screen.getByRole('button', { name: 'Зареєструватися' }));

  expect(await screen.findByText("Введіть ім'я")).toBeInTheDocument();
  expect(screen.getByText('Введіть email')).toBeInTheDocument();
  expect(screen.getByText('Введіть пароль')).toBeInTheDocument();
  expect(JSON.parse(window.localStorage.getItem('weather-user'))).toBeNull();
=======
test('renders the weather dashboard', () => {
  render(<App />);
  expect(screen.getByRole('heading', { name: /feel the rhythm of the weather/i })).toBeInTheDocument();
  expect(screen.getByRole('searchbox', { name: /search for a city/i })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: /stories under the sky/i })).toBeInTheDocument();
>>>>>>> Stashed changes
});
