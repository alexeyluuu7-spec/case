// Figma helpers for the TAO.bot Behance case (cloud replacement for figmosha's `h`).
// Prepend this file to every use_figma script. Plain JS, top-level await is allowed after it.
const h = {
  hex(s) {
    s = s.replace('#', '');
    return { r: parseInt(s.slice(0, 2), 16) / 255, g: parseInt(s.slice(2, 4), 16) / 255, b: parseInt(s.slice(4, 6), 16) / 255 };
  },

  // Get a node by id and switch to its page (once per script).
  async node(id) {
    const n = await figma.getNodeByIdAsync(id);
    if (!n) throw new Error('node not found: ' + id);
    let p = n;
    while (p.type !== 'PAGE') p = p.parent;
    if (figma.currentPage !== p) await figma.setCurrentPageAsync(p);
    return n;
  },

  // Compact tree: id, name, type, size; text content for TEXT nodes.
  dumpTree(n, depth = 3, d = 0) {
    const o = { id: n.id, name: n.name, type: n.type, w: Math.round(n.width), h: Math.round(n.height) };
    if (n.type === 'TEXT') o.text = n.characters.slice(0, 60);
    if (d < depth && 'children' in n) o.kids = n.children.map(c => h.dumpTree(c, depth, d + 1));
    return o;
  },

  // Library color variables, collected from the paints bound under `root`.
  // Library variables are remote and can't be listed directly, so we find them through nodes.
  _vars: null,
  async vars(root) {
    if (h._vars) return h._vars;
    const ids = new Set();
    root.findAll(n => {
      for (const k of ['fills', 'strokes']) {
        const arr = n[k];
        if (Array.isArray(arr)) for (const p of arr) if (p.boundVariables && p.boundVariables.color) ids.add(p.boundVariables.color.id);
      }
      return false;
    });
    const map = {};
    for (const id of ids) {
      const v = await figma.variables.getVariableByIdAsync(id);
      if (v && !map[v.name]) map[v.name] = v;
    }
    return (h._vars = map);
  },
  v(name) {
    const v = h._vars && h._vars[name];
    if (!v) throw new Error('variable not found: ' + name + ' (call await h.vars(root) first)');
    return v;
  },

  _paint(name) {
    return figma.variables.setBoundVariableForPaint({ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }, 'color', h.v(name));
  },
  // Bind fill / stroke to a library variable by name.
  bF(n, name) { n.fills = [h._paint(name)]; return n; },
  bS(n, name, weight = 1) { n.strokes = [h._paint(name)]; n.strokeWeight = weight; return n; },

  // Set text keeping its current fonts loaded.
  async text(n, s) {
    const fonts = n.getStyledTextSegments(['fontName']).map(x => x.fontName);
    for (const f of fonts) await figma.loadFontAsync(f);
    n.characters = s;
    return n;
  },

  // Find a TEXT node inside `root` by its current content.
  findText(root, s) { return root.findOne(n => n.type === 'TEXT' && n.characters === s); },
};
