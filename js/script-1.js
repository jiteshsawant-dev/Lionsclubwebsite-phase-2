(function(){
  /* Copy main logo src into drawer logo */
  var mainLogo = document.querySelector('nav.main .brand-logo img');
  var drawerLogo = document.getElementById('drawerLogo');
  if(mainLogo && drawerLogo) drawerLogo.src = mainLogo.src;

  /* ── Scrolled nav ── */
  var nav = document.querySelector('nav.main');
  function handleScroll(){
    if(window.scrollY > 80){
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  }
  window.addEventListener('scroll', handleScroll, {passive:true});
  handleScroll();

  /* ── Active nav link ── */
  var currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-c-links a, .drawer-nav a').forEach(function(a){
    if(a.getAttribute('href') === currentPage) a.classList.add('active');
  });

  /* Light up the parent when one of its children is the current page */
  document.querySelectorAll('.nav-c-links li.has-sub').forEach(function(li){
    if(li.querySelector('.nav-sub a.active')){
      var parentLink = li.querySelector(':scope > a');
      if(parentLink) parentLink.classList.add('active-parent');
    }
  });
  document.querySelectorAll('.drawer-acc-toggle').forEach(function(btn){
    var sub = document.getElementById(btn.getAttribute('data-target'));
    if(sub && sub.querySelector('a.active')){
      btn.classList.add('open','active');
      sub.classList.add('open');
    }
  });

  /* ── Desktop nav-c dropdowns (hover via CSS, click/keys handled here) ── */
  var navCItems = document.querySelectorAll('.nav-c-links li.has-sub');
  function closeAllNavC(except){
    navCItems.forEach(function(li){
      if(li !== except){
        li.classList.remove('open');
        var a = li.querySelector(':scope > a');
        if(a) a.setAttribute('aria-expanded','false');
      }
    });
  }
  navCItems.forEach(function(li){
    var trigger = li.querySelector(':scope > a');
    if(!trigger) return;
    trigger.setAttribute('aria-expanded','false');
    trigger.addEventListener('click', function(e){
      /* Below 900px the dropdown is hidden — let the link navigate */
      if(window.innerWidth <= 900) return;
      e.preventDefault();
      var willOpen = !li.classList.contains('open');
      closeAllNavC(li);
      li.classList.toggle('open', willOpen);
      trigger.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
    });
  });
  document.addEventListener('click', function(e){
    if(!e.target.closest('.nav-c-links li.has-sub')) closeAllNavC(null);
  });
  document.addEventListener('keydown', function(e){
    if(e.key === 'Escape') closeAllNavC(null);
  });

  /* ── Desktop pill dropdowns ── */
  var desktopItems = document.querySelectorAll('.nav-links li.has-sub');
  function closeAllDesktop(except){
    desktopItems.forEach(function(li){
      if(li !== except){
        li.classList.remove('open');
        var a = li.querySelector('a');
        if(a) a.setAttribute('aria-expanded','false');
      }
    });
  }
  desktopItems.forEach(function(li){
    var trigger = li.querySelector('a');
    trigger.addEventListener('click', function(e){
      e.preventDefault();
      var willOpen = !li.classList.contains('open');
      closeAllDesktop(li);
      li.classList.toggle('open', willOpen);
      trigger.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
    });
  });
  document.addEventListener('click', function(e){
    if(!e.target.closest('.nav-links li.has-sub')) closeAllDesktop(null);
  });

  /* ── Drawer open/close ── */
  var hamburger = document.getElementById('hamburgerBtn');
  var overlay   = document.getElementById('navOverlay');
  var drawer    = document.getElementById('navDrawer');
  var closeBtn  = document.getElementById('drawerClose');

  function openDrawer(){
    drawer.classList.add('open');
    overlay.classList.add('open');
    hamburger.setAttribute('aria-expanded','true');
    document.body.style.overflow = 'hidden';
  }
  function closeDrawer(){
    drawer.classList.remove('open');
    overlay.classList.remove('open');
    hamburger.setAttribute('aria-expanded','false');
    document.body.style.overflow = '';
  }

  hamburger.addEventListener('click', openDrawer);
  closeBtn.addEventListener('click', closeDrawer);
  overlay.addEventListener('click', closeDrawer);

  drawer.querySelectorAll('a').forEach(function(a){
    a.addEventListener('click', function(){ setTimeout(closeDrawer, 120); });
  });

  document.addEventListener('keydown', function(e){
    if(e.key === 'Escape'){ closeAllDesktop(null); closeDrawer(); }
  });

  /* ── Drawer accordion ── */
  document.querySelectorAll('.drawer-acc-toggle').forEach(function(btn){
    btn.addEventListener('click', function(){
      var targetId = btn.getAttribute('data-target');
      var sub = document.getElementById(targetId);
      var isOpen = btn.classList.contains('open');
      document.querySelectorAll('.drawer-acc-toggle').forEach(function(b){
        b.classList.remove('open');
        var s = document.getElementById(b.getAttribute('data-target'));
        if(s) s.classList.remove('open');
      });
      if(!isOpen){
        btn.classList.add('open');
        if(sub) sub.classList.add('open');
      }
    });
  });
})();


  /* ── IMPACT CARDS CAROUSEL ── */

const carousel = document.getElementById('carousel');
if(carousel) (function(){
const cards = Array.from(carousel.querySelectorAll('.card'));
const dotsEl = document.getElementById('dots');

let active = 0;
const total = cards.length;

const dots = cards.map((_,i) => {
  const d = document.createElement('button');
  d.className = 'dot' + (i===0?' active':'');
  d.setAttribute('aria-label', `Go to slide ${i+1}`);
  d.addEventListener('click', () => goTo(i));
  dotsEl.appendChild(d);
  return d;
});

// Separate: setFeatured only toggles the expanded card (no scroll)
function setFeatured(idx) {
  cards[active].classList.remove('card--featured');
  dots[active].classList.remove('active');
  active = (idx + total) % total;
  cards[active].classList.add('card--featured');
  dots[active].classList.add('active');
}

// scrollToActive moves the carousel to center the active card
function scrollToActive() {
  const gap = 8;
  let offset = 0;
  for(let i = 0; i < active; i++) offset += cards[i].offsetWidth + gap;
  const cardW = cards[active].offsetWidth;
  const wrapW = carousel.parentElement.offsetWidth;
  const center = offset - (wrapW - cardW) / 2;
  carousel.style.transform = `translateX(${-Math.max(0, center)}px)`;
}

// goTo: expand + scroll (used by buttons, dots, drag)
function goTo(i) { setFeatured(i); scrollToActive(); }

// Hover: expand only, no carousel scroll
let isDragging = false;
cards.forEach((c, i) => {
  c.addEventListener('mouseenter', () => { if (!isDragging) setFeatured(i); });
});

// Touch swipe
let touchStartX = 0;
carousel.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, {passive:true});
carousel.addEventListener('touchend', e => {
  const dx = e.changedTouches[0].clientX - touchStartX;
  if(Math.abs(dx) > 40) goTo(active + (dx < 0 ? 1 : -1));
});

// Mouse drag-to-scroll
let dragStartX = 0;
let dragStartTranslate = 0;

function getCurrentTranslate() {
  return new DOMMatrix(getComputedStyle(carousel).transform).m41;
}

carousel.addEventListener('mousedown', e => {
  isDragging = true;
  dragStartX = e.clientX;
  dragStartTranslate = getCurrentTranslate();
  carousel.classList.add('dragging');
  e.preventDefault();
});

document.addEventListener('mousemove', e => {
  if (!isDragging) return;
  const dx = e.clientX - dragStartX;
  carousel.style.transform = `translateX(${dragStartTranslate + dx}px)`;
});

document.addEventListener('mouseup', e => {
  if (!isDragging) return;
  isDragging = false;
  carousel.classList.remove('dragging');
  const dx = e.clientX - dragStartX;
  if (Math.abs(dx) > 50) {
    goTo(active + (dx < 0 ? 1 : -1));
  } else {
    goTo(active); // snap back
  }
});
})();