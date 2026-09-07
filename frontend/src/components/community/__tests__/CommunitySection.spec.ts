import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { reactive } from 'vue'
import type { CommunityLink } from '@/types'
const { state, locale, copy } = vi.hoisted(() => ({ state: { cachedPublicSettings: { community_links: [] as CommunityLink[] } }, locale: { value: 'en' }, copy: vi.fn() }))
vi.mock('@/stores/app', () => ({ useAppStore: () => state }))
vi.mock('@/composables/useClipboard', () => ({ useClipboard: () => ({ copyToClipboard: copy }) }))
vi.mock('vue-i18n', () => ({ useI18n: () => ({ t: (key: string) => key, locale }) }))
import CommunitySection from '../CommunitySection.vue'
import CommunitySettings from '../CommunitySettings.vue'
const item = (): CommunityLink => ({ id: 'one', name: '中文社群', name_en: 'Community', platform: 'Chat', account: '123', url: 'https://example.com/join', qr_code: '', status: 'open', enabled: true })
const options = { global: { stubs: { BaseDialog: { template: '<div><slot /></div>' } } } }
beforeEach(() => { state.cachedPublicSettings.community_links = []; copy.mockClear(); locale.value = 'en' })
describe('community support', () => {
 it('hides an empty section and disabled drafts', () => { expect(mount(CommunitySection, options).find('section').exists()).toBe(false); state.cachedPublicSettings.community_links = [{ ...item(), enabled: false }]; expect(mount(CommunitySection, options).find('section').exists()).toBe(false) })
 it('uses English names, copies account and safely opens invitations', async () => { state.cachedPublicSettings.community_links = [item()]; const w = mount(CommunitySection, options); expect(w.text()).toContain('Community'); expect(w.get('a').attributes('rel')).toBe('noopener noreferrer'); await w.get('button').trigger('click'); expect(copy).toHaveBeenCalledWith('123') })
 it('falls back to Chinese and removes joining actions for full communities', () => { state.cachedPublicSettings.community_links = [{ ...item(), name_en: '', status: 'full' }]; const w = mount(CommunitySection, options); expect(w.text()).toContain('中文社群'); expect(w.find('a').exists()).toBe(false); expect(w.find('button').exists()).toBe(false) })
 it('does not render unsafe invitation URLs or SVG images', () => { state.cachedPublicSettings.community_links = [{ ...item(), url: 'javascript:alert(1)', qr_code: 'data:image/svg+xml;base64,abc' }]; const w = mount(CommunitySection, options); expect(w.find('a').exists()).toBe(false); expect(w.find('img').exists()).toBe(false) })
 it('supports reordering and removing settings without changing IDs', async () => { const entries = reactive([item(), { ...item(), id: 'two' }]); const w = mount(CommunitySettings, { props: { modelValue: entries } }); const up = w.findAll('button').filter(b => b.attributes('aria-label') === 'commercial.community.up'); await up[1].trigger('click'); expect((w.emitted('update:modelValue')![0][0] as CommunityLink[]).map(x => x.id)).toEqual(['two', 'one']); const remove = w.findAll('button').find(b => b.text() === 'common.delete')!; await remove.trigger('click'); expect((w.emitted('update:modelValue')![1][0] as CommunityLink[]).map(x => x.id)).toEqual(['two']) })
})
