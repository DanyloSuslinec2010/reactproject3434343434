import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { toast } from 'react-toastify';
import { TailSpin } from 'react-loader-spinner';
import { FiDroplet, FiWind, FiThermometer, FiSunrise, FiSunset, FiX } from 'react-icons/fi';
import { WiBarometer } from 'react-icons/wi';
import Container from './Container';
import { Section, SectionTitle, MainButton } from './Section';
import HourlyChart from './HourlyChart';
import TempScale from './TempScale';
import WeekList from './WeekList';
import { getHourlyForecast, getWeekForecast } from '../services/weatherApi';
import { getWeatherInfo } from '../utils/weatherCodes';

export default function Details({ city, current, onClose }) {
  const [hourly, setHourly] = useState([]);
  const [hourlyLoading, setHourlyLoading] = useState(false);

  const [week, setWeek] = useState([]);
  const [weekLoading, setWeekLoading] = useState(false);
  const [showWeek, setShowWeek] = useState(false);

  const updatedAt = current ? current.updatedAt : null;
  useEffect(() => {
    let ignore = false;
    setHourlyLoading(true);
    setShowWeek(false);
    setWeek([]);

    getHourlyForecast(city)
      .then(data => {
        if (!ignore) setHourly(data);
      })
      .catch(error => {
        if (!ignore) toast.error(error.message);
      })
      .finally(() => {
        if (!ignore) setHourlyLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [city, updatedAt]);

  const handleWeek = async () => {
    if (showWeek) {
      setShowWeek(false);
      return;
    }
    setShowWeek(true);
    if (week.length > 0) return;

    setWeekLoading(true);
    try {
      setWeek(await getWeekForecast(city));
    } catch (error) {
      toast.error(error.message);
      setShowWeek(false);
    } finally {
      setWeekLoading(false);
    }
  };

  if (!current) return null;
  const info = getWeatherInfo(current.code);

  return (
    <Section id="details">
      <Container>
        <Box>
          <Head>
            <SectionTitle as="h2" style={{ margin: 0 }}>
              {city.name}, {city.country}
            </SectionTitle>
            <CloseBtn type="button" onClick={onClose} aria-label="Закрити деталі">
              <FiX size={22} />
            </CloseBtn>
          </Head>

          <Now>
            <info.Icon size={96} color="#2f80ed" />
            <div>
              <Big>{current.temp}°C</Big>
              <p>{info.label}</p>
            </div>
          </Now>

          <Stats>
            <Stat>
              <FiThermometer /> Відчувається як <b>{current.feelsLike}°</b>
            </Stat>
            <Stat>
              <FiDroplet /> Вологість <b>{current.humidity}%</b>
            </Stat>
            <Stat>
              <FiWind /> Вітер <b>{current.wind} м/с</b>
            </Stat>
            <Stat>
              <WiBarometer size={20} /> Тиск <b>{current.pressure} мм</b>
            </Stat>
            <Stat>
              <FiSunrise /> Схід <b>{current.sunrise}</b>
            </Stat>
            <Stat>
              <FiSunset /> Захід <b>{current.sunset}</b>
            </Stat>
          </Stats>

          <TempScale min={current.min} max={current.max} value={current.temp} />

          <BlockTitle>Погодинний прогноз на сьогодні</BlockTitle>
          {hourlyLoading ? (
            <Loader>
              <TailSpin height={40} width={40} color="#2f80ed" ariaLabel="Завантаження" />
            </Loader>
          ) : (
            <HourlyChart data={hourly} />
          )}

          <MainButton type="button" onClick={handleWeek} disabled={weekLoading}>
            {showWeek ? 'Сховати прогноз' : 'Прогноз на 7 днів'}
          </MainButton>

          {showWeek && (
            <WeekBox>
              {weekLoading ? (
                <Loader>
                  <TailSpin height={40} width={40} color="#2f80ed" ariaLabel="Завантаження" />
                </Loader>
              ) : (
                <WeekList days={week} />
              )}
            </WeekBox>
          )}
        </Box>
      </Container>
    </Section>
  );
}

const Box = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px 16px;
  border-radius: 20px;
  background: ${p => p.theme.colors.card};
  box-shadow: 0 4px 16px rgba(30, 60, 100, 0.08);

  ${p => p.theme.media.tablet} {
    gap: 24px;
    padding: 28px;
  }

  ${p => p.theme.media.desktop} {
    padding: 40px;
  }
`;

const Head = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`;

const CloseBtn = styled.button`
  display: flex;
  padding: 6px;
  border: none;
  border-radius: 8px;
  background: ${p => p.theme.colors.bg};
  color: ${p => p.theme.colors.muted};
`;

const Now = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const Big = styled.p`
  font-size: 48px;
  font-weight: 700;
  line-height: 1.1;

  ${p => p.theme.media.desktop} {
    font-size: 64px;
  }
`;

const Stats = styled.ul`
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;

  ${p => p.theme.media.tablet} {
    grid-template-columns: repeat(2, 1fr);
  }

  ${p => p.theme.media.desktop} {
    grid-template-columns: repeat(3, 1fr);
  }
`;

const Stat = styled.li`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border-radius: 12px;
  background: ${p => p.theme.colors.bg};

  b {
    margin-left: auto;
  }
`;

const BlockTitle = styled.h3`
  font-size: 18px;
`;

const Loader = styled.div`
  display: flex;
  justify-content: center;
  padding: 24px 0;
`;

const WeekBox = styled.div`
  padding-top: 4px;
`;
