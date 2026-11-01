import PropTypes from 'prop-types';
import {
  Chart as ChartJS,
  CategoryScale,
  Filler,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, Filler, LinearScale, LineElement, PointElement, Tooltip);

function getForecastHours(weather) {
  const { time, temperature_2m: temperatures, precipitation_probability: rain } = weather.hourly;
  const currentTime = weather.current.time;
  let startIndex = time.findIndex((hour) => hour >= currentTime);

  if (startIndex < 0) {
    startIndex = 0;
  }

  return time.slice(startIndex, startIndex + 24).map((hour, index) => ({
    time: hour,
    temperature: temperatures[startIndex + index],
    rain: rain?.[startIndex + index] ?? 0,
  }));
}

function getChartLabel(time, index, hours) {
  const previousHour = hours[index - 1];
  if (previousHour && time.slice(0, 10) !== previousHour.time.slice(0, 10)) {
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' })
      .format(new Date(`${time.slice(0, 10)}T12:00:00`));
  }

  if (index === 0) {
    return 'Now';
  }

  return new Intl.DateTimeFormat('en-US', { hour: 'numeric' })
    .format(new Date(`2000-01-01T${time.slice(11)}:00`));
}

function getChartOptions(temperatures) {
  const min = Math.floor(Math.min(...temperatures, 0) / 5) * 5;
  const max = Math.max(min + 5, Math.ceil(Math.max(...temperatures, 1) / 5) * 5);

  return {
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
        min,
        max,
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
}

function HourlyForecast({ weather }) {
  const hours = weather ? getForecastHours(weather) : [];
  const temperatures = hours.map(({ temperature }) => Math.round(temperature));
  const data = {
    labels: hours.map(({ time }, index) => getChartLabel(time, index, hours)),
    datasets: [{
      data: temperatures,
      borderColor: '#ff9c42',
      backgroundColor: 'transparent',
      fill: false,
      tension: 0.18,
      borderWidth: 2,
      pointRadius: 0,
      pointHoverRadius: 4,
    }],
  };

  return (
    <section className="forecast-card hourly-card" aria-labelledby="hourly-forecast-title">
      <div className="hourly-card__heading">
        <h4 id="hourly-forecast-title">Hourly forecast</h4>
      </div>
      <div className="hourly-chart">
        {weather ? (
          <Line
            data={data}
            options={getChartOptions(temperatures)}
            aria-label="Hourly temperature forecast chart"
          />
        ) : (
          <div className="chart-placeholder">Hourly forecast is loading…</div>
        )}
      </div>
    </section>
  );
}

HourlyForecast.propTypes = {
  weather: PropTypes.shape({
    current: PropTypes.shape({
      time: PropTypes.string.isRequired,
    }).isRequired,
    hourly: PropTypes.shape({
      time: PropTypes.arrayOf(PropTypes.string).isRequired,
      temperature_2m: PropTypes.arrayOf(PropTypes.number).isRequired,
      precipitation_probability: PropTypes.arrayOf(PropTypes.number),
    }).isRequired,
  }),
};

export default HourlyForecast;
