import PropTypes from 'prop-types';
import {
  FiActivity,
  FiCloudRain,
  FiEye,
  FiThermometer,
  FiWind,
} from 'react-icons/fi';

function WeatherDetails({ cityName, weather }) {
  if (!weather) {
    return null;
  }

  const { current, daily } = weather;
  const visibility = current.visibility >= 24000
    ? '>24 km'
    : `${(current.visibility / 1000).toFixed(1)} km`;

  return (
    <section className="detail-panel" aria-label={`${cityName} weather details`}>
      <div className="weather-stats">
        <article className="weather-stat weather-stat--feels">
          <span className="weather-stat__label">Temperature</span>
          <strong>{Math.round(current.temperature_2m)}°C</strong>
          <span className="weather-stat__feels-like">
            Feels like {Math.round(current.apparent_temperature)}°C
          </span>
          <FiThermometer aria-hidden="true" />
        </article>
        <article className="weather-stat weather-stat--range">
          <span className="weather-stat__label">Min °C</span>
          <strong>{Math.round(daily.temperature_2m_min[0])}°C</strong>
          <span className="weather-stat__label">Max °C</span>
          <strong>{Math.round(daily.temperature_2m_max[0])}°C</strong>
        </article>
        <article className="weather-stat weather-stat--humidity">
          <span className="weather-stat__label">Humidity</span>
          <strong>{current.relative_humidity_2m}%</strong>
          <FiCloudRain aria-hidden="true" />
        </article>
        <article className="weather-stat weather-stat--pressure">
          <span className="weather-stat__label">Pressure</span>
          <strong>{Math.round(current.pressure_msl)} hPa</strong>
          <FiActivity aria-hidden="true" />
        </article>
        <article className="weather-stat weather-stat--wind">
          <span className="weather-stat__label">Wind speed</span>
          <strong>{(current.wind_speed_10m / 3.6).toFixed(2)} m/s</strong>
          <FiWind aria-hidden="true" />
        </article>
        <article className="weather-stat weather-stat--visibility">
          <span className="weather-stat__label">Visibility</span>
          <strong>{visibility}</strong>
          <FiEye aria-hidden="true" />
        </article>
      </div>
    </section>
  );
}

WeatherDetails.propTypes = {
  cityName: PropTypes.string.isRequired,
  weather: PropTypes.shape({
    current: PropTypes.shape({
      temperature_2m: PropTypes.number.isRequired,
      apparent_temperature: PropTypes.number.isRequired,
      relative_humidity_2m: PropTypes.number.isRequired,
      pressure_msl: PropTypes.number.isRequired,
      wind_speed_10m: PropTypes.number.isRequired,
      visibility: PropTypes.number.isRequired,
    }).isRequired,
    daily: PropTypes.shape({
      temperature_2m_min: PropTypes.arrayOf(PropTypes.number).isRequired,
      temperature_2m_max: PropTypes.arrayOf(PropTypes.number).isRequired,
    }).isRequired,
  }),
};

export default WeatherDetails;
