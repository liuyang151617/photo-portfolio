// 分类筛选
const buttons = document.querySelectorAll('.filter-bar button');
const items = document.querySelectorAll('.item');

buttons.forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelector('.active').classList.remove('active');
    btn.classList.add('active');

    const filter = btn.dataset.filter;

    items.forEach(item => {
      item.style.display =
        filter === 'all' || item.classList.contains(filter)
        ? 'block'
        : 'none';
    });
  });
});

// Lightbox
const images = document.querySelectorAll('.item img');
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');

images.forEach(img => {
  img.addEventListener('click', () => {
    lightbox.style.display = 'flex';
    lightboxImg.src = img.src;
  });
});

lightbox.addEventListener('click', () => {
  lightbox.style.display = 'none';
});

// 滚动动画
const reveals = document.querySelectorAll('.reveal');

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('active');
    }
  });
}, { threshold: 0.15 });

reveals.forEach(el => observer.observe(el));
