<template>
  <Card class="border border-border overflow-hidden bg-card rounded-3xl">
    <CardHeader class="bg-muted/50 border-b border-border">
      <div class="flex items-center gap-2">
        <UserCircle class="h-5 w-5 text-kv-primary" />
        <CardTitle class="text-lg font-semibold text-foreground">Identitas & Kontak</CardTitle>
      </div>
    </CardHeader>
    <CardContent class="p-6">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
        <div class="flex flex-col">
          <span class="text-xs text-muted-foreground font-medium">Nama Lengkap</span>
          <span class="text-sm font-semibold text-foreground mt-0.5">{{ application.name }}</span>
        </div>
        <div class="flex flex-col">
          <span class="text-xs text-muted-foreground font-medium">Alamat Email</span>
          <span class="text-sm font-semibold text-foreground mt-0.5">{{ application.email }}</span>
        </div>
        <div class="flex flex-col">
          <span class="text-xs text-muted-foreground font-medium">No. Telepon / WhatsApp</span>
          <span class="text-sm font-semibold text-foreground mt-0.5">{{ application.phone || '-' }}</span>
        </div>
        <div class="flex flex-col">
          <span class="text-xs text-muted-foreground font-medium">Nomor KTP</span>
          <span class="text-sm font-semibold text-foreground mt-0.5">{{ application.ktpNumber || '-' }}</span>
        </div>
        <div class="flex flex-col">
          <span class="text-xs text-muted-foreground font-medium">Nomor NPWP</span>
          <span class="text-sm font-semibold text-foreground mt-0.5">{{ application.npwpNumber || '-' }}</span>
        </div>
      </div>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { UserCircle } from 'lucide-vue-next'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import type { MentorApplication } from '~/pages/employee/api/mentorApplication.api'

defineProps<{
  application: MentorApplication
}>()
</script>
