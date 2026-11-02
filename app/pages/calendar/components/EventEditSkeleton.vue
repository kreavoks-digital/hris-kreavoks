<template>
  <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-pulse">
    <!-- LEFT COLUMN SKELETON (7 Cols) -->
    <div class="lg:col-span-7">
      <Card class="border border-border bg-card/60 rounded-3xl p-6 space-y-6">
        <div class="flex items-center justify-between pb-4 border-b border-border">
          <div class="flex items-center gap-2.5">
            <Skeleton class="h-5 w-5 rounded-md" />
            <div class="space-y-1.5">
              <Skeleton class="h-4 w-28 rounded" />
              <Skeleton class="h-3 w-40 rounded" />
            </div>
          </div>
          <Skeleton class="h-6 w-20 rounded-full" />
        </div>

        <!-- Title Skeleton -->
        <div class="space-y-2">
          <Skeleton class="h-4 w-24 rounded" />
          <Skeleton class="h-11 w-full rounded-2xl" />
        </div>

        <!-- Date Time Skeleton -->
        <div class="space-y-3">
          <div class="flex justify-between items-center">
            <Skeleton class="h-4 w-32 rounded" />
            <Skeleton class="h-4 w-28 rounded" />
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Skeleton class="h-11 w-full rounded-2xl" />
            <Skeleton class="h-11 w-full rounded-2xl" />
          </div>
        </div>

        <!-- Category & Color Skeleton -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="space-y-2">
            <Skeleton class="h-4 w-20 rounded" />
            <Skeleton class="h-11 w-full rounded-2xl" />
          </div>
          <div class="space-y-2">
            <Skeleton class="h-4 w-24 rounded" />
            <div class="flex gap-2 pt-1">
              <Skeleton v-for="i in 6" :key="i" class="h-7 w-7 rounded-full" />
            </div>
          </div>
        </div>

        <!-- Location & Link Skeleton -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="space-y-2">
            <Skeleton class="h-4 w-28 rounded" />
            <Skeleton class="h-11 w-full rounded-2xl" />
          </div>
          <div class="space-y-2">
            <Skeleton class="h-4 w-24 rounded" />
            <Skeleton class="h-11 w-full rounded-2xl" />
          </div>
        </div>

        <!-- Description Skeleton -->
        <div class="space-y-2">
          <Skeleton class="h-4 w-20 rounded" />
          <Skeleton class="h-24 w-full rounded-2xl" />
        </div>
      </Card>
    </div>

    <!-- RIGHT COLUMN SKELETON (5 Cols) -->
    <div class="lg:col-span-5 space-y-6">
      <Card class="border border-border bg-card/60 rounded-3xl p-6 space-y-5">
        <div class="flex items-center justify-between pb-4 border-b border-border">
          <div class="flex items-center gap-2.5">
            <Skeleton class="h-5 w-5 rounded-md" />
            <Skeleton class="h-4 w-28 rounded" />
          </div>
          <Skeleton class="h-5 w-16 rounded-full" />
        </div>

        <!-- Quick Filter Tabs -->
        <div class="flex gap-2">
          <Skeleton class="h-8 w-20 rounded-full" />
          <Skeleton class="h-8 w-20 rounded-full" />
          <Skeleton class="h-8 w-20 rounded-full" />
        </div>

        <!-- Search Input -->
        <Skeleton class="h-10 w-full rounded-xl" />

        <!-- Attendee List Rows -->
        <div class="space-y-2.5 pt-1">
          <div v-for="i in 5" :key="i" class="flex items-center gap-3 p-3 rounded-2xl border border-border/50">
            <Skeleton class="h-8 w-8 rounded-full shrink-0" />
            <div class="flex-1 space-y-1.5">
              <Skeleton class="h-3.5 w-32 rounded" />
              <Skeleton class="h-2.5 w-24 rounded" />
            </div>
            <Skeleton class="h-4 w-4 rounded-md shrink-0" />
          </div>
        </div>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Card } from '~/components/ui/card'
import { Skeleton } from '~/components/ui/skeleton'
</script>
