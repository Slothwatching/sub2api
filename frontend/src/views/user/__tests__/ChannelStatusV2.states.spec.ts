import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
const mocks = vi.hoisted(() => ({ snapshot: vi.fn(), error: vi.fn() }))
vi.mock('vue-i18n', async (original) => ({ ...await original<typeof import('vue-i18n')>(), useI18n: () => ({ t: (key: string) => key, te: () => false, locale: { value: 'en' } }) }))
vi.mock('vue-router', () => ({ useRoute: () => ({ query: {} }), useRouter: () => ({ replace: vi.fn() }) }))
vi.mock('@/stores/auth', () => ({ useAuthStore: () => ({ isAdmin: false }) }))
vi.mock('@/stores/app', () => ({ useAppStore: () => ({ showError: mocks.error }) }))
vi.mock('@/utils/featureFlags', () => ({ isChannelMonitorThroughputHidden: () => false, isChannelMonitorUserRankingHidden: () => false }))
vi.mock('@/api/channelMonitorV2', () => ({ getSnapshot: mocks.snapshot, getDimensions: async () => ({ platforms: [], groups: [], models: [] }), getMatrix: async () => null, getModels: async () => ({ items: [] }) }))
import View from '../ChannelStatusV2View.vue'
const global = { stubs: { AppLayout: { template: '<main><slot /></main>' }, Icon: true, LoadingSpinner: true, Select: true, FilterMultiSelect: true, MetricCell: true, MonitorRankBadge: true, MonitorTrendChart: true, RelayPulseMatrix: true } }
const snapshot = () => ({ coverage: { data_through: '', coverage_complete: false }, metrics: { error_rate: 0, cache_rate: 0, rpm: 0, tpm: 0, ttft: { sample_count: 0, p50_ms: null, p95_ms: null, avg_ms: null } }, health: { error_rate: 'unknown', ttft: 'unknown', overall: 'unknown' }, trend: [] })
beforeEach(() => vi.clearAllMocks())
describe('V2 monitoring evidence', () => {
 it('distinguishes first loading and no monitoring data', async () => { mocks.snapshot.mockResolvedValue(snapshot()); const w = mount(View, { global }); await flushPromises(); expect(w.text()).toContain('commercial.status.empty'); expect(w.text()).not.toContain('channelMonitorV2.updatedTo'); w.unmount() })
 it('replaces a stale successful timestamp with a visible refresh error', async () => { mocks.snapshot.mockResolvedValueOnce({ ...snapshot(), coverage: { data_through: '2026-09-07T00:00:00Z', coverage_complete: true } }).mockRejectedValueOnce(new Error('offline')); const w = mount(View, { global }); await flushPromises(); expect(w.text()).toContain('channelMonitorV2.updatedTo'); await w.get('button[title="common.refresh"]').trigger('click'); await flushPromises(); expect(w.text()).toContain('commercial.status.error'); expect(w.get('[role="status"]').text()).toContain('commercial.status.stale'); expect(w.text()).not.toContain('channelMonitorV2.updatedTo'); w.unmount() })
})
