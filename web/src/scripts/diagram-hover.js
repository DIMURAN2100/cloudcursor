// Diagram hover 联动：仅在页面存在 [data-diagram] 时生效。
document.querySelectorAll<HTMLElement>('[data-diagram]').forEach((root) => {
  const nodes = root.querySelectorAll<HTMLElement>('[data-node]');
  const edges = root.querySelectorAll<SVGElement>('[data-edge]');
  if (!nodes.length) return;

  const clear = () => {
    root.removeAttribute('data-active');
    nodes.forEach((n) => n.classList.remove('is-on'));
    edges.forEach((e) => e.classList.remove('is-on'));
  };

  nodes.forEach((node) => {
    node.addEventListener('mouseenter', () => {
      const id = node.getAttribute('data-node');
      root.setAttribute('data-active', 'true');
      node.classList.add('is-on');
      edges.forEach((edge) => {
        const connects = (edge.getAttribute('data-edge') || '').split(',');
        if (connects.includes(id || '')) {
          edge.classList.add('is-on');
          connects.forEach((cid) => {
            root
              .querySelector<HTMLElement>(`[data-node="${cid}"]`)
              ?.classList.add('is-on');
          });
        }
      });
    });
    node.addEventListener('mouseleave', clear);
  });
});
