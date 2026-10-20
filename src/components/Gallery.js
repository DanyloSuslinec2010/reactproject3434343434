import { useState } from 'react';
import styled from 'styled-components';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import Container from './Container';
import { Section, SectionTitle } from './Section';
import { useVisibleSlides } from '../hooks/useVisibleSlides';
import { galleryImages } from '../data/gallery';

const GAP = 16;

export default function Gallery() {
  const visible = useVisibleSlides();
  const [index, setIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(null);

  // Сколько "шагов" у слайдера. Если экран стал шире, индекс не должен выйти за край.
  const lastIndex = galleryImages.length - visible;
  const current = Math.min(index, lastIndex);

  const next = () => setIndex(current >= lastIndex ? 0 : current + 1);
  const prev = () => setIndex(current <= 0 ? lastIndex : current - 1);

  const handleTouchEnd = e => {
    if (touchStart === null) return;
    const diff = touchStart - e.changedTouches[0].clientX;
    if (diff > 50) next();
    if (diff < -50) prev();
    setTouchStart(null);
  };

  // Ширина одного слайда и сдвиг ленты считаем через calc
  const slideWidth = `calc((100% - ${GAP * (visible - 1)}px) / ${visible})`;
  const shift = `calc(${current} * (${slideWidth} + ${GAP}px) * -1)`;

  return (
    <Section id="gallery">
      <Container>
        <SectionTitle>Галерея</SectionTitle>

        <SliderBox>
          <ArrowBtn type="button" $side="left" onClick={prev} aria-label="Назад">
            <FiChevronLeft size={24} />
          </ArrowBtn>

          <Viewport
            onTouchStart={e => setTouchStart(e.touches[0].clientX)}
            onTouchEnd={handleTouchEnd}
          >
            <Track style={{ transform: `translateX(${shift})`, gap: `${GAP}px` }}>
              {galleryImages.map(image => (
                <Slide key={image.id} style={{ flex: `0 0 ${slideWidth}` }}>
                  <Img src={image.src} alt={image.alt} loading="lazy" />
                </Slide>
              ))}
            </Track>
          </Viewport>

          <ArrowBtn type="button" $side="right" onClick={next} aria-label="Вперед">
            <FiChevronRight size={24} />
          </ArrowBtn>
        </SliderBox>

        <Dots>
          {Array.from({ length: lastIndex + 1 }, (_, i) => (
            <Dot
              key={i}
              type="button"
              $active={i === current}
              onClick={() => setIndex(i)}
              aria-label={`Слайд ${i + 1}`}
            />
          ))}
        </Dots>
      </Container>
    </Section>
  );
}

const SliderBox = styled.div`
  position: relative;
`;

const Viewport = styled.div`
  overflow: hidden;
  border-radius: 16px;
`;

const Track = styled.div`
  display: flex;
  transition: transform 0.4s ease;
`;

const Slide = styled.div`
  min-width: 0;
  overflow: hidden;
  border-radius: 16px;
  background: ${p => p.theme.colors.border};
`;

const Img = styled.img`
  width: 100%;
  height: 220px;
  object-fit: cover;

  ${p => p.theme.media.tablet} {
    height: 260px;
  }

  ${p => p.theme.media.desktop} {
    height: 300px;
  }
`;

const ArrowBtn = styled.button`
  position: absolute;
  top: 50%;
  ${p => p.$side}: 8px;
  z-index: 2;
  display: flex;
  padding: 8px;
  border: none;
  border-radius: 50%;
  color: ${p => p.theme.colors.text};
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  transform: translateY(-50%);

  &:hover {
    background: #fff;
  }
`;

const Dots = styled.div`
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 16px;
`;

const Dot = styled.button`
  width: 10px;
  height: 10px;
  padding: 0;
  border: none;
  border-radius: 50%;
  background: ${p => (p.$active ? p.theme.colors.primary : p.theme.colors.border)};
`;
