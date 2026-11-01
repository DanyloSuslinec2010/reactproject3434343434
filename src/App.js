import { useEffect, useMemo, useRef, useState } from 'react';
import brandLogo from './logo-1.png';
import { FaFacebookF, FaInstagram, FaWhatsapp } from 'react-icons/fa';
import {
  FiCloud,
  FiCloudDrizzle,
  FiCloudRain,
  FiCloudSnow,
  FiHeart,
  FiMapPin,
  FiMenu,
  FiRefreshCw,
  FiSearch,
  FiSun,
  FiTrash2,
  FiUser,
  FiX,
  FiZap,
} from 'react-icons/fi';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';
import { getForecast, getWeeklyForecast, searchCity } from './services/weather';
import { createPasswordCredential, verifyPassword } from './services/auth';
import RegisterModal from './components/RegisterForm/RegisterModal';
import News from './components/News';
import WeatherDetails from './components/Forecast/WeatherDetails';
import HourlyForecast from './components/Forecast/HourlyForecast';
import WeeklyForecast from './components/Forecast/WeeklyForecast';

const DEFAULT_CITIES = [
  { id: 'kyiv-ukraine', name: 'Kyiv', country: 'Ukraine', latitude: 50.45, longitude: 30.52 },
  { id: 'london-united-kingdom', name: 'London', country: 'United Kingdom', latitude: 51.51, longitude: -0.13 },
  { id: 'tokyo-japan', name: 'Tokyo', country: 'Japan', latitude: 35.68, longitude: 139.69 },
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

function readCities() {
  const savedCities = readStoredValue('weather-cities', null);
  return Array.isArray(savedCities) ? savedCities : DEFAULT_CITIES;
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

  function toggleHourlyForecast(city) {
    if (selectedCityId === city.place.id) {
      setVisibleForecasts((current) => ({
        ...current,
        hourly: !current.hourly,
      }));
      return;
    }

    setSelectedCityId(city.place.id);
    setVisibleForecasts({ hourly: true, weekly: false });
  }

  function toggleWeeklyForecast(city) {
    const isSelectedCity = selectedCityId === city.place.id;
    const showForecast = !isSelectedCity || !visibleForecasts.weekly;

    if (isSelectedCity) {
      setVisibleForecasts((current) => ({
        ...current,
        weekly: !current.weekly,
      }));
    } else {
      setSelectedCityId(city.place.id);
      setVisibleForecasts({ hourly: false, weekly: true });
    }

    if (showForecast && !city.weeklyForecast && !city.weekLoading) {
      loadWeeklyForecast(city.place);
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
                  onShowHourly={() => toggleHourlyForecast(city)}
                  onShowWeekly={() => toggleWeeklyForecast(city)}
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
                  <div
                    key={selectedCity.place.id}
                    ref={detailPanelRef}
                  >
                    <WeatherDetails cityName={selectedCity.place.name} weather={selectedWeather} />
                    <HourlyForecast weather={selectedWeather} />
                  </div>
                </>
              )}

              {visibleForecasts.weekly && (
                <WeeklyForecast
                  forecast={selectedCity.weeklyForecast}
                  isLoading={selectedCity.weekLoading}
                  hasError={selectedCity.weekError}
                />
              )}
            </>
          )}
        </section>

        <News />

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
