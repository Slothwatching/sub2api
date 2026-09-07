<template>
  <section class="space-y-4 border-t border-gray-200 pt-6 dark:border-dark-600">
    <h3 class="font-semibold">{{ t('commercial.community.title') }}</h3>
    <p class="text-sm text-gray-500 dark:text-dark-300">{{ t('commercial.community.publicNotice') }}</p>
    <div v-for="(item, index) in items" :key="item.id" class="space-y-3 rounded-xl border border-gray-200 p-4 dark:border-dark-600">
      <div class="flex flex-wrap items-center justify-between gap-2">
        <label class="flex items-center gap-2"><input v-model="item.enabled" type="checkbox" />{{ t('commercial.community.enabled') }}</label>
        <div class="flex gap-2">
          <button type="button" class="btn btn-secondary btn-sm" :disabled="index === 0" :aria-label="t('commercial.community.up')" @click="move(index, -1)">↑</button>
          <button type="button" class="btn btn-secondary btn-sm" :disabled="index === items.length - 1" :aria-label="t('commercial.community.down')" @click="move(index, 1)">↓</button>
          <button type="button" class="btn btn-secondary btn-sm" @click="remove(index)">{{ t('common.delete') }}</button>
        </div>
      </div>
      <div class="grid gap-3 sm:grid-cols-2">
        <label v-for="field in fields" :key="field" class="min-w-0 space-y-1 text-sm">
          <span>{{ t(`commercial.community.${field}`) }}</span>
          <input v-model="item[field]" class="input" :type="field === 'url' ? 'url' : 'text'" :maxlength="field === 'url' ? 2048 : field === 'account' ? 200 : field === 'platform' ? 40 : 80" />
        </label>
        <label class="space-y-1 text-sm"><span>{{ t('commercial.community.status') }}</span>
          <select v-model="item.status" class="input"><option v-for="status in statuses" :key="status" :value="status">{{ t(`commercial.community.${status}`) }}</option></select>
        </label>
      </div>
      <div class="flex flex-wrap items-center gap-4">
        <img v-if="item.qr_code" :src="item.qr_code" :alt="t('commercial.community.qr')" class="h-24 w-24 rounded bg-white p-2 object-contain" />
        <label class="btn btn-secondary btn-sm cursor-pointer">{{ t('commercial.community.qr') }}<input type="file" accept="image/png,image/jpeg,image/webp" class="sr-only" @change="upload($event, item)" /></label>
        <button v-if="item.qr_code" type="button" class="btn btn-secondary btn-sm" @click="item.qr_code = ''">{{ t('common.remove') }}</button>
      </div>
      <p v-if="item.enabled && (!item.name.trim() || !(item.account.trim() || item.url.trim() || item.qr_code))" class="text-sm text-amber-700 dark:text-amber-300">{{ t('commercial.community.required') }}</p>
    </div>
    <p v-if="error" role="alert" class="text-sm text-red-600">{{ error }}</p>
    <button type="button" class="btn btn-secondary" :disabled="items.length >= 6" @click="add">{{ t('commercial.community.add') }}</button>
  </section>
</template>
<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import type { CommunityLink } from '@/types'
const props = defineProps<{ modelValue?: CommunityLink[] }>()
const emit = defineEmits<{ 'update:modelValue': [CommunityLink[]] }>()
const { t } = useI18n()
const items = computed(() => props.modelValue ?? [])
const error = ref('')
const fields = ['platform', 'name', 'name_en', 'account', 'url'] as const
const statuses = ['open', 'full', 'paused'] as const
function add() { emit('update:modelValue', [...items.value, { id: crypto.randomUUID(), platform: '', name: '', name_en: '', account: '', url: '', qr_code: '', status: 'open', enabled: false }]) }
function remove(index: number) { emit('update:modelValue', items.value.filter((_, i) => i !== index)) }
function move(index: number, delta: number) { const next = [...items.value]; [next[index], next[index + delta]] = [next[index + delta], next[index]]; emit('update:modelValue', next) }
function upload(event: Event, item: CommunityLink) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]; input.value = ''; error.value = ''
  if (!file) return
  if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type) || file.size > 300 * 1024) { error.value = t('commercial.community.imageError'); return }
  const reader = new FileReader()
  reader.onload = () => { item.qr_code = String(reader.result) }
  reader.onerror = () => { error.value = t('common.fileReadFailed') }
  reader.readAsDataURL(file)
}
</script>
