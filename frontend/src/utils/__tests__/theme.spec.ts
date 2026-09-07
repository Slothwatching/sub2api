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
  it('starts light even on a dark system and stays light without an explicit choice', () => {
    dark = true
    cleanup = initializeTheme()
    expect(isDark()).toBe(false)
    changeSystem(true)
    expect(isDark()).toBe(false)
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
    saveThemePreference('system')
    expect(readThemePreference()).toBe('system')
    expect(localStorage.getItem('theme')).toBe('system')
    expect(isDark()).toBe(false)
    changeSystem(true)
    expect(isDark()).toBe(true)
  })
  it('uses a light fallback when system information is unavailable', () => {
    localStorage.setItem('theme', 'system')
    vi.stubGlobal('matchMedia', undefined)
    cleanup = initializeTheme()
    expect(isDark()).toBe(false)
  })
  it('synchronizes changes from another tab and removes listeners on cleanup', () => {
    cleanup = initializeTheme()
    localStorage.setItem('theme', 'dark')
    window.dispatchEvent(new StorageEvent('storage', { key: 'theme' }))
    expect(isDark()).toBe(true)
    localStorage.setItem('theme', 'system')
    window.dispatchEvent(new StorageEvent('storage', { key: 'theme' }))
    expect(isDark()).toBe(false)
    changeSystem(true)
    expect(isDark()).toBe(true)
    localStorage.clear()
    window.dispatchEvent(new StorageEvent('storage', { key: null }))
    expect(isDark()).toBe(false)
    cleanup()
    expect(listeners).toHaveLength(0)
  })
  it.each(['light', 'dark', 'system'])('restores saved %s on initialization', (preference) => {
    dark = true
    localStorage.setItem('theme', preference)
    cleanup = initializeTheme()
    expect(readThemePreference()).toBe(preference)
    expect(isDark()).toBe(preference !== 'light')
    changeSystem(false)
    expect(isDark()).toBe(preference === 'dark')
  })
  it('treats invalid values and a removed preference as light', () => {
    dark = true
    localStorage.setItem('theme', 'invalid')
    cleanup = initializeTheme()
    expect(isDark()).toBe(false)
    saveThemePreference('dark')
    localStorage.removeItem('theme')
    window.dispatchEvent(new StorageEvent('storage', { key: 'theme' }))
    expect(readThemePreference()).toBe('light')
    expect(isDark()).toBe(false)
  })
})
