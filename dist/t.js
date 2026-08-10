(function () {
  var s = document.currentScript;
  if (!s) return;
  var site = s.dataset.site;
  if (!site) return;
  var endpoint = new URL('/api/analytics/collect', s.src).href;
  var sp = new URLSearchParams(location.search);
  var payload = JSON.stringify({
    s: site,
    p: location.pathname,
    r: document.referrer,
    t: document.title,
    sc: screen.width + 'x' + screen.height,
    l: navigator.language,
    us: sp.get('utm_source') || undefined,
    um: sp.get('utm_medium') || undefined,
    uc: sp.get('utm_campaign') || undefined,
  });
  if (navigator.sendBeacon) {
    navigator.sendBeacon(endpoint, new Blob([payload], { type: 'application/json' }));
  } else {
    fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: payload, keepalive: true });
  }
})();
