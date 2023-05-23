export const domLoaded = new Promise<void>((resolve) => {
  if (document.body) resolve();
  else window.addEventListener("DOMContentLoaded", () => resolve());
});
