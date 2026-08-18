/* ══════════════════════════════════════════════════════════════════
   MEMBERSHIP APPLICATION MODAL
   Opens from the "Apply for membership" CTA. Fields mirror
   Pdf/"Print file.pdf" (Application For Membership v3.0).

   There is no backend in this project, so submit mirrors the existing
   contact.html behaviour: validate client-side, then swap the form for
   a success panel. Wire the POST here when an endpoint exists.
   ══════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var overlay = document.getElementById('memOverlay');
  var openBtn = document.getElementById('applyMembershipBtn');
  var closeBtn = document.getElementById('memClose');
  var form = document.getElementById('memForm');
  var success = document.getElementById('memSuccess');

  if (!overlay || !openBtn) return;

  var lastFocused = null;

  var FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), ' +
                  'select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

  function open(e) {
    if (e) e.preventDefault();
    lastFocused = document.activeElement;
    overlay.hidden = false;
    /* Next frame so the transition runs from the hidden state. */
    requestAnimationFrame(function () { overlay.classList.add('is-open'); });
    document.body.style.overflow = 'hidden';

    var first = overlay.querySelector(FOCUSABLE);
    if (first) first.focus();
  }

  function close() {
    overlay.classList.remove('is-open');
    document.body.style.overflow = '';
    /* Wait for the fade-out before hiding, so it animates. */
    setTimeout(function () { overlay.hidden = true; }, 250);
    if (lastFocused) lastFocused.focus();
  }

  openBtn.addEventListener('click', open);
  if (closeBtn) closeBtn.addEventListener('click', close);

  /* Click the backdrop (not the panel) to dismiss. */
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
        function (el) { return el.offsetParent !== null || el.type === 'file'; }
      );
      if (!items.length) return;
      var first = items[0], last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  /* Selects need .has-value so their floating label appears (see forms.css). */
  overlay.querySelectorAll('.cf-group select').forEach(function (sel) {
    sel.addEventListener('change', function () {
      this.classList.toggle('has-value', this.value !== '');
    });
  });

  /* Date inputs use the same .has-value flag: while empty and unfocused they
     hide the browser's dd-mm-yyyy text and picker icon, so they read as an
     ordinary empty field instead of a pre-filled one. */
  overlay.querySelectorAll('.cf-group input[type="date"]').forEach(function (d) {
    var sync = function () { d.classList.toggle('has-value', d.value !== ''); };
    d.addEventListener('change', sync);
    d.addEventListener('input', sync);
    d.addEventListener('blur', sync);
    sync();
  });

  /* Photo uploads — preview the chosen image inside the placeholder frame. */
  overlay.querySelectorAll('.mem-upload input[type="file"]').forEach(function (input) {
    var objectUrl = null;
    var wrap = input.closest('.mem-upload');
    var box = wrap.querySelector('.u-box');
    var hint = wrap.querySelector('.u-hint');
    var removeBtn = wrap.querySelector('.u-remove');

    function clear() {
      if (objectUrl) { URL.revokeObjectURL(objectUrl); objectUrl = null; }
      input.value = '';
      wrap.classList.remove('has-file');
      hint.textContent = 'Click to upload';
      box.style.backgroundImage = '';
    }

    input.addEventListener('change', function () {
      /* Release the previous preview before replacing it. */
      if (objectUrl) { URL.revokeObjectURL(objectUrl); objectUrl = null; }

      if (this.files && this.files.length) {
        var file = this.files[0];
        wrap.classList.add('has-file');
        hint.textContent = file.name;
        if (/^image\//.test(file.type)) {
          objectUrl = URL.createObjectURL(file);
          box.style.backgroundImage = 'url("' + objectUrl + '")';
        }
      } else {
        clear();
      }
    });

    if (removeBtn) {
      removeBtn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        clear();
      });
    }
  });

  /* Clear the error tint as soon as the user edits a field. */
  if (form) {
    form.querySelectorAll('input, textarea, select').forEach(function (el) {
      el.addEventListener('input', function () { this.style.borderColor = ''; });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var valid = true;
      var firstBad = null;

      form.querySelectorAll('[required]').forEach(function (el) {
        var ok = el.type === 'checkbox' ? el.checked : el.value.trim() !== '';
        if (!ok) {
          valid = false;
          if (el.type !== 'checkbox') el.style.borderColor = '#e05252';
          if (!firstBad) firstBad = el;
        } else if (el.type !== 'checkbox') {
          el.style.borderColor = '';
        }
      });

      if (!valid) {
        if (firstBad) firstBad.focus();
        return;
      }

      /* No endpoint exists yet — mirror contact.html and show the success panel. */
      form.style.display = 'none';
      if (success) success.style.display = 'block';
      overlay.querySelector('.mem-modal').scrollIntoView({ block: 'start' });
    });
  }
})();
