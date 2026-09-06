import { afterEach, describe, expect, it } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import ThemeToggle from '../ThemeToggle.vue'

afterEach(() => {
  document.documentElement.classList.remove('dark')
  localStorage.clear()
})

describe('ThemeToggle compatibility', () => {
  it('keeps the existing theme preference and updates its accessible label after a language switch', async () => {
    const i18n = createI18n({
      legacy: false,
      locale: 'zh',
      messages: {
        zh: { home: { autoTheme: () => '自动', followSystem: () => '跟随系统外观', switchToLight: () => '切换到浅色模式', switchToDark: () => '切换到深色模式' } },
        en: { home: { autoTheme: () => 'Auto', followSystem: () => 'Follow system appearance', switchToLight: () => 'Switch to Light Mode', switchToDark: () => 'Switch to Dark Mode' } },
      },
    })
    const wrapper = mount(ThemeToggle, { global: { plugins: [i18n] } })
    expect(wrapper.get('button').attributes('aria-label')).toBe('切换到深色模式')
    await wrapper.get('button').trigger('click')
    expect(localStorage.getItem('theme')).toBe('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
    expect(wrapper.get('button').attributes('aria-label')).toBe('切换到浅色模式')
    i18n.global.locale.value = 'en'
    await flushPromises()
    expect(wrapper.get('button').attributes('aria-label')).toBe('Switch to Light Mode')

    // Existing sidebar/home controls can also change the document theme.
    document.documentElement.classList.remove('dark')
    await flushPromises()
    expect(wrapper.get('button').attributes('aria-label')).toBe('Switch to Dark Mode')
    wrapper.unmount()
  })
})
