import PropTypes from 'prop-types';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler);

export default function HourlyChart({ times, temps }) {
  const data = {
    labels: times,
    datasets: [
      {
        data: temps,
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.15)',
        fill: true,
        tension: 0.35,
        pointRadius: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { ticks: { maxTicksLimit: 8 } },
      y: { ticks: { callback: value => `${value}°` } },
    },
  };

  return (
    <div style={{ position: 'relative', height: 240 }}>
      <Line data={data} options={options} />
    </div>
  );
}

HourlyChart.propTypes = {
  times: PropTypes.arrayOf(PropTypes.string).isRequired,
  temps: PropTypes.arrayOf(PropTypes.number).isRequired,
};
