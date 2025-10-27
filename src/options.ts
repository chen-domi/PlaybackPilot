import "./style.css";

type Speeds = { fastSpeed: number; slowSpeed: number };

// Default values
const DEFAULTS: Speeds = { fastSpeed: 1.0, slowSpeed: 2.0 };

// HTML element references
const fastSlider = document.getElementById("fast-slider") as HTMLInputElement | null;
const slowSlider = document.getElementById("slow-slider") as HTMLInputElement | null;
const fastLabel = document.getElementById("fast-label") as HTMLElement | null;
const slowLabel = document.getElementById("slow-label") as HTMLElement | null;
// const saveBtn = document.getElementById("save-btn") as HTMLButtonElement | null;
const resetBtn = document.getElementById("reset-btn") as HTMLButtonElement | null;
// const enableToggle = document.getElementById("enable-toggle") as HTMLInputElement | null;

const fmt = (x: number) => `${x.toFixed(1)}x`;

const updateLabels = (): void => {
  if (fastLabel && fastSlider) fastLabel.textContent = fmt(Number(fastSlider.value));
  if (slowLabel && slowSlider) slowLabel.textContent = fmt(Number(slowSlider.value));
};

// Load saved speeds
const load = async (): Promise<void> => {
  const data = await chrome.storage.sync.get(["fastSpeed", "slowSpeed"]);

  if (fastSlider)
    fastSlider.value = String(
      typeof data.fastSpeed === "number" ? data.fastSpeed : DEFAULTS.fastSpeed
    );

  if (slowSlider)
    slowSlider.value = String(
      typeof data.slowSpeed === "number" ? data.slowSpeed : DEFAULTS.slowSpeed
    );

  updateLabels();
};

// Save current speeds
const save = async (): Promise<void> => {
  if (!fastSlider || !slowSlider) return;

  const cfg: Speeds = {
    fastSpeed: Number(fastSlider.value),
    slowSpeed: Number(slowSlider.value),
  };

  try {
    await chrome.storage.sync.set(cfg);
    console.log("Settings saved:", cfg);
    updateLabels();
  } catch (error) {
    console.error("Failed to save settings:", error);
  }
};

// Reset to defaults
const resetToDefaults = (): void => {
  if (fastSlider) fastSlider.value = String(DEFAULTS.fastSpeed);
  if (slowSlider) slowSlider.value = String(DEFAULTS.slowSpeed);
  save();
};

// Event listeners
fastSlider?.addEventListener("input", updateLabels);
slowSlider?.addEventListener("input", updateLabels);
// Auto save
fastSlider?.addEventListener("change", () => void save());
slowSlider?.addEventListener("change", () => void save());

// saveBtn?.addEventListener("click", save);
resetBtn?.addEventListener("click", resetToDefaults);

// Load initial settings
void load();
