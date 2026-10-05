(function () {
  if (!document.querySelector('.poster')) return; /* front page only */
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!('IntersectionObserver' in window)) return;

  /* [selector, direction it flies in from] */
  var groups = [
    ['.section-heading > *',                '-220px 0'],
    ['.project-card:nth-child(odd)',        '-260px 0'],
    ['.project-card:nth-child(even)',       '260px 0'],
    ['.tools-heading > *',                  '0 120px'],
    ['.tool-item',                          '0 140px'],
    ['.work-with-me > div:first-child > *', '-220px 0'],
    ['.contact-links a',                    '240px 0'],
    ['.resume-content > *',                 '-220px 0'],
    ['.qr-container > *',                   '220px 0'],
    ['.foot > *',                           '0 90px']
  ];

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  groups.forEach(function (g) {
    document.querySelectorAll(g[0]).forEach(function (el) {
      var i = Array.prototype.indexOf.call(el.parentNode.children, el);
      el.style.setProperty('--from', g[1]);
      el.style.setProperty('--d', Math.min(i, 6) * 0.12 + 's'); /* stagger */
      el.classList.add('reveal');
      io.observe(el);
    });
  });
})();