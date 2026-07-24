export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);

  if (url.hostname === (env.LNK_HOST || 'lnk.zachy.cc')) return shortener(context, url);

  const asset = await env.ASSETS.fetch(request);
  if (asset.status !== 404) return asset;

  const path = url.pathname;
  url.pathname = '/index.html';
  const page = await env.ASSETS.fetch(url);

  const m = /^\/news\/([^/]+)\/?$/.exec(path);
  if (m && env.CONFIG) {
    let slug = m[1];
    try { slug = decodeURIComponent(slug); } catch (e) { }
    const post = await findPost(env, slug);
    if (post) return rewriteMeta(page, post, url.origin + path);
  }
  return page;
}

const slugify = (s) => String(s || '')
  .toLowerCase().trim()
  .replace(/['’]/g, '')
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '')
  .slice(0, 60);

async function findPost(env, slug) {
  try {
    const raw = await env.CONFIG.get('site');
    if (!raw) return null;
    const news = JSON.parse(raw).news;
    if (!Array.isArray(news)) return null;
    return news.find((n, i) => (slugify(n && n.slug) || slugify(n && n.title) || String(i + 1)) === slug) || null;
  } catch (e) {
    return null;
  }
}

function rewriteMeta(page, post, href) {
  const title = (post.title ? String(post.title) : 'news') + ' · zoop';
  const body = Array.isArray(post.body) ? post.body : (post.body ? [post.body] : []);
  const desc = String(body[0] || '').replace(/<[^>]*>/g, '').trim().slice(0, 200);
  const setText = { element(e) { e.setInnerContent(title); } };
  const attr = (name, value) => ({ element(e) { e.setAttribute(name, value); } });

  let r = new HTMLRewriter()
    .on('title', setText)
    .on('meta[property="og:title"]', attr('content', title))
    .on('meta[name="twitter:title"]', attr('content', title))
    .on('meta[property="og:url"]', attr('content', href))
    .on('link[rel="canonical"]', attr('href', href))
    .on('meta[property="og:type"]', attr('content', 'article'));

  if (desc) {
    r = r
      .on('meta[name="description"]', attr('content', desc))
      .on('meta[property="og:description"]', attr('content', desc))
      .on('meta[name="twitter:description"]', attr('content', desc));
  }
  return r.transform(page);
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
