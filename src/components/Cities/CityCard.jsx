import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Oval } from 'react-loader-spinner';
import { FiRefreshCw, FiTrash2 } from 'react-icons/fi';
import { getWeatherInfo } from '../../utils/weatherCodes';

const Card = styled.li`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 20px;
  cursor: pointer;
  background: var(--surface);
  border: 2px solid ${props => (props.$active ? 'var(--accent)' : 'transparent')};
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-3px);
  }
`;

const Top = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
`;

const Name = styled.h3`
  font-size: 20px;
`;

const Country = styled.p`
  font-size: 14px;
  color: var(--muted);
`;

const Temp = styled.p`
  font-size: 40px;
  font-weight: 700;
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`;

const IconButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  color: ${props => (props.$danger ? 'var(--danger)' : 'var(--accent)')};
  background: none;
  border: 1px solid currentColor;
  border-radius: 8px;
  font-size: 14px;
`;

export default function CityCard({ city, state = {}, active, onOpen, onRefresh, onRemove }) {
  const { data, loading, error } = state;
  const info = data ? getWeatherInfo(data.code) : null;

  const stop = handler => e => {
    e.stopPropagation();
    handler();
  };

  return (
    <Card $active={active} onClick={onOpen}>
      <Top>
        <div>
          <Name>{city.name}</Name>
          <Country>{city.country}</Country>
        </div>
        {info && <info.Icon size={56} color="#f59e0b" />}
      </Top>

      {loading && !data && <Oval height={32} width={32} color="#3b82f6" secondaryColor="#bfdbfe" />}
      {error && !data && <Country>{error}</Country>}

      {data && (
        <>
          <Temp>{data.temp}°C</Temp>
          <Country>
            {info.label} · {data.min}° / {data.max}°
          </Country>
        </>
      )}

      <Row>
        <IconButton type="button" onClick={stop(onRefresh)} disabled={loading}>
          <FiRefreshCw /> {loading ? 'Оновлення...' : 'Оновити'}
        </IconButton>
        <IconButton type="button" $danger onClick={stop(onRemove)} aria-label="Видалити місто">
          <FiTrash2 />
        </IconButton>
      </Row>
    </Card>
  );
}

CityCard.propTypes = {
  city: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    country: PropTypes.string,
  }).isRequired,
  state: PropTypes.shape({
    data: PropTypes.object,
    loading: PropTypes.bool,
    error: PropTypes.string,
  }),
  active: PropTypes.bool,
  onOpen: PropTypes.func.isRequired,
  onRefresh: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
};
