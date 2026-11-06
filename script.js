/* ===== Tastes of Africa: script.js ===== */
// Default video for every embed that has class "yt".
const DEFAULT_VIDEO = 'BlEyGP_cQKY';

document.addEventListener('DOMContentLoaded', () => {

  /* ---- Load YouTube videos ---- */
  document.querySelectorAll('iframe.yt').forEach(f => {
    f.src = 'https://www.youtube.com/embed/' + (f.dataset.vid || DEFAULT_VIDEO);
  });

  /* ---- Dark / light mode (saved in localStorage) ---- */
  const root = document.documentElement;
  const themeBtn = document.getElementById('theme-toggle');
  if (themeBtn) {
    let savedTheme = null;
    try { savedTheme = localStorage.getItem('theme'); } catch (e) {}
    if (savedTheme) root.setAttribute('data-theme', savedTheme);
    const setIcon = () => {
      themeBtn.textContent = root.getAttribute('data-theme') === 'dark' ? '☀️' : '🌙';
    };
    setIcon();
    themeBtn.addEventListener('click', () => {
      const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('theme', next); } catch (e) {}
      setIcon();
    });
  }

  /* ---- Recipe filter by region ---- */
  const filterBtns = document.querySelectorAll('.filter-btn');
  const recipes = document.querySelectorAll('.recipe');
  filterBtns.forEach(btn => btn.addEventListener('click', () => {
    const region = btn.dataset.region;
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    recipes.forEach(card => {
      card.classList.toggle('hidden', region !== 'all' && card.dataset.region !== region);
    });
  }));

  /* ---- Favorites (localStorage) ---- */
  let favs = [];
  try { favs = JSON.parse(localStorage.getItem('favorites')) || []; } catch (e) { favs = []; }
  const paint = (btn, on) => {
    btn.classList.toggle('active', on);
    btn.setAttribute('aria-pressed', on);
    btn.textContent = on ? '❤️ Favorited' : '🤍 Favorite';
  };
  recipes.forEach(card => {
    const btn = card.querySelector('.fav-btn');
    if (!btn) return;
    const id = card.dataset.id;
    paint(btn, favs.includes(id));              // restore saved favorites on load
    btn.addEventListener('click', () => {
      favs = favs.includes(id) ? favs.filter(f => f !== id) : [...favs, id];
      try { localStorage.setItem('favorites', JSON.stringify(favs)); } catch (e) {}
      paint(btn, favs.includes(id));
    });
  });

  /* ---- Ingredient scaler ---- */
  document.querySelectorAll('.servings').forEach(input => {
    input.addEventListener('input', () => {
      const n = Math.max(1, Number(input.value) || 1);
      input.closest('.recipe').querySelectorAll('.amt').forEach(span => {
        span.textContent = +(span.dataset.base * n / 4).toFixed(2);
      });
    });
  });

  /* ---- Contact form validation ---- */
  const form = document.getElementById('contact-form');
  if (form) {
    form.addEventListener('submit', event => {
      event.preventDefault();
      const name = form.name.value.trim();
      const email = form.email.value.trim();
      const msg = form.message.value.trim();
      const err = document.getElementById('form-error');
      if (!name || !/^\S+@\S+\.\S+$/.test(email)) {
        err.textContent = 'Please enter your name and a valid email.'; return;
      }
      if (msg.length <= 20) {
        err.textContent = `Message must be more than 20 characters (currently ${msg.length}).`; return;
      }
      err.textContent = '';
      form.classList.add('hidden');
      const box = document.getElementById('confirmation');
      box.textContent = `Thank you, ${name}! We've received your message.`;
      box.classList.remove('hidden');
    });
  }

  /* ---- Newsletter (footer) ---- */
  const news = document.getElementById('newsletter-form');
  if (news) {
    news.addEventListener('submit', e => {
      e.preventDefault();
      document.getElementById('news-msg').textContent = 'Thanks for subscribing!';
      news.reset();
    });
  }

  /* ---- Hero background video (YouTube player API) ---- */
  const heroEl = document.getElementById('hero-player');
  if (heroEl) {
    const videoId = heroEl.dataset.videoId;
    const controls = document.querySelector('.hero__controls');
    const playBtn = document.getElementById('hero-play');
    const soundBtn = document.getElementById('hero-sound');
    let player;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(tag);

    window.onYouTubeIframeAPIReady = () => {
      player = new YT.Player('hero-player', {
        videoId,
        playerVars: {
          autoplay: reduceMotion ? 0 : 1, mute: 1, controls: 0, loop: 1,
          playlist: videoId, playsinline: 1, rel: 0, modestbranding: 1,
          disablekb: 1, iv_load_policy: 3
        },
        events: {
          onReady: e => {
            e.target.mute();
            if (!reduceMotion) e.target.playVideo();
            playBtn.textContent = reduceMotion ? 'Play video' : 'Pause video';
            controls.hidden = false;
          }
        }
      });
    };

    playBtn.addEventListener('click', () => {
      if (!player) return;
      const playing = player.getPlayerState() === YT.PlayerState.PLAYING;
      playing ? player.pauseVideo() : player.playVideo();
      playBtn.textContent = playing ? 'Play video' : 'Pause video';
    });

    soundBtn.addEventListener('click', () => {
      if (!player) return;
      if (player.isMuted()) { player.unMute(); player.setVolume(100); soundBtn.textContent = 'Mute sound'; }
      else { player.mute(); soundBtn.textContent = 'Turn sound on'; }
    });
  }
});