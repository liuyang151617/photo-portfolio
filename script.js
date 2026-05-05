const items = document.querySelectorAll('.item');
const buttons = document.querySelectorAll('.filter-bar button');

buttons.forEach(btn => {
  btn.addEventListener('click', () => {
    const filter = btn.dataset.filter;

    items.forEach(item => {
      item.style.display =
        filter === 'all' || item.classList.contains(filter)
        ? 'block'
        : 'none';
    });
  });
});

// lightbox
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