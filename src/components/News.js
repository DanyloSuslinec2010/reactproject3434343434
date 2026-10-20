import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { TailSpin } from 'react-loader-spinner';
import Container from './Container';
import { Section, SectionTitle } from './Section';
import { getNews } from '../services/newsApi';
import { fallbackNews } from '../data/fallbackNews';
import { formatNewsDate } from '../utils/date';

export default function News() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;

    getNews()
      .then(data => {
        if (!ignore) setNews(data.length > 0 ? data : fallbackNews);
      })
      .catch(() => {
        if (!ignore) setNews(fallbackNews);
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, []);

  return (
    <Section id="news">
      <Container>
        <SectionTitle>Новини</SectionTitle>

        {loading ? (
          <Loader>
            <TailSpin height={48} width={48} color="#2f80ed" ariaLabel="Завантаження" />
          </Loader>
        ) : (
          <List>
            {news.map(item => (
              <li key={item.id}>
                <Card href={item.url} target="_blank" rel="noreferrer noopener">
                  <Date>{formatNewsDate(item.date)}</Date>
                  <Title>{item.title}</Title>
                  <Author>
                    {item.author}
                    {item.points !== null && ` · ${item.points} балів`}
                  </Author>
                </Card>
              </li>
            ))}
          </List>
        )}
      </Container>
    </Section>
  );
}

const Loader = styled.div`
  display: flex;
  justify-content: center;
  padding: 32px 0;
`;

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

const Card = styled.a`
  display: flex;
  flex-direction: column;
  gap: 10px;
  height: 100%;
  padding: 20px;
  border-radius: 16px;
  background: ${p => p.theme.colors.card};
  box-shadow: 0 4px 16px rgba(30, 60, 100, 0.08);
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-3px);
  }
`;

const Date = styled.p`
  font-size: 13px;
  color: ${p => p.theme.colors.muted};
`;

const Title = styled.h3`
  font-size: 18px;
  line-height: 1.3;
`;

const Author = styled.p`
  margin-top: auto;
  font-size: 14px;
  color: ${p => p.theme.colors.primary};
`;
