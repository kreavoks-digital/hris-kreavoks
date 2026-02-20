<template>
  <div class="dashboard">
    <h1>Dashboard HRIS Kreavoks</h1>
    <div class="stats-grid">
      <DashboardCard
        title="Total Karyawan"
        :value="stats.totalEmployees"
        icon="👥"
      />
      <DashboardCard
        title="Hadir Hari Ini"
        :value="stats.presentToday"
        icon="✅"
      />
      <DashboardCard
        title="Cuti Bulan Ini"
        :value="stats.leaveThisMonth"
        icon="📅"
      />
      <DashboardCard
        title="Pending Approval"
        :value="stats.pendingApproval"
        icon="⏳"
      />
    </div>

    <div class="recent-activities">
      <h2>Aktivitas Terbaru</h2>
      <ActivityList :activities="recentActivities" />
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: "default",
  middleware: "auth",
});

const stats = ref({
  totalEmployees: 0,
  presentToday: 0,
  leaveThisMonth: 0,
  pendingApproval: 0,
});

const recentActivities = ref([]);

onMounted(async () => {
  try {
    const { data } = await useFetch("/api/dashboard/stats");
    if (data.value) {
      stats.value = data.value;
    }
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
  }
});
</script>

<style scoped>
.dashboard {
  padding: 2rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin: 2rem 0;
}

.recent-activities {
  margin-top: 3rem;
}

h1 {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 1rem;
}

h2 {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1rem;
}
</style>
