/* ═══════════════════════════════════════════
   PrompterPro — script.js
   Full teleprompter logic
═══════════════════════════════════════════ */

// ── State ──────────────────────────────────────────────────
const state = {
  playing:    false,
  speed:      3,
  fontSize:   42,
  align:      'left',
  mirror:     false,
  focusLine:  true,
  scrollPos:  0,       // current scroll pixel
  rafId:      null,    // requestAnimationFrame id
  lastTime:   null,
  fullscreen: false,
};

// ── DOM refs ───────────────────────────────────────────────
const scriptInput     = document.getElementById('script-input');
const prompterScroll  = document.getElementById('prompter-scroll');
const prompterText    = document.getElementById('prompter-text');
const prompterOverlay = document.getElementById('prompter-overlay');
const prompterWrapper = document.getElementById('prompter-wrapper');
const progressFill    = document.getElementById('progress-fill');
const focusLine       = document.getElementById('focus-line');

const speedSlider     = document.getElementById('speed-slider');
const speedVal        = document.getElementById('speed-val');
const fontSlider      = document.getElementById('font-slider');
const fontVal         = document.getElementById('font-val');

const btnPlay         = document.getElementById('btn-play');
const iconPlay        = btnPlay.querySelector('.icon-play');
const iconPause       = btnPlay.querySelector('.icon-pause');

const btnReset        = document.getElementById('btn-reset');
const btnMirror       = document.getElementById('btn-mirror');
const mirrorLabel     = document.getElementById('mirror-label');
const btnFocus        = document.getElementById('btn-focus');
const focusLabel      = document.getElementById('focus-label');
const btnAligns       = document.querySelectorAll('.btn-align');
const btnClear        = document.getElementById('btn-clear');
const btnSave         = document.getElementById('btn-save');
const btnLoad         = document.getElementById('btn-load');
const btnFullscreen   = document.getElementById('btn-fullscreen');
const btnFullscreen2  = document.getElementById('btn-fullscreen2');
const savedList       = document.getElementById('saved-list');

// Fullscreen refs
const fsMode          = document.getElementById('fullscreen-mode');
const fsScroll        = document.getElementById('fs-scroll');
const fsText          = document.getElementById('fs-text');
const fsProgress      = document.getElementById('fs-progress');
const fsPlay          = document.getElementById('fs-play');
const fsReset         = document.getElementById('fs-reset');
const fsExit          = document.getElementById('fs-exit');
const fsSpeedSlider   = document.getElementById('fs-speed');
const fsSpeedVal      = document.getElementById('fs-speed-val');
const fsFocusLine     = document.getElementById('fs-focus-line');

// Modal
const modalBackdrop   = document.getElementById('modal-backdrop');
const saveName        = document.getElementById('save-name');
const modalCancel     = document.getElementById('modal-cancel');
const modalConfirm    = document.getElementById('modal-confirm');

// ── Helpers ────────────────────────────────────────────────
function getScrollEl()  { return state.fullscreen ? fsScroll  : prompterScroll; }
function getTextEl()    { return state.fullscreen ? fsText    : prompterText; }
function getProgressEl(){ return state.fullscreen ? fsProgress: progressFill; }

function maxScroll() {
  const el = getScrollEl();
  return el.scrollHeight - el.clientHeight;
}

function updateProgressBar() {
  const pct = maxScroll() > 0 ? (state.scrollPos / maxScroll()) * 100 : 0;
  progressFill.style.width = pct + '%';
  fsProgress.style.width   = pct + '%';
}

// ── Text rendering ─────────────────────────────────────────
function renderText() {
  const raw  = scriptInput.value || '';
  const html = raw
    .split('\n')
    .map(line => `<span class="prompt-line">${escapeHtml(line) || '&nbsp;'}</span>`)
    .join('\n');

  prompterText.innerHTML = html;
  fsText.innerHTML       = html;
  applyStyles();
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function applyStyles() {
  [prompterText, fsText].forEach(el => {
    el.style.fontSize  = state.fontSize + 'px';
    el.style.textAlign = state.align;
  });

  const mirrorClass = state.mirror ? 'mirror' : '';
  prompterWrapper.className = 'prompter-wrapper ' + mirrorClass;
  fsMode.classList.toggle('mirror', state.mirror);

  focusLine.classList.toggle('hidden', !state.focusLine);
  fsFocusLine.style.opacity = state.focusLine ? '0.4' : '0';
}

// ── Scroll engine ──────────────────────────────────────────
// Speed 1 = ~15 px/s, speed 10 = ~300 px/s (exponential feel)
function speedToPx(speed) {
  return 15 * Math.pow(speed, 1.6);
}

function tick(timestamp) {
  if (!state.lastTime) state.lastTime = timestamp;
  const delta = (timestamp - state.lastTime) / 1000; // seconds
  state.lastTime = timestamp;

  const pxPerSec = speedToPx(state.speed);
  state.scrollPos = Math.min(state.scrollPos + pxPerSec * delta, maxScroll());

  getScrollEl().scrollTop = state.scrollPos;
  updateProgressBar();

  if (state.scrollPos >= maxScroll() && maxScroll() > 0) {
    pause();
    return;
  }

  if (state.playing) {
    state.rafId = requestAnimationFrame(tick);
  }
}

function play() {
  if (!scriptInput.value.trim()) return;
  state.playing  = true;
  state.lastTime = null;
  state.rafId    = requestAnimationFrame(tick);

  // update UI
  prompterOverlay.classList.add('hidden');
  btnPlay.classList.add('playing');
  iconPlay.classList.add('hidden');
  iconPause.classList.remove('hidden');

  const fsIconPlay  = fsPlay.querySelector('.icon-play');
  const fsIconPause = fsPlay.querySelector('.icon-pause');
  fsIconPlay.classList.add('hidden');
  fsIconPause.classList.remove('hidden');
}

function pause() {
  state.playing  = false;
  state.lastTime = null;
  cancelAnimationFrame(state.rafId);

  btnPlay.classList.remove('playing');
  iconPlay.classList.remove('hidden');
  iconPause.classList.add('hidden');

  const fsIconPlay  = fsPlay.querySelector('.icon-play');
  const fsIconPause = fsPlay.querySelector('.icon-pause');
  fsIconPlay.classList.remove('hidden');
  fsIconPause.classList.add('hidden');
}

function togglePlay() {
  if (state.playing) pause(); else play();
}

function reset() {
  pause();
  state.scrollPos = 0;
  prompterScroll.scrollTop = 0;
  fsScroll.scrollTop       = 0;
  updateProgressBar();
  prompterOverlay.classList.remove('hidden');
}

// ── Controls ───────────────────────────────────────────────
speedSlider.addEventListener('input', () => {
  state.speed     = parseFloat(speedSlider.value);
  fsSpeedSlider.value = speedSlider.value;
  speedVal.textContent    = speedSlider.value;
  fsSpeedVal.textContent  = speedSlider.value;
});

fsSpeedSlider.addEventListener('input', () => {
  state.speed         = parseFloat(fsSpeedSlider.value);
  speedSlider.value   = fsSpeedSlider.value;
  speedVal.textContent    = fsSpeedSlider.value;
  fsSpeedVal.textContent  = fsSpeedSlider.value;
});

fontSlider.addEventListener('input', () => {
  state.fontSize = parseInt(fontSlider.value);
  fontVal.textContent = fontSlider.value;
  applyStyles();
});

btnAligns.forEach(btn => {
  btn.addEventListener('click', () => {
    state.align = btn.dataset.align;
    btnAligns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    applyStyles();
  });
});

btnMirror.addEventListener('click', () => {
  state.mirror = !state.mirror;
  btnMirror.classList.toggle('active', state.mirror);
  mirrorLabel.textContent = state.mirror ? 'ON' : 'OFF';
  applyStyles();
});

btnFocus.addEventListener('click', () => {
  state.focusLine = !state.focusLine;
  btnFocus.classList.toggle('active', state.focusLine);
  focusLabel.textContent = state.focusLine ? 'ON' : 'OFF';
  applyStyles();
});

btnClear.addEventListener('click', () => {
  if (confirm('Clear the script?')) {
    scriptInput.value = '';
    renderText();
    reset();
  }
});

// ── Playback buttons ───────────────────────────────────────
btnPlay.addEventListener('click', togglePlay);
btnReset.addEventListener('click', reset);
fsPlay.addEventListener('click', togglePlay);
fsReset.addEventListener('click', reset);
prompterWrapper.addEventListener('click', togglePlay);

// ── Fullscreen ─────────────────────────────────────────────
function openFullscreen() {
  state.fullscreen = true;
  state.scrollPos  = prompterScroll.scrollTop;
  fsScroll.scrollTop = state.scrollPos;
  fsMode.classList.add('active');
  document.body.style.overflow = 'hidden';
  if (state.playing) {
    state.lastTime = null;
    state.rafId = requestAnimationFrame(tick);
  }
}

function closeFullscreen() {
  state.fullscreen = false;
  prompterScroll.scrollTop = state.scrollPos;
  fsMode.classList.remove('active');
  document.body.style.overflow = '';
}

btnFullscreen.addEventListener('click',  openFullscreen);
btnFullscreen2.addEventListener('click', openFullscreen);
fsExit.addEventListener('click', closeFullscreen);

// ── Live text update ───────────────────────────────────────
scriptInput.addEventListener('input', renderText);

// ── Keyboard shortcuts ──────────────────────────────────────
document.addEventListener('keydown', e => {
  // Don't fire when typing in the editor or save modal input
  const tag = document.activeElement.tagName;
  if (tag === 'TEXTAREA' && !state.fullscreen) return;
  if (tag === 'INPUT') return;

  switch(e.key) {
    case ' ':
    case 'Spacebar':
      e.preventDefault();
      togglePlay();
      break;

    case 'ArrowUp':
      e.preventDefault();
      state.speed = Math.min(10, parseFloat((state.speed + 0.5).toFixed(1)));
      speedSlider.value   = state.speed;
      fsSpeedSlider.value = state.speed;
      speedVal.textContent    = state.speed;
      fsSpeedVal.textContent  = state.speed;
      break;

    case 'ArrowDown':
      e.preventDefault();
      state.speed = Math.max(1, parseFloat((state.speed - 0.5).toFixed(1)));
      speedSlider.value   = state.speed;
      fsSpeedSlider.value = state.speed;
      speedVal.textContent    = state.speed;
      fsSpeedVal.textContent  = state.speed;
      break;

    case 'ArrowRight':
      e.preventDefault();
      state.scrollPos = Math.min(state.scrollPos + 80, maxScroll());
      getScrollEl().scrollTop = state.scrollPos;
      updateProgressBar();
      break;

    case 'ArrowLeft':
      e.preventDefault();
      state.scrollPos = Math.max(0, state.scrollPos - 80);
      getScrollEl().scrollTop = state.scrollPos;
      updateProgressBar();
      break;

    case 'r':
    case 'R':
      reset();
      break;

    case 'm':
    case 'M':
      btnMirror.click();
      break;

    case 'f':
    case 'F':
      state.fullscreen ? closeFullscreen() : openFullscreen();
      break;

    case 'Escape':
      if (state.fullscreen) closeFullscreen();
      break;

    case 's':
    case 'S':
      if (e.ctrlKey || e.metaKey) { e.preventDefault(); openSaveModal(); }
      break;
  }
});

// ── Save / Load ────────────────────────────────────────────
function getSaved() {
  try { return JSON.parse(localStorage.getItem('prompter-scripts') || '[]'); }
  catch { return []; }
}

function setSaved(arr) {
  localStorage.setItem('prompter-scripts', JSON.stringify(arr));
}

function renderSavedList() {
  const saved = getSaved();
  if (saved.length === 0) {
    savedList.innerHTML = '<p class="saved-empty">No saved scripts yet.</p>';
    return;
  }
  savedList.innerHTML = saved.map((s, i) => `
    <div class="saved-item" data-idx="${i}">
      <span class="saved-item__name">📄 ${escapeHtml(s.name)}</span>
      <button class="saved-item__del" data-idx="${i}" title="Delete">×</button>
    </div>
  `).join('');

  savedList.querySelectorAll('.saved-item').forEach(item => {
    item.addEventListener('click', e => {
      if (e.target.classList.contains('saved-item__del')) return;
      const idx = parseInt(item.dataset.idx);
      const s   = getSaved()[idx];
      if (s) {
        scriptInput.value = s.text;
        renderText();
        reset();
      }
    });
  });

  savedList.querySelectorAll('.saved-item__del').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx  = parseInt(btn.dataset.idx);
      const arr  = getSaved();
      arr.splice(idx, 1);
      setSaved(arr);
      renderSavedList();
    });
  });
}

function openSaveModal() {
  saveName.value = '';
  modalBackdrop.classList.add('active');
  setTimeout(() => saveName.focus(), 50);
}

function closeSaveModal() {
  modalBackdrop.classList.remove('active');
}

btnSave.addEventListener('click', openSaveModal);
modalCancel.addEventListener('click', closeSaveModal);
modalBackdrop.addEventListener('click', e => {
  if (e.target === modalBackdrop) closeSaveModal();
});

modalConfirm.addEventListener('click', () => {
  const name = saveName.value.trim();
  if (!name) { saveName.focus(); return; }
  const text = scriptInput.value;
  const arr  = getSaved();
  // overwrite if same name
  const existing = arr.findIndex(s => s.name === name);
  if (existing >= 0) arr[existing].text = text;
  else arr.unshift({ name, text, savedAt: new Date().toISOString() });
  setSaved(arr);
  renderSavedList();
  closeSaveModal();
});

saveName.addEventListener('keydown', e => {
  if (e.key === 'Enter') modalConfirm.click();
  if (e.key === 'Escape') closeSaveModal();
});

btnLoad.addEventListener('click', () => {
  // scroll to saved scripts panel
  document.getElementById('saved-scripts-panel').scrollIntoView({ behavior: 'smooth' });
});

// ── Manual scroll sync ─────────────────────────────────────
// Sync scroll position when user manually drags
prompterScroll.addEventListener('scroll', () => {
  if (!state.playing) {
    state.scrollPos = prompterScroll.scrollTop;
    updateProgressBar();
  }
});
fsScroll.addEventListener('scroll', () => {
  if (!state.playing) {
    state.scrollPos = fsScroll.scrollTop;
    updateProgressBar();
  }
});

// ── Show/hide FS controls on mouse move ────────────────────
let fsControlsTimer;
fsMode.addEventListener('mousemove', () => {
  fsMode.classList.add('controls-visible');
  clearTimeout(fsControlsTimer);
  fsControlsTimer = setTimeout(() => {
    if (state.playing) fsMode.classList.remove('controls-visible');
  }, 3000);
});

// ── Touch swipe for mobile ─────────────────────────────────
let touchStartY = null;
document.addEventListener('touchstart', e => {
  touchStartY = e.touches[0].clientY;
});
document.addEventListener('touchend', e => {
  if (touchStartY === null) return;
  const dy = touchStartY - e.changedTouches[0].clientY;
  if (Math.abs(dy) > 40) {
    // treat upward swipe as scroll
    state.scrollPos = Math.max(0, Math.min(state.scrollPos + dy * 2, maxScroll()));
    getScrollEl().scrollTop = state.scrollPos;
    updateProgressBar();
  }
  touchStartY = null;
});

// ── Demo script on load ────────────────────────────────────
const DEMO = `Welcome to PrompterPro.

This is your professional teleprompter.

Replace this text with your own script using the editor on the left.

Press Space or click the play button to begin scrolling.

Use the controls above to adjust speed, font size, alignment, and mirror mode.

When you're ready to present, click Fullscreen for an immersive experience.

Good luck with your presentation!`;

scriptInput.value = DEMO;
renderSavedList();
renderText();
