<script lang="ts" setup>
import type { ToasterProps } from "vue-sonner"
import { reactiveOmit } from "@vueuse/core"
import { Toaster as Sonner } from "vue-sonner"

const props = defineProps<ToasterProps>()
const delegatedProps = reactiveOmit(props, "toastOptions", "position", "theme", "richColors")
</script>

<template>
  <Sonner
    class="toaster group"
    position="top-right"
    theme="light"
    :rich-colors="true"
    :toast-options="{
      duration: 4000,
      classes: {
        toast: 'group toast border border-slate-200/80 shadow-md !rounded-2xl bg-white/95 backdrop-blur-sm flex items-center pl-3.5 pr-8 !py-2.5 gap-2.5 min-h-0 relative',
        content: 'flex flex-col gap-0.5',
        title: 'font-semibold text-sm text-slate-900 leading-tight',
        description: 'text-xs text-slate-500 leading-normal',
        closeButton: '!right-2 !top-1/2 !-translate-y-1/2 !left-auto !opacity-100 !border-0 !bg-transparent hover:!bg-slate-100 !text-slate-400 hover:!text-slate-600 !rounded-md !h-6 !w-6 !flex !items-center !justify-center [&_svg]:!h-3.5 [&_svg]:!w-3.5 !transition-all !shadow-none',
      },
    }"
    v-bind="delegatedProps"
  />
</template>
