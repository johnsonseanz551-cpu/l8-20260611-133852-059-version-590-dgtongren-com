(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function initNavigation() {
    var toggle = document.querySelector("[data-nav-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      nav.classList.toggle("open");
    });
  }

  function initHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    if (slides.length < 2) {
      return;
    }
    var current = 0;
    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === current);
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
      });
    });
    window.setInterval(function () {
      show(current + 1);
    }, 5200);
  }

  function initSearch() {
    var inputs = Array.prototype.slice.call(document.querySelectorAll("[data-site-search]"));
    inputs.forEach(function (input) {
      var scope = document.querySelector(input.getAttribute("data-site-search")) || document;
      var items = Array.prototype.slice.call(scope.querySelectorAll("[data-search-text]"));
      input.addEventListener("input", function () {
        var query = input.value.trim().toLowerCase();
        items.forEach(function (item) {
          var text = item.getAttribute("data-search-text").toLowerCase();
          item.classList.toggle("is-hidden", query && text.indexOf(query) === -1);
        });
      });
    });
  }

  function initImages() {
    Array.prototype.slice.call(document.querySelectorAll("img")).forEach(function (img) {
      img.addEventListener("error", function () {
        img.classList.add("is-hidden");
      }, { once: true });
    });
  }

  window.startMoviePlayer = function (source) {
    var video = document.querySelector("[data-player-video]");
    var button = document.querySelector("[data-player-button]");
    var shell = document.querySelector("[data-player-shell]");
    var attached = false;
    if (!video || !source) {
      return;
    }
    function attachSource() {
      if (attached) {
        return;
      }
      attached = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }
    }
    function play() {
      attachSource();
      if (shell) {
        shell.classList.add("is-playing");
      }
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {});
      }
    }
    if (button) {
      button.addEventListener("click", play);
    }
    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      }
    });
    video.addEventListener("play", function () {
      if (shell) {
        shell.classList.add("is-playing");
      }
    });
  };

  ready(function () {
    initNavigation();
    initHero();
    initSearch();
    initImages();
  });
})();
