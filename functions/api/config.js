
const KEY = 'site';
const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  });

export async function onRequestGet({ request, env }) {
  const auth = request.headers.get('authorization') || '';

  if (auth && (!env.ADMIN_PASSWORD || auth !== `Bearer ${env.ADMIN_PASSWORD}`)) {
    return json({ error: 'unauthorized' }, 401);
  }

  try {
    const raw = await env.CONFIG.get(KEY);
    return json(raw ? JSON.parse(raw) : null);
  } catch {
    return json(null);
  }
}

export async function onRequestPost({ request, env }) {
  const auth = request.headers.get('authorization') || '';
  if (!env.ADMIN_PASSWORD || auth !== `Bearer ${env.ADMIN_PASSWORD}`) {
    return json({ error: 'unauthorized' }, 401);
  }
  if (!env.CONFIG) return json({ error: 'no KV binding' }, 500);
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'invalid json' }, 400);
  }

  if (typeof body !== 'object' || body === null) return json({ error: 'expected an object' }, 400);
  await env.CONFIG.put(KEY, JSON.stringify(body));
  return json({ ok: true });
}
