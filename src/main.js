import './style.css';
import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css';
import 'tippy.js/animations/shift-away.css';
import { version } from './config.js';
import { work, news, stack, about } from './content.js';
import { icons } from './icons.js';

{
  const zoop = 'color:#2bb8ff;font:900 46px/1 Unbounded,system-ui,sans-serif;text-shadow:0 2px 24px rgba(43,184,255,.5)';
  const dim = 'color:#6f8598;font:500 12px JetBrains Mono,ui-monospace,monospace';
  const acc = 'color:#2bb8ff;font:600 12px JetBrains Mono,ui-monospace,monospace';
  console.log('%czoop', zoop);
  console.log('%cthis is my very cool website, dont you like it?', dim);
  console.log('%c→ github.com/zoop-dev   ·   hi@zachy.cc   ·   type %chire()%c if you\'re feeling bold', acc, 'color:#fff;font:700 12px JetBrains Mono,monospace', acc);
  window.hire = () => {
    console.log('%cgood call. → hi@zachy.cc', 'color:#2bb8ff;font:700 18px JetBrains Mono,monospace');
    return '🙂';
  };
}

const projRow = (p) => {
  const link = p.href ? `href="${p.href}" target="_blank" rel="noopener"` : 'href="#"';

  const hasDetail = Array.isArray(p.desc) && p.desc.length > 0;
  const detailBadges = (p.tech || []).map(badge).join('');
  const detailLinks = (p.links || []).map((l) =>
    `<a class="proj__btn" href="${l.href}" target="_blank" rel="noopener">${l.label} →</a>`,
  ).join('');
  const detail = hasDetail ? `
    <div class="proj__detail" aria-hidden="true">
      <div class="proj__detail-inner">
        ${p.desc.map((d) => `<p class="proj__desc">${d}</p>`).join('')}
        ${detailBadges ? `<div class="proj__tech">${detailBadges}</div>` : ''}
        ${detailLinks ? `<div class="proj__links">${detailLinks}</div>` : ''}
      </div>
    </div>` : '';

  return `<li class="proj__row${hasDetail ? ' proj__row--expandable' : ''}"><a ${link} class="proj__link"><span class="proj__name">${p.name}</span><span class="proj__tag">${p.tag}</span><span class="proj__meta">${p.meta}${hasDetail ? ' <span class="proj__expand-icon">+</span>' : ''}</span></a>${detail}</li>`;
};
const newsBodyHtml = (n) => (Array.isArray(n.body) ? n.body : (n.body ? [n.body] : []))
  .map((p) => `<p>${p}</p>`).join('');
const newsLinksHtml = (n) => (n.links || []).map((l) =>
  `<a class="news__btn" href="${l.href}" target="_blank" rel="noopener">${l.label} →</a>`,
).join('');

const newsItem = (n) => {
  const hasMore = !!(newsBodyHtml(n) || newsLinksHtml(n));
  return `<li class="news__item">
    <button class="news__head" type="button"${hasMore ? '' : ' disabled'}>
      <div class="news__meta">${n.date ? `<time class="news__date">${n.date}</time>` : ''}${n.tag ? `<span class="news__tag">${n.tag}</span>` : ''}</div>
      ${n.title ? `<h3 class="news__title">${n.title}</h3>` : ''}
      ${hasMore ? '<span class="news__more">read <span aria-hidden="true">→</span></span>' : ''}
    </button>
  </li>`;
};
const badge = (it) => {
  const ic = icons[it.logo];
  const logo = ic
    ? `<svg class="badge__logo" viewBox="0 0 24 24" aria-hidden="true" style="fill:#${it.c || ic.hex}"><path d="${ic.path}"/></svg>`
    : '';
  return `<span class="badge">${logo}<span class="badge__label">${it.n}</span></span>`;
};

function render(cfg) {
  const workEl = document.querySelector('#work .proj');
  if (workEl) workEl.innerHTML = (cfg.work ?? []).map(projRow).join('');

  const newsEl = document.querySelector('#news .news');
  if (newsEl) newsEl.innerHTML = (cfg.news ?? []).map(newsItem).join('');

  const stackEl = document.querySelector('#stack .stack');
  if (stackEl) stackEl.innerHTML = (cfg.stack ?? []).map((g) =>
    `<div class="stack__group"><span class="stack__label">${g.group}</span>` +
    `<div class="stack__items">${(g.items ?? []).map(badge).join('')}</div></div>`,
  ).join('');

  const aboutEl = document.querySelector('#about .prose');
  if (aboutEl) aboutEl.innerHTML = (cfg.about ?? []).map((p) => `<p>${p}</p>`).join('');

  document.querySelectorAll('a[href="#"]').forEach((a) => {
    a.removeAttribute('href');
    a.setAttribute('role', 'link');
    a.setAttribute('tabindex', '0');
  });

  const setRow = (row, open) => {
    row.classList.toggle('is-expanded', open);
    const d = row.querySelector('.proj__detail');
    if (d) d.setAttribute('aria-hidden', open ? 'false' : 'true');
    const i = row.querySelector('.proj__expand-icon');
    if (i) i.textContent = open ? '−' : '+';
  };
  document.querySelectorAll('.proj__row--expandable .proj__link').forEach((link) => {
    link.addEventListener('click', (e) => {

      e.preventDefault();
      const row = link.closest('.proj__row');
      if (!row.querySelector('.proj__detail')) return;
      const willOpen = !row.classList.contains('is-expanded');
      if (willOpen) {
        row.closest('.proj').querySelectorAll('.proj__row.is-expanded').forEach((other) => {
          if (other !== row) setRow(other, false);
        });
      }
      setRow(row, willOpen);

      const panel = row.closest('.panel');
      updateFade(panel);
      setTimeout(() => updateFade(panel), 460);
    });
  });

  const newsData = cfg.news ?? [];
  document.querySelectorAll('#news .news__item').forEach((item, i) => {
    const head = item.querySelector('.news__head');
    if (head && !head.disabled) head.addEventListener('click', () => window.openNews(item, newsData[i]));
  });
}

render({ work, news, stack, about });

const verEl = document.getElementById('legal-ver');
if (verEl) verEl.textContent = 'v' + version;

fetch('/api/config', { cache: 'no-store' })
  .then((r) => (r.ok ? r.json() : null))
  .then((live) => {
    if (live && typeof live === 'object') {
      render({
        work: Array.isArray(live.work) ? live.work : work,
        news: Array.isArray(live.news) ? live.news : news,
        stack: Array.isArray(live.stack) ? live.stack : stack,
        about: Array.isArray(live.about) ? live.about : about,
      });
    }
  })
  .catch(() => {});

(function runLoader() {
  const loader = document.getElementById('loader');
  if (!loader) return;
  if (location.pathname !== '/') { loader.remove(); return; }
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) { loader.remove(); return; }

  const COLS = {
    hundreds: [1, 0],
    tens: [0, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0],
    ones: [0, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0],
  };
  const strips = {};
  for (const key in COLS) {
    const el = loader.querySelector(`.loader__strip[data-col="${key}"]`);
    strips[key] = el;
    if (el && !el.children.length) el.innerHTML = COLS[key].map((d) => `<span>${d}</span>`).join('');
  }
  const SNAP = 'cubic-bezier(0.7, 0, 0.2, 1)';

  const run = () => {
    loader.classList.add('is-ready');

    const DIAL_MS = 1150, t0 = performance.now();
    const smoothstep = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
    const wheelY = (pos) => { const eff = ((pos % 10) + 10) % 10; return -((10 - eff) / 11) * 100; };
    const tick = () => {
      const prog = Math.min(1, (performance.now() - t0) / DIAL_MS);
      const v = prog * 100;
      const tensPos = Math.floor(v / 10) + smoothstep(0.5, 1, (v % 10) / 10);
      const hundPos = Math.min(1, Math.floor(v / 100) + smoothstep(0.9, 1, (v % 100) / 100));
      if (strips.ones) strips.ones.style.transform = `translateY(${wheelY(v)}%)`;
      if (strips.tens) strips.tens.style.transform = `translateY(${wheelY(tensPos)}%)`;
      if (strips.hundreds) strips.hundreds.style.transform = `translateY(${-((1 - hundPos) / 2) * 100}%)`;
      if (prog < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);

    const tapesEl = loader.querySelector('.loader__tapes');
    const fieldTop = document.createElement('div'); fieldTop.className = 'loader__field loader__field--top';
    const fieldBot = document.createElement('div'); fieldBot.className = 'loader__field loader__field--bot';
    tapesEl.append(fieldTop, fieldBot);
    const zoops = '<span>zoop</span>'.repeat(44);
    const specs = [{ offX: 0, offY: 0, ang: 0, dir: -1, main: true }];
    const D = 7;

    const xThird = [-40, -8, 24];
    for (let i = 0; i < D; i++) {
      const band = -66 + ((i + Math.random()) / D) * 132;
      specs.push({
        offX: xThird[i % 3] + Math.random() * 24,
        offY: band,
        ang: (Math.random() < 0.5 ? -1 : 1) * (26 + Math.random() * 36),
        dir: Math.random() < 0.5 ? -1 : 1,
        main: false,
      });
    }
    const mkTape = (transform) => {
      const t = document.createElement('div');
      t.className = 'loader__t';
      t.style.transform = transform;
      t.innerHTML = `<span class="loader__logo">${zoops}</span>`;
      return t;
    };
    const tapes = specs.map((s) => {
      const base = `translate(-50%, -50%) translate(${s.offX.toFixed(1)}vw, ${s.offY.toFixed(1)}vh) rotate(${s.ang.toFixed(1)}deg)`;
      const rest = `${base} translateX(0%)`;
      const start = `${base} translateX(${s.dir * 130}%)`;
      const a = mkTape(start), b = mkTape(start);
      fieldTop.appendChild(a); fieldBot.appendChild(b);
      return { a, b, start, rest, main: s.main };
    });

    const IN_EASE = 'cubic-bezier(0.22, 1, 0.3, 1)';
    const SWEEP_AT = DIAL_MS + 100;
    const SWEEP = 580;

    let lastIn = SWEEP_AT + SWEEP;
    tapes.forEach((t) => {
      const delay = t.main ? SWEEP_AT : SWEEP_AT + 200 + Math.random() * 520;
      lastIn = Math.max(lastIn, delay + SWEEP);
      const kf = [{ transform: t.start }, { transform: t.rest }];
      const opt = { duration: SWEEP, delay, easing: IN_EASE, fill: 'both' };
      t.a.animate(kf, opt); t.b.animate(kf, opt);
    });

    loader.querySelector('.loader__counters')?.animate([{ opacity: 1 }, { opacity: 0 }],
      { duration: 220, delay: SWEEP_AT + 160, fill: 'forwards' });

    const SPLIT_AT = lastIn + 260;
    const SPLIT = 720;
    const OUT = 'cubic-bezier(0.5, 0, 0.15, 1)';
    loader.querySelector('.loader__backdrop')?.animate([{ opacity: 1 }, { opacity: 0 }],
      { duration: 380, delay: SPLIT_AT + 90, easing: 'ease-out', fill: 'forwards' });
    fieldTop.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(-110vh)' }],
      { duration: SPLIT, delay: SPLIT_AT, easing: OUT, fill: 'forwards' });
    fieldBot.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(110vh)' }],
      { duration: SPLIT, delay: SPLIT_AT, easing: OUT, fill: 'forwards' });

    setTimeout(() => loader.remove(), SPLIT_AT + SPLIT + 80);
  };

  Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 1200))]).then(run);
})();

tippy('.socials a[data-tippy-content]', {
  theme: 'zoop',
  placement: 'top',
  animation: 'shift-away',
  arrow: true,
  offset: [0, 8],
});

const panels = [...document.querySelectorAll('.panel')];
const byId = new Map(panels.map((p) => [p.id, p]));
const EASE = 'cubic-bezier(0.16, 1, 0.3, 1)';

function updateFade(panel) {
  const body = panel && panel.querySelector('.panel__body');
  if (!body) return;
  panel.classList.toggle('has-more', body.scrollTop + body.clientHeight < body.scrollHeight - 4);
}
panels.forEach((p) => {
  const body = p.querySelector('.panel__body');
  if (body) body.addEventListener('scroll', () => updateFade(p), { passive: true });
});

function slideTitle(panel, source) {
  const title = panel.querySelector('.panel__title');
  const body = panel.querySelector('.panel__body');
  const line = panel.querySelector('.panel__line');
  if (!title) return;
  panel.style.removeProperty('--bar-top');

  const isMobile = matchMedia('(max-width: 680px)').matches;

  title.style.fontSize = isMobile && source ? getComputedStyle(source).fontSize : '';

  const last = title.getBoundingClientRect();

  let frames, bodyTopPx;
  if (isMobile) {

    const r = document.createRange();
    r.selectNodeContents(title);
    const naturalW = r.getBoundingClientRect().width;
    const sx = naturalW > 0 ? title.clientWidth / naturalW : 1;
    title.dataset.sx = sx;
    title.style.transformOrigin = 'left center';
    const startY = source ? source.getBoundingClientRect().top - last.top : innerHeight * 0.4;
    frames = [
      { transform: `translateY(${startY}px) scaleX(${sx})`, offset: 0, easing: EASE },
      { transform: `translateY(0px) scaleX(${sx})`, offset: 1 },
    ];
    bodyTopPx = last.bottom + 10;
  } else if (source) {
    const f = source.getBoundingClientRect();
    const dx = f.left - last.left;
    const dy = f.top - last.top;
    frames = [
      { transform: `translate(${dx}px, ${dy}px)`, offset: 0, easing: EASE },
      { transform: `translate(0px, ${dy}px)`, offset: 0.35, easing: EASE },
      { transform: 'translate(0px, 0px)', offset: 1 },
    ];
    bodyTopPx = f.bottom + 24;
  } else {
    frames = [{ transform: 'translateX(-45vw)', easing: EASE }, { transform: 'none' }];
    bodyTopPx = last.bottom + 28;
  }
  panel.style.setProperty('--body-top', `${bodyTopPx}px`);
  title.animate(frames, { duration: 990, delay: 60, fill: 'both' });

  const H = body.getBoundingClientRect().height;
  const descentStart = 450;
  const descentDur = 600;

  body.animate(
    [{ clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)' }],
    { duration: descentDur, delay: descentStart, easing: EASE, fill: 'both' },
  );
  if (line) {
    if (isMobile) {

      line.animate([
        { transform: 'translateY(0) scaleX(0)', opacity: 1, offset: 0, easing: EASE },
        { transform: 'translateY(0) scaleX(1)', opacity: 1, offset: 1 },
      ], { duration: 520, delay: 340, fill: 'forwards' });
    } else {
      line.animate([
        { transform: 'translateY(0) scaleX(0)', opacity: 1, offset: 0, easing: EASE },
        { transform: 'translateY(0) scaleX(1)', opacity: 1, offset: 0.2, easing: EASE },
        { transform: `translateY(${H}px) scaleX(1)`, opacity: 1, offset: 1 },
      ], { duration: 750, delay: 300, fill: 'forwards' });
    }
  }
}

function closeAnim(panel, src) {
  const title = panel.querySelector('.panel__title');
  const body = panel.querySelector('.panel__body');
  const line = panel.querySelector('.panel__line');
  if (!title) return Promise.resolve();
  const isMobile = matchMedia('(max-width: 680px)').matches;
  const last = title.getBoundingClientRect();
  const H = body.getBoundingClientRect().height;
  const A = 380, B = 440, T = A + B;

  if (isMobile) {
    const endY = src ? src.getBoundingClientRect().top - last.top : innerHeight * 0.4;
    const sx = parseFloat(title.dataset.sx) || 1;
    title.style.transformOrigin = 'left center';
    title.animate([
      { transform: `translateY(0px) scaleX(${sx})`, offset: 0, easing: EASE },
      { transform: `translateY(${endY}px) scaleX(${sx})`, offset: 1 },
    ], { duration: T, fill: 'forwards' });
    body.animate(
      [{ clipPath: 'inset(0 0 0% 0)' }, { clipPath: 'inset(0 0 100% 0)' }],
      { duration: A, easing: 'linear', fill: 'forwards' },
    );
    if (line) {
      line.style.transformOrigin = 'right center';
      line.animate([
        { transform: 'translateY(0px) scaleX(1)', offset: 0, easing: EASE },
        { transform: `translateY(${endY}px) scaleX(0)`, offset: 1, easing: EASE },
      ], { duration: T, fill: 'forwards' });
    }
    return new Promise((res) => setTimeout(res, T));
  }

  let dx, dy;
  if (src) {
    const f = src.getBoundingClientRect();
    dx = f.left - last.left;
    dy = f.top - last.top;
  } else {
    dx = -innerWidth * 0.6;
    dy = 0;
  }

  title.animate([
    { transform: 'translate(0px, 0px)', offset: 0, easing: 'linear' },
    { transform: `translate(0px, ${dy}px)`, offset: A / T, easing: EASE },
    { transform: `translate(${dx}px, ${dy}px)`, offset: 1 },
  ], { duration: T, fill: 'forwards' });

  body.animate(
    [{ clipPath: 'inset(0 0 0% 0)' }, { clipPath: 'inset(0 0 100% 0)' }],
    { duration: A, easing: 'linear', fill: 'forwards' },
  );

  if (line) {
    line.style.transformOrigin = 'right center';
    line.animate([
      { transform: `translateY(${H}px) scaleX(1)`, offset: 0, easing: 'linear' },
      { transform: 'translateY(0px) scaleX(1)', offset: A / T, easing: EASE },
      { transform: 'translateY(0px) scaleX(0)', offset: 1 },
    ], { duration: T, fill: 'forwards' });
  }
  return new Promise((res) => setTimeout(res, T));
}

let source = null;
let openPanel = null;
let openSource = null;

function open(id) {

  document.querySelectorAll('.close-x.is-closing').forEach((el) => el.classList.remove('is-closing'));
  const panel = byId.get(id);
  panels.forEach((p) => {
    const on = p === panel;
    p.classList.toggle('is-open', on);
    p.setAttribute('aria-hidden', on ? 'false' : 'true');
  });
  document.body.classList.toggle('is-panel', !!panel);
  if (panel) {
    openPanel = panel;
    openSource = source;
    if (panel.classList.contains('panel--legal')) slideLegal(panel);
    else slideTitle(panel, source);
    requestAnimationFrame(() => updateFade(panel));
    setTimeout(() => updateFade(panel), 320);
  } else {
    openPanel = null;
    openSource = null;
  }
  source = null;
}

function slideLegal(panel) {
  const bar = panel.querySelector('.panel__bar');
  const body = panel.querySelector('.panel__body');
  const cover = panel.querySelector('.panel__cover');
  panel.style.removeProperty('--bar-top');
  panel.style.setProperty('--body-top', `${bar.getBoundingClientRect().bottom + 26}px`);
  void body.offsetHeight;
  cover?.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(-106vh)' }],
    { duration: 820, delay: 140, easing: 'cubic-bezier(0.6, 0, 0.2, 1)', fill: 'both' });
}

function closeLegal(panel) {
  const cover = panel.querySelector('.panel__cover');
  cover?.animate([{ transform: 'translateY(-106vh)' }, { transform: 'translateY(0)' }],
    { duration: 620, easing: 'cubic-bezier(0.6, 0, 0.2, 1)', fill: 'forwards' });
  return new Promise((res) => setTimeout(res, 640));
}

function cleanup(panel) {
  ['.panel__title', '.panel__body', '.panel__line', '.panel__bar', '.panel__cover'].forEach((sel) => {
    const el = panel.querySelector(sel);
    if (el) el.getAnimations().forEach((a) => a.cancel());
  });
  const line = panel.querySelector('.panel__line');
  if (line) line.style.transformOrigin = '';
  const title = panel.querySelector('.panel__title');
  if (title) {
    title.style.fontSize = '';
    title.style.transformOrigin = '';
    delete title.dataset.sx;
  }
  const x = panel.querySelector('.close-x');
  if (x) x.classList.remove('is-closing');
}

function close() {
  if (location.pathname !== '/') history.replaceState('', '', '/');
  const panel = openPanel, src = openSource;
  if (!panel) return;
  const done = () => {
    panel.classList.remove('is-open');
    panel.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('is-panel');
    cleanup(panel);
  };
  if (panel.classList.contains('panel--legal')) { openPanel = null; openSource = null; closeLegal(panel).then(done); return; }
  openPanel = null; openSource = null;
  closeAnim(panel, src).then(done);
}

document.querySelectorAll('.nav a, .legal a').forEach((a) => {
  a.addEventListener('click', (e) => {
    const id = a.getAttribute('href').slice(1);
    if (!byId.has(id)) return;
    e.preventDefault();
    source = a;
    if (location.pathname !== '/' + id) history.pushState('', '', '/' + id);
    open(id);
  });
});

const REDUCED_MOTION = matchMedia('(prefers-reduced-motion: reduce)').matches;
const PRONG_CLOSE_MS = REDUCED_MOTION ? 130 : 220;

panels.forEach((p) => {
  const btn = p.querySelector('.panel__close');
  btn.addEventListener('click', () => {

    const x = btn.querySelector('.close-x');
    if (x) x.classList.add('is-closing');

    const target = openPanel;
    setTimeout(() => { if (openPanel === target) close(); }, PRONG_CLOSE_MS);
  });
});

function route(id) { open(!id ? '' : byId.has(id) ? id : 'notfound'); }

const newsFull = document.getElementById('newsfull');
let newsFullOpen = false;
let newsSource = null;
{
  const panel = newsFull?.querySelector('.newsfull__panel');
  const scroll = newsFull?.querySelector('.newsfull__scroll');
  const edgeTop = newsFull?.querySelector('.newsfull__edge--top');
  const edgeBot = newsFull?.querySelector('.newsfull__edge--bot');
  const metaEl = newsFull?.querySelector('.newsfull__meta');
  const titleEl = newsFull?.querySelector('.newsfull__title');
  const bodyEl = newsFull?.querySelector('.newsfull__body');
  const linksEl = newsFull?.querySelector('.newsfull__links');

  const split = (r, opening) => {
    const vh = innerHeight;
    const bandTop = `inset(${r.top}px 0 ${Math.max(0, vh - r.bottom)}px 0)`;
    const full = 'inset(0px 0 0px 0)';
    const d = opening ? 620 : 470;
    const opt = { duration: d, easing: EASE, fill: opening ? 'both' : 'forwards' };
    panel.animate(opening ? [{ clipPath: bandTop }, { clipPath: full }] : [{ clipPath: full }, { clipPath: bandTop }], opt);
    edgeTop.animate(opening
      ? [{ transform: `translateY(${r.top}px)` }, { transform: 'translateY(-3px)' }]
      : [{ transform: 'translateY(-3px)' }, { transform: `translateY(${r.top}px)` }], opt);
    edgeBot.animate(opening
      ? [{ transform: `translateY(${r.bottom}px)` }, { transform: `translateY(${vh}px)` }]
      : [{ transform: `translateY(${vh}px)` }, { transform: `translateY(${r.bottom}px)` }], opt);
    const cd = opening ? { duration: 300, delay: 200, easing: EASE, fill: 'both' } : { duration: 200, easing: EASE, fill: 'forwards' };
    return scroll.animate(opening ? [{ opacity: 0 }, { opacity: 1 }] : [{ opacity: 1 }, { opacity: 0 }], cd);
  };

  window.openNews = (item, n) => {
    if (!newsFull || !n) return;
    metaEl.innerHTML = `${n.date ? `<time class="news__date">${n.date}</time>` : ''}${n.tag ? `<span class="news__tag">${n.tag}</span>` : ''}`;
    titleEl.innerHTML = n.title || '';
    bodyEl.innerHTML = newsBodyHtml(n);
    linksEl.innerHTML = newsLinksHtml(n);
    newsSource = item;
    scroll.scrollTop = 0;
    newsFull.classList.add('is-open');
    newsFull.setAttribute('aria-hidden', 'false');
    newsFullOpen = true;
    split(item.getBoundingClientRect(), true);
  };

  window.closeNews = () => {
    if (!newsFull || !newsFullOpen) return;
    newsFullOpen = false;
    const r = newsSource ? newsSource.getBoundingClientRect()
      : { top: innerHeight * 0.44, bottom: innerHeight * 0.56 };
    split(r, false);
    setTimeout(() => {
      newsFull.classList.remove('is-open');
      newsFull.setAttribute('aria-hidden', 'true');
    }, 480);
  };

  newsFull?.querySelector('.newsfull__close')?.addEventListener('click', () => window.closeNews());
}

addEventListener('keydown', (e) => { if (e.key === 'Escape') { if (newsFullOpen) window.closeNews(); else close(); } });
addEventListener('popstate', () => route(location.pathname.slice(1)));
addEventListener('resize', () => { if (openPanel) updateFade(openPanel); }, { passive: true });
if (location.pathname !== '/') route(location.pathname.slice(1));

{
  const canHover = matchMedia('(hover: hover)').matches;
  const MARGIN = 210;
  const MAG_R = 55;
  const MAG_PULL = 0.22;

  const glows = [...document.querySelectorAll('.side, .hint')].map((el) => ({ el, box: el.getBoundingClientRect(), on: false }));
  const magnets = canHover ? [...document.querySelectorAll('.socials a')] : [];
  const magBox = magnets.map((el) => el.getBoundingClientRect());
  const magState = magnets.map(() => ({ magnetized: false }));

  const ro = new ResizeObserver(() => {
    glows.forEach((g) => { g.box = g.el.getBoundingClientRect(); });
    magnets.forEach((el, i) => { magBox[i] = el.getBoundingClientRect(); });
  });
  glows.forEach((g) => ro.observe(g.el));
  magnets.forEach((el) => ro.observe(el));

  const fadeOut = (g) => { g.el.style.transition = '--glow-alpha 0.85s ease'; g.el.style.setProperty('--glow-alpha', '0'); g.on = false; };
  const setGlow = (g, x, y) => {
    const b = g.box;
    if (!b.width || !b.height) return;
    const near = x >= b.left - MARGIN && x <= b.right + MARGIN && y >= b.top - MARGIN && y <= b.bottom + MARGIN;
    if (near) {
      g.el.style.setProperty('--fx', `${((x - b.left) / b.width) * 100}%`);
      g.el.style.setProperty('--fy', `${((y - b.top) / b.height) * 100}%`);
      if (!g.on) { g.el.style.transition = '--glow-alpha 0.18s ease-out'; g.el.style.setProperty('--glow-alpha', '1'); g.on = true; }
    } else if (g.on) {
      fadeOut(g);
    }
  };

  let rafId = 0, queuedX = 0, queuedY = 0;
  const tick = (x, y) => {
    if (document.hidden) return;
    glows.forEach((g) => setGlow(g, x, y));

    magnets.forEach((el, i) => {
      const r = magBox[i];
      const dx = x - (r.left + r.width / 2);
      const dy = y - (r.top  + r.height / 2);
      if (Math.hypot(dx, dy) < MAG_R) {
        el.style.transform = `translate(${dx * MAG_PULL}px, ${dy * MAG_PULL}px)`;
        if (!magState[i].magnetized) magState[i].magnetized = true;
      } else if (magState[i].magnetized) {
        el.style.transform = '';
        magState[i].magnetized = false;
      }
    });
  };

  addEventListener('pointermove', (e) => {
    queuedX = e.clientX;
    queuedY = e.clientY;
    if (rafId) return;
    rafId = requestAnimationFrame(() => {
      rafId = 0;
      tick(queuedX, queuedY);
    });
  }, { passive: true });

  const clearAll = () => {
    glows.forEach((g) => { if (g.on) fadeOut(g); });
    magnets.forEach((el, i) => {
      if (magState[i].magnetized) { el.style.transform = ''; magState[i].magnetized = false; }
    });
  };
  document.addEventListener('mouseleave', clearAll, { passive: true });

  addEventListener('pointerup', clearAll, { passive: true });
  addEventListener('pointercancel', clearAll, { passive: true });
}

{
  const nav = document.querySelector('.nav');
  const side = document.querySelector('.side');
  const mq = matchMedia('(max-width: 680px)');
  const range = document.createRange();

  const fit = () => {
    const mobile = mq.matches;

    if (nav) {
      const links = nav.querySelectorAll('a');
      if (!mobile) {
        links.forEach((a) => { a.style.fontSize = ''; });
      } else {
        const avail = nav.clientWidth;
        if (avail) links.forEach((a) => {
          a.style.fontSize = '100px';
          range.selectNodeContents(a);
          const tw = range.getBoundingClientRect().width;
          if (tw > 0) a.style.fontSize = ((100 * avail) / tw).toFixed(2) + 'px';
        });
      }
    }

    if (side) {
      if (!mobile) {
        side.style.transform = '';
      } else {
        side.style.transform = 'none';
        range.selectNodeContents(side);
        const nw = range.getBoundingClientRect().width;
        const avail = nav ? nav.clientWidth : 0;
        if (nw > 0 && avail) side.style.transform = `scaleX(${(avail / nw).toFixed(3)})`;
      }
    }
  };

  let raf = 0;
  const schedule = () => { if (raf) return; raf = requestAnimationFrame(() => { raf = 0; fit(); }); };
  addEventListener('resize', schedule, { passive: true });
  addEventListener('orientationchange', schedule, { passive: true });
  mq.addEventListener?.('change', schedule);
  document.fonts.ready.then(fit);
  fit();
}

{
  const notice = document.getElementById('notice');
  if (notice && !localStorage.getItem('zoop-seen-v3')) {
    const ok = notice.querySelector('.notice__ok');
    const delay = location.pathname === '/' ? 3200 : 700;
    setTimeout(() => {
      notice.hidden = false;
      requestAnimationFrame(() => notice.classList.add('is-on'));
    }, delay);
    ok.addEventListener('click', () => {
      notice.classList.remove('is-on');
      localStorage.setItem('zoop-seen-v3', '1');
      setTimeout(() => { notice.hidden = true; }, 500);
    });
  }
}
