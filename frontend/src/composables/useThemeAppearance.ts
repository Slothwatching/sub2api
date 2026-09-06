import { onMounted, onUnmounted, ref } from 'vue'
import { readThemePreference, saveThemePreference } from '@/utils/theme'

/** Observe the existing document theme; do not introduce another preference store. */
export function useThemeAppearance() {
  const isDark = ref(document.documentElement.classList.contains('dark'))
  const isAutomatic = ref(!readThemePreference())
  const syncPreference = () => { isAutomatic.value = !readThemePreference() }
  let observer: MutationObserver | undefined

  onMounted(() => {
    window.addEventListener('theme-preference-change', syncPreference)
    isDark.value = document.documentElement.classList.contains('dark')
    observer = new MutationObserver(() => {
      isDark.value = document.documentElement.classList.contains('dark')
    })
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
  })
  onUnmounted(() => { observer?.disconnect(); window.removeEventListener('theme-preference-change', syncPreference) })

  function toggleTheme() {
    const next = !document.documentElement.classList.contains('dark')
    saveThemePreference(next ? 'dark' : 'light')
    syncPreference()
    isDark.value = next
  }

  return { isDark, isAutomatic, toggleTheme, followSystem: () => { saveThemePreference(null); syncPreference() } }
}
