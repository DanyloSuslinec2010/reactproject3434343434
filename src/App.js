import { useCallback, useEffect, useRef, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Header from './components/Header';
import Hero from './components/Hero';
import CityList from './components/CityList';
import Details from './components/Details';
import News from './components/News';
import Gallery from './components/Gallery';
import Footer from './components/Footer';
import { useLocalStorage } from './hooks/useLocalStorage';
import { findCity, getCurrentWeather } from './services/weatherApi';

export default function App() {
  // Пользователь и список городов живут в localStorage
  const [user, setUser] = useLocalStorage('weather-user', null);
  const [cities, setCities] = useLocalStorage('weather-cities', []);

  // Погода по id города: { data, loading, error }
  const [weather, setWeather] = useState({});
  const [selectedId, setSelectedId] = useState(null);
  const detailsRef = useRef(null);

  const loadWeather = useCallback(async city => {
    setWeather(prev => ({
      ...prev,
      [city.id]: { ...prev[city.id], loading: true, error: null },
    }));

    try {
      const data = await getCurrentWeather(city);
      setWeather(prev => ({ ...prev, [city.id]: { data, loading: false, error: null } }));
      return true;
    } catch (error) {
      setWeather(prev => ({
        ...prev,
        [city.id]: { ...prev[city.id], loading: false, error: error.message },
      }));
      toast.error(`${city.name}: ${error.message}`);
      return false;
    }
  }, []);

  // При загрузке страницы обновляем погоду для всех сохраненных городов
  useEffect(() => {
    cities.forEach(city => loadWeather(city));
    // нужно только один раз при старте
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = async name => {
    try {
      const city = await findCity(name);

      if (cities.some(item => item.id === city.id)) {
        toast.info(`${city.name} уже є у списку`);
        return false;
      }

      setCities(prev => [...prev, city]);
      await loadWeather(city);
      toast.success(`${city.name} додано`);
      return true;
    } catch (error) {
      toast.error(error.message);
      return false;
    }
  };

  const handleRemove = id => {
    setCities(prev => prev.filter(city => city.id !== id));
    setWeather(prev => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
    if (selectedId === id) setSelectedId(null);
  };

  const handleRefresh = async id => {
    const city = cities.find(item => item.id === id);
    if (!city) return;
    const ok = await loadWeather(city);
    if (ok) toast.success(`Погоду в місті ${city.name} оновлено`);
  };

  const handleSelect = id => {
    setSelectedId(id);
    // Ждем, пока блок отрисуется, и прокручиваем к нему
    setTimeout(() => {
      detailsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  const selectedCity = cities.find(city => city.id === selectedId);
  const selectedWeather = selectedCity ? weather[selectedCity.id]?.data : null;

  return (
    <>
      <Header user={user} onRegister={setUser} onLogout={() => setUser(null)} />
      <main>
        <Hero onSearch={handleSearch} />
        <CityList
          cities={cities}
          weather={weather}
          selectedId={selectedId}
          onSelect={handleSelect}
          onRefresh={handleRefresh}
          onRemove={handleRemove}
        />
        <div ref={detailsRef}>
          {selectedCity && selectedWeather && (
            <Details
              city={selectedCity}
              current={selectedWeather}
              onClose={() => setSelectedId(null)}
            />
          )}
        </div>
        <News />
        <Gallery />
      </main>
      <Footer />
      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
}
