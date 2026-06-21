(function () {
    function ready(callback) {
        if (document.readyState !== "loading") {
            callback();
            return;
        }
        document.addEventListener("DOMContentLoaded", callback);
    }

    function normalize(value) {
        return (value || "").toString().trim().toLowerCase();
    }

    ready(function () {
        var toggle = document.querySelector(".menu-toggle");
        var panel = document.querySelector(".mobile-panel");

        if (toggle && panel) {
            toggle.addEventListener("click", function () {
                var open = panel.classList.toggle("is-open");
                toggle.setAttribute("aria-expanded", open ? "true" : "false");
            });
        }

        var slider = document.querySelector("[data-hero-slider]");
        if (slider) {
            var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
            var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
            var previous = document.querySelector(".hero-prev");
            var next = document.querySelector(".hero-next");
            var index = 0;
            var timer = null;

            function show(nextIndex) {
                if (!slides.length) {
                    return;
                }
                index = (nextIndex + slides.length) % slides.length;
                slides.forEach(function (slide, slideIndex) {
                    slide.classList.toggle("is-active", slideIndex === index);
                });
                dots.forEach(function (dot, dotIndex) {
                    dot.classList.toggle("is-active", dotIndex === index);
                });
            }

            function start() {
                stop();
                timer = window.setInterval(function () {
                    show(index + 1);
                }, 5600);
            }

            function stop() {
                if (timer) {
                    window.clearInterval(timer);
                    timer = null;
                }
            }

            dots.forEach(function (dot, dotIndex) {
                dot.addEventListener("click", function () {
                    show(dotIndex);
                    start();
                });
            });

            if (previous) {
                previous.addEventListener("click", function () {
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

            slider.addEventListener("mouseenter", stop);
            slider.addEventListener("mouseleave", start);
            show(0);
            start();
        }

        var searchPage = document.querySelector(".search-page");
        if (searchPage) {
            var params = new URLSearchParams(window.location.search);
            var keyword = document.getElementById("search-keyword");
            var region = document.getElementById("filter-region");
            var type = document.getElementById("filter-type");
            var year = document.getElementById("filter-year");
            var clear = document.getElementById("filter-clear");
            var summary = document.getElementById("search-summary");
            var cards = Array.prototype.slice.call(document.querySelectorAll(".search-results .movie-card"));

            if (keyword && params.get("q")) {
                keyword.value = params.get("q");
            }

            function cardText(card) {
                return [
                    card.dataset.title,
                    card.dataset.region,
                    card.dataset.type,
                    card.dataset.year,
                    card.dataset.genre,
                    card.dataset.tags,
                    card.dataset.category
                ].map(normalize).join(" ");
            }

            function applyFilters() {
                var q = normalize(keyword ? keyword.value : "");
                var r = normalize(region ? region.value : "");
                var t = normalize(type ? type.value : "");
                var y = normalize(year ? year.value : "");
                var visible = 0;

                cards.forEach(function (card) {
                    var matchesKeyword = !q || cardText(card).indexOf(q) !== -1;
                    var matchesRegion = !r || normalize(card.dataset.region) === r;
                    var matchesType = !t || normalize(card.dataset.type) === t;
                    var matchesYear = !y || normalize(card.dataset.year) === y;
                    var show = matchesKeyword && matchesRegion && matchesType && matchesYear;
                    card.style.display = show ? "" : "none";
                    if (show) {
                        visible += 1;
                    }
                });

                if (summary) {
                    summary.textContent = q || r || t || y ? "找到 " + visible + " 部相关影片" : "精选片库";
                }
            }

            [keyword, region, type, year].forEach(function (item) {
                if (!item) {
                    return;
                }
                item.addEventListener(item.tagName === "INPUT" ? "input" : "change", applyFilters);
            });

            if (clear) {
                clear.addEventListener("click", function () {
                    if (keyword) {
                        keyword.value = "";
                    }
                    if (region) {
                        region.value = "";
                    }
                    if (type) {
                        type.value = "";
                    }
                    if (year) {
                        year.value = "";
                    }
                    applyFilters();
                });
            }

            applyFilters();
        }
    });

    window.initMoviePlayer = function (videoId, overlayId, source) {
        var video = document.getElementById(videoId);
        var overlay = document.getElementById(overlayId);
        var loaded = false;
        var hls = null;

        if (!video || !source) {
            return;
        }

        function load() {
            if (loaded) {
                return;
            }
            loaded = true;

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(source);
                hls.attachMedia(video);
            } else {
                video.src = source;
            }
        }

        function play() {
            load();
            video.controls = true;
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {});
            }
        }

        if (overlay) {
            overlay.addEventListener("click", play);
        }

        video.addEventListener("click", function () {
            if (!loaded || video.paused) {
                play();
            }
        });

        video.addEventListener("play", function () {
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
        });

        window.addEventListener("pagehide", function () {
            if (hls && typeof hls.destroy === "function") {
                hls.destroy();
            }
        });
    };
})();
