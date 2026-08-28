const query = new URLSearchParams(window.location.search);
const pageName = query.get('name');

if (pageName) {
  document.querySelectorAll('[data-query-title]').forEach((node) => { node.textContent = pageName; });
  document.title = `${pageName} — Мед-ЭКСПРЕСС`;
}
