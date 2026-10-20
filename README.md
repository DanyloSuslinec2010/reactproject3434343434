# react-homework-template — Weather App

Запуск:

```
npm install
npm start
```

Что внутри:
- `services/weatherApi.js` — запросы к Open-Meteo (поиск города, текущая погода, почасовой прогноз, 7 дней). Ключ не нужен.
- `services/newsApi.js` — новости с Hacker News (Algolia). Если не ответил, показываются запасные.
- `hooks/useLocalStorage.js` — хранит пользователя и список городов.
- `components/` — Header + AuthModal, Hero, CityList + CityCard, Details (график, шкала температуры, 7 дней), News, Gallery (слайдер), Footer.

Экраны: mobile 320+, tablet 768+, desktop 1200+.
