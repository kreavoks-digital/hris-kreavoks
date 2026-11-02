<template>
  <Card class="border border-border overflow-hidden bg-card/60 backdrop-blur-sm rounded-3xl">
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
          {{ form.isAllDay ? 'Sepanjang Hari' : (activeDurationMinutes ? `${activeDurationMinutes} menit` : 'Kustom') }}
        </Badge>
      </div>
    </CardHeader>

    <CardContent class="p-6 space-y-6">
      <!-- 1. Title Row -->
      <div class="space-y-2">
        <div class="flex items-center gap-2">
          <PenLine class="w-4 h-4 text-muted-foreground shrink-0" />
          <Label for="title" class="text-sm font-medium text-foreground">
            Judul Agenda <span class="text-rose-500">*</span>
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

      <!-- 2. Date & Time Studio Row -->
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <Clock class="w-4 h-4 text-muted-foreground shrink-0" />
            <Label class="text-sm font-medium text-foreground">
              Waktu Pelaksanaan <span class="text-rose-500">*</span>
            </Label>
          </div>
          <!-- All Day Toggle -->
          <div class="flex items-center gap-2">
            <Checkbox
              id="isAllDay"
              :checked="form.isAllDay"
              @update:checked="(val: any) => form.isAllDay = val === true"
              class="rounded-md"
            />
            <Label for="isAllDay" class="text-sm text-muted-foreground font-medium cursor-pointer select-none">
              Sepanjang hari
            </Label>
          </div>
        </div>

        <!-- Start & End Date-Time Separated Studio -->
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
          <span class="text-sm text-muted-foreground font-medium mr-1">Durasi Cepat:</span>
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

      <!-- 3. Category & Label Color Row -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

      <!-- 4. Location & Online Link Row -->
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

      <!-- 5. Notes & Details Row -->
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
</template>

<script setup lang="ts">
import {
  Calendar,
  Clock,
  PenLine,
  Tag,
  Palette,
  MapPin,
  Globe,
  FileText
} from 'lucide-vue-next'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '~/components/ui/card'
import { Badge } from '@kreavoks/kreaui'
import { Label } from '~/components/ui/label'
import { Input } from '~/components/ui/input'
import { Textarea } from '~/components/ui/textarea'
import { Checkbox } from '~/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '~/components/ui/select'
import { DatePicker } from '~/components/ui/date-picker'
import { TimePicker } from '~/components/ui/time-picker'
import type { CreateEventPayload, EventType } from '../types/calendar.types'

defineProps<{
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
</script>
