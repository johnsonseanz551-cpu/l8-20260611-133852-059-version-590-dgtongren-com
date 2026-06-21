const Hls = window.Hls;

const qs = (selector, root = document) => root.querySelector(selector);
const qsa = (selector, root = document) =>
  Array.from(root.querySelectorAll(selector));

function initMobileMenu() {
  const toggle = qs("[data-mobile-toggle]");
  const menu = qs("[data-mobile-menu]");
  if (!toggle || !menu) {
    return;
  }
  toggle.addEventListener("click", () => {
    menu.classList.toggle("open");
  });
}

function initHero() {
  const hero = qs("[data-hero]");
  if (!hero) {
    return;
  }
  const slides = qsa("[data-hero-slide]", hero);
  const tabs = qsa("[data-hero-tab]", hero);
  if (!slides.length) {
    return;
  }
  let activeIndex = 0;
  let timer = null;

  const show = (index) => {
    activeIndex = (index + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle("active", slideIndex === activeIndex);
    });
    tabs.forEach((tab, tabIndex) => {
      tab.classList.toggle("active", tabIndex === activeIndex);
    });
  };

  const start = () => {
    stop();
    timer = window.setInterval(() => show(activeIndex + 1), 5200);
  };

  const stop = () => {
    if (timer) {
      window.clearInterval(timer);
    }
  };

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const index = Number(tab.dataset.heroTab || 0);
      show(index);
      start();
    });
  });

  hero.addEventListener("mouseenter", stop);
  hero.addEventListener("mouseleave", start);
  show(0);
  start();
}

function textValue(element, name) {
  return (element.dataset[name] || "").toLowerCase();
}

function initPageFilters() {
  const panel = qs("[data-filter-panel]");
  if (!panel) {
    return;
  }
  const search = qs("[data-page-search]", panel);
  const type = qs("[data-filter-type]", panel);
  const region = qs("[data-filter-region]", panel);
  const genre = qs("[data-filter-genre]", panel);
  const cards = qsa("[data-card]");

  const apply = () => {
    const keyword = (search?.value || "").trim().toLowerCase();
    const typeValue = (type?.value || "").toLowerCase();
    const regionValue = (region?.value || "").toLowerCase();
    const genreValue = (genre?.value || "").toLowerCase();
    cards.forEach((card) => {
      const blob = [
        textValue(card, "title"),
        textValue(card, "region"),
        textValue(card, "type"),
        textValue(card, "year"),
        textValue(card, "genre"),
        textValue(card, "tags"),
      ].join(" ");
      const matched =
        (!keyword || blob.includes(keyword)) &&
        (!typeValue || textValue(card, "type").includes(typeValue)) &&
        (!regionValue ||
          textValue(card, "region").includes(regionValue) ||
          textValue(card, "tags").includes(regionValue)) &&
        (!genreValue ||
          textValue(card, "genre").includes(genreValue) ||
          textValue(card, "tags").includes(genreValue));
      card.classList.toggle("hidden-card", !matched);
    });
  };

  [search, type, region, genre].filter(Boolean).forEach((element) => {
    element.addEventListener("input", apply);
    element.addEventListener("change", apply);
  });
}

function movieCard(movie) {
  const tags = [...(movie.genres || []), ...(movie.tags || [])]
    .filter(Boolean)
    .slice(0, 3)
    .map((tag) => `<span>${escapeHtml(tag)}</span>`)
    .join("");
  const intro = escapeHtml(shortText(movie.oneLine || movie.summary || "", 72));
  return `<article class="movie-card" data-card>
        <a class="poster" href="movie/${movie.id}.html" aria-label="观看${escapeHtml(movie.title)}">
            <img src="${movie.cover}" alt="${escapeHtml(movie.title)}" loading="lazy">
            <span class="poster-shade"></span>
            <span class="watch-pill">立即播放</span>
        </a>
        <div class="card-body">
            <div class="meta-line">
                <span>${escapeHtml(movie.type)}</span>
                <span>${escapeHtml(movie.year)}</span>
            </div>
            <h2><a href="movie/${movie.id}.html">${escapeHtml(movie.title)}</a></h2>
            <p>${intro}</p>
            <div class="tag-row">${tags}</div>
        </div>
    </article>`;
}

function shortText(value, size) {
  const text = String(value || "")
    .replace(/\s+/g, " ")
    .trim();
  return text.length > size ? `${text.slice(0, size)}…` : text;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function includesValue(blob, value) {
  return !value || blob.includes(String(value).toLowerCase());
}

async function initSearchPage() {
  const page = qs("[data-search-page]");
  if (!page) {
    return;
  }
  const results = qs("[data-search-results]", page);
  const input = qs("[data-global-search]", page);
  const type = qs("[data-global-type]", page);
  const region = qs("[data-global-region]", page);
  const genre = qs("[data-global-genre]", page);
  if (!results) {
    return;
  }
  let movies = Array.isArray(window.MOVIE_DATA) ? window.MOVIE_DATA : null;
  if (!movies) {
    const response = await fetch(
      page.dataset.dataUrl || "assets/data/movies.json",
    );
    movies = await response.json();
  }

  const params = new URLSearchParams(window.location.search);
  const initialQuery = params.get("q") || "";
  if (initialQuery && input) {
    input.value = initialQuery;
  }

  const render = () => {
    const keyword = (input?.value || "").trim().toLowerCase();
    const typeValue = (type?.value || "").toLowerCase();
    const regionValue = (region?.value || "").toLowerCase();
    const genreValue = (genre?.value || "").toLowerCase();
    const matched = movies
      .filter((movie) => {
        const blob = [
          movie.title,
          movie.region,
          movie.type,
          movie.year,
          movie.genre,
          ...(movie.tags || []),
          ...(movie.genres || []),
          movie.oneLine,
        ]
          .join(" ")
          .toLowerCase();
        return (
          includesValue(blob, keyword) &&
          includesValue(String(movie.type).toLowerCase(), typeValue) &&
          includesValue(
            `${movie.region} ${(movie.tags || []).join(" ")}`.toLowerCase(),
            regionValue,
          ) &&
          includesValue(
            `${movie.genre} ${(movie.tags || []).join(" ")}`.toLowerCase(),
            genreValue,
          )
        );
      })
      .slice(0, 120);
    results.innerHTML = matched.map(movieCard).join("");
  };

  [input, type, region, genre].filter(Boolean).forEach((element) => {
    element.addEventListener("input", render);
    element.addEventListener("change", render);
  });
  render();
}

function initPlayers() {
  qsa("[data-player]").forEach((player) => {
    const video = qs("video", player);
    const play = qs("[data-play]", player);
    if (!video || !play) {
      return;
    }
    const stream = video.dataset.stream;
    let hls = null;
    const start = async () => {
      if (!stream) {
        return;
      }
      player.classList.add("playing");
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        if (!video.src) {
          video.src = stream;
        }
      } else if (Hls.isSupported()) {
        if (!hls) {
          hls = new Hls({ enableWorker: true, lowLatencyMode: true });
          hls.loadSource(stream);
          hls.attachMedia(video);
        }
      } else {
        video.src = stream;
      }
      try {
        await video.play();
      } catch (error) {
        player.classList.remove("playing");
      }
    };
    play.addEventListener("click", start);
    video.addEventListener("click", () => {
      if (video.paused) {
        start();
      }
    });
  });

  qsa("[data-detail-play]").forEach((button) => {
    button.addEventListener("click", () => {
      const playButton = qs("[data-play]");
      if (playButton) {
        playButton.click();
      }
    });
  });
}

initMobileMenu();
initHero();
initPageFilters();
initSearchPage();
initPlayers();
