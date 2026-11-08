<template>
  <Card class="border border-border overflow-hidden bg-card/60 backdrop-blur-sm rounded-3xl shadow-none">
    <CardHeader class="bg-muted/30 border-b border-border pb-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2.5">
          <Calendar class="h-5 w-5 text-kv-primary" />
          <div>
            <CardTitle class="text-base font-semibold text-foreground">Detail Agenda</CardTitle>
            <CardDescription class="text-muted-foreground text-sm">Zona waktu: (UTC+07:00) WIB - Jakarta</CardDescription>
          </div>
        </div>
        <Badge variant="secondary" size="sm">
          {{ form.isAllDay ? 'All day' : (activeDurationMinutes ? `${activeDurationMinutes} menit` : 'Kustom') }}
        </Badge>
      </div>
    </CardHeader>

    <CardContent class="p-5 sm:p-6 space-y-6">
      <!-- 1. Title Row -->
      <div class="space-y-2">
        <div class="flex items-center gap-2">
          <PenLine class="w-4 h-4 text-muted-foreground shrink-0" />
          <Label for="title" class="text-sm font-medium text-foreground">
            Judul Agenda <span class="text-rose-500 font-semibold">*</span>
          </Label>
        </div>
        <Input
          id="title"
          v-model="form.title"
          placeholder="Tambahkan judul agenda..."
          class="h-11 rounded-2xl border-border focus:ring-kv-primary text-sm font-medium"
          required
        />
      </div>

      <!-- 2. Date & Time Studio Row (Teams & Google Calendar Style) -->
      <div class="space-y-4">
        <div class="flex items-center justify-between flex-wrap gap-2">
          <div class="flex items-center gap-2">
            <Clock class="w-4 h-4 text-muted-foreground shrink-0" />
            <Label class="text-sm font-medium text-foreground">
              Waktu Pelaksanaan <span class="text-rose-500 font-semibold">*</span>
            </Label>
          </div>

          <!-- Duration Pill & Teams-style All Day Switch -->
          <div class="flex items-center gap-3">
            <span
              v-if="!form.isAllDay && activeDurationMinutes"
              class="text-xs px-2.5 py-0.5 rounded-lg bg-muted text-muted-foreground font-semibold"
            >
              {{ activeDurationMinutes }}m
            </span>
            <div class="flex items-center gap-2">
              <Switch
                id="isAllDay"
                :checked="form.isAllDay"
                @update:checked="(val: boolean) => form.isAllDay = val"
              />
              <Label for="isAllDay" class="text-sm font-medium text-foreground cursor-pointer select-none">
                All day
              </Label>
            </div>
          </div>
        </div>

        <!-- Start & End Date-Time Studio -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <!-- Mulai -->
          <div class="space-y-2">
            <Label class="text-sm text-muted-foreground font-medium">Mulai</Label>
            <div class="grid" :class="form.isAllDay ? 'grid-cols-1' : 'grid-cols-12 gap-2.5'">
              <div :class="form.isAllDay ? 'col-span-1' : 'col-span-7'">
                <DatePicker
                  :model-value="startDateOnly"
                  placeholder="Pilih tanggal mulai"
                  @update:model-value="(val: string) => emit('update:startDateOnly', val)"
                />
              </div>
              <div v-if="!form.isAllDay" class="col-span-5">
                <TimePicker
                  :model-value="startTimeOnly"
                  @update:model-value="(val: string) => emit('update:startTimeOnly', val)"
                />
              </div>
            </div>
          </div>

          <!-- Selesai -->
          <div class="space-y-2">
            <Label class="text-sm text-muted-foreground font-medium">Selesai</Label>
            <div class="grid" :class="form.isAllDay ? 'grid-cols-1' : 'grid-cols-12 gap-2.5'">
              <div :class="form.isAllDay ? 'col-span-1' : 'col-span-7'">
                <DatePicker
                  :model-value="endDateOnly"
                  placeholder="Pilih tanggal selesai"
                  @update:model-value="(val: string) => emit('update:endDateOnly', val)"
                />
              </div>
              <div v-if="!form.isAllDay" class="col-span-5">
                <TimePicker
                  :model-value="endTimeOnly"
                  @update:model-value="(val: string) => emit('update:endTimeOnly', val)"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Duration Presets (Teams-like chips) -->
        <div v-if="!form.isAllDay" class="flex items-center gap-2 flex-wrap pt-1">
          <span class="text-xs text-muted-foreground font-medium mr-1">Durasi Cepat:</span>
          <Badge
            v-for="preset in durationPresets"
            :key="preset.minutes"
            :variant="activeDurationMinutes === preset.minutes ? 'primary' : 'secondary'"
            class="cursor-pointer transition-colors"
            @click="emit('applyDurationPreset', preset.minutes)"
          >
            {{ preset.label }}
          </Badge>
        </div>
      </div>

      <!-- 3. Pengulangan Agenda (Recurrence / Repeat - Teams & Google Calendar Style) -->
      <div class="space-y-3 pt-2 border-t border-border/50">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <RotateCw class="w-4 h-4 text-muted-foreground shrink-0" />
            <Label class="text-sm font-medium text-foreground">Pengulangan Agenda</Label>
          </div>
          <span
            v-if="recurrence.type !== 'DOES_NOT_REPEAT'"
            class="text-xs text-kv-primary font-medium flex items-center gap-1"
          >
            <Check class="w-3.5 h-3.5" />
            <span>Aktif berulang</span>
          </span>
        </div>

        <!-- Recurrence Dropdown matching user's reference exactly -->
        <Select v-model="recurrence.type" @update:model-value="onRecurrenceTypeChange">
          <SelectTrigger class="rounded-2xl h-11 border-border focus:ring-kv-primary bg-background text-sm">
            <SelectValue placeholder="Does not repeat" />
          </SelectTrigger>
          <SelectContent class="rounded-2xl">
            <SelectItem value="DOES_NOT_REPEAT" class="text-sm">Does not repeat</SelectItem>
            <SelectItem value="EVERY_WEEKDAY" class="text-sm">Every weekday (Mon - Fri)</SelectItem>
            <SelectItem value="DAILY" class="text-sm">Daily</SelectItem>
            <SelectItem value="WEEKLY" class="text-sm">Weekly (Every {{ currentStartDayName }})</SelectItem>
            <SelectItem value="MONTHLY" class="text-sm">Monthly</SelectItem>
            <SelectItem value="YEARLY" class="text-sm">Yearly</SelectItem>
            <SelectItem value="CUSTOM" class="text-sm">Custom...</SelectItem>
          </SelectContent>
        </Select>

        <!-- Teams Recurrence Summary Card with 'Set recurrence' action -->
        <div
          v-if="recurrence.type !== 'DOES_NOT_REPEAT'"
          class="flex items-center justify-between p-3.5 rounded-2xl bg-muted/30 border border-border/60 gap-3"
        >
          <div class="flex items-center gap-2.5 min-w-0">
            <RotateCw class="w-4 h-4 text-primary shrink-0" />
            <div class="min-w-0">
              <p class="text-xs sm:text-sm font-medium text-foreground truncate">
                {{ currentRecurrenceSummaryText }}
              </p>
              <p class="text-[11px] text-muted-foreground truncate">
                Pengulangan terjadwal di kalender
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            size="xs"
            label="Set recurrence"
            class="shrink-0 text-xs"
            @click="showRecurrenceModal = true"
          />
        </div>

        <!-- Sub-Panel: Monthly Recurrence ("Tiap tanggal berapa aja") -->
        <div
          v-if="recurrence.type === 'MONTHLY'"
          class="rounded-2xl border border-border/60 bg-muted/20 p-4 space-y-3"
        >
          <div class="flex items-center justify-between flex-wrap gap-2">
            <span class="text-xs font-semibold text-foreground">Pola Pengulangan Bulanan:</span>
            <div class="flex items-center gap-1.5">
              <button
                type="button"
                @click="recurrence.monthlyMode = 'SAME_DAY'"
                :class="[
                  'px-2.5 py-1 rounded-xl text-xs font-medium transition-colors border',
                  recurrence.monthlyMode === 'SAME_DAY'
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-background hover:bg-muted text-muted-foreground border-border'
                ]"
              >
                Tiap tanggal mulai (Tgl {{ currentStartDay }})
              </button>
              <button
                type="button"
                @click="recurrence.monthlyMode = 'SPECIFIC_DATES'"
                :class="[
                  'px-2.5 py-1 rounded-xl text-xs font-medium transition-colors border',
                  recurrence.monthlyMode === 'SPECIFIC_DATES'
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-background hover:bg-muted text-muted-foreground border-border'
                ]"
              >
                Tiap tanggal berapa aja
              </button>
            </div>
          </div>

          <!-- Specific Dates Picker (1..31 day chips) -->
          <div v-if="recurrence.monthlyMode === 'SPECIFIC_DATES'" class="space-y-2 pt-1">
            <p class="text-xs text-muted-foreground">
              Pilih satu atau beberapa tanggal dalam sebulan di mana agenda ini akan berulang:
            </p>
            <div class="grid grid-cols-7 sm:grid-cols-10 gap-1.5 pt-1">
              <button
                v-for="day in 31"
                :key="day"
                type="button"
                @click="toggleDayOfMonth(day)"
                :class="[
                  'h-8 rounded-xl text-xs font-medium transition-all flex items-center justify-center border',
                  isDayOfMonthSelected(day)
                    ? 'bg-primary text-primary-foreground border-primary font-bold scale-105'
                    : 'bg-background hover:bg-muted text-foreground border-border/60'
                ]"
              >
                {{ day }}
              </button>
            </div>
            <p
              v-if="selectedDaysOfMonth.length > 0"
              class="text-xs text-primary font-medium pt-1"
            >
              Agenda akan berulang setiap tanggal: {{ selectedDaysOfMonth.join(', ') }} setiap bulan.
            </p>
            <p v-else class="text-xs text-rose-500 font-medium pt-1">
              Pilih minimal 1 tanggal di atas.
            </p>
          </div>
        </div>

        <!-- Sub-Panel: Custom Recurrence -->
        <div
          v-if="recurrence.type === 'CUSTOM'"
          class="rounded-2xl border border-border/60 bg-muted/20 p-4 space-y-3.5"
        >
          <!-- Interval Row -->
          <div class="flex items-center gap-2 flex-wrap text-sm">
            <span class="text-muted-foreground">Ulangi setiap</span>
            <Input
              type="number"
              v-model.number="recurrence.interval"
              min="1"
              max="99"
              class="w-16 h-10 rounded-xl text-center font-semibold border-border bg-background"
            />
            <Select v-model="recurrence.unit">
              <SelectTrigger class="w-32 h-10 rounded-xl border-border bg-background text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent class="rounded-xl">
                <SelectItem value="DAY">Hari</SelectItem>
                <SelectItem value="WEEK">Minggu</SelectItem>
                <SelectItem value="MONTH">Bulan</SelectItem>
                <SelectItem value="YEAR">Tahun</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <!-- Days of Week Chips for Weekly Custom -->
          <div v-if="recurrence.unit === 'WEEK'" class="space-y-1.5 pt-1">
            <span class="text-xs text-muted-foreground font-medium">Ulangi pada hari:</span>
            <div class="flex items-center gap-1.5 flex-wrap">
              <button
                v-for="d in daysOfWeekOptions"
                :key="d.value"
                type="button"
                @click="toggleDayOfWeek(d.value)"
                :class="[
                  'px-3 py-1.5 rounded-xl text-xs font-medium transition-all border',
                  isDayOfWeekSelected(d.value)
                    ? 'bg-primary text-primary-foreground border-primary font-bold'
                    : 'bg-background hover:bg-muted text-foreground border-border/60'
                ]"
              >
                {{ d.label }}
              </button>
            </div>
          </div>

          <!-- Days of Month for Monthly Custom -->
          <div v-if="recurrence.unit === 'MONTH'" class="space-y-1.5 pt-1">
            <span class="text-xs text-muted-foreground font-medium">Tiap tanggal berapa aja:</span>
            <div class="grid grid-cols-7 sm:grid-cols-10 gap-1.5 pt-1">
              <button
                v-for="day in 31"
                :key="day"
                type="button"
                @click="toggleDayOfMonth(day)"
                :class="[
                  'h-8 rounded-xl text-xs font-medium transition-all flex items-center justify-center border',
                  isDayOfMonthSelected(day)
                    ? 'bg-primary text-primary-foreground border-primary font-bold'
                    : 'bg-background hover:bg-muted text-foreground border-border/60'
                ]"
              >
                {{ day }}
              </button>
            </div>
          </div>

          <!-- Recurrence End Condition -->
          <div class="pt-2 border-t border-border/40 flex items-center gap-3 flex-wrap text-sm">
            <span class="text-muted-foreground text-xs font-medium">Berakhir:</span>
            <div class="flex items-center gap-2">
              <Select v-model="recurrence.endType">
                <SelectTrigger class="w-40 h-9 rounded-xl border-border bg-background text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent class="rounded-xl">
                  <SelectItem value="NEVER">Tidak pernah</SelectItem>
                  <SelectItem value="ON_DATE">Pada tanggal...</SelectItem>
                </SelectContent>
              </Select>
              <div v-if="recurrence.endType === 'ON_DATE'" class="w-48">
                <DatePicker
                  :model-value="recurrence.endDate || ''"
                  placeholder="Pilih tanggal akhir"
                  @update:model-value="(val: string) => recurrence.endDate = val"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 4. Pengingat & Notifikasi (Google Calendar Style) -->
      <div class="space-y-3 pt-2 border-t border-border/50">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <Bell class="w-4 h-4 text-muted-foreground shrink-0" />
            <Label class="text-sm font-medium text-foreground">Pengingat & Notifikasi</Label>
          </div>
          <Button
            v-if="notifications.length < 5"
            type="button"
            variant="ghost"
            size="xs"
            label="Tambah Notifikasi"
            :icon-left="Plus"
            class="text-xs text-primary h-8"
            @click="addNotification"
          />
        </div>

        <div class="space-y-2">
          <div
            v-for="(notif, idx) in notifications"
            :key="notif.id"
            class="flex items-center gap-2"
          >
            <div class="w-8 h-8 rounded-xl bg-muted/60 flex items-center justify-center text-muted-foreground shrink-0">
              <BellRing class="w-4 h-4 text-primary" />
            </div>

            <!-- Reminder Preset Selector -->
            <Select
              :model-value="String(notif.minutesBefore)"
              @update:model-value="(val: string) => notif.minutesBefore = Number(val)"
            >
              <SelectTrigger class="rounded-2xl h-11 border-border focus:ring-kv-primary bg-background text-sm flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent class="rounded-2xl">
                <SelectItem value="5">5 menit sebelumnya</SelectItem>
                <SelectItem value="10">10 menit sebelumnya</SelectItem>
                <SelectItem value="15">15 menit sebelumnya</SelectItem>
                <SelectItem value="30">30 menit sebelumnya (Default)</SelectItem>
                <SelectItem value="60">1 jam sebelumnya</SelectItem>
                <SelectItem value="1440">1 hari sebelumnya</SelectItem>
                <SelectItem value="-1">Kustom (menit)...</SelectItem>
              </SelectContent>
            </Select>

            <!-- Custom Minutes Input if selected -->
            <div v-if="notif.minutesBefore === -1 || notif.minutesBefore > 1440" class="flex items-center gap-1 shrink-0">
              <Input
                type="number"
                min="1"
                max="10080"
                v-model.number="notif.minutesBefore"
                placeholder="Menit"
                class="w-20 h-11 rounded-2xl border-border bg-background text-sm font-semibold text-center"
              />
              <span class="text-xs text-muted-foreground font-medium">mnt</span>
            </div>

            <!-- Remove Button -->
            <button
              v-if="notifications.length > 1"
              type="button"
              @click="removeNotification(idx)"
              class="w-9 h-9 rounded-xl flex items-center justify-center text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition-colors shrink-0"
              title="Hapus Pengingat"
            >
              <X class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <!-- 5. Category & Label Color Row -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-border/50">
        <div class="space-y-2">
          <div class="flex items-center gap-2">
            <Tag class="w-4 h-4 text-muted-foreground shrink-0" />
            <Label for="category" class="text-sm font-medium text-foreground">Kategori</Label>
          </div>
          <Select v-model="form.type">
            <SelectTrigger class="rounded-2xl h-11 border-border focus:ring-kv-primary bg-background text-sm">
              <SelectValue placeholder="Pilih Kategori" />
            </SelectTrigger>
            <SelectContent class="rounded-2xl">
              <SelectItem v-for="item in eventTypeOptions" :key="item.value" :value="item.value" class="text-sm">
                {{ item.label }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div class="space-y-2">
          <div class="flex items-center gap-2">
            <Palette class="w-4 h-4 text-muted-foreground shrink-0" />
            <Label class="text-sm font-medium text-foreground">Warna Label</Label>
          </div>
          <div class="flex items-center gap-2 pt-0.5 flex-wrap">
            <button
              v-for="color in presetColors"
              :key="color.value"
              type="button"
              @click="form.color = color.value"
              :style="{ backgroundColor: color.value }"
              :class="[
                'w-7 h-7 rounded-full transition-all border',
                form.color === color.value ? 'ring-2 ring-kv-primary ring-offset-2 ring-offset-background scale-110 border-white' : 'border-black/10 hover:scale-105'
              ]"
              :title="color.label"
            />
          </div>
        </div>
      </div>

      <!-- 6. Location & Online Link Row -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div class="space-y-2">
          <div class="flex items-center gap-2">
            <MapPin class="w-4 h-4 text-muted-foreground shrink-0" />
            <Label for="location" class="text-sm font-medium text-foreground">Lokasi Ruangan</Label>
          </div>
          <Input
            id="location"
            v-model="form.location"
            placeholder="Contoh: Ruang Meeting A / Kantor"
            class="h-11 rounded-2xl border-border focus:ring-kv-primary text-sm font-medium"
          />
        </div>
        <div class="space-y-2">
          <div class="flex items-center gap-2">
            <Globe class="w-4 h-4 text-muted-foreground shrink-0" />
            <Label for="eventUrl" class="text-sm font-medium text-foreground">Tautan Daring</Label>
          </div>
          <Input
            id="eventUrl"
            v-model="form.eventUrl"
            placeholder="https://teams.microsoft.com/..."
            class="h-11 rounded-2xl border-border focus:ring-kv-primary text-sm font-medium"
          />
        </div>
      </div>

      <!-- 7. Notes & Details Row -->
      <div class="space-y-2">
        <div class="flex items-center gap-2">
          <FileText class="w-4 h-4 text-muted-foreground shrink-0" />
          <Label for="description" class="text-sm font-medium text-foreground">Catatan</Label>
        </div>
        <Textarea
          id="description"
          v-model="form.description"
          rows="4"
          placeholder="Ketik poin pembahasan atau catatan penting untuk peserta..."
          class="border-border focus:ring-kv-primary rounded-2xl text-sm"
        />
      </div>
    </CardContent>
  </Card>

  <!-- Set Recurrence Modal (Microsoft Teams Style) -->
  <SetRecurrenceModal
    v-model:open="showRecurrenceModal"
    v-model="recurrence"
    :start-date="startDateOnly"
    @update:start-date="(val: string) => emit('update:startDateOnly', val)"
  />
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  Calendar,
  Clock,
  PenLine,
  Tag,
  Palette,
  MapPin,
  Globe,
  FileText,
  RotateCw,
  Bell,
  BellRing,
  Plus,
  X,
  Check
} from 'lucide-vue-next'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '~/components/ui/card'
import { Badge, Button } from '@kreavoks/kreaui'
import { Label } from '~/components/ui/label'
import { Input } from '~/components/ui/input'
import { Textarea } from '~/components/ui/textarea'
import { Switch } from '~/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '~/components/ui/select'
import { DatePicker } from '~/components/ui/date-picker'
import { DatePicker } from '~/components/ui/date-picker'
import { TimePicker } from '~/components/ui/time-picker'
import SetRecurrenceModal from './SetRecurrenceModal.vue'
import type {
  CreateEventPayload,
  EventType,
  RecurrenceConfig,
  EventNotificationItem,
  RecurrenceType
} from '../types/calendar.types'

const props = defineProps<{
  form: CreateEventPayload
  startDateOnly: string
  startTimeOnly: string
  endDateOnly: string
  endTimeOnly: string
  activeDurationMinutes: number | null
  durationPresets: Array<{ label: string; minutes: number }>
  presetColors: Array<{ label: string; value: string }>
  eventTypeOptions: Array<{ label: string; value: EventType }>
}>()

const emit = defineEmits<{
  'update:startDateOnly': [value: string]
  'update:startTimeOnly': [value: string]
  'update:endDateOnly': [value: string]
  'update:endTimeOnly': [value: string]
  applyDurationPreset: [minutes: number]
}>()

const showRecurrenceModal = ref(false)

const daysNames: Record<number, string> = {
  0: 'Sunday',
  1: 'Monday',
  2: 'Tuesday',
  3: 'Wednesday',
  4: 'Thursday',
  5: 'Friday',
  6: 'Saturday'
}

const getDayOfWeekFromDate = (dateStr: string): number => {
  if (!dateStr) return new Date().getDay()
  const parts = dateStr.split('-').map(Number)
  const [year, month, day] = parts
  if (year !== undefined && month !== undefined && day !== undefined && !isNaN(year) && !isNaN(month) && !isNaN(day)) {
    return new Date(year, month - 1, day).getDay()
  }
  return new Date(dateStr).getDay()
}

const currentStartDayName = computed(() => {
  const dayIdx = getDayOfWeekFromDate(props.startDateOnly)
  return daysNames[dayIdx] || 'Sunday'
})

const formatDisplayDate = (dStr: string): string => {
  if (!dStr) return ''
  const parts = dStr.split('-')
  const [year, month, day] = parts
  if (year && month && day) {
    return `${day}/${month}/${year}`
  }
  return dStr
}

const currentRecurrenceSummaryText = computed(() => {
  const rec = recurrence.value
  const startDayIdx = getDayOfWeekFromDate(props.startDateOnly)
  const startDayName = daysNames[startDayIdx] || 'Sunday'
  const startFormatted = formatDisplayDate(props.startDateOnly) || 'start date'

  if (rec.type === 'DOES_NOT_REPEAT') return 'Does not repeat'
  if (rec.type === 'EVERY_WEEKDAY') return `Occurs every weekday (Mon - Fri) starting ${startFormatted}`
  if (rec.type === 'DAILY') return `Occurs every day starting ${startFormatted}`
  if (rec.type === 'WEEKLY') {
    const days = (rec.daysOfWeek && rec.daysOfWeek.length > 0)
      ? rec.daysOfWeek.map(d => daysNames[d]).filter(Boolean).join(', ')
      : startDayName
    return `Occurs every ${days} starting ${startFormatted}`
  }
  if (rec.type === 'MONTHLY') {
    if (rec.monthlyMode === 'SPECIFIC_DATES' && rec.daysOfMonth?.length) {
      return `Occurs every month on day ${rec.daysOfMonth.join(', ')} starting ${startFormatted}`
    }
    return `Occurs every month on day ${currentStartDay.value} starting ${startFormatted}`
  }
  if (rec.type === 'YEARLY') return `Occurs every year starting ${startFormatted}`
  if (rec.type === 'CUSTOM') {
    const interval = rec.interval || 1
    const unit = rec.unit || 'WEEK'
    if (unit === 'DAY') return `Occurs every ${interval === 1 ? 'day' : `${interval} days`} starting ${startFormatted}`
    if (unit === 'WEEK') {
      const days = (rec.daysOfWeek && rec.daysOfWeek.length > 0)
        ? rec.daysOfWeek.map(d => daysNames[d]).filter(Boolean).join(', ')
        : startDayName
      return `Occurs every ${interval === 1 ? '' : `${interval} weeks on `}${days} starting ${startFormatted}`
    }
    if (unit === 'MONTH') return `Occurs every ${interval === 1 ? 'month' : `${interval} months`} starting ${startFormatted}`
    if (unit === 'YEAR') return `Occurs every ${interval === 1 ? 'year' : `${interval} years`} starting ${startFormatted}`
  }
  return 'Custom recurrence active'
})

// Ensure recurrence and notifications are initialized on the form
if (!props.form.recurrence) {
  props.form.recurrence = {
    type: 'DOES_NOT_REPEAT',
    interval: 1,
    unit: 'WEEK',
    daysOfWeek: [],
    daysOfMonth: [],
    monthlyMode: 'SAME_DAY',
    endType: 'NEVER',
    endDate: ''
  }
}

if (!props.form.notifications || props.form.notifications.length === 0) {
  props.form.notifications = [
    { id: 'notif-1', minutesBefore: 30 }
  ]
}

const recurrence = computed<RecurrenceConfig>({
  get: () => {
    if (!props.form.recurrence) {
      props.form.recurrence = {
        type: 'DOES_NOT_REPEAT',
        interval: 1,
        unit: 'WEEK',
        daysOfWeek: [],
        daysOfMonth: [],
        monthlyMode: 'SAME_DAY',
        endType: 'NEVER',
        endDate: ''
      }
    }
    return props.form.recurrence
  },
  set: (val) => {
    props.form.recurrence = val
  }
})

const notifications = computed<EventNotificationItem[]>({
  get: () => {
    if (!props.form.notifications) {
      props.form.notifications = [{ id: 'notif-1', minutesBefore: 30 }]
    }
    return props.form.notifications
  },
  set: (val) => {
    props.form.notifications = val
  }
})

const currentStartDay = computed(() => {
  if (props.startDateOnly) {
    const parts = props.startDateOnly.split('-').map(Number)
    const day = parts[2]
    if (day !== undefined && !isNaN(day)) return day
  }
  return new Date().getDate()
})

const daysOfWeekOptions = [
  { value: 1, label: 'Sen' },
  { value: 2, label: 'Sel' },
  { value: 3, label: 'Rab' },
  { value: 4, label: 'Kam' },
  { value: 5, label: 'Jum' },
  { value: 6, label: 'Sab' },
  { value: 0, label: 'Min' }
]

const onRecurrenceTypeChange = (type: string) => {
  const startDay = getDayOfWeekFromDate(props.startDateOnly)
  if (type === 'WEEKLY') {
    recurrence.value.unit = 'WEEK'
    recurrence.value.interval = 1
    recurrence.value.daysOfWeek = [startDay]
  } else if (type === 'DAILY') {
    recurrence.value.unit = 'DAY'
    recurrence.value.interval = 1
  } else if (type === 'EVERY_WEEKDAY') {
    recurrence.value.unit = 'WEEK'
    recurrence.value.interval = 1
    recurrence.value.daysOfWeek = [1, 2, 3, 4, 5]
  } else if (type === 'MONTHLY') {
    recurrence.value.unit = 'MONTH'
    recurrence.value.interval = 1
    if (!recurrence.value.daysOfMonth || recurrence.value.daysOfMonth.length === 0) {
      recurrence.value.daysOfMonth = [currentStartDay.value]
    }
    if (!recurrence.value.monthlyMode) {
      recurrence.value.monthlyMode = 'SAME_DAY'
    }
  } else if (type === 'YEARLY') {
    recurrence.value.unit = 'YEAR'
    recurrence.value.interval = 1
  } else if (type === 'CUSTOM') {
    if (!recurrence.value.interval) recurrence.value.interval = 1
    if (!recurrence.value.unit) recurrence.value.unit = 'WEEK'
    if (!recurrence.value.endType) recurrence.value.endType = 'NEVER'
    showRecurrenceModal.value = true
  }
}

const toggleDayOfMonth = (day: number) => {
  const current = recurrence.value.daysOfMonth || []
  if (current.includes(day)) {
    recurrence.value.daysOfMonth = current.filter(d => d !== day)
  } else {
    recurrence.value.daysOfMonth = [...current, day].sort((a, b) => a - b)
  }
}

const isDayOfMonthSelected = (day: number): boolean => {
  return (recurrence.value.daysOfMonth || []).includes(day)
}

const selectedDaysOfMonth = computed(() => {
  return recurrence.value.daysOfMonth || []
})

const toggleDayOfWeek = (day: number) => {
  const current = recurrence.value.daysOfWeek || []
  if (current.includes(day)) {
    recurrence.value.daysOfWeek = current.filter(d => d !== day)
  } else {
    recurrence.value.daysOfWeek = [...current, day].sort((a, b) => a - b)
  }
}

const isDayOfWeekSelected = (day: number): boolean => {
  return (recurrence.value.daysOfWeek || []).includes(day)
}

const addNotification = () => {
  if (notifications.value.length >= 5) return
  notifications.value.push({
    id: `notif-${Date.now()}`,
    minutesBefore: 15
  })
}

const removeNotification = (index: number) => {
  notifications.value.splice(index, 1)
}
</script>
