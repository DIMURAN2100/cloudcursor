// Timeline IntersectionObserver — 仅在出现 .timeline__item 的页面生效。
const items = document.querySelectorAll('.timeline__item');
if (items.length && 'IntersectionObserver' in window) {
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) entry.target.classList.add('is-in');
      }
    },
    { threshold: 0.2 },
  );
  items.forEach((el) => io.observe(el));
}
