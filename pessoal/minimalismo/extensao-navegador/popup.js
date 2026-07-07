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

function parseTime(t) {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

function minNow() {
  const d = new Date();
  return d.getHours() * 60 + d.getMinutes();
}

function updateStatus(settings) {
  const statusEl = document.getElementById('status');
  const infoEl   = document.getElementById('info');

  if (!settings.blocking_enabled) {
    statusEl.className   = 'status free';
    statusEl.textContent = 'Livre';
    infoEl.textContent   = 'Bloqueio desativado';
    return;
  }

  const windows = [
    { start: parseTime(settings.window1_start), end: parseTime(settings.window1_end), label: settings.window1_start + '–' + settings.window1_end },
    { start: parseTime(settings.window2_start), end: parseTime(settings.window2_end), label: settings.window2_start + '–' + settings.window2_end },
  ];

  const m       = minNow();
  const current = windows.find(w => m >= w.start && m < w.end);

  if (current) {
    statusEl.className   = 'status open';
    statusEl.textContent = 'Janela aberta';
    const remaining = current.end - m;
    infoEl.textContent   = current.label + ' · fecha em ' + remaining + 'min';
  } else {
    statusEl.className   = 'status blocked';
    statusEl.textContent = 'Bloqueado';
    const next = windows.find(w => w.start > m) || windows[0];
    const diff = next.start > m ? next.start - m : (24 * 60 - m + next.start);
    const h    = Math.floor(diff / 60);
    const min  = diff % 60;
    infoEl.textContent = 'Próxima: ' + next.label + ' em ' + (h > 0 ? h + 'h ' : '') + min + 'min';
  }
}

function setWindowInputsDisabled(disabled) {
  ['window1_start', 'window1_end', 'window2_start', 'window2_end'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.disabled = disabled;
  });
}

// ── Carregar e renderizar ─────────────────────────────────────────────────────
chrome.storage.local.get(DEFAULT_SETTINGS, (settings) => {
  // Status
  updateStatus(settings);

  // Todos os campos
  Object.keys(DEFAULT_SETTINGS).forEach(key => {
    const el = document.getElementById(key);
    if (!el) return;
    if (el.type === 'checkbox') el.checked = settings[key];
    if (el.type === 'time')     el.value   = settings[key];
  });

  setWindowInputsDisabled(!settings.blocking_enabled);
});

// ── Salvar ao mudar ───────────────────────────────────────────────────────────
Object.keys(DEFAULT_SETTINGS).forEach(key => {
  const el = document.getElementById(key);
  if (!el) return;

  const eventType = (el.type === 'time') ? 'change' : 'change';

  el.addEventListener(eventType, () => {
    const value = (el.type === 'checkbox') ? el.checked : el.value;
    chrome.storage.local.set({ [key]: value }, () => {
      // Atualizar status e estado dos inputs ao mudar bloqueio
      if (key === 'blocking_enabled') {
        chrome.storage.local.get(DEFAULT_SETTINGS, (s) => {
          updateStatus(s);
          setWindowInputsDisabled(!s.blocking_enabled);
        });
      }
    });
  });
});
