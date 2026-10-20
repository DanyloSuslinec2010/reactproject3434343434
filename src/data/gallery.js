const ids = [10, 15, 28, 29, 1015, 1018, 1036, 1039];

export const galleryImages = ids.map(id => ({
  id,
  src: `https://picsum.photos/id/${id}/800/600`,
  alt: 'Природа',
}));
