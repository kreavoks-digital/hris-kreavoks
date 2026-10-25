<script setup lang="ts">
import { ShieldCheck, KeyRound, Users } from 'lucide-vue-next'
import { Card, CardContent } from '~/components/ui/card'
import { getRoleMascot } from '../utils/mascot'

interface StatsProps {
  totalRoles: number
  totalPermissions: number
  totalUsers: number
  totalAdmins: number
}

defineProps<{
  stats: StatsProps
}>()
</script>

<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
    <!-- Stat 1: Total Role -->
    <Card class="rounded-3xl border-border bg-card">
      <CardContent class="p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-normal text-muted-foreground">Total Role</p>
            <h3 class="text-2xl font-semibold text-foreground mt-2">{{ stats.totalRoles }}</h3>
          </div>
          <div class="w-12 h-12 rounded-2xl bg-kv-primary/10 flex items-center justify-center text-kv-primary">
            <ShieldCheck class="w-6 h-6" />
          </div>
        </div>
        <p class="text-sm text-muted-foreground mt-3">Role aktif</p>
      </CardContent>
    </Card>

    <!-- Stat 2: Total Permission -->
    <Card class="rounded-3xl border-border bg-card">
      <CardContent class="p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-normal text-muted-foreground">Total Permission</p>
            <h3 class="text-2xl font-semibold text-foreground mt-2">{{ stats.totalPermissions }}</h3>
          </div>
          <div class="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <KeyRound class="w-6 h-6" />
          </div>
        </div>
        <p class="text-sm text-muted-foreground mt-3">Hak akses fitur</p>
      </CardContent>
    </Card>

    <!-- Stat 3: Total User -->
    <Card class="rounded-3xl border-border bg-card">
      <CardContent class="p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-normal text-muted-foreground">Total User</p>
            <h3 class="text-2xl font-semibold text-foreground mt-2">{{ stats.totalUsers }}</h3>
          </div>
          <div class="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <Users class="w-6 h-6" />
          </div>
        </div>
        <p class="text-sm text-muted-foreground mt-3">User terdaftar</p>
      </CardContent>
    </Card>

    <!-- Stat 4: Admin (With Mascot) -->
    <Card class="rounded-3xl border-border bg-card">
      <CardContent class="p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-normal text-muted-foreground">Admin</p>
            <h3 class="text-2xl font-semibold text-foreground mt-2">{{ stats.totalAdmins }}</h3>
          </div>
          <div class="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center">
            <img :src="getRoleMascot('ADMIN')" alt="Admin Mascot" class="w-8 h-8 object-contain" />
          </div>
        </div>
        <p class="text-sm text-muted-foreground mt-3">Akses penuh</p>
      </CardContent>
    </Card>
  </div>
</template>
