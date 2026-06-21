(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    function startTimer() {
      clearInterval(timer);
      timer = setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
        startTimer();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(current - 1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(current + 1);
        startTimer();
      });
    }

    showSlide(0);
    startTimer();
  }

  var filterInput = document.querySelector('[data-filter-input]');
  var sortSelect = document.querySelector('[data-sort-select]');
  var resetButton = document.querySelector('[data-filter-reset]');
  var grid = document.querySelector('[data-card-grid]');
  var emptyState = document.querySelector('[data-empty-state]');

  if (filterInput && grid) {
    var cards = Array.prototype.slice.call(grid.querySelectorAll('[data-movie-card]'));
    var initialCards = cards.slice();
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';

    if (query) {
      filterInput.value = query;
    }

    function normalize(value) {
      return String(value || '').toLowerCase().replace(/\s+/g, '');
    }

    function sortCards(list) {
      var mode = sortSelect ? sortSelect.value : 'default';
      var sorted = list.slice();

      if (mode === 'year-desc') {
        sorted.sort(function (a, b) {
          return Number(b.getAttribute('data-year')) - Number(a.getAttribute('data-year'));
        });
      }

      if (mode === 'year-asc') {
        sorted.sort(function (a, b) {
          return Number(a.getAttribute('data-year')) - Number(b.getAttribute('data-year'));
        });
      }

      if (mode === 'title-asc') {
        sorted.sort(function (a, b) {
          return a.getAttribute('data-title').localeCompare(b.getAttribute('data-title'), 'zh-CN');
        });
      }

      if (mode === 'default') {
        sorted = initialCards.slice();
      }

      sorted.forEach(function (card) {
        grid.appendChild(card);
      });
    }

    function applyFilter() {
      var value = normalize(filterInput.value);
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalize(card.getAttribute('data-title') + ' ' + card.getAttribute('data-type') + ' ' + card.getAttribute('data-meta'));
        var matched = !value || haystack.indexOf(value) !== -1;
        card.style.display = matched ? '' : 'none';
        if (matched) {
          visible += 1;
        }
      });

      sortCards(cards);

      if (emptyState) {
        emptyState.classList.toggle('show', visible === 0);
      }
    }

    filterInput.addEventListener('input', applyFilter);

    if (sortSelect) {
      sortSelect.addEventListener('change', applyFilter);
    }

    if (resetButton) {
      resetButton.addEventListener('click', function () {
        filterInput.value = '';
        if (sortSelect) {
          sortSelect.value = 'default';
        }
        applyFilter();
      });
    }

    applyFilter();
  }
})();
