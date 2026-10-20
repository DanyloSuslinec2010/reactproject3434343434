import { news } from '../../data/news';
import styles from './News.module.css';

export default function News() {
  return (
    <section className={styles.section} id="news">
      <div className="container">
        <h2 className="section-title">Новини</h2>
        <ul className={styles.list}>
          {news.map(item => (
            <li key={item.id} className={styles.item}>
              <img className={styles.image} src={item.image} alt={item.title} loading="lazy" />
              <div className={styles.body}>
                <time className={styles.date} dateTime={item.date}>
                  {new Date(item.date).toLocaleDateString('uk-UA')}
                </time>
                <h3 className={styles.title}>{item.title}</h3>
                <p className={styles.text}>{item.text}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
