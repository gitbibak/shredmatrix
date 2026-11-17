// Standalone static pages (free-alternative comparisons) load no app bundle.
// Keep the first visit's source so a signup that starts here is attributed.
(function () {
  try {
    if (localStorage.getItem('fb_acquisition')) return;
    var q = new URLSearchParams(location.search);
    var s = q.get('utm_source');
    var m = q.get('utm_medium');
    if (!s && document.referrer) {
      var h = new URL(document.referrer).hostname.replace(/^www\./, '');
      if (h !== location.hostname) {
        s = /(^|\.)(chatgpt\.com|chat\.openai\.com)$/.test(h) ? 'chatgpt.com'
          : /^google\.|\.google\./.test(h) ? 'google'
          : /^bing\.|\.bing\./.test(h) ? 'bing'
          : /(^|\.)perplexity\.ai$/.test(h) ? 'perplexity.ai'
          : h;
        m = m || 'referral';
      }
    }
    s = s || 'direct';
    m = m || (s === 'direct' ? 'none' : null);
    localStorage.setItem('fb_acquisition', JSON.stringify({
      acquisition_source: s,
      acquisition_medium: m,
      acquisition_campaign: q.get('utm_campaign'),
      landing_path: location.pathname,
      first_source: s,
      first_medium: m,
      first_campaign: q.get('utm_campaign'),
      first_landing_page: location.pathname,
    }));
  } catch (e) { /* Storage may be blocked. */ }
})();
