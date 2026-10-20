import styled from 'styled-components';
import { Section, SectionTitle } from './Section';
import Container from './Container';
import CityCard from './CityCard';

export default function CityList({ cities, weather, selectedId, onSelect, onRefresh, onRemove }) {
  return (
    <Section id="cities">
      <Container>
        <SectionTitle>Мої міста</SectionTitle>

        {cities.length === 0 ? (
          <Empty>Поки що немає міст. Знайдіть місто у пошуку вище, і воно з'явиться тут.</Empty>
        ) : (
          <List>
            {cities.map(city => (
              <li key={city.id}>
                <CityCard
                  city={city}
                  state={weather[city.id]}
                  isActive={city.id === selectedId}
                  onSelect={onSelect}
                  onRefresh={onRefresh}
                  onRemove={onRemove}
                />
              </li>
            ))}
          </List>
        )}
      </Container>
    </Section>
  );
}

const List = styled.ul`
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;

  ${p => p.theme.media.tablet} {
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
  }

  ${p => p.theme.media.desktop} {
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
  }
`;

const Empty = styled.p`
  padding: 24px;
  border-radius: 16px;
  text-align: center;
  color: ${p => p.theme.colors.muted};
  background: ${p => p.theme.colors.card};
`;
