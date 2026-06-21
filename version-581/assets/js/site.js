(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function setupMobileMenu() {
    var toggle = document.querySelector("[data-mobile-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  function setupSearchForms() {
    document.querySelectorAll("[data-search-form]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        var input = form.querySelector("input[name='q']");
        var query = input ? input.value.trim() : "";
        if (!query) {
          return;
        }
        event.preventDefault();
        var action = form.getAttribute("action") || "search.html";
        window.location.href = action + "?q=" + encodeURIComponent(query);
      });
    });
  }

  function setupHero() {
    var shell = document.querySelector("[data-hero-carousel]");
    if (!shell) {
      return;
    }
    var slides = Array.prototype.slice.call(shell.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(shell.querySelectorAll("[data-hero-dot]"));
    var prev = shell.querySelector("[data-hero-prev]");
    var next = shell.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });
    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }
    shell.addEventListener("mouseenter", stop);
    shell.addEventListener("mouseleave", start);
    start();
  }

  function setupCardFilters() {
    var filter = document.querySelector("[data-card-filter]");
    var list = document.querySelector("[data-filter-list]");
    if (!filter || !list) {
      return;
    }
    var keyword = filter.querySelector("[data-filter-keyword]");
    var type = filter.querySelector("[data-filter-type]");
    var year = filter.querySelector("[data-filter-year]");
    var cards = Array.prototype.slice.call(list.querySelectorAll("[data-movie-card]"));

    function apply() {
      var q = normalize(keyword && keyword.value);
      var t = normalize(type && type.value);
      var y = normalize(year && year.value);
      cards.forEach(function (card) {
        var text = normalize([
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-tags")
        ].join(" "));
        var matched = true;
        if (q && text.indexOf(q) === -1) {
          matched = false;
        }
        if (t && normalize(card.getAttribute("data-type")) !== t) {
          matched = false;
        }
        if (y && normalize(card.getAttribute("data-year")) !== y) {
          matched = false;
        }
        card.style.display = matched ? "" : "none";
      });
    }

    [keyword, type, year].forEach(function (control) {
      if (control) {
        control.addEventListener("input", apply);
        control.addEventListener("change", apply);
      }
    });
  }

  function createResultCard(movie) {
    var tags = (movie.tags || []).slice(0, 4).map(function (tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");
    return [
      "<a class=\"movie-card\" href=\"" + escapeHtml(movie.url) + "\">",
      "<span class=\"movie-poster\">",
      "<img src=\"./" + escapeHtml(movie.cover) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">",
      "<span class=\"duration\">" + escapeHtml(movie.duration) + "</span>",
      "<span class=\"play-mark\">▶</span>",
      "</span>",
      "<span class=\"movie-card-body\">",
      "<strong>" + escapeHtml(movie.title) + "</strong>",
      "<span class=\"movie-meta\">" + escapeHtml(movie.year) + " · " + escapeHtml(movie.region) + " · " + escapeHtml(movie.type) + "</span>",
      "<span class=\"movie-desc\">" + escapeHtml(movie.desc) + "</span>",
      "<span class=\"tag-row\">" + tags + "</span>",
      "</span>",
      "</a>"
    ].join("");
  }

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>"]/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;"
      }[char];
    });
  }

  function setupSearchPage() {
    var results = document.querySelector("[data-search-results]");
    if (!results || !window.MOVIE_INDEX) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var input = document.querySelector("[data-search-input]");
    var type = document.querySelector("[data-search-type]");
    var year = document.querySelector("[data-search-year]");
    var title = document.querySelector("[data-search-title]");
    var initialQuery = params.get("q") || "";
    if (input) {
      input.value = initialQuery;
    }

    function render() {
      var q = normalize(input && input.value);
      var t = normalize(type && type.value);
      var y = normalize(year && year.value);
      var data = window.MOVIE_INDEX.filter(function (movie) {
        var text = normalize([
          movie.title,
          movie.desc,
          movie.region,
          movie.type,
          movie.year,
          movie.genre,
          (movie.tags || []).join(" ")
        ].join(" "));
        if (q && text.indexOf(q) === -1) {
          return false;
        }
        if (t && normalize(movie.type) !== t) {
          return false;
        }
        if (y && normalize(movie.year) !== y) {
          return false;
        }
        return true;
      }).slice(0, 240);
      if (title) {
        title.textContent = q ? "搜索结果" : "推荐片单";
      }
      results.innerHTML = data.map(createResultCard).join("");
    }

    [input, type, year].forEach(function (control) {
      if (control) {
        control.addEventListener("input", render);
        control.addEventListener("change", render);
      }
    });
    if (initialQuery) {
      render();
    }
  }

  ready(function () {
    setupMobileMenu();
    setupSearchForms();
    setupHero();
    setupCardFilters();
    setupSearchPage();
  });
})();
