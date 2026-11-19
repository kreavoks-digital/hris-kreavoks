<template>
  <div ref="containerRef" class="flex justify-center" />
</template>

<script setup lang="ts">
// Cloudflare Turnstile widget (checkbox "Verify you are human").
// Loads the Turnstile script once and renders the widget explicitly.
const props = defineProps<{
  siteKey: string
}>()

const emit = defineEmits<{
  (e: 'verify', token: string): void
  (e: 'expire'): void
  (e: 'error'): void
}>()

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: Record<string, unknown>) => string
      reset: (widgetId?: string) => void
      remove: (widgetId?: string) => void
    }
  }
}

const containerRef = ref<HTMLDivElement | null>(null)
const widgetId = ref<string | null>(null)

const renderWidget = () => {
  if (!containerRef.value || !window.turnstile || widgetId.value) return
  widgetId.value = window.turnstile.render(containerRef.value, {
    sitekey: props.siteKey,
    callback: (token: string) => emit('verify', token),
    'expired-callback': () => emit('expire'),
    'error-callback': () => emit('error'),
  })
}

onMounted(() => {
  if (window.turnstile) {
    renderWidget()
    return
  }
  const existing = document.querySelector('script[src*="challenges.cloudflare.com/turnstile"]')
  if (!existing) {
    const s = document.createElement('script')
    s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
    s.async = true
    s.defer = true
    s.onload = renderWidget
    document.head.appendChild(s)
  } else {
    existing.addEventListener('load', renderWidget)
  }
})

onBeforeUnmount(() => {
  if (widgetId.value && window.turnstile) {
    try {
      window.turnstile.remove(widgetId.value)
    } catch {
      // widget already gone, ignore
    }
    widgetId.value = null
  }
})
</script>
