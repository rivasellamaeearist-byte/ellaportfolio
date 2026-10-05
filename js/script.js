(function () {
  var root = document.documentElement;
  var sw = document.getElementById('themeSwitch');
  var lab = document.getElementById('swLabel');

 function paint() {
  if (!sw || !lab) return;

  var dark = root.dataset.theme === 'dark';

  sw.setAttribute('aria-checked', String(dark));
  sw.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');

  lab.textContent = dark ? 'Dark' : 'Light';
}
  paint();

  if (sw) {
    sw.addEventListener('click', function () {
      root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
      try { localStorage.setItem('theme', root.dataset.theme); } catch (e) {}
      paint();
    });
  }

  // Accessible project gallery
  var gallery = document.getElementById('projectGallery');

  if (gallery) {
    var cards = Array.from(document.querySelectorAll('.project-open'));
    var back = document.getElementById('galleryBack');
    var image = document.getElementById('galleryImage');
    var title = document.getElementById('galleryTitle');
    var category = document.getElementById('galleryCategory');
    var description = document.getElementById('galleryDescription');
    var tags = document.getElementById('galleryTags');
    var prev = document.getElementById('galleryPrev');
    var next = document.getElementById('galleryNext');
    var count = document.getElementById('galleryCount');
    var activeCard = null;
    var galleryImages = [];
    var galleryIndex = 0;

    function renderGallery() {
      image.src = galleryImages[galleryIndex];
      image.alt = title.textContent + ' project image ' + (galleryIndex + 1);
      count.textContent = (galleryIndex + 1) + ' / ' + galleryImages.length;
      prev.disabled = galleryIndex === 0;
      next.disabled = galleryIndex === galleryImages.length - 1;
    }

    function openGallery(card) {
      activeCard = card;
      var heading = card.querySelector('h2');
      var para = card.querySelector('.project-info p');
      var categoryText = card.querySelector('.project-info>span');

      galleryImages = (card.dataset.gallery || '')
        .split(',')
        .map(function (src) { return src.trim(); })
        .filter(Boolean)
        .slice(0, 4);

      if (!galleryImages.length) return;

      title.textContent = heading ? heading.textContent : 'Project';
      description.textContent = para ? para.textContent : '';
      category.textContent = categoryText ? categoryText.textContent : 'PROJECT';
      tags.innerHTML = '';

      card.querySelectorAll('.tags li').forEach(function (tag) {
        var li = document.createElement('li');
        li.textContent = tag.textContent;
        tags.appendChild(li);
      });

      galleryIndex = 0;
      renderGallery();
      gallery.classList.add('is-open');
      gallery.setAttribute('aria-hidden', 'false');
      document.body.classList.add('gallery-active');
      back.focus();
    }

    function closeGallery() {
      gallery.classList.remove('is-open');
      gallery.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('gallery-active');
      if (activeCard) activeCard.focus();
    }

    cards.forEach(function (card) {
      card.addEventListener('click', function (event) {
        if (!event.target.closest('a')) openGallery(card);
      });

      card.addEventListener('keydown', function (event) {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          openGallery(card);
        }
      });
    });

    back.addEventListener('click', closeGallery);

    prev.addEventListener('click', function () {
      if (galleryIndex > 0) {
        galleryIndex--;
        renderGallery();
      }
    });

    next.addEventListener('click', function () {
      if (galleryIndex < galleryImages.length - 1) {
        galleryIndex++;
        renderGallery();
      }
    });

    gallery.addEventListener('click', function (event) {
      if (event.target === gallery) closeGallery();
    });

    document.addEventListener('keydown', function (event) {
      if (!gallery.classList.contains('is-open')) return;
      if (event.key === 'Escape') closeGallery();
      if (event.key === 'ArrowLeft' && galleryIndex > 0) {
        galleryIndex--;
        renderGallery();
      }
      if (event.key === 'ArrowRight' && galleryIndex < galleryImages.length - 1) {
        galleryIndex++;
        renderGallery();
      }
    });

    // Open the selected project automatically when arriving from Selected Work.
    var hash = window.location.hash;
    if (hash) {
      var targetId;
      try { targetId = decodeURIComponent(hash.substring(1)); }
      catch (e) { targetId = hash.substring(1); }
      var targetCard = document.getElementById(targetId);
      if (targetCard && targetCard.classList.contains('project-open')) {
        openGallery(targetCard);
      }
    }
  }

  // If profile.jpg is missing, show initials instead of a broken image.
  document.querySelectorAll('.avatar img, .portrait img').forEach(function (img) {
    img.addEventListener('error', function () { img.classList.add('missing'); });
  });
})();
/* INTERACTIONS (paste at the very bottom of script.js, after your existing code) */
(function () {
  var fine = matchMedia('(hover:hover) and (pointer:fine)').matches;
  var reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;
  if (reduce) return;

  // 1. Background glow: follows cursor, or the finger on touch screens
  var a = document.createElement('div');
  a.id = 'aura';
  a.setAttribute('aria-hidden', 'true');
  document.body.appendChild(a);

  var x = innerWidth / 2, y = innerHeight / 3, tx = x, ty = y, hideT;
  function loop() {
    x += (tx - x) * .12;
    y += (ty - y) * .12;
    a.style.transform = 'translate(' + x + 'px,' + y + 'px)';
    requestAnimationFrame(loop);
  }
  loop();

  function move(e) {
    tx = e.clientX; ty = e.clientY;
    a.style.opacity = 1;
    if (!fine) {
      clearTimeout(hideT);
      hideT = setTimeout(function () { a.style.opacity = 0; }, 1200);
    }
  }
  addEventListener('pointermove', move, { passive: true });
  addEventListener('pointerdown', move, { passive: true });

  // 2. Hero letters (home page only)
  var word = document.querySelector('.hero-word');
  if (word) {
    var text = word.textContent.trim();
    word.textContent = '';
    text.split('').forEach(function (c) {
      var s = document.createElement('span');
      s.textContent = c;
      s.addEventListener('pointerdown', function () {
        s.classList.add('pop');
        setTimeout(function () { s.classList.remove('pop'); }, 450);
      });
      word.appendChild(s);
    });
  }

  // Click / tap ripple
  document.addEventListener('pointerdown', function (e) {
    var el = e.target.closest('.resume-button,.project-card,.project-box,.gallery-back');
    if (!el) return;
    var r = el.getBoundingClientRect();
    var s = Math.max(r.width, r.height) * 2;
    var d = document.createElement('span');
    d.className = 'rip';
    d.style.cssText = 'width:' + s + 'px;height:' + s + 'px;left:' + (e.clientX - r.left - s / 2) +
      'px;top:' + (e.clientY - r.top - s / 2) + 'px';
    el.appendChild(d);
    setTimeout(function () { d.remove(); }, 700);
    if (el.classList.contains('project-card')) {
      el.classList.add('on');
      setTimeout(function () { el.classList.remove('on'); }, 900);
    }
  });

  // Mouse-only effects (skipped on phones and tablets)
  if (fine) {
    // Card tilt
    document.querySelectorAll('.project-card,.project-box').forEach(function (c) {
      c.addEventListener('pointermove', function (e) {
        var r = c.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - .5;
        var py = (e.clientY - r.top) / r.height - .5;
        c.style.transform = 'perspective(900px) rotateY(' + px * 6 + 'deg) rotateX(' + (-py * 6) + 'deg) translateY(-4px)';
      });
      c.addEventListener('pointerleave', function () { c.style.transform = ''; });
    });

    // Magnetic buttons
    document.querySelectorAll('.resume-button').forEach(function (b) {
      b.addEventListener('pointermove', function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = 'translate(' + (e.clientX - r.left - r.width / 2) * .18 + 'px,' +
          (e.clientY - r.top - r.height / 2) * .28 + 'px)';
      });
      b.addEventListener('pointerleave', function () { b.style.transform = ''; });
    });
  }
})();
/* Reliable resume download */
document.querySelectorAll('a[download]').forEach(function (link) {
  link.addEventListener('click', function (e) {
    e.preventDefault();
    var url = link.getAttribute('href');
    var name = link.getAttribute('download') || 'download';

    fetch(url)
      .then(function (res) {
        if (!res.ok) throw new Error('File not found');
        return res.blob();
      })
      .then(function (blob) {
        var a = document.createElement('a');
        var objectUrl = URL.createObjectURL(blob);
        a.href = objectUrl;
        a.download = name;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(function () { URL.revokeObjectURL(objectUrl); }, 1000);
      })
      .catch(function () {
        window.open(url, '_blank', 'noopener');
      });
  });
});