(function () {
  'use strict';

  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
      return;
    }
    callback();
  }

  function setupMobileMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var nav = document.querySelector('[data-mobile-nav]');
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function setupImageFallbacks() {
    var images = document.querySelectorAll('[data-cover-image]');
    images.forEach(function (image) {
      image.addEventListener('error', function () {
        image.classList.add('is-missing');
        image.removeAttribute('src');
      }, { once: true });
    });
  }

  function setupHeroSlider() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        restart();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot') || '0'));
        restart();
      });
    });

    show(0);
    restart();
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function setupSearchPage() {
    var page = document.querySelector('[data-search-page]');
    if (!page) {
      return;
    }

    var input = page.querySelector('#searchInput');
    var yearFilter = page.querySelector('#yearFilter');
    var typeFilter = page.querySelector('#typeFilter');
    var categoryFilter = page.querySelector('#categoryFilter');
    var sortFilter = page.querySelector('#sortFilter');
    var resultCount = page.querySelector('#resultCount');
    var resultList = page.querySelector('#searchResults');
    var cards = Array.prototype.slice.call(page.querySelectorAll('.searchable-card'));
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q');

    if (query && input) {
      input.value = query;
    }

    function getSearchHaystack(card) {
      return normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-type'),
        card.getAttribute('data-category'),
        card.getAttribute('data-tags')
      ].join(' '));
    }

    function compareCards(a, b, mode) {
      if (mode === 'views-desc') {
        return Number(b.getAttribute('data-views') || 0) - Number(a.getAttribute('data-views') || 0);
      }
      if (mode === 'title-asc') {
        return String(a.getAttribute('data-title') || '').localeCompare(String(b.getAttribute('data-title') || ''), 'zh-Hans-CN');
      }
      return Number(b.getAttribute('data-year') || 0) - Number(a.getAttribute('data-year') || 0);
    }

    function applyFilters() {
      var term = normalize(input && input.value);
      var year = normalize(yearFilter && yearFilter.value);
      var type = normalize(typeFilter && typeFilter.value);
      var category = normalize(categoryFilter && categoryFilter.value);
      var sortMode = sortFilter ? sortFilter.value : 'year-desc';
      var matched = 0;

      cards.sort(function (a, b) {
        return compareCards(a, b, sortMode);
      });

      cards.forEach(function (card) {
        var cardYear = normalize(card.getAttribute('data-year'));
        var cardType = normalize(card.getAttribute('data-type'));
        var cardCategory = normalize(card.getAttribute('data-category'));
        var haystack = getSearchHaystack(card);
        var isMatch = true;

        if (term && haystack.indexOf(term) === -1) {
          isMatch = false;
        }
        if (year && cardYear !== year) {
          isMatch = false;
        }
        if (type && cardType !== type) {
          isMatch = false;
        }
        if (category && cardCategory !== category) {
          isMatch = false;
        }

        card.classList.toggle('is-hidden', !isMatch);
        if (isMatch) {
          matched += 1;
        }
        if (resultList) {
          resultList.appendChild(card);
        }
      });

      if (resultCount) {
        resultCount.textContent = String(matched);
      }
    }

    [input, yearFilter, typeFilter, categoryFilter, sortFilter].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilters);
        control.addEventListener('change', applyFilters);
      }
    });

    applyFilters();
  }

  function loadScriptOnce(src, callback) {
    var existing = document.querySelector('script[src="' + src + '"]');
    if (existing) {
      existing.addEventListener('load', callback, { once: true });
      if (window.Hls) {
        callback();
      }
      return;
    }

    var script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.onload = callback;
    document.head.appendChild(script);
  }

  function attachHls(video, url, fallbackUrl, onReady, onError) {
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = url;
      onReady();
      return;
    }

    function initWithHls(sourceUrl, allowFallback) {
      if (!window.Hls || !window.Hls.isSupported()) {
        onError('当前浏览器不支持 HLS 播放。');
        return;
      }

      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: false
      });

      hls.loadSource(sourceUrl);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
        onReady();
      });
      hls.on(window.Hls.Events.ERROR, function (event, data) {
        if (data && data.fatal) {
          hls.destroy();
          if (allowFallback && fallbackUrl && fallbackUrl !== sourceUrl) {
            initWithHls(fallbackUrl, false);
            return;
          }
          onError('播放源暂时无法加载。');
        }
      });
    }

    if (window.Hls) {
      initWithHls(url, true);
      return;
    }

    loadScriptOnce('https://cdn.jsdelivr.net/npm/hls.js@1/dist/hls.min.js', function () {
      initWithHls(url, true);
    });
  }

  function setupPlayers() {
    var playerButtons = document.querySelectorAll('[data-player-button]');
    playerButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        var shell = button.closest('.player-shell');
        var video = shell ? shell.querySelector('video[data-hls-url]') : null;
        if (!video) {
          return;
        }

        var url = video.getAttribute('data-hls-url');
        var fallbackUrl = video.getAttribute('data-fallback-hls');
        button.querySelector('strong').textContent = '正在加载';

        attachHls(video, url, fallbackUrl, function () {
          button.classList.add('is-hidden');
          var playPromise = video.play();
          if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(function () {
              video.controls = true;
            });
          }
        }, function (message) {
          button.querySelector('strong').textContent = message;
          button.querySelector('em').textContent = '请稍后重试或更换浏览器';
        });
      });
    });
  }

  ready(function () {
    setupMobileMenu();
    setupImageFallbacks();
    setupHeroSlider();
    setupSearchPage();
    setupPlayers();
  });
})();
