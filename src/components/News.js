import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { getNews } from '../services/newsApi';
import { fallbackNews } from '../data/fallbackNews';
import { formatNewsDate } from '../utils/date';

const REFRESH_INTERVAL = 15 * 60 * 1000;
const NEWS_COUNT = 4;

function NewsCard({ story }) {
  const imageUrl = `https://picsum.photos/seed/${encodeURIComponent(story.id)}/900/600`;

  return (
    <article className="news-card">
      <div
        className="news-card__image"
        style={{ backgroundImage: `url("${imageUrl}")` }}
        role="img"
        aria-label={story.title}
      />
      <div className="news-card__content">
        <time dateTime={story.date}>{formatNewsDate(story.date)}</time>
        <h3>{story.title}</h3>
        {story.source && (
          <span className="news-card__source">Source: {story.source}</span>
        )}
      </div>
    </article>
  );
}

NewsCard.propTypes = {
  story: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    source: PropTypes.string,
    date: PropTypes.string.isRequired,
  }).isRequired,
};

function NewsList({ stories }) {
  return (
    <div className="news-grid">
      {stories.slice(0, NEWS_COUNT).map((story) => (
        <NewsCard key={story.id} story={story} />
      ))}
    </div>
  );
}

NewsList.propTypes = {
  stories: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    date: PropTypes.string.isRequired,
  })).isRequired,
};

export default function News() {
  const [stories, setStories] = useState(fallbackNews);

  useEffect(() => {
    const controller = new AbortController();
    let isLoading = false;
    let isActive = true;
    let timeoutId;

    async function refreshNews() {
      if (isLoading || !isActive) {
        return;
      }

      isLoading = true;
      try {
        const news = await getNews({ signal: controller.signal });
        if (isActive) {
          setStories([...news, ...fallbackNews].slice(0, NEWS_COUNT));
        }
      } catch (error) {
        if (error.name !== 'AbortError' && isActive) {
          console.error('Could not refresh the news.', error);
        }
      } finally {
        isLoading = false;
        if (isActive) {
          timeoutId = window.setTimeout(refreshNews, REFRESH_INTERVAL);
        }
      }
    }

    function refreshWhenVisible() {
      if (document.visibilityState === 'visible') {
        refreshNews();
      }
    }

    refreshNews();
    document.addEventListener('visibilitychange', refreshWhenVisible);
    window.addEventListener('focus', refreshWhenVisible);

    return () => {
      isActive = false;
      window.clearTimeout(timeoutId);
      document.removeEventListener('visibilitychange', refreshWhenVisible);
      window.removeEventListener('focus', refreshWhenVisible);
      controller.abort();
    };
  }, []);

  return (
    <section className="news-section section-wrap" id="news">
      <div className="section-heading">
        <h2>Stories under the sky</h2>
        <p className="news-refresh-note">News refreshes automatically every 15 minutes.</p>
      </div>
      <NewsList stories={stories} />
    </section>
  );
}
