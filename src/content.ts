type SpeedSettings = {
    fastSpeed: number;
    slowSpeed: number;
    enabled?: boolean;
};

const DEFAULT_SPEEDS: SpeedSettings = {
    fastSpeed: 2.0,
    slowSpeed: 1.0,
    enabled: true,
};

let speeds: SpeedSettings = { ...DEFAULT_SPEEDS };
let currentVideo: HTMLVideoElement | null = null;
let spaceHeld = false;
let pressStart = 0;
const HOLD_THRESHOLD_MS = 180;

// Return <video> (and update our reference)
const getVideo = (): HTMLVideoElement | null => {
    const v = document.querySelector("video") as HTMLVideoElement | null;
    if (v !== currentVideo) currentVideo = v;
    return currentVideo;
};

// Change playback rate if a video exists
const setRate = (rate: number): void => {
    const v = getVideo();
    if (v) v.playbackRate = rate;
};

const isTyping = (el: Element | null): boolean => {
    if (!el) return false;
    const tag = el.tagName.toLowerCase();
    return (
        tag === "input" ||
        tag === "textarea" ||
        (el as HTMLElement).isContentEditable
    );
};

// --- Load & Watch Settings ---

chrome.storage.sync.get(["fastSpeed", "slowSpeed"], (data) => {
    speeds = {
        fastSpeed:
            typeof data.fastSpeed === "number" && data.fastSpeed > 0
                ? data.fastSpeed
                : DEFAULT_SPEEDS.fastSpeed,
        slowSpeed:
            typeof data.slowSpeed === "number" && data.slowSpeed > 0
                ? data.slowSpeed
                : DEFAULT_SPEEDS.slowSpeed,
        enabled:
            typeof data.enabled === "boolean"
                ? data.enabled
                : DEFAULT_SPEEDS.enabled,
    };
    if (!spaceHeld) setRate(speeds.fastSpeed);
});

chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== "sync") return;
    if (changes.fastSpeed) {
        const v = Number(changes.fastSpeed.newValue);
        if (v > 0) speeds.fastSpeed = v;
    }
    if (changes.slowSpeed) {
        const v = Number(changes.slowSpeed.newValue);
        if (v > 0) speeds.slowSpeed = v;
    }
    if (typeof changes.enabled?.newValue === "boolean") {
        speeds.enabled = changes.enabled.newValue;
    }
    if (speeds.enabled && !spaceHeld) setRate(speeds.fastSpeed);
});

// --- Keyboard: hold = slow, release = fast ---

window.addEventListener(
  "keydown",
  (e) => {
    if (e.code !== "Space" && e.key !== " ") return;
    if (!speeds.enabled) return;
    if (isTyping(document.activeElement)) return;

    e.preventDefault();
    e.stopImmediatePropagation();

    if (spaceHeld || e.repeat) return;
    spaceHeld = true;
    pressStart = performance.now();
  },
  true
);

window.addEventListener(
  "keyup",
  (e) => {
    if (e.code !== "Space" && e.key !== " ") return;
    if (!speeds.enabled) return;
    if (isTyping(document.activeElement)) return;

    e.preventDefault();
    e.stopImmediatePropagation();

    const elapsed = performance.now() - pressStart;
    const v = getVideo();

    if (!v) {
      spaceHeld = false;
      return;
    }

    if (elapsed < HOLD_THRESHOLD_MS) {
      if (v.paused) {
        v.play();
        setRate(speeds.fastSpeed);
      } else {
        v.pause();
      }
    } else {

      setRate(speeds.fastSpeed);
    }

    spaceHeld = false;
  },
  true
);

let holdTimer: number | undefined;
window.addEventListener(
  "keydown",
  (e) => {
    if (e.code !== "Space" && e.key !== " ") return;
    if (!speeds.enabled || isTyping(document.activeElement)) return;

    if (holdTimer) clearTimeout(holdTimer);
    holdTimer = window.setTimeout(() => {
      if (!spaceHeld) return;
      setRate(speeds.slowSpeed);
    }, HOLD_THRESHOLD_MS);
  },
  true
);

new MutationObserver(() => {
  getVideo();
  if (speeds.enabled && !spaceHeld) setRate(speeds.fastSpeed);
}).observe(document.documentElement, { childList: true, subtree: true });

if (speeds.enabled) setRate(speeds.fastSpeed);

