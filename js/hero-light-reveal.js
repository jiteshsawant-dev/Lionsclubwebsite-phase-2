(function(){
  var hero = document.querySelector('.light-hero');
  if (!hero) return;
  var anchor = hero.querySelector('.beam-anchor');
  var photo = hero.querySelector('.light-hero-photo img');

  /* All pixel values below are calibrated for Figma's 1440x810 frame.
     On a wider viewport the whole effect otherwise renders too far left
     (translateX doesn't grow with the container) — so every frame we
     rescale by the hero's actual width/height against that reference. */
  var FIGMA_WIDTH = 1440, FIGMA_HEIGHT = 810;

  /* Real numbers pulled from Figma's own exported SVG for this component
     (Component 7.svg / Component 8.svg), not the CSS approximation the
     design-context tool gave. The paint is just 2 colors (cream, navy)
     transitioning over 114.231deg, then solid navy the rest of the way —
     rendered via a huge conic-gradient plane transformed by a matrix.
     Both frames' matrices are rescaled here to the SAME plane size
     (2001.47px, matching Component 8's) so they can be lerped directly:
     translateY (f) and scaleX (a) barely move — translateX (e) sweeps
     left-to-right, and scaleY (d) stretches the ellipse to flood the
     frame. b/c are ~0 in both and stay 0. */
  /* f (translateY) is 0 in BOTH frames, where Figma's raw value was the nav's
     86px height. .light-hero-beam is flipped with scaleY(-1), so a positive f
     no longer pushes the gradient's bright origin DOWN from the nav — it pushes
     it UP from the hero's bottom edge, and everything below that origin wraps
     past 360deg in the conic and paints navy. Any f > 0 therefore opens an
     f-pixel navy band between the bright ray and the bottom photo edge.
     Pinning f to 0 for the whole sweep keeps the ray flush with the bottom
     from the first frame, so the light never has a gap under it to grow into. */
  var A0 = -1.3525, D0 = 0.9701, E0 = 87.5001, F0 = 0; // Component 7 (start)
  /* E1 pushed out from Figma's raw 1357 to 2000: at the raw value the
     cream→navy blend arc still crossed into solid navy within the visible
     right edge for normal hero heights, leaving a dark wedge visible at
     rest. Pushing E1 out moves the whole blend arc past the right edge so
     the hero settles fully into the light/cream tone, with navy never
     visible in the resting state. */
  var A1 = -1.357,  D1 = 2.437,  E1 = 2000,    F1 = 0; // Component 8 (end)
  var DURATION = 3600, DELAY = 200;

  function lerp(a, b, t){ return a + (b - a) * t; }
  /* Same ease-in as before for the first half (4*t^3), but the back half
     is now a gentler quadratic decay instead of cubic. Cubic's back half
     was already ~96% done by 80% of the duration — dropping the power
     makes it hold on to more progress for longer, so the finish reads as
     a slow settle instead of snapping to rest almost immediately. */
  function easeInOutCubic(t){ return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }

  function renderBeam(progress){
    var t = easeInOutCubic(Math.min(1, Math.max(0, progress)));
    var rect = hero.getBoundingClientRect();
    var wRatio = rect.width / FIGMA_WIDTH;
    var hRatio = rect.height / FIGMA_HEIGHT;
    var a = lerp(A0, A1, t) * wRatio;
    var d = lerp(D0, D1, t) * hRatio;
    var e = lerp(E0, E1, t) * wRatio;
    var f = lerp(F0, F1, t); // pinned at 0 both ends — see F0/F1 above; kept as a lerp for symmetry
    anchor.style.transform = 'matrix(' + a + ', 0, 0, ' + d + ', ' + e + ', ' + f + ')';
    photo.style.opacity = (0.12 + 0.88 * t).toFixed(3);
  }

  var startTime = null;
  function frame(ts){
    if (startTime === null) startTime = ts;
    var elapsed = ts - startTime - DELAY;
    var progress = elapsed <= 0 ? 0 : Math.min(1, elapsed / DURATION);
    renderBeam(progress);
    if (progress < 1) requestAnimationFrame(frame);
  }
  renderBeam(0);
  requestAnimationFrame(frame);
})();
