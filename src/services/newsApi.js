// Новости берем с Hacker News (Algolia), как в примере с axios.
// Если запрос упал, показываем запасной список.
const URL = 'https://hn.algolia.com/api/v1/search';

export async function getNews() {
  const params = new URLSearchParams({
    query: 'weather',
    tags: 'story',
    hitsPerPage: '6',
  });
  const response = await fetch(`${URL}?${params}`);
  if (!response.ok) {
    throw new Error('Не вдалося завантажити новини');
  }
  const data = await response.json();

  return data.hits
    .filter(hit => hit.title)
    .map(hit => ({
      id: hit.objectID,
      title: hit.title,
      author: hit.author,
      points: hit.points,
      date: hit.created_at,
      url: hit.url || `https://news.ycombinator.com/item?id=${hit.objectID}`,
    }));
}
