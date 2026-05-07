/* =============================================
   LENS & LIGHT — Photography Portfolio
   script.js
============================================= */

'use strict';

/* ---- Preloader ---- */
window.addEventListener('load', () => {
  setTimeout(() => {
    document.getElementById('preloader').classList.add('hidden');
    // Trigger hero animations
    document.querySelectorAll('.hero .reveal').forEach((el, i) => {
      setTimeout(() => el.classList.add('visible'), 200 + i * 150);
    });
  }, 2200);
});

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
    const bg = imgEl?.style.backgroundImage;
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