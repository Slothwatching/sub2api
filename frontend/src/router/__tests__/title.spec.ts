import { describe, expect, it } from 'vitest'
import router from '@/router'
import { i18n } from '@/i18n'
import { resolveDocumentTitle, resolveRouteDocumentTitle } from '@/router/title'

describe('resolveDocumentTitle', () => {
  it('路由存在标题时，使用“路由标题 - 站点名”格式', () => {
    expect(resolveDocumentTitle('Usage Records', 'My Site')).toBe('Usage Records - My Site')
  })

  it('路由无标题时，回退到站点名', () => {
    expect(resolveDocumentTitle(undefined, 'My Site')).toBe('My Site')
  })

  it('站点名为空时，回退默认站点名', () => {
    expect(resolveDocumentTitle('Dashboard', '')).toBe('Dashboard - Sub2API')
    expect(resolveDocumentTitle(undefined, '   ')).toBe('Sub2API')
  })

  it('站点名变更时仅影响后续路由标题计算', () => {
    const before = resolveDocumentTitle('Admin Dashboard', 'Alpha')
    const after = resolveDocumentTitle('Admin Dashboard', 'Beta')

    expect(before).toBe('Admin Dashboard - Alpha')
    expect(after).toBe('Admin Dashboard - Beta')
  })
})

describe('resolveRouteDocumentTitle', () => {
  it('自定义页面菜单加载后，使用菜单名称作为标题', () => {
    const route = {
      name: 'CustomPage',
      params: { id: 'scheduler' },
      meta: {
        title: 'Custom Page'
      }
    }

    expect(resolveRouteDocumentTitle(route, 'EzouAPI')).toBe('Custom Page - EzouAPI')
    expect(resolveRouteDocumentTitle(route, 'EzouAPI', [
      {
        id: 'scheduler',
        label: '账号调度器',
        icon_svg: '',
        url: 'https://example.com',
        visibility: 'admin',
        sort_order: 0
      }
    ])).toBe('账号调度器 - EzouAPI')
  })
})


describe('home route localization', () => {
  it('uses the selected language for the actual home route title', () => {
    const locale = i18n.global.locale.value
    const originalEn = i18n.global.getLocaleMessage('en')
    const originalZh = i18n.global.getLocaleMessage('zh')
    try {
      i18n.global.setLocaleMessage('en', { home: { pageTitle: () => 'Home' } })
      i18n.global.setLocaleMessage('zh', { home: { pageTitle: () => '首页' } })
      const route = router.resolve('/home')
      i18n.global.locale.value = 'en'
      expect(resolveRouteDocumentTitle(route, 'Example')).toBe('Home - Example')
      i18n.global.locale.value = 'zh'
      expect(resolveRouteDocumentTitle(route, 'Example')).toBe('首页 - Example')
    } finally {
      i18n.global.setLocaleMessage('en', originalEn)
      i18n.global.setLocaleMessage('zh', originalZh)
      i18n.global.locale.value = locale
    }
  })
})
