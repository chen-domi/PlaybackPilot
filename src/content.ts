// Spacebar functionality

// import { FSWatcher } from "vite";

type Speeds = { fastSpeed: number; slowSpeed: number };

declare global {
    interface WindowEventMap {
        "yt-navigate-finish": Event;
    }
}

const DEFAULTS: Speeds = { fastSpeed: 2.0, slowSpeed: 1.0 };

let speedSettings: Speeds = { ...DEFAULTS };
let currentVideo: HTMLVideoElement | null = null;
let isHoldingSpace = false; // space bar held down? Y/N
let wasPausedBeforeHold = false;


//Load saved speeds from chrome storage (options.ts)
const localSettings = async () => {
    const stored = await chrome.storage.sync.get(["fastSpeed", "slowSpeed"]);

    speedSettings = {
        fastSpeed: stored.fastSpeed > 0 ? stored.fastSpeed : DEFAULTS.fastSpeed,
        slowSpeed: stored.slowSpeed > 0 ? stored.slowSpeed : DEFAULTS.slowSpeed,
    };
};

//---- Video Logic ----

//listen for settings updates
chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== "sync") return;
    if (changes.fastSpeed) speedSettings.fastSpeed = Number(changes.fastSpeed.newValue) || DEFAULTS.fastSpeed;
    if (changes.slowSpeed) speedSettings.slowSpeed = Number(changes.slowSpeed.newValue) || DEFAULTS.slowSpeed;
    if (!isHoldingSpace) setPlaybackRate(speedSettings.fastSpeed);
});

const findActiveVideo = (): HTMLVideoElement | null  => document.querySelector("video")

const updateVideoRef = (): void => {
    const found = findActiveVideo();
    if (found !== currentVideo) currentVideo = found;

    setPlaybackRate(isHoldingSpace ? speedSettings.slowSpeed : speedSettings.fastSpeed);
};

const setPlaybackRate = (rate: number): void => {
    if (currentVideo) currentVideo.playbackRate = rate;
}

// ---- Video Check & Spacebar Logic ----

const ensureVideoReady = (): HTMLVideoElement | null => {
    const vid = findActiveVideo();
    if (!vid) {
        console.log("No video found on this page.");
        return null;
    }
    currentVideo = vid;
    return vid;
}

const handleSpacebar = (isPressed: boolean): void => {
    const vid = ensureVideoReady();
    if (!vid) return;

    if (isPressed) {
        wasPausedBeforeHold = vid.paused;
        if (wasPausedBeforeHold) vid.play();
        vid.playbackRate = speedSettings.slowSpeed;
    } else {
        vid.playbackRate = speedSettings.fastSpeed;
        if (wasPausedBeforeHold) {
            vid.pause();
            wasPausedBeforeHold = false;
        }
    }
};

window.addEventListener("keydown", (e) => {
    if (e.code === "Space") {
        e.preventDefault();
        if (!isHoldingSpace) return;
        isHoldingSpace = false;
        handleSpacebar(false);
    }
});

(async () => {
    await localSettings();
    updateVideoRef();
    setPlaybackRate(speedSettings.fastSpeed)
})

