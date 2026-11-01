import PropTypes from 'prop-types';
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

function weatherIcon(code) {
  if (code === 0) return <WiDaySunny className="week-row__icon" />;
  if (code === 1 || code === 2) return <WiDayCloudy className="week-row__icon" />;
  if (code === 3) return <WiCloudy className="week-row__icon" />;
  if (code === 45 || code === 48) return <WiFog className="week-row__icon" />;
  if (code >= 51 && code <= 57) return <WiSleet className="week-row__icon" />;
  if (code === 61) return <WiDayRain className="week-row__icon" />;
  if (code === 63 || code === 65 || (code >= 80 && code <= 82)) {
    return <WiShowers className="week-row__icon" />;
  }
  if (code === 66 || code === 67) return <WiRain className="week-row__icon" />;
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) {
    return <WiDaySnow className="week-row__icon" />;
  }
  if (code >= 95) return <WiThunderstorm className="week-row__icon" />;
  return <WiDayCloudy className="week-row__icon" />;
}

function weatherDescription(code) {
  if (code === 0) return 'clear sky';
  if (code === 1) return 'mainly clear';
  if (code === 2) return 'few clouds';
  if (code === 3) return 'overcast clouds';
  if (code === 45 || code === 48) return 'fog';
  if (code === 51 || code === 56) return 'light drizzle';
  if (code === 53 || code === 55 || code === 57) return 'drizzle';
  if (code === 61 || code === 80) return 'light rain';
  if (code === 63 || code === 66) return 'moderate rain';
  if (code === 65 || code === 67) return 'heavy rain';
  if (code === 71 || code === 85) return 'light snow';
  if (code === 73 || code === 77) return 'snow';
  if (code === 75 || code === 86) return 'heavy snow';
  if (code === 81) return 'rain showers';
  if (code === 82) return 'heavy showers';
  if (code >= 95) return 'thunderstorm';
  return 'cloudy';
}

function WeeklyForecast({ forecast, isLoading, hasError }) {
  return (
    <div className="forecast-grid">
      <section className="forecast-card week-card" aria-labelledby="weekly-forecast-title">
        <h4 id="weekly-forecast-title" className="week-card__title">7-day forecast</h4>
        {forecast ? (
          <div className="week-list">
            {forecast.time.map((date, index) => (
              <div className="week-row" key={date}>
                <span className="week-row__day">
                  {new Intl.DateTimeFormat('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    timeZone: 'UTC',
                  }).format(new Date(`${date}T12:00:00Z`))}
                </span>
                {weatherIcon(forecast.weather_code[index])}
                <span className="week-row__range">
                  {Math.round(forecast.temperature_2m_max[index])}/
                  {Math.round(forecast.temperature_2m_min[index])}°C
                </span>
                <span className="week-row__condition">
                  {weatherDescription(forecast.weather_code[index])}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="forecast-loading">
            {isLoading
              ? 'The 7-day forecast is loading…'
              : hasError
                ? 'The 7-day forecast could not be loaded.'
                : 'Choose weekly forecast on a city card to load the 7-day forecast.'}
          </p>
        )}
      </section>
    </div>
  );
}

WeeklyForecast.propTypes = {
  forecast: PropTypes.shape({
    time: PropTypes.arrayOf(PropTypes.string).isRequired,
    weather_code: PropTypes.arrayOf(PropTypes.number).isRequired,
    temperature_2m_max: PropTypes.arrayOf(PropTypes.number).isRequired,
    temperature_2m_min: PropTypes.arrayOf(PropTypes.number).isRequired,
  }),
  isLoading: PropTypes.bool.isRequired,
  hasError: PropTypes.bool.isRequired,
};

export default WeeklyForecast;
