import { useEffect, useMemo, useRef, useState } from 'react';
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
import { getNews } from './services/newsApi';
import { fallbackNews } from './data/fallbackNews';

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

const NEWS_REFRESH_INTERVAL = 15 * 60 * 1000;

function readStoredValue(key, fallback) {
  try {
    const value = window.localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch (error) {
    console.error(`Could not read ${key} from local storage.`, error);
    return fallback;
  }
}

function bytesToHex(bytes) {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

function hexToBytes(hex) {
  return new Uint8Array(hex.match(/.{2}/g).map((byte) => Number.parseInt(byte, 16)));
}

async function derivePasswordHash(password, salt) {
  const key = await window.crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  );
  const derivedBits = await window.crypto.subtle.deriveBits({
    name: 'PBKDF2',
    salt,
    iterations: 120000,
    hash: 'SHA-256',
  }, key, 256);
  return new Uint8Array(derivedBits);
}

async function createPasswordCredential(password) {
  if (!window.crypto?.subtle) {
    throw new Error('Secure password storage is unavailable in this browser.');
  }
  const salt = window.crypto.getRandomValues(new Uint8Array(16));
  const hash = await derivePasswordHash(password, salt);
  return { salt: bytesToHex(salt), hash: bytesToHex(hash) };
}

async function verifyPassword(password, credential) {
  if (!window.crypto?.subtle) {
    throw new Error('Secure password verification is unavailable in this browser.');
  }
  const hash = await derivePasswordHash(password, hexToBytes(credential.salt));
  const expectedHash = hexToBytes(credential.hash);
  return hash.length === expectedHash.length
    && hash.every((byte, index) => byte === expectedHash[index]);
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

function CityCard({
  city,
  onSelect,
  onCta,
  onRefresh,
  onRemove,
  onShowHourly,
  onShowWeekly,
  activeForecasts,
}) {
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
          className={`city-card__toggle${activeForecasts.hourly ? ' city-card__toggle--active' : ''}`}
          onClick={onShowHourly}
          aria-pressed={activeForecasts.hourly}
        >
          Hourly forecast
        </button>
        <button
          type="button"
          className={`city-card__toggle${activeForecasts.weekly ? ' city-card__toggle--active' : ''}`}
          onClick={onShowWeekly}
          aria-pressed={activeForecasts.weekly}
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
        <button className="city-card__cta" type="button" onClick={onCta}>
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

function RegisterModal({ onClose, onRegister, onLogin }) {
  const [isLogin, setIsLogin] = useState(false);
  const formik = useFormik({
    initialValues: { name: '', email: '', password: '' },
    onSubmit: (values) => {
      const email = values.email.trim();
      return isLogin
        ? onLogin({ email, password: values.password })
        : onRegister({ name: values.name.trim(), email, password: values.password });
    },
  });

  function switchMode() {
    setIsLogin((current) => !current);
    formik.resetForm();
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <section className="register-modal" role="dialog" aria-modal="true" aria-labelledby="register-title">
        <h2 id="register-title">{isLogin ? 'Log In' : 'Sign up'}</h2>
        <form className="register-form" onSubmit={formik.handleSubmit}>
          {!isLogin && (
            <div className="register-form__field">
              <label htmlFor="register-name">Username</label>
              <input
                id="register-name"
                name="name"
                type="text"
                autoComplete="name"
                placeholder="Username"
                value={formik.values.name}
                onChange={formik.handleChange}
                required
              />
            </div>
          )}
          <div className="register-form__field">
            <label htmlFor="register-email">E-Mail</label>
            <input
              id="register-email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="E-Mail"
              value={formik.values.email}
              onChange={formik.handleChange}
              required
            />
          </div>
          <div className="register-form__field">
            <label htmlFor="register-password">Password</label>
            <input
              id="register-password"
              name="password"
              type="password"
              autoComplete={isLogin ? 'current-password' : 'new-password'}
              placeholder="Password"
              value={formik.values.password}
              onChange={formik.handleChange}
              required
              minLength={isLogin ? undefined : 6}
            />
          </div>
          <button className="register-form__submit" type="submit" disabled={formik.isSubmitting}>
            {isLogin ? 'Log In' : 'Sign up'}
          </button>
        </form>
        <p className="register-modal__login">
          {isLogin ? "Don't have an account? " : 'Already have an account? '}
          <button className="register-modal__mode" type="button" onClick={switchMode}>
            {isLogin ? 'Sign up' : 'Log In'}
          </button>
        </p>
      </section>
    </div>
  );
}

export default function App() {
  const detailPanelRef = useRef(null);
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
  const [newsItems, setNewsItems] = useState(fallbackNews);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [galleryItems, setGalleryItems] = useState([]);
  const [galleryLoading, setGalleryLoading] = useState(true);
  const [galleryError, setGalleryError] = useState('');
  const [galleryRetry, setGalleryRetry] = useState(0);
  const [visibleForecasts, setVisibleForecasts] = useState({ hourly: false, weekly: false });
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
    const controller = new AbortController();
    let isLoading = false;

    async function refreshNews() {
      if (isLoading) return;
      isLoading = true;
      try {
        const items = await getNews({ signal: controller.signal });
        if (items.length > 0) {
          setNewsItems([...items, ...fallbackNews].slice(0, 4));
        }
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Could not refresh the news.', error);
        }
      } finally {
        isLoading = false;
      }
    }

    refreshNews();
    const intervalId = window.setInterval(refreshNews, NEWS_REFRESH_INTERVAL);
    return () => {
      window.clearInterval(intervalId);
      controller.abort();
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    async function loadGallery() {
      setGalleryLoading(true);
      setGalleryError('');

      try {
        const response = await fetch(`${process.env.PUBLIC_URL}/gallery.json`, {
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error(`Gallery request failed with status ${response.status}.`);
        }

        const items = await response.json();
        if (!Array.isArray(items) || !items.every((item) => (
          item
          && typeof item.image === 'string'
          && typeof item.alt === 'string'
        ))) {
          throw new Error('Gallery response has an invalid format.');
        }

        setGalleryItems(items);
        setGalleryIndex(0);
      } catch (error) {
        if (error.name === 'AbortError') return;
        console.error('Could not load the gallery.', error);
        setGalleryError('The gallery could not be loaded.');
      } finally {
        if (!controller.signal.aborted) setGalleryLoading(false);
      }
    }

    loadGallery();
    return () => controller.abort();
  }, [galleryRetry]);

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
    setVisibleForecasts({ hourly: true, weekly: false });
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

  async function registerUser({ name, email, password }) {
    try {
      const normalizedEmail = email.toLowerCase();
      const accounts = readStoredValue('weather-credentials', {});
      if (accounts[normalizedEmail]) {
        toast.error('An account with this email already exists. Log in instead.');
        return;
      }

      const credential = await createPasswordCredential(password);
      const profile = { name, email };
      window.localStorage.setItem('weather-credentials', JSON.stringify({
        ...accounts,
        [normalizedEmail]: { name, ...credential },
      }));
      window.localStorage.setItem('weather-user', JSON.stringify(profile));
      setUser(profile);
      setIsRegisterOpen(false);
      toast.success(`Welcome, ${profile.name}!`);
    } catch (error) {
      console.error('Could not save your profile.', error);
      toast.error('Your profile could not be saved on this device.');
    }
  }

  async function loginUser({ email, password }) {
    try {
      const accounts = readStoredValue('weather-credentials', {});
      const account = accounts[email.toLowerCase()];
      if (!account || !(await verifyPassword(password, account))) {
        toast.error('Email or password is incorrect.');
        return;
      }

      const profile = { name: account.name, email };
      window.localStorage.setItem('weather-user', JSON.stringify(profile));
      setUser(profile);
      setIsRegisterOpen(false);
      toast.success(`Welcome back, ${profile.name}!`);
    } catch (error) {
      console.error('Could not sign in.', error);
      toast.error(error.message || 'You could not be signed in. Please try again.');
    }
  }

  function logOutUser() {
    try {
      window.localStorage.removeItem('weather-user');
      setUser(null);
    } catch (error) {
      console.error('Could not sign out of your profile.', error);
      toast.error('You could not be signed out. Please try again.');
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
              <button
                className="button button--outline user-greeting__logout"
                type="button"
                onClick={logOutUser}
              >
                Log out
              </button>
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
                  onCta={() => {
                    selectCity(city.place.id);
                    detailPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                  onRefresh={() => refreshCity(city.place)}
                  onRemove={() => removeCity(city.place)}
                  onShowHourly={() => {
                    if (selectedCityId === city.place.id) {
                      setVisibleForecasts((current) => ({ ...current, hourly: !current.hourly }));
                    } else {
                      setSelectedCityId(city.place.id);
                      setVisibleForecasts({ hourly: true, weekly: false });
                    }
                  }}
                  onShowWeekly={() => {
                    const isSelectedCity = selectedCityId === city.place.id;
                    const willShow = !isSelectedCity || !visibleForecasts.weekly;
                    if (isSelectedCity) {
                      setVisibleForecasts((current) => ({ ...current, weekly: !current.weekly }));
                    } else {
                      setSelectedCityId(city.place.id);
                      setVisibleForecasts({ hourly: false, weekly: true });
                    }
                    if (willShow && !city.weeklyForecast && !city.weekLoading) {
                      loadWeeklyForecast(city.place);
                    }
                  }}
                  activeForecasts={selectedCityId === city.place.id
                    ? visibleForecasts
                    : { hourly: false, weekly: false }}
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
              {visibleForecasts.hourly && (
                <>
              <section
                key={selectedCity.place.id}
                ref={detailPanelRef}
                className="detail-panel"
                aria-label={`${selectedCity.place.name} weather details`}
              >
              <div className="weather-stats">
                <article className="weather-stat weather-stat--feels">
                  <span className="weather-stat__label">Temperature</span>
                  <strong>{selectedWeather ? `${Math.round(selectedWeather.current.temperature_2m)}°C` : '--'}</strong>
                  <span className="weather-stat__feels-like">
                    Feels like {selectedWeather ? `${Math.round(selectedWeather.current.apparent_temperature)}°C` : '--'}
                  </span>
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
                </>
              )}

              {visibleForecasts.weekly && (
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
                          : 'The 7-day forecast could not be loaded.'}
                      </p>
                    )}
                  </section>
                </div>
              )}
            </>
          )}
        </section>

        <section className="news-section section-wrap" id="news">
          <div className="section-heading">
            <h2>Stories under the sky</h2>
            <p className="news-refresh-note">News refreshes automatically every 15 minutes.</p>
          </div>
          <div className="news-grid">
            {newsItems.slice(0, 4).map((story) => (
              <article className="news-card" key={story.id}>
                <div
                  className="news-card__image"
                  style={{
                    backgroundImage: `url("https://picsum.photos/seed/${encodeURIComponent(story.id)}/900/600")`,
                  }}
                  role="img"
                  aria-label={story.title}
                />
                <div className="news-card__content">
                  <time dateTime={story.date}>{new Date(story.date).toLocaleDateString()}</time>
                  <h3>{story.title}</h3>
                  {story.source && (
                    <span className="news-card__source">Source: {story.source}</span>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="gallery-section section-wrap" id="gallery">
          <div className="gallery-heading">
            <h2>Beautiful nature</h2>
          </div>
          {galleryLoading ? (
            <p role="status">Loading gallery…</p>
          ) : galleryError ? (
            <div role="alert">
              <p>{galleryError}</p>
              <button className="button button--outline" type="button" onClick={() => setGalleryRetry((retry) => retry + 1)}>
                Try again
              </button>
            </div>
          ) : galleryItems.length > 0 ? (
            <div className="gallery-slider">
              <div className="gallery-slider__track">
                {galleryItems.map((item, index) => {
                  const position = (index - galleryIndex + 2 + galleryItems.length) % galleryItems.length;

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
          ) : (
            <p role="status">No gallery images are available.</p>
          )}
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

      {isRegisterOpen && (
        <RegisterModal
          onClose={() => setIsRegisterOpen(false)}
          onRegister={registerUser}
          onLogin={loginUser}
        />
      )}
      <ToastContainer position="bottom-right" autoClose={3000} theme="dark" />
    </div>
  );
}
