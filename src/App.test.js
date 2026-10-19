import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import App from './App';

beforeEach(() => {
  window.localStorage.clear();
});

test('renders the responsive weather header', () => {
  render(<App />);

  expect(screen.getByRole('banner')).toBeInTheDocument();
  expect(
    screen.getByRole('navigation', { name: 'Основная навигация' }),
  ).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Войти' })).toBeInTheDocument();
});

test('saves the entered name and shows it in the header', async () => {
  render(<App />);

  fireEvent.click(screen.getByRole('button', { name: 'Войти' }));
  fireEvent.change(screen.getByLabelText('Ваше имя'), {
    target: { value: '  Анна  ' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Сохранить' }));

  await waitFor(() => {
    expect(window.localStorage.getItem('weather-app-user-name')).toBe('Анна');
  });
  expect(
    screen.getByRole('button', { name: 'Привет, Анна' }),
  ).toBeInTheDocument();
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});

test('requires a name before saving', async () => {
  render(<App />);

  fireEvent.click(screen.getByRole('button', { name: 'Войти' }));
  fireEvent.click(screen.getByRole('button', { name: 'Сохранить' }));

  expect(await screen.findByRole('alert')).toHaveTextContent('Введите ваше имя.');
  expect(window.localStorage.getItem('weather-app-user-name')).toBeNull();
});
