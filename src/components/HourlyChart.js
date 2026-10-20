import styled from 'styled-components';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip);

export default function HourlyChart({ data }) {
  const chartData = {
    labels: data.map(item => item.time),
    datasets: [
      {
        label: 'Температура, °C',
        data: data.map(item => item.temp),
        borderColor: '#2f80ed',
        backgroundColor: 'rgba(47, 128, 237, 0.15)',
        pointRadius: 3,
        tension: 0.35,
        fill: true,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      x: { ticks: { maxTicksLimit: 8 }, grid: { display: false } },
      y: { ticks: { callback: value => `${value}°` } },
    },
  };

  return (
    <Wrapper>
      <Line data={chartData} options={options} />
    </Wrapper>
  );
}

const Wrapper = styled.div`
  position: relative;
  height: 220px;

  ${p => p.theme.media.tablet} {
    height: 280px;
  }

  ${p => p.theme.media.desktop} {
    height: 340px;
  }
`;
