// The site CSP allows no inline handlers, so printable pages wire the button here.
document.querySelectorAll('[data-print]').forEach((button) => {
  button.addEventListener('click', () => window.print());
});
