<template>
  <div class="auth-shell">
    <div class="auth-toolbar">
      <router-link to="/home" class="btn btn-ghost inline-flex items-center gap-2">
        <Icon name="arrowLeft" size="sm" />
        {{ t('common.back') }}
      </router-link>
      <div class="auth-toolbar-actions">
        <LocaleSwitcher />
        <ThemeToggle />
      </div>
    </div>
    <div class="auth-content">
      <aside class="auth-story">
      <div class="auth-brand">
        <template v-if="settingsLoaded">
          <img :src="siteLogo || '/brand-mark.svg'" :alt="siteName" />
          <h1>{{ siteName }}</h1>
          <p>{{ siteSubtitle }}</p>
        </template>
      </div>
      <div class="auth-story-guide">
        <p class="home-eyebrow">{{ t('home.workspace.guideTitle') }}</p>
        <div v-for="step in [1, 2, 3]" :key="step" class="home-step">
          <span class="home-step-number">0{{ step }}</span>
          <div><h3>{{ t(`home.workspace.step${step}Title`) }}</h3><p>{{ t(`home.workspace.step${step}Description`) }}</p></div>
        </div>
      </div>
      </aside>
      <div class="auth-form-column">
      <div class="card auth-panel"><slot /></div>
      <div class="auth-footer"><slot name="footer" /></div>
      <div class="auth-footer">
        &copy; {{ currentYear }} {{ siteName }}. {{ t('home.footer.allRightsReserved') }}
      </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAppStore } from '@/stores'
import { sanitizeUrl } from '@/utils/url'
import LocaleSwitcher from '@/components/common/LocaleSwitcher.vue'
import ThemeToggle from '@/components/common/ThemeToggle.vue'
import Icon from '@/components/icons/Icon.vue'

const { t } = useI18n()
const appStore = useAppStore()
const siteName = computed(() => appStore.siteName || '')
const siteLogo = computed(() => sanitizeUrl(appStore.siteLogo || '', { allowRelative: true, allowDataUrl: true }))
const siteSubtitle = computed(() => appStore.cachedPublicSettings?.site_subtitle || '')
const settingsLoaded = computed(() => appStore.publicSettingsLoaded)
const currentYear = computed(() => new Date().getFullYear())
onMounted(() => { appStore.fetchPublicSettings() })
</script>
