export async function onRequestGet({ request, env }) {
  const auth = request.headers.get('Authorization') || '';
  const creds = auth.startsWith('Basic ') ? atob(auth.slice(6)) : '';
  const pass = creds.includes(':') ? creds.slice(creds.indexOf(':') + 1) : '';

  if (!env.ADMIN_PASSWORD || pass !== env.ADMIN_PASSWORD) {
    return new Response('Unauthorized', {
      status: 401,
      headers: { 'WWW-Authenticate': 'Basic realm="analytics"', 'Content-Type': 'text/plain' },
    });
  }

  const url = new URL(request.url);
  const days = Math.min(Math.max(parseInt(url.searchParams.get('days') || '30', 10) || 30, 1), 365);
  const site = url.searchParams.get('site') || '';
  const since = Math.floor(Date.now() / 1000) - days * 86400;

  const where = ['ts > ?'];
  const params = [since];
  if (site) { where.push('site = ?'); params.push(site); }
  const W = where.join(' AND ');
  const Wref = [...where, "ref_domain != ''"].join(' AND ');

  const [sitesRes, total, byDay, topPages, topRef, byCountry, byBrowser, byOS, byDevice] = await Promise.all([
    env.ANALYTICS.prepare('SELECT DISTINCT site FROM hits ORDER BY site').all(),
    env.ANALYTICS.prepare(`SELECT COUNT(*) views, COUNT(DISTINCT visitor_hash) visitors FROM hits WHERE ${W}`).bind(...params).first(),
    env.ANALYTICS.prepare(`SELECT strftime('%Y-%m-%d',ts,'unixepoch') d, COUNT(*) n, COUNT(DISTINCT visitor_hash) uv FROM hits WHERE ${W} GROUP BY d ORDER BY d`).bind(...params).all(),
    env.ANALYTICS.prepare(`SELECT path, COUNT(*) n FROM hits WHERE ${W} GROUP BY path ORDER BY n DESC LIMIT 20`).bind(...params).all(),
    env.ANALYTICS.prepare(`SELECT ref_domain, COUNT(*) n FROM hits WHERE ${Wref} GROUP BY ref_domain ORDER BY n DESC LIMIT 20`).bind(...params).all(),
    env.ANALYTICS.prepare(`SELECT country, COUNT(*) n FROM hits WHERE ${W} GROUP BY country ORDER BY n DESC LIMIT 15`).bind(...params).all(),
    env.ANALYTICS.prepare(`SELECT browser, COUNT(*) n FROM hits WHERE ${W} GROUP BY browser ORDER BY n DESC LIMIT 10`).bind(...params).all(),
    env.ANALYTICS.prepare(`SELECT os, COUNT(*) n FROM hits WHERE ${W} GROUP BY os ORDER BY n DESC LIMIT 10`).bind(...params).all(),
    env.ANALYTICS.prepare(`SELECT device, COUNT(*) n FROM hits WHERE ${W} GROUP BY device ORDER BY n DESC LIMIT 5`).bind(...params).all(),
  ]);

  return new Response(render({
    sites: (sitesRes.results || []).map(r => r.site),
    total: total || { views: 0, visitors: 0 },
    byDay: fillGaps(byDay.results || [], days),
    topPages: topPages.results || [],
    topRef: topRef.results || [],
    byCountry: byCountry.results || [],
    byBrowser: byBrowser.results || [],
    byOS: byOS.results || [],
    byDevice: byDevice.results || [],
    days, site,
  }), { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}

function fillGaps(rows, days) {
  const map = new Map(rows.map(r => [r.d, r]));
  return Array.from({ length: days }, (_, i) => {
    const d = new Date(Date.now() - (days - 1 - i) * 86400000).toISOString().slice(0, 10);
    return map.get(d) || { d, n: 0, uv: 0 };
  });
}

const fmt = n => Number(n || 0).toLocaleString('en');
const esc = s => String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

function barChart(days) {
  const W = 800, H = 72, gap = 1;
  const bw = Math.max(1, W / days.length - gap);
  const max = Math.max(...days.map(d => d.n), 1);
  const bars = days.map((d, i) => {
    const h = Math.max(0, (d.n / max) * H);
    const x = (i * (bw + gap)).toFixed(1);
    const y = (H - h).toFixed(1);
    return `<rect x="${x}" y="${y}" width="${bw.toFixed(1)}" height="${h.toFixed(1)}" fill="#2bb8ff" opacity="0.65"><title>${d.d}: ${fmt(d.n)} views</title></rect>`;
  }).join('');
  return `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" style="width:100%;height:72px;display:block;border-radius:1px">${bars}</svg>`;
}

function tableRows(rows, key) {
  const max = rows[0]?.n || 1;
  return rows.map(r => {
    const pct = Math.round((r.n / max) * 100);
    const label = r[key] || '—';
    return `<tr>
      <td class="tl" title="${esc(label)}">${esc(label)}</td>
      <td class="tc">${fmt(r.n)}</td>
      <td class="tb"><div class="bar" style="width:${pct}%"></div></td>
    </tr>`;
  }).join('');
}

function panel(title, rows, key) {
  return `<div class="panel">
    <div class="ph">${title}</div>
    ${rows.length
      ? `<table>${tableRows(rows, key)}</table>`
      : '<div class="empty">no data yet</div>'}
  </div>`;
}

function render({ sites, total, byDay, topPages, topRef, byCountry, byBrowser, byOS, byDevice, days, site }) {
  const siteOpts = ['', ...sites].map(s =>
    `<option value="${esc(s)}"${s === site ? ' selected' : ''}>${esc(s) || 'all sites'}</option>`
  ).join('');
  const dayOpts = [7, 30, 90, 365].map(d =>
    `<option value="${d}"${d === days ? ' selected' : ''}>${d === 365 ? '1 year' : `${d}d`}</option>`
  ).join('');

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>analytics · zachy.cc</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet">
<style>
*,*::before,*::after{margin:0;padding:0;box-sizing:border-box}
:root{--bg:#000;--s:#080f17;--b:#1a2a35;--t:#c8d8e8;--m:#3a5060;--d:#0f1e28;--w:#fff;--a:#2bb8ff}
html{background:var(--bg);color:var(--t);font-family:'JetBrains Mono',ui-monospace,monospace;font-size:13px;line-height:1.6;-webkit-font-smoothing:antialiased}
body{max-width:940px;margin:0 auto;padding:2.5rem 1.5rem 5rem}
header{display:flex;align-items:center;gap:1rem;margin-bottom:2.5rem;flex-wrap:wrap}
h1{font-size:1.1rem;font-weight:700;color:var(--w);letter-spacing:-0.02em;flex:1}
.controls{display:flex;gap:.5rem}
select{background:var(--s);border:1px solid var(--b);color:var(--t);padding:.3rem .5rem;font:inherit;font-size:.82em;cursor:pointer;outline:none;border-radius:2px}
select:focus{border-color:var(--m)}
.stats{display:flex;gap:2.5rem;margin-bottom:1.75rem;flex-wrap:wrap}
.sv{font-size:2rem;font-weight:700;color:var(--w);line-height:1;letter-spacing:-0.03em}
.sl{font-size:.75em;color:var(--m);margin-top:.2rem}
.chart{border:1px solid var(--b);background:var(--s);padding:.75rem .75rem .5rem;margin-bottom:1.75rem;border-radius:2px}
.cl{display:flex;justify-content:space-between;font-size:.7em;color:var(--m);margin-top:.4rem}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:1rem}
@media(max-width:580px){.grid{grid-template-columns:1fr}}
.panel{border:1px solid var(--b);background:var(--s);border-radius:2px;overflow:hidden}
.ph{padding:.5rem .8rem;font-size:.72em;color:var(--m);border-bottom:1px solid var(--b);letter-spacing:.06em;text-transform:uppercase}
table{width:100%;border-collapse:collapse}
tr:not(:last-child) td{border-bottom:1px solid var(--d)}
td{padding:.38rem .8rem;vertical-align:middle}
.tl{color:var(--t);width:50%;max-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.tc{color:var(--m);text-align:right;white-space:nowrap;padding-right:.6rem;font-size:.9em}
.tb{width:30%;padding:0 .8rem 0 0}
.bar{height:3px;background:var(--a);opacity:.55;border-radius:2px;min-width:2px}
.empty{padding:.85rem .8rem;color:var(--m);font-size:.82em}
</style>
</head>
<body>
<header>
  <h1>analytics</h1>
  <form class="controls" method="get">
    <select name="site" onchange="this.form.submit()">${siteOpts}</select>
    <select name="days" onchange="this.form.submit()">${dayOpts}</select>
  </form>
</header>

<div class="stats">
  <div><div class="sv">${fmt(total.views)}</div><div class="sl">pageviews</div></div>
  <div><div class="sv">${fmt(total.visitors)}</div><div class="sl">visitors</div></div>
</div>

<div class="chart">
  ${barChart(byDay)}
  <div class="cl">
    <span>${byDay[0]?.d || ''}</span>
    <span>${byDay[byDay.length - 1]?.d || ''}</span>
  </div>
</div>

<div class="grid">
  ${panel('pages', topPages, 'path')}
  ${panel('referrers', topRef, 'ref_domain')}
</div>
<div class="grid">
  ${panel('countries', byCountry, 'country')}
  ${panel('browsers', byBrowser, 'browser')}
</div>
<div class="grid">
  ${panel('os', byOS, 'os')}
  ${panel('devices', byDevice, 'device')}
</div>

</body>
</html>`;
}
