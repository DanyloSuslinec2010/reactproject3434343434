import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import { Oval } from 'react-loader-spinner';
import { fetchHourly, fetchWeek } from '../../api/weather';
import { getWeatherInfo } from '../../utils/weatherCodes';
import TempScale from './TempScale';
import HourlyChart from './HourlyChart';
import WeekForecast from './WeekForecast';
import styles from './Details.module.css';

export default function Details({ city, current, onClose }) {
  const [hourly, setHourly] = useState(null);
  const [week, setWeek] = useState(null);
  const [weekLoading, setWeekLoading] = useState(false);

  // Погодинний прогноз на сьогодні тягнемо при відкритті, і ще раз, якщо змінилось місто
  useEffect(() => {
    let ignore = false;
    setHourly(null);
    setWeek(null);

    fetchHourly(city)
      .then(data => {
        if (!ignore) setHourly(data);
      })
      .catch(error => toast.error(error.message));

    return () => {
      ignore = true;
    };
  }, [city]);

  const handleWeekClick = async () => {
    setWeekLoading(true);
    try {
      setWeek(await fetchWeek(city));
    } catch (error) {
      toast.error(error.message);
    } finally {
      setWeekLoading(false);
    }
  };

  const { Icon, label } = getWeatherInfo(current.code);
  const scaleMin = hourly ? Math.min(...hourly.temps) : current.min;
  const scaleMax = hourly ? Math.max(...hourly.temps) : current.max;

  const facts = [
    ['Відчувається як', `${current.feels}°C`],
    ['Вологість', `${current.humidity}%`],
    ['Вітер', `${current.wind} км/год`],
    ['Тиск', `${current.pressure} гПа`],
  ];

  return (
    <section className={styles.details}>
      <div className={styles.head}>
        <div>
          <h2 className={styles.city}>
            {city.name}, {city.country}
          </h2>
          <p className={styles.label}>{label}</p>
        </div>
        <Icon size={72} color="#f59e0b" />
        <button type="button" className={styles.closeBtn} onClick={onClose}>
          Закрити
        </button>
      </div>

      <TempScale temp={current.temp} min={scaleMin} max={scaleMax} />

      <ul className={styles.facts}>
        {facts.map(([title, value]) => (
          <li key={title} className={styles.fact}>
            <span className={styles.factTitle}>{title}</span>
            <span className={styles.factValue}>{value}</span>
          </li>
        ))}
      </ul>

      <h3 className={styles.subtitle}>Погодинний прогноз</h3>
      {hourly ? (
        <HourlyChart times={hourly.times} temps={hourly.temps} />
      ) : (
        <Oval height={32} width={32} color="#3b82f6" secondaryColor="#bfdbfe" />
      )}

      <button
        type="button"
        className={styles.weekBtn}
        onClick={handleWeekClick}
        disabled={weekLoading}
      >
        {weekLoading ? 'Завантаження...' : 'Прогноз на 7 днів'}
      </button>

      {week && <WeekForecast days={week} />}
    </section>
  );
}

Details.propTypes = {
  city: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    country: PropTypes.string,
    lat: PropTypes.number.isRequired,
    lon: PropTypes.number.isRequired,
  }).isRequired,
  current: PropTypes.shape({
    temp: PropTypes.number.isRequired,
    feels: PropTypes.number,
    humidity: PropTypes.number,
    wind: PropTypes.number,
    pressure: PropTypes.number,
    code: PropTypes.number.isRequired,
    min: PropTypes.number,
    max: PropTypes.number,
  }).isRequired,
  onClose: PropTypes.func.isRequired,
};
