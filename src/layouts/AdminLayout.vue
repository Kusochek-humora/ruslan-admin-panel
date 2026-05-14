<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

async function handleLogout() {
  await authStore.logout()
  router.push({ name: 'login' })
}
</script>

<template>
  <div class="admin-layout">
    <!-- Desktop sidebar -->
    <aside class="sidebar">
      <div class="sidebar-header">
        <span class="logo">🎤 Tiko Admin</span>
      </div>

      <nav class="sidebar-nav">
        <RouterLink to="/dashboard" class="nav-link" active-class="active">
          <span class="nav-icon">📊</span>
          <span>Дашборд</span>
        </RouterLink>
        <RouterLink to="/events" class="nav-link" active-class="active">
          <span class="nav-icon">🎭</span>
          <span>Концерты</span>
        </RouterLink>
        <RouterLink to="/youtube" class="nav-link" active-class="active">
          <span class="nav-icon">▶️</span>
          <span>YouTube</span>
        </RouterLink>
      </nav>

      <div class="sidebar-footer">
        <div class="user-info">
          <span class="user-email">{{ authStore.user?.email }}</span>
        </div>
        <button class="logout-btn" @click="handleLogout">Выйти</button>
      </div>
    </aside>

    <!-- Mobile top header -->
    <header class="mobile-header">
      <span class="logo">🎤 Tiko Admin</span>
      <span class="mobile-user">{{ authStore.user?.email }}</span>
    </header>

    <main class="main-content">
      <slot />
    </main>

    <!-- Mobile bottom nav -->
    <nav class="mobile-nav">
      <RouterLink to="/dashboard" class="mobile-nav-item" active-class="active">
        <span class="mobile-nav-icon">📊</span>
        <span class="mobile-nav-label">Дашборд</span>
      </RouterLink>
      <RouterLink to="/events" class="mobile-nav-item" active-class="active">
        <span class="mobile-nav-icon">🎭</span>
        <span class="mobile-nav-label">Концерты</span>
      </RouterLink>
      <RouterLink to="/youtube" class="mobile-nav-item" active-class="active">
        <span class="mobile-nav-icon">▶️</span>
        <span class="mobile-nav-label">YouTube</span>
      </RouterLink>
      <button class="mobile-nav-item mobile-logout" @click="handleLogout">
        <span class="mobile-nav-icon">🚪</span>
        <span class="mobile-nav-label">Выйти</span>
      </button>
    </nav>
  </div>
</template>

<style scoped>
.admin-layout {
  display: flex;
  min-height: 100vh;
  background: #0f0f0f;
  color: #e0e0e0;
  font-family: 'Inter', system-ui, sans-serif;
}

/* ── Desktop sidebar ── */
.sidebar {
  width: 240px;
  min-height: 100vh;
  background: #1a1a1a;
  border-right: 1px solid #2a2a2a;
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  z-index: 10;
}

.sidebar-header {
  padding: 24px 20px;
  border-bottom: 1px solid #2a2a2a;
}

.logo {
  font-size: 18px;
  font-weight: 700;
  color: #fff;
  letter-spacing: -0.3px;
}

.sidebar-nav {
  flex: 1;
  padding: 16px 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 8px;
  color: #9a9a9a;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.15s;
}

.nav-link:hover { background: #252525; color: #e0e0e0; }
.nav-link.active { background: #2d2d2d; color: #fff; }

.nav-icon {
  font-size: 16px;
  width: 20px;
  text-align: center;
}

.sidebar-footer {
  padding: 16px 20px;
  border-top: 1px solid #2a2a2a;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.user-email {
  font-size: 12px;
  color: #666;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.logout-btn {
  background: #2a2a2a;
  color: #e0e0e0;
  border: 1px solid #3a3a3a;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.15s;
  text-align: left;
}

.logout-btn:hover { background: #c0392b; border-color: #c0392b; color: #fff; }

/* ── Mobile header (hidden on desktop) ── */
.mobile-header {
  display: none;
}

/* ── Mobile bottom nav (hidden on desktop) ── */
.mobile-nav {
  display: none;
}

/* ── Main content ── */
.main-content {
  flex: 1;
  min-width: 0;
  overflow-x: hidden;
  margin-left: 240px;
  padding: 32px;
  min-height: 100vh;
}

/* ── Mobile breakpoint ── */
@media (max-width: 767px) {
  .sidebar { display: none; }

  .mobile-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 52px;
    background: #1a1a1a;
    border-bottom: 1px solid #2a2a2a;
    padding: 0 16px;
    z-index: 10;
  }

  .mobile-user {
    font-size: 11px;
    color: #555;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 160px;
  }

  .main-content {
    margin-left: 0;
    padding: 16px;
    padding-top: 68px;
    padding-bottom: 80px;
    min-height: 100vh;
  }

  .mobile-nav {
    display: flex;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: 60px;
    background: #1a1a1a;
    border-top: 1px solid #2a2a2a;
    z-index: 10;
  }

  .mobile-nav-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 3px;
    color: #666;
    text-decoration: none;
    font-size: 11px;
    font-weight: 500;
    transition: color 0.15s;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    font-family: inherit;
  }

  .mobile-nav-item.active { color: #fff; }
  .mobile-nav-item:hover { color: #bbb; }

  .mobile-nav-icon { font-size: 18px; line-height: 1; }
  .mobile-nav-label { font-size: 10px; }

  .mobile-logout { color: #555; }
  .mobile-logout:hover { color: #e74c3c; }
}
</style>
