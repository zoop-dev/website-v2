
const $ = (id) => document.getElementById(id);
const formEditor = $('formEditor');
const rawJson = $('rawJson');
const rawSwitch = $('rawSwitch');

let cfg = { work: [], news: [], socials: [], stack: [], about: [], source: '' };
let isRaw = false;
let rawSnapshot = null;
let adminPw = '';

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const TOAST_STYLES = {
  '':     { bg: 'linear-gradient(135deg, #0b0e12, #0f141b)', border: '#1b2a38', text: '#eaf3ff' },
  ok:     { bg: 'linear-gradient(135deg, #0b1410, #0f1f16)', border: '#1b3828', text: '#4ee39a' },
  bad:    { bg: 'linear-gradient(135deg, #140b0d, #1f0f12)', border: '#381b22', text: '#ff5f6d' },
  warn:   { bg: 'linear-gradient(135deg, #14110b, #1f1a0f)', border: '#38301b', text: '#ffc83d' },
};
const status = (msg, kind = '') => {
  const s = TOAST_STYLES[kind] || TOAST_STYLES[''];
  Toastify({
    text: msg,
    duration: kind === '' ? 2500 : 4000,
    close: true,
    gravity: 'bottom',
    position: 'right',
    style: { background: s.bg, color: s.text, border: `1px solid ${s.border}` },
  }).showToast();
};
const hexToColor = (h) => {
  h = String(h ?? '').replace('#', '');
  if (h.length === 6) return '#' + h;
  if (h.length === 3) return '#' + h;
  return '#2bb8ff';
};
const colorToHex = (c) => c.replace('#', '').toUpperCase();

const slugify = (s) => String(s || '')
  .toLowerCase().trim()
  .replace(/['’]/g, '')
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '')
  .slice(0, 60);
const autoSlug = (n, i) => slugify(n && n.slug) || slugify(n && n.title) || String(i + 1);

function move(arr, idx, dir) {
  const ni = idx + dir;
  if (ni < 0 || ni >= arr.length) return;
  [arr[idx], arr[ni]] = [arr[ni], arr[idx]];
  render();
}
function remove(arr, idx) {
  arr.splice(idx, 1);
  render();
}

function render() {
  if (isRaw) {
    rawJson.value = JSON.stringify(cfg, null, 2);
    formEditor.style.display = 'none';
    rawJson.style.display = 'block';
    return;
  }
  formEditor.style.display = 'block';
  rawJson.style.display = 'none';
  formEditor.innerHTML = '';

  formEditor.appendChild(section('work', 'Work', cfg.work.length, () => {
    cfg.work.push({ name: '', tag: '', meta: '', href: '' });
    render();
  }, renderWork));

  formEditor.appendChild(section('news', 'News', cfg.news.length, () => {
    cfg.news.unshift({ date: new Date().toISOString().slice(0, 10), tag: '', title: '', slug: '', body: [''], links: [] });
    render();
  }, renderNews));

  formEditor.appendChild(section('socials', 'Socials', cfg.socials.length, () => {
    cfg.socials.push({ icon: '', label: '', href: '' });
    render();
  }, renderSocials));

  formEditor.appendChild(section('stack', 'Stack', cfg.stack.length, () => {
    cfg.stack.push({ group: '', items: [] });
    render();
  }, renderStack));

  formEditor.appendChild(section('about', 'About', cfg.about.length, () => {
    cfg.about.push('');
    render();
  }, renderAbout));

  formEditor.appendChild(sourceField());
}

function sourceField() {
  const sec = document.createElement('div');
  sec.className = 'section open';
  sec.innerHTML = `
    <div class="section__head"><span class="section__chevron">▶</span><span class="section__title">Footer</span></div>
    <div class="section__body">
      <div class="field">
        <label class="field__label">Source link (footer)</label>
        <input type="text" id="src-field" value="${esc(cfg.source || '')}" placeholder="https://github.com/…" />
      </div>
    </div>
  `;
  const head = sec.querySelector('.section__head');
  head.onclick = () => { sec.classList.toggle('open'); sectionOpen.footer = sec.classList.contains('open'); };
  if (sectionOpen.footer === false) sec.classList.remove('open');
  sec.querySelector('#src-field').addEventListener('input', (e) => { cfg.source = e.target.value; });
  return sec;
}

function renderSocials(body) {
  if (!cfg.socials.length) {
    body.innerHTML = '<div class="empty">no socials yet. add one.</div>';
    return;
  }
  cfg.socials.forEach((s, i) => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <div class="card__top">
        <span class="card__num">${i + 1}</span>
        <span class="card__spacer"></span>
        <div class="card__btns">
          <button class="icon" data-act="up" title="move up">↑</button>
          <button class="icon" data-act="down" title="move down">↓</button>
          <button class="danger" data-act="del">remove</button>
        </div>
      </div>
      <div class="field">
        <label class="field__label">Icon (slug: github, spotify, signal, mail, x, instagram, linkedin, youtube, discord, telegram, bluesky, mastodon)</label>
        <input type="text" data-key="icon" value="${esc(s.icon)}" placeholder="github" />
      </div>
      <div class="field">
        <label class="field__label">Label (tooltip / aria)</label>
        <input type="text" data-key="label" value="${esc(s.label)}" placeholder="GitHub" />
      </div>
      <div class="field">
        <label class="field__label">Link (use mailto: for email)</label>
        <input type="text" data-key="href" value="${esc(s.href)}" placeholder="https://…" />
      </div>
    `;
    wireCard(card, cfg.socials, i);
    body.appendChild(card);
  });
}

const sectionOpen = {};
function section(id, title, count, onAdd, renderBody) {
  const sec = document.createElement('div');
  const isOpen = sectionOpen[id] !== false;
  sec.className = isOpen ? 'section open' : 'section';
  sec.id = 'sec-' + id;

  const head = document.createElement('div');
  head.className = 'section__head';
  head.innerHTML = `<span class="section__chevron">▶</span><span class="section__title">${title}</span><span class="section__count">${count}</span>`;
  head.onclick = () => { sec.classList.toggle('open'); sectionOpen[id] = sec.classList.contains('open'); };
  sec.appendChild(head);

  const body = document.createElement('div');
  body.className = 'section__body';
  renderBody(body);
  sec.appendChild(body);

  const addBtn = document.createElement('button');
  addBtn.className = 'add-btn';
  addBtn.type = 'button';
  addBtn.textContent = '+ add another';
  addBtn.onclick = onAdd;
  body.appendChild(addBtn);

  return sec;
}

function renderWork(body) {
  if (!cfg.work.length) {
    body.innerHTML = '<div class="empty">nothing here yet. go build something.</div>';
    return;
  }
  cfg.work.forEach((p, i) => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <div class="card__top">
        <span class="card__num">${i + 1}</span>
        <span class="card__spacer"></span>
        <div class="card__btns">
          <button class="icon" data-act="up" title="move up">↑</button>
          <button class="icon" data-act="down" title="move down">↓</button>
          <button class="danger" data-act="del">remove</button>
        </div>
      </div>
      <div class="field">
        <label class="field__label">Name</label>
        <input type="text" data-key="name" value="${esc(p.name)}" placeholder="project name" />
      </div>
      <div class="field">
        <label class="field__label">Tagline</label>
        <input type="text" data-key="tag" value="${esc(p.tag)}" placeholder="what is it, in a line" />
      </div>
      <div class="field">
        <label class="field__label">Meta</label>
        <input type="text" data-key="meta" value="${esc(p.meta)}" placeholder="2026 · Workers · D1" />
      </div>
      <div class="field">
        <label class="field__label">Link (leave empty for non-navigable placeholder)</label>
        <input type="text" data-key="href" value="${esc(p.href)}" placeholder="https://…" />
      </div>
    `;
    wireCard(card, cfg.work, i);
        card.appendChild(buildDescSection(i));
    card.appendChild(buildTechSection(i));
    card.appendChild(buildLinksSection(i));
    body.appendChild(card);
  });
}

function subSection(label, hint) {
  const sub = document.createElement('div');
  sub.className = 'sub';
  const head = document.createElement('div');
  head.className = 'sub__label';
  head.textContent = label;
  if (hint) {
    const h = document.createElement('span');
    h.className = 'sub__hint';
    h.textContent = ' ' + hint;
    head.appendChild(h);
  }
  sub.appendChild(head);
  return sub;
}

function buildDescSection(pi) {
  const p = cfg.work[pi];
  const sub = subSection('Description', 'paragraphs shown when the project is expanded');
  const items = document.createElement('div');
  items.className = 'sub__items';
  (p.desc || []).forEach((text, di) => {
    const row = document.createElement('div');
    row.className = 'sub__row';
    row.innerHTML = `
      <textarea rows="2" placeholder="paragraph…">${esc(text)}</textarea>
      <div class="card__btns">
        <button class="icon" title="move up">↑</button>
        <button class="icon" title="move down">↓</button>
        <button class="danger" title="remove">×</button>
      </div>
    `;
    const ta = row.querySelector('textarea');
    ta.addEventListener('input', () => { cfg.work[pi].desc[di] = ta.value; });
    const btns = row.querySelectorAll('button');
    btns[0].onclick = () => move(cfg.work[pi].desc, di, -1);
    btns[1].onclick = () => move(cfg.work[pi].desc, di, 1);
    btns[2].onclick = () => remove(cfg.work[pi].desc, di);
    items.appendChild(row);
  });
  sub.appendChild(items);
  const addBtn = document.createElement('button');
  addBtn.className = 'add-btn add-btn--sub';
  addBtn.type = 'button';
  addBtn.textContent = '+ add a paragraph';
  addBtn.onclick = () => {
    if (!cfg.work[pi].desc) cfg.work[pi].desc = [];
    cfg.work[pi].desc.push('');
    render();
  };
  sub.appendChild(addBtn);
  return sub;
}

function buildTechSection(pi) {
  const p = cfg.work[pi];
  const sub = subSection('Tech badges', 'icon slug from simple-icons.org');
  const items = document.createElement('div');
  items.className = 'sub__items';
  (p.tech || []).forEach((item, ti) => {
    const row = document.createElement('div');
    row.className = 'badge-row';
    row.innerHTML = `
      <div class="field__row">
        <input type="color" value="${hexToColor(item.c)}" title="logo colour" />
        <input type="text" class="color-hex" value="${esc(item.c || '')}" placeholder="FFFFFF" />
        <input type="text" value="${esc(item.n)}" placeholder="label" />
        <input type="text" value="${esc(item.logo || '')}" placeholder="icon slug" />
        <div class="card__btns">
          <button class="icon" title="move up">↑</button>
          <button class="icon" title="move down">↓</button>
          <button class="danger" title="remove">×</button>
        </div>
      </div>
    `;
    const colorPicker = row.querySelector('input[type="color"]');
    const hexInput = row.querySelector('.color-hex');
    const [nInput, logoInput] = row.querySelectorAll('input[type="text"]:not(.color-hex)');
    colorPicker.addEventListener('input', () => {
      cfg.work[pi].tech[ti].c = colorToHex(colorPicker.value);
      hexInput.value = cfg.work[pi].tech[ti].c;
    });
    hexInput.addEventListener('input', () => {
      const v = hexInput.value.replace('#', '');
      cfg.work[pi].tech[ti].c = v;
      if (/^[0-9a-fA-F]{6}$/.test(v)) colorPicker.value = '#' + v;
    });
    nInput.addEventListener('input', () => { cfg.work[pi].tech[ti].n = nInput.value; });
    logoInput.addEventListener('input', () => { cfg.work[pi].tech[ti].logo = logoInput.value; });
    const btns = row.querySelectorAll('button');
    btns[0].onclick = () => move(cfg.work[pi].tech, ti, -1);
    btns[1].onclick = () => move(cfg.work[pi].tech, ti, 1);
    btns[2].onclick = () => remove(cfg.work[pi].tech, ti);
    items.appendChild(row);
  });
  sub.appendChild(items);
  const addBtn = document.createElement('button');
  addBtn.className = 'add-btn add-btn--sub';
  addBtn.type = 'button';
  addBtn.textContent = '+ add a badge';
  addBtn.onclick = () => {
    if (!cfg.work[pi].tech) cfg.work[pi].tech = [];
    cfg.work[pi].tech.push({ n: '', logo: '', c: '' });
    render();
  };
  sub.appendChild(addBtn);
  return sub;
}

function buildLinksSection(pi) {
  const p = cfg.work[pi];
  const sub = subSection('Links', 'buttons shown in the expanded detail');
  const items = document.createElement('div');
  items.className = 'sub__items';
  (p.links || []).forEach((link, li) => {
    const row = document.createElement('div');
    row.className = 'badge-row';
    row.innerHTML = `
      <div class="field__row">
        <input type="text" value="${esc(link.label)}" placeholder="label (e.g. visit)" />
        <input type="text" value="${esc(link.href)}" placeholder="https://…" />
        <div class="card__btns">
          <button class="icon" title="move up">↑</button>
          <button class="icon" title="move down">↓</button>
          <button class="danger" title="remove">×</button>
        </div>
      </div>
    `;
    const [labelInput, hrefInput] = row.querySelectorAll('input[type="text"]');
    labelInput.addEventListener('input', () => { cfg.work[pi].links[li].label = labelInput.value; });
    hrefInput.addEventListener('input', () => { cfg.work[pi].links[li].href = hrefInput.value; });
    const btns = row.querySelectorAll('button');
    btns[0].onclick = () => move(cfg.work[pi].links, li, -1);
    btns[1].onclick = () => move(cfg.work[pi].links, li, 1);
    btns[2].onclick = () => remove(cfg.work[pi].links, li);
    items.appendChild(row);
  });
  sub.appendChild(items);
  const addBtn = document.createElement('button');
  addBtn.className = 'add-btn add-btn--sub';
  addBtn.type = 'button';
  addBtn.textContent = '+ add a link';
  addBtn.onclick = () => {
    if (!cfg.work[pi].links) cfg.work[pi].links = [];
    cfg.work[pi].links.push({ label: '', href: '' });
    render();
  };
  sub.appendChild(addBtn);
  return sub;
}

function renderNews(body) {
  if (!cfg.news.length) {
    body.innerHTML = '<div class="empty">no news yet. ship something worth announcing.</div>';
    return;
  }
  cfg.news.forEach((n, i) => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <div class="card__top">
        <span class="card__num">${i + 1}</span>
        <span class="card__spacer"></span>
        <div class="card__btns">
          <button class="icon" data-act="up" title="move up">↑</button>
          <button class="icon" data-act="down" title="move down">↓</button>
          <button class="danger" data-act="del">remove</button>
        </div>
      </div>
      <div class="field">
        <label class="field__label">Date</label>
        <input type="text" data-key="date" value="${esc(n.date)}" placeholder="2026-07-11" />
      </div>
      <div class="field">
        <label class="field__label">Tag (small chip, e.g. release)</label>
        <input type="text" data-key="tag" value="${esc(n.tag)}" placeholder="release" />
      </div>
      <div class="field">
        <label class="field__label">Title</label>
        <input type="text" data-key="title" value="${esc(n.title)}" placeholder="what happened" />
      </div>
      <div class="field">
        <label class="field__label">URL slug — zachy.cc/news/<b>${esc(autoSlug(n, i))}</b> (leave blank to auto-generate from the title)</label>
        <input type="text" data-key="slug" value="${esc(n.slug)}" placeholder="${esc(slugify(n.title) || 'my-post')}" />
      </div>
    `;
    wireCard(card, cfg.news, i);
    card.appendChild(buildNewsBodySection(i));
    card.appendChild(buildNewsLinksSection(i));
    body.appendChild(card);
  });
}

function buildNewsBodySection(ni) {
  const n = cfg.news[ni];
  const sub = subSection('Body', 'paragraphs of the post');
  const items = document.createElement('div');
  items.className = 'sub__items';
  (n.body || []).forEach((text, di) => {
    const row = document.createElement('div');
    row.className = 'sub__row';
    row.innerHTML = `
      <textarea rows="2" placeholder="paragraph…">${esc(text)}</textarea>
      <div class="card__btns">
        <button class="icon" title="move up">↑</button>
        <button class="icon" title="move down">↓</button>
        <button class="danger" title="remove">×</button>
      </div>
    `;
    const ta = row.querySelector('textarea');
    ta.addEventListener('input', () => { cfg.news[ni].body[di] = ta.value; });
    const btns = row.querySelectorAll('button');
    btns[0].onclick = () => move(cfg.news[ni].body, di, -1);
    btns[1].onclick = () => move(cfg.news[ni].body, di, 1);
    btns[2].onclick = () => remove(cfg.news[ni].body, di);
    items.appendChild(row);
  });
  sub.appendChild(items);
  const addBtn = document.createElement('button');
  addBtn.className = 'add-btn add-btn--sub';
  addBtn.type = 'button';
  addBtn.textContent = '+ add a paragraph';
  addBtn.onclick = () => {
    if (!cfg.news[ni].body) cfg.news[ni].body = [];
    cfg.news[ni].body.push('');
    render();
  };
  sub.appendChild(addBtn);
  return sub;
}

function buildNewsLinksSection(ni) {
  const n = cfg.news[ni];
  const sub = subSection('Links', 'buttons shown under the post');
  const items = document.createElement('div');
  items.className = 'sub__items';
  (n.links || []).forEach((link, li) => {
    const row = document.createElement('div');
    row.className = 'badge-row';
    row.innerHTML = `
      <div class="field__row">
        <input type="text" value="${esc(link.label)}" placeholder="label (e.g. try it)" />
        <input type="text" value="${esc(link.href)}" placeholder="https://…" />
        <div class="card__btns">
          <button class="icon" title="move up">↑</button>
          <button class="icon" title="move down">↓</button>
          <button class="danger" title="remove">×</button>
        </div>
      </div>
    `;
    const [labelInput, hrefInput] = row.querySelectorAll('input[type="text"]');
    labelInput.addEventListener('input', () => { cfg.news[ni].links[li].label = labelInput.value; });
    hrefInput.addEventListener('input', () => { cfg.news[ni].links[li].href = hrefInput.value; });
    const btns = row.querySelectorAll('button');
    btns[0].onclick = () => move(cfg.news[ni].links, li, -1);
    btns[1].onclick = () => move(cfg.news[ni].links, li, 1);
    btns[2].onclick = () => remove(cfg.news[ni].links, li);
    items.appendChild(row);
  });
  sub.appendChild(items);
  const addBtn = document.createElement('button');
  addBtn.className = 'add-btn add-btn--sub';
  addBtn.type = 'button';
  addBtn.textContent = '+ add a link';
  addBtn.onclick = () => {
    if (!cfg.news[ni].links) cfg.news[ni].links = [];
    cfg.news[ni].links.push({ label: '', href: '' });
    render();
  };
  sub.appendChild(addBtn);
  return sub;
}

function renderAbout(body) {
  if (!cfg.about.length) {
    body.innerHTML = '<div class="empty">no words yet. say something.</div>';
    return;
  }
  cfg.about.forEach((text, i) => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <div class="card__top">
        <span class="card__num">${i + 1}</span>
        <span class="card__spacer"></span>
        <div class="card__btns">
          <button class="icon" data-act="up" title="move up">↑</button>
          <button class="icon" data-act="down" title="move down">↓</button>
          <button class="danger" data-act="del">remove</button>
        </div>
      </div>
      <div class="field">
        <label class="field__label">Paragraph (inline &lt;em&gt;…&lt;/em&gt; allowed)</label>
        <textarea data-key="text" rows="2" placeholder="spill it…">${esc(text)}</textarea>
      </div>
    `;

    const ta = card.querySelector('[data-key="text"]');
    ta.addEventListener('input', () => { cfg.about[i] = ta.value; });

    card.querySelector('[data-act="up"]').onclick = () => move(cfg.about, i, -1);
    card.querySelector('[data-act="down"]').onclick = () => move(cfg.about, i, 1);
    card.querySelector('[data-act="del"]').onclick = () => remove(cfg.about, i);
    body.appendChild(card);
  });
}

function renderStack(body) {
  if (!cfg.stack.length) {
    body.innerHTML = '<div class="empty">no groups yet. throw one in.</div>';
    return;
  }
  cfg.stack.forEach((g, gi) => {
    const group = document.createElement('div');
    group.className = 'stack-group';
    group.innerHTML = `
      <div class="stack-group__head">
        <input type="text" class="stack-group__name" data-key="group" value="${esc(g.group)}" placeholder="Group name" />
        <div class="card__btns">
          <button class="icon" data-act="gup" title="move group up">↑</button>
          <button class="icon" data-act="gdown" title="move group down">↓</button>
          <button class="danger" data-act="gdel">remove group</button>
        </div>
      </div>
      <div class="items"></div>
    `;

    group.querySelector('[data-key="group"]').addEventListener('input', (e) => {
      cfg.stack[gi].group = e.target.value;
    });

    group.querySelector('[data-act="gup"]').onclick = () => move(cfg.stack, gi, -1);
    group.querySelector('[data-act="gdown"]').onclick = () => move(cfg.stack, gi, 1);
    group.querySelector('[data-act="gdel"]').onclick = () => remove(cfg.stack, gi);

    const itemsEl = group.querySelector('.items');
    (g.items || []).forEach((item, ii) => {
      const row = document.createElement('div');
      row.className = 'badge-row';
      row.innerHTML = `
        <div class="field__row">
          <input type="color" data-key="c" value="${hexToColor(item.c)}" title="logo colour" />
          <input type="text" class="color-hex" data-key="cHex" value="${esc(item.c || '')}" placeholder="FFFFFF" />
          <input type="text" data-key="n" value="${esc(item.n)}" placeholder="label" />
          <input type="text" data-key="logo" value="${esc(item.logo || '')}" placeholder="icon slug" />
          <div class="card__btns">
            <button class="icon" data-act="iup" title="move up">↑</button>
            <button class="icon" data-act="idown" title="move down">↓</button>
            <button class="danger" data-act="idel">×</button>
          </div>
        </div>
      `;

      const colorPicker = row.querySelector('[data-key="c"]');
      const hexInput = row.querySelector('[data-key="cHex"]');
      colorPicker.addEventListener('input', () => {
        cfg.stack[gi].items[ii].c = colorToHex(colorPicker.value);
        hexInput.value = cfg.stack[gi].items[ii].c;
      });
      hexInput.addEventListener('input', () => {
        const v = hexInput.value.replace('#', '');
        cfg.stack[gi].items[ii].c = v;
        if (/^[0-9a-fA-F]{6}$/.test(v)) colorPicker.value = '#' + v;
      });

      row.querySelector('[data-key="n"]').addEventListener('input', (e) => {
        cfg.stack[gi].items[ii].n = e.target.value;
      });
      row.querySelector('[data-key="logo"]').addEventListener('input', (e) => {
        cfg.stack[gi].items[ii].logo = e.target.value;
      });

      row.querySelector('[data-act="iup"]').onclick = () => move(cfg.stack[gi].items, ii, -1);
      row.querySelector('[data-act="idown"]').onclick = () => move(cfg.stack[gi].items, ii, 1);
      row.querySelector('[data-act="idel"]').onclick = () => remove(cfg.stack[gi].items, ii);
      itemsEl.appendChild(row);
    });

    const addItem = document.createElement('button');
    addItem.className = 'add-btn';
    addItem.type = 'button';
    addItem.textContent = '+ add a badge';
    addItem.onclick = () => {
      if (!cfg.stack[gi].items) cfg.stack[gi].items = [];
      cfg.stack[gi].items.push({ n: '', logo: '', c: '' });
      render();
    };
    itemsEl.appendChild(addItem);

    body.appendChild(group);
  });
}

function wireCard(card, arr, idx) {

  card.querySelectorAll(':scope > .field > [data-key]').forEach((el) => {
    el.addEventListener('input', () => { arr[idx][el.dataset.key] = el.value; });
  });
  card.querySelector('[data-act="up"]').onclick = () => move(arr, idx, -1);
  card.querySelector('[data-act="down"]').onclick = () => move(arr, idx, 1);
  card.querySelector('[data-act="del"]').onclick = () => remove(arr, idx);
}

rawSwitch.addEventListener('click', () => {
  isRaw = !isRaw;
  rawSwitch.classList.toggle('on', isRaw);
  if (isRaw) {

    rawSnapshot = cfg;
    rawJson.value = JSON.stringify(cfg, null, 2);
  } else {

    try {
      cfg = normalize(JSON.parse(rawJson.value));
    } catch (e) {
      cfg = rawSnapshot;
      status('raw json broke — rolled it back: ' + e.message, 'bad');
    }
    rawSnapshot = null;
  }
  render();
});

function normalize(c) {
  return {      work: Array.isArray(c?.work) ? c.work.map((p) => ({
            name: String(p?.name ?? ''), tag: String(p?.tag ?? ''),
            meta: String(p?.meta ?? ''), href: String(p?.href ?? ''),
            desc: Array.isArray(p?.desc) ? p.desc.map((d) => String(d ?? '')) : [],
            tech: Array.isArray(p?.tech) ? p.tech.map((it) => ({
              n: String(it?.n ?? ''), logo: String(it?.logo ?? ''), c: String(it?.c ?? ''),
            })) : [],
            links: Array.isArray(p?.links) ? p.links.map((l) => ({
              label: String(l?.label ?? ''), href: String(l?.href ?? ''),
            })) : [],
          })) : [],
    news: Array.isArray(c?.news) ? c.news.map((n) => ({
      date: String(n?.date ?? ''), tag: String(n?.tag ?? ''), title: String(n?.title ?? ''),
      slug: String(n?.slug ?? ''),
      body: Array.isArray(n?.body) ? n.body.map((p) => String(p ?? '')) : [],
      links: Array.isArray(n?.links) ? n.links.map((l) => ({
        label: String(l?.label ?? ''), href: String(l?.href ?? ''),
      })) : [],
    })) : [],
    socials: Array.isArray(c?.socials) ? c.socials.map((s) => ({
      icon: String(s?.icon ?? ''), label: String(s?.label ?? ''), href: String(s?.href ?? ''),
    })) : [],
    source: typeof c?.source === 'string' ? c.source : '',
    stack: Array.isArray(c?.stack) ? c.stack.map((g) => ({
      group: String(g?.group ?? ''),
      items: Array.isArray(g?.items) ? g.items.map((it) => ({
        n: String(it?.n ?? ''), logo: String(it?.logo ?? ''), c: String(it?.c ?? ''),
      })) : [],
    })) : [],
    about: Array.isArray(c?.about) ? c.about.map((p) => String(p ?? '')) : [],
  };
}

const KEY_STORE = 'zoop-admin-key';

function deauth() {
  adminPw = '';
  try { localStorage.removeItem(KEY_STORE); } catch (e) { }
  adminContent.style.display = 'none';
  authOverlay.style.display = '';
  authPw.value = '';
  authBtn.disabled = false;
  authBtn.textContent = 'let me in';
}

async function load() {
  if (!adminPw) { status('uh, log in first', 'bad'); return; }
  status('grabbing the config…');
  try {
    const r = await fetch('/api/config', {
      cache: 'no-store',
      headers: { authorization: 'Bearer ' + adminPw },
    });
    if (r.status === 401) { deauth(); status('session went stale — password again.', 'warn'); return; }
    const data = await r.json();
    cfg = data ? normalize(data) : { work: [], news: [], socials: [], stack: [], about: [], source: '' };
    render();
    status(data ? 'config, loaded ✓' : 'nothing saved yet — go wild.', 'ok');
  } catch (e) {
    status('couldnt grab it: ' + e.message, 'bad');
  }
}

async function save() {
  if (!adminPw) { status('uh, log in first', 'bad'); return; }

  let toSave = cfg;
  if (isRaw) {
    try { toSave = normalize(JSON.parse(rawJson.value)); }
    catch (e) { status('that json is busted: ' + e.message, 'bad'); return; }
  }

  status('saving…');
  try {
    const r = await fetch('/api/config', {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: 'Bearer ' + adminPw },
      body: JSON.stringify(toSave),
    });
    const out = await r.json();
    if (r.status === 401) { deauth(); status('session went stale — password again.', 'warn'); return; }
    if (!r.ok) { status('save flopped: ' + (out.error || r.status), 'bad'); return; }
    cfg = toSave;
    if (isRaw) rawSnapshot = toSave;
    render();
    status('saved ✓ its live.', 'ok');
  } catch (e) {
    status('save flopped: ' + e.message, 'bad');
  }
}

$('load').addEventListener('click', load);
$('save').addEventListener('click', save);

const importFile = $('importFile');
$('import').addEventListener('click', () => importFile.click());
importFile.addEventListener('change', async () => {
  const file = importFile.files && importFile.files[0];
  importFile.value = '';
  if (!file) return;
  try {
    cfg = normalize(JSON.parse(await file.text()));
    if (isRaw) rawSnapshot = cfg;
    render();
    status('file loaded — review it, then ship it.', 'ok');
  } catch (e) {
    status('couldnt read that file: ' + e.message, 'bad');
  }
});

const authOverlay = $('authOverlay');
const adminContent = $('adminContent');
const authPw = $('authPw');
const authBtn = $('authBtn');
const authError = $('authError');

async function authenticate() {
  const pw = authPw.value;
  if (!pw) { authError.textContent = 'gimme the password'; return; }
  authBtn.disabled = true;
  authBtn.textContent = 'letting you in…';
  authError.textContent = '';
  try {
    const r = await fetch('/api/config', {
      cache: 'no-store',
      headers: { authorization: 'Bearer ' + pw },
    });
    if (!r.ok) {
      authError.textContent = 'nope, wrong one';
      authBtn.disabled = false;
      authBtn.textContent = 'let me in';
      return;
    }
    adminPw = pw;
    try { localStorage.setItem(KEY_STORE, pw); } catch (e) { }
    authOverlay.style.display = 'none';
    adminContent.style.display = '';
    load();
  } catch (e) {
    authError.textContent = 'couldnt connect: ' + e.message;
    authBtn.disabled = false;
    authBtn.textContent = 'let me in';
  }
}

authBtn.addEventListener('click', authenticate);
authPw.addEventListener('keydown', (e) => { if (e.key === 'Enter') authenticate(); });

async function autoLogin() {
  let pw = '';
  try { pw = localStorage.getItem(KEY_STORE) || ''; } catch (e) { }
  if (!pw) return;
  try {
    const r = await fetch('/api/config', { cache: 'no-store', headers: { authorization: 'Bearer ' + pw } });
    if (!r.ok) { try { localStorage.removeItem(KEY_STORE); } catch (e) { } return; }
    adminPw = pw;
    authOverlay.style.display = 'none';
    adminContent.style.display = '';
    load();
  } catch (e) { }
}
autoLogin();
