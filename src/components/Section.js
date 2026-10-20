import styled from 'styled-components';

export const Section = styled.section`
  padding: 32px 0;

  ${p => p.theme.media.tablet} {
    padding: 48px 0;
  }

  ${p => p.theme.media.desktop} {
    padding: 64px 0;
  }
`;

export const SectionTitle = styled.h2`
  margin-bottom: 20px;
  font-size: 24px;
  font-weight: 700;

  ${p => p.theme.media.tablet} {
    margin-bottom: 28px;
    font-size: 30px;
  }
`;

export const MainButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 20px;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  color: #fff;
  background: ${p => p.theme.colors.primary};
  transition: background 0.2s;

  &:hover:not(:disabled) {
    background: ${p => p.theme.colors.primaryDark};
  }

  &:disabled {
    opacity: 0.6;
    cursor: default;
  }
`;
