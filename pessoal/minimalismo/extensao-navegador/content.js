(function () {
  const DEFAULT_SETTINGS = {
    blocking_enabled: true,
    window1_start: '12:30',
    window1_end:   '13:00',
    window2_start: '20:15',
    window2_end:   '20:45',
    instagram_stories: true,
    instagram_feed: true,
    instagram_reels: true,
    youtube_feed: true,
    youtube_shorts: true,
    facebook_feed: true,
    facebook_reels: true,
    facebook_marketplace: true,
  };

  const WORK_HOSTS = ['business.facebook.com', 'adsmanager.facebook.com'];

  const CSS_MAP = {
    instagram_stories: `
      header section,
      div[role="none"] > ul
    `,
    instagram_feed: `
      main article,
      div[role="feed"]
    `,
    instagram_reels: `
      a[href="/reels/"],
      nav a[href*="reels"]
    `,
    youtube_feed: `
      ytd-browse[page-subtype="home"] ytd-rich-grid-renderer
    `,
    youtube_shorts: `
      ytd-reel-shelf-renderer,
      ytd-rich-shelf-renderer[is-shorts],
      ytd-guide-entry-renderer a[title="Shorts"],
      ytd-mini-guide-entry-renderer a[title="Shorts"],
      a[title="Shorts"]
    `,
    // Feed e Stories do Facebook no mesmo toggle (ambos são distração)
    facebook_feed: `
      div[role="feed"],
      div[data-pagelet="FeedTimeline"],
      div[data-pagelet="Stories"],
      div[data-pagelet*="StoriesH"],
      [aria-label="Stories"],
      [aria-label="Histórias"]
    `,
    facebook_reels: `
      a[aria-label="Reels"],
      a[href*="/reel/"]
    `,
    facebook_marketplace: `
      a[aria-label="Marketplace"],
      a[href*="/marketplace"]
    `,
  };

  function parseTime(t) {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  }

  function minNow() {
    const d = new Date();
    return d.getHours() * 60 + d.getMinutes();
  }

  function inWindow(s) {
    const m = minNow();
    return [
      { start: parseTime(s.window1_start), end: parseTime(s.window1_end) },
      { start: parseTime(s.window2_start), end: parseTime(s.window2_end) },
    ].some(w => m >= w.start && m < w.end);
  }

  const host = location.hostname;
  const path = location.pathname;

  if (WORK_HOSTS.includes(host)) return;

  const isYouTube   = host.includes('youtube.com');
  const isFacebook  = host.includes('facebook.com');
  const isInstagram = host.includes('instagram.com');
  const isTikTok    = host.includes('tiktok.com');
  const isShorts    = isYouTube && path.startsWith('/shorts');

  const styleEls = {};

  // Injeta todo o CSS imediatamente (síncrono) para evitar flash de conteúdo.
  // Depois o storage ajusta o que deve ficar visível.
  function injectAll() {
    Object.keys(CSS_MAP).forEach(key => {
      if (key.startsWith('instagram') && !isInstagram) return;
      if (key.startsWith('youtube')   && !isYouTube)   return;
      if (key.startsWith('facebook')  && !isFacebook)  return;

      const el = document.createElement('style');
      el.id = 'min-' + key;
      el.textContent = CSS_MAP[key].trim() + ' { display: none !important; }';
      (document.head || document.documentElement).appendChild(el);
      styleEls[key] = el;
    });
  }

  function applySettings(settings) {
    const s = { ...DEFAULT_SETTINGS, ...settings };

    // Redirecionar se bloqueio ativo e fora da janela
    if (s.blocking_enabled && (isInstagram || isTikTok || isShorts) && !inWindow(s)) {
      window.location.replace(
        chrome.runtime.getURL('blocked.html') + '?return=' + encodeURIComponent(location.href)
      );
      return;
    }

    // Habilitar ou desabilitar cada bloco de CSS conforme settings
    Object.keys(CSS_MAP).forEach(key => {
      if (!styleEls[key]) return;
      styleEls[key].disabled = !s[key];
    });
  }

  injectAll();
  chrome.storage.local.get(DEFAULT_SETTINGS, applySettings);

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== 'local') return;
    chrome.storage.local.get(DEFAULT_SETTINGS, applySettings);
  });
})();
