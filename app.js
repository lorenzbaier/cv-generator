'use strict';

const KEY = 'cv-generator-data-v1';

// CV languages. Add an entry here to support another one; its content starts as a copy.
const LANGS = { en: { label: 'EN', file: 'CV' }, de: { label: 'DE', file: 'Lebenslauf' } };

// Placeholder content only — real data lives in the visitor's localStorage.
const SAMPLE = {
  settings: { accent: '#745a96', font: 'system', googleFont: 'Source Sans 3', showPhoto: true },
  photo: '',
  lang: 'en',
  content: {
    en: {
      name: 'Jane Doe',
      personalTitle: 'Personal Information',
      personal: [
        { label: 'Address', value: 'Example Street 1\n12345 Sample City' },
        { label: 'Phone', value: '+49 000 0000000' },
        { label: 'E-Mail', value: 'jane.doe@example.com' },
      ],
      sidebar: [
        { title: 'Interests', items: [{ text: 'Photography', extra: '' }, { text: 'Hiking', extra: '' }] },
        { title: 'Languages', items: [{ text: 'English', extra: 'C1' }, { text: 'German', extra: 'Native' }] },
      ],
      sections: [
        { title: 'Work experience', entries: [
          { title: 'Software Engineer', date: 'Jan 2022 - Present', subtitle: 'Example Corp, Berlin', desc: 'Fullstack - TypeScript, Angular, Spring' },
          { title: 'Working Student', date: 'Apr 2020 - Dec 2021', subtitle: 'Example Corp, Berlin', desc: 'Frontend development' },
        ] },
        { title: 'Education', entries: [
          { title: 'B.Sc. Computer Science', date: 'Oct 2018 - Sep 2021', subtitle: 'Example University', desc: '' },
        ] },
        { title: 'Skills', entries: [
          { title: 'TypeScript, Angular, Java, Spring, SQL, Docker', date: '', subtitle: '', desc: '' },
        ] },
      ],
    },
    de: {
      name: 'Jane Doe',
      personalTitle: 'Persönliche Daten',
      personal: [
        { label: 'Adresse', value: 'Beispielstraße 1\n12345 Musterstadt' },
        { label: 'Telefon', value: '+49 000 0000000' },
        { label: 'E-Mail', value: 'jane.doe@example.com' },
      ],
      sidebar: [
        { title: 'Interessen', items: [{ text: 'Fotografie', extra: '' }, { text: 'Wandern', extra: '' }] },
        { title: 'Sprachen', items: [{ text: 'Englisch', extra: 'C1' }, { text: 'Deutsch', extra: 'Muttersprache' }] },
      ],
      sections: [
        { title: 'Berufserfahrung', entries: [
          { title: 'Softwareentwicklerin', date: 'Jan 2022 - heute', subtitle: 'Example Corp, Berlin', desc: 'Fullstack - TypeScript, Angular, Spring' },
          { title: 'Werkstudentin', date: 'Apr 2020 - Dez 2021', subtitle: 'Example Corp, Berlin', desc: 'Frontend-Entwicklung' },
        ] },
        { title: 'Ausbildung', entries: [
          { title: 'B.Sc. Informatik', date: 'Okt 2018 - Sep 2021', subtitle: 'Beispiel-Universität', desc: '' },
        ] },
        { title: 'Kenntnisse', entries: [
          { title: 'TypeScript, Angular, Java, Spring, SQL, Docker', date: '', subtitle: '', desc: '' },
        ] },
      ],
    },
  },
};

const FONTS = {
  system: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
  serif: 'Georgia, "Times New Roman", serif',
  helvetica: '"Helvetica Neue", Helvetica, Arial, sans-serif',
  mono: 'ui-monospace, Menlo, Consolas, monospace',
};

const GOOGLE_SUGGESTIONS = ['Source Sans 3', 'Inter', 'Roboto', 'Open Sans', 'Lato', 'Nunito Sans', 'IBM Plex Sans', 'Merriweather', 'Lora', 'EB Garamond'];

// Google Fonts are only requested when selected, so no third-party request happens by default.
let gfLoaded = '';
let gfTimer;
function loadGoogleFont(name) {
  clearTimeout(gfTimer);
  name = name.trim();
  if (!name || name === gfLoaded) return;
  gfTimer = setTimeout(() => {
    gfLoaded = name;
    let link = document.getElementById('gfont');
    if (!link) { link = el('link', { id: 'gfont', rel: 'stylesheet' }); document.head.append(link); }
    // Missing weights are skipped by the API; an unknown family name returns an error.
    const status = (msg) => { const n = document.getElementById('gfont-status'); if (n) n.textContent = msg; };
    link.onload = () => status('');
    link.onerror = () => status('Font "' + name + '" not found on Google Fonts.');
    link.href = 'https://fonts.googleapis.com/css2?family=' + encodeURIComponent(name).replace(/%20/g, '+') + ':wght@400;500;600;700&display=swap';
  }, 400);
}

function fontStack(s) {
  if (s.font !== 'google' || !s.googleFont.trim()) return FONTS[s.font] || FONTS.system;
  loadGoogleFont(s.googleFont);
  return '"' + s.googleFont.trim().replace(/["\\]/g, '') + '", ' + FONTS.system;
}

const clone = (o) => JSON.parse(JSON.stringify(o));

// Brings stored or imported data into the current shape (also migrates the old single-language format).
function normalize(raw) {
  if (!raw.content) {
    const { settings, photo, ...cv } = raw;
    raw = { settings, photo, content: { en: cv } };
  }
  const d = { ...clone(SAMPLE), ...raw, settings: { ...SAMPLE.settings, ...raw.settings } };
  const first = Object.values(d.content)[0] || clone(SAMPLE.content.en);
  for (const l of Object.keys(LANGS)) if (!d.content[l]) d.content[l] = clone(first);
  if (!LANGS[d.lang]) d.lang = 'en';
  return d;
}

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return normalize(JSON.parse(raw));
  } catch (e) { /* storage blocked or corrupt: fall back to sample */ }
  return clone(SAMPLE);
}

let data = load();
const cur = () => data.content[data.lang];

function save() {
  try { localStorage.setItem(KEY, JSON.stringify(data)); }
  catch (e) { alert('Could not save to localStorage: ' + e.message); }
}

// Tiny DOM helper. Children are added as text nodes, so imported data is never parsed as HTML.
function el(tag, attrs = {}, ...children) {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k.startsWith('on')) n.addEventListener(k.slice(2), v);
    else if (k in n) n[k] = v;
    else n.setAttribute(k, v);
  }
  for (const c of children.flat()) if (c != null && c !== false) n.append(c);
  return n;
}

/* ---------- Preview ---------- */

function renderCV() {
  const c = cur();
  const cv = document.getElementById('cv');
  const s = data.settings;
  cv.style.setProperty('--accent', s.accent);
  cv.style.setProperty('--font', fontStack(s));
  cv.classList.toggle('no-photo', !s.showPhoto || !data.photo);
  cv.lang = data.lang;

  cv.replaceChildren(
    el('aside', { className: 'side' },
      el('img', { className: 'photo', src: data.photo || '', alt: '' }),
      el('section', {},
        el('h3', {}, c.personalTitle),
        el('dl', {}, c.personal.flatMap((p) => [el('dt', {}, p.label), el('dd', {}, p.value)])),
      ),
      c.sidebar.map((sec) => el('section', {},
        el('h3', {}, sec.title),
        el('ul', {}, sec.items.map((it) => el('li', {}, el('b', {}, it.text), it.extra ? el('span', {}, it.extra) : null))),
      )),
    ),
    el('main', { className: 'main' },
      el('h1', {}, c.name),
      c.sections.map((sec) => el('section', {},
        el('h2', {}, sec.title),
        sec.entries.map((e) => el('div', { className: 'entry' },
          el('div', { className: 'top' }, el('span', { className: 'title' }, e.title), e.date ? el('span', { className: 'date' }, e.date) : null),
          e.subtitle ? el('div', {}, e.subtitle) : null,
          e.desc ? el('div', { className: 'desc' }, e.desc) : null,
        )),
      )),
    ),
  );
}

/* ---------- Editor ---------- */

function changed() { save(); renderCV(); }
function rebuild() { save(); renderEditor(); renderCV(); }

function field(label, obj, key, multiline = false) {
  const input = el(multiline ? 'textarea' : 'input', {
    value: obj[key] ?? '',
    oninput: (e) => { obj[key] = e.target.value; changed(); },
  });
  if (!multiline) input.type = 'text';
  else input.rows = 2;
  return el('label', {}, label, input);
}

function itemControls(arr, i) {
  const move = (d) => { const j = i + d; if (j < 0 || j >= arr.length) return; [arr[i], arr[j]] = [arr[j], arr[i]]; rebuild(); };
  return el('div', { className: 'item-head' },
    el('button', { type: 'button', className: 'mini', title: 'Move up', onclick: () => move(-1) }, '↑'),
    el('button', { type: 'button', className: 'mini', title: 'Move down', onclick: () => move(1) }, '↓'),
    el('button', { type: 'button', className: 'mini danger', title: 'Remove', onclick: () => { arr.splice(i, 1); rebuild(); } }, '✕'),
  );
}

const addBtn = (text, fn) => el('button', { type: 'button', onclick: () => { fn(); rebuild(); } }, text);

function renderLangs() {
  document.getElementById('lang-switch').replaceChildren(...Object.entries(LANGS).map(([code, l]) =>
    el('button', {
      type: 'button',
      className: code === data.lang ? 'active' : '',
      title: 'Edit and export the ' + l.label + ' version',
      onclick: () => { data.lang = code; rebuild(); },
    }, l.label)));
}

function googleFontField(s) {
  const input = el('input', { type: 'text', value: s.googleFont, placeholder: 'e.g. Inter', oninput: (e) => { s.googleFont = e.target.value; changed(); } });
  input.setAttribute('list', 'gfonts');
  return el('label', {}, 'Google Font name (see fonts.google.com)', input,
    el('datalist', { id: 'gfonts' }, GOOGLE_SUGGESTIONS.map((f) => el('option', { value: f }))),
    el('span', { id: 'gfont-status', className: 'error' }));
}

function renderEditor() {
  const c = cur();
  renderLangs();
  const s = data.settings;

  const design = el('fieldset', {}, el('legend', {}, 'Design'),
    el('div', { className: 'grid2' },
      el('label', {}, 'Accent color', el('input', { type: 'color', value: s.accent, oninput: (e) => { s.accent = e.target.value; changed(); } })),
      el('label', {}, 'Font', el('select', { onchange: (e) => { s.font = e.target.value; rebuild(); } },
        Object.keys(FONTS).map((f) => el('option', { value: f, selected: s.font === f }, f)),
        el('option', { value: 'google', selected: s.font === 'google' }, 'Google Font…'))),
    ),
    s.font === 'google' ? googleFontField(s) : null,
    el('label', { className: 'inline' },
      el('input', { type: 'checkbox', checked: s.showPhoto, onchange: (e) => { s.showPhoto = e.target.checked; changed(); } }), 'Show photo'),
    el('div', { className: 'row-btns' },
      el('label', { className: 'btn' }, data.photo ? 'Change photo' : 'Upload photo',
        el('input', { type: 'file', accept: 'image/*', hidden: true, onchange: (e) => loadPhoto(e.target.files[0]) })),
      data.photo ? addBtn('Remove photo', () => { data.photo = ''; }) : null,
    ),
  );

  const others = Object.keys(LANGS).filter((l) => l !== data.lang);
  const header = el('fieldset', {}, el('legend', {}, 'Header'), field('Name', c, 'name'),
    el('div', { className: 'row-btns' }, others.map((l) => addBtn('Copy content from ' + LANGS[l].label, () => {
      if (confirm('Replace the ' + LANGS[data.lang].label + ' content with a copy of ' + LANGS[l].label + '?')) data.content[data.lang] = clone(data.content[l]);
    }))));

  const personal = el('fieldset', {}, el('legend', {}, 'Personal info'),
    field('Section title', c, 'personalTitle'),
    c.personal.map((p, i) => el('div', { className: 'item' },
      itemControls(c.personal, i), field('Label', p, 'label'), field('Value', p, 'value', true))),
    addBtn('+ Field', () => c.personal.push({ label: '', value: '' })),
  );

  const sidebar = el('fieldset', {}, el('legend', {}, 'Sidebar lists'),
    c.sidebar.map((sec, i) => el('div', { className: 'item' },
      itemControls(c.sidebar, i),
      field('Title', sec, 'title'),
      sec.items.map((it, j) => el('div', { className: 'item' },
        itemControls(sec.items, j),
        el('div', { className: 'grid2' }, field('Text', it, 'text'), field('Right (optional)', it, 'extra')))),
      addBtn('+ Item', () => sec.items.push({ text: '', extra: '' })),
    )),
    addBtn('+ Sidebar list', () => c.sidebar.push({ title: 'New list', items: [] })),
  );

  const sections = el('fieldset', {}, el('legend', {}, 'Main sections'),
    c.sections.map((sec, i) => el('div', { className: 'item' },
      itemControls(c.sections, i),
      field('Section title', sec, 'title'),
      sec.entries.map((e, j) => el('div', { className: 'item' },
        itemControls(sec.entries, j),
        el('div', { className: 'grid2' }, field('Title', e, 'title'), field('Date', e, 'date')),
        field('Subtitle', e, 'subtitle'),
        field('Description', e, 'desc', true))),
      addBtn('+ Entry', () => sec.entries.push({ title: '', date: '', subtitle: '', desc: '' })),
    )),
    addBtn('+ Section', () => c.sections.push({ title: 'New section', entries: [] })),
  );

  document.getElementById('fields').replaceChildren(design, header, personal, sidebar, sections);
}

// Downscale the photo so it stays small in localStorage (~30 KB).
function loadPhoto(file) {
  if (!file) return;
  const img = new Image();
  img.onload = () => {
    const size = 400;
    const c = document.createElement('canvas');
    c.width = c.height = size;
    const min = Math.min(img.width, img.height);
    c.getContext('2d').drawImage(img, (img.width - min) / 2, (img.height - min) / 2, min, min, 0, 0, size, size);
    URL.revokeObjectURL(img.src);
    data.photo = c.toDataURL('image/jpeg', 0.85);
    data.settings.showPhoto = true;
    rebuild();
  };
  img.src = URL.createObjectURL(file);
}

/* ---------- Toolbar ---------- */

document.getElementById('btn-pdf').addEventListener('click', () => {
  // The browser uses document.title as the suggested PDF file name.
  const prev = document.title;
  document.title = (cur().name || 'CV').replace(/[^\w\- ]+/g, '').trim().replace(/\s+/g, '_') + '_' + LANGS[data.lang].file;
  // Make sure every weight of a selected web font is loaded before the PDF is rendered.
  const s = data.settings;
  const name = s.font === 'google' && s.googleFont.trim().replace(/["\\]/g, '');
  const loads = name ? ['400', '500', '600'].map((w) => document.fonts.load(w + ' 12px "' + name + '"')) : [];
  Promise.all(loads).catch(() => {}).then(() => {
    window.print();
    document.title = prev;
  });
});

document.getElementById('btn-export').addEventListener('click', () => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const a = el('a', { href: URL.createObjectURL(blob), download: 'cv-data.json' });
  a.click();
  URL.revokeObjectURL(a.href);
});

document.getElementById('file-import').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  e.target.value = '';
  if (!file) return;
  try {
    data = normalize(JSON.parse(await file.text()));
    rebuild();
  } catch (err) { alert('Invalid JSON file: ' + err.message); }
});

document.getElementById('btn-reset').addEventListener('click', () => {
  if (!confirm('Delete your saved data from this browser and restore the sample?')) return;
  try { localStorage.removeItem(KEY); } catch (e) { /* ignore */ }
  data = clone(SAMPLE);
  renderEditor();
  renderCV();
});

renderEditor();
renderCV();
