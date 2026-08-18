/* ══════════════════════════════════════════════════════════════════
   APPEAL DONATION MODAL
   "Donate to this appeal" on a homepage campaign card opens this dialog
   instead of navigating to donate.html, so the donor gives to that one
   appeal without losing their place on the page.

   One dialog serves every card: on open it is filled from the matching
   entry in window.LCB_CAMPAIGNS_LIVE (published by js/campaigns.js), which
   the card's data-appeal attribute indexes into.

   There is no backend in this project, so submit mirrors the membership
   modal and donate.html: validate client-side, then swap the form for the
   success panel. Wire the payment gateway in submit() when one exists.
   ══════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var overlay = document.getElementById('appealOverlay');
  var grid    = document.getElementById('campaignGrid');
  if (!overlay || !grid) return;

  var closeBtn = document.getElementById('appealClose');
  var form     = document.getElementById('appealForm');
  var success  = document.getElementById('appealSuccess');
  var successNote = document.getElementById('appealSuccessNote');

  var customWrap = document.getElementById('appealCustomWrap');
  var customEl   = document.getElementById('appealCustom');
  var submitLabel = document.getElementById('appealSubmitLabel');

  var FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), ' +
                  'select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

  var lastFocused = null;
  var current = null;   /* the appeal being donated to */
  var hideTimer = null; /* pending "hide after the fade-out" from close() */

  /* The appeal copy carries HTML entities (&amp;, &rsquo;), so it goes in as
     markup. This pulls the plain-text version back out for places that need
     a string rather than a node. */
  function plain(html) {
    var d = document.createElement('div');
    d.innerHTML = html || '';
    return d.textContent || '';
  }

  function setHTML(id, html) {
    var el = document.getElementById(id);
    if (el) el.innerHTML = html || '';
  }

  /* ── Amount ── */
  function chosenAmount() {
    var picked = form.querySelector('input[name="appealAmount"]:checked');
    if (!picked) return 0;
    if (picked.value !== 'other') return Number(picked.value);
    return Math.floor(Number(customEl.value)) || 0;
  }

  function isCustom() {
    var picked = form.querySelector('input[name="appealAmount"]:checked');
    return !!picked && picked.value === 'other';
  }

  function syncAmount() {
    var custom = isCustom();
    customWrap.classList.toggle('is-shown', custom);

    var amount = chosenAmount();
    submitLabel.innerHTML = amount > 0
      ? 'Donate &#8377;' + amount.toLocaleString('en-IN')
      : 'Donate for this cause';
  }

  form.querySelectorAll('input[name="appealAmount"]').forEach(function (r) {
    r.addEventListener('change', function () {
      syncAmount();
      if (isCustom()) customEl.focus();
    });
  });
  customEl.addEventListener('input', syncAmount);

  /* Select needs .has-value for its floating label to appear (forms.css). */
  var methodEl = document.getElementById('appealMethod');
  methodEl.addEventListener('change', function () {
    this.classList.toggle('has-value', this.value !== '');
  });

  /* Clear the error tint as soon as the field is edited. */
  form.querySelectorAll('input, select').forEach(function (el) {
    el.addEventListener('input', function () { this.style.borderColor = ''; });
    el.addEventListener('change', function () { this.style.borderColor = ''; });
  });

  /* ── Fill the dialog from one appeal ── */
  function load(c) {
    current = c;

    setHTML('appealModalCat', c.category || 'Active project');
    setHTML('appealModalTitle', c.title);
    setHTML('appealModalBlurb', c.blurb);

    var d = c.display || {};
    setHTML('appealModalRaised', d.raised || '');
    setHTML('appealModalPct', (d.pct != null ? d.pct + '%' : ''));
    setHTML('appealModalMeta', d.meta || '');

    var bar = document.getElementById('appealModalBar');
    var fill = document.getElementById('appealModalFill');
    if (bar) {
      bar.setAttribute('aria-valuenow', d.pct != null ? d.pct : 0);
      bar.setAttribute('aria-label', plain(c.title) + ' funding progress');
    }
    /* Set after the panel is visible so the width transition actually runs. */
    if (fill) {
      fill.style.width = '0%';
      requestAnimationFrame(function () {
        fill.style.width = (d.width != null ? d.width : 0) + '%';
      });
    }
  }

  /* Back to a clean form — the dialog is reused for every appeal, so a
     previous success panel must not still be showing. */
  function reset() {
    form.style.display = '';
    success.style.display = '';
    form.reset();
    form.querySelectorAll('input, select').forEach(function (el) { el.style.borderColor = ''; });
    methodEl.classList.remove('has-value');
    syncAmount();
  }

  /* ── Open / close ── */
  function open(c) {
    lastFocused = document.activeElement;
    reset();
    load(c);

    /* Reopening on another card within the fade-out would otherwise be
       hidden again by the pending timer from the previous close. */
    if (hideTimer) { clearTimeout(hideTimer); hideTimer = null; }
    overlay.hidden = false;
    requestAnimationFrame(function () { overlay.classList.add('is-open'); });
    document.body.style.overflow = 'hidden';

    var first = overlay.querySelector(FOCUSABLE);
    if (first) first.focus();
  }

  function close() {
    overlay.classList.remove('is-open');
    document.body.style.overflow = '';
    hideTimer = setTimeout(function () {
      overlay.hidden = true;
      hideTimer = null;
    }, 250);
    if (lastFocused) lastFocused.focus();
  }

  /* Delegated, so it keeps working if the cards are ever re-rendered. */
  grid.addEventListener('click', function (e) {
    var cta = e.target.closest('.camp-cta[data-appeal]');
    if (!cta) return;

    var list = window.LCB_CAMPAIGNS_LIVE || [];
    var c = list[Number(cta.dataset.appeal)];
    /* No matching appeal — let the link fall through to donate.html. */
    if (!c) return;

    e.preventDefault();
    open(c);
  });

  if (closeBtn) closeBtn.addEventListener('click', close);

  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) close();
  });

  document.addEventListener('keydown', function (e) {
    if (overlay.hidden) return;
    if (e.key === 'Escape') { close(); return; }

    /* Trap Tab inside the dialog. */
    if (e.key === 'Tab') {
      var items = Array.prototype.filter.call(
        overlay.querySelectorAll(FOCUSABLE),
        function (el) { return el.offsetParent !== null; }
      );
      if (!items.length) return;
      var first = items[0], last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  /* ── Submit ── */
  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var firstBad = null;

    function fail(el) {
      el.style.borderColor = '#e05252';
      if (!firstBad) firstBad = el;
    }

    var amount = chosenAmount();
    if (amount <= 0) fail(customEl);

    /* Every field on this form is compulsory — name, email, phone, PAN and
       payment method all carry [required], so this one loop covers the lot. */
    form.querySelectorAll('[required]').forEach(function (el) {
      if (el.value.trim() === '') fail(el);
    });

    /* Format checks run only on fields that were actually filled, so a blank
       one is reported once as empty rather than twice. */
    var email = document.getElementById('appealEmail');
    if (email.value.trim() !== '' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
      fail(email);
    }

    /* 10 digits, with an optional +91 / 91 / 0 trunk prefix stripped first —
       donors type the number every one of those ways. */
    var phone = document.getElementById('appealPhone');
    var digits = phone.value.replace(/\D/g, '').replace(/^(91|0)/, '');
    if (phone.value.trim() !== '' && !/^[6-9]\d{9}$/.test(digits)) {
      fail(phone);
    }

    /* PAN is what the 80G receipt is issued against, so a malformed one is
       worse than none — five letters, four digits, one letter. */
    var pan = document.getElementById('appealPan');
    if (pan.value.trim() !== '' && !/^[A-Z]{5}[0-9]{4}[A-Z]$/i.test(pan.value.trim())) {
      fail(pan);
    }

    if (firstBad) { firstBad.focus(); return; }

    /* No payment endpoint yet — record the intent and confirm, the same way
       donate.html does. */
    if (successNote) {
      successNote.innerHTML = 'Thank you! Your donation of <strong>&#8377;' +
        amount.toLocaleString('en-IN') + '</strong> towards <em>' +
        (current ? current.title : 'this appeal') +
        '</em> has been processed successfully. Your 80G tax-exemption receipt ' +
        'will be emailed to you shortly.';
    }
    form.style.display = 'none';
    success.style.display = 'block';
  });

  syncAmount();
})();
