/* ══════════════════════════════════════════════════════════════════
   ACTIVE DONATION APPEALS — homepage section
   ══════════════════════════════════════════════════════════════════

   HOW TO UPDATE THE APPEALS
   -------------------------
   Everything the homepage shows comes from the LCB_CAMPAIGNS list below.
   Edit the values here — no other file needs to change.

     category  the small label above the title. Must be one of the club's
               seven fronts, so the homepage and the Activities page name
               the same causes:
                 Diabetes & Healthcare · Childhood Cancer Care
                 Education & Youth     · Eye Care & Vision
                 Elder care            · Hunger & Food Security
                 Animal Welfare
               Write "&amp;" for the ampersand — this string is inserted
               as HTML.
     title     the appeal name
     blurb     one or two sentences on what the money does
     img       photo path, relative to the site root
     raised    money collected so far, in whole rupees (no commas)
     target    the goal, in whole rupees (no commas)
     donors    number of people who have given (set to 0 to hide)
     closes    last day of the appeal, "YYYY-MM-DD" (or null for none)
     landmark  true shows the gold "Landmark project" ribbon

   The progress bar, the percentage, the rupee figures and the
   "days left" counter are all worked out from these numbers.

   ADDING AN APPEAL
   ----------------
   Copy any block below, paste it into the list, and change the values.
   The layout fits four across on a wide screen and reflows on its own,
   so you can run more or fewer than four.

   To retire an appeal, delete its block or set live:false.
   If no appeals are live, the whole section hides itself.

   The homepage grid carries data-limit="4" so it shows only the first four;
   donate.html leaves it off and lists every live appeal.

   >>> The figures below are PLACEHOLDERS. Replace them with the
   >>> club's real collection figures before this goes public.
   ══════════════════════════════════════════════════════════════════ */

var LCB_CAMPAIGNS = [
  {
    live:     true,
    category: 'Childhood Cancer Care',
    title:    'Paediatric cancer &amp; epilepsy care',
    blurb:    'Treatment, medicines and family support for children fighting cancer at Wadia Children&rsquo;s Hospital &mdash; our landmark project.',
    img:      'images/clown_magicshow.jpg',
    alt:      'Children at the Wadia Hospital cancer ward',
    raised:   1840000,
    target:   2500000,
    donors:   214,
    closes:   '2026-12-31',
    landmark: true
  },
  {
    live:     true,
    category: 'Eye Care &amp; Vision',
    title:    'Free cataract surgery camps',
    blurb:    'Screening, surgery and follow-up spectacles for patients who would otherwise lose their sight to a treatable condition.',
    img:      'images/Free cataract surgery camp.png',
    alt:      'Free cataract surgery camp run by the club',
    raised:   960000,
    target:   1200000,
    donors:   138,
    closes:   '2026-09-30',
    landmark: false
  },
  {
    live:     true,
    category: 'Education &amp; Youth',
    title:    'School kits for 500 children',
    blurb:    'Bags, books, uniforms and stationery for children across Mumbai municipal schools, so no child starts the year without the basics.',
    img:      'images/school kit.png',
    alt:      'School bags and kits being distributed to children',
    raised:   310000,
    target:   750000,
    donors:   67,
    closes:   '2027-06-15',
    landmark: false
  },
  {
    live:     true,
    category: 'Diabetes &amp; Healthcare',
    title:    'Dialysis &amp; emergency treatment fund',
    blurb:    'Covering dialysis cycles, surgeries and hospital bills for families who cannot meet the cost of urgent care on their own.',
    img:      'images/img-7.png',
    alt:      'Medical aid supported by the Lions Club of Byculla',
    raised:   525000,
    target:   1500000,
    donors:   91,
    closes:   null,
    landmark: false
  },
  {
    live:     true,
    category: 'Hunger &amp; Food Security',
    title:    'Hot meals for families in need',
    blurb:    'Cooked meals and monthly ration kits for daily-wage families, hospital attendants and people living on the street.',
    img:      'images/Feedin lunch.jpg',
    alt:      'Volunteers serving a cooked lunch',
    raised:   285000,
    target:   600000,
    donors:   124,
    closes:   '2027-03-31',
    landmark: false
  },
  {
    live:     true,
    category: 'Elder care',
    title:    'Support for elders living alone',
    blurb:    'Medicines, spectacles, groceries and companionship visits for senior citizens in old age homes and living on their own.',
    img:      'images/elder-care.png',
    alt:      'An elderly resident supported by the club',
    raised:   142000,
    target:   400000,
    donors:   48,
    closes:   '2027-01-31',
    landmark: false
  },
  {
    live:     true,
    category: 'Animal Welfare',
    title:    'Street animal feeding &amp; veterinary care',
    blurb:    'Daily feeding rounds, sterilisation drives and emergency veterinary treatment for Mumbai&rsquo;s street animals.',
    img:      'images/img-6.png',
    alt:      'Street animals cared for by the club',
    raised:   96000,
    target:   300000,
    donors:   53,
    closes:   null,
    landmark: false
  },
  {
    live:     true,
    category: 'Diabetes &amp; Healthcare',
    title:    'Blood donation drives',
    blurb:    'Running camps across the city with our partner blood banks &mdash; kits, testing, refreshments and transport for every donor.',
    img:      'images/Blood donation andheri.jpg',
    alt:      'Blood donation camp organised by the club',
    raised:   68000,
    target:   200000,
    donors:   37,
    closes:   '2026-11-30',
    landmark: false
  }
];


/* ══════════════════════════════════════════════════════════════════
   Rendering — no need to edit below this line
   ══════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var grid = document.getElementById('campaignGrid');
  var section = document.getElementById('appeals');
  if (!grid || !section) return;

  var live = (typeof LCB_CAMPAIGNS !== 'undefined' ? LCB_CAMPAIGNS : [])
    .filter(function (c) { return c.live !== false; });

  /* Nothing running — don't show an empty section */
  if (!live.length) { section.hidden = true; return; }

  /* data-limit on the grid caps how many appear on that page */
  var limit = parseInt(grid.dataset.limit, 10);
  if (limit > 0) live = live.slice(0, limit);

  /* ── ₹ in Indian notation: 2,50,000 → ₹2.5L, 1,20,00,000 → ₹1.2Cr ── */
  function rupees(n) {
    n = Number(n);
    if (!isFinite(n) || n < 0) n = 0;
    if (n >= 100000) {
      var lakh = n / 100000;
      /* Anything that would round to 100L or more reads better as crore */
      if (lakh >= 99.95) return '₹' + trim(n / 10000000) + 'Cr';
      return '₹' + trim(lakh) + 'L';
    }
    if (n >= 1000) return '₹' + group(n);
    return '₹' + n;
  }
  function trim(v) {
    /* one decimal, but drop a trailing .0 */
    var s = v.toFixed(1);
    return s.slice(-2) === '.0' ? s.slice(0, -2) : s;
  }
  function group(n) {
    /* Indian digit grouping: last 3, then pairs */
    var s = String(n);
    var last3 = s.slice(-3);
    var rest = s.slice(0, -3);
    if (!rest) return last3;
    return rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + last3;
  }

  /* Days remaining, or null if there's no deadline / it has already passed —
     an expired date must not read as "closing today". */
  function daysLeft(iso) {
    if (!iso) return null;
    var end = new Date(iso + 'T23:59:59');
    if (isNaN(end)) return null;
    var days = Math.ceil((end - new Date()) / 86400000);
    return days >= 0 ? days : null;
  }

  function esc(s) { return String(s).replace(/"/g, '&quot;'); }

  var totalRaised = 0;

  var html = live.map(function (c, i) {
    var pct = c.target > 0 ? Math.round((c.raised / c.target) * 100) : 0;
    var width = Math.min(pct, 100);
    totalRaised += Number(c.raised) || 0;

    var bits = ['of ' + rupees(c.target) + ' goal'];
    if (c.donors) bits.push(c.donors + ' donor' + (c.donors === 1 ? '' : 's'));
    var left = daysLeft(c.closes);
    if (left !== null) bits.push(left === 0 ? 'closing today' : left + ' days left');

    /* Figures already formatted, for the donation modal to show without
       having to re-derive any of this (see js/appeal-donate.js). */
    c.display = {
      pct: pct,
      width: width,
      raised: rupees(c.raised),
      meta: bits.join(' · ')
    };

    return '' +
    '<article class="camp-card">' +
      '<div class="camp-media">' +
        '<img src="' + esc(c.img) + '" alt="' + esc(c.alt || '') + '" loading="lazy">' +
        (c.landmark ? '<span class="camp-badge">Landmark project</span>' : '') +
      '</div>' +
      '<div class="camp-body">' +
        '<div class="camp-cat">' + c.category + '</div>' +
        '<h3 class="camp-title">' + c.title + '</h3>' +
        '<p class="camp-blurb">' + c.blurb + '</p>' +
        '<div class="camp-progress">' +
          '<div class="camp-figures">' +
            '<span class="camp-raised"><strong>' + rupees(c.raised) + '</strong> raised</span>' +
            '<span class="camp-pct">' + pct + '%</span>' +
          '</div>' +
          '<div class="camp-bar" role="progressbar" aria-valuenow="' + pct + '" ' +
               'aria-valuemin="0" aria-valuemax="100" ' +
               'aria-label="' + esc(c.title.replace(/&amp;/g, '&')) + ' funding progress">' +
            '<span class="camp-fill" data-width="' + width + '"></span>' +
          '</div>' +
          '<div class="camp-meta">' + bits.join(' &middot; ') + '</div>' +
        '</div>' +
        /* Opens the donation modal (js/appeal-donate.js). The href stays a
           real link so the full donate page is still the fallback if that
           script is missing. */
        '<a class="camp-cta" href="donate.html" data-appeal="' + i + '">' +
          'Donate for this cause' +
          '<svg width="15" height="15" viewBox="0 0 24 24" aria-hidden="true">' +
          '<line x1="4" y1="12" x2="19" y2="12"/><polyline points="13,6 19,12 13,18"/></svg>' +
        '</a>' +
      '</div>' +
    '</article>';
  }).join('');

  grid.innerHTML = html;

  /* The rendered list, in card order — data-appeal on each CTA indexes into
     this. The donation modal reads it to know which appeal was clicked. */
  window.LCB_CAMPAIGNS_LIVE = live;

  /* Running total under the heading */
  var totalEl = document.getElementById('campaignTotal');
  if (totalEl) {
    totalEl.innerHTML = '<strong>' + rupees(totalRaised) + '</strong> raised so far across ' +
      live.length + ' active appeal' + (live.length === 1 ? '' : 's');
  }

  /* ── Fill the bars when the section scrolls into view ── */
  var fills = grid.querySelectorAll('.camp-fill');
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var painted = false;
  function paint() {
    if (painted) return;
    painted = true;
    fills.forEach(function (f) { f.style.width = f.dataset.width + '%'; });
  }

  if (reduced || !('IntersectionObserver' in window)) {
    paint();
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { paint(); io.disconnect(); }
      });
    }, { threshold: 0.15 });
    io.observe(grid);
    /* Safety net: never leave the bars sitting at zero if the observer
       doesn't fire (background tab, odd viewport, no frames being painted). */
    setTimeout(paint, 3000);
  }
})();
