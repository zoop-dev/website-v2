const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS });
}

export async function onRequestPost({ request, env }) {
  try {
    const body = await request.json();
    const { s: site, p: path, r: ref, t: title, sc: screen, l: lang, us, um, uc } = body;
    if (!site || !path) return new Response('ok', { headers: CORS });

    const ua = request.headers.get('User-Agent') || '';
    const { browser, os, device } = parseUA(ua);
    const country = request.cf?.country || '';
    const refDomain = safeHost(ref);
    const hash = await visitorHash(request, String(site));

    await env.ANALYTICS.prepare(
      `INSERT INTO hits (site,path,ref,ref_domain,country,browser,os,device,screen,language,utm_source,utm_medium,utm_campaign,title,visitor_hash,ts)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
    ).bind(
      clip(site, 100), clip(path, 500), clip(ref, 500), clip(refDomain, 200), country,
      browser, os, device, clip(screen, 20), clip(lang, 20),
      clip(us, 100), clip(um, 100), clip(uc, 100), clip(title, 200),
      hash, Math.floor(Date.now() / 1000)
    ).run();
  } catch {}

  return new Response('ok', { headers: CORS });
}

const clip = (v, n) => String(v || '').slice(0, n);

function safeHost(url) {
  try { return new URL(url).hostname; } catch { return ''; }
}

function parseUA(ua) {
  const browser =
    /Edg\//.test(ua)          ? 'Edge' :
    /OPR\/|Opera/.test(ua)    ? 'Opera' :
    /SamsungBrowser/.test(ua) ? 'Samsung' :
    /Chrome\//.test(ua)       ? 'Chrome' :
    /Firefox\//.test(ua)      ? 'Firefox' :
    /Safari\//.test(ua)       ? 'Safari' :
    /MSIE|Trident/.test(ua)   ? 'IE' : 'Other';

  const os =
    /CrOS/.test(ua)                   ? 'ChromeOS' :
    /Windows NT/.test(ua)             ? 'Windows' :
    /iPhone/.test(ua)                 ? 'iOS' :
    /iPad/.test(ua)                   ? 'iPadOS' :
    /Android/.test(ua)                ? 'Android' :
    /Mac OS X/.test(ua)               ? 'macOS' :
    /Linux/.test(ua)                  ? 'Linux' : 'Other';

  const device =
    /Mobile|Android.*Mobile|iPhone/.test(ua) ? 'Mobile' :
    /iPad|Android(?!.*Mobile)/.test(ua)      ? 'Tablet' : 'Desktop';

  return { browser, os, device };
}

async function visitorHash(request, site) {
  const ip = request.headers.get('CF-Connecting-IP') || request.headers.get('X-Forwarded-For') || '';
  const ua = request.headers.get('User-Agent') || '';
  const day = new Date().toISOString().slice(0, 10);
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(ip + ua + site + day));
  return [...new Uint8Array(buf)].slice(0, 8).map(b => b.toString(16).padStart(2, '0')).join('');
}
