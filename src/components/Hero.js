import { useEffect, useState } from 'react';
import { Formik, Form, Field } from 'formik';
import styled from 'styled-components';
import { FiSearch } from 'react-icons/fi';
import { TailSpin } from 'react-loader-spinner';
import Container from './Container';
import { formatFullDate, formatTime } from '../utils/date';

export default function Hero({ onSearch }) {
  // Дата берется при загрузке и дальше обновляется раз в минуту
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(id);
  }, []);

  const handleSubmit = async (values, { resetForm, setSubmitting }) => {
    const ok = await onSearch(values.city);
    if (ok) resetForm();
    setSubmitting(false);
  };

  return (
    <Banner id="top">
      <Container>
        <Content>
          <Title>Прогноз погоди у вашому місті</Title>
          <DateText>
            {formatFullDate(now)} · {formatTime(now)}
          </DateText>

          <Formik initialValues={{ city: '' }} onSubmit={handleSubmit}>
            {({ values, isSubmitting }) => (
              <SearchForm>
                <SearchInput
                  name="city"
                  type="text"
                  placeholder="Введіть назву міста"
                  autoComplete="off"
                />
                <SearchBtn type="submit" disabled={isSubmitting || !values.city.trim()}>
                  {isSubmitting ? (
                    <TailSpin height={20} width={20} color="#1b5fc4" ariaLabel="Пошук" />
                  ) : (
                    <FiSearch size={20} />
                  )}
                  <span>Знайти</span>
                </SearchBtn>
              </SearchForm>
            )}
          </Formik>
        </Content>
      </Container>
    </Banner>
  );
}

const Banner = styled.section`
  padding: 40px 0 48px;
  color: #fff;
  background: linear-gradient(135deg, ${p => p.theme.colors.heroFrom}, ${p => p.theme.colors.heroTo});

  ${p => p.theme.media.tablet} {
    padding: 64px 0 72px;
  }

  ${p => p.theme.media.desktop} {
    padding: 96px 0 104px;
  }
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;

  ${p => p.theme.media.desktop} {
    max-width: 640px;
    gap: 16px;
  }
`;

const Title = styled.h1`
  font-size: 28px;
  line-height: 1.2;

  ${p => p.theme.media.tablet} {
    font-size: 40px;
  }

  ${p => p.theme.media.desktop} {
    font-size: 52px;
  }
`;

const DateText = styled.p`
  font-size: 16px;
  opacity: 0.9;

  ${p => p.theme.media.tablet} {
    font-size: 18px;
  }
`;

const SearchForm = styled(Form)`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 12px;

  ${p => p.theme.media.tablet} {
    flex-direction: row;
  }
`;

const SearchInput = styled(Field)`
  flex: 1;
  min-width: 0;
  padding: 14px 16px;
  border: none;
  border-radius: 12px;
  outline: none;
  color: ${p => p.theme.colors.text};
`;

const SearchBtn = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-width: 130px;
  padding: 14px 20px;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  color: ${p => p.theme.colors.primaryDark};
  background: #fff;

  &:disabled {
    opacity: 0.7;
    cursor: default;
  }
`;
