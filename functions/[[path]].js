export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);

  if (url.hostname === (env.LNK_HOST || 'lnk.zachy.cc')) return shortener(context, url);

  const asset = await env.ASSETS.fetch(request);
  if (asset.status !== 404) return asset;

  url.pathname = '/index.html';
  return env.ASSETS.fetch(url);
}

async function shortener(context, url) {
  const { request, env } = context;
  const slug = url.pathname.replace(/^\/+|\/+$/g, '');

  if (!slug) return Response.redirect('https://zachy.cc/', 302);
  if (!env.LNK) return new Response('link store unavailable', { status: 503 });

  const row = await env.LNK.prepare('SELECT url FROM links WHERE slug = ?').bind(slug).first();
  if (!row) return new Response('no such link. it zooped off.', { status: 404 });

  context.waitUntil(logClick(env, request, slug));
  return Response.redirect(row.url, 302);
}

function logClick(env, request, slug) {
  return env.LNK.batch([
    env.LNK
      .prepare('INSERT INTO clicks (slug, ts, referrer, country, ua) VALUES (?, ?, ?, ?, ?)')
      .bind(
        slug,
        Date.now(),
        request.headers.get('referer'),
        request.headers.get('cf-ipcountry'),
        request.headers.get('user-agent'),
      ),
    env.LNK.prepare('UPDATE links SET clicks = clicks + 1 WHERE slug = ?').bind(slug),
  ]);
}
