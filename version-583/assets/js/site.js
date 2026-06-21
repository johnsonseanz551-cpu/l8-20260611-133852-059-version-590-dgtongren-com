(function () {
  var menuButton = document.querySelector('.mobile-menu-button');
  var mobilePanel = document.querySelector('.mobile-panel');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      var open = mobilePanel.hasAttribute('hidden');
      if (open) {
        mobilePanel.removeAttribute('hidden');
        menuButton.setAttribute('aria-expanded', 'true');
        menuButton.textContent = '×';
      } else {
        mobilePanel.setAttribute('hidden', '');
        menuButton.setAttribute('aria-expanded', 'false');
        menuButton.textContent = '☰';
      }
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var currentSlide = 0;
  var heroTimer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    currentSlide = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === currentSlide);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === currentSlide);
    });
  }

  function nextSlide() {
    showSlide(currentSlide + 1);
  }

  function restartHero() {
    if (!slides.length) {
      return;
    }
    window.clearInterval(heroTimer);
    heroTimer = window.setInterval(nextSlide, 5200);
  }

  if (slides.length) {
    var previous = document.querySelector('[data-hero-prev]');
    var next = document.querySelector('[data-hero-next]');
    if (previous) {
      previous.addEventListener('click', function () {
        showSlide(currentSlide - 1);
        restartHero();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        nextSlide();
        restartHero();
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(parseInt(dot.getAttribute('data-hero-dot'), 10));
        restartHero();
      });
    });
    restartHero();
  }

  function normalize(text) {
    return String(text || '').toLowerCase().trim();
  }

  function applyFilter(input, list, extraFilter) {
    var query = normalize(input ? input.value : '');
    list.forEach(function (item) {
      var text = normalize(item.getAttribute('data-search') || item.textContent);
      var passText = !query || text.indexOf(query) !== -1;
      var passExtra = extraFilter ? extraFilter(item) : true;
      item.classList.toggle('is-filter-hidden', !(passText && passExtra));
    });
  }

  var inlineInputs = Array.prototype.slice.call(document.querySelectorAll('.inline-filter'));
  inlineInputs.forEach(function (input) {
    var section = input.closest('section') || document;
    var list = Array.prototype.slice.call(section.querySelectorAll('.filter-list > *'));
    input.addEventListener('input', function () {
      applyFilter(input, list);
    });
  });

  var searchInput = document.getElementById('movieSearchInput');
  var categoryFilter = document.getElementById('categoryFilter');
  var yearFilter = document.getElementById('yearFilter');
  var searchGrid = document.getElementById('movieSearchGrid');

  if (searchInput && searchGrid) {
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');
    if (q) {
      searchInput.value = q;
    }
    var searchItems = Array.prototype.slice.call(searchGrid.querySelectorAll('.movie-card'));
    var runSearch = function () {
      applyFilter(searchInput, searchItems, function (item) {
        var category = categoryFilter ? categoryFilter.value : '';
        var year = yearFilter ? yearFilter.value : '';
        var passCategory = !category || item.getAttribute('data-category') === category;
        var passYear = !year || item.getAttribute('data-year') === year;
        return passCategory && passYear;
      });
    };
    searchInput.addEventListener('input', runSearch);
    if (categoryFilter) {
      categoryFilter.addEventListener('change', runSearch);
    }
    if (yearFilter) {
      yearFilter.addEventListener('change', runSearch);
    }
    runSearch();
  }

  function startPlayer(wrapper) {
    var video = wrapper.querySelector('.movie-player');
    var button = wrapper.querySelector('.player-start');
    if (!video) {
      return;
    }
    var stream = video.getAttribute('data-stream');
    if (!stream) {
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      if (!video._hlsInstance) {
        video._hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        video._hlsInstance.loadSource(stream);
        video._hlsInstance.attachMedia(video);
      }
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      if (!video.src) {
        video.src = stream;
      }
    } else {
      if (!video.src) {
        video.src = stream;
      }
    }
    if (button) {
      button.classList.add('is-hidden');
    }
    var attempt = video.play();
    if (attempt && typeof attempt.catch === 'function') {
      attempt.catch(function () {});
    }
  }

  Array.prototype.slice.call(document.querySelectorAll('.player-box')).forEach(function (wrapper) {
    var button = wrapper.querySelector('.player-start');
    var video = wrapper.querySelector('.movie-player');
    if (button) {
      button.addEventListener('click', function () {
        startPlayer(wrapper);
      });
    }
    if (video) {
      video.addEventListener('click', function () {
        startPlayer(wrapper);
      });
      video.addEventListener('play', function () {
        if (button) {
          button.classList.add('is-hidden');
        }
      });
    }
  });
})();
