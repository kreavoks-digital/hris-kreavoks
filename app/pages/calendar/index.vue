<template>
  <div class="space-y-6">
    <!-- Header -->
    <CalendarHeader />

    <!-- Controls & Filters Toolbar -->
    <CalendarToolbar
      v-model:selected-date-range="selectedDateRange"
      v-model:filter-view="filterView"
      v-model:current-view-mode="currentViewMode"
      :current-month-label="currentMonthLabel"
      :view-tabs="viewTabs"
      :view-mode-options="viewModeOptions"
      :current-view-mode-label="currentViewModeLabel"
      @prev-month="prevMonth"
      @next-month="nextMonth"
      @go-to-today="goToToday"
      @date-range-change="onDateRangeChange"
    />

    <!-- 1. Month View (Monthly Calendar Grid) -->
    <CalendarMonthView
      v-if="currentViewMode === 'month'"
      :calendar-grid-days="calendarGridDays"
      :active-mobile-date-str="activeMobileDateStr"
      :active-mobile-date-label="activeMobileDateLabel"
      :active-mobile-events="activeMobileEvents"
      :is-in-selected-range="isInSelectedRange"
      :get-iso-date-str="getIsoDateStr"
      :format-event-time="formatEventTime"
      @day-click="handleDayClick"
      @event-click="openDetailModal"
    />

    <!-- 2. Day View (Day Timeline) -->
    <CalendarDayTimelineView
      v-else-if="currentViewMode === 'day'"
      v-model:active-mobile-date="activeMobileDate"
      v-model:is-mini-month-expanded="isMiniMonthExpanded"
      :current-month-label="currentMonthLabel"
      :active-mobile-date-str="activeMobileDateStr"
      :active-mobile-date-label="activeMobileDateLabel"
      :active-day-timeline-events="activeDayTimelineEvents"
      :day-all-day-events="dayAllDayEvents"
      :current-week-days="currentWeekDays"
      :mini-calendar-days="miniCalendarDays"
      :timeline-hours="timelineHours"
      :current-hour="currentHour"
      :current-minutes="currentMinutes"
      :is-today-date="isTodayDate"
      :get-day-short-name="getDayShortName"
      :format-hour-label="formatHourLabel"
      :format-event-time="formatEventTime"
      :get-events-for-hour="getEventsForHour"
      @event-click="openDetailModal"
      @slot-click="handleSlotClick"
    />

    <!-- 3. Agenda View (List / Schedule) -->
    <CalendarAgendaListView
      v-else-if="currentViewMode === 'agenda'"
      :current-month-label="currentMonthLabel"
      :total-events-count="events.length"
      :agenda-grouped-events="agendaGroupedEvents"
      :is-today-date="isTodayDate"
      :format-group-date="formatGroupDate"
      :format-event-time="formatEventTime"
      @event-click="openDetailModal"
    />

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

    <!-- Floating Action Button for Mobile -->
    <CalendarMobileFab />
  </div>
</template>

<script setup lang="ts">
import CalendarHeader from './components/CalendarHeader.vue'
import CalendarToolbar from './components/CalendarToolbar.vue'
import CalendarMonthView from './components/CalendarMonthView.vue'
import CalendarDayTimelineView from './components/CalendarDayTimelineView.vue'
import CalendarAgendaListView from './components/CalendarAgendaListView.vue'
import CalendarMobileFab from './components/CalendarMobileFab.vue'
import EventDetailModal from './components/EventDetailModal.vue'
import { useCalendarEvents } from './hooks/useCalendarEvents'
import { useCalendarPage } from './hooks/useCalendarPage'

definePageMeta({
  layout: 'default',
  middleware: 'auth'
})

const {
  events,
  isActionLoading,
  currentDate,
  currentYear,
  currentMonth,
  currentMonthLabel,
  selectedEvent,
  selectedDayEvents,
  selectedDateRange,
  isDetailModalOpen,
  filterView,
  loadEvents,
  prevMonth,
  nextMonth,
  goToToday,
  openDetailModal,
  cancelEvent,
  submitRsvp
} = useCalendarEvents()

const {
  currentViewMode,
  viewModeOptions,
  currentViewModeLabel,
  viewTabs,
  calendarGridDays,
  activeMobileDate,
  isMiniMonthExpanded,
  timelineHours,
  currentHour,
  currentMinutes,
  activeMobileDateStr,
  activeMobileDateLabel,
  activeMobileEvents,
  activeDayTimelineEvents,
  dayAllDayEvents,
  currentWeekDays,
  miniCalendarDays,
  agendaGroupedEvents,
  isInSelectedRange,
  onDateRangeChange,
  getIsoDateStr,
  getEventsForHour,
  isTodayDate,
  getDayShortName,
  formatHourLabel,
  formatGroupDate,
  formatEventTime,
  handleDayClick,
  handleSlotClick
} = useCalendarPage(
  events,
  currentYear,
  currentMonth,
  currentDate,
  selectedDateRange,
  openDetailModal
)
</script>