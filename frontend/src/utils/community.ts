import type { CommunityLink } from '@/types'
export function communityURL(value: string): string {
  try { const url = new URL(value); return ['http:', 'https:'].includes(url.protocol) && !url.username && !url.password ? url.href : '' } catch { return '' }
}
export function communityImage(value: string): boolean {
  return /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(value)
}
export function communityValidationError(items: CommunityLink[]): string | null {
  for (const item of items) {
    if (item.enabled && (!item.name.trim() || !(item.account.trim() || item.qr_code || item.url))) return 'commercial.community.required'
    if (item.url && !communityURL(item.url)) return 'commercial.community.linkError'
    if (item.qr_code && (!communityImage(item.qr_code) || item.qr_code.length > 410000)) return 'commercial.community.imageError'
  }
  return null
}
