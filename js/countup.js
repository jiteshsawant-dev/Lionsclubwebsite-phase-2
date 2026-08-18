(function () {
  const strip = document.querySelector('.numbers-strip');
  if (!strip) return;

  const items = strip.querySelectorAll('.ns-item .big');
  let animated = false;

  function parse(text) {
    const t = text.trim();
    const prefixMatch = t.match(/^([^\d]*)/);
    const prefix = prefixMatch ? prefixMatch[1] : '';
    const suffixMatch = t.match(/[\D]+$/);
    const suffix = suffixMatch ? suffixMatch[0] : '';
    const numStr = t.slice(prefix.length, suffix ? t.lastIndexOf(suffix[0]) : t.length).replace(/,/g, '');
    const num = parseFloat(numStr) || 0;
    const hasComma = /\d,\d/.test(t);
    return { prefix, suffix, num, hasComma };
  }

  function fmt(n, hasComma) {
    if (!hasComma) return String(Math.round(n));
    return Math.round(n).toLocaleString('en-IN');
  }

  function run(el, duration) {
    const { prefix, suffix, num, hasComma } = parse(el.textContent);
    const t0 = performance.now();
    function tick(now) {
      const p = Math.min((now - t0) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = prefix + fmt(eased * num, hasComma) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  new IntersectionObserver(function (entries) {
    if (entries[0].isIntersecting && !animated) {
      animated = true;
      items.forEach(function (el) { run(el, 1800); });
    }
  }, { threshold: 0.3 }).observe(strip);
})();
