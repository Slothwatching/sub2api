<template><details class="card p-4 text-sm"><summary class="cursor-pointer font-medium">{{ t('commercial.billing.title') }}</summary><div class="mt-3 space-y-2 leading-relaxed text-gray-600 dark:text-dark-300"><p v-for="key in ['actual', 'tokens', 'quota', 'reset']" :key="key">{{ t(`commercial.billing.${key}`) }}</p></div></details></template>
<script setup lang="ts">
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
</script>
