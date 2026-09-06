/** The existing `theme` key owns manual choices. No value means system mode. */
export function readThemePreference(): 'light' | 'dark' | null {
  try {
    const value = localStorage.getItem('theme')
    return value === 'light' || value === 'dark' ? value : null
  } catch { return null }
}

export function applyThemePreference() {
  const preference = readThemePreference()
  let systemDark = false
  try { systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches } catch { /* Light fallback. */ }
  document.documentElement.classList.toggle('dark', preference === 'dark' || (!preference && systemDark))
}

export function saveThemePreference(value: 'light' | 'dark' | null) {
  try {
    if (value) localStorage.setItem('theme', value)
    else localStorage.removeItem('theme')
  } catch { /* Theme still works in memory when storage is unavailable. */ }
  if (value) document.documentElement.classList.toggle('dark', value === 'dark')
  else applyThemePreference()
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
  const onSystemChange = () => { if (!readThemePreference()) applyThemePreference() }
  media?.addEventListener?.('change', onSystemChange)
  window.addEventListener('storage', onStorage)
  return () => {
    media?.removeEventListener?.('change', onSystemChange)
    window.removeEventListener('storage', onStorage)
  }
}
