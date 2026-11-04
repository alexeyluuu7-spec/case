// Builds every page template in both languages from src/*.html + content/*.json.
//   src/index.html   -> index.html (cs, default) and en/index.html
//   src/minimal.html -> minimal/index.html and en/minimal/index.html (Plasma-style minimal variant)
// {{key}} = escaped string from the language file, {{=var}} = build variable, <!--SPRITE--> = shared SVG defs.
// Fails on any missing key or if the language files don't have the same keys.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const sprite = readFileSync(join(root, 'src/_sprite.html'), 'utf8');
const langs = ['cs', 'en'];
const dict = Object.fromEntries(langs.map(l => [l, JSON.parse(readFileSync(join(root, `content/${l}.json`), 'utf8'))]));

for (const l of langs.slice(1)) {
  const a = new Set(Object.keys(dict.cs)), b = new Set(Object.keys(dict[l]));
  const miss = [...a].filter(k => !b.has(k)).map(k => `${l} missing ${k}`).concat([...b].filter(k => !a.has(k)).map(k => `cs missing ${k}`));
  if (miss.length) { console.error(miss.join('\n')); process.exit(1); }
}
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const used = new Set();

// dir: where the page lives relative to the site root ('' or 'minimal/'); en pages live under en/<dir>.
const pages = [
  { src: 'src/index.html', dir: '' },
  { src: 'src/minimal.html', dir: 'minimal/' },
];
const depth = path => path.split('/').filter(Boolean).length;
const up = n => '../'.repeat(n);

for (const page of pages) {
  if (!existsSync(join(root, page.src))) continue;
  const tpl = readFileSync(join(root, page.src), 'utf8').replace('<!--SPRITE-->', sprite);
  for (const l of langs) {
    const dir = (l === 'cs' ? '' : `${l}/`) + page.dir;
    const base = up(depth(dir));
    const vars = {
      lang: l, base,
      href_cs: base + page.dir || './',
      href_en: base + 'en/' + page.dir,
      href_full: base + (l === 'cs' ? '' : 'en/'),
      href_min: base + (l === 'cs' ? '' : 'en/') + 'minimal/',
      cur_cs: l === 'cs' ? 'aria-current="true"' : '',
      cur_en: l === 'en' ? 'aria-current="true"' : '',
    };
    const html = tpl
      .replace(/\{\{=(\w+)\}\}/g, (_, k) => { if (!(k in vars)) throw new Error(`unknown var ${k}`); return vars[k]; })
      .replace(/\{\{([\w.]+)\}\}/g, (_, k) => {
        if (!(k in dict[l])) throw new Error(`[${l}] ${page.src}: missing key ${k}`);
        used.add(k); return esc(dict[l][k]);
      });
    const out = dir + 'index.html';
    mkdirSync(dirname(join(root, out)), { recursive: true });
    writeFileSync(join(root, out), html);
    console.log(`built ${out}`);
  }
}
const unused = Object.keys(dict.cs).filter(k => !used.has(k));
if (unused.length) console.warn('unused keys:', unused.join(', '));
