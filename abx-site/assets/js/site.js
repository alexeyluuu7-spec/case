/* ABX Global landing — behaviour. No dependencies. */
(() => {
  'use strict';
  const doc = document.documentElement;
  const lang = doc.lang || 'cs';
  const mqReduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const reduce = () => mqReduce.matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  if (new URLSearchParams(location.search).has('placeholders')) doc.classList.add('show-ph');

  /* Nav: background + blur after scroll */
  const nav = $('[data-nav]');
  const onScroll = () => nav && nav.classList.toggle('is-scrolled', window.scrollY > 24);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* Count-up for the trust numbers */
  const nf = new Intl.NumberFormat(lang === 'cs' ? 'cs-CZ' : 'en-GB');
  function countUp(el) {
    const target = Number(el.dataset.count);
    const pre = el.dataset.prefix || '', suf = el.dataset.suffix || '';
    const final = el.textContent;
    if (reduce() || !target) return;
    const dur = 1600, t0 = performance.now();
    const ease = t => 1 - Math.pow(1 - t, 4);
    const step = now => {
      const t = Math.min(1, (now - t0) / dur);
      el.textContent = t < 1 ? pre + nf.format(Math.round(target * ease(t))) + suf : final;
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  /* Reveal on scroll */
  const revealables = $$('.rv');
  if ('IntersectionObserver' in window && !reduce()) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-in');
        if (e.target.hasAttribute('data-countup')) $$('[data-count]', e.target).forEach(countUp);
        io.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    revealables.forEach(el => io.observe(el));
  } else {
    revealables.forEach(el => el.classList.add('is-in'));
  }

  /* FAQ accordion (one open at a time) */
  $$('[data-accordion]').forEach(list => {
    const items = $$('.qa', list);
    const set = (item, open) => {
      const btn = $('button', item), panel = $('.qa-a', item);
      item.classList.toggle('is-open', open);
      btn.setAttribute('aria-expanded', String(open));
      panel.toggleAttribute('inert', !open);
    };
    items.forEach(item => {
      $('button', item).addEventListener('click', () => {
        const open = !item.classList.contains('is-open');
        items.forEach(i => i !== item && set(i, false));
        set(item, open);
      });
    });
  });

  /* Exclusive: unfolds in place */
  $$('[data-ex]').forEach(card => {
    const btn = $('[data-ex-toggle]', card), body = $('.ex-body', card), label = $('.ex-label', card);
    btn.addEventListener('click', () => {
      const open = !card.classList.contains('is-open');
      card.classList.toggle('is-open', open);
      btn.setAttribute('aria-expanded', String(open));
      body.toggleAttribute('inert', !open);
      label.textContent = open ? label.dataset.openLabel : label.dataset.closedLabel;
    });
  });

  /* Seeded random, so the drawn charts look the same on every load */
  const rng = seed => () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
  const NS = 'http://www.w3.org/2000/svg';
  const el = (tag, attrs) => { const n = document.createElementNS(NS, tag); for (const k in attrs) n.setAttribute(k, attrs[k]); return n; };

  /* Terminal candles */
  $$('[data-candles]').forEach(svg => {
    const W = 720, H = 340, N = 56, r = rng(7);
    let p = 100; const c = [];
    for (let i = 0; i < N; i++) {
      const o = p, drift = 0.18 + Math.sin(i / 9) * 0.9;
      const cl = o + (r() - 0.45) * 3.2 + drift * 0.6;
      c.push({ o, c: cl, h: Math.max(o, cl) + r() * 1.6, l: Math.min(o, cl) - r() * 1.6 });
      p = cl;
    }
    const hi = Math.max(...c.map(k => k.h)), lo = Math.min(...c.map(k => k.l));
    const top = 20, bot = 270, y = v => top + (hi - v) / (hi - lo) * (bot - top);
    const g = el('g', {});
    for (let i = 1; i < 6; i++) g.appendChild(el('line', { x1: 0, x2: W, y1: i * 56, y2: i * 56, stroke: 'rgba(245,244,239,.06)' }));
    for (let i = 1; i < 8; i++) g.appendChild(el('line', { y1: 0, y2: 300, x1: i * 90, x2: i * 90, stroke: 'rgba(245,244,239,.04)' }));
    const step = (W - 40) / N, bw = step * 0.56;
    c.forEach((k, i) => {
      const x = 12 + i * step, up = k.c >= k.o;
      const col = up ? '#FF711D' : '#8a4318';
      g.appendChild(el('line', { x1: x + bw / 2, x2: x + bw / 2, y1: y(k.h), y2: y(k.l), stroke: col, 'stroke-width': 1.2 }));
      const yt = y(Math.max(k.o, k.c)), hgt = Math.max(1.5, Math.abs(y(k.o) - y(k.c)));
      g.appendChild(el('rect', up
        ? { x, y: yt, width: bw, height: hgt, fill: col }
        : { x: x + .6, y: yt, width: bw - 1.2, height: hgt, fill: '#0a0b0b', stroke: col, 'stroke-width': 1.2 }));
      const vh = 6 + r() * 28;
      g.appendChild(el('rect', { x, y: 336 - vh, width: bw, height: vh, fill: up ? 'rgba(255,113,29,.28)' : 'rgba(245,244,239,.08)' }));
    });
    const last = c[c.length - 1].c, ly = y(last);
    g.appendChild(el('line', { x1: 0, x2: W - 62, y1: ly, y2: ly, stroke: '#FF711D', 'stroke-dasharray': '3 4', 'stroke-opacity': .7 }));
    g.appendChild(el('rect', { x: W - 62, y: ly - 10, width: 62, height: 20, rx: 3, fill: '#FF711D' }));
    const t = el('text', { x: W - 31, y: ly + 4, 'text-anchor': 'middle', 'font-size': 11, 'font-family': 'Geist Mono, monospace', fill: '#080909' });
    t.textContent = '2,684.35'; g.appendChild(t);
    svg.appendChild(g);
  });

  /* Phone sparkline */
  $$('[data-spark]').forEach(svg => {
    const r = rng(3), pts = []; let v = 50;
    for (let i = 0; i <= 40; i++) { v += (r() - 0.42) * 7; pts.push([i * 5, Math.max(8, Math.min(82, 90 - v))]); }
    const d = 'M' + pts.map(p => p.join(' ')).join(' L');
    svg.appendChild(el('path', { d: d + ' L200 90 L0 90 Z', fill: 'rgba(255,113,29,.14)' }));
    svg.appendChild(el('path', { d, fill: 'none', stroke: '#FF711D', 'stroke-width': 1.6, 'vector-effect': 'non-scaling-stroke' }));
  });



  /* Photo cards: live price in the render's blank display; an optional needle follows the change vs the open */
  $$('[data-live]').forEach(win => {
    const sq = win.closest('.ph-sq'), pxEl = $('[data-live-px]', win), chgEl = $('[data-live-chg]', win), needle = $('[data-live-needle]', sq);
    const open = Number(win.dataset.open), dec = Number(win.dataset.dec || 2), vol = Number(win.dataset.vol || 0.0004);
    const fmt = new Intl.NumberFormat('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec });
    let px = Number(win.dataset.price);
    const draw = () => {
      const pct = (px - open) / open * 100;
      pxEl.textContent = fmt.format(px);
      chgEl.textContent = (pct >= 0 ? '▲ ' : '▼ ') + Math.abs(pct).toFixed(2) + '%';
      chgEl.className = pct >= 0 ? 'up' : 'dn';
      if (needle) needle.style.setProperty('--a', Math.max(-120, Math.min(120, pct * 220)).toFixed(1) + 'deg');
    };
    draw();
    if (!reduce()) setInterval(() => { if (document.hidden) return; px *= 1 + (Math.random() - 0.5) * vol; draw(); }, 2200 + Math.random() * 600);
  });

  /* Account tier toggle (minimal page): tabs pattern with arrow keys */
  $$('[data-tiers]').forEach(list => {
    const tabs = $$('[role="tab"]', list);
    const pick = t => tabs.forEach(x => {
      const on = x === t;
      x.setAttribute('aria-selected', String(on)); x.tabIndex = on ? 0 : -1;
      document.getElementById(x.getAttribute('aria-controls')).hidden = !on;
    });
    tabs.forEach((t, i) => {
      t.addEventListener('click', () => pick(t));
      t.addEventListener('keydown', e => {
        if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
        const n = tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length]; n.focus(); pick(n);
      });
    });
  });

  /* Card slider: arrows scroll by one card, disabled at the ends; swipe and trackpad scroll natively */
  $$('[data-slider]').forEach(sl => {
    const track = $('.slider-track', sl), prev = $('[data-slide="-1"]', sl), next = $('[data-slide="1"]', sl);
    const step = () => { const li = track.firstElementChild; return li ? li.getBoundingClientRect().width + 16 : track.clientWidth; };
    const sync = () => { prev.disabled = track.scrollLeft <= 4; next.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 4; };
    prev.addEventListener('click', () => track.scrollBy({ left: -step(), behavior: reduce() ? 'auto' : 'smooth' }));
    next.addEventListener('click', () => track.scrollBy({ left: step(), behavior: reduce() ? 'auto' : 'smooth' }));
    track.addEventListener('scroll', sync, { passive: true }); window.addEventListener('resize', sync); sync();
  });

  /* Minimal page: platform feature list switches the phone screen and advances on its own */
  $$('[data-feat]').forEach(box => {
    const items = $$('.feat-item', box), panes = $$('[data-pane]', box);
    let cur = 0;
    const show = i => {
      cur = i;
      items.forEach((x, j) => { const on = j === i; x.classList.toggle('is-open', on); $('button', x).setAttribute('aria-expanded', String(on)); $('p', x).hidden = !on; });
      panes.forEach(p => p.classList.toggle('is-on', p.dataset.pane === String(i + 1)));
    };
    items.forEach((it, i) => $('button', it).addEventListener('click', () => { box.classList.remove('is-auto'); show(i); }));
    if (!reduce() && 'IntersectionObserver' in window) {
      const io = new IntersectionObserver(([en]) => { if (en.isIntersecting) { io.disconnect(); box.classList.add('is-auto'); } }, { threshold: 0.4 });
      io.observe(box);
      box.addEventListener('animationend', e => { if (e.animationName === 'feat-fill' && box.classList.contains('is-auto')) show((cur + 1) % items.length); });
    }
  });

  /* Accounts (minimal page): card fan, tier switch and comparison columns stay in sync */
  $$('[data-acc]').forEach(root => {
    const order = ['classic', 'premium', 'elite', 'private'];
    const cards = $$('.tcard', root), radios = $$('[data-pick]', root), cols = $$('[data-col]', root), stage = $('.acc-stage', root);
    const set = (k, focus) => {
      const ai = order.indexOf(k);
      cards.forEach(c => {
        const o = order.indexOf(c.dataset.card) - ai;
        c.style.setProperty('--o', o); c.style.setProperty('--a', Math.abs(o));
        c.classList.toggle('is-on', o === 0);
        if (o) ['--rx', '--ry', '--sx'].forEach(v => c.style.removeProperty(v));
      });
      radios.forEach(r => { const on = r.dataset.pick === k; r.setAttribute('aria-checked', String(on)); r.tabIndex = on ? 0 : -1; if (on && focus) r.focus(); });
      cols.forEach(c => c.classList.toggle('is-on', c.dataset.col === k));
      root.dataset.active = k;
    };
    radios.forEach((r, i) => {
      r.addEventListener('click', () => set(r.dataset.pick));
      r.addEventListener('keydown', e => {
        if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
        e.preventDefault(); set(order[(i + (e.key === 'ArrowRight' ? 1 : order.length - 1)) % order.length], true);
      });
    });
    cards.forEach(c => c.addEventListener('click', () => set(c.dataset.card)));
    $$('thead [data-col]', root).forEach(h => h.addEventListener('click', () => set(h.dataset.col)));
    set(root.dataset.active || 'elite');
    if (!reduce() && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      stage.addEventListener('pointermove', e => {
        const c = $('.tcard.is-on', stage); if (!c) return;
        const b = stage.getBoundingClientRect(), x = (e.clientX - b.left) / b.width - 0.5, y = (e.clientY - b.top) / b.height - 0.5;
        stage.classList.add('is-tilting');
        c.style.setProperty('--ry', (x * 16).toFixed(2) + 'deg'); c.style.setProperty('--rx', (-y * 12).toFixed(2) + 'deg'); c.style.setProperty('--sx', (50 + x * 80).toFixed(1) + '%');
      });
      stage.addEventListener('pointerleave', () => { stage.classList.remove('is-tilting'); cards.forEach(c => ['--rx', '--ry', '--sx'].forEach(v => c.style.removeProperty(v))); });
    }
  });

  /* Exclusive card tilt */
  $$('.ex-head').forEach(stage => {
    if (reduce() || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    const c = $('.plate-ex', stage); if (!c) return;
    stage.addEventListener('pointermove', e => {
      const b = stage.getBoundingClientRect(), x = (e.clientX - b.left) / b.width - 0.5, y = (e.clientY - b.top) / b.height - 0.5;
      stage.classList.add('is-tilting');
      c.style.setProperty('--ry', (x * 14).toFixed(2) + 'deg'); c.style.setProperty('--rx', (-y * 12).toFixed(2) + 'deg'); c.style.setProperty('--sx', (50 + x * 80).toFixed(1) + '%');
    });
    stage.addEventListener('pointerleave', () => { stage.classList.remove('is-tilting'); ['--rx', '--ry', '--sx'].forEach(v => c.style.removeProperty(v)); });
  });

  /* Accounts layout switch (minimal page): Plasma columns or card fan + comparison */
  $$('[data-accv-root]').forEach(root => {
    const btns = $$('[data-accv]');
    const set = v => { root.dataset.v = v; btns.forEach(b => { const on = b.dataset.accv === v; b.setAttribute('aria-checked', String(on)); b.tabIndex = on ? 0 : -1; }); };
    btns.forEach((b, i) => {
      b.addEventListener('click', () => set(b.dataset.accv));
      b.addEventListener('keydown', e => { if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { const n = btns[(i + 1) % btns.length]; n.focus(); set(n.dataset.accv); } });
    });
    set('a');
  });

  /* Markets review switch: ?markets=a|b|c keeps the chosen layout in the link */
  const mkRoot = $('[data-mk-root]');
  if (mkRoot) {
    const btns = $$('[data-mk]');
    const set = (v, write) => {
      mkRoot.dataset.variant = v;
      btns.forEach(b => { const on = b.dataset.mk === v; b.setAttribute('aria-checked', String(on)); b.tabIndex = on ? 0 : -1; });
      if (write) { const u = new URL(location.href); u.searchParams.set('markets', v); history.replaceState(null, '', u); }
    };
    btns.forEach((b, i) => {
      b.addEventListener('click', () => set(b.dataset.mk, true));
      b.addEventListener('keydown', e => {
        if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
        const n = btns[(i + (e.key === 'ArrowRight' ? 1 : btns.length - 1)) % btns.length];
        n.focus(); set(n.dataset.mk, true);
      });
    });
    const q = new URLSearchParams(location.search).get('markets');
    set(['a', 'b', 'c'].includes(q) ? q : 'a', false);
  }

  /* C · Expand: click, Enter or a short hover opens a market; geometry morphs via View Transitions */
  const mkc = $('[data-mkc]');
  if (mkc) {
    const items = $$('.mkc-item', mkc);
    items.forEach((it, i) => { it.style.viewTransitionName = 'mkc-' + i; });
    let busy = false;
    const open = item => {
      if (item.classList.contains('is-open')) return;
      const apply = () => items.forEach(it => {
        const on = it === item;
        it.classList.toggle('is-open', on);
        $('.mkc-tab', it).setAttribute('aria-expanded', String(on));
        $('.mkc-panel', it).hidden = !on;
      });
      if (document.startViewTransition && !reduce() && !busy && window.innerWidth > 1100) {
        busy = true;
        document.startViewTransition(apply).finished.finally(() => { busy = false; });
      } else apply();
    };
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)');
    items.forEach(it => {
      $('.mkc-tab', it).addEventListener('click', () => open(it));
      let t;
      it.addEventListener('mouseenter', () => { if (fine.matches && window.innerWidth > 1100) t = setTimeout(() => open(it), 160); });
      it.addEventListener('mouseleave', () => clearTimeout(t));
    });
  }

  /* B · Live preview charts: one accent per chart, neutral down candles */
  $$('[data-wchart]').forEach(svg => {
    const r = rng(Number(svg.dataset.seed) || 1), W = 320, H = 120;
    for (let i = 1; i < 4; i++) svg.appendChild(el('line', { x1: 0, x2: W, y1: i * 30, y2: i * 30, stroke: 'rgba(237,237,234,.06)' }));
    if (svg.dataset.wchart === 'line') {
      let v = 0; const raw = [];
      for (let i = 0; i <= 48; i++) { v += (r() - 0.44) * 9; raw.push(v); }
      const lo = Math.min(...raw), hi = Math.max(...raw), pts = raw.map((n, i) => [i * W / 48, H - 12 - (n - lo) / (hi - lo || 1) * (H - 24)]);
      svg.appendChild(el('path', { d: 'M' + pts.map(p => p.map(n => n.toFixed(1)).join(' ')).join(' L'), fill: 'none', stroke: '#FF711D', 'stroke-width': 1.75, 'stroke-linejoin': 'round', 'vector-effect': 'non-scaling-stroke' }));
    } else {
      let p = 0; const N = 28, step = W / N, bw = step * 0.56, ks = [];
      for (let i = 0; i < N; i++) { const o = p, c = o + (r() - 0.42) * 12; ks.push({ o, c, h: Math.max(o, c) + r() * 6, l: Math.min(o, c) - r() * 6 }); p = c; }
      const lo = Math.min(...ks.map(k => k.l)), hi = Math.max(...ks.map(k => k.h));
      for (let i = 0; i < N; i++) {
        const { o, c, h, l } = ks[i];
        const y = v => H - 8 - (v - lo) / (hi - lo || 1) * (H - 16), up = c >= o, x = i * step + (step - bw) / 2;
        const col = up ? '#FF711D' : '#5f5e59';
        svg.appendChild(el('line', { x1: x + bw / 2, x2: x + bw / 2, y1: y(h), y2: y(l), stroke: col, 'stroke-width': 1, 'vector-effect': 'non-scaling-stroke' }));
        svg.appendChild(el('rect', { x, y: y(Math.max(o, c)), width: bw, height: Math.max(1.5, Math.abs(y(o) - y(c))), fill: col }));
      }
    }
  });

  /* Markets timing tower: tab filter, re-numbered positions, leader highlight */
  $$('[data-tower]').forEach(tower => {
    const tabs = $$('[role="tab"]', tower), rows = $$('tbody tr', tower);
    const apply = f => {
      let n = 0;
      rows.forEach(r => {
        const show = r.dataset.cat.split(' ').includes(f);
        r.hidden = !show;
        r.classList.toggle('lead', show && n === 0);
        const pos = $('.c-pos b', r); if (show) { n++; if (pos) pos.textContent = 'P' + n; }
      });
      tabs.forEach(t => t.setAttribute('aria-selected', String(t.dataset.filter === f)));
    };
    tabs.forEach(t => t.addEventListener('click', () => apply(t.dataset.filter)));
    apply('pop');
  });
  $$('[data-spark-row]').forEach(svg => {
    const r = rng(Number(svg.dataset.sparkRow)), down = svg.hasAttribute('data-down');
    let v = 14; const pts = [];
    for (let i = 0; i <= 24; i++) { v += (r() - 0.5) * 6 + (down ? 0.25 : -0.25); v = Math.max(4, Math.min(24, v)); pts.push([i * 100 / 24, v]); }
    svg.appendChild(el('path', { d: 'M' + pts.map(p => p.join(' ')).join(' L'), fill: 'none', stroke: down ? '#FF5A4E' : '#3FD17A', 'stroke-width': 1.5, 'vector-effect': 'non-scaling-stroke' }));
  });

  /* Watchlist ticks (illustrative quotes, flagged as placeholders) */
  const quotes = $$('[data-q]');
  if (quotes.length && !reduce()) {
    const fmt = (v, ref) => {
      const dec = (ref.split('.')[1] || '').length;
      return new Intl.NumberFormat('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec }).format(v);
    };
    setInterval(() => {
      if (document.hidden) return;
      const q = quotes[Math.floor(Math.random() * quotes.length)];
      const base = Number(q.dataset.q), cur = Number(q.dataset.v || base);
      const next = cur * (1 + (Math.random() - 0.5) * 0.0012);
      q.dataset.v = next;
      q.textContent = fmt(next, q.dataset.q);
      q.classList.remove('tick-up', 'tick-dn');
      void q.offsetWidth;
      q.classList.add(next >= cur ? 'tick-up' : 'tick-dn');
      setTimeout(() => q.classList.remove('tick-up', 'tick-dn'), 500);
    }, 1400);
  }

  /* Hero: sparks from the plank + light streaks. Pauses off-screen and in hidden tabs. */
  const canvas = $('.hero-fx'), car = $('.hero-car');
  if (canvas && car && canvas.getContext) {
    const ctx = canvas.getContext('2d');
    let W = 0, H = 0, em = [], running = false, visible = true, raf = 0;
    const sparks = [], streaks = [];
    const small = () => W < 680;

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const r = canvas.getBoundingClientRect();
      W = r.width; H = r.height;
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const c = car.getBoundingClientRect();
      const map = (vx, vy) => ({ x: c.left - r.left + c.width * vx / 1000, y: c.top - r.top + c.height * vy / 260 });
      em = [map(330, 204), map(560, 201)];
      streaks.length = 0;
      const n = small() ? 6 : 14;
      for (let i = 0; i < n; i++) streaks.push(newStreak(true));
    }
    function newStreak(anywhere) {
      const far = Math.random() < 0.55;
      return {
        x: anywhere ? Math.random() * W : W + Math.random() * W * 0.4,
        y: H * (far ? 0.6 + Math.random() * 0.14 : 0.78 + Math.random() * 0.2),
        len: (far ? 40 : 160) + Math.random() * (far ? 120 : 380),
        v: (far ? 4 : 16) + Math.random() * (far ? 6 : 22),
        a: (far ? 0.25 : 0.12) + Math.random() * 0.25,
        warm: Math.random() < 0.7
      };
    }
    function spawn() {
      const n = (small() ? 1 : 3) + (Math.random() < 0.05 ? 10 : 0);
      for (let i = 0; i < n; i++) {
        const e = em[Math.random() < 0.6 ? 0 : 1];
        sparks.push({ x: e.x + (Math.random() - 0.5) * 30, y: e.y, vx: -(5 + Math.random() * 16), vy: -(0.4 + Math.random() * 4.2), life: 0, max: 24 + Math.random() * 46, w: 0.8 + Math.random() * 1.4 });
      }
      if (sparks.length > 420) sparks.splice(0, sparks.length - 420);
    }
    function frame() {
      ctx.clearRect(0, 0, W, H);
      ctx.globalCompositeOperation = 'lighter';
      for (const s of streaks) {
        s.x -= s.v;
        if (s.x + s.len < 0) Object.assign(s, newStreak(false));
        const g = ctx.createLinearGradient(s.x, 0, s.x + s.len, 0);
        const col = s.warm ? '255,113,29' : '245,244,239';
        g.addColorStop(0, `rgba(${col},${s.a})`); g.addColorStop(1, `rgba(${col},0)`);
        ctx.strokeStyle = g; ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.moveTo(s.x, s.y); ctx.lineTo(s.x + s.len, s.y); ctx.stroke();
      }
      const e = em[0];
      const flick = 0.55 + Math.random() * 0.25;
      const glow = ctx.createRadialGradient(e.x, e.y, 0, e.x, e.y, 160);
      glow.addColorStop(0, `rgba(255,150,60,${0.35 * flick})`); glow.addColorStop(1, 'rgba(255,113,29,0)');
      ctx.fillStyle = glow; ctx.fillRect(e.x - 160, e.y - 160, 320, 320);
      spawn();
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        s.life++; s.vy += 0.22; s.vx *= 0.985; s.x += s.vx; s.y += s.vy;
        if (s.y > e.y + 26 && s.vy > 0) { s.vy *= -0.32; s.y = e.y + 26; }
        const k = 1 - s.life / s.max;
        if (k <= 0) { sparks.splice(i, 1); continue; }
        ctx.strokeStyle = `hsla(${26 + k * 18},100%,${55 + k * 25}%,${k})`;
        ctx.lineWidth = s.w;
        ctx.beginPath(); ctx.moveTo(s.x, s.y); ctx.lineTo(s.x - s.vx * 1.6, s.y - s.vy * 1.6); ctx.stroke();
      }
      ctx.globalCompositeOperation = 'source-over';
      if (running) raf = requestAnimationFrame(frame);
    }
    const start = () => { booted = true; if (running || reduce() || !visible || document.hidden) return; running = true; raf = requestAnimationFrame(frame); };
    const stop = () => { running = false; cancelAnimationFrame(raf); };
    const still = () => { stop(); for (let i = 0; i < 40; i++) frame(); };

    resize();
    let rt; window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(resize, 150); });
    let booted = false;
    new IntersectionObserver(([en]) => { visible = en.isIntersecting; if (!booted) return; visible ? start() : stop(); }).observe(canvas);
    document.addEventListener('visibilitychange', () => document.hidden ? stop() : start());
    mqReduce.addEventListener?.('change', () => reduce() ? still() : start());
    // Start after load + idle so the sparks never compete with first paint.
    const boot = () => (window.requestIdleCallback || setTimeout)(() => reduce() ? still() : start(), { timeout: 1500 });
    document.readyState === 'complete' ? boot() : window.addEventListener('load', boot, { once: true });
  }
})();
