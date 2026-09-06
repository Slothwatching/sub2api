<template>
  <div
    class="relative flex min-h-screen items-center justify-center overflow-hidden bg-gray-50 px-4 dark:bg-dark-950"
  >
    <div class="absolute right-4 top-4 flex items-center gap-2">
      <LocaleSwitcher />
      <ThemeToggle />
    </div>
    <div class="relative z-10 w-full max-w-md py-24 text-center">
      <div class="mb-8 font-serif text-[7rem] font-normal leading-none text-primary-700 dark:text-primary-300" aria-hidden="true">404</div>

      <!-- Text Content -->
      <div class="mb-8">
        <h1 class="mb-3 text-2xl font-bold text-gray-900 dark:text-white">
          {{ t('errors.pageNotFound') }}
        </h1>
        <p class="text-gray-500 dark:text-dark-400">
          {{ t('home.workspace.notFoundDescription') }}
        </p>
      </div>

      <!-- Action Buttons -->
      <div class="flex flex-col justify-center gap-3 sm:flex-row">
        <button @click="goBack" class="btn btn-secondary">
          <Icon name="arrowLeft" size="md" class="mr-2" />
          {{ t('common.back') }}
        </button>
        <router-link to="/dashboard" class="btn btn-primary">
          <Icon name="home" size="md" class="mr-2" />
          {{ t('home.goToDashboard') }}
        </router-link>
      </div>

      <div v-if="contactInfo || docUrl" class="mt-8 space-y-2 text-sm text-gray-600 dark:text-dark-400">
        <p v-if="contactInfo" class="whitespace-pre-wrap break-words">{{ t('common.contactSupport') }}: {{ contactInfo }}</p>
        <a v-if="docUrl" :href="docUrl" target="_blank" rel="noopener noreferrer" class="text-primary-700 dark:text-primary-300">{{ t('home.viewDocs') }}</a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { computed } from 'vue'
import { useAppStore } from '@/stores/app'
import { sanitizeUrl } from '@/utils/url'
import { useRouter } from 'vue-router'
import Icon from '@/components/icons/Icon.vue'
import LocaleSwitcher from '@/components/common/LocaleSwitcher.vue'
import ThemeToggle from '@/components/common/ThemeToggle.vue'

const { t } = useI18n()
const router = useRouter()
const appStore = useAppStore()
const contactInfo = computed(() => appStore.contactInfo)
const docUrl = computed(() => sanitizeUrl(appStore.docUrl))

function goBack(): void {
  router.back()
}
</script>
