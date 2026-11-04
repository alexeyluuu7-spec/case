// Builds index.html (cs, default) and en/index.html from src/index.html + content/*.json.
// {{key}} = escaped string from the language file, {{=var}} = build variable.
// Fails on any missing key or if the language files don't have the same keys.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const tpl = readFileSync(join(root, 'src/index.html'), 'utf8').replace('<!--SPRITE-->', readFileSync(join(root, 'src/_sprite.html'), 'utf8'));
const langs = ['cs', 'en'];
const dict = Object.fromEntries(langs.map(l => [l, JSON.parse(readFileSync(join(root, `content/${l}.json`), 'utf8'))]));

const keysOf = l => Object.keys(dict[l]).sort().join('\n');
for (const l of langs.slice(1)) {
  const a = new Set(Object.keys(dict.cs)), b = new Set(Object.keys(dict[l]));
  const miss = [...a].filter(k => !b.has(k)).map(k => `${l} missing ${k}`).concat([...b].filter(k => !a.has(k)).map(k => `cs missing ${k}`));
  if (miss.length) { console.error(miss.join('\n')); process.exit(1); }
}
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const used = new Set();

for (const l of langs) {
  const out = l === 'cs' ? 'index.html' : `${l}/index.html`;
  const base = l === 'cs' ? '' : '../';
  const vars = {
    lang: l, base,
    href_cs: l === 'cs' ? './' : '../',
    href_en: l === 'cs' ? 'en/' : './',
    cur_cs: l === 'cs' ? 'aria-current="true"' : '',
    cur_en: l === 'en' ? 'aria-current="true"' : '',
  };
  const html = tpl
    .replace(/\{\{=(\w+)\}\}/g, (_, k) => { if (!(k in vars)) throw new Error(`unknown var ${k}`); return vars[k]; })
    .replace(/\{\{([\w.]+)\}\}/g, (_, k) => {
      if (!(k in dict[l])) throw new Error(`[${l}] missing key ${k}`);
      used.add(k); return esc(dict[l][k]);
    });
  mkdirSync(dirname(join(root, out)), { recursive: true });
  writeFileSync(join(root, out), html);
  console.log(`built ${out}`);
}
const unused = Object.keys(dict.cs).filter(k => !used.has(k));
if (unused.length) console.warn('unused keys:', unused.join(', '));
