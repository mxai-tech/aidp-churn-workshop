(() => {
  const article = document.querySelector('.content');
  const toc = document.querySelector('#page-toc');
  if (!article || !toc) return;

  const slugify = (text) => text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  const headings = [...article.querySelectorAll('h2, h3')];
  if (!headings.length) return;

  const ids = new Set();
  toc.replaceChildren();

  headings.forEach((heading) => {
    let id = heading.id || slugify(heading.textContent);
    const baseId = id;
    let sequence = 2;
    while (ids.has(id) || document.getElementById(id) !== heading) {
      id = `${baseId}-${sequence++}`;
    }
    ids.add(id);
    heading.id = id;

    const link = document.createElement('a');
    link.href = `#${id}`;
    link.textContent = heading.textContent;
    link.className = `toc-level-${heading.tagName.slice(1)}`;
    toc.append(link);
  });
})();
