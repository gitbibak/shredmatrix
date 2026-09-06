(() => {
  // Runs in the head, before the fallback homepage can be painted. This hint
  // only controls presentation; authentication still comes from the session.
  let member = false;
  try {
    member = Boolean(localStorage.getItem('shredmatrix_user'))
      || Object.keys(localStorage).some((key) => /^sb-.*-auth-token$/.test(key));
  } catch { /* Public pages still work with storage disabled. */ }
  if (location.pathname !== '/' || member
    || window.matchMedia?.('(display-mode: standalone)').matches
    || navigator.standalone === true) {
    document.documentElement.setAttribute('data-member-boot', '');
  }
})();
