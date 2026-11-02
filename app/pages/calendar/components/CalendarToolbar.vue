<template>
  <Card class="bg-card border border-border rounded-2xl sm:rounded-3xl p-3 sm:p-4 shadow-none">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
      <!-- Month Navigation & Date Picker -->
      <div class="flex items-center gap-1.5 sm:gap-2 w-full md:w-auto">
        <div class="flex items-center gap-1.5 shrink-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            :icon="true"
            :icon-left="ChevronLeft"
            title="Bulan sebelumnya"
            @click="emit('prevMonth')"
          />

          <Button
            type="button"
            variant="outline"
            size="sm"
            label="Hari Ini"
            @click="emit('goToToday')"
          />

          <Button
            type="button"
            variant="outline"
            size="sm"
            :icon="true"
            :icon-left="ChevronRight"
            title="Bulan selanjutnya"
            @click="emit('nextMonth')"
          />
        </div>

        <!-- DateRangePicker -->
        <DateRangePicker
          v-model="selectedDateRange"
          :placeholder="currentMonthLabel"
          :min-days="7"
          :max-days="31"
          class="flex-1 min-w-0"
          @change="(val) => emit('dateRangeChange', val)"
        />
      </div>

      <!-- View Toggle & View Mode Dropdown via KreaUI -->
      <div class="flex items-center justify-between md:justify-end gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-border/50">
        <!-- View Toggle: Semua Agenda vs Agenda Saya via KreaUI Tabs -->
        <Tabs
          v-model="filterView"
          :items="viewTabs"
          variant="pills"
          size="sm"
        />

        <!-- Calendar View Mode Dropdown -->
        <DropdownMenu
          v-model="currentViewMode"
          :items="viewModeOptions"
          :trigger-text="currentViewModeLabel"
          variant="default"
          size="sm"
        />
      </div>
    </div>
  </Card>
</template>

<script setup lang="ts">
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'
import { Card } from '~/components/ui/card'
import { Button, Tabs, DropdownMenu } from '@kreavoks/kreaui'
import type { TabItem, DropdownMenuItem } from '@kreavoks/kreaui'
import { DateRangePicker, type DateRangeValue } from '~/components/ui/date-picker'

const selectedDateRange = defineModel<DateRangeValue | null>('selectedDateRange', { default: null })
const filterView = defineModel<string>('filterView', { default: 'all' })
const currentViewMode = defineModel<string>('currentViewMode', { default: 'month' })

defineProps<{
  currentMonthLabel: string
  viewTabs: TabItem[]
  viewModeOptions: DropdownMenuItem[]
  currentViewModeLabel: string
}>()

const emit = defineEmits<{
  prevMonth: []
  nextMonth: []
  goToToday: []
  dateRangeChange: [value: DateRangeValue | null]
}>()
</script>
