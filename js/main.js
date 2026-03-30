/* ============================================================
   COZYNEST — Main JavaScript
   Nav · Mobile Menu · Cart · Animations · Slider · Forms
   ============================================================ */

'use strict';

/* ============================================================
   UTILITIES
   ============================================================ */

function $(sel, ctx = document) { return ctx.querySelector(sel); }
function $$(sel, ctx = document) { return [...ctx.querySelectorAll(sel)]; }

function showToast(msg, duration = 2800) {
  const toast = $('#toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove('show'), duration);
}

/* ============================================================
   NAV — scroll behaviour
   ============================================================ */

const nav = $('#nav');

function updateNav() {
  nav.classList.toggle('nav--scrolled', window.scrollY > 56);
}

window.addEventListener('scroll', updateNav, { passive: true });
updateNav();

/* ============================================================
   MOBILE MENU
   ============================================================ */

const hamburger  = $('#hamburger');
const mobileNav  = $('#mobileNav');

function openMenu() {
  hamburger.classList.add('open');
  mobileNav.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeMenu() {
  hamburger.classList.remove('open');
  mobileNav.classList.remove('open');
  document.body.style.overflow = '';
}

hamburger.addEventListener('click', () => {
  mobileNav.classList.contains('open') ? closeMenu() : openMenu();
});

// Close on link tap
$$('a', mobileNav).forEach(a => a.addEventListener('click', closeMenu));

/* ============================================================
   CART DRAWER
   ============================================================ */

const cartDrawer   = $('#cartDrawer');
const cartBackdrop = $('#cartBackdrop');
const cartClose    = $('#cartClose');
const cartCount    = $('#cartCount');
const cartItems    = $('#cartItems');
const cartFoot     = $('#cartFoot');
const cartTotal    = $('#cartTotal');

let cart = [];

function openCart() {
  cartDrawer.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeCart() {
  cartDrawer.classList.remove('open');
  document.body.style.overflow = '';
}

$('#cartBtn').addEventListener('click', openCart);
cartBackdrop.addEventListener('click', closeCart);
cartClose.addEventListener('click', closeCart);

function renderCart() {
  const empty = cartItems.querySelector('.cart-drawer__empty');

  if (cart.length === 0) {
    if (!empty) {
      cartItems.innerHTML = `
        <div class="cart-drawer__empty">
          <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <path d="M16 10a4 4 0 0 1-8 0"/>
          </svg>
          <p>Your cart is empty</p>
          <a href="#collection" class="btn btn--primary">Start Shopping</a>
        </div>`;
      // re-bind the collection link inside cart
      const link = cartItems.querySelector('a');
      if (link) link.addEventListener('click', closeCart);
    }
    cartFoot.style.display = 'none';
    return;
  }

  cartItems.innerHTML = cart.map((item, i) => `
    <div class="cart-item">
      <div class="cart-item__img" style="background:var(--cream-2)"></div>
      <div>
        <p class="cart-item__name">${item.name}</p>
        <p class="cart-item__price">$${item.price}</p>
      </div>
      <button class="cart-item__remove" data-index="${i}" aria-label="Remove">×</button>
    </div>
  `).join('');

  // Remove buttons
  $$('.cart-item__remove', cartItems).forEach(btn => {
    btn.addEventListener('click', () => {
      cart.splice(Number(btn.dataset.index), 1);
      updateCartCount();
      renderCart();
    });
  });

  const total = cart.reduce((sum, item) => sum + item.price, 0);
  cartTotal.textContent = `$${total}`;
  cartFoot.style.display = 'flex';
}

function updateCartCount() {
  cartCount.textContent = cart.length;
  // Bump animation
  cartCount.classList.remove('bump');
  void cartCount.offsetWidth; // reflow
  cartCount.classList.add('bump');
  setTimeout(() => cartCount.classList.remove('bump'), 300);
}

/* Quick-add buttons */
$$('.quick-add').forEach(btn => {
  btn.addEventListener('click', () => {
    const name  = btn.dataset.name;
    const price = Number(btn.dataset.price);

    cart.push({ name, price });
    updateCartCount();
    renderCart();

    // Button feedback
    const original = btn.textContent;
    btn.textContent = 'Added ✓';
    btn.style.background = 'var(--muted-green)';
    setTimeout(() => {
      btn.textContent = original;
      btn.style.background = '';
    }, 1800);

    showToast(`${name} added to cart`);
    setTimeout(openCart, 500);
  });
});

/* ============================================================
   REVEAL ANIMATIONS — Intersection Observer
   ============================================================ */

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const delay = parseInt(entry.target.dataset.delay) || 0;
    setTimeout(() => entry.target.classList.add('visible'), delay);
    revealObserver.unobserve(entry.target);
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

$$('.reveal, .reveal-left, .reveal-right').forEach(el => revealObserver.observe(el));

/* Hero fade-up elements trigger immediately on load */
const heroObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const delay = parseInt(entry.target.dataset.delay) || 0;
    setTimeout(() => entry.target.classList.add('visible'), delay + 200);
    heroObserver.unobserve(entry.target);
  });
}, { threshold: 0.05 });

$$('.fade-up').forEach(el => heroObserver.observe(el));

/* ============================================================
   TESTIMONIAL SLIDER
   ============================================================ */

const track     = $('#testimTrack');
const dotsWrap  = $('#testimDots');
const prevBtn   = $('#testimPrev');
const nextBtn   = $('#testimNext');
const cards     = $$('.tesm-card', track);

let current = 0;

function perView() {
  if (window.innerWidth <= 768) return 1;
  return 3;
}

function totalSlides() {
  return Math.ceil(cards.length / perView());
}

function buildDots() {
  dotsWrap.innerHTML = '';
  for (let i = 0; i < totalSlides(); i++) {
    const dot = document.createElement('button');
    dot.className = 'tesm-dot' + (i === current ? ' active' : '');
    dot.setAttribute('aria-label', `Slide ${i + 1}`);
    dot.addEventListener('click', () => goTo(i));
    dotsWrap.appendChild(dot);
  }
}

function goTo(index) {
  current = Math.max(0, Math.min(index, totalSlides() - 1));

  const cardW = cards[0].offsetWidth + 24; // 24 = gap
  track.style.transform = `translateX(-${current * cardW * perView()}px)`;

  $$('.tesm-dot', dotsWrap).forEach((d, i) => {
    d.classList.toggle('active', i === current);
  });
}

prevBtn.addEventListener('click', () => goTo(current - 1));
nextBtn.addEventListener('click', () => goTo(current + 1));

buildDots();
window.addEventListener('resize', () => { buildDots(); goTo(0); });

/* ============================================================
   NEWSLETTER FORM
   ============================================================ */

const form = $('#newsletterForm');

if (form) {
  form.addEventListener('submit', e => {
    e.preventDefault();
    const input  = form.querySelector('input');
    const submit = form.querySelector('button');

    const orig = submit.textContent;
    submit.textContent = 'You\'re in ✓';
    submit.style.background = 'var(--muted-green)';
    input.value = '';
    input.placeholder = 'Welcome to the community!';

    showToast('You\'re on the list — welcome to CozyNest.');

    setTimeout(() => {
      submit.textContent = orig;
      submit.style.background = '';
      input.placeholder = 'Your email address';
    }, 3500);
  });
}

/* ============================================================
   SMOOTH SCROLL
   ============================================================ */

$$('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    closeMenu();
    closeCart();
    window.scrollTo({
      top: target.getBoundingClientRect().top + window.scrollY - 80,
      behavior: 'smooth'
    });
  });
});

/* ============================================================
   SUBTLE PARALLAX — hero content only, RAF-throttled
   ============================================================ */

const heroContent = $('.hero__content');
let rafPending = false;

function parallax() {
  if (heroContent) {
    heroContent.style.transform = `translateY(${window.scrollY * 0.14}px)`;
  }
  rafPending = false;
}

window.addEventListener('scroll', () => {
  if (!rafPending) {
    rafPending = true;
    requestAnimationFrame(parallax);
  }
}, { passive: true });
