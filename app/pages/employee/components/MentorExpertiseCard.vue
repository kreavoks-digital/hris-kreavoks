<template>
  <Card class="border border-border overflow-hidden bg-card rounded-3xl">
    <CardHeader class="bg-muted/50 border-b border-border">
      <div class="flex items-center gap-2">
        <Briefcase class="h-5 w-5 text-kv-primary" />
        <CardTitle class="text-lg font-semibold text-foreground">Keahlian & Profesionalisme</CardTitle>
      </div>
    </CardHeader>
    <CardContent class="p-6 space-y-4">
      <div class="space-y-6">
        <div class="flex flex-col">
          <span class="text-xs text-muted-foreground font-medium mb-3">Bidang Keahlian</span>
          <ol v-if="parsedExpertise && parsedExpertise.length > 0" class="flex flex-col gap-2.5">
            <li v-for="(exp, idx) in parsedExpertise" :key="idx" class="flex items-start gap-2">
              <span class="text-sm font-medium text-muted-foreground w-4 flex-shrink-0 pt-0.5">{{ Number(idx) + 1 }}.</span>
              <div class="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                <span class="text-sm font-semibold text-foreground">{{ exp.name || '-' }}</span>
                <span class="hidden sm:inline text-muted-foreground/40">•</span>
                <div class="flex items-center gap-2 text-xs text-muted-foreground">
                  <span class="bg-muted px-2 py-0.5 rounded-md font-medium">{{ exp.level || '-' }}</span>
                  <span>{{ exp.years || '0' }} Tahun</span>
                </div>
              </div>
            </li>
          </ol>
          <span v-else class="text-sm font-semibold text-foreground mt-0.5">-</span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-y-4 gap-x-8 border-t border-border/60 pt-4">
          <div class="flex flex-col">
            <span class="text-xs text-muted-foreground font-medium">Lama Pengalaman Kerja</span>
            <span class="text-sm font-semibold text-foreground mt-0.5">{{ application.experience || '0' }} Tahun</span>
          </div>
          <div class="flex flex-col">
            <span class="text-xs text-muted-foreground font-medium">Pekerjaan Saat Ini</span>
            <span class="text-sm font-semibold text-foreground mt-0.5">{{ application.currentJob || '-' }}</span>
          </div>
          <div class="flex flex-col">
            <span class="text-xs text-muted-foreground font-medium">Perusahaan / Institusi</span>
            <span class="text-sm font-semibold text-foreground mt-0.5">{{ application.company || '-' }}</span>
          </div>
        </div>
      </div>

      <div class="border-t border-border/60 pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="flex flex-col">
          <span class="text-xs text-muted-foreground font-medium">Ketersediaan Mengajar</span>
          <span class="text-sm text-foreground mt-0.5">{{ application.teachingAvailability || '-' }}</span>
        </div>
        <div class="flex flex-col">
          <span class="text-xs text-muted-foreground font-medium">Pengalaman Mengajar</span>
          <span class="text-sm text-foreground mt-0.5">{{ application.teachingExperience || '-' }}</span>
        </div>
      </div>

      <div class="border-t border-border/60 pt-4 space-y-2">
        <span class="text-xs text-muted-foreground font-medium">Bio Singkat</span>
        <p class="text-sm text-foreground bg-muted/30 p-3 rounded-xl border border-border/50 leading-relaxed">{{ application.bio || 'Tidak ada biografi' }}</p>
      </div>

      <div class="space-y-2">
        <span class="text-xs text-muted-foreground font-medium">Alasan Mendaftar</span>
        <p class="text-sm text-foreground bg-muted/30 p-3 rounded-xl border border-border/50 leading-relaxed">{{ application.reason || 'Tidak ada alasan khusus' }}</p>
      </div>

      <div class="border-t border-border/60 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div class="flex items-center gap-3 p-3 border border-border rounded-2xl bg-muted/10">
          <FileText class="h-5 w-5 text-kv-primary flex-shrink-0" />
          <div class="flex flex-col overflow-hidden">
            <span class="text-[10px] text-muted-foreground">Portofolio</span>
            <a v-if="application.portfolioLink" :href="application.portfolioLink" target="_blank" class="text-xs font-semibold text-kv-primary hover:underline truncate">
              Buka Link Portofolio
            </a>
            <span v-else class="text-xs font-semibold text-muted-foreground">Tidak melampirkan</span>
          </div>
        </div>
        <div class="flex items-center gap-3 p-3 border border-border rounded-2xl bg-muted/10">
          <Linkedin class="h-5 w-5 text-blue-600 flex-shrink-0" />
          <div class="flex flex-col overflow-hidden">
            <span class="text-[10px] text-muted-foreground">LinkedIn</span>
            <a v-if="application.linkedinLink" :href="application.linkedinLink" target="_blank" class="text-xs font-semibold text-kv-primary hover:underline truncate">
              Buka Profil LinkedIn
            </a>
            <span v-else class="text-xs font-semibold text-muted-foreground">Tidak melampirkan</span>
          </div>
        </div>
        <div class="flex items-center gap-3 p-3 border border-border rounded-2xl bg-muted/10">
          <FileText class="h-5 w-5 text-red-500 flex-shrink-0" />
          <div class="flex flex-col overflow-hidden">
            <span class="text-[10px] text-muted-foreground">Dokumen CV</span>
            <a v-if="application.cvFileUrl" :href="application.cvFileUrl" target="_blank" class="text-xs font-semibold text-kv-primary hover:underline truncate">
              Buka Dokumen CV
            </a>
            <span v-else class="text-xs font-semibold text-muted-foreground">Tidak melampirkan</span>
          </div>
        </div>
        <div class="flex items-center gap-3 p-3 border border-border rounded-2xl bg-muted/10">
          <FileText class="h-5 w-5 text-indigo-500 flex-shrink-0" />
          <div class="flex flex-col overflow-hidden">
            <span class="text-[10px] text-muted-foreground">Dokumen KTP</span>
            <a v-if="application.ktpFileUrl" :href="application.ktpFileUrl" target="_blank" class="text-xs font-semibold text-kv-primary hover:underline truncate">
              Buka Dokumen KTP
            </a>
            <span v-else class="text-xs font-semibold text-muted-foreground">Tidak melampirkan</span>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Briefcase, FileText, Linkedin } from 'lucide-vue-next'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import type { MentorApplication } from '~/pages/employee/api/mentorApplication.api'

interface ExpertiseItem {
  name?: string
  level?: string
  years?: string | number
}

const props = defineProps<{
  application: MentorApplication
}>()

const parsedExpertise = computed<ExpertiseItem[]>(() => {
  if (!props.application.expertise) return []
  if (typeof props.application.expertise === 'object') {
    return Array.isArray(props.application.expertise) ? props.application.expertise : [props.application.expertise]
  }
  try {
    const parsed = JSON.parse(props.application.expertise)
    return Array.isArray(parsed) ? parsed : [{ name: String(props.application.expertise), level: '-', years: '-' }]
  } catch (e) {
    return [{ name: String(props.application.expertise), level: '-', years: '-' }]
  }
})
</script>
