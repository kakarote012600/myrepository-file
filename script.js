const navbar = document.getElementById('navbar');
const menuButton = document.getElementById('menuButton');
const year = document.getElementById('year');

if (year) year.textContent = new Date().getFullYear();

// Premium loading screen
const loader = document.createElement('div');
loader.className = 'loader';
loader.innerHTML = '<div class="loader-inner"><div class="loader-logo">GMI</div><div class="loader-line"><i></i></div><small>PACKAGING EXPORT · DAVAO</small></div>';
document.body.prepend(loader);
window.addEventListener('load', () => setTimeout(() => loader.classList.add('done'), 450));

// Scroll progress
const progress = document.createElement('div');
progress.className = 'progress-bar';
document.body.appendChild(progress);
const updateProgress = () => {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  progress.style.width = `${max > 0 ? (window.scrollY / max) * 100 : 0}%`;
  navbar.classList.toggle('scrolled', window.scrollY > 15);
};
updateProgress();
window.addEventListener('scroll', updateProgress, { passive: true });

if (menuButton && navbar) {
  menuButton.addEventListener('click', () => {
    const open = navbar.classList.toggle('menu-open');
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      navbar.classList.remove('menu-open');
      menuButton.setAttribute('aria-expanded', 'false');
      menuButton.setAttribute('aria-label', 'Open menu');
    }
  });
}
document.querySelectorAll('.nav-links a').forEach(link => link.addEventListener('click', () => {
  navbar.classList.remove('menu-open');
  menuButton.setAttribute('aria-expanded', 'false');
}));

// Reveal on scroll
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// Hero parallax ------- 
// const heroArt = document.querySelector('.hero-art');
// window.addEventListener('mousemove', (event) => {
//   if (!heroArt || window.innerWidth < 980 || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
//   const x = event.clientX / window.innerWidth - 0.5;
//   const y = event.clientY / window.innerHeight - 0.5;
//   heroArt.style.transform = `translate(${x * 8}px, ${y * 8}px)`;
// }, { passive: true });

// Subtle 3D tilt on product cards
if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
  document.querySelectorAll('.product-card').forEach(card => {
    card.addEventListener('pointermove', e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - .5;
      const y = (e.clientY - r.top) / r.height - .5;
      card.style.transform = `perspective(900px) rotateX(${y * -3}deg) rotateY(${x * 3}deg) translateY(-8px)`;
    });
    card.addEventListener('pointerleave', () => card.style.transform = '');
  });
}

// Desktop cursor treatment
if (window.matchMedia('(pointer:fine)').matches && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const dot = document.createElement('div');
  const ring = document.createElement('div');
  dot.className = 'cursor-dot'; ring.className = 'cursor-ring';
  document.body.append(dot, ring);
  let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;
  window.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; dot.style.left = `${mx}px`; dot.style.top = `${my}px`; });
  const loop = () => { rx += (mx - rx) * .14; ry += (my - ry) * .14; ring.style.left = `${rx}px`; ring.style.top = `${ry}px`; requestAnimationFrame(loop); };
  loop();
  document.querySelectorAll('a,button,.product-card').forEach(el => {
    el.addEventListener('mouseenter', () => ring.classList.add('hover'));
    el.addEventListener('mouseleave', () => ring.classList.remove('hover'));
  });
}

// Product sample-photo gallery
(() => {
  const cards = [...document.querySelectorAll('.product-card[data-gallery]')];
  const modal = document.getElementById('productLightbox');
  if (!modal || !cards.length) return;
  const title = document.getElementById('lightboxTitle');
  const image = document.getElementById('lightboxImage');
  const count = document.getElementById('lightboxCount');
  const thumbs = document.getElementById('lightboxThumbnails');
  const closeButton = document.getElementById('lightboxClose');
  const previous = document.getElementById('lightboxPrev');
  const next = document.getElementById('lightboxNext');
  let photos = [], current = 0, returnFocus = null;

  const show = index => {
    current = (index + photos.length) % photos.length;
    const src = photos[current];
    image.src = src;
    image.alt = `${title.textContent} sample photo ${current + 1}`;
    count.textContent = `${current + 1} / ${photos.length}`;
    [...thumbs.children].forEach((button, i) => {
      button.classList.toggle('is-active', i === current);
      button.setAttribute('aria-pressed', String(i === current));
    });
    previous.disabled = next.disabled = photos.length < 2;
  };
  const open = card => {
    photos = card.dataset.gallery.split('|').map(src => src.trim()).filter(Boolean);
    if (!photos.length) return;
    title.textContent = card.dataset.product || 'Product samples';
    returnFocus = card;
    thumbs.replaceChildren();
    photos.forEach((src, index) => {
      const button = document.createElement('button');
      button.type = 'button'; button.className = 'lightbox-thumb';
      button.setAttribute('aria-label', `View sample photo ${index + 1}`);
      const thumb = document.createElement('img'); thumb.src = src; thumb.alt = '';
      button.append(thumb); button.addEventListener('click', () => show(index));
      thumbs.append(button);
    });
    show(0);
    modal.classList.add('is-open'); modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('lightbox-open'); closeButton.focus();
  };
  const close = () => {
    modal.classList.remove('is-open'); modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('lightbox-open'); image.removeAttribute('src');
    if (returnFocus) returnFocus.focus();
  };
  cards.forEach(card => {
    card.addEventListener('click', event => {
      if (event.target.closest('a, button')) return;
      open(card);
    });
    card.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); open(card); }
    });
  });
  closeButton.addEventListener('click', close);
  previous.addEventListener('click', () => show(current - 1));
  next.addEventListener('click', () => show(current + 1));
  modal.addEventListener('click', event => { if (event.target === modal) close(); });
  document.addEventListener('keydown', event => {
    if (!modal.classList.contains('is-open')) return;
    if (event.key === 'Escape') close();
    else if (event.key === 'ArrowLeft') show(current - 1);
    else if (event.key === 'ArrowRight') show(current + 1);
  });
})();
