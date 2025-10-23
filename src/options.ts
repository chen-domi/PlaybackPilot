// Slowdown Bar
import "./style.css";

type Speeds = { fastSpeed: number; slowSpeed: number };
const DEFAULTS: Speeds = { fastSpeed: 2.0, slowSpeed: 1.0 };

const fastSlider = document.getElementById("fast-slider") as HTMLInputElement | null;
const slowSlider = document.getElementById("slow-slider") as HTMLInputElement | null;
const fastLabel = document.getElementById("fast-label") as HTMLElement | null;
const slowLabel = document.getElementById("slow-label") as HTMLElement | null;
const saveBtn = document.getElementById("save-btn") as HTMLButtonElement | null;
const resetBtn = document.getElementById("reset-btn") as HTMLButtonElement | null;

// insures playback rate speed is one decimal place
const fmt = (x: number) => `${x.toFixed(1)}x`;
const setLabels = (f: number, s: number) => {
    // changes the DOM to display the value from the slider
    if ( fastLabel ) fastLabel.textContent = fmt(f);
    if ( slowLabel ) slowLabel.textContent = fmt(s);
};

const load = () => {
  chrome.storage.sync.get(["fastSpeed", "slowSpeed"], (data) => {
    if (fastSlider) fastSlider.value = String(data.fastSpeed ?? DEFAULTS.fastSpeed);
    if (slowSlider) slowSlider.value = String(data.slowSpeed ?? DEFAULTS.slowSpeed);
    setLabels(Number(fastSlider?.value ?? DEFAULTS.fastSpeed),
              Number(slowSlider?.value ?? DEFAULTS.slowSpeed));
  });
};

// saves the value from the slider
const save = async () => {
    if (fastSlider === null || slowSlider === null) return;

    const cfg: Speeds = {
        fastSpeed: Number(fastSlider.value),
        slowSpeed: Number(slowSlider.value),
    };

    try {
        await chrome.storage.sync.set(cfg);
        console.log("Settings saved:", cfg);
        setLabels(cfg.fastSpeed, cfg.slowSpeed)
    } catch (error) {
        console.log("Failed to save settings:", error)
    }
};

// resets the Speed values to a default value of fastSpeed = 2.0 and slowSpeed = 1.0
const resetToDefaults = () => {
    //reset the the slowLabel & fastLabel to DEFAULTS
    if ( fastSlider ) fastSlider.value = String(DEFAULTS.fastSpeed);
    if ( slowSlider ) slowSlider.value = String(DEFAULTS.slowSpeed);
    save()
};


fastSlider?.addEventListener("input", () => {setLabels(Number(fastSlider.value), Number(slowSlider?.value ?? DEFAULTS.slowSpeed));});
slowSlider?.addEventListener("input", () => {setLabels(Number(fastSlider?.value ?? DEFAULTS.fastSpeed), Number(slowSlider.value));});
saveBtn?.addEventListener("click", save);
resetBtn?.addEventListener("click", resetToDefaults);
document.addEventListener("DOMContentLoaded", load);






