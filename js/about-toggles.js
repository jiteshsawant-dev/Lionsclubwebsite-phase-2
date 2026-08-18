(function(){
  /* ── helper: collapse once the next section has fully scrolled into view ── */
  function autoCollapse(toggleBtn, collapseCallback, nextSection) {
    var observer = null;
    function attach() {
      if (!nextSection) return;
      if (observer) observer.disconnect();
      observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          if (entry.isIntersecting) {
            observer.disconnect();
            observer = null;
            collapseCallback();
          }
        });
      }, { threshold: 0, rootMargin: '0px 0px -100% 0px' });
      observer.observe(nextSection);
    }
    return attach;
  }

  /* ── helper: whatever section follows the one holding this button ── */
  function nextAfter(el) {
    var own = el.closest('section');
    if (!own) return document.querySelector('footer');
    return own.nextElementSibling || document.querySelector('footer');
  }

  /* ── Board of Directors ── */
  var boardToggleBtn = document.getElementById('boardToggle');
  if (boardToggleBtn) {
    var grid = document.querySelector('.board-grid');
    var boardAttach = autoCollapse(boardToggleBtn, function() {
      grid.classList.remove('is-expanded');
      boardToggleBtn.classList.remove('is-open');
      boardToggleBtn.firstChild.textContent = 'View all ';
    }, nextAfter(boardToggleBtn));

    boardToggleBtn.addEventListener('click', function() {
      var expanded = boardToggleBtn.classList.toggle('is-open');
      grid.classList.toggle('is-expanded', expanded);
      boardToggleBtn.firstChild.textContent = expanded ? 'Show fewer ' : 'View all ';
      if (expanded) boardAttach();
    });
  }

  /* ── Past Presidents ── */
  var toggleBtn = document.getElementById('presidentsToggle');
  if (toggleBtn) {
    var extras = document.querySelectorAll('.pres-card--extra');
    var presAttach = autoCollapse(toggleBtn, function() {
      extras.forEach(function(card) { card.hidden = true; });
      toggleBtn.classList.remove('is-open');
      toggleBtn.firstChild.textContent = 'See all presidents ';
    }, nextAfter(toggleBtn));

    toggleBtn.addEventListener('click', function() {
      var expanded = toggleBtn.classList.toggle('is-open');
      extras.forEach(function(card) { card.hidden = !expanded; });
      toggleBtn.firstChild.textContent = expanded ? 'Show fewer presidents ' : 'See all presidents ';
      if (expanded) presAttach();
    });
  }
})();
