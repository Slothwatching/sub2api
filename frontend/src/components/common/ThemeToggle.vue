<template>
  <div class="theme-controls inline-flex items-center gap-0.5">
  <button
    type="button"
    class="btn btn-ghost btn-icon"
    :aria-label="label"
    :title="label"
    @click="toggleTheme"
  >
    <Icon :name="isDark ? 'sun' : 'moon'" size="md" />
  </button>
    <button type="button" class="theme-auto rounded-md px-1.5 py-1 text-xs text-gray-500 dark:text-gray-400" :title="t('home.followSystem')" :aria-label="t('home.followSystem')" :aria-pressed="isAutomatic" @click="followSystem">{{ t('home.autoTheme') }}</button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useThemeAppearance } from '@/composables/useThemeAppearance'
import Icon from '@/components/icons/Icon.vue'

const { t } = useI18n()
const { isDark, isAutomatic, toggleTheme, followSystem } = useThemeAppearance()
const label = computed(() => t(isDark.value ? 'home.switchToLight' : 'home.switchToDark'))
</script>
