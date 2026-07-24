<script lang="ts" setup>
import type { CalendarRootEmits, CalendarRootProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import { reactiveOmit } from "@vueuse/core"
import { CalendarRoot, useForwardPropsEmits } from "reka-ui"
import { cn } from "@/lib/utils"
import { CalendarCell, CalendarCellTrigger, CalendarGrid, CalendarGridBody, CalendarGridHead, CalendarGridRow, CalendarHeadCell, CalendarHeader, CalendarHeading, CalendarNextButton, CalendarPrevButton } from "."
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const props = defineProps<CalendarRootProps & { 
  class?: HTMLAttributes["class"]
  getCustomIndicators?: (date: any) => Array<'blue' | 'yellow' | 'green'>
  holidays?: Record<string, string>
}>()

const emits = defineEmits<CalendarRootEmits>()

const delegatedProps = reactiveOmit(props, ["class", "getCustomIndicators", "holidays"])

const forwarded = useForwardPropsEmits(delegatedProps, emits)
</script>

<template>
  <CalendarRoot
    v-slot="{ grid, weekDays }"
    :class="cn('p-3', props.class)"
    v-bind="forwarded"
  >
    <CalendarHeader>
      <CalendarPrevButton />
      <div class="flex items-center gap-1 relative z-50" v-if="grid[0]">
        <Select 
          :model-value="grid[0].value.month.toString()"
          @update:model-value="(val) => {
            if (!grid[0] || !val) return
            const date = grid[0].value
            emits('update:placeholder', date.set({ month: parseInt(val as string) }))
          }"
        >
          <SelectTrigger class="h-8 px-2 text-sm w-[110px] font-medium border-none shadow-none focus:ring-0">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem v-for="m in 12" :key="m" :value="m.toString()">
              {{ new Date(2000, m - 1).toLocaleString('id-ID', { month: 'long' }) }}
            </SelectItem>
          </SelectContent>
        </Select>
        
        <Select
          :model-value="grid[0].value.year.toString()"
          @update:model-value="(val) => {
            if (!grid[0] || !val) return
            const date = grid[0].value
            emits('update:placeholder', date.set({ year: parseInt(val as string) }))
          }"
        >
          <SelectTrigger class="h-8 px-2 text-sm w-[80px] font-medium border-none shadow-none focus:ring-0">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem v-for="y in 21" :key="y" :value="(grid[0].value.year - 10 + (y - 1)).toString()">
              {{ grid[0].value.year - 10 + (y - 1) }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      <CalendarNextButton />
    </CalendarHeader>

    <div class="flex flex-col gap-y-4 mt-4 sm:flex-row sm:gap-x-4 sm:gap-y-0">
      <CalendarGrid v-for="month in grid" :key="month.value.toString()">
        <CalendarGridHead>
          <CalendarGridRow>
            <CalendarHeadCell
              v-for="day in weekDays" :key="day"
            >
              {{ day }}
            </CalendarHeadCell>
          </CalendarGridRow>
        </CalendarGridHead>
        <CalendarGridBody>
          <CalendarGridRow v-for="(weekDates, index) in month.rows" :key="`weekDate-${index}`" class="mt-2 w-full">
            <CalendarCell
              v-for="weekDate in weekDates"
              :key="weekDate.toString()"
              :date="weekDate"
              class="relative"
            >
              <CalendarCellTrigger
                :day="weekDate"
                :month="month.value"
                :class="props.holidays?.[weekDate.toString()] ? '[&:not([data-selected])]:bg-red-500/15 [&:not([data-selected])]:text-red-600 [&:not([data-selected])]:hover:bg-red-500/25' : ''"
                :title="props.holidays?.[weekDate.toString()]"
              />
              
              <!-- Indicator Dots for Agendas, Holidays, Logbooks -->
              <div 
                class="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5 pointer-events-none"
              >
                <!-- Holiday dot (always reactive via prop) -->
                <span 
                  v-if="props.holidays?.[weekDate.toString()]"
                  class="h-1 w-1 rounded-full bg-amber-400"
                />
                <!-- Custom indicator dots from hook -->
                <template v-if="getCustomIndicators">
                  <span 
                    v-for="(color, cIdx) in getCustomIndicators(weekDate).filter(c => c !== 'yellow')" 
                    :key="cIdx"
                    class="h-1 w-1 rounded-full"
                    :class="{
                      'bg-blue-500': color === 'blue',
                      'bg-emerald-500': color === 'green'
                    }"
                  />
                </template>
              </div>
            </CalendarCell>
          </CalendarGridRow>
        </CalendarGridBody>
      </CalendarGrid>
    </div>
  </CalendarRoot>
</template>
