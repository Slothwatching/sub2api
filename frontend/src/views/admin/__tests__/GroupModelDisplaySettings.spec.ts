import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import GroupModelDisplaySettings from '../GroupModelDisplaySettings.vue'

vi.mock('vue-i18n', () => ({ useI18n: () => ({ t: (key: string) => key }) }))

describe('independent model display settings', () => {
  it('keeps an enabled empty legacy list empty after candidate refresh', async () => {
    const wrapper = mount(GroupModelDisplaySettings, { props: { modelValue: { enabled: true, models: [] }, candidates: ['gpt-5.5'], loading: false } })
    expect((wrapper.get('input[type="checkbox"]').element as HTMLInputElement).checked).toBe(false)
    await wrapper.setProps({ candidates: ['gpt-5.5', 'gpt-5.4'] })
    expect(wrapper.findAll('input[type="checkbox"]').every(input => !(input.element as HTMLInputElement).checked)).toBe(true)
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })

  it('round trips ordering, selection and toggle without emitting an admission policy', async () => {
    const wrapper = mount(GroupModelDisplaySettings, { props: { modelValue: { enabled: true, models: ['gpt-5.5', 'gpt-5.4'] }, candidates: ['gpt-5.4', 'gpt-5.5'], loading: false } })
    await wrapper.findAll('button[title="admin.groups.modelsList.moveDown"]')[0].trigger('click')
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([{ enabled: true, models: ['gpt-5.4', 'gpt-5.5'] }])
    await wrapper.get('input[type="checkbox"]').setValue(false)
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([{ enabled: true, models: ['gpt-5.5'] }])
    await wrapper.get('[role="switch"]').trigger('click')
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([{ enabled: false, models: ['gpt-5.5'] }])
  })
})
