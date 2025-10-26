type SpeedSettings = { fastSpeed: number; slowSpeed: number };

const DEFAULT_SPEEDS: SpeedSettings = { fastSpeed: 2.0, slowSpeed: 1.0 };

let speeds: SpeedSettings = { ...DEFAULT_SPEEDS };
let currentVideo: HTMLVideoElement | null = null;
let spaceHeld = false;

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
            typeof data.fastSpeed === "number" && data.fastSpeed > 0 ? data.fastSpeed : DEFAULT_SPEEDS.fastSpeed,
        slowSpeed:
            typeof data.slowSpeed === "number" && data.slowSpeed > 0 ? data.slowSpeed : DEFAULT_SPEEDS.slowSpeed,
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
    if (!spaceHeld) setRate(speeds.fastSpeed);
});

// --- Keyboard: hold = slow, release = fast ---

const onKeyDown = (e: KeyboardEvent): void => {
    if (e.code !== "Space" && e.key !== " ") return;
    if (isTyping(document.activeElement)) return;

    e.preventDefault();
    e.stopImmediatePropagation();

    if (spaceHeld || e.repeat) return;
    spaceHeld = true;
    setRate(speeds.slowSpeed);
};

const onKeyUp = (e: KeyboardEvent): void => {
    if (e.code !== "Space" && e.key !== " ") return;
    if (isTyping(document.activeElement)) return;

    e.preventDefault();
    e.stopImmediatePropagation();

    spaceHeld = false;
    setRate(speeds.fastSpeed);
};

window.addEventListener("keydown", onKeyDown, true);
window.addEventListener("keyup", onKeyUp, true);


new MutationObserver(() => {
    getVideo();
    if (!spaceHeld) setRate(speeds.fastSpeed);
}).observe(document.documentElement, { childList: true, subtree: true });


setRate(speeds.fastSpeed);