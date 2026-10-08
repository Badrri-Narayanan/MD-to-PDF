const DARK_QUERY = '(prefers-color-scheme: dark)';

/** Light/dark toggle. Follows the system theme until the user picks one. */
export function initTheme({ button, store, root = document.documentElement }) {
  const media = matchMedia(DARK_QUERY);
  const current = () => root.dataset.theme || (media.matches ? 'dark' : 'light');
  const syncIcon = () => {
    button.querySelector('use').setAttribute('href', current() === 'dark' ? '#i-sun' : '#i-moon');
  };

  const saved = store.get('theme');
  if (saved) root.dataset.theme = saved;

  button.addEventListener('click', () => {
    const next = current() === 'dark' ? 'light' : 'dark';
    root.dataset.theme = next;
    store.set('theme', next);
    syncIcon();
  });
  media.addEventListener('change', syncIcon);
  syncIcon();
}
