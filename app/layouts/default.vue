<template>
  <div class="default-layout">
    <aside class="sidebar">
      <div class="logo">
        <h2>KREAVOKS HRIS</h2>
      </div>
      <nav class="nav-menu">
        <NuxtLink to="/" class="nav-item">
          <span class="icon">📊</span>
          <span>Dashboard</span>
        </NuxtLink>
        <NuxtLink to="/karyawan" class="nav-item">
          <span class="icon">👥</span>
          <span>Karyawan</span>
        </NuxtLink>
        <NuxtLink to="/absensi" class="nav-item">
          <span class="icon">✅</span>
          <span>Absensi</span>
        </NuxtLink>
        <NuxtLink to="/cuti" class="nav-item">
          <span class="icon">📅</span>
          <span>Cuti</span>
        </NuxtLink>
        <NuxtLink to="/payroll" class="nav-item">
          <span class="icon">💰</span>
          <span>Payroll</span>
        </NuxtLink>
      </nav>
    </aside>

    <div class="main-container">
      <header class="header">
        <div class="header-left">
          <h1 class="page-title">{{ pageTitle }}</h1>
        </div>
        <div class="header-right">
          <div class="user-info">
            <span class="user-name">{{ user.name }}</span>
            <div class="user-avatar">{{ user.initials }}</div>
          </div>
          <button @click="logout" class="btn-logout">Logout</button>
        </div>
      </header>

      <main class="content">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute();

const user = ref({
  name: "Admin User",
  initials: "AU",
});

const pageTitle = computed(() => {
  const titles: Record<string, string> = {
    "/": "Dashboard",
    "/karyawan": "Data Karyawan",
    "/absensi": "Absensi",
    "/cuti": "Manajemen Cuti",
    "/payroll": "Payroll",
  };
  return titles[route.path] || "HRIS";
});

const logout = () => {
  // TODO: Implement logout
  navigateTo("/login");
};
</script>

<style scoped>
.default-layout {
  display: flex;
  min-height: 100vh;
  background: #f3f4f6;
}

.sidebar {
  width: 260px;
  background: #1f2937;
  color: white;
  position: fixed;
  height: 100vh;
  overflow-y: auto;
}

.logo {
  padding: 2rem 1.5rem;
  border-bottom: 1px solid #374151;
}

.logo h2 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: bold;
}

.nav-menu {
  padding: 1rem 0;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.5rem;
  color: #d1d5db;
  text-decoration: none;
  transition: all 0.2s;
}

.nav-item:hover {
  background: #374151;
  color: white;
}

.nav-item.router-link-active {
  background: #3b82f6;
  color: white;
  border-right: 4px solid #60a5fa;
}

.icon {
  font-size: 1.25rem;
}

.main-container {
  flex: 1;
  margin-left: 260px;
  display: flex;
  flex-direction: column;
}

.header {
  background: white;
  padding: 1rem 2rem;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 10;
}

.page-title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.user-name {
  font-weight: 500;
  color: #374151;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #3b82f6;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
}

.btn-logout {
  padding: 0.5rem 1rem;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
}

.btn-logout:hover {
  background: #dc2626;
}

.content {
  flex: 1;
  overflow-y: auto;
}
</style>
