import { useState } from 'react';
import PropTypes from 'prop-types';
import { FiSearch } from 'react-icons/fi';
import styles from './Hero.module.css';

export default function Hero({ onSearch }) {
  // Дата береться під час завантаження сторінки, тому завжди актуальна
  const [today] = useState(() => new Date());
  const [query, setQuery] = useState('');

  const dateText = today.toLocaleDateString('uk-UA', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const handleSubmit = e => {
    e.preventDefault();
    const name = query.trim();
    if (!name) return;

    onSearch(name);
    setQuery('');
  };

  return (
    <section className={styles.hero} id="top">
      <div className="container">
        <p className={styles.date}>{dateText}</p>
        <h1 className={styles.title}>Дізнайтесь погоду в будь-якому місті</h1>

        <form className={styles.form} onSubmit={handleSubmit}>
          <input
            className={styles.input}
            type="text"
            placeholder="Введіть місто"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <button className={styles.btn} type="submit" aria-label="Знайти">
            <FiSearch size={20} />
          </button>
        </form>
      </div>
    </section>
  );
}

Hero.propTypes = {
  onSearch: PropTypes.func.isRequired,
};
