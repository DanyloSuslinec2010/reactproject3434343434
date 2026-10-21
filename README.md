# Weatherly

Weatherly is a responsive weather dashboard built with React. It includes city search, current conditions, an hourly temperature chart, a 7-day forecast, a registration modal, weather stories, and a nature photo slider.

Weather and geocoding data come from the free [Open-Meteo API](https://open-meteo.com/); no API key is required. Your city list and profile are stored in browser local storage. Forecasts are requested again when the app loads.

## Run locally

```bash
npm install
npm start
```

The app is designed for mobile screens from 320px, tablets, and desktop screens.

## Validate and build

```bash
npm test -- --watchAll=false
npm run build
```
