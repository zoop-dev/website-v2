const SITE_VERSION = 'v3.4.0';

window.SITE_VERSION = SITE_VERSION;

function stampVersion() {
  document.querySelectorAll('[data-version]').forEach(el => {
    el.textContent = SITE_VERSION;
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', stampVersion);
} else {
  stampVersion();
}
