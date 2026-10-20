// Запасные новости, если API не ответил
export const fallbackNews = [
  {
    id: 'f1',
    title: 'Як читати прогноз погоди: температура, відчувається як, вологість',
    author: 'Weather App',
    points: null,
    date: new Date().toISOString(),
    url: 'https://open-meteo.com/',
  },
  {
    id: 'f2',
    title: 'Чому прогноз на тиждень менш точний, ніж на завтра',
    author: 'Weather App',
    points: null,
    date: new Date().toISOString(),
    url: 'https://open-meteo.com/en/docs',
  },
  {
    id: 'f3',
    title: 'Що таке коди погоди WMO і як їх розуміти',
    author: 'Weather App',
    points: null,
    date: new Date().toISOString(),
    url: 'https://open-meteo.com/en/docs',
  },
];
