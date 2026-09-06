import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { initializeTheme, readThemePreference, saveThemePreference } from '../theme'

let cleanup: (() => void) | undefined
let dark = false
let listeners: Array<() => void>
function changeSystem(next: boolean) { dark = next; listeners.forEach(fn => fn()) }
beforeEach(() => {
  localStorage.clear()
  document.documentElement.classList.remove('dark')
  dark = false
  listeners = []
  vi.stubGlobal('matchMedia', () => ({
    get matches() { return dark },
    addEventListener: (_: string, fn: () => void) => { listeners.push(fn) },
    removeEventListener: (_: string, fn: () => void) => { listeners = listeners.filter(item => item !== fn) },
  }))
})
afterEach(() => { cleanup?.(); cleanup = undefined; vi.unstubAllGlobals(); localStorage.clear() })
const isDark = () => document.documentElement.classList.contains('dark')

describe('theme preference compatibility', () => {
  it('starts light and follows live system changes without saving a manual preference', () => {
    cleanup = initializeTheme()
    expect(isDark()).toBe(false)
    changeSystem(true)
    expect(isDark()).toBe(true)
    expect(localStorage.getItem('theme')).toBeNull()
    changeSystem(false)
    expect(isDark()).toBe(false)
  })
  it('honors existing light/dark choices, then resumes system mode when reset', () => {
    localStorage.setItem('theme', 'light')
    dark = true
    cleanup = initializeTheme()
    expect(isDark()).toBe(false)
    saveThemePreference('dark')
    changeSystem(false)
    expect(isDark()).toBe(true)
    saveThemePreference(null)
    expect(readThemePreference()).toBeNull()
    expect(isDark()).toBe(false)
    changeSystem(true)
    expect(isDark()).toBe(true)
  })
  it('uses a light fallback when system information is unavailable', () => {
    vi.stubGlobal('matchMedia', undefined)
    cleanup = initializeTheme()
    expect(isDark()).toBe(false)
  })
  it('synchronizes changes from another tab and removes listeners on cleanup', () => {
    cleanup = initializeTheme()
    localStorage.setItem('theme', 'dark')
    window.dispatchEvent(new StorageEvent('storage', { key: 'theme' }))
    expect(isDark()).toBe(true)
    localStorage.clear()
    window.dispatchEvent(new StorageEvent('storage', { key: null }))
    expect(isDark()).toBe(false)
    cleanup()
    expect(listeners).toHaveLength(0)
  })
})
