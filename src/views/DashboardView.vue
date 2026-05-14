<script setup lang="ts">
import { computed, onMounted } from 'vue'
import AdminLayout from '../layouts/AdminLayout.vue'
import { useEventsStore } from '../stores/events'
import { useYoutubeStore } from '../stores/youtube'

const eventsStore = useEventsStore()
const youtubeStore = useYoutubeStore()

onMounted(async () => {
  await Promise.all([eventsStore.fetchEvents(), youtubeStore.fetchProjects()])
})

const upcomingEvents = computed(() =>
  eventsStore.events.filter(e => new Date(e.date) >= new Date()).length
)

const stats = computed(() => [
  { label: 'Концертов всего', value: eventsStore.events.length, icon: '🎭' },
  { label: 'Предстоящих', value: upcomingEvents.value, icon: '📅' },
  { label: 'YouTube проектов', value: youtubeStore.projects.length, icon: '▶️' },
  {
    label: 'Избранных видео',
    value: youtubeStore.projects.filter(p => p.is_featured).length,
    icon: '⭐',
  },
])

const recentEvents = computed(() => eventsStore.events.slice(0, 5))
</script>

<template>
  <AdminLayout>
    <div class="dashboard">
      <h1 class="page-title">Дашборд</h1>

      <div class="stats-grid">
        <div v-for="stat in stats" :key="stat.label" class="stat-card">
          <span class="stat-icon">{{ stat.icon }}</span>
          <div class="stat-info">
            <span class="stat-value">{{ stat.value }}</span>
            <span class="stat-label">{{ stat.label }}</span>
          </div>
        </div>
      </div>

      <div class="section">
        <h2 class="section-title">Последние концерты</h2>
        <div v-if="eventsStore.loading" class="loading">Загрузка...</div>
        <div v-else-if="recentEvents.length === 0" class="empty">Концертов пока нет</div>
        <div v-else class="events-list">
          <div v-for="event in recentEvents" :key="event.id" class="event-row">
            <div class="event-info">
              <span class="event-title">{{ event.title }}</span>
              <span class="event-meta">{{ event.city }} · {{ new Date(event.date).toLocaleDateString('ru-RU') }}</span>
            </div>
            <span :class="['event-badge', event.is_published ? 'published' : 'draft']">
              {{ event.is_published ? 'Опубликован' : 'Черновик' }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<style scoped>
.dashboard {
  max-width: 900px;
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  color: #fff;
  margin: 0 0 28px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 16px;
  margin-bottom: 36px;
}

.stat-card {
  background: #1a1a1a;
  border: 1px solid #2a2a2a;
  border-radius: 10px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 14px;
}

.stat-icon {
  font-size: 28px;
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 26px;
  font-weight: 700;
  color: #fff;
  line-height: 1;
}

.stat-label {
  font-size: 12px;
  color: #666;
  margin-top: 4px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #fff;
  margin: 0 0 16px;
}

.loading,
.empty {
  color: #555;
  font-size: 14px;
  padding: 20px 0;
}

.events-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.event-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #1a1a1a;
  border: 1px solid #2a2a2a;
  border-radius: 8px;
  padding: 14px 16px;
}

.event-info {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.event-title {
  font-size: 14px;
  font-weight: 500;
  color: #e0e0e0;
}

.event-meta {
  font-size: 12px;
  color: #555;
}

.event-badge {
  font-size: 11px;
  font-weight: 500;
  padding: 3px 8px;
  border-radius: 4px;
}

.event-badge.published {
  background: rgba(39, 174, 96, 0.15);
  color: #27ae60;
}

.event-badge.draft {
  background: rgba(100, 100, 100, 0.15);
  color: #777;
}

@media (max-width: 767px) {
  .dashboard { max-width: 100%; }

  .page-title { font-size: 20px; margin-bottom: 20px; }

  .stats-grid {
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    margin-bottom: 24px;
  }

  .stat-card { padding: 14px 12px; gap: 10px; }

  .stat-value { font-size: 22px; }

  .event-row { flex-wrap: wrap; gap: 8px; }

  .event-badge { align-self: flex-start; }
}
</style>
