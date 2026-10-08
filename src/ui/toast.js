export function createToast(el, durationMs = 2600) {
  let timer;
  return message => {
    el.textContent = message;
    el.classList.add('show');
    clearTimeout(timer);
    timer = setTimeout(() => el.classList.remove('show'), durationMs);
  };
}
