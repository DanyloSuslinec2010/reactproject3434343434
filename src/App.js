import { useEffect, useMemo, useState } from 'react';
import { useFormik } from 'formik';
import { Line } from 'react-chartjs-2';
import brandLogo from './logo-1.png';
import { FaFacebookF, FaInstagram, FaWhatsapp } from 'react-icons/fa';
import {
  Chart as ChartJS,
  CategoryScale,
  Filler,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from 'chart.js';
import {
  FiArrowDown,
  FiArrowLeft,
  FiArrowRight,
  FiCloud,
  FiCloudDrizzle,
  FiCloudRain,
  FiCloudSnow,
  FiDroplet,
  FiMapPin,
  FiMenu,
  FiPlus,
  FiRefreshCw,
  FiSearch,
  FiSun,
  FiSunrise,
  FiSunset,
  FiThermometer,
  FiTrash2,
  FiUser,
  FiWind,
  FiX,
  FiZap,
} from 'react-icons/fi';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';
import { getForecast, getWeeklyForecast, searchCity } from './services/weather';

ChartJS.register(
  CategoryScale,
  Filler,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
);

const DEFAULT_CITIES = [
  { id: 'kyiv-ukraine', name: 'Kyiv', country: 'Ukraine', latitude: 50.45, longitude: 30.52 },
  { id: 'london-united-kingdom', name: 'London', country: 'United Kingdom', latitude: 51.51, longitude: -0.13 },
  { id: 'tokyo-japan', name: 'Tokyo', country: 'Japan', latitude: 35.68, longitude: 139.69 },
];

const NEWS = [
  {
    category: 'CLIMATE',
    title: 'The small changes making cities cooler',
    date: 'Oct 18, 2026',
    image: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=900&q=85',
  },
  {
    category: 'NATURE',
    title: 'A closer look at this season’s changing colors',
    date: 'Oct 16, 2026',
    image: 'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=900&q=85',
  },
  {
    category: 'TRAVEL',
    title: 'Finding a little sunshine on a cloudy day',
    date: 'Oct 12, 2026',
    image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=85',
  },
];

const GALLERY = [
  {
    image: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1200&q=85',
    alt: 'Mountains reflected in a clear alpine lake',
  },
  {
    image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1200&q=85',
    alt: 'Sunlight filtering through a green forest',
  },
  {
    image: 'https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=1200&q=85',
    alt: 'Sunset over a dramatic mountain landscape',
  },
  {
    image: 'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&w=1200&q=85',
    alt: 'Golden sunrise over a quiet field',
  },
];

function readStoredValue(key, fallback) {
  try {
    const value = window.localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch (error) {
    console.error(`Could not read ${key} from local storage.`, error);
    return fallback;
  }
}

function weatherIcon(code, className = '') {
  if (code === 0 || code === 1) return <FiSun className={className} />;
  if (code === 2 || code === 3 || code === 45 || code === 48) return <FiCloud className={className} />;
  if (code === 51 || code === 53 || code === 55 || code === 56 || code === 57) {
    return <FiCloudDrizzle className={className} />;
  }
  if (code >= 71 && code <= 86) return <FiCloudSnow className={className} />;
  if (code === 95 || code === 96 || code === 99) return <FiZap className={className} />;
  return <FiCloudRain className={className} />;
}

function weatherDescription(code) {
  if (code === 0) return 'Clear sky';
  if (code === 1) return 'Mostly clear';
  if (code === 2) return 'Partly cloudy';
  if (code === 3) return 'Overcast';
  if (code === 45 || code === 48) return 'Foggy';
  if (code >= 51 && code <= 57) return 'Drizzle';
  if (code >= 61 && code <= 67) return 'Rain';
  if (code >= 71 && code <= 86) return 'Snow';
  if (code >= 95) return 'Thunderstorm';
  return 'Cloudy';
}

function formatDate(date) {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

function readCities() {
  const savedCities = readStoredValue('weather-cities', null);
  return Array.isArray(savedCities) && savedCities.length > 0 ? savedCities : DEFAULT_CITIES;
}

function getHourlyForecast(weather) {
  const { time, temperature_2m: temperatures, precipitation_probability: rain } = weather.hourly;
  const currentTime = weather.current.time;
  let startIndex = time.findIndex((hour) => hour >= currentTime);
  if (startIndex < 0) startIndex = 0;

  return time.slice(startIndex, startIndex + 24).map((hour, index) => ({
    time: hour,
    temperature: temperatures[startIndex + index],
    rain: rain[startIndex + index] ?? 0,
  }));
}

function CityCard({ city, onSelect, onRefresh, onRemove }) {
  const weather = city.weather;

  return (
    <article className={`city-card${city.loading ? ' is-loading' : ''}`}>
      <button className="city-card__main" type="button" onClick={onSelect}>
        <span className="city-card__location">
          <FiMapPin aria-hidden="true" />
          {city.place.name}, {city.place.country}
        </span>
        <span className="city-card__weather">
          {weather ? (
            <>
              <span className="city-card__temperature">{Math.round(weather.current.temperature_2m)}°</span>
              {weatherIcon(weather.current.weather_code, 'city-card__icon')}
            </>
          ) : (
            <span className="city-card__temperature city-card__temperature--empty">--°</span>
          )}
        </span>
        <span className="city-card__condition">
          {weather ? weatherDescription(weather.current.weather_code) : city.error || 'Loading forecast'}
        </span>
        {weather && (
          <span className="city-card__range">
            H: {Math.round(weather.daily.temperature_2m_max[0])}° <span aria-hidden="true">·</span> L:{' '}
            {Math.round(weather.daily.temperature_2m_min[0])}°
          </span>
        )}
      </button>
      <div className="city-card__actions">
        <button
          className="icon-button city-card__action"
          type="button"
          aria-label={`Refresh ${city.place.name} weather`}
          onClick={onRefresh}
          disabled={city.loading}
        >
          <FiRefreshCw className={city.loading ? 'spin' : ''} />
        </button>
        <button
          className="icon-button city-card__action"
          type="button"
          aria-label={`Remove ${city.place.name}`}
          onClick={onRemove}
        >
          <FiTrash2 />
        </button>
      </div>
    </article>
  );
}

function RegisterModal({ onClose, onRegister }) {
  const formik = useFormik({
    initialValues: { name: '', email: '' },
    onSubmit: (values) => onRegister({ name: values.name.trim(), email: values.email.trim() }),
  });

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <section className="register-modal" role="dialog" aria-modal="true" aria-labelledby="register-title">
        <button className="icon-button register-modal__close" type="button" aria-label="Close" onClick={onClose}>
          <FiX />
        </button>
        <span className="register-modal__badge"><FiUser /></span>
        <p className="eyebrow">YOUR WEATHER, YOUR WAY</p>
        <h2 id="register-title">Create your account</h2>
        <p className="muted-copy">Save your profile and keep your favorite places close.</p>
        <form className="register-form" onSubmit={formik.handleSubmit}>
          <label htmlFor="register-name">Your name</label>
          <input
            id="register-name"
            name="name"
            type="text"
            autoComplete="name"
            placeholder="Alex Morgan"
            value={formik.values.name}
            onChange={formik.handleChange}
            required
          />
          <label htmlFor="register-email">Email address</label>
          <input
            id="register-email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={formik.values.email}
            onChange={formik.handleChange}
            required
          />
          <button className="button button--primary register-form__submit" type="submit">Create account</button>
        </form>
      </section>
    </div>
  );
}

export default function App() {
  const [cities, setCities] = useState(() => readCities().map((place) => ({
    place,
    weather: null,
    loading: true,
    error: '',
    weeklyForecast: null,
    weekLoading: false,
  })));
  const [selectedCityId, setSelectedCityId] = useState(() => readCities()[0]?.id || '');
  const [searchValue, setSearchValue] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [user, setUser] = useState(() => readStoredValue('weather-user', null));
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [showWeek, setShowWeek] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const today = useMemo(() => formatDate(new Date()), []);

  useEffect(() => {
    readCities().forEach((place) => {
      getForecast(place)
        .then((weather) => {
          setCities((current) => current.map((item) => (
            item.place.id === place.id ? { ...item, weather, loading: false, error: '' } : item
          )));
        })
        .catch((error) => {
          console.error(`Could not load weather for ${place.name}.`, error);
          setCities((current) => current.map((item) => (
            item.place.id === place.id
              ? { ...item, loading: false, error: 'Forecast unavailable' }
              : item
          )));
        });
    });
  }, []);

  const selectedCity = cities.find((city) => city.place.id === selectedCityId) || cities[0];
  const selectedWeather = selectedCity?.weather;

  useEffect(() => {
    try {
      window.localStorage.setItem('weather-cities', JSON.stringify(cities.map(({ place }) => place)));
    } catch (error) {
      console.error('Could not save cities to local storage.', error);
      toast.error('Your city list could not be saved on this device.');
    }
  }, [cities]);

  async function loadWeeklyForecast(place) {
    setCities((current) => current.map((city) => (
      city.place.id === place.id ? { ...city, weekLoading: true } : city
    )));
    try {
      const weeklyForecast = await getWeeklyForecast(place);
      setCities((current) => current.map((city) => (
        city.place.id === place.id
          ? { ...city, weeklyForecast: weeklyForecast.daily, weekLoading: false }
          : city
      )));
    } catch (error) {
      console.error(`Could not load the 7-day forecast for ${place.name}.`, error);
      setCities((current) => current.map((city) => (
        city.place.id === place.id ? { ...city, weekLoading: false } : city
      )));
      toast.error(`Couldn't load the 7-day forecast for ${place.name}.`);
    }
  }

  function selectCity(cityId) {
    setSelectedCityId(cityId);
    const city = cities.find((item) => item.place.id === cityId);
    if (showWeek && city && !city.weekLoading) loadWeeklyForecast(city.place);
  }

  function toggleWeeklyForecast() {
    const isOpening = !showWeek;
    setShowWeek(isOpening);
    if (isOpening && selectedCity && !selectedCity.weekLoading) {
      loadWeeklyForecast(selectedCity.place);
    }
  }

  async function refreshCity(place) {
    setCities((current) => current.map((city) => (
      city.place.id === place.id ? { ...city, loading: true, error: '' } : city
    )));
    try {
      const weather = await getForecast(place);
      setCities((current) => current.map((city) => (
        city.place.id === place.id ? { ...city, weather, loading: false, error: '' } : city
      )));
    } catch (error) {
      console.error(`Could not refresh weather for ${place.name}.`, error);
      setCities((current) => current.map((city) => (
        city.place.id === place.id ? { ...city, loading: false, error: 'Forecast unavailable' } : city
      )));
      toast.error(`Couldn't refresh the forecast for ${place.name}.`);
    }
  }

  async function addCity(event) {
    event.preventDefault();
    const query = searchValue.trim();
    if (!query || isSearching) return;

    setIsSearching(true);
    try {
      const place = await searchCity(query);
      if (cities.some((city) => city.place.id === place.id)) {
        setSelectedCityId(place.id);
        toast.info(`${place.name} is already in your city list.`);
        setSearchValue('');
        return;
      }

      const forecast = await getForecast(place);
      setCities((current) => [...current, {
        place,
        weather: forecast,
        loading: false,
        error: '',
        weeklyForecast: null,
        weekLoading: false,
      }]);
      setSelectedCityId(place.id);
      setSearchValue('');
      toast.success(`${place.name} added to your cities.`);
    } catch (error) {
      console.error('Could not add the requested city.', error);
      toast.error(error.message || 'Could not find that city. Try another name.');
    } finally {
      setIsSearching(false);
    }
  }

  function removeCity(place) {
    setCities((current) => {
      const nextCities = current.filter((city) => city.place.id !== place.id);
      if (selectedCityId === place.id) setSelectedCityId(nextCities[0]?.place.id || '');
      return nextCities;
    });
  }

  function registerUser(profile) {
    try {
      window.localStorage.setItem('weather-user', JSON.stringify(profile));
      setUser(profile);
      setIsRegisterOpen(false);
      toast.success(`Welcome, ${profile.name}!`);
    } catch (error) {
      console.error('Could not save your profile.', error);
      toast.error('Your profile could not be saved on this device.');
    }
  }

  const hourly = selectedWeather ? getHourlyForecast(selectedWeather) : [];
  const hourlyTemperatures = hourly.map(({ temperature }) => Math.round(temperature));
  const minHour = Math.min(...hourlyTemperatures, 0);
  const maxHour = Math.max(...hourlyTemperatures, 1);
  const currentPosition = selectedWeather
    ? Math.max(4, Math.min(96, ((selectedWeather.current.temperature_2m - minHour) / (maxHour - minHour || 1)) * 100))
    : 50;
  const chartData = {
    labels: hourly.map(({ time }, index) => (
      index === 0
        ? 'Now'
        : new Intl.DateTimeFormat('en-US', { hour: 'numeric' }).format(new Date(`2000-01-01T${time.slice(11)}:00`))
    )),
    datasets: [{
      data: hourlyTemperatures,
      borderColor: '#a2b7ff',
      backgroundColor: (context) => {
        const chart = context.chart;
        const { ctx, chartArea } = chart;
        if (!chartArea) return 'rgba(162, 183, 255, 0.15)';
        const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
        gradient.addColorStop(0, 'rgba(162, 183, 255, 0.28)');
        gradient.addColorStop(1, 'rgba(162, 183, 255, 0)');
        return gradient;
      },
      fill: true,
      tension: 0.4,
      borderWidth: 3,
      pointRadius: 0,
      pointHoverRadius: 5,
    }],
  };
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        displayColors: false,
        callbacks: { label: (context) => `${context.parsed.y}°C` },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        border: { display: false },
        ticks: { color: '#9ba7be', maxTicksLimit: 8, maxRotation: 0, font: { size: 11 } },
      },
      y: {
        grid: { color: 'rgba(155, 167, 190, 0.12)' },
        border: { display: false, dash: [4, 5] },
        ticks: { color: '#9ba7be', maxTicksLimit: 4, callback: (value) => `${value}°`, font: { size: 11 } },
      },
    },
  };

  return (
    <div className="app-shell">
      <header className="site-header">
        <a className="brand" href="#home" aria-label="Weatherly home">
          <span className="brand__mark"><img src={brandLogo} alt="" /></span>
        </a>
        <button
          className="icon-button mobile-menu-toggle"
          type="button"
          aria-label="Toggle navigation"
          aria-expanded={mobileMenuOpen}
          onClick={() => setMobileMenuOpen((open) => !open)}
        >
          {mobileMenuOpen ? <FiX /> : <FiMenu />}
        </button>
        <nav className={`site-nav${mobileMenuOpen ? ' site-nav--open' : ''}`} aria-label="Main navigation">
          <a href="#weather" onClick={() => setMobileMenuOpen(false)}>Weather</a>
          <a href="#news" onClick={() => setMobileMenuOpen(false)}>Discover</a>
          <a href="#gallery" onClick={() => setMobileMenuOpen(false)}>Gallery</a>
        </nav>
        {user ? (
          <span className="user-greeting"><span className="user-greeting__avatar">{user.name.charAt(0).toUpperCase()}</span>Hi, {user.name}</span>
        ) : (
          <button className="button button--outline header-signin" type="button" onClick={() => setIsRegisterOpen(true)}>
            <FiUser /> Sign up
          </button>
        )}
      </header>

      <main id="home">
        <section className="hero-section">
          <div className="hero-section__glow" aria-hidden="true" />
          <div className="hero-content">
            <p className="eyebrow"><span className="eyebrow__line" />YOUR DAILY WEATHER COMPANION</p>
            <h1>Feel the rhythm<br />of the <span>weather.</span></h1>
            <p className="hero-copy">A little more sunshine in your day starts with knowing what’s ahead.</p>
            <form className="search-form" onSubmit={addCity}>
              <FiSearch aria-hidden="true" />
              <input
                aria-label="Search for a city"
                type="search"
                placeholder="Search a city..."
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
              />
              <button className="search-form__submit" type="submit" disabled={isSearching}>
                {isSearching ? 'Adding…' : <><FiPlus /> Add city</>}
              </button>
            </form>
            <p className="hero-hint"><FiMapPin /> Try “Lisbon” or “New York”</p>
          </div>
          <div className="hero-date">
            <span className="hero-date__sun"><FiSun /></span>
            <span><strong>{today}</strong><small>A good day to look up.</small></span>
          </div>
          <div className="hero-weather-art" aria-hidden="true">
            <div className="hero-weather-art__sun"><FiSun /></div>
            <div className="hero-weather-art__cloud hero-weather-art__cloud--back" />
            <div className="hero-weather-art__cloud hero-weather-art__cloud--front" />
            <span className="hero-weather-art__sparkle hero-weather-art__sparkle--one">✦</span>
            <span className="hero-weather-art__sparkle hero-weather-art__sparkle--two">✦</span>
          </div>
          <div className="hero-index"><span>01</span><i /> 03</div>
        </section>

        <section className="weather-section section-wrap" id="weather">
          <div className="section-heading">
            <div>
              <p className="eyebrow">THE FORECAST</p>
              <h2>Your places, <span>your forecast.</span></h2>
            </div>
            <span className="updated-label"><span /> LIVE WEATHER</span>
          </div>

          {cities.length > 0 ? (
            <div className="city-grid">
              {cities.map((city) => (
                <CityCard
                  key={city.place.id}
                  city={city}
                  onSelect={() => selectCity(city.place.id)}
                  onRefresh={() => refreshCity(city.place)}
                  onRemove={() => removeCity(city.place)}
                />
              ))}
            </div>
          ) : (
            <div className="empty-cities">
              <FiMapPin />
              <p>Your city list is empty.</p>
              <span>Search above to add a place and see its forecast.</span>
            </div>
          )}

          {selectedCity && (
            <section className="detail-panel" aria-labelledby="detail-title">
              <div className="detail-panel__top">
                <div>
                  <p className="eyebrow">RIGHT NOW IN {selectedCity.place.country.toUpperCase()}</p>
                  <h3 id="detail-title">{selectedCity.place.name}<span className="detail-title__period"> / Today</span></h3>
                  {selectedWeather && <p className="detail-panel__condition">{weatherDescription(selectedWeather.current.weather_code)}</p>}
                </div>
                {selectedWeather && (
                  <div className="detail-temperature">
                    {weatherIcon(selectedWeather.current.weather_code, 'detail-temperature__icon')}
                    <span>{Math.round(selectedWeather.current.temperature_2m)}<sup>°</sup></span>
                    <small>Feels like {Math.round(selectedWeather.current.apparent_temperature)}°</small>
                  </div>
                )}
              </div>

              <div className="weather-stats">
                <div className="weather-stat"><FiThermometer /><span>Feels like</span><strong>{selectedWeather ? `${Math.round(selectedWeather.current.apparent_temperature)}°` : '--'}</strong></div>
                <div className="weather-stat"><FiDroplet /><span>Humidity</span><strong>{selectedWeather ? `${selectedWeather.current.relative_humidity_2m}%` : '--'}</strong></div>
                <div className="weather-stat"><FiWind /><span>Wind</span><strong>{selectedWeather ? `${Math.round(selectedWeather.current.wind_speed_10m)} km/h` : '--'}</strong></div>
                <div className="weather-stat"><FiCloudRain /><span>Precipitation</span><strong>{selectedWeather ? `${selectedWeather.current.precipitation} mm` : '--'}</strong></div>
                <div className="weather-stat"><FiSunrise /><span>Sunrise</span><strong>{selectedWeather?.daily.sunrise[0]?.slice(11, 16) || '--:--'}</strong></div>
                <div className="weather-stat"><FiSunset /><span>Sunset</span><strong>{selectedWeather?.daily.sunset[0]?.slice(11, 16) || '--:--'}</strong></div>
              </div>

              <div className="forecast-grid">
                <section className="forecast-card hourly-card">
                  <div className="card-heading">
                    <div><p className="eyebrow">HOUR BY HOUR</p><h4>Today’s temperature</h4></div>
                    <span className="card-heading__icon"><FiArrowRight /></span>
                  </div>
                  <div className="hourly-position">
                    <span className="hourly-position__caption">Current temperature</span>
                    <span className="hourly-position__value">{selectedWeather ? `${Math.round(selectedWeather.current.temperature_2m)}°` : '--'}</span>
                    <div className="hourly-position__track">
                      <span className="hourly-position__marker" style={{ left: `${currentPosition}%` }} />
                    </div>
                    <div className="hourly-position__labels"><span>{minHour}°</span><span>{maxHour}°</span></div>
                  </div>
                  <div className="hourly-chart">
                    {hourly.length > 0 ? (
                      <Line data={chartData} options={chartOptions} aria-label="Hourly temperature forecast chart" />
                    ) : (
                      <div className="chart-placeholder">Hourly forecast is loading…</div>
                    )}
                  </div>
                </section>

                <section className="forecast-card week-card">
                  <div className="card-heading">
                    <div><p className="eyebrow">PLAN AHEAD</p><h4>7-day forecast</h4></div>
                    <button className="icon-button card-heading__icon" type="button" aria-label={showWeek ? 'Hide weekly forecast' : 'Show weekly forecast'} onClick={toggleWeeklyForecast}>
                      <FiArrowDown className={showWeek ? '' : 'rotate-up'} />
                    </button>
                  </div>
                  {showWeek && (selectedCity.weeklyForecast ? (
                    <div className="week-list">
                      {selectedCity.weeklyForecast.time.map((date, index) => (
                        <div className="week-row" key={date}>
                          <span className="week-row__day">{index === 0 ? 'Today' : new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(new Date(`${date}T12:00:00`))}</span>
                          {weatherIcon(selectedCity.weeklyForecast.weather_code[index], 'week-row__icon')}
                          <span className="week-row__condition">{weatherDescription(selectedCity.weeklyForecast.weather_code[index])}</span>
                          <span className="week-row__low">{Math.round(selectedCity.weeklyForecast.temperature_2m_min[index])}°</span>
                          <span className="week-row__bar"><i style={{ left: `${Math.max(0, Math.min(80, (selectedCity.weeklyForecast.temperature_2m_min[index] + 10) * 2))}%`, width: `${Math.max(12, Math.min(100, (selectedCity.weeklyForecast.temperature_2m_max[index] - selectedCity.weeklyForecast.temperature_2m_min[index]) * 2.5))}%` }} /></span>
                          <strong className="week-row__high">{Math.round(selectedCity.weeklyForecast.temperature_2m_max[index])}°</strong>
                        </div>
                      ))}
                    </div>
                  ) : selectedCity.weekLoading ? (
                    <p className="forecast-loading">The 7-day forecast is loading…</p>
                  ) : null)}
                </section>
              </div>
            </section>
          )}
        </section>

        <section className="news-section section-wrap" id="news">
          <div className="section-heading">
            <div><p className="eyebrow">A LITTLE INSPIRATION</p><h2>Stories under <span>the sky.</span></h2></div>
            <a className="text-link" href="#gallery">Explore nature <FiArrowRight /></a>
          </div>
          <div className="news-grid">
            {NEWS.map((story) => (
              <article className="news-card" key={story.title}>
                <div className="news-card__image" style={{ backgroundImage: `url("${story.image}")` }} role="img" aria-label={story.title} />
                <div className="news-card__content">
                  <div><span>{story.category}</span><time>{story.date}</time></div>
                  <h3>{story.title}</h3>
                  <a href="#gallery" aria-label={`Read ${story.title}`}>Read story <FiArrowRight /></a>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="gallery-section section-wrap" id="gallery">
          <div className="gallery-heading">
            <div><p className="eyebrow">A MOMENT OUTSIDE</p><h2>Nature, <span>unfiltered.</span></h2></div>
            <div className="gallery-controls">
              <button className="icon-button" type="button" aria-label="Previous gallery image" onClick={() => setGalleryIndex((index) => (index - 1 + GALLERY.length) % GALLERY.length)}><FiArrowLeft /></button>
              <span>0{galleryIndex + 1} <i /> 0{GALLERY.length}</span>
              <button className="icon-button" type="button" aria-label="Next gallery image" onClick={() => setGalleryIndex((index) => (index + 1) % GALLERY.length)}><FiArrowRight /></button>
            </div>
          </div>
          <div className="gallery-slider">
            <div className="gallery-slider__track" style={{ transform: `translateX(-${galleryIndex * 100}%)` }}>
              {GALLERY.map((item) => (
                <figure className="gallery-slide" key={item.image}>
                  <img src={item.image} alt={item.alt} />
                  <figcaption><span>Nature’s daily reminder</span><strong>Take a breath. Look around.</strong></figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="footer-inner">
          <a className="footer-logo" href="#home" aria-label="Weatherly home">
            <img src={brandLogo} alt="" />
          </a>
          <div className="footer-address">
            <h2>Address</h2>
            <address>
              Svobody str. 35<br />
              Kyiv<br />
              Ukraine
            </address>
          </div>
          <div className="footer-contact">
            <h2>Contact us</h2>
            <div className="footer-socials">
              <a className="footer-social footer-social--instagram" href="https://instagram.com" aria-label="Instagram" target="_blank" rel="noreferrer noopener">
                <FaInstagram />
              </a>
              <a className="footer-social footer-social--facebook" href="https://facebook.com" aria-label="Facebook" target="_blank" rel="noreferrer noopener">
                <FaFacebookF />
              </a>
              <a className="footer-social footer-social--whatsapp" href="https://whatsapp.com" aria-label="WhatsApp" target="_blank" rel="noreferrer noopener">
                <FaWhatsapp />
              </a>
            </div>
          </div>
        </div>
      </footer>

      {isRegisterOpen && <RegisterModal onClose={() => setIsRegisterOpen(false)} onRegister={registerUser} />}
      <ToastContainer position="bottom-right" autoClose={3000} theme="dark" />
    </div>
  );
}
