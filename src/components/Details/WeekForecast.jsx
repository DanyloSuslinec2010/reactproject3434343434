import PropTypes from 'prop-types';
import { getWeatherInfo } from '../../utils/weatherCodes';
import styles from './Details.module.css';

export default function WeekForecast({ days }) {
  return (
    <ul className={styles.week}>
      {days.map(day => {
        const { Icon, label } = getWeatherInfo(day.code);
        const weekday = new Date(day.date).toLocaleDateString('uk-UA', {
          weekday: 'short',
          day: 'numeric',
          month: 'numeric',
        });

        return (
          <li key={day.date} className={styles.weekItem}>
            <span className={styles.weekDay}>{weekday}</span>
            <Icon size={36} color="#f59e0b" title={label} />
            <span>
              {day.max}° / {day.min}°
            </span>
          </li>
        );
      })}
    </ul>
  );
}

WeekForecast.propTypes = {
  days: PropTypes.arrayOf(
    PropTypes.shape({
      date: PropTypes.string.isRequired,
      code: PropTypes.number.isRequired,
      max: PropTypes.number.isRequired,
      min: PropTypes.number.isRequired,
    }),
  ).isRequired,
};
