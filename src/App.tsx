import { useState, useEffect, useCallback } from 'react'
import './index.css'

interface Settings {
  enabled: boolean
  lockedSpeed: number
  slowSpeed: number
  slowDownKey: string
  increaseKey: string
  decreaseKey: string
  lockEnabled: boolean
}

const DEFAULTS: Settings = {
  enabled: true,
  lockedSpeed: 1.0,
  slowSpeed: 0.5,
  slowDownKey: 's',
  increaseKey: '>',
  decreaseKey: '<',
  lockEnabled: false,
}

function displayKey(key: string): string {
  const map: Record<string, string> = {
    '>': 'Shift + .',
    '<': 'Shift + ,',
    ' ': 'Space',
    ArrowUp: '↑',
    ArrowDown: '↓',
    ArrowLeft: '←',
    ArrowRight: '→',
    Escape: 'Esc',
    Backspace: '⌫',
  }
  return map[key] ?? (key.length === 1 ? key.toUpperCase() : key)
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 focus:outline-none ${
        checked ? 'bg-indigo-500' : 'bg-gray-600'
      }`}
    >
      <span
        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform duration-200 ${
          checked ? 'translate-x-[18px]' : 'translate-x-[3px]'
        }`}
      />
    </button>
  )
}

function KeyCapture({
  value,
  onChange,
}: {
  value: string
  onChange: (key: string) => void
}) {
  const [listening, setListening] = useState(false)

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      e.preventDefault()
      e.stopPropagation()
      const skip = ['Shift', 'Control', 'Alt', 'Meta', 'CapsLock', 'Tab']
      if (skip.includes(e.key)) return
      onChange(e.key)
      setListening(false)
    },
    [onChange]
  )

  useEffect(() => {
    if (!listening) return
    window.addEventListener('keydown', handleKeyDown, true)
    return () => window.removeEventListener('keydown', handleKeyDown, true)
  }, [listening, handleKeyDown])

  return (
    <button
      onClick={() => setListening(true)}
      onBlur={() => setListening(false)}
      title="Click then press a key to rebind"
      className={`min-w-[88px] px-2.5 py-1 rounded text-xs font-mono font-bold border transition-all cursor-pointer ${
        listening
          ? 'bg-indigo-600 border-indigo-400 text-white'
          : 'bg-gray-800 border-gray-600 text-gray-200 hover:border-indigo-400 hover:text-white'
      }`}
    >
      {listening ? 'press a key…' : displayKey(value)}
    </button>
  )
}

function SpeedStepper({
  value,
  onChange,
  min = 0.25,
  max = 16,
  step = 0.25,
}: {
  value: number
  onChange: (v: number) => void
  min?: number
  max?: number
  step?: number
}) {
  return (
    <div className="flex items-center gap-1.5">
      <button
        onClick={() => onChange(Math.max(min, +(value - step).toFixed(2)))}
        disabled={value <= min}
        className="w-6 h-6 rounded bg-gray-700 hover:bg-gray-600 disabled:opacity-30 disabled:cursor-not-allowed text-white text-sm font-bold leading-none flex items-center justify-center cursor-pointer"
      >
        −
      </button>
      <span className="text-white font-mono text-sm w-12 text-center bg-gray-900 rounded px-1.5 py-0.5 border border-gray-700">
        {value.toFixed(2)}x
      </span>
      <button
        onClick={() => onChange(Math.min(max, +(value + step).toFixed(2)))}
        disabled={value >= max}
        className="w-6 h-6 rounded bg-gray-700 hover:bg-gray-600 disabled:opacity-30 disabled:cursor-not-allowed text-white text-sm font-bold leading-none flex items-center justify-center cursor-pointer"
      >
        +
      </button>
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mb-2.5">
      <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest">
        {children}
      </span>
      <div className="flex-1 h-px bg-gray-800" />
    </div>
  )
}

export default function App() {
  const [settings, setSettings] = useState<Settings>(DEFAULTS)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    chrome.storage.sync.get(DEFAULTS, (data) => {
      setSettings(data as Settings)
      setLoaded(true)
    })
  }, [])

  function update(partial: Partial<Settings>) {
    const next = { ...settings, ...partial }
    setSettings(next)
    chrome.storage.sync.set(partial)
  }

  if (!loaded) {
    return (
      <div className="w-72 h-20 bg-gray-950 flex items-center justify-center">
        <div className="text-gray-600 text-xs">Loading…</div>
      </div>
    )
  }

  return (
    <div className="w-72 bg-gray-950 text-white select-none">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800/80">
        <div className="flex items-center gap-2">
          <span className="text-base">🎬</span>
          <span className="font-bold text-sm tracking-tight text-white">PlaybackPilot</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">{settings.enabled ? 'On' : 'Off'}</span>
          <Toggle checked={settings.enabled} onChange={() => update({ enabled: !settings.enabled })} />
        </div>
      </div>

      <div className={`transition-opacity duration-150 ${settings.enabled ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
        {/* Speed section */}
        <div className="px-4 pt-3.5 pb-2">
          <SectionLabel>Speed</SectionLabel>

          <div className="space-y-2.5">
            {/* Lock speed row */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-gray-200 text-sm">Lock speed</span>
                <p className="text-gray-500 text-[11px] mt-0.5">
                  {settings.lockEnabled ? '🔒 Locked — site can\'t override' : '🔓 Not enforcing'}
                </p>
              </div>
              <SpeedStepper
                value={settings.lockedSpeed}
                onChange={(v) => update({ lockedSpeed: v })}
              />
            </div>

            {/* Slow speed row */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-gray-200 text-sm">Slow speed</span>
                <p className="text-gray-500 text-[11px] mt-0.5">Speed while holding key</p>
              </div>
              <SpeedStepper
                value={settings.slowSpeed}
                onChange={(v) => update({ slowSpeed: v })}
                min={0.1}
              />
            </div>

            {/* Lock toggle */}
            <div className="flex items-center justify-between pt-0.5">
              <span className="text-gray-300 text-sm">Enforce lock</span>
              <Toggle
                checked={settings.lockEnabled}
                onChange={() => update({ lockEnabled: !settings.lockEnabled })}
              />
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="mx-4 border-t border-gray-800/80" />

        {/* Shortcuts section */}
        <div className="px-4 pt-3.5 pb-3">
          <SectionLabel>Shortcuts</SectionLabel>
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-gray-200 text-sm">Speed up</span>
              <KeyCapture value={settings.increaseKey} onChange={(k) => update({ increaseKey: k })} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-200 text-sm">Speed down</span>
              <KeyCapture value={settings.decreaseKey} onChange={(k) => update({ decreaseKey: k })} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-gray-200 text-sm">Hold to slow</span>
                <p className="text-gray-500 text-[11px] mt-0.5">Hold → slow speed, release → lock speed</p>
              </div>
              <KeyCapture value={settings.slowDownKey} onChange={(k) => update({ slowDownKey: k })} />
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 pb-3 border-t border-gray-800/80 pt-2.5">
        <p className="text-gray-600 text-[10px] text-center">
          Works on YouTube, Panopto &amp; any HTML5 video
        </p>
      </div>
    </div>
  )
}
