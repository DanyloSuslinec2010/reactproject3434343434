import styled from 'styled-components';

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
