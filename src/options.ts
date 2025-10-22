// Slowdown Bar

type Speeds = { fastSpeed: number; slowSpeed: number };
const DEFAULTS: Speeds = { fastSpeed: 2.0, slowSpeed: 1.0 };

const fastSlider = document.getElementById("fast-slider") as HTMLInputElement | null;
const slowSlider = document.getElementById("slow-slider") as HTMLInputElement | null;
const fastLabel = document.getElementById("fast-label") as HTMLElement | null;
const slowLabel = document.getElementById("slow-label") as HTMLElement | null;
const saveBtn = document.getElementById("save-btn") as HTMLButtonElement | null;
const resetBtn = document.getElementById("reset-btn") as HTMLButtonElement | null;

const fmt = (x: number) => `${x.toFixed(1)}x`;
const setLabels = (f: number, s: number) => {
    if (fastLabel) fastLabel.textContent = fmt(f);
    if (slowLabel) slowLabel.textContent = fmt(s);
};

const resetToDefaults = () => {
    //reset the the slowLabel & fastLabel to DEFAULTS
    if ( fastSlider ) fastSlider.value = String(DEFAULTS.fastSpeed);
    if ( slowSlider ) slowSlider.value = String(DEFAULTS.slowSpeed);
    setLabels(DEFAULTS.fastSpeed, DEFAULTS.slowSpeed);

    chrome.storage.sync.set({
        fastSpeed: DEFAULTS.fastSpeed,
        slowSpeed: DEFAULTS.slowSpeed
    })
    console.log("reset clicked!")
}


fastSlider?.addEventListener("input", () => {setLabels(Number(fastSlider.value), Number(slowSlider?.value ?? DEFAULTS.slowSpeed));});
slowSlider?.addEventListener("input", () => {setLabels(Number(fastSlider?.value ?? DEFAULTS.fastSpeed), Number(slowSlider.value));});
resetBtn?.addEventListener("click", () => {resetToDefaults()});






// fastRange.addEventListener("input", () => {
//     const fastValue = fastRange.value;
//     fastLabel.textContent = `${fastValue}`;

// })



// const load = () => {
//     chrome.storage.sync.get(["fastSpeed", "slowSpeed"], (data: Partial<Speeds>)) => {
//     const fast = Number.isFinite(data.fastSpeed) && (data.fastSpeed as number)! > 0 ? (data.fastSpeed as number) : DEFAULTS.fastSpeed;
//     const slow = Number.isFinite(data.slowSpeed) && (data.slowSpeed as number)! > 0 ? (data.slowSpeed as number) : DEFAULTS.slowSpeed;

//     }
// }

// const readUI = () => {

// }

// const save = () => {
//     const cfg = readUI();
//     chrome.strogage.sync.set(cfg);
//     setLabels(cfg.fastSpeed, cfg.slowSpeed);
// }
