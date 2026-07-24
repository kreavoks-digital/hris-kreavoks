<template>
  <Card class="border border-border overflow-hidden bg-card rounded-3xl">
    <CardHeader class="bg-muted/50 border-b border-border">
      <div class="flex items-center gap-2">
        <CreditCard class="h-5 w-5 text-kv-primary" />
        <CardTitle class="text-lg font-semibold text-foreground">Data Rekening Bank (Fee/Honor)</CardTitle>
      </div>
    </CardHeader>
    <CardContent class="p-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-y-4 gap-x-8">
        <div class="flex flex-col">
          <span class="text-xs text-muted-foreground font-medium">Bank Tujuan</span>
          <span class="text-sm font-semibold text-foreground mt-0.5">{{ application.bankName || '-' }}</span>
        </div>
        <div class="flex flex-col">
          <span class="text-xs text-muted-foreground font-medium">Nomor Rekening</span>
          <span class="text-sm font-semibold text-foreground mt-0.5">{{ application.accountNumber || '-' }}</span>
        </div>
        <div class="flex flex-col">
          <span class="text-xs text-muted-foreground font-medium">Nama Pemilik Rekening</span>
          <span class="text-sm font-semibold text-foreground mt-0.5">{{ application.accountHolder || '-' }}</span>
        </div>
      </div>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { CreditCard } from 'lucide-vue-next'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import type { MentorApplication } from '~/pages/employee/api/mentorApplication.api'

defineProps<{
  application: MentorApplication
}>()
</script>
