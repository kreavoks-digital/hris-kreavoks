<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between gap-4">
      <div>
        <h1 class="text-xl sm:text-2xl font-semibold text-foreground">Kalender Kerja</h1>
        <p class="text-muted-foreground text-xs sm:text-sm mt-0.5">
          Pantau jadwal rapat dan agenda kegiatan tim.
        </p>
      </div>

      <!-- Desktop Buat Jadwal Button (Hidden on mobile, replaced with FAB) -->
      <div class="hidden sm:flex items-center gap-2">
        <Button
          variant="primary"
          size="sm"
          @click="navigateTo('/calendar/create')"
        >
          <Plus class="w-4 h-4 mr-1.5" />
          Buat Jadwal
        </Button>
      </div>
    </div>

    <!-- Controls & Filters Toolbar -->
    <Card class="bg-card border border-border rounded-2xl sm:rounded-3xl p-3 sm:p-4 shadow-none">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
        <!-- Month Navigation & Date Picker (Single compact row on mobile) -->
        <div class="flex items-center gap-1.5 sm:gap-2 w-full md:w-auto">
          <!-- Navigation buttons group -->
          <div class="flex items-center gap-1.5 shrink-0">
            <Button
              variant="outline"
              size="sm"
              icon
              @click="prevMonth"
              title="Bulan sebelumnya"
            >
              <ChevronLeft class="w-4 h-4" />
            </Button>

            <Button
              variant="outline"
              size="sm"
              @click="goToToday"
            >
              Hari Ini
            </Button>

            <Button
              variant="outline"
              size="sm"
              icon
              @click="nextMonth"
              title="Bulan selanjutnya"
            >
              <ChevronRight class="w-4 h-4" />
            </Button>
          </div>

          <!-- Kreavoks DateRangePicker (Min 7 hari, Max 31 hari) -->
          <DateRangePicker
            v-model="selectedDateRange"
            :placeholder="currentMonthLabel"
            :min-days="7"
            :max-days="31"
            class="flex-1 min-w-0"
            @change="onDateRangeChange"
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

          <!-- Calendar View Mode Dropdown (Teams & Google Calendar style) -->
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

    <!-- 1. MONTH VIEW (Monthly Calendar Grid) -->
    <Card v-if="currentViewMode === 'month'" class="bg-card border border-border rounded-2xl sm:rounded-3xl p-3 sm:p-6 shadow-none overflow-hidden">
      <!-- Days of Week Header -->
      <div class="grid grid-cols-7 gap-px border-b border-border pb-2.5 mb-2 text-center text-[11px] sm:text-xs font-semibold text-muted-foreground">
        <div>Sen</div>
        <div>Sel</div>
        <div>Rab</div>
        <div>Kam</div>
        <div>Jum</div>
        <div class="text-rose-500">Sab</div>
        <div class="text-rose-500">Min</div>
      </div>

      <!-- Days Cells Grid: proportional on mobile, min-h-[560px] only on desktop -->
      <div class="grid grid-cols-7 gap-1 sm:gap-2 auto-rows-fr sm:min-h-[560px]">
        <div
          v-for="(day, idx) in calendarGridDays"
          :key="idx"
          @click="handleDayClick(day)"
          :class="[
            'border rounded-xl sm:rounded-2xl p-1 sm:p-2 min-h-[52px] sm:min-h-[105px] flex flex-col transition-colors cursor-pointer',
            day.isCurrentMonth ? 'bg-background hover:bg-muted/30 border-border' : 'bg-muted/10 opacity-30 border-transparent',
            day.isToday ? 'ring-2 ring-kv-primary border-transparent' : '',
            isInSelectedRange(day.date) ? 'ring-2 ring-kv-primary/50 bg-kv-primary/5' : '',
            activeMobileDateStr === getIsoDateStr(day.date) ? 'border-kv-primary/70 bg-muted/40' : ''
          ]"
        >
          <!-- Date number header -->
          <div class="flex items-center justify-between sm:mb-1">
            <span
              :class="[
                'text-xs font-semibold w-5 h-5 flex items-center justify-center rounded-full',
                day.isToday ? 'bg-kv-primary text-white font-bold' : (day.isWeekend ? 'text-rose-500' : 'text-foreground')
              ]"
            >
              {{ day.date.getDate() }}
            </span>

            <span v-if="day.events.length > 0" class="text-[10px] text-muted-foreground hidden sm:inline">
              {{ day.events.length }} acara
            </span>
          </div>

          <!-- Mobile view: Event indicator dots (compact, not elongated) -->
          <div v-if="day.events.length > 0" class="flex items-center justify-center gap-1 mt-1 flex-wrap sm:hidden">
            <span
              v-for="ev in day.events.slice(0, 3)"
              :key="ev.id"
              class="w-1.5 h-1.5 rounded-full shrink-0"
              :style="{ backgroundColor: ev.color || '#4082E6' }"
            />
            <span v-if="day.events.length > 3" class="text-[9px] font-bold text-muted-foreground leading-none">
              +
            </span>
          </div>

          <!-- Desktop view: Full Event badges with title -->
          <div class="hidden sm:block space-y-1 flex-1 overflow-hidden mt-1">
            <div
              v-for="ev in day.events.slice(0, 3)"
              :key="ev.id"
              @click.stop="openDetailModal(ev, day.events)"
              class="px-2 py-0.5 rounded-lg text-[11px] truncate font-medium border flex items-center gap-1.5 transition-transform hover:opacity-90 text-foreground"
              :style="{
                backgroundColor: `${ev.color || '#4082E6'}20`,
                borderColor: `${ev.color || '#4082E6'}50`
              }"
              :title="ev.title"
            >
              <span
                class="w-1.5 h-1.5 rounded-full shrink-0"
                :style="{ backgroundColor: ev.color || '#4082E6' }"
              />
              <span class="truncate">{{ ev.title }}</span>
            </div>

            <!-- More indicator -->
            <div
              v-if="day.events.length > 3"
              class="text-[10px] text-muted-foreground font-medium pl-1"
            >
              +{{ day.events.length - 3 }} lainnya
            </div>
          </div>
        </div>
      </div>

      <!-- Mobile Selected Date Agenda Section in Month View -->
      <div class="sm:hidden mt-3 pt-3 border-t border-border space-y-2">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-1.5">
            <CalendarDays class="w-4 h-4 text-kv-primary" />
            <h4 class="text-xs font-bold text-foreground">
              {{ activeMobileDateLabel }}
            </h4>
          </div>
          <button
            type="button"
            class="text-xs font-semibold text-kv-primary hover:underline cursor-pointer"
            @click="navigateTo(`/calendar/create?date=${activeMobileDateStr}`)"
          >
            + Buat Jadwal
          </button>
        </div>

        <div v-if="activeMobileEvents.length > 0" class="space-y-1.5">
          <div
            v-for="ev in activeMobileEvents"
            :key="ev.id"
            @click="openDetailModal(ev, activeMobileEvents)"
            class="p-2.5 rounded-xl border border-border bg-card hover:bg-muted/30 transition-all flex items-center justify-between gap-2.5 cursor-pointer shadow-xs"
          >
            <div class="flex items-center gap-2.5 min-w-0">
              <span
                class="w-2.5 h-2.5 rounded-full shrink-0"
                :style="{ backgroundColor: ev.color || '#4082E6' }"
              />
              <div class="min-w-0">
                <p class="text-xs font-bold text-foreground truncate">{{ ev.title }}</p>
                <p class="text-[11px] text-muted-foreground truncate">
                  {{ formatEventTime(ev) }} &bull; {{ ev.location || 'Online' }}
                </p>
              </div>
            </div>
            <ChevronRight class="w-4 h-4 text-muted-foreground shrink-0" />
          </div>
        </div>
        <div v-else class="text-center py-3 bg-muted/20 rounded-xl border border-dashed border-border text-xs text-muted-foreground">
          Tidak ada agenda pada tanggal ini.
        </div>
      </div>
    </Card>

    <!-- 2. DAY VIEW (Google Calendar Mobile & Desktop Timeline) -->
    <Card v-if="currentViewMode === 'day'" class="bg-card border border-border rounded-2xl sm:rounded-3xl p-3 sm:p-6 shadow-none overflow-hidden space-y-4">
      <!-- Top Collapsible Mini Calendar Week/Month Strip (Screenshots 2 & 3) -->
      <div class="border-b border-border pb-3 space-y-2">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            {{ currentMonthLabel }}
          </span>
          <button
            type="button"
            @click="isMiniMonthExpanded = !isMiniMonthExpanded"
            class="text-xs text-kv-primary hover:underline flex items-center gap-1 font-semibold cursor-pointer"
          >
            <span>{{ isMiniMonthExpanded ? 'Perkecil' : 'Kalender Bulan' }}</span>
            <ChevronUp v-if="isMiniMonthExpanded" class="w-3.5 h-3.5" />
            <ChevronDown v-else class="w-3.5 h-3.5" />
          </button>
        </div>

        <!-- Expanded: Mini Month 30-Day Grid (Screenshot 3) -->
        <div v-if="isMiniMonthExpanded" class="pt-1 select-none">
          <div class="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold text-muted-foreground mb-1">
            <span>Min</span><span>Sen</span><span>Sel</span><span>Rab</span><span>Kam</span><span>Jum</span><span class="text-rose-500">Sab</span>
          </div>
          <div class="grid grid-cols-7 gap-1">
            <button
              v-for="(day, idx) in miniCalendarDays"
              :key="idx"
              type="button"
              @click="activeMobileDate = day.date"
              :class="[
                'h-8 rounded-full text-xs font-medium flex flex-col items-center justify-center transition-all cursor-pointer relative',
                day.isSelected ? 'bg-kv-primary text-white font-bold shadow-sm' : (day.isToday ? 'ring-1 ring-kv-primary text-kv-primary font-bold' : (day.isCurrentMonth ? 'text-foreground hover:bg-muted' : 'text-muted-foreground/40')),
              ]"
            >
              <span>{{ day.date.getDate() }}</span>
              <span v-if="day.hasEvents && !day.isSelected" class="w-1 h-1 rounded-full bg-kv-primary absolute bottom-1" />
            </button>
          </div>
        </div>

        <!-- Collapsed: 7-Day Current Week Strip (Screenshot 2) -->
        <div v-else class="grid grid-cols-7 gap-1 sm:gap-2 text-center select-none">
          <button
            v-for="(day, idx) in currentWeekDays"
            :key="idx"
            type="button"
            @click="activeMobileDate = day.date"
            :class="[
              'py-1.5 sm:py-2 rounded-xl flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer',
              day.isSelected ? 'bg-kv-primary text-white font-bold shadow-sm' : 'hover:bg-muted/40 text-muted-foreground'
            ]"
          >
            <span class="text-[10px] sm:text-xs font-medium">{{ day.dayName }}</span>
            <span
              :class="[
                'w-7 h-7 flex items-center justify-center rounded-full text-xs sm:text-sm font-bold',
                day.isSelected ? 'bg-white/20' : (day.isToday ? 'text-kv-primary ring-1 ring-kv-primary' : 'text-foreground')
              ]"
            >
              {{ day.dayNumber }}
            </span>
            <span v-if="day.hasEvents && !day.isSelected" class="w-1 h-1 rounded-full bg-kv-primary" />
          </button>
        </div>
      </div>

      <!-- Selected Day Header with Circular Google Calendar Badge & All-Day Banner (Screenshot 2) -->
      <div class="space-y-2">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-2xl bg-kv-primary text-white flex flex-col items-center justify-center font-bold shrink-0">
              <span class="text-xs uppercase leading-none font-medium opacity-90">{{ getDayShortName(activeMobileDate) }}</span>
              <span class="text-base leading-tight font-extrabold">{{ activeMobileDate.getDate() }}</span>
            </div>
            <div>
              <h3 class="text-sm sm:text-base font-bold text-foreground">
                {{ activeMobileDateLabel }}
              </h3>
              <p class="text-xs text-muted-foreground">
                {{ activeDayTimelineEvents.length }} acara terjadwal
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            class="text-xs font-medium rounded-xl hidden sm:inline-flex"
            @click="navigateTo(`/calendar/create?date=${activeMobileDateStr}`)"
          >
            <Plus class="w-3.5 h-3.5 mr-1 text-kv-primary" />
            Tambah di Tanggal Ini
          </Button>
        </div>

        <!-- All-Day Events / Pending Task Pill Banner (Screenshot 2) -->
        <div v-if="dayAllDayEvents.length > 0" class="space-y-1.5 pt-1">
          <div
            v-for="ev in dayAllDayEvents"
            :key="ev.id"
            @click="openDetailModal(ev, dayAllDayEvents)"
            class="px-3 py-2 rounded-xl bg-kv-primary/10 border border-kv-primary/25 text-kv-primary flex items-center justify-between text-xs font-semibold cursor-pointer hover:bg-kv-primary/15 transition-colors"
          >
            <div class="flex items-center gap-2 min-w-0">
              <CheckCircle2 class="w-4 h-4 shrink-0 text-kv-primary" />
              <span class="truncate font-bold">{{ ev.title }}</span>
              <span class="text-[10px] px-1.5 py-0.2 rounded-md bg-kv-primary/20 shrink-0">Sepanjang Hari</span>
            </div>
            <ChevronRight class="w-3.5 h-3.5 shrink-0 opacity-60" />
          </div>
        </div>
      </div>

      <!-- Google Calendar Hourly Timeline Grid (Screenshot 2) -->
      <div class="relative border-t border-border/60 pt-2 select-none">
        <div class="space-y-0">
          <div
            v-for="h in timelineHours"
            :key="h"
            class="flex items-start group min-h-[64px]"
          >
            <!-- Hour Label (e.g. 08.00 WIB) -->
            <div class="w-14 sm:w-20 text-right pr-3 -mt-2 text-[11px] sm:text-xs font-semibold text-muted-foreground shrink-0">
              {{ formatHourLabel(h) }}
            </div>

            <!-- Time Slot Cell with Top Line -->
            <div
              class="flex-1 border-t border-border/40 relative min-h-[64px] pl-2 pr-1 py-1 transition-colors hover:bg-muted/15 cursor-pointer rounded-r-xl"
              @click="handleSlotClick(h)"
              :title="`Klik untuk buat jadwal di jam ${formatHourLabel(h)}`"
            >
              <!-- Real-time Current Time Line Indicator (Screenshot 2) -->
              <div
                v-if="isTodayDate(activeMobileDate) && currentHour === h"
                class="absolute left-0 right-0 z-20 flex items-center pointer-events-none"
                :style="{ top: `${(currentMinutes / 60) * 100}%` }"
              >
                <!-- Dot at left edge -->
                <div class="w-2.5 h-2.5 rounded-full bg-rose-500 -ml-1.5 ring-2 ring-background shrink-0 shadow-sm" />
                <!-- Horizontal indicator line -->
                <div class="flex-1 h-[2px] bg-rose-500 shadow-sm" />
              </div>

              <!-- Events occurring in this hour -->
              <div v-if="getEventsForHour(activeMobileDate, h).length > 0" class="space-y-1.5 z-10 relative">
                <div
                  v-for="ev in getEventsForHour(activeMobileDate, h)"
                  :key="ev.id"
                  @click.stop="openDetailModal(ev, activeDayTimelineEvents)"
                  class="p-2 sm:p-2.5 rounded-xl border transition-transform hover:scale-[1.01] active:scale-[0.99] cursor-pointer shadow-xs"
                  :style="{
                    backgroundColor: `${ev.color || '#4082E6'}18`,
                    borderColor: `${ev.color || '#4082E6'}45`,
                    borderLeftWidth: '4px',
                    borderLeftColor: ev.color || '#4082E6'
                  }"
                >
                  <div class="flex items-start justify-between gap-2">
                    <div class="min-w-0">
                      <p class="text-xs sm:text-sm font-bold text-foreground truncate">
                        {{ ev.title }}
                      </p>
                      <p class="text-[11px] text-muted-foreground flex items-center gap-1.5 mt-0.5 truncate">
                        <Clock class="w-3 h-3 shrink-0" />
                        <span>{{ formatEventTime(ev) }}</span>
                        <span v-if="ev.location" class="flex items-center gap-1 truncate">
                          &bull; <MapPin class="w-3 h-3 shrink-0" /> {{ ev.location }}
                        </span>
                      </p>
                    </div>

                    <div v-if="ev.attendees?.length" class="flex items-center gap-1 text-[10px] text-muted-foreground shrink-0 bg-background/60 px-1.5 py-0.5 rounded-md border border-border/50">
                      <Users class="w-3 h-3" />
                      <span>{{ ev.attendees.length }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Hover hint for empty slot -->
              <div v-else class="h-full flex items-center opacity-0 group-hover:opacity-60 transition-opacity text-[10px] text-muted-foreground italic pl-1">
                + Tambah acara jam {{ formatHourLabel(h) }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>

    <!-- 3. AGENDA VIEW (Google Calendar Schedule / List) -->
    <div v-if="currentViewMode === 'agenda'" class="space-y-4">
      <Card class="bg-card border border-border rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-none">
        <div class="flex items-center justify-between pb-3 border-b border-border">
          <div class="flex items-center gap-2">
            <List class="w-5 h-5 text-kv-primary" />
            <h3 class="text-base sm:text-lg font-bold text-foreground">
              Daftar Agenda ({{ currentMonthLabel }})
            </h3>
          </div>
          <span class="text-xs text-muted-foreground font-medium">
            {{ agendaGroupedEvents.length }} hari kegiatan &bull; {{ events.length }} acara
          </span>
        </div>

        <div v-if="agendaGroupedEvents.length > 0" class="divide-y divide-border/60 mt-2">
          <div
            v-for="group in agendaGroupedEvents"
            :key="group.dateStr"
            class="py-4 first:pt-2 last:pb-1 space-y-3"
          >
            <!-- Date Group Header (Google Calendar Agenda Style) -->
            <div class="flex items-center gap-3">
              <div
                :class="[
                  'w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-xs shrink-0',
                  isTodayDate(group.date) ? 'bg-kv-primary text-white' : 'bg-muted text-foreground'
                ]"
              >
                {{ group.date.getDate() }}
              </div>
              <div>
                <h4 class="text-sm font-bold text-foreground">
                  {{ formatGroupDate(group.date) }}
                </h4>
                <p class="text-[11px] text-muted-foreground">
                  {{ group.events.length }} agenda
                </p>
              </div>
            </div>

            <!-- Event Cards for this date -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-2.5 pl-1 sm:pl-12">
              <div
                v-for="ev in group.events"
                :key="ev.id"
                @click="openDetailModal(ev, group.events)"
                class="p-3.5 rounded-2xl border border-border bg-card hover:bg-muted/30 transition-all flex flex-col justify-between gap-2.5 cursor-pointer shadow-xs border-l-4 group"
                :style="{ borderLeftColor: ev.color || '#4082E6' }"
              >
                <div>
                  <div class="flex items-start justify-between gap-2">
                    <h5 class="text-sm font-bold text-foreground group-hover:text-kv-primary transition-colors">
                      {{ ev.title }}
                    </h5>
                    <span
                      class="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider shrink-0"
                      :style="{
                        backgroundColor: `${ev.color || '#4082E6'}15`,
                        color: ev.color || '#4082E6'
                      }"
                    >
                      {{ ev.type }}
                    </span>
                  </div>

                  <p v-if="ev.description" class="text-xs text-muted-foreground line-clamp-2 mt-1">
                    {{ ev.description }}
                  </p>
                </div>

                <div class="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-border/40">
                  <span class="flex items-center gap-1.5 font-medium">
                    <Clock class="w-3.5 h-3.5 text-kv-primary shrink-0" />
                    {{ formatEventTime(ev) }}
                  </span>

                  <span v-if="ev.location" class="flex items-center gap-1 truncate max-w-[150px]">
                    <MapPin class="w-3.5 h-3.5 shrink-0" />
                    <span class="truncate">{{ ev.location }}</span>
                  </span>
                  <span v-else class="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                    <Video class="w-3.5 h-3.5 shrink-0" />
                    Online
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State for Agenda -->
        <div v-else class="text-center py-12 space-y-3">
          <div class="w-14 h-14 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
            <CalendarIcon class="w-7 h-7 opacity-50" />
          </div>
          <h4 class="text-sm font-semibold text-foreground">Belum Ada Agenda di Periode Ini</h4>
          <p class="text-xs text-muted-foreground max-w-sm mx-auto">
            Tidak ada kegiatan atau acara kerja yang ditemukan pada bulan atau rentang tanggal yang dipilih.
          </p>
          <Button
            variant="primary"
            size="sm"
            @click="navigateTo('/calendar/create')"
            class="mt-2"
          >
            <Plus class="w-4 h-4 mr-1.5" />
            Buat Jadwal Baru
          </Button>
        </div>
      </Card>
    </div>

    <!-- Event Detail & RSVP Modal -->
    <EventDetailModal
      :open="isDetailModalOpen"
      :event="selectedEvent"
      :day-events="selectedDayEvents"
      :is-loading="isActionLoading"
      @update:open="(val) => isDetailModalOpen = val"
      @select-event="(ev) => selectedEvent = ev"
      @edit="(ev) => navigateTo(`/calendar/edit/${ev.id}`)"
      @cancel="cancelEvent"
      @rsvp="submitRsvp"
      @refresh="loadEvents"
    />

    <!-- Floating Action Button (FAB) for Mobile: Buat Jadwal -->
    <div class="fixed bottom-6 right-6 z-40 sm:hidden">
      <Button
        variant="primary"
        size="lg"
        icon
        class="h-14 w-14 rounded-full shadow-2xl shadow-kv-primary/40 flex items-center justify-center p-0 transition-transform active:scale-95 cursor-pointer"
        title="Buat Jadwal Baru"
        @click="navigateTo('/calendar/create')"
      >
        <Plus class="w-6 h-6 text-white stroke-[2.5]" />
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  CalendarDays,
  Clock,
  MapPin,
  Video,
  Users,
  CheckCircle2,
  Calendar as CalendarIcon,
  List,
  ChevronDown,
  ChevronUp
} from 'lucide-vue-next'
import { Card } from '~/components/ui/card'
import { Button, Tabs, DropdownMenu } from '@kreavoks/kreaui'
import type { TabItem, DropdownMenuItem } from '@kreavoks/kreaui'
import { DateRangePicker, type DateRangeValue } from '~/components/ui/date-picker'
import EventDetailModal from './components/EventDetailModal.vue'
import { useCalendarEvents } from './hooks/useCalendarEvents'
import type { CalendarEventItem } from './types/calendar.types'

const currentViewMode = ref<string>('month')

const viewModeOptions: DropdownMenuItem[] = [
  { id: 'month', label: 'Bulan (Grid)' },
  { id: 'day', label: 'Hari (Timeline)' },
  { id: 'agenda', label: 'Jadwal (List)' }
]

const currentViewModeLabel = computed(() => {
  if (currentViewMode.value === 'day') return 'Hari'
  if (currentViewMode.value === 'agenda') return 'Jadwal'
  return 'Bulan'
})

const viewTabs: TabItem[] = [
  { id: 'all', label: 'Semua Agenda' },
  { id: 'my', label: 'Agenda Saya' }
]

definePageMeta({
  layout: 'default',
  middleware: 'auth'
})

const {
  events,
  candidates,
  isActionLoading,
  currentDate,
  currentYear,
  currentMonth,
  currentMonthLabel,
  selectedEvent,
  selectedDayEvents,
  selectedDateRange,
  isCreateModalOpen,
  isDetailModalOpen,
  eventToEdit,
  filterType,
  filterView,
  loadEvents,
  prevMonth,
  nextMonth,
  goToToday,
  openCreateModal,
  openEditModal,
  openDetailModal,
  submitEvent,
  cancelEvent,
  submitRsvp
} = useCalendarEvents()

interface CalendarGridDay {
  date: Date
  isCurrentMonth: boolean
  isToday: boolean
  isWeekend: boolean
  events: CalendarEventItem[]
}

const calendarGridDays = computed(() => {
  const y = currentYear.value
  const m = currentMonth.value - 1
  const firstDayOfMonth = new Date(y, m, 1)
  const lastDayOfMonth = new Date(y, m + 1, 0)

  // Start from Monday (1)
  let dayOfWeek = firstDayOfMonth.getDay()
  // Adjust so Monday is 0, Sunday is 6
  let offset = (dayOfWeek + 6) % 7

  const days: CalendarGridDay[] = []
  const today = new Date()
  const todayDateStr = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`

  // Days from previous month
  const prevMonthLastDate = new Date(y, m, 0).getDate()
  for (let i = offset - 1; i >= 0; i--) {
    const d = new Date(y, m - 1, prevMonthLastDate - i)
    days.push({
      date: d,
      isCurrentMonth: false,
      isToday: false,
      isWeekend: d.getDay() === 0 || d.getDay() === 6,
      events: getEventsForDate(d)
    })
  }

  // Days of current month
  for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
    const d = new Date(y, m, i)
    const isToday = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}` === todayDateStr
    days.push({
      date: d,
      isCurrentMonth: true,
      isToday,
      isWeekend: d.getDay() === 0 || d.getDay() === 6,
      events: getEventsForDate(d)
    })
  }

  // Days from next month to fill complete weeks (up to 35 or 42 cells)
  const remainingCells = (7 - (days.length % 7)) % 7
  for (let i = 1; i <= remainingCells; i++) {
    const d = new Date(y, m + 1, i)
    days.push({
      date: d,
      isCurrentMonth: false,
      isToday: false,
      isWeekend: d.getDay() === 0 || d.getDay() === 6,
      events: getEventsForDate(d)
    })
  }

  return days
})

const getEventsForDate = (date: Date) => {
  const pad = (n: number) => String(n).padStart(2, '0')
  const dateStr = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`

  return events.value.filter(e => {
    const evDate = new Date(e.startDate)
    const evDateStr = `${evDate.getFullYear()}-${pad(evDate.getMonth() + 1)}-${pad(evDate.getDate())}`
    return evDateStr === dateStr
  })
}

const isInSelectedRange = (d: Date) => {
  if (!selectedDateRange.value?.start || !selectedDateRange.value?.end) return false
  const pad = (n: number) => String(n).padStart(2, '0')
  const dStr = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
  return dStr >= selectedDateRange.value.start && dStr <= selectedDateRange.value.end
}

const onDateRangeChange = (val: DateRangeValue | null) => {
  if (val?.start) {
    const [y, m] = val.start.split('-').map(Number)
    if (y && m) {
      currentDate.value = new Date(y, m - 1, 1)
    }
  }
}

const activeMobileDate = ref(new Date())
const isMiniMonthExpanded = ref(false)
const timelineHours = Array.from({ length: 18 }, (_, i) => i + 6) // 06:00 to 23:00

// Real-time tracker for the current time indicator line (Google Calendar style)
const currentTime = ref(new Date())
let timeInterval: any = null

onMounted(() => {
  timeInterval = setInterval(() => {
    currentTime.value = new Date()
  }, 60000)
})

onUnmounted(() => {
  if (timeInterval) clearInterval(timeInterval)
})

const currentHour = computed(() => currentTime.value.getHours())
const currentMinutes = computed(() => currentTime.value.getMinutes())

const isTodayDate = (date: Date) => {
  const today = new Date()
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  )
}

const getDayShortName = (date: Date) => {
  return ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'][date.getDay()]
}

const formatHourLabel = (h: number) => {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(h)}.00`
}

const getIsoDateStr = (date: Date) => {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

const activeMobileDateStr = computed(() => {
  return getIsoDateStr(activeMobileDate.value)
})

const activeMobileDateLabel = computed(() => {
  const d = activeMobileDate.value
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ]
  return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]}`
})

const activeMobileEvents = computed(() => {
  return getEventsForDate(activeMobileDate.value)
})

const activeDayTimelineEvents = computed(() => {
  return getEventsForDate(activeMobileDate.value)
})

const dayAllDayEvents = computed(() => {
  return activeDayTimelineEvents.value.filter(e => e.isAllDay)
})

const getEventsForHour = (date: Date, hour: number) => {
  const dEvents = getEventsForDate(date)
  return dEvents.filter(e => {
    if (e.isAllDay) return false
    const start = new Date(e.startDate)
    return start.getHours() === hour
  })
}

const handleSlotClick = (hour: number) => {
  const pad = (n: number) => String(n).padStart(2, '0')
  const dateStr = getIsoDateStr(activeMobileDate.value)
  const timeStr = `${pad(hour)}:00`
  navigateTo(`/calendar/create?date=${dateStr}&time=${timeStr}`)
}

// 7-day current week strip for Day Timeline view
const currentWeekDays = computed(() => {
  const curr = new Date(activeMobileDate.value)
  const day = curr.getDay()
  const diff = (day + 6) % 7 // Monday is 0
  const monday = new Date(curr)
  monday.setDate(curr.getDate() - diff)

  const week = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    week.push({
      date: d,
      dayName: ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'][d.getDay()],
      dayNumber: d.getDate(),
      isToday: isTodayDate(d),
      isSelected: getIsoDateStr(d) === activeMobileDateStr.value,
      hasEvents: getEventsForDate(d).length > 0
    })
  }
  return week
})

// 30-day mini calendar days for expanded mini month
const miniCalendarDays = computed(() => {
  const y = activeMobileDate.value.getFullYear()
  const m = activeMobileDate.value.getMonth()
  const lastDay = new Date(y, m + 1, 0).getDate()
  const days = []
  for (let i = 1; i <= lastDay; i++) {
    const d = new Date(y, m, i)
    days.push({
      date: d,
      isCurrentMonth: true,
      isToday: isTodayDate(d),
      isSelected: getIsoDateStr(d) === activeMobileDateStr.value,
      hasEvents: getEventsForDate(d).length > 0
    })
  }
  return days
})

// Agenda grouped events for List view
const agendaGroupedEvents = computed(() => {
  const sorted = [...events.value].sort(
    (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  )
  const groups: { dateStr: string; date: Date; events: CalendarEventItem[] }[] = []
  const groupMap = new Map<string, { dateStr: string; date: Date; events: CalendarEventItem[] }>()

  for (const ev of sorted) {
    const d = new Date(ev.startDate)
    const dStr = getIsoDateStr(d)
    if (!groupMap.has(dStr)) {
      const item = { dateStr: dStr, date: d, events: [] }
      groupMap.set(dStr, item)
      groups.push(item)
    }
    groupMap.get(dStr)!.events.push(ev)
  }

  return groups
})

const formatGroupDate = (date: Date) => {
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ]
  if (isTodayDate(date)) {
    return `Hari Ini - ${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]}`
  }
  return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]}`
}

const formatEventTime = (ev: CalendarEventItem) => {
  if (ev.isAllDay) return 'Sepanjang hari'
  const start = new Date(ev.startDate)
  const pad = (n: number) => String(n).padStart(2, '0')
  const sStr = `${pad(start.getHours())}:${pad(start.getMinutes())}`
  if (!ev.endDate) return `${sStr} WIB`
  const end = new Date(ev.endDate)
  return `${sStr} - ${pad(end.getHours())}:${pad(end.getMinutes())} WIB`
}

const handleDayClick = (day: CalendarGridDay) => {
  activeMobileDate.value = day.date

  // If date already has events, open detail modal instead of blank create form!
  if (day.events.length > 0 && day.events[0]) {
    openDetailModal(day.events[0], day.events)
    return
  }

  // If empty date, navigate to create schedule with that date prefilled
  const pad = (n: number) => String(n).padStart(2, '0')
  const dateStr = `${day.date.getFullYear()}-${pad(day.date.getMonth() + 1)}-${pad(day.date.getDate())}`
  navigateTo(`/calendar/create?date=${dateStr}`)
}
</script>