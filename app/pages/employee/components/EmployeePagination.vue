<template>
  <div class="flex items-center justify-between px-4 py-3 bg-card border border-border rounded-3xl mt-4 shadow-sm">
    <!-- Mobile Pagination -->
    <div class="flex flex-1 justify-between sm:hidden">
      <Button 
        variant="outline" 
        size="sm" 
        :disabled="page === 1" 
        @click="$emit('update:page', page - 1)"
        class="border-border bg-background"
      >
        Previous
      </Button>
      <Button 
        variant="outline" 
        size="sm" 
        :disabled="page === totalPages" 
        @click="$emit('update:page', page + 1)"
        class="border-border bg-background"
      >
        Next
      </Button>
    </div>

    <!-- Desktop Pagination -->
    <div class="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
      <div>
        <p class="text-sm text-muted-foreground">
          Menampilkan
          <span class="font-medium text-foreground">{{ (page - 1) * limit + 1 }}</span>
          sampai
          <span class="font-medium text-foreground">{{ Math.min(page * limit, totalItems) }}</span>
          dari
          <span class="font-medium text-foreground">{{ totalItems }}</span>
          data
        </p>
      </div>
      <div>
        <nav class="isolate inline-flex -space-x-px rounded-md gap-1" aria-label="Pagination">
          <Button
            variant="outline"
            size="icon"
            :disabled="page === 1"
            @click="$emit('update:page', page - 1)"
            class="h-9 w-9 rounded-xl border-border bg-background text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft class="h-4 w-4" />
          </Button>
          
          <template v-for="p in totalPages" :key="p">
            <Button
              v-if="p === 1 || p === totalPages || (p >= page - 2 && p <= page + 2)"
              variant="outline"
              size="sm"
              @click="$emit('update:page', p)"
              class="h-9 w-9 rounded-xl border-border"
              :class="page === p ? 'bg-kv-primary text-white border-transparent hover:bg-kv-primary/95' : 'bg-background hover:bg-accent text-muted-foreground hover:text-foreground'"
            >
              {{ p }}
            </Button>
            <span 
              v-else-if="(p === 2 && page > 4) || (p === totalPages - 1 && page < totalPages - 3)" 
              class="inline-flex items-center px-2 text-sm font-semibold text-muted-foreground"
            >
              ...
            </span>
          </template>

          <Button
            variant="outline"
            size="icon"
            :disabled="page === totalPages"
            @click="$emit('update:page', page + 1)"
            class="h-9 w-9 rounded-xl border-border bg-background text-muted-foreground hover:text-foreground"
          >
            <ChevronRight class="h-4 w-4" />
          </Button>
        </nav>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Button } from '~/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'

defineProps<{
  page: number
  totalPages: number
  totalItems: number
  limit: number
}>()

defineEmits<{
  (e: 'update:page', page: number): void
}>()
</script>
