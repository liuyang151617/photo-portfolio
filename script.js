// 1. 滚动时作品渐入效果（优化触发时机，更自然）
const items = document.querySelectorAll('.item');
const triggerOffset = 0.82; // 触发动画的偏移量

function checkScroll() {
  const trigger = window.innerHeight * triggerOffset;
  
  // 作品渐入
  items.forEach(item => {
    const itemTop = item.getBoundingClientRect().top;
    if (itemTop < trigger) {
      item.classList.add('show');
    }
  });

  // 导航栏滚动变化
  const navbar = document.getElementById('navbar');
  if (window.scrollY > 50) {
    navbar.classList.add('scroll');
  } else {
    navbar.classList.remove('scroll');
  }

  // 回到顶部按钮显示/隐藏
  const backToTop = document.getElementById('backToTop');
  if (window.scrollY > 300) {
    backToTop.classList.add('show');
  } else {
    backToTop.classList.remove('show');
  }
}

// 初始加载触发一次
window.addEventListener('load', () => {
  setTimeout(() => {
    checkScroll();
  }, 200);
});

// 滚动时持续触发
window.addEventListener('scroll', checkScroll);

// 2. 回到顶部功能
const backToTop = document.getElementById('backToTop');
backToTop.addEventListener('click', () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
});

// 3. 作品分类筛选功能（新增，提升实用性）
const filterBtns = document.querySelectorAll('.filter-btn');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    // 移除所有按钮的active类
    filterBtns.forEach(b => b.classList.remove('active'));
    // 给当前按钮添加active类
    btn.classList.add('active');
    
    const filter = btn.getAttribute('data-filter');
    
    // 筛选作品
    items.forEach(item => {
      if (filter === 'all' || item.classList.contains(filter)) {
        item.style.display = 'block';
        // 重新触发渐入动画（延迟一点，更自然）
        setTimeout(() => {
          checkScroll();
        }, 100);
      } else {
        item.style.display = 'none';
      }
    });
  });
});

// 4. 导航链接平滑滚动（优化体验）
const navLinks = document.querySelectorAll('.nav-link');
navLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const targetId = link.getAttribute('href');
    const targetElement = document.querySelector(targetId);
    
    if (targetElement) {
      const navbarHeight = document.getElementById('navbar').offsetHeight;
      const targetPosition = targetElement.getBoundingClientRect().top + window.scrollY - navbarHeight;
      
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    }
  });
});

// 5. 图片加载动画（新增，提升高级感）
const images = document.querySelectorAll('img');
images.forEach(img => {
  // 初始透明度0
  img.style.opacity = '0';
  img.style.transition = 'opacity 0.8s ease';
  
  // 图片加载完成后显示
  img.addEventListener('load', () => {
    img.style.opacity = '1';
  });
  
  // 处理缓存图片
  if (img.complete) {
    img.style.opacity = '1';
  }
});
