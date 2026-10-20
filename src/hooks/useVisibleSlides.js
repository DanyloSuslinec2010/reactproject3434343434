import { useEffect, useState } from 'react';

// Сколько слайдов показывать: mobile 1, tablet 2, desktop 3
function getCount() {
  if (window.matchMedia?.('(min-width: 1200px)').matches) return 3;
  if (window.matchMedia?.('(min-width: 768px)').matches) return 2;
  return 1;
}

export function useVisibleSlides() {
  const [count, setCount] = useState(getCount);

  useEffect(() => {
    const onResize = () => setCount(getCount());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return count;
}
