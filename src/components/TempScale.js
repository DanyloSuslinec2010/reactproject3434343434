import styled from 'styled-components';

export default function TempScale({ min, max, value }) {
  const range = max - min;
  const percent = range === 0 ? 50 : ((value - min) / range) * 100;
  const safePercent = Math.min(100, Math.max(0, percent));

  return (
    <Wrapper>
      <Title>Температура сьогодні</Title>
      <Track>
        <Marker style={{ left: `${safePercent}%`, transform: `translateX(-${safePercent}%)` }}>
          <Bubble>{value}°</Bubble>
        </Marker>
      </Track>
      <Labels>
        <span>Мін {min}°</span>
        <span>Макс {max}°</span>
      </Labels>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Title = styled.h3`
  font-size: 18px;
`;

const Track = styled.div`
  position: relative;
  height: 56px;
  border-radius: 12px;
  background: linear-gradient(90deg, #4facfe, #7bdc9a, #ffd36b, #ff7a59);
`;

const Marker = styled.div`
  position: absolute;
  top: 8px;
  bottom: 8px;
  display: flex;
  align-items: center;
`;

const Bubble = styled.span`
  padding: 6px 12px;
  border-radius: 10px;
  font-weight: 700;
  color: ${p => p.theme.colors.text};
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
`;

const Labels = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  color: ${p => p.theme.colors.muted};
`;
