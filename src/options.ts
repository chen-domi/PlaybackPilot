import "./style.css";

type Speeds = { fastSpeed: number; slowSpeed: number; enabled?: boolean; };

// Default values
const DEFAULTS: Speeds = { fastSpeed: 2.0, slowSpeed: 1.0, enabled: true };

// HTML element references
const fastSlider = document.getElementById("fast-slider") as HTMLInputElement | null;
const slowSlider = document.getElementById("slow-slider") as HTMLInputElement | null;
const fastLabel = document.getElementById("fast-label") as HTMLElement | null;
const slowLabel = document.getElementById("slow-label") as HTMLElement | null;
const saveBtn = document.getElementById("save-btn") as HTMLButtonElement | null;
const resetBtn = document.getElementById("reset-btn") as HTMLButtonElement | null;
const enableToggle = document.getElementById("enable-toggle") as HTMLInputElement | null;

// Utility: format speed labels like "1.5x"
const fmt = (x: number) => `${x.toFixed(1)}x`;

// Update the displayed labels to match slider values
const updateLabels = (): void => {
    if (fastLabel && fastSlider)
        fastLabel.textContent = fmt(Number(fastSlider.value));
    if (slowLabel && slowSlider)
        slowLabel.textContent = fmt(Number(slowSlider.value));
};

// Load saved settings from Chrome storage
const load = async (): Promise<void> => {
    const data = await chrome.storage.sync.get([
        "fastSpeed",
        "slowSpeed",
        "enabled",
    ]);

    if (fastSlider)
        fastSlider.value = String(
            typeof data.fastSpeed === "number"
                ? data.fastSpeed
                : DEFAULTS.fastSpeed
        );
    if (slowSlider)
        slowSlider.value = String(
            typeof data.slowSpeed === "number"
                ? data.slowSpeed
                : DEFAULTS.slowSpeed
        );
    if (enableToggle)
        enableToggle.checked =
            typeof data.enabled === "boolean"
                ? data.enabled
                : DEFAULTS.enabled!;

    updateLabels();
};

// Save current slider + toggle states to Chrome storage
const save = async (): Promise<void> => {
    if (!fastSlider || !slowSlider) return;

    const cfg: Speeds = {
        fastSpeed: Number(fastSlider.value),
        slowSpeed: Number(slowSlider.value),
        enabled: enableToggle ? enableToggle.checked : true,
    };

    try {
        await chrome.storage.sync.set(cfg);
        console.log("Settings saved:", cfg);
        updateLabels();
    } catch (error) {
        console.error("Failed to save settings:", error);
    }
};

// Reset sliders and toggle to defaults, then save
const resetToDefaults = (): void => {
    if (fastSlider) fastSlider.value = String(DEFAULTS.fastSpeed);
    if (slowSlider) slowSlider.value = String(DEFAULTS.slowSpeed);
    if (enableToggle) enableToggle.checked = DEFAULTS.enabled!;
    save();
};

// Update labels as user moves sliders
fastSlider?.addEventListener("input", updateLabels);
slowSlider?.addEventListener("input", updateLabels);

// Save button manually saves settings
saveBtn?.addEventListener("click", save);

// Reset button restores defaults
resetBtn?.addEventListener("click", resetToDefaults);

// Auto-save when popup closes or loses focus
document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") void save();
});
window.addEventListener("blur", () => void save());

// Immediately save when the enable/disable toggle changes
enableToggle?.addEventListener("change", () => void save());

void load();
