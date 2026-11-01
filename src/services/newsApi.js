const URL = 'https://hn.algolia.com/api/v1/search_by_date';

export async function getNews({ signal } = {}) {
  const params = new URLSearchParams({
    query: 'weather',
    tags: 'story',
    hitsPerPage: '20',
  });
  const response = await fetch(`${URL}?${params}`, { signal, cache: 'no-store' });
  if (!response.ok) {
    throw new Error('Не вдалося завантажити новини');
  }
  const data = await response.json();

  if (!Array.isArray(data.hits)) {
    throw new Error('The news response has an invalid format.');
  }

  return data.hits
    .filter(hit => hit.title)
    .slice(0, 4)
    .map(hit => {
      let source = '';
      if (hit.url) {
        try {
          source = new URL(hit.url).hostname.replace(/^www\./, '');
        } catch (error) {
          console.warn(`Could not determine the news source for ${hit.objectID}.`, error);
        }
      }

      return {
        id: hit.objectID,
        title: hit.title,
        source: source || null,
        date: hit.created_at,
      };
    });
}
