(() => {
  // index.html carries the home page's prerendered hero for fast first paint.
  // On any other route served from the SPA fallback it would be wrong, so drop it.
  const homeStatic = document.querySelector('#seo-static[data-home]');
  if (homeStatic && window.location.pathname !== '/') homeStatic.remove();

  const recoveryKey = 'fullbalance_boot_recovery';
  const removeBootGuard = () => document.getElementById('boot-guard')?.remove();
  const hasAppStyles = () => {
    const probe = document.createElement('div');
    probe.className = 'hidden';
    document.body.appendChild(probe);
    const loaded = getComputedStyle(probe).display === 'none';
    probe.remove();
    return loaded;
  };

  const recover = async () => {
    let lastAttempt = 0;
    try { lastAttempt = Number(sessionStorage.getItem(recoveryKey) || 0); } catch { /* Continue without session storage. */ }
    if (Date.now() - lastAttempt < 20000) return false;
    try { sessionStorage.setItem(recoveryKey, String(Date.now())); } catch { /* Continue recovery. */ }
    try {
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map((registration) => registration.unregister()));
      }
      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.filter((key) => key.startsWith('fb-')).map((key) => caches.delete(key)));
      }
    } catch (error) {
      console.warn('[Boot recovery]', error);
    }
    const url = new URL(window.location.href);
    url.searchParams.set('refresh', Date.now());
    window.location.replace(url.toString());
    return true;
  };

  const ensureAppStyles = async () => {
    if (hasAppStyles()) {
      removeBootGuard();
      return true;
    }

    const stylesheet = document.querySelector('link[rel="stylesheet"][href*="/assets/"]');
    // Vite injects CSS through JavaScript in development, so the absence of a
    // production stylesheet link is not by itself a broken-page signal.
    if (!stylesheet) return null;
    try {
      const url = new URL(stylesheet.href, location.href);
      url.searchParams.set('repair', String(Date.now()));
      const response = await fetch(url, { cache: 'no-store', credentials: 'same-origin' });
      if (!response.ok) throw new Error(`Stylesheet request failed: ${response.status}`);
      const css = await response.text();
      if (css.length < 1000) throw new Error('Stylesheet response is incomplete');
      const repairedStyle = document.createElement('style');
      repairedStyle.id = 'fullbalance-repaired-styles';
      repairedStyle.textContent = css;
      document.head.appendChild(repairedStyle);
      await new Promise((resolve) => requestAnimationFrame(resolve));
      if (!hasAppStyles()) throw new Error('Stylesheet could not be applied');
      removeBootGuard();
      return true;
    } catch (error) {
      console.warn('[Style recovery]', error);
      return false;
    }
  };

  const isAssetLoadError = (value) => /dynamic import|module script|failed to fetch|load failed|chunkloaderror/i.test(String(value || ''));
  window.addEventListener('vite:preloadError', (event) => {
    event.preventDefault();
    recover();
  });
  window.addEventListener('unhandledrejection', (event) => {
    if (isAssetLoadError(event.reason?.message || event.reason)) recover();
  });
  window.addEventListener('error', (event) => {
    const scriptSource = event.target?.tagName === 'SCRIPT' ? event.target.src : '';
    const ownScriptFailed = scriptSource && new URL(scriptSource, location.href).origin === location.origin;
    if (event.target?.tagName === 'LINK' && event.target.rel === 'stylesheet') {
      ensureAppStyles().then((ready) => { if (!ready) recover(); });
    } else if (ownScriptFailed || isAssetLoadError(event.message)) recover();
  }, true);

  window.setTimeout(() => {
    ensureAppStyles().then((ready) => { if (ready === false) recover(); });
  }, 250);

  window.setTimeout(async () => {
    const root = document.getElementById('root');
    if (!root || root.childElementCount > 0) {
      if (hasAppStyles()) removeBootGuard();
      return;
    }
    const recovering = await recover();
    if (!recovering) {
      root.innerHTML = '<main style="min-height:100vh;display:grid;place-items:center;padding:24px;background:#020617;color:#fff;font:600 16px system-ui;text-align:center"><div><strong>Full Balance</strong><p style="color:#94a3b8;font-weight:400">Uygulama güncelleniyor. Lütfen sayfayı yeniden açın.</p></div></main>';
    }
  }, 10000);
})();
