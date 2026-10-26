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
  FiCloud,
  FiCloudDrizzle,
  FiCloudRain,
  FiCloudSnow,
  FiActivity,
  FiEye,
  FiHeart,
  FiMapPin,
  FiMenu,
  FiRefreshCw,
  FiSearch,
  FiSun,
  FiThermometer,
  FiTrash2,
  FiUser,
  FiWind,
  FiX,
  FiZap,
} from 'react-icons/fi';
import {
  WiCloudy,
  WiDayCloudy,
  WiDayRain,
  WiDaySnow,
  WiDaySunny,
  WiFog,
  WiRain,
  WiShowers,
  WiSleet,
  WiThunderstorm,
} from 'react-icons/wi';
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
    title: 'The small changes making cities cooler',
    image: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=900&q=85',
  },
  {
    title: 'A closer look at this season’s changing colors',
    image: 'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=900&q=85',
  },
  {
    title: 'Finding a little sunshine on a cloudy day',
    image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=85',
  },
  {
    title: 'How a little rain helps the garden thrive',
    image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=900&q=85',
  },
];

const GALLERY = [
  {
    image: 'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1000&q=85',
    alt: 'Ocean waves washing over a quiet beach',
  },
  {
    image: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1000&q=85',
    alt: 'Turquoise alpine lake surrounded by mountains',
  },
  {
    image: 'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&w=1200&q=85',
    alt: 'Golden sunlight over a mountain meadow',
  },
  {
    image: 'https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=1000&q=85',
    alt: 'Mountain landscape in the evening light',
  },
  {
    image: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1000&q=85',
    alt: 'Still lake beneath a colorful sunset',
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

function weeklyWeatherIcon(code, className = '') {
  if (code === 0) return <WiDaySunny className={className} />;
  if (code === 1 || code === 2) return <WiDayCloudy className={className} />;
  if (code === 3) return <WiCloudy className={className} />;
  if (code === 45 || code === 48) return <WiFog className={className} />;
  if (code >= 51 && code <= 57) return <WiSleet className={className} />;
  if (code === 61) return <WiDayRain className={className} />;
  if (code === 63 || code === 65 || (code >= 80 && code <= 82)) {
    return <WiShowers className={className} />;
  }
  if (code === 66 || code === 67) return <WiRain className={className} />;
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) {
    return <WiDaySnow className={className} />;
  }
  if (code >= 95) return <WiThunderstorm className={className} />;
  return <WiDayCloudy className={className} />;
}

function weeklyWeatherDescription(code) {
  if (code === 0) return 'clear sky';
  if (code === 1) return 'mainly clear';
  if (code === 2) return 'few clouds';
  if (code === 3) return 'overcast clouds';
  if (code === 45 || code === 48) return 'fog';
  if (code === 51 || code === 56) return 'light drizzle';
  if (code === 53 || code === 55 || code === 57) return 'drizzle';
  if (code === 61) return 'light rain';
  if (code === 63 || code === 66) return 'moderate rain';
  if (code === 65 || code === 67) return 'heavy rain';
  if (code === 71 || code === 85) return 'light snow';
  if (code === 73 || code === 77) return 'snow';
  if (code === 75 || code === 86) return 'heavy snow';
  if (code === 80) return 'light rain';
  if (code === 81) return 'rain showers';
  if (code === 82) return 'heavy showers';
  if (code >= 95) return 'thunderstorm';
  return 'cloudy';
}

function readCities() {
  const savedCities = readStoredValue('weather-cities', null);
  return Array.isArray(savedCities) ? savedCities : DEFAULT_CITIES;
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

function getCardDate(weather) {
  const currentTime = weather?.current?.time;
  const dateText = currentTime?.slice(0, 10);
  const date = dateText && /^\d{4}-\d{2}-\d{2}$/.test(dateText)
    ? new Date(`${dateText}T12:00:00Z`)
    : new Date();
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');

  return {
    time: currentTime?.slice(11, 16) || '--:--',
    date: `${day}.${month}.${year}`,
    weekday: new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      timeZone: 'UTC',
    }).format(date),
  };
}

function CityCard({ city, onSelect, onRefresh, onRemove, onShowHourly, onShowWeekly, activeForecast }) {
  const [isFavorite, setIsFavorite] = useState(false);
  const weather = city.weather;
  const temp = weather ? Math.round(weather.current.temperature_2m) : '--';
  const cardDate = getCardDate(weather);

  return (
    <article className={`city-card${city.loading ? ' is-loading' : ''}`}>
      <div className="city-card__header">
        <span className="city-card__city">{city.place.name}</span>
        <span className="city-card__country">{city.place.country}</span>
      </div>

      <span className="city-card__time">{cardDate.time}</span>

      <div className="city-card__switches">
        <button
          type="button"
          className={`city-card__toggle${activeForecast === 'hourly' ? ' city-card__toggle--active' : ''}`}
          onClick={onShowHourly}
          aria-pressed={activeForecast === 'hourly'}
        >
          Hourly forecast
        </button>
        <button
          type="button"
          className={`city-card__toggle${activeForecast === 'weekly' ? ' city-card__toggle--active' : ''}`}
          onClick={onShowWeekly}
          aria-pressed={activeForecast === 'weekly'}
        >
          Weekly forecast
        </button>
      </div>

      <div className="city-card__date">
        <span>{cardDate.date}</span>
        <i aria-hidden="true" />
        <span>{cardDate.weekday}</span>
      </div>

      <button className="city-card__main" type="button" onClick={onSelect}>
        <span className="city-card__weather">
          {weather ? (
            <>
              {weatherIcon(weather.current.weather_code, 'city-card__icon')}
              <span className="city-card__temperature">{temp}°C</span>
            </>
          ) : (
            <>
              <FiSun className="city-card__icon city-card__icon--muted" />
              <span className="city-card__temperature city-card__temperature--empty">--°C</span>
            </>
          )}
        </span>
      </button>

      <div className="city-card__footer">
        <button
          className="city-card__action"
          type="button"
          aria-label={`Refresh ${city.place.name} weather`}
          onClick={onRefresh}
          disabled={city.loading}
        >
          <FiRefreshCw className={city.loading ? 'spin' : ''} />
        </button>
        <button
          className={`city-card__fav${isFavorite ? ' city-card__fav--active' : ''}`}
          type="button"
          aria-label={`${isFavorite ? 'Remove' : 'Save'} ${city.place.name} ${isFavorite ? 'from' : 'to'} favorites`}
          aria-pressed={isFavorite}
          onClick={() => setIsFavorite((favorite) => !favorite)}
        >
          <FiHeart fill={isFavorite ? 'currentColor' : 'none'} />
        </button>
        <button className="city-card__cta" type="button" onClick={onSelect}>
          See more
        </button>
        <button
          className="city-card__action"
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
    weekError: false,
  })));
  const [selectedCityId, setSelectedCityId] = useState(() => readCities()[0]?.id || '');
  const [searchValue, setSearchValue] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [user, setUser] = useState(() => readStoredValue('weather-user', null));
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [showWeek, setShowWeek] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const heroDate = useMemo(() => {
    const date = currentDate;
    const day = date.getDate();
    const ordinal = day % 100 >= 11 && day % 100 <= 13
      ? 'th'
      : ({ 1: 'st', 2: 'nd', 3: 'rd' }[day % 10] || 'th');

    return {
      monthYear: new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(date),
      weekday: new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(date),
      day: `${day}${ordinal}`,
    };
  }, [currentDate]);

  useEffect(() => {
    const intervalId = window.setInterval(() => setCurrentDate(new Date()), 60_000);
    return () => window.clearInterval(intervalId);
  }, []);

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
      city.place.id === place.id ? { ...city, weekLoading: true, weekError: false } : city
    )));
    try {
      const weeklyForecast = await getWeeklyForecast(place);
      if (!weeklyForecast?.daily) {
        throw new Error(`The 7-day forecast response for ${place.name} was incomplete.`);
      }
      setCities((current) => current.map((city) => (
        city.place.id === place.id
          ? { ...city, weeklyForecast: weeklyForecast.daily, weekLoading: false, weekError: false }
          : city
      )));
    } catch (error) {
      console.error(`Could not load the 7-day forecast for ${place.name}.`, error);
      setCities((current) => current.map((city) => (
        city.place.id === place.id ? { ...city, weekLoading: false, weekError: true } : city
      )));
      toast.error(`Couldn't load the 7-day forecast for ${place.name}.`);
    }
  }

  function selectCity(cityId) {
    setSelectedCityId(cityId);
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
        weekError: false,
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
  const chartData = {
    labels: hourly.map(({ time }, index) => {
      const previousDay = index > 0 && time.slice(0, 10) !== hourly[index - 1].time.slice(0, 10);
      if (previousDay) {
        return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' })
          .format(new Date(`${time.slice(0, 10)}T12:00:00`));
      }
      if (index === 0) return 'Now';
      return new Intl.DateTimeFormat('en-US', { hour: 'numeric' })
        .format(new Date(`2000-01-01T${time.slice(11)}:00`));
    }),
    datasets: [{
      data: hourlyTemperatures,
      borderColor: '#ff9c42',
      backgroundColor: 'transparent',
      fill: false,
      tension: 0.18,
      borderWidth: 2,
      pointRadius: 0,
      pointHoverRadius: 4,
    }],
  };
  const chartMin = Math.floor(Math.min(...hourlyTemperatures, 0) / 5) * 5;
  const chartMax = Math.max(
    chartMin + 5,
    Math.ceil(Math.max(...hourlyTemperatures, 1) / 5) * 5,
  );
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
        position: 'top',
        grid: { color: 'rgba(70, 70, 70, 0.2)', drawTicks: false },
        border: { display: false },
        ticks: {
          color: '#222',
          autoSkip: false,
          maxRotation: 0,
          minRotation: 0,
          padding: 8,
          font: { size: 9 },
        },
      },
      y: {
        min: chartMin,
        max: chartMax,
        grid: { color: 'rgba(70, 70, 70, 0.2)' },
        border: { display: false },
        ticks: {
          stepSize: 5,
          color: '#222',
          callback: (value) => `${value}°C`,
          font: { size: 10 },
        },
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
          <a href="#home" onClick={() => setMobileMenuOpen(false)}>Who we are</a>
          <a href="#contact" onClick={() => setMobileMenuOpen(false)}>Contacts</a>
          <a href="#weather" onClick={() => setMobileMenuOpen(false)}>Menu</a>
        </nav>
        <div className="header-actions">
          {user ? (
            <span className="user-greeting">
              <span className="user-greeting__avatar">{user.name.charAt(0).toUpperCase()}</span>
              <span className="user-greeting__name">Hi, {user.name}</span>
            </span>
          ) : (
            <>
              <button className="button button--outline header-signin" type="button" onClick={() => setIsRegisterOpen(true)}>
                Sign up
              </button>
              <button
                className="header-account"
                type="button"
                aria-label="Sign up"
                onClick={() => setIsRegisterOpen(true)}
              >
                <FiUser aria-hidden="true" />
              </button>
            </>
          )}
        </div>
      </header>

      <main id="home">
        <section className="hero-section">
          <div className="hero-section__glow" aria-hidden="true" />
          <div className="hero-content">
            <h1>Weather dashboard</h1>
            <div className="hero-intro">
              <p className="hero-copy">
                Create your personal list of favorite cities and always be aware of the weather.
              </p>
              <div className="hero-date">
                <strong>{heroDate.monthYear}</strong>
                <span>{heroDate.weekday}, {heroDate.day}</span>
              </div>
            </div>
            <form className="search-form" onSubmit={addCity}>
              <input
                aria-label="Search for a city"
                type="search"
                placeholder="Search location..."
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
              />
              <button
                className="search-form__submit"
                type="submit"
                aria-label={isSearching ? 'Searching for location' : 'Search location'}
                disabled={isSearching}
              >
                <FiSearch aria-hidden="true" />
              </button>
            </form>
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
          {cities.length > 0 ? (
            <div className="city-grid">
              {cities.map((city) => (
                <CityCard
                  key={city.place.id}
                  city={city}
                  onSelect={() => selectCity(city.place.id)}
                  onRefresh={() => refreshCity(city.place)}
                  onRemove={() => removeCity(city.place)}
                  onShowHourly={() => {
                    setSelectedCityId(city.place.id);
                    setShowWeek(false);
                  }}
                  onShowWeekly={() => {
                    setSelectedCityId(city.place.id);
                    setShowWeek(true);
                    loadWeeklyForecast(city.place);
                  }}
                  activeForecast={selectedCityId === city.place.id && showWeek ? 'weekly' : 'hourly'}
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
            <>
              <section className="detail-panel" aria-label={`${selectedCity.place.name} weather details`}>
              <div className="weather-stats">
                <article className="weather-stat weather-stat--feels">
                  <span className="weather-stat__label">Feels like</span>
                  <strong>{selectedWeather ? `${Math.round(selectedWeather.current.apparent_temperature)}°C` : '--'}</strong>
                  <FiThermometer aria-hidden="true" />
                </article>
                <article className="weather-stat weather-stat--range">
                  <span className="weather-stat__label">Min °C</span>
                  <strong>{selectedWeather ? `${Math.round(selectedWeather.daily.temperature_2m_min[0])}°C` : '--'}</strong>
                  <span className="weather-stat__label">Max °C</span>
                  <strong>{selectedWeather ? `${Math.round(selectedWeather.daily.temperature_2m_max[0])}°C` : '--'}</strong>
                </article>
                <article className="weather-stat weather-stat--humidity">
                  <span className="weather-stat__label">Humidity</span>
                  <strong>{selectedWeather ? `${selectedWeather.current.relative_humidity_2m}%` : '--'}</strong>
                  <FiCloudRain aria-hidden="true" />
                </article>
                <article className="weather-stat weather-stat--pressure">
                  <span className="weather-stat__label">Pressure</span>
                  <strong>{selectedWeather ? `${Math.round(selectedWeather.current.pressure_msl)} hPa` : '--'}</strong>
                  <FiActivity aria-hidden="true" />
                </article>
                <article className="weather-stat weather-stat--wind">
                  <span className="weather-stat__label">Wind speed</span>
                  <strong>{selectedWeather ? `${(selectedWeather.current.wind_speed_10m / 3.6).toFixed(2)} m/s` : '--'}</strong>
                  <FiWind aria-hidden="true" />
                </article>
                <article className="weather-stat weather-stat--visibility">
                  <span className="weather-stat__label">Visibility</span>
                  <strong>
                    {selectedWeather
                      ? selectedWeather.current.visibility >= 24000
                        ? '>24 km'
                        : `${(selectedWeather.current.visibility / 1000).toFixed(1)} km`
                      : '--'}
                  </strong>
                  <FiEye aria-hidden="true" />
                </article>
              </div>
              </section>

              <section className="forecast-card hourly-card" aria-labelledby="hourly-forecast-title">
                <div className="hourly-card__heading">
                  <h4 id="hourly-forecast-title">Hourly forecast</h4>
                </div>
                <div className="hourly-chart">
                  {hourly.length > 0 ? (
                    <Line data={chartData} options={chartOptions} aria-label="Hourly temperature forecast chart" />
                  ) : (
                    <div className="chart-placeholder">Hourly forecast is loading…</div>
                  )}
                </div>
              </section>

              <div className="forecast-grid">
                <section className="forecast-card week-card" aria-labelledby="weekly-forecast-title">
                  <h4 id="weekly-forecast-title" className="week-card__title">7-day forecast</h4>
                  {selectedCity.weeklyForecast ? (
                    <div className="week-list">
                      {selectedCity.weeklyForecast.time.map((date, index) => (
                        <div className="week-row" key={date}>
                          <span className="week-row__day">
                            {new Intl.DateTimeFormat('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                              timeZone: 'UTC',
                            }).format(new Date(`${date}T12:00:00Z`))}
                          </span>
                          {weeklyWeatherIcon(selectedCity.weeklyForecast.weather_code[index], 'week-row__icon')}
                          <span className="week-row__range">
                            {Math.round(selectedCity.weeklyForecast.temperature_2m_max[index])}/
                            {Math.round(selectedCity.weeklyForecast.temperature_2m_min[index])}°C
                          </span>
                          <span className="week-row__condition">
                            {weeklyWeatherDescription(selectedCity.weeklyForecast.weather_code[index])}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="forecast-loading">
                      {selectedCity.weekLoading
                        ? 'The 7-day forecast is loading…'
                        : selectedCity.weekError
                          ? 'The 7-day forecast could not be loaded.'
                          : 'Choose weekly forecast on a city card to load the 7-day forecast.'}
                    </p>
                  )}
                </section>
              </div>
            </>
          )}
        </section>

        <section className="news-section section-wrap" id="news">
          <div className="section-heading">
            <h2>Stories under the sky</h2>
          </div>
          <div className="news-grid">
            {NEWS.map((story) => (
              <article className="news-card" key={story.title}>
                <div className="news-card__image" style={{ backgroundImage: `url("${story.image}")` }} role="img" aria-label={story.title} />
                <h3>{story.title}</h3>
              </article>
            ))}
          </div>
          <a className="news-more" href="#gallery">See more</a>
        </section>

        <section className="gallery-section section-wrap" id="gallery">
          <div className="gallery-heading">
            <h2>Beautiful nature</h2>
          </div>
          <div className="gallery-slider">
            <div className="gallery-slider__track">
              {GALLERY.map((item, index) => {
                const position = (index - galleryIndex + 2 + GALLERY.length) % GALLERY.length;

                return (
                  <button
                    className={`gallery-slide gallery-slide--position-${position}`}
                    type="button"
                    key={item.image}
                    aria-label={`Show ${item.alt} in the center`}
                    aria-pressed={position === 2}
                    onClick={() => setGalleryIndex(index)}
                  >
                    <img src={item.image} alt={item.alt} />
                  </button>
                );
              })}
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
          <div className="footer-contact" id="contact">
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
