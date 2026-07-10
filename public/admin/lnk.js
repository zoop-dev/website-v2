const $ = (id) => document.getElementById(id);
const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

let pw = '';
let data = { links: [], stats: { total: 0, recent: [], referrers: [], countries: [] } };

const TOAST_STYLES = {
  '':  { bg: 'linear-gradient(135deg, #0b0e12, #0f141b)', border: '#1b2a38', text: '#eaf3ff' },
  ok:  { bg: 'linear-gradient(135deg, #0b1410, #0f1f16)', border: '#1b3828', text: '#4ee39a' },
  bad: { bg: 'linear-gradient(135deg, #140b0d, #1f0f12)', border: '#381b22', text: '#ff5f6d' },
};
const status = (msg, kind = '') => {
  const s = TOAST_STYLES[kind] || TOAST_STYLES[''];
  Toastify({
    text: msg, duration: kind === 'bad' ? 4000 : 2500, close: true,
    gravity: 'bottom', position: 'right',
    style: { background: s.bg, color: s.text, border: `1px solid ${s.border}` },
  }).showToast();
};

const api = (method, body) =>
  fetch('/api/lnk', {
    method,
    cache: 'no-store',
    headers: { Authorization: 'Bearer ' + pw, ...(body ? { 'content-type': 'application/json' } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });

const when = (ts) => {
  const d = Math.floor((Date.now() - ts) / 1000);
  if (d < 60) return d + 's ago';
  if (d < 3600) return Math.floor(d / 60) + 'm ago';
  if (d < 86400) return Math.floor(d / 3600) + 'h ago';
  return Math.floor(d / 86400) + 'd ago';
};

const host = () => (location.hostname === 'localhost' || location.hostname === '127.0.0.1') ? location.host : 'lnk.zachy.cc';

async function load() {
  const r = await api('GET');
  if (!r.ok) { status(r.status === 401 ? 'wrong password.' : 'couldnt load the links.', 'bad'); return; }
  data = await r.json();
  render();
}

function render() {
  const s = data.stats;
  $('statsRow').innerHTML =
    `<div class="stat"><span class="stat__n">${data.links.length}</span><span class="stat__l">links</span></div>` +
    `<div class="stat"><span class="stat__n">${s.total}</span><span class="stat__l">total clicks</span></div>` +
    `<div class="stat"><span class="stat__n">${s.recent.length ? when(s.recent[0].ts) : '—'}</span><span class="stat__l">last click</span></div>`;

  $('linksBox').innerHTML = data.links.length
    ? `<table class="ltable"><thead><tr>
         <th>slug</th><th>destination</th><th style="text-align:right">clicks</th><th>made</th><th></th>
       </tr></thead><tbody>${data.links.map(linkRow).join('')}</tbody></table>`
    : '<div class="empty">no links yet. make one above.</div>';
  wireRows();

  const list = (title, rows, fmt = (k) => k) => {
    const body = rows.length
      ? rows.map((r) => `<div class="row"><span>${esc(fmt(r.k))}</span><span>${r.n}</span></div>`).join('')
      : '<div class="empty">nothing yet.</div>';
    return `<div class="box"><h3>${title}</h3>${body}</div>`;
  };
  const recent = s.recent.length
    ? s.recent.map((c) => `<div class="row"><span>/${esc(c.slug)} ${c.country ? '· ' + esc(c.country) : ''}</span><span>${when(c.ts)}</span></div>`).join('')
    : '<div class="empty">no clicks yet.</div>';

  $('cols').innerHTML =
    list('top referrers', s.referrers, (k) => { try { return new URL(k).hostname; } catch { return k; } }) +
    list('top countries', s.countries) +
    `<div class="box"><h3>recent clicks</h3>${recent}</div>`;
}

function linkRow(l) {
  return `<tr data-slug="${esc(l.slug)}">
    <td class="slug" title="click to copy">/${esc(l.slug)}</td>
    <td class="dest"><input type="text" value="${esc(l.url)}" data-url /></td>
    <td class="clicks">${l.clicks}</td>
    <td class="when">${when(l.created)}</td>
    <td class="act"><button class="danger" data-del>remove</button></td>
  </tr>`;
}

function wireRows() {
  document.querySelectorAll('.ltable tr[data-slug]').forEach((tr) => {
    const slug = tr.dataset.slug;

    tr.querySelector('.slug').addEventListener('click', () => {
      navigator.clipboard?.writeText(`https://${host()}/${slug}`);
      status('copied.', 'ok');
    });

    const input = tr.querySelector('[data-url]');
    let original = input.value;
    const save = async () => {
      if (input.value === original) return;
      const r = await api('PUT', { slug, url: input.value.trim() });
      if (!r.ok) { const e = await r.json().catch(() => ({})); status(e.error || 'update flopped.', 'bad'); input.value = original; return; }
      original = input.value;
      status('updated ✓', 'ok');
    };
    input.addEventListener('blur', save);
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') input.blur(); });

    tr.querySelector('[data-del]').addEventListener('click', async () => {
      if (!confirm(`delete /${slug}? its clicks go too.`)) return;
      const r = await api('DELETE', { slug });
      if (!r.ok) { status('couldnt delete it.', 'bad'); return; }
      status('gone.', 'ok');
      load();
    });
  });
}

$('add').addEventListener('click', async () => {
  const slug = $('newSlug').value.trim();
  const url = $('newUrl').value.trim();
  if (!slug || !url) { status('need a slug and a destination.', 'bad'); return; }
  const r = await api('POST', { slug, url });
  if (!r.ok) { const e = await r.json().catch(() => ({})); status(e.error || 'couldnt make it.', 'bad'); return; }
  $('newSlug').value = '';
  $('newUrl').value = '';
  status('made it ✓', 'ok');
  load();
});

$('reload').addEventListener('click', load);

async function authenticate() {
  const val = $('authPw').value;
  if (!val) return;
  pw = val;
  const r = await api('GET');
  if (!r.ok) { $('authError').textContent = 'nope, try again.'; pw = ''; return; }
  data = await r.json();
  $('authOverlay').style.display = 'none';
  $('adminContent').style.display = 'block';
  render();
}
$('authBtn').addEventListener('click', authenticate);
$('authPw').addEventListener('keydown', (e) => { if (e.key === 'Enter') authenticate(); });
