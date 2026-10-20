import styled from 'styled-components';

// Общая обертка: 320+ на мобилке, 768 на планшете, 1200 на десктопе
const Container = styled.div`
  width: 100%;
  margin: 0 auto;
  padding: 0 16px;

  ${p => p.theme.media.tablet} {
    max-width: 768px;
    padding: 0 32px;
  }

  ${p => p.theme.media.desktop} {
    max-width: 1200px;
    padding: 0 40px;
  }
`;

export default Container;
