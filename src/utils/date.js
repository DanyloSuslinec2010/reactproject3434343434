const LOCALE = 'uk-UA';

function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function formatFullDate(date) {
  return capitalize(
    date.toLocaleDateString(LOCALE, {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  );
}

export function formatTime(date) {
  return date.toLocaleTimeString(LOCALE, { hour: '2-digit', minute: '2-digit' });
}

export function formatDayShort(isoDate) {
  return capitalize(
    new Date(`${isoDate}T00:00:00`).toLocaleDateString(LOCALE, {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    })
  );
}

export function formatNewsDate(isoDate) {
  return new Date(isoDate).toLocaleDateString(LOCALE, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}
