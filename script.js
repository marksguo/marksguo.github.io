/* ================================================================
   marks guo — portfolio interactions
   ================================================================ */

document.getElementById('year').textContent = new Date().getFullYear();

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- cursor glow ---------- */
(function cursorGlow() {
  const glow = document.querySelector('.cursor-glow');
  if (!glow || prefersReducedMotion) return;

  let mx = window.innerWidth / 2, my = window.innerHeight / 2;
  let cx = mx, cy = my;
  let visible = false;

  window.addEventListener('mousemove', (e) => {
    mx = e.clientX;
    my = e.clientY;
    if (!visible) {
      glow.style.opacity = 1;
      visible = true;
    }
  });
  window.addEventListener('mouseleave', () => {
    glow.style.opacity = 0;
    visible = false;
  });

  function tick() {
    cx += (mx - cx) * 0.12;
    cy += (my - cy) * 0.12;
    glow.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;
    requestAnimationFrame(tick);
  }
  tick();
})();

/* ---------- magnetic buttons ---------- */
(function magnetic() {
  if (prefersReducedMotion) return;
  document.querySelectorAll('.magnetic').forEach((el) => {
    el.addEventListener('mousemove', (e) => {
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      el.style.transform = `translate(${dx * 0.18}px, ${dy * 0.22}px)`;
    });
    el.addEventListener('mouseleave', () => {
      el.style.transform = '';
    });
  });
})();

/* ---------- nav indicator + active section ---------- */
(function navIndicator() {
  const links = document.querySelectorAll('.nav-links a[data-section]');
  const indicator = document.getElementById('navIndicator');
  if (!indicator || !links.length) return;

  function moveTo(el) {
    if (!el) {
      indicator.style.opacity = 0;
      return;
    }
    const wrap = el.parentElement.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    indicator.style.opacity = 1;
    indicator.style.width = r.width + 'px';
    indicator.style.transform = `translate(${r.left - wrap.left}px, -50%)`;
  }

  let activeEl = null;
  links.forEach((a) => {
    a.addEventListener('mouseenter', () => moveTo(a));
  });
  document.querySelector('.nav-links').addEventListener('mouseleave', () => {
    moveTo(activeEl);
  });

  // active section detection via IntersectionObserver
  const sections = document.querySelectorAll('section[id]');
  const sectionMap = new Map();
  links.forEach((a) => {
    const id = a.getAttribute('data-section');
    sectionMap.set(id, a);
  });

  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        const id = e.target.id;
        const link = sectionMap.get(id);
        links.forEach((l) => l.classList.remove('active'));
        if (link) {
          link.classList.add('active');
          activeEl = link;
          moveTo(link);
        }
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px' });

  sections.forEach((s) => io.observe(s));

  window.addEventListener('resize', () => moveTo(activeEl));
})();

/* ---------- number count-up ---------- */
(function countUp() {
  const stats = document.querySelectorAll('.stat-num[data-target]');
  if (!stats.length) return;

  function animate(el) {
    const target = parseFloat(el.dataset.target);
    const decimals = parseInt(el.dataset.decimals || '0', 10);
    const suffix = el.dataset.suffix || '';
    const dur = 1500;
    const start = performance.now();
    const startVal = 0;

    function step(now) {
      const t = Math.min((now - start) / dur, 1);
      // easeOutCubic
      const e = 1 - Math.pow(1 - t, 3);
      const val = startVal + (target - startVal) * e;
      el.textContent = (decimals ? val.toFixed(decimals) : Math.floor(val).toLocaleString()) + suffix;
      if (t < 1) requestAnimationFrame(step);
      else el.textContent = (decimals ? target.toFixed(decimals) : Math.floor(target).toLocaleString()) + suffix;
    }
    requestAnimationFrame(step);
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        animate(e.target);
        io.unobserve(e.target);
      }
    });
  }, { threshold: .5 });

  stats.forEach((s) => io.observe(s));
})();

/* ---------- scroll reveal for sections/cards ---------- */
(function scrollReveal() {
  const targets = document.querySelectorAll(
    '.project, .job, .skill-block, .coursework, .profile-card, .contact-card, .now-box, .metric-card, .section-head, .timeline, .personal-card, .live-card'
  );
  targets.forEach((el) => el.classList.add('observe'));

  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add('in-view');
        io.unobserve(e.target);
      }
    });
  }, { threshold: .12, rootMargin: '0px 0px -40px 0px' });

  targets.forEach((el) => io.observe(el));
})();

/* ---------- sparkline draw-in ---------- */
(function sparklineDraw() {
  const sparks = document.querySelectorAll('.spark');
  if (!sparks.length) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach((e, i) => {
      if (e.isIntersecting) {
        // stagger
        setTimeout(() => e.target.classList.add('drawn'), i * 90);
        io.unobserve(e.target);
      }
    });
  }, { threshold: .4 });

  sparks.forEach((s) => io.observe(s));
})();

/* ---------- subtle nav shadow on scroll ---------- */
(function navShadow() {
  const nav = document.querySelector('.nav');
  if (!nav) return;
  function onScroll() {
    if (window.scrollY > 8) nav.style.boxShadow = '0 10px 30px -18px rgba(0,0,0,.7)';
    else nav.style.boxShadow = '';
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

/* ---------- scroll progress bar + back-to-top ---------- */
(function scrollUI() {
  const bar = document.querySelector('.scroll-progress');
  const toTop = document.getElementById('toTop');
  function onScroll() {
    const st = window.scrollY;
    const docH = document.documentElement.scrollHeight - window.innerHeight;
    const p = docH > 0 ? st / docH : 0;
    if (bar) bar.style.transform = `scaleX(${p.toFixed(4)})`;
    if (toTop) toTop.classList.toggle('show', st > 500);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  if (toTop) toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
})();

/* ---------- interactive particle constellation ---------- */
(function particles() {
  const canvas = document.querySelector('.bg-canvas');
  if (!canvas || prefersReducedMotion) return;
  const ctx = canvas.getContext('2d');

  let w, h, dpr, nodes = [], raf = null, paused = false;
  const mouse = { x: -9999, y: -9999 };

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    w = canvas.width = Math.floor(window.innerWidth * dpr);
    h = canvas.height = Math.floor(window.innerHeight * dpr);
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    const count = Math.min(70, Math.floor((window.innerWidth * window.innerHeight) / 22000));
    nodes = [];
    for (let i = 0; i < count; i++) {
      nodes.push({
        x: Math.random() * w, y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.18 * dpr,
        vy: (Math.random() - 0.5) * 0.18 * dpr,
        r: (Math.random() * 1.5 + 0.6) * dpr,
      });
    }
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);
    const maxD = 140 * dpr;

    for (const n of nodes) {
      n.x += n.vx; n.y += n.vy;
      if (n.x < 0 || n.x > w) n.vx *= -1;
      if (n.y < 0 || n.y > h) n.vy *= -1;
      // gentle cursor repulsion
      const dxm = n.x - mouse.x, dym = n.y - mouse.y;
      const dm = Math.hypot(dxm, dym);
      if (dm < 150 * dpr && dm > 0.01) { n.x += (dxm / dm) * 0.7; n.y += (dym / dm) * 0.7; }
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(163,157,184,.5)';
      ctx.fill();
    }

    // links between nodes
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const d = Math.hypot(dx, dy);
        if (d < maxD) {
          ctx.strokeStyle = 'rgba(139,128,255,' + ((1 - d / maxD) * 0.22).toFixed(3) + ')';
          ctx.lineWidth = dpr * 0.6;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }
    }

    // links to cursor
    const maxC = 170 * dpr;
    for (const n of nodes) {
      const dx = n.x - mouse.x, dy = n.y - mouse.y, d = Math.hypot(dx, dy);
      if (d < maxC) {
        ctx.strokeStyle = 'rgba(255,126,107,' + ((1 - d / maxC) * 0.4).toFixed(3) + ')';
        ctx.lineWidth = dpr * 0.7;
        ctx.beginPath();
        ctx.moveTo(n.x, n.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke();
      }
    }

    raf = requestAnimationFrame(draw);
  }

  // fade + pause once scrolled past the hero
  function onScroll() {
    const fade = window.innerHeight * 0.9;
    const op = Math.max(0, 1 - window.scrollY / fade);
    canvas.style.opacity = (op * 0.55).toFixed(3);
    const shouldPause = op <= 0.02;
    if (shouldPause && !paused) { paused = true; if (raf) { cancelAnimationFrame(raf); raf = null; } }
    else if (!shouldPause && paused) { paused = false; if (!raf) draw(); }
  }

  window.addEventListener('mousemove', (e) => { mouse.x = e.clientX * dpr; mouse.y = e.clientY * dpr; });
  window.addEventListener('mouseleave', () => { mouse.x = -9999; mouse.y = -9999; });
  window.addEventListener('resize', resize, { passive: true });
  window.addEventListener('scroll', onScroll, { passive: true });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { if (raf) { cancelAnimationFrame(raf); raf = null; } }
    else if (!raf && !paused) draw();
  });

  resize();
  onScroll();
  draw();
})();

/* ---------- market radar ticker ---------- */
(function ticker() {
  const track = document.getElementById('tickerTrack');
  if (!track) return;
  // live paper-book holdings vs the broader tracked universe (from Market Radar config)
  const held = new Set(['NVDA', 'MU', 'AVGO', 'TSM', 'VOO', 'XLV', 'XLF', 'XLE', 'NBIS', 'VRT', 'IREN', 'BE', 'SMCI']);
  const universe = ['NVDA', 'AMD', 'TSM', 'AVGO', 'MU', 'MSFT', 'GOOGL', 'AMZN', 'META', 'AAPL', 'TSLA',
    'SMCI', 'PLTR', 'DELL', 'VRT', 'ARM', 'ASML', 'INTC', 'NBIS', 'IREN', 'CRWV', 'HOOD', 'BE', 'MSTR',
    'MRVL', 'LRCX', 'AMAT', 'APLD', 'IGV', 'ACN', 'CRM', 'ABNB', 'NOW', 'RDDT', 'TEM', 'NFLX', 'IBM',
    'IONQ', 'QBTS', 'RGTI', 'QUBT'];

  function build() {
    let html = '<span class="ticker-item lead"><span class="pulse-dot mini"></span>MARKET&nbsp;RADAR ' +
      '<span class="tk-note">tracked&nbsp;universe &middot; &#9670;&nbsp;in&nbsp;paper&nbsp;book</span></span>';
    universe.forEach((sym) => {
      const h = held.has(sym);
      html += `<span class="ticker-item${h ? ' held' : ''}">` +
        (h ? '<span class="tk-mark">&#9670;</span>' : '') +
        `<span class="tk-sym">${sym}</span></span>`;
    });
    return html;
  }
  track.innerHTML = build() + build(); // duplicate for a seamless loop
})();

/* ---------- animated gradient border on cards (hover) ---------- */
(function cardBeam() {
  if (prefersReducedMotion) return;
  const cards = document.querySelectorAll(
    '.project, .personal-card, .contact-card, .skill-block, .job, .live-card'
  );
  cards.forEach((card) => {
    card.classList.add('beam-host');
    const beam = document.createElement('i');
    beam.className = 'beam';
    beam.setAttribute('aria-hidden', 'true');
    card.appendChild(beam);
  });
})();

/* ---------- staggered reveal for grid children ---------- */
(function stagger() {
  const groups = document.querySelectorAll(
    '.personal-grid, .skills-grid, .contact-grid, .project-viz.horizontal'
  );
  groups.forEach((g) => {
    Array.from(g.children).forEach((child, i) => {
      child.style.transitionDelay = (i * 60) + 'ms';
    });
  });
})();
