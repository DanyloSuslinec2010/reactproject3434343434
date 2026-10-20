import styled from 'styled-components';
import { getWeatherInfo } from '../utils/weatherCodes';
import { formatDayShort } from '../utils/date';

export default function WeekList({ days }) {
  return (
    <List>
      {days.map(day => {
        const info = getWeatherInfo(day.code);
        return (
          <Item key={day.date}>
            <Day>{formatDayShort(day.date)}</Day>
            <info.Icon size={40} color="#2f80ed" />
            <Label>{info.label}</Label>
            <Temps>
              <b>{day.max}°</b> <span>{day.min}°</span>
            </Temps>
          </Item>
        );
      })}
    </List>
  );
}

const List = styled.ul`
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;

  ${p => p.theme.media.desktop} {
    grid-template-columns: repeat(7, 1fr);
    gap: 12px;
  }
`;

// Мобилка и планшет: строка. Десктоп: колонка.
const Item = styled.li`
  display: grid;
  grid-template-columns: 90px 40px 1fr auto;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border-radius: 12px;
  background: ${p => p.theme.colors.bg};

  ${p => p.theme.media.tablet} {
    grid-template-columns: 140px 48px 1fr auto;
    gap: 16px;
  }

  ${p => p.theme.media.desktop} {
    grid-template-columns: 1fr;
    justify-items: center;
    padding: 16px 8px;
    text-align: center;
  }
`;

const Day = styled.p`
  font-weight: 600;
  font-size: 14px;
`;

const Label = styled.p`
  font-size: 14px;
  color: ${p => p.theme.colors.muted};
`;

const Temps = styled.p`
  span {
    color: ${p => p.theme.colors.muted};
  }
`;
