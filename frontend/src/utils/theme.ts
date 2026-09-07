export type ThemePreference = 'light' | 'dark' | 'system'

/** Preserve manual choices; following the system is an explicit opt-in. */
export function readThemePreference(): ThemePreference {
  try {
    const value = localStorage.getItem('theme')
    return value === 'light' || value === 'dark' || value === 'system' ? value : 'light'
  } catch { return 'light' }
}

export function applyThemePreference() {
  const preference = readThemePreference()
  let systemDark = false
  try { systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches } catch { /* Light fallback. */ }
  document.documentElement.classList.toggle('dark', preference === 'dark' || (preference === 'system' && systemDark))
}

export function saveThemePreference(value: ThemePreference) {
  try {
    localStorage.setItem('theme', value)
  } catch { /* Theme still works in memory when storage is unavailable. */ }
  let systemDark = false
  try { systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches } catch { /* Light fallback. */ }
  document.documentElement.classList.toggle('dark', value === 'dark' || (value === 'system' && systemDark))
  window.dispatchEvent(new Event('theme-preference-change'))
}

export function initializeTheme() {
  applyThemePreference()
  const onStorage = (event: StorageEvent) => {
    if (event.key === 'theme' || event.key === null) {
      applyThemePreference()
      window.dispatchEvent(new Event('theme-preference-change'))
    }
  }
  let media: MediaQueryList | undefined
  try { media = window.matchMedia('(prefers-color-scheme: dark)') } catch { /* Light fallback. */ }
  const onSystemChange = () => { if (readThemePreference() === 'system') applyThemePreference() }
  media?.addEventListener?.('change', onSystemChange)
  window.addEventListener('storage', onStorage)
  return () => {
    media?.removeEventListener?.('change', onSystemChange)
    window.removeEventListener('storage', onStorage)
  }
}
