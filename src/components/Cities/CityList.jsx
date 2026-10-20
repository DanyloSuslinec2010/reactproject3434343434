import PropTypes from 'prop-types';
import CityCard from './CityCard';
import styles from './CityList.module.css';

export default function CityList({ cities, weather, activeId, onOpen, onRefresh, onRemove }) {
  if (cities.length === 0) {
    return <p className={styles.empty}>Список порожній. Знайдіть місто через пошук угорі.</p>;
  }

  return (
    <ul className={styles.list}>
      {cities.map(city => (
        <CityCard
          key={city.id}
          city={city}
          state={weather[city.id]}
          active={city.id === activeId}
          onOpen={() => onOpen(city.id)}
          onRefresh={() => onRefresh(city)}
          onRemove={() => onRemove(city.id)}
        />
      ))}
    </ul>
  );
}

CityList.propTypes = {
  cities: PropTypes.array.isRequired,
  weather: PropTypes.object.isRequired,
  activeId: PropTypes.number,
  onOpen: PropTypes.func.isRequired,
  onRefresh: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
};
