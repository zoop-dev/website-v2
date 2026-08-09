const CONFIG_URL = '/api/config';

const ICONS = {
  email:  '<path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z"/>',
  github: '<path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>',
  signal: '<path d="M12 0q-.934 0-1.83.139l.17 1.111a11 11 0 0 1 3.32 0l.172-1.111A12 12 0 0 0 12 0M9.152.34A12 12 0 0 0 5.77 1.742l.584.961a10.8 10.8 0 0 1 3.066-1.27zm5.696 0-.268 1.094a10.8 10.8 0 0 1 3.066 1.27l.584-.962A12 12 0 0 0 14.848.34M12 2.25a9.75 9.75 0 0 0-8.539 14.459c.074.134.1.292.064.441l-1.013 4.338 4.338-1.013a.62.62 0 0 1 .441.064A9.7 9.7 0 0 0 12 21.75c5.385 0 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25m-7.092.068a12 12 0 0 0-2.59 2.59l.909.664a11 11 0 0 1 2.345-2.345zm14.184 0-.664.909a11 11 0 0 1 2.345 2.345l.909-.664a12 12 0 0 0-2.59-2.59M1.742 5.77A12 12 0 0 0 .34 9.152l1.094.268a10.8 10.8 0 0 1 1.269-3.066zm20.516 0-.961.584a10.8 10.8 0 0 1 1.27 3.066l1.093-.268a12 12 0 0 0-1.402-3.383M.138 10.168A12 12 0 0 0 0 12q0 .934.139 1.83l1.111-.17A11 11 0 0 1 1.125 12q0-.848.125-1.66zm23.723.002-1.111.17q.125.812.125 1.66c0 .848-.042 1.12-.125 1.66l1.111.172a12.1 12.1 0 0 0 0-3.662M1.434 14.58l-1.094.268a12 12 0 0 0 .96 2.591l-.265 1.14 1.096.255.36-1.539-.188-.365a10.8 10.8 0 0 1-.87-2.35m21.133 0a10.8 10.8 0 0 1-1.27 3.067l.962.584a12 12 0 0 0 1.402-3.383zm-1.793 3.848a11 11 0 0 1-2.345 2.345l.664.909a12 12 0 0 0 2.59-2.59zm-19.959 1.1L.357 21.48a1.8 1.8 0 0 0 2.162 2.161l1.954-.455-.256-1.095-1.953.455a.675.675 0 0 1-.81-.81l.454-1.954zm16.832 1.769a10.8 10.8 0 0 1-3.066 1.27l.268 1.093a12 12 0 0 0 3.382-1.402zm-10.94.213-1.54.36.256 1.095 1.139-.266c.814.415 1.683.74 2.591.961l.268-1.094a10.8 10.8 0 0 1-2.35-.869zm3.634 1.24-.172 1.111a12.1 12.1 0 0 0 3.662 0l-.17-1.111q-.812.125-1.66.125a11 11 0 0 1-1.66-.125"/>',
};

const DEFAULT = {
  bio: '',
  projects: [],
  socials: [],
};

function esc(s) {
  return String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function linkDisplay(href) {
  try { return new URL(href).host; } catch { return href; }
}

function renderBio(bio) {
  document.getElementById('bio').textContent = bio ?? '';
}

function renderProjects(projects) {
  const el = document.getElementById('projects');
  el.innerHTML = (projects ?? []).map(p => {
    const [a, b] = p.colors ?? ['#fff','#fff'];
    const link = p.link ? `<a class="project__link" href="${esc(p.link)}" target="_blank" rel="noopener">${esc(linkDisplay(p.link))} →</a>` : '';
    return `<details class="project" style="--ca:${esc(a)};--cb:${esc(b)}">
  <summary>
    <span class="project__name">${esc(p.name)}</span>
    <span class="project__tag">${esc(p.tag)}</span>
    <span class="project__toggle">+</span>
  </summary>
  <div class="project__body">
    <p>${esc(p.body)}</p>
    ${p.meta ? `<p class="project__meta">${esc(p.meta)}</p>` : ''}
    ${link}
  </div>
</details>`;
  }).join('');
}

function renderSocials(socials) {
  const el = document.getElementById('contact');
  el.innerHTML = (socials ?? []).map(s => {
    const icon = ICONS[s.type];
    if (!icon) return '';
    const ext = !s.href.startsWith('mailto:');
    return `<a href="${esc(s.href)}"${ext ? ' target="_blank" rel="noopener"' : ''} aria-label="${esc(s.type)}"><svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">${icon}</svg></a>`;
  }).join('');
}

function setupAccordion() {
  const all = Array.from(document.querySelectorAll('.project'));

  function closeProject(el) {
    const body = el.querySelector('.project__body');
    const toggle = el.querySelector('.project__toggle');
    body.style.maxHeight = body.scrollHeight + 'px';
    requestAnimationFrame(() => requestAnimationFrame(() => {
      body.style.maxHeight = '0';
      body.style.paddingBottom = '0';
    }));
    body.addEventListener('transitionend', () => {
      el.removeAttribute('open');
      toggle.textContent = '+';
    }, { once: true });
  }

  all.forEach(details => {
    details.querySelector('summary').addEventListener('click', e => {
      if (e.target.closest('a')) return;
      e.preventDefault();
      if (details.open) {
        closeProject(details);
      } else {
        all.forEach(o => { if (o !== details && o.open) closeProject(o); });
        details.setAttribute('open', '');
        details.querySelector('.project__toggle').textContent = '−';
        const body = details.querySelector('.project__body');
        body.style.maxHeight = body.scrollHeight + 'px';
        body.style.paddingBottom = '1rem';
        body.addEventListener('transitionend', () => { body.style.maxHeight = 'none'; }, { once: true });
      }
    });
  });
}

function renderAll(cfg) {
  renderBio(cfg.bio ?? DEFAULT.bio);
  renderProjects(cfg.projects ?? DEFAULT.projects);
  renderSocials(cfg.socials ?? DEFAULT.socials);
  setupAccordion();
}

function showError(msg) {
  document.getElementById('error-screen').style.display = 'block';
  document.getElementById('error-screen').textContent = msg || 'failed to load config.';
}

fetch(CONFIG_URL)
  .then(r => r.ok ? r.json() : Promise.reject(r.status))
  .then(cfg => { if (cfg) renderAll(cfg); else showError('no config found.'); })
  .catch(status => showError(typeof status === 'number' ? `config error (${status}).` : 'failed to load config.'));
