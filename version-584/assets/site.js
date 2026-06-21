(function () {
    function all(selector, scope) {
        return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
    }

    function one(selector, scope) {
        return (scope || document).querySelector(selector);
    }

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function setupMenus() {
        var searchToggle = one('[data-search-toggle]');
        var searchPanel = one('[data-search-panel]');
        var menuToggle = one('[data-menu-toggle]');
        var mobileMenu = one('[data-mobile-menu]');

        if (searchToggle && searchPanel) {
            searchToggle.addEventListener('click', function () {
                searchPanel.classList.toggle('is-open');
                var input = one('[data-site-search]', searchPanel);
                if (searchPanel.classList.contains('is-open') && input) {
                    input.focus();
                }
            });
        }

        if (menuToggle && mobileMenu) {
            menuToggle.addEventListener('click', function () {
                mobileMenu.classList.toggle('is-open');
            });
        }
    }

    function applyFilters() {
        var cards = all('[data-search-card]');
        var empty = one('[data-empty-state]');
        var searchInputs = all('[data-site-search]');
        var activeFilters = {
            year: 'all',
            region: 'all'
        };

        function currentQuery() {
            for (var i = 0; i < searchInputs.length; i += 1) {
                if (searchInputs[i].value.trim()) {
                    return normalize(searchInputs[i].value);
                }
            }
            return '';
        }

        function render() {
            var query = currentQuery();
            var visible = 0;

            cards.forEach(function (card) {
                var text = normalize(card.getAttribute('data-search'));
                var year = card.getAttribute('data-year') || '';
                var region = card.getAttribute('data-region') || '';
                var matchSearch = !query || text.indexOf(query) !== -1;
                var matchYear = activeFilters.year === 'all' || year === activeFilters.year;
                var matchRegion = activeFilters.region === 'all' || region === activeFilters.region;
                var show = matchSearch && matchYear && matchRegion;

                card.style.display = show ? '' : 'none';
                if (show) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.classList.toggle('is-visible', cards.length > 0 && visible === 0);
            }
        }

        searchInputs.forEach(function (input) {
            input.addEventListener('input', function () {
                var value = input.value;
                searchInputs.forEach(function (other) {
                    if (other !== input) {
                        other.value = value;
                    }
                });
                render();
            });
        });

        all('[data-filter-button]').forEach(function (button) {
            button.addEventListener('click', function () {
                var type = button.getAttribute('data-filter-type');
                var value = button.getAttribute('data-filter-value');
                activeFilters[type] = value;
                all('[data-filter-button][data-filter-type="' + type + '"]').forEach(function (peer) {
                    peer.classList.toggle('active', peer === button);
                });
                render();
            });
        });
    }

    function setupHero() {
        var carousel = one('[data-hero-carousel]');
        if (!carousel) {
            return;
        }

        var slides = all('[data-hero-slide]', carousel);
        var dots = all('[data-hero-dot]', carousel);
        var prev = one('[data-hero-prev]', carousel);
        var next = one('[data-hero-next]', carousel);
        var index = 0;
        var timer = null;

        function show(target) {
            if (!slides.length) {
                return;
            }
            index = (target + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === index);
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
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot') || 0));
                start();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                start();
            });
        }

        carousel.addEventListener('mouseenter', stop);
        carousel.addEventListener('mouseleave', start);
        start();
    }

    window.startVideoPlayer = function (videoId, overlayId, source) {
        var video = document.getElementById(videoId);
        var overlay = document.getElementById(overlayId);
        var attached = false;
        var instance = null;

        if (!video || !source) {
            return;
        }

        function attach() {
            if (attached) {
                return;
            }

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                instance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                instance.loadSource(source);
                instance.attachMedia(video);
            } else {
                video.src = source;
            }

            attached = true;
        }

        function play() {
            attach();
            video.controls = true;
            if (overlay) {
                overlay.classList.add('is-hidden');
            }
            var promise = video.play();
            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {
                    if (overlay) {
                        overlay.classList.remove('is-hidden');
                    }
                });
            }
        }

        if (overlay) {
            overlay.addEventListener('click', play);
        }

        video.addEventListener('click', function () {
            if (video.paused) {
                play();
            }
        });

        window.addEventListener('pagehide', function () {
            if (instance && typeof instance.destroy === 'function') {
                instance.destroy();
            }
        });
    };

    document.addEventListener('DOMContentLoaded', function () {
        setupMenus();
        applyFilters();
        setupHero();
    });
}());
