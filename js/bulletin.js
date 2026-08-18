/* ============================================================
   Bulletin — PDF thumbnails + page-flip viewer
   Uses: pdf.js (global pdfjsLib), StPageFlip (global St)
   ============================================================ */
(function () {
  'use strict';

  if (typeof pdfjsLib === 'undefined') { console.error('[bulletin] pdf.js not loaded'); return; }
  pdfjsLib.GlobalWorkerOptions.workerSrc = 'js/lib/pdf.worker.js';

  /* ── Bulletin catalogue ─────────────────────────────────────
     Add a new object here to publish another bulletin.          */
  var BULLETINS = [
    {
      brand: 'LCB Bulletin',
      title: 'July – December 2024',
      file: 'Pdf/byculla-bulletin-2024-25.pdf'
    },
    {
      brand: 'LCB Bulletin',
      title: '2024–25',
      file: 'Pdf/lcb-bulletin-2024-25.pdf'
    },
    {
      brand: 'LCB Bulletin',
      title: 'July 2023 – January 2024',
      file: 'Pdf/byculla-bulletin-2023-24.pdf'
    }
  ];

  /* ── Caches so a PDF is never loaded or rendered twice ─────── */
  var docCache = {};    // url -> Promise<pdfDoc>
  var pagesCache = {};  // url -> [dataURL, ...] (full-res spread images)
  var aspectCache = {}; // url -> single-page width/height ratio

  function loadDoc(url) {
    return docCache[url] || (docCache[url] = pdfjsLib.getDocument(url).promise);
  }

  /* Render one pdf page to a JPEG data URL at a target pixel width */
  function renderPage(page, targetWidth) {
    var base = page.getViewport({ scale: 1 });
    var scale = targetWidth / base.width;
    var vp = page.getViewport({ scale: scale });
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    canvas.width = Math.ceil(vp.width);
    canvas.height = Math.ceil(vp.height);
    return page.render({ canvasContext: ctx, viewport: vp }).promise.then(function () {
      return { url: canvas.toDataURL('image/jpeg', 0.85), w: canvas.width, h: canvas.height };
    });
  }

  /* ── Card rendering ────────────────────────────────────────── */
  var grid = document.getElementById('bulletinGrid');

  function buildCards() {
    BULLETINS.forEach(function (b, i) {
      var card = document.createElement('button');
      card.className = 'bl-card';
      card.type = 'button';
      card.setAttribute('aria-label', 'Open ' + b.brand + ', ' + b.title);
      card.innerHTML =
        '<span class="bl-card__cover">' +
          '<span class="bl-card__spinner" aria-hidden="true"></span>' +
          '<span class="bl-card__hint"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>Flip through</span>' +
        '</span>' +
        '<span class="bl-card__body">' +
          '<span class="bl-card__eyebrow">' + b.brand + '</span>' +
          '<span class="bl-card__title">' + b.title + '</span>' +
        '</span>';
      card.addEventListener('click', function () { openViewer(b); });
      grid.appendChild(card);
      b._card = card;
    });
  }

  /* Lazily render the page-1 thumbnail for each card */
  function buildThumbnails() {
    BULLETINS.forEach(function (b) {
      var url = encodeURI(b.file);
      loadDoc(url)
        .then(function (pdf) {
          b._numPages = pdf.numPages;
          return pdf.getPage(1);
        })
        .then(function (page) {
          aspectCache[url] = page.getViewport({ scale: 1 }).width / page.getViewport({ scale: 1 }).height;
          return renderPage(page, 520);
        })
        .then(function (out) {
          var cover = b._card.querySelector('.bl-card__cover');
          cover.style.aspectRatio = out.w + ' / ' + out.h;
          var img = new Image();
          img.className = 'bl-card__img';
          img.alt = b.title + ' cover';
          img.src = out.url;
          img.addEventListener('load', function () { cover.classList.add('is-loaded'); });
          cover.insertBefore(img, cover.firstChild);
          if (b._numPages) {
            var pages = document.createElement('span');
            pages.className = 'bl-card__pages';
            pages.textContent = b._numPages + ' pages';
            cover.appendChild(pages);
          }
        })
        .catch(function (err) {
          console.error('[bulletin] thumbnail failed for', b.file, err);
          var cover = b._card.querySelector('.bl-card__cover');
          cover.classList.add('is-error');
          cover.innerHTML = '<span class="bl-card__err">Preview unavailable</span>';
        });
    });
  }

  /* ── Viewer / flipbook ─────────────────────────────────────── */
  var overlay = document.getElementById('flipOverlay');
  var mount = document.getElementById('flipMount');
  var loadingEl = document.getElementById('flipLoading');
  var loadingText = document.getElementById('flipLoadingText');
  var titleEl = document.getElementById('flipTitle');
  var subEl = document.getElementById('flipSub');
  var counterEl = document.getElementById('flipCounter');
  var downloadEl = document.getElementById('flipDownload');
  var prevBtn = document.getElementById('flipPrev');
  var nextBtn = document.getElementById('flipNext');
  var closeBtn = document.getElementById('flipClose');

  var flip = null;         // current PageFlip instance
  var currentImages = null;
  var currentAspect = 0.7; // single-page w/h
  var currentPage = 0;

  function computeSize(aspect) {
    var portrait = window.innerWidth < 768;
    var availW = Math.min(window.innerWidth * 0.94, 1180);
    var availH = window.innerHeight - 176; // room for top + bottom bars
    if (availH < 320) availH = 320;
    var cols = portrait ? 1 : 2;
    // total spread: width = cols * pageW, height = pageH; pageW = aspect * pageH
    var spreadRatio = cols * aspect; // width/height of full spread
    var w = availW;
    var h = w / spreadRatio;
    if (h > availH) { h = availH; w = h * spreadRatio; }
    return { pageW: Math.round(w / cols), pageH: Math.round(h), portrait: portrait };
  }

  function buildFlip() {
    if (flip) { try { flip.destroy(); } catch (e) {} flip = null; }
    // StPageFlip.destroy() removes its own container from the DOM, so mount a
    // fresh disposable element each time and keep #flipMount as the stable host.
    mount.innerHTML = '';
    var s = computeSize(currentAspect);
    var cols = s.portrait ? 1 : 2;
    var el = document.createElement('div');
    el.className = 'flip-book';
    // StPageFlip (fixed mode) picks portrait when the block width < pageWidth*2,
    // so give the block the full spread width to steer landscape vs portrait.
    el.style.width = (s.pageW * cols) + 'px';
    el.style.height = s.pageH + 'px';
    mount.appendChild(el);
    flip = new St.PageFlip(el, {
      width: s.pageW,
      height: s.pageH,
      size: 'fixed',
      showCover: true,
      usePortrait: true,
      autoSize: false,
      maxShadowOpacity: 0.5,
      drawShadow: true,
      flippingTime: 700,
      mobileScrollSupport: false
    });
    flip.loadFromImages(currentImages);
    flip.on('flip', function (e) { currentPage = e.data; updateCounter(); });
    // restore page position (e.g. after a resize rebuild)
    if (currentPage > 0 && currentPage < currentImages.length) {
      try { flip.turnToPage(currentPage); } catch (e) {}
    }
    updateCounter();
  }

  function updateCounter() {
    if (!currentImages) return;
    var total = currentImages.length;
    var idx = currentPage;
    var label;
    if (idx === 0 || window.innerWidth < 768) {
      label = (idx + 1) + ' / ' + total;
    } else if (idx >= total - 1) {
      label = total + ' / ' + total;
    } else {
      label = (idx + 1) + '–' + (idx + 2) + ' / ' + total;
    }
    counterEl.textContent = label;
    prevBtn.disabled = idx <= 0;
    nextBtn.disabled = idx >= total - 1;
  }

  function openViewer(b) {
    var url = encodeURI(b.file);
    titleEl.textContent = b.brand;
    subEl.textContent = b.title;
    downloadEl.href = url;
    downloadEl.setAttribute('download', '');
    currentPage = 0;

    overlay.classList.add('is-open');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    loadingEl.classList.remove('is-hidden');
    mount.style.visibility = 'hidden';
    loadingText.textContent = 'Preparing pages…';

    var cached = pagesCache[url];
    var ready = cached
      ? Promise.resolve(cached)
      : loadDoc(url).then(function (pdf) {
          var imgs = [];
          var chain = Promise.resolve();
          var n = pdf.numPages;
          for (var i = 1; i <= n; i++) {
            (function (pageNum) {
              chain = chain
                .then(function () { return pdf.getPage(pageNum); })
                .then(function (page) {
                  if (!aspectCache[url]) {
                    aspectCache[url] = page.getViewport({ scale: 1 }).width / page.getViewport({ scale: 1 }).height;
                  }
                  return renderPage(page, 1000);
                })
                .then(function (out) {
                  imgs.push(out.url);
                  loadingText.textContent = 'Rendering page ' + pageNum + ' of ' + n + '…';
                });
            })(i);
          }
          return chain.then(function () { pagesCache[url] = imgs; return imgs; });
        });

    ready
      .then(function (imgs) {
        currentImages = imgs;
        currentAspect = aspectCache[url] || 0.7;
        loadingEl.classList.add('is-hidden');
        mount.style.visibility = 'visible';
        buildFlip();
      })
      .catch(function (err) {
        console.error('[bulletin] failed to open', b.file, err);
        loadingText.textContent = 'Sorry — this bulletin could not be opened.';
      });
  }

  function closeViewer() {
    overlay.classList.remove('is-open');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (flip) { try { flip.destroy(); } catch (e) {} flip = null; }
    mount.innerHTML = '';
    currentImages = null;
  }

  /* ── Controls ──────────────────────────────────────────────── */
  prevBtn.addEventListener('click', function () { if (flip) flip.flipPrev(); });
  nextBtn.addEventListener('click', function () { if (flip) flip.flipNext(); });
  closeBtn.addEventListener('click', closeViewer);
  overlay.addEventListener('click', function (e) { if (e.target === overlay) closeViewer(); });

  document.addEventListener('keydown', function (e) {
    if (!overlay.classList.contains('is-open')) return;
    if (e.key === 'Escape') closeViewer();
    else if (e.key === 'ArrowLeft' && flip) flip.flipPrev();
    else if (e.key === 'ArrowRight' && flip) flip.flipNext();
  });

  /* Rebuild on resize (uses cached images, so it's instant) */
  var resizeTimer = null;
  window.addEventListener('resize', function () {
    if (!overlay.classList.contains('is-open') || !currentImages) return;
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(buildFlip, 200);
  });

  /* ── Init ──────────────────────────────────────────────────── */
  buildCards();
  buildThumbnails();
})();
