import { useState, useEffect } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import styles from './Gallery.module.css';

// Зображення природи (заміни на свої, якщо потрібно)
const images = [
  'https://picsum.photos/seed/forest/800/600',
  'https://picsum.photos/seed/mountain/800/600',
  'https://picsum.photos/seed/lake/800/600',
  'https://picsum.photos/seed/meadow/800/600',
  'https://picsum.photos/seed/river/800/600',
  'https://picsum.photos/seed/sunset/800/600',
];

// Скільки слайдів видно: 1 / 2 / 3 залежно від ширини екрана
const getPerView = () => {
  if (window.innerWidth >= 1200) return 3;
  if (window.innerWidth >= 768) return 2;
  return 1;
};

export default function Gallery() {
  const [perView, setPerView] = useState(getPerView);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const handleResize = () => setPerView(getPerView());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const maxIndex = images.length - perView;
  const current = Math.min(index, maxIndex);

  const prev = () => setIndex(current <= 0 ? maxIndex : current - 1);
  const next = () => setIndex(current >= maxIndex ? 0 : current + 1);

  return (
    <section className={styles.section} id="gallery">
      <div className="container">
        <h2 className="section-title">Галерея</h2>

        <div className={styles.slider}>
          <div className={styles.viewport}>
            <ul
              className={styles.track}
              style={{ transform: `translateX(-${(current * 100) / perView}%)` }}
            >
              {images.map((src, i) => (
                <li key={src} className={styles.slide} style={{ flexBasis: `${100 / perView}%` }}>
                  <img className={styles.image} src={src} alt={`Природа ${i + 1}`} loading="lazy" />
                </li>
              ))}
            </ul>
          </div>

          <button type="button" className={`${styles.arrow} ${styles.left}`} onClick={prev} aria-label="Назад">
            <FiChevronLeft size={24} />
          </button>
          <button type="button" className={`${styles.arrow} ${styles.right}`} onClick={next} aria-label="Вперед">
            <FiChevronRight size={24} />
          </button>
        </div>
      </div>
    </section>
  );
}
