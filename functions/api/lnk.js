const json = (data, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json' } });

const authed = (request, env) => {
  const h = request.headers.get('Authorization') || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : '';
  return Boolean(env.ADMIN_PASSWORD) && token === env.ADMIN_PASSWORD;
};

const validSlug = (s) => typeof s === 'string' && /^[A-Za-z0-9_-]{1,64}$/.test(s);
const validUrl = (u) => {
  try { const p = new URL(u); return p.protocol === 'http:' || p.protocol === 'https:'; }
  catch { return false; }
};

export async function onRequest(context) {
  const { request, env } = context;
  if (!authed(request, env)) return json({ error: 'nope' }, 401);
  if (!env.LNK) return json({ error: 'no D1 binding' }, 503);
  const db = env.LNK;

  if (request.method === 'GET') {
    const [links, total, recent, refs, countries] = await Promise.all([
      db.prepare('SELECT slug, url, created, clicks FROM links ORDER BY created DESC').all(),
      db.prepare('SELECT COUNT(*) AS n FROM clicks').first(),
      db.prepare('SELECT slug, ts, referrer, country FROM clicks ORDER BY ts DESC LIMIT 30').all(),
      db.prepare("SELECT COALESCE(NULLIF(referrer,''),'direct') AS k, COUNT(*) AS n FROM clicks GROUP BY k ORDER BY n DESC LIMIT 8").all(),
      db.prepare("SELECT COALESCE(NULLIF(country,''),'??') AS k, COUNT(*) AS n FROM clicks GROUP BY k ORDER BY n DESC LIMIT 8").all(),
    ]);
    return json({
      links: links.results,
      stats: {
        total: total?.n ?? 0,
        recent: recent.results,
        referrers: refs.results,
        countries: countries.results,
      },
    });
  }

  if (request.method === 'POST' || request.method === 'PUT') {
    const { slug, url } = await request.json().catch(() => ({}));
    if (!validSlug(slug)) return json({ error: 'slug must be 1-64 chars: letters, numbers, - or _' }, 400);
    if (!validUrl(url)) return json({ error: 'url must be a valid http(s) link' }, 400);

    if (request.method === 'PUT') {
      const r = await db.prepare('UPDATE links SET url = ? WHERE slug = ?').bind(url, slug).run();
      if (!r.meta.changes) return json({ error: 'no such slug' }, 404);
      return json({ ok: true });
    }
    try {
      await db.prepare('INSERT INTO links (slug, url, created) VALUES (?, ?, ?)').bind(slug, url, Date.now()).run();
    } catch {
      return json({ error: 'that slug is taken' }, 409);
    }
    return json({ ok: true });
  }

  if (request.method === 'DELETE') {
    const { slug } = await request.json().catch(() => ({}));
    if (!validSlug(slug)) return json({ error: 'bad slug' }, 400);
    await db.batch([
      db.prepare('DELETE FROM clicks WHERE slug = ?').bind(slug),
      db.prepare('DELETE FROM links WHERE slug = ?').bind(slug),
    ]);
    return json({ ok: true });
  }

  return json({ error: 'method not allowed' }, 405);
}
