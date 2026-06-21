(function () {
  function initPlayer(box) {
    var video = box.querySelector('video[data-hls]');
    var cover = box.querySelector('[data-play-cover]');
    var source = video ? video.getAttribute('data-hls') : '';
    var hls = null;
    var ready = false;
    var pendingPlay = false;

    if (!video || !source) {
      return;
    }

    function attach() {
      if (ready) {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        ready = true;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });

        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          ready = true;
          if (pendingPlay) {
            playVideo();
          }
        });
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal && hls) {
            hls.destroy();
            hls = null;
          }
        });
      }
    }

    function hideCover() {
      if (cover) {
        cover.hidden = true;
      }
    }

    function playVideo() {
      attach();
      pendingPlay = true;
      var promise = video.play();

      if (promise && typeof promise.then === 'function') {
        promise.then(hideCover).catch(function () {});
      } else {
        hideCover();
      }
    }

    if (cover) {
      cover.addEventListener('click', playVideo);
    }

    video.addEventListener('play', hideCover);
    video.addEventListener('click', function () {
      if (video.paused) {
        playVideo();
      }
    });
    video.addEventListener('loadedmetadata', function () {
      ready = true;
    });

    attach();
  }

  document.querySelectorAll('[data-player]').forEach(initPlayer);
})();
