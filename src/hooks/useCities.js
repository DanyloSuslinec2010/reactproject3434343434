import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { findCity, fetchCurrent } from '../api/weather';

const STORAGE_KEY = 'cities';
const DEFAULT_CITIES = [
  { id: 703448, name: 'Київ', country: 'Україна', lat: 50.45466, lon: 30.5238 },
];

const readCities = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(saved) ? saved : DEFAULT_CITIES;
  } catch {
    return DEFAULT_CITIES;
  }
};

export function useCities() {
  const [cities, setCities] = useState(readCities);
  // weather[id] = { data, loading, error }
  const [weather, setWeather] = useState({});
  const citiesRef = useRef(cities);

  useEffect(() => {
    citiesRef.current = cities;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cities));
  }, [cities]);

  const loadWeather = async city => {
    setWeather(prev => ({
      ...prev,
      [city.id]: { ...prev[city.id], loading: true, error: null },
    }));

    try {
      const data = await fetchCurrent(city);
      setWeather(prev => ({
        ...prev,
        [city.id]: { data, loading: false, error: null },
      }));
    } catch (error) {
      setWeather(prev => ({
        ...prev,
        [city.id]: { ...prev[city.id], loading: false, error: error.message },
      }));
      toast.error(`${city.name}: ${error.message}`);
    }
  };

  // При завантаженні сторінки оновлюємо погоду для всіх збережених міст
  useEffect(() => {
    citiesRef.current.forEach(loadWeather);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addCity = async name => {
    try {
      const city = await findCity(name);

      if (citiesRef.current.some(item => item.id === city.id)) {
        toast.info(`${city.name} вже є у списку`);
        return;
      }

      setCities(prev => [...prev, city]);
      loadWeather(city);
      toast.success(`${city.name} додано`);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const removeCity = id => {
    setCities(prev => prev.filter(city => city.id !== id));
    setWeather(prev => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  return { cities, weather, addCity, removeCity, refreshCity: loadWeather };
}
