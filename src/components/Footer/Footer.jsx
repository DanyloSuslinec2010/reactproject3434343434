import { WiDayCloudy } from 'react-icons/wi';
import { FiInstagram, FiTwitter, FiGithub } from 'react-icons/fi';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <a href="#top" className={styles.logo}>
          <WiDayCloudy size={36} />
          <span>Weather</span>
        </a>

        <nav className={styles.nav}>
          <a href="#weather">Погода</a>
          <a href="#news">Новини</a>
          <a href="#gallery">Галерея</a>
        </nav>

        <ul className={styles.social}>
          <li>
            <a href="https://instagram.com" aria-label="Instagram"><FiInstagram size={20} /></a>
          </li>
          <li>
            <a href="https://twitter.com" aria-label="Twitter"><FiTwitter size={20} /></a>
          </li>
          <li>
            <a href="https://github.com" aria-label="GitHub"><FiGithub size={20} /></a>
          </li>
        </ul>

        <p className={styles.copy}>© {new Date().getFullYear()} Weather. Дані: Open-Meteo</p>
      </div>
    </footer>
  );
}
