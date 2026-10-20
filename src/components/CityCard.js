import styled, { keyframes } from 'styled-components';
import { FiRefreshCw, FiX, FiDroplet, FiWind } from 'react-icons/fi';
import { getWeatherInfo } from '../utils/weatherCodes';

export default function CityCard({ city, state, isActive, onSelect, onRefresh, onRemove }) {
  const { data, loading, error } = state || {};
  const info = data ? getWeatherInfo(data.code) : null;

  // Кнопки внутри карточки не должны открывать детали
  const stop = handler => e => {
    e.stopPropagation();
    handler(city.id);
  };

  const handleKeyDown = e => {
    if (e.code === 'Enter' || e.code === 'Space') {
      e.preventDefault();
      onSelect(city.id);
    }
  };

  return (
    <Card
      role="button"
      tabIndex={0}
      $active={isActive}
      onClick={() => onSelect(city.id)}
      onKeyDown={handleKeyDown}
    >
      <Top>
        <div>
          <CityName>{city.name}</CityName>
          <Country>{city.country}</Country>
        </div>
        <Actions>
          <IconBtn type="button" onClick={stop(onRefresh)} aria-label="Оновити погоду" disabled={loading}>
            <Spin $spinning={loading}>
              <FiRefreshCw size={18} />
            </Spin>
          </IconBtn>
          <IconBtn type="button" onClick={stop(onRemove)} aria-label="Видалити місто" $danger>
            <FiX size={20} />
          </IconBtn>
        </Actions>
      </Top>

      {data && info && (
        <>
          <Main>
            <info.Icon size={64} color="#2f80ed" />
            <Temp>{data.temp}°</Temp>
          </Main>
          <Label>{info.label}</Label>
          <Extra>
            <span>
              <FiDroplet /> {data.humidity}%
            </span>
            <span>
              <FiWind /> {data.wind} м/с
            </span>
          </Extra>
        </>
      )}

      {!data && loading && <Hint>Завантаження...</Hint>}
      {!data && !loading && error && <Hint>{error}</Hint>}
    </Card>
  );
}

const rotate = keyframes`
  to { transform: rotate(360deg); }
`;

const Card = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px;
  border: 2px solid ${p => (p.$active ? p.theme.colors.primary : 'transparent')};
  border-radius: 16px;
  background: ${p => p.theme.colors.card};
  box-shadow: 0 4px 16px rgba(30, 60, 100, 0.08);
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 22px rgba(30, 60, 100, 0.14);
  }

  &:focus-visible {
    outline: 2px solid ${p => p.theme.colors.primary};
  }
`;

const Top = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
`;

const CityName = styled.h3`
  font-size: 20px;
`;

const Country = styled.p`
  font-size: 14px;
  color: ${p => p.theme.colors.muted};
`;

const Actions = styled.div`
  display: flex;
  gap: 4px;
`;

const IconBtn = styled.button`
  display: flex;
  padding: 6px;
  border: none;
  border-radius: 8px;
  background: ${p => p.theme.colors.bg};
  color: ${p => p.theme.colors.muted};

  &:hover:not(:disabled) {
    color: ${p => (p.$danger ? p.theme.colors.danger : p.theme.colors.primary)};
  }
`;

const Spin = styled.span`
  display: flex;
  animation: ${p => (p.$spinning ? rotate : 'none')} 0.8s linear infinite;
`;

const Main = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Temp = styled.p`
  font-size: 44px;
  font-weight: 700;
  line-height: 1;
`;

const Label = styled.p`
  font-weight: 500;
`;

const Extra = styled.div`
  display: flex;
  gap: 16px;
  font-size: 14px;
  color: ${p => p.theme.colors.muted};

  span {
    display: flex;
    align-items: center;
    gap: 4px;
  }
`;

const Hint = styled.p`
  font-size: 14px;
  color: ${p => p.theme.colors.muted};
`;
