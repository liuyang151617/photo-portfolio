// 滚动时图片渐入效果
const items = document.querySelectorAll('.item');

window.addEventListener('scroll', () => {
  const trigger = window.innerHeight * 0.82;
  items.forEach(item => {
    const top = item.getBoundingClientRect().top;
    if (top < trigger) {
      item.classList.add('show');
    }
  });
});

// 页面刚加载时自动触发一次
setTimeout(() => {
  window.dispatchEvent(new Event('scroll'));
}, 200);
