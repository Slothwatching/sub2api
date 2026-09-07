<template>
  <section v-if="items.length" id="community" class="space-y-5 py-6" aria-labelledby="community-title">
    <div><h2 id="community-title" class="text-xl font-semibold">{{ t('commercial.community.title') }}</h2><p class="mt-2 text-sm text-gray-500 dark:text-dark-300">{{ t('commercial.community.subtitle') }}</p></div>
    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <article v-for="item in items" :key="item.id" class="card flex min-w-0 flex-col items-center gap-4 p-6 text-center">
        <span class="text-xs uppercase tracking-widest text-gray-500 dark:text-dark-300">{{ item.platform }}</span>
        <h3 class="max-w-full break-words font-semibold">{{ name(item) }}</h3>
        <template v-if="item.status === 'open'">
          <button v-if="safeQR(item.qr_code)" type="button" :aria-label="t('commercial.community.enlarge', { name: name(item) })" class="rounded-xl bg-white p-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-500" @click="selected = item"><img :src="item.qr_code" :alt="name(item)" class="h-44 w-44 max-w-full object-contain" /></button>
          <button v-if="item.account" type="button" class="max-w-full break-all text-sm underline underline-offset-4" @click="copyToClipboard(item.account)">{{ item.account }} · {{ t('common.copy') }}</button>
          <a v-if="safeLink(item.url)" :href="safeLink(item.url)" target="_blank" rel="noopener noreferrer" class="btn btn-primary">{{ t('commercial.community.join') }}</a>
        </template>
        <p v-else class="rounded-full bg-gray-100 px-3 py-1 text-sm dark:bg-dark-700">{{ t(`commercial.community.${item.status}`) }}</p>
      </article>
    </div>
    <BaseDialog :show="!!selected" :title="selected ? name(selected) : ''" @close="selected = null"><div v-if="selected" class="mx-auto max-w-md rounded-xl bg-white p-5"><img :src="selected.qr_code" :alt="name(selected)" class="h-auto w-full object-contain" /></div></BaseDialog>
  </section>
</template>
<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAppStore } from '@/stores/app'
import { useClipboard } from '@/composables/useClipboard'
import BaseDialog from '@/components/common/BaseDialog.vue'
import type { CommunityLink } from '@/types'
const { t, locale } = useI18n()
const app = useAppStore()
const { copyToClipboard } = useClipboard()
const selected = ref<CommunityLink | null>(null)
function safeLink(value: string) { try { const url = new URL(value); return ['http:', 'https:'].includes(url.protocol) && !url.username && !url.password ? url.href : '' } catch { return '' } }
function safeQR(value: string) { return /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(value) }
const items = computed(() => (app.cachedPublicSettings?.community_links ?? []).filter(item => item.enabled && item.name.trim() && ['open', 'full', 'paused'].includes(item.status) && (item.status !== 'open' || item.account || safeQR(item.qr_code) || safeLink(item.url))))
const name = (item: CommunityLink) => locale.value.startsWith('en') && item.name_en ? item.name_en : item.name
</script>
