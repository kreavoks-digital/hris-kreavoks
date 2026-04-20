<script lang="ts" setup>
import type { ToasterProps } from "vue-sonner"
import { reactiveOmit } from "@vueuse/core"
import { Check, Info, Loader2, X, AlertCircle } from 'lucide-vue-next'
import { Toaster as Sonner } from "vue-sonner"

const props = defineProps<ToasterProps>()
const delegatedProps = reactiveOmit(props, "toastOptions", "position")
</script>

<template>
  <Sonner
    class="toaster group"
    position="top-right"
    :expand="true"
    :close-button="false"
    :visible-toasts="5"
    :toast-options="{
      classes: {
        toast: '!flex !items-center !gap-4 !w-80 !bg-white/90 dark:!bg-slate-950/90 !backdrop-blur-xl !border !border-slate-200/50 dark:!border-slate-800/50 !p-3.5 !rounded-3xl !min-h-0 transition-all duration-500',
        content: '!flex !flex-col !gap-0.5',
        title: '!text-sm !font-semibold !text-slate-900 dark:!text-slate-100 !leading-tight',
        description: '!text-sm !text-slate-500 dark:!text-slate-400 !font-medium !leading-tight',
        closeButton: '!hidden',
      },
    }"
    v-bind="delegatedProps"
  >
    <!-- Success Icon -->
    <template #success-icon>
      <div class="h-8 w-8 shrink-0 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
        <Check class="h-4 w-4" stroke-width="3" />
      </div>
    </template>

    <!-- Info Icon -->
    <template #info-icon>
      <div class="h-8 w-8 shrink-0 rounded-full bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
        <Info class="h-4 w-4" stroke-width="2.5" />
      </div>
    </template>

    <!-- Warning Icon -->
    <template #warning-icon>
      <div class="h-8 w-8 shrink-0 rounded-full bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400">
        <AlertCircle class="h-4 w-4" stroke-width="2.5" />
      </div>
    </template>

    <!-- Error Icon -->
    <template #error-icon>
      <div class="h-8 w-8 shrink-0 rounded-full bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center text-rose-600 dark:text-rose-400">
        <X class="h-4 w-4" stroke-width="3" />
      </div>
    </template>

    <!-- Loading Icon -->
    <template #loading-icon>
      <div class="h-8 w-8 shrink-0 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-500">
        <Loader2 class="h-4 w-4 animate-spin" />
      </div>
    </template>
  </Sonner>
</template>
