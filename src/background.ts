// PlaybackPilot Background Service Worker
// Seeds default settings on first install

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    chrome.storage.sync.set({
      enabled: true,
      lockedSpeed: 1.0,
      slowSpeed: 0.5,
      slowDownKey: 's',
      increaseKey: '>',
      decreaseKey: '<',
      lockEnabled: false,
    });
  }
});
