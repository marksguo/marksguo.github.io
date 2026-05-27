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
    '.project, .job, .skill-block, .coursework, .profile-card, .contact-card, .now-box, .metric-card, .section-head, .timeline'
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
