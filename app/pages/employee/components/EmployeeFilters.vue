<template>
  <div class="flex flex-col sm:flex-row gap-4">
    <div class="relative flex-1">
      <Search class="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        :model-value="searchQuery"
        @update:model-value="$emit('update:searchQuery', String($event))"
        placeholder="Cari nama atau NPK..."
        class="pl-11 bg-background border-border shadow-sm"
      />
    </div>
    <div class="w-full sm:w-64">
      <Select
        :model-value="filterDepartment"
        @update:model-value="$emit('update:filterDepartment', $event ? String($event) : '')"
      >
        <SelectTrigger class="bg-background border-border shadow-sm rounded-3xl h-12 px-5">
          <SelectValue placeholder="Pilih Departemen" />
        </SelectTrigger>
        <SelectContent class="rounded-2xl border-border">
          <SelectItem value="none">Semua Departemen</SelectItem>
          <SelectItem value="Kreavoks Development Team (KDT)">Kreavoks Development Team (KDT)</SelectItem>
          <SelectItem value="Kreavoks Creative Team (KCT)">Kreavoks Creative Team (KCT)</SelectItem>
          <SelectItem value="Kreavoks Management Team (KMT)">Kreavoks Management Team (KMT)</SelectItem>
          <SelectItem value="Kreavoks Collaboration Mentor (KCM)">Kreavoks Collaboration Mentor (KCM)</SelectItem>
          <SelectItem value="Lainnya">Lainnya</SelectItem>
        </SelectContent>
      </Select>
    </div>
    <Button
      variant="outline"
      class="gap-2 border-border bg-background shadow-sm text-foreground hover:bg-accent px-6"
      @click="$emit('reset')"
    >
      <RefreshCw class="h-4 w-4 text-kv-primary" :class="{ 'animate-spin': loading }" />
      Reset
    </Button>
  </div>
</template>

<script setup lang="ts">
import { Search, RefreshCw } from 'lucide-vue-next'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'

defineProps<{
  searchQuery: string
  filterDepartment: string
  loading?: boolean
}>()

defineEmits<{
  (e: 'update:searchQuery', value: string): void
  (e: 'update:filterDepartment', value: string): void
  (e: 'reset'): void
}>()
</script>
