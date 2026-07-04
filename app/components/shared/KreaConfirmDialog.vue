<script setup lang="ts">
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { computed } from 'vue'

const props = defineProps<{
  open: boolean
  title: string
  description?: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'primary'
}>()

const emits = defineEmits<{
  (e: 'update:open', value: boolean): void
  (e: 'confirm'): void
  (e: 'cancel'): void
}>()

const isOpen = computed({
  get: () => props.open,
  set: (val) => emits('update:open', val)
})

const handleConfirm = () => {
  emits('confirm')
  isOpen.value = false
}

const handleCancel = () => {
  emits('cancel')
  isOpen.value = false
}
</script>

<template>
  <AlertDialog v-model:open="isOpen">
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle class="text-[#131313]">{{ title }}</AlertDialogTitle>
        <AlertDialogDescription v-if="description">
          {{ description }}
        </AlertDialogDescription>
      </AlertDialogHeader>
      
      <AlertDialogFooter>
        <AlertDialogCancel @click="handleCancel" class="rounded-3xl">
          {{ cancelText || 'Batal' }}
        </AlertDialogCancel>
        
        <AlertDialogAction 
          @click="handleConfirm"
          :class="[
            'rounded-3xl border-0 text-white',
            variant === 'danger' 
              ? 'bg-rose-500 hover:bg-rose-600' 
              : 'bg-kv-primary hover:bg-kv-primary/90'
          ]"
        >
          {{ confirmText || 'Konfirmasi' }}
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>
