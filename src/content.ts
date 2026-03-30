// PlaybackPilot Content Script
// Controls HTML5 video playback on any site

interface Settings {
  enabled: boolean;
  lockedSpeed: number;
  slowSpeed: number;
  slowDownKey: string;
  increaseKey: string;
  decreaseKey: string;
  lockEnabled: boolean;
}

const DEFAULTS: Settings = {
  enabled: true,
  lockedSpeed: 1.0,
  slowSpeed: 0.5,
  slowDownKey: 's',
  increaseKey: '>',
  decreaseKey: '<',
  lockEnabled: false,
};

let settings: Settings = { ...DEFAULTS };
let isSlowingDown = false;
let isApplyingSpeed = false;
let toastTimer: ReturnType<typeof setTimeout> | null = null;

function loadSettings(cb?: () => void) {
  chrome.storage.sync.get(DEFAULTS, (data) => {
    settings = data as Settings;
    cb?.();
  });
}

chrome.storage.onChanged.addListener((changes) => {
  for (const key in changes) {
    (settings as Record<string, unknown>)[key] = changes[key].newValue;
  }
  // If lock is enabled and we're not in a slow-down, enforce the locked speed
  if (settings.enabled && settings.lockEnabled && !isSlowingDown) {
    applySpeed(settings.lockedSpeed);
  }
  // If extension was disabled, release any active slow-down
  if (!settings.enabled && isSlowingDown) {
    isSlowingDown = false;
  }
});

function getVideos(): HTMLVideoElement[] {
  return Array.from(document.querySelectorAll('video'));
}

function applySpeed(speed: number) {
  const s = Math.max(0.1, Math.min(16, speed));
  isApplyingSpeed = true;
  getVideos().forEach((v) => {
    v.playbackRate = s;
  });
  // Reset flag after the ratechange events have fired
  requestAnimationFrame(() => {
    isApplyingSpeed = false;
  });
}

function showToast(msg: string) {
  let toast = document.getElementById('pp-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'pp-toast';
    Object.assign(toast.style, {
      position: 'fixed',
      bottom: '60px',
      left: '50%',
      transform: 'translateX(-50%)',
      background: 'rgba(10, 10, 10, 0.88)',
      color: '#ffffff',
      padding: '7px 16px',
      borderRadius: '8px',
      fontSize: '13px',
      fontWeight: '700',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
      zIndex: '2147483647',
      pointerEvents: 'none',
      border: '1px solid rgba(255,255,255,0.12)',
      letterSpacing: '0.02em',
      whiteSpace: 'nowrap',
      transition: 'opacity 0.2s ease',
    });
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.style.opacity = '1';
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    if (toast) toast.style.opacity = '0';
  }, 1200);
}

function isInputFocused(): boolean {
  const el = document.activeElement;
  if (!el) return false;
  const tag = el.tagName.toLowerCase();
  return (
    tag === 'input' ||
    tag === 'textarea' ||
    tag === 'select' ||
    (el as HTMLElement).isContentEditable
  );
}

// Keydown: handle speed changes and hold-to-slow
document.addEventListener(
  'keydown',
  (e: KeyboardEvent) => {
    if (!settings.enabled || e.repeat) return;
    if (isInputFocused()) return;

    // Increase locked speed
    if (e.key === settings.increaseKey) {
      e.preventDefault();
      e.stopPropagation();
      settings.lockedSpeed = Math.min(16, +(settings.lockedSpeed + 0.25).toFixed(2));
      settings.lockEnabled = true;
      chrome.storage.sync.set({ lockedSpeed: settings.lockedSpeed, lockEnabled: true });
      if (!isSlowingDown) applySpeed(settings.lockedSpeed);
      showToast(`▲ ${settings.lockedSpeed}x`);
      return;
    }

    // Decrease locked speed
    if (e.key === settings.decreaseKey) {
      e.preventDefault();
      e.stopPropagation();
      settings.lockedSpeed = Math.max(0.25, +(settings.lockedSpeed - 0.25).toFixed(2));
      settings.lockEnabled = true;
      chrome.storage.sync.set({ lockedSpeed: settings.lockedSpeed, lockEnabled: true });
      if (!isSlowingDown) applySpeed(settings.lockedSpeed);
      showToast(`▼ ${settings.lockedSpeed}x`);
      return;
    }

    // Hold to slow down
    if (e.key === settings.slowDownKey && !isSlowingDown) {
      e.preventDefault();
      e.stopPropagation();
      isSlowingDown = true;
      applySpeed(settings.slowSpeed);
      showToast(`⏸ ${settings.slowSpeed}x  (holding)`);
    }
  },
  true // capture phase — runs before site handlers
);

// Keyup: release hold-to-slow
document.addEventListener(
  'keyup',
  (e: KeyboardEvent) => {
    if (e.key === settings.slowDownKey && isSlowingDown) {
      isSlowingDown = false;
      if (settings.enabled) {
        applySpeed(settings.lockedSpeed);
        showToast(`▶ ${settings.lockedSpeed}x`);
      }
    }
  },
  true
);

// Watch a video element and enforce the locked speed on external rate changes
function watchVideo(video: HTMLVideoElement) {
  if ((video as HTMLVideoElement & { __pp?: boolean }).__pp) return;
  (video as HTMLVideoElement & { __pp?: boolean }).__pp = true;

  video.addEventListener('ratechange', () => {
    if (!settings.enabled || !settings.lockEnabled || isSlowingDown || isApplyingSpeed) return;
    if (Math.abs(video.playbackRate - settings.lockedSpeed) > 0.01) {
      applySpeed(settings.lockedSpeed);
    }
  });

  // Apply current locked speed to this video if lock is active
  if (settings.enabled && settings.lockEnabled) {
    video.playbackRate = settings.lockedSpeed;
  }
}

// Observe DOM for dynamically added video elements (e.g. YouTube SPA navigation)
const observer = new MutationObserver(() => {
  getVideos().forEach(watchVideo);
});

// Initialize
loadSettings(() => {
  getVideos().forEach(watchVideo);
  observer.observe(document.documentElement, { childList: true, subtree: true });
});
