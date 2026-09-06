import { sanitizeUrl } from '@/utils/url'

export function updateFavicon(logoUrl: string): void {
  const sanitizedLogoUrl = sanitizeUrl(logoUrl, {
    allowRelative: true,
    allowDataUrl: true,
  })
  if (logoUrl.trim() && !sanitizedLogoUrl) {
    return
  }
  const faviconUrl = sanitizedLogoUrl || '/brand-mark.svg'

  let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]')
  if (!link) {
    link = document.createElement('link')
    link.rel = 'icon'
    document.head.appendChild(link)
  }

  link.type = faviconUrl.endsWith('.svg') ? 'image/svg+xml' : 'image/x-icon'
  link.href = faviconUrl
}
