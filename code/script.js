/* =============================================
   LENS & LIGHT — Photography Portfolio
   script.js
============================================= */

'use strict';

/* ---- Lazy Load Gallery Images ---- */
// 把 data-bg 属性延迟赋值给 background-image，减少首屏请求
document.querySelectorAll('.gallery-img[style*="background-image"]:not(.hero-img)').forEach(el => {
  const bg = el.style.backgroundImage;
  el.style.backgroundImage = '';
  el.dataset.bg = bg;
});

const bgObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      if (el.dataset.bg) {
        el.style.backgroundImage = el.dataset.bg;
        delete el.dataset.bg;
      }
      bgObserver.unobserve(el);
    }
  });
}, { rootMargin: '200px 0px' });

// 只观察被转成 data-bg 的节点；<img class="gallery-img"> 走原生 loading="lazy"
document.querySelectorAll('.gallery-img[data-bg]').forEach(el => bgObserver.observe(el));

/* ---- Preloader ---- */
const hidePreloader = () => {
  const preloader = document.getElementById('preloader');
  if (!preloader || preloader.classList.contains('hidden')) return;
  preloader.classList.add('hidden');
  document.querySelectorAll('.hero .reveal').forEach((el, i) => {
    setTimeout(() => el.classList.add('visible'), 200 + i * 150);
  });
};

window.addEventListener('load', () => {
  setTimeout(hidePreloader, 800);
});

// 最多等 3 秒，强制关闭
setTimeout(hidePreloader, 3000);

/* ---- Custom Cursor ---- */
const cursor = document.getElementById('cursor');
const cursorFollower = document.getElementById('cursorFollower');

if (cursor && cursorFollower) {
  let mouseX = 0, mouseY = 0;
  let followerX = 0, followerY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursor.style.left = mouseX + 'px';
    cursor.style.top = mouseY + 'px';
  });

  const animateFollower = () => {
    followerX += (mouseX - followerX) * 0.1;
    followerY += (mouseY - followerY) * 0.1;
    cursorFollower.style.left = followerX + 'px';
    cursorFollower.style.top = followerY + 'px';
    requestAnimationFrame(animateFollower);
  };
  animateFollower();
}

/* ---- Nav Dropdown Mobile Toggle ---- */
document.querySelectorAll('.nav-item .nav-link').forEach(link => {
  link.addEventListener('click', (e) => {
    if (window.innerWidth <= 768) {
      e.preventDefault();
      link.closest('.nav-item').classList.toggle('open');
    }
  });
});

/* ---- Navigation ---- */
const nav = document.getElementById('nav');
const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');

// Scroll effect
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

// Mobile toggle
navToggle?.addEventListener('click', () => {
  navToggle.classList.toggle('active');
  navMenu.classList.toggle('open');
});

// Close menu on link click
navMenu?.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    navToggle.classList.remove('active');
    navMenu.classList.remove('open');
  });
});

// Close menu on backdrop click
document.addEventListener('click', (e) => {
  if (navMenu?.classList.contains('open') &&
      !navMenu.contains(e.target) &&
      !navToggle.contains(e.target)) {
    navToggle.classList.remove('active');
    navMenu.classList.remove('open');
  }
});

/* ---- Hero Slideshow ---- */
const heroImgs = document.querySelectorAll('.hero-img');
const heroCounter = document.getElementById('heroCounter');
let currentSlide = 0;

const showSlide = (idx) => {
  heroImgs.forEach(img => img.classList.remove('active'));
  heroImgs[idx].classList.add('active');
  if (heroCounter) {
    heroCounter.textContent = String(idx + 1).padStart(2, '0');
  }
};

if (heroImgs.length > 0) {
  showSlide(0);
  setInterval(() => {
    currentSlide = (currentSlide + 1) % heroImgs.length;
    showSlide(currentSlide);
  }, 5000);
}

/* ---- Series Hero Slideshow（系列页 hero 轮播本页图片） ---- */
// 首页也有一个 #gallery，但没有 .series-hero，所以这个守卫是必需的。
const seriesHero = document.querySelector('.series-hero');
const seriesHeroBg = seriesHero && seriesHero.querySelector('.series-hero-bg');

if (seriesHeroBg) {
  // 图源直接取本页画廊，不另建清单：以后往画廊加图，hero 自动跟着变。
  const sources = Array.from(document.querySelectorAll('#gallery .gallery-img'))
    .map(el => el.getAttribute('src'))
    .filter(Boolean);

  // 一轮 = 淡入时长 + 静止时长。原来 1200 + 5000 = 6200ms，现整体减半。
  const FADE_MS = 1200;
  const PERIOD_MS = 3100;
  const HOLD_MS = PERIOD_MS - FADE_MS;
  const prefersReducedMotion =
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 不足两张就没得轮播；reduced-motion 时静态显示内联背景那张
  if (sources.length >= 2 && !prefersReducedMotion) {
    const makeLayer = () => {
      const img = document.createElement('img');
      img.className = 'series-hero-slide';
      img.alt = '';
      img.setAttribute('aria-hidden', 'true');  // 是画廊图的装饰性重复
      img.decoding = 'async';
      seriesHeroBg.appendChild(img);
      return img;
    };

    const layers = [makeLayer(), makeLayer()];
    let front = 0;     // layers 里的当前可见层下标
    let index = 0;     // 当前图片下标
    let timer = null;
    let busy = false;

    // 首帧：内联背景已经是 sources[0]，让底层不透明地盖上即可，不做淡入
    layers[0].src = sources[0];
    layers[0].classList.add('is-front', 'no-fade');
    void layers[0].offsetWidth;
    layers[0].classList.remove('no-fade');

    const pause = () => {
      clearTimeout(timer);
      timer = null;
    };

    const schedule = () => {
      pause();
      if (document.hidden) return;
      timer = setTimeout(advance, HOLD_MS);
    };

    const advance = async () => {
      if (busy) { schedule(); return; }
      busy = true;

      index = (index + 1) % sources.length;
      const outgoing = layers[front];
      const incoming = layers[1 - front];

      try {
        incoming.src = sources[index];
        await incoming.decode();   // 解码完再淡入，避免首帧掉帧
      } catch (err) {
        busy = false;              // 单张图 404 / 解码失败不该让整条链死掉
        schedule();
        return;
      }

      // 旧图保持不透明、降到下层；新图从 0 淡入到 1。
      // 整个淡入过程底层始终不透明，父级内联背景透不出来。
      outgoing.classList.replace('is-front', 'is-under');
      incoming.classList.remove('no-fade');
      void incoming.offsetWidth;   // 重新武装 transition
      incoming.classList.add('is-front');

      let settled = false;
      const finish = () => {
        if (settled) return;
        settled = true;
        incoming.removeEventListener('transitionend', onFadeEnd);
        clearTimeout(guard);
        // 新图已完全不透明，此时把旧图瞬时归零（禁用过渡，不产生动画）
        outgoing.classList.add('no-fade');
        outgoing.classList.remove('is-under');
        void outgoing.offsetWidth;
        front = 1 - front;
        busy = false;
        schedule();
      };
      const onFadeEnd = (e) => {
        if (e.target === incoming && e.propertyName === 'opacity') finish();
      };
      incoming.addEventListener('transitionend', onFadeEnd);
      // 兜底：transitionend 在后台标签页可能被推迟甚至不触发
      const guard = setTimeout(finish, FADE_MS + 400);
    };

    // 悬停 / 键盘聚焦 / 切到后台时暂停，移开或切回继续
    seriesHero.addEventListener('mouseenter', pause);
    seriesHero.addEventListener('mouseleave', schedule);
    seriesHero.addEventListener('focusin', pause);
    seriesHero.addEventListener('focusout', schedule);
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) pause(); else schedule();
    });

    schedule();
  }
}

/* ---- Scroll Reveal ---- */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      // Don't unobserve so re-entry works, but for perf we can:
      revealObserver.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.12,
  rootMargin: '0px 0px -60px 0px'
});

// Observe all reveal elements EXCEPT hero (hero handled by preloader)
document.querySelectorAll('.reveal:not(.hero .reveal)').forEach(el => {
  revealObserver.observe(el);
});

/* ---- Staggered Gallery Reveal ---- */
const galleryItems = document.querySelectorAll('.gallery-item');
const galleryObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      const items = entry.target.closest('#gallery')?.querySelectorAll('.gallery-item') || [];
      items.forEach((item, idx) => {
        setTimeout(() => {
          item.style.opacity = '1';
          item.style.transform = 'translateY(0)';
        }, idx * 100);
      });
      galleryObserver.disconnect();
    }
  });
}, { threshold: 0.1 });

galleryItems.forEach(item => {
  item.style.opacity = '0';
  item.style.transform = 'translateY(30px)';
  item.style.transition = 'opacity 0.8s cubic-bezier(0.16,1,0.3,1), transform 0.8s cubic-bezier(0.16,1,0.3,1)';
});

if (galleryItems.length > 0) {
  galleryObserver.observe(galleryItems[0]);
}

/* ---- Series Filter ---- */
const seriesFilterBtns = document.querySelectorAll('[data-series-filter]');
const allSeriesCards = document.querySelectorAll('.series-card');

seriesFilterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    seriesFilterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.dataset.seriesFilter;
    allSeriesCards.forEach(card => {
      const match = filter === '全部' || card.dataset.seriesCategory === filter;
      card.classList.toggle('hidden', !match);
    });
  });
});

/* ---- Lightbox ---- */
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
const lightboxCaption = document.getElementById('lightboxCaption');
const lightboxClose = document.getElementById('lightboxClose');

document.querySelectorAll('.gallery-item').forEach(item => {
  item.addEventListener('click', () => {
    const imgEl = item.querySelector('.gallery-img');
    // 兼容两种写法：<img class="gallery-img" src="..."> 与 background-image div
    const bg = imgEl?.style.backgroundImage || (imgEl?.src ? `url("${imgEl.src}")` : '');
    const title = item.querySelector('h3')?.textContent || '';
    const year = item.querySelector('p')?.textContent || '';

    if (bg && lightboxImg) {
      lightboxImg.style.backgroundImage = bg;
      lightboxCaption.textContent = `${title} — ${year}`;
      lightbox.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  });
});

const closeLightbox = () => {
  lightbox?.classList.remove('active');
  document.body.style.overflow = '';
};

lightboxClose?.addEventListener('click', closeLightbox);
lightbox?.addEventListener('click', closeLightbox);
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeLightbox();
});

/* ---- Parallax Hero Title (subtle) ---- */
const heroContent = document.querySelector('.hero-content');

window.addEventListener('scroll', () => {
  const scrollY = window.scrollY;
  if (heroContent && scrollY < window.innerHeight) {
    heroContent.style.transform = `translateY(${scrollY * 0.3}px)`;
    heroContent.style.opacity = 1 - scrollY / (window.innerHeight * 0.8);
  }
}, { passive: true });

/* ---- Series Card Hover Tilt ---- */
document.querySelectorAll('.series-card').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    card.style.transform = `perspective(800px) rotateY(${x * 4}deg) rotateX(${-y * 4}deg)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = 'perspective(800px) rotateY(0) rotateX(0)';
  });
});

/* ---- Smooth anchor scroll ---- */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

/* ---- Nav active link on scroll ---- */
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link');

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.getAttribute('id');
      navLinks.forEach(link => {
        link.style.color = link.getAttribute('href') === `#${id}`
          ? 'var(--text)'
          : 'var(--text-muted)';
      });
    }
  });
}, { threshold: 0.4 });

sections.forEach(section => sectionObserver.observe(section));