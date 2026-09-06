<template>
  <div class="app-shell min-h-screen" :class="{ 'workspace-user': !isAdmin, 'workspace-admin': isAdmin, 'workspace-compact': sidebarCollapsed }">
    <AppHeader />
    <AppSidebar />
    <main class="app-main workspace-content">
      <div class="workspace-page-intro">
        <div>
          <p class="workspace-context">{{ isAdmin ? t('home.workspace.administration') : t('home.workspace.label') }}</p>
          <h1 class="app-heading">{{ pageTitle }}</h1>
          <p v-if="pageDescription" class="workspace-page-description">{{ pageDescription }}</p>
        </div>
      </div>
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
import '@/styles/onboarding.css'
import { usePageHeading } from '@/composables/usePageHeading'
import { useI18n } from 'vue-i18n'
import { computed, onMounted } from 'vue'
import { useAppStore } from '@/stores'
import { useAuthStore } from '@/stores/auth'
import { useOnboardingTour } from '@/composables/useOnboardingTour'
import { useOnboardingStore } from '@/stores/onboarding'
import AppSidebar from './AppSidebar.vue'
import AppHeader from './AppHeader.vue'

const { t } = useI18n()
const { pageTitle, pageDescription } = usePageHeading()
const appStore = useAppStore()
const authStore = useAuthStore()
const sidebarCollapsed = computed(() => appStore.sidebarCollapsed)
const isAdmin = computed(() => authStore.user?.role === 'admin')

const { replayTour } = useOnboardingTour({
  storageKey: isAdmin.value ? 'admin_guide' : 'user_guide',
  autoStart: true
})

const onboardingStore = useOnboardingStore()

onMounted(() => {
  onboardingStore.setReplayCallback(replayTour)
})

defineExpose({ replayTour })
</script>
