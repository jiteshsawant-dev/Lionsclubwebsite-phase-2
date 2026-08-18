(function(){
  (function(){
    var current  = 0;
    var slides   = document.querySelectorAll('.tl-v2-slide');
    var yrItems  = document.querySelectorAll('.tl-v2-yr');
    var currEl   = document.getElementById('v2Curr');
    var fillEl   = document.getElementById('v2Fill');
    var section  = document.querySelector('.tl-v2');

    /* Not on this page — nothing to wire up */
    if(!section || !slides.length) return;

    var TOTAL = slides.length;

    /* Vertical offsets (px from center) for items at distance 0,1,2,3,4+ */
    var YOFF = [0, 130, 215, 285, 345, 395];

    function pad(n){ return n < 10 ? '0'+n : ''+n; }

    function layout(cur){
      yrItems.forEach(function(item, i){
        var dist    = i - cur;
        var absDist = Math.abs(dist);
        var sign    = dist >= 0 ? 1 : -1;
        var yOff    = sign * YOFF[Math.min(absDist, YOFF.length - 1)];
        item.style.setProperty('--yoff', yOff + 'px');
        item.classList.toggle('v2-active', dist === 0);
        item.classList.toggle('v2-near',   absDist === 1);
        item.style.opacity = absDist === 0 ? '1'
                           : absDist === 1 ? '0.7'
                           : absDist === 2 ? '0.4'
                           : '0';
        item.style.pointerEvents = absDist <= 2 ? 'auto' : 'none';
      });
    }

    function goTo(idx){
      if(idx === current) return;
      slides[current].classList.remove('active');
      current = (idx + TOTAL) % TOTAL;
      slides[current].classList.add('active');
      if(currEl) currEl.textContent = pad(current + 1);
      if(fillEl) fillEl.style.width = ((current + 1) / TOTAL * 100) + '%';
      layout(current);
    }

    /* Initial layout */
    layout(0);

    /* Scroll tooltip */
    var scrollZone = document.getElementById('v2ScrollZone');
    var scrollTip  = document.getElementById('v2ScrollTip');
    var tipHideTimer = null;
    var tipDismissed = false;
    if(scrollZone && scrollTip){
    scrollZone.addEventListener('mouseenter', function(){
      if(!tipDismissed) scrollTip.classList.add('visible');
    });
    scrollZone.addEventListener('mouseleave', function(){
      scrollTip.classList.remove('visible');
    });
    scrollZone.addEventListener('mousemove', function(e){
      scrollTip.style.left = e.clientX + 'px';
      scrollTip.style.top  = e.clientY + 'px';
    });
    section.addEventListener('wheel', function(){
      if(tipDismissed) return;
      if(tipHideTimer) return;
      tipHideTimer = setTimeout(function(){
        scrollTip.classList.remove('visible');
        tipDismissed = true;
      }, 2000);
    }, { passive: true });
    }

    /* ── Wheel navigation ──
       One deliberate gesture should move one era. The previous handler stepped
       on every wheel event behind a 180ms timer, which a mouse wheel survives
       but a trackpad does not: a single two-finger flick on a MacBook emits a
       burst of small-delta events plus up to ~1.5s of inertial tail at 60-120Hz,
       so one swipe tore through five or more eras.

       Two changes fix it. Distance drives the step, not event count — deltas
       accumulate until they clear THRESHOLD, so a trackpad's 1-3px events have
       to add up to what a mouse wheel delivers in a single ~100px notch. And
       after a step the handler stops counting until the gesture actually ends
       (STOP_MS of silence), which drains the inertial tail rather than riding
       it. MAX_HOLD releases that pause regardless, so holding a continuous
       scroll still advances — just never faster than the 0.3s content fade in
       about-pages.css can keep up with. */
    var THRESHOLD = 100;  /* accumulated px for one step — one mouse notch */
    var STOP_MS   = 140;  /* silence that marks the end of a gesture */
    var MAX_HOLD  = 600;  /* ceiling on the post-step pause */
    var LINE_PX   = 40;   /* deltaMode 1 (Firefox) reports lines, not pixels */

    var accum     = 0;
    var paused    = false;
    var idleTimer = null;
    var holdTimer = null;

    function endGesture(){
      accum  = 0;
      paused = false;
      if(holdTimer){ clearTimeout(holdTimer); holdTimer = null; }
    }

    function pixels(e){
      if(e.deltaMode === 1) return e.deltaY * LINE_PX;
      if(e.deltaMode === 2) return e.deltaY * window.innerHeight;
      return e.deltaY;
    }

    section.addEventListener('wheel', function(e){
      /* Right side (>70% viewport width) — let the page scroll naturally */
      if(e.clientX > window.innerWidth * 0.70){ endGesture(); return; }

      var dy = pixels(e);
      /* At either end, hand the gesture back to the page — and forget what was
         banked, so returning to the timeline doesn't step on the first event. */
      if(dy > 0 && current === TOTAL - 1){ endGesture(); return; }
      if(dy < 0 && current === 0){ endGesture(); return; }
      e.preventDefault();

      if(idleTimer) clearTimeout(idleTimer);
      idleTimer = setTimeout(endGesture, STOP_MS);

      if(paused) return;

      /* Reversing mid-gesture starts the count over, so a correction upward
         isn't first cancelled out by the downward delta already banked. */
      if((dy > 0) !== (accum > 0)) accum = 0;
      accum += dy;

      if(Math.abs(accum) >= THRESHOLD){
        goTo(current + (accum > 0 ? 1 : -1));
        accum  = 0;
        paused = true;
        holdTimer = setTimeout(function(){
          paused    = false;
          holdTimer = null;
        }, MAX_HOLD);
      }
    }, { passive: false });


    yrItems.forEach(function(item){
      item.addEventListener('click', function(){
        goTo(parseInt(this.dataset.index, 10));
      });
    });

    var tx = 0;
    section.addEventListener('touchstart', function(e){ tx = e.touches[0].clientX; }, {passive:true});
    section.addEventListener('touchend', function(e){
      var dx = e.changedTouches[0].clientX - tx;
      if(Math.abs(dx) > 40) goTo(dx < 0 ? current + 1 : current - 1);
    }, {passive:true});

    /* Keyboard: only when v2 section is in view */
    document.addEventListener('keydown', function(e){
      var rect = section.getBoundingClientRect();
      if(rect.top > window.innerHeight || rect.bottom < 0) return;
      if(e.key === 'ArrowUp'   || e.key === 'ArrowLeft')  goTo(current - 1);
      if(e.key === 'ArrowDown' || e.key === 'ArrowRight') goTo(current + 1);
    });
  })();
})();
