<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import AdminLayout from '../layouts/AdminLayout.vue'
import { useYoutubeStore } from '../stores/youtube'
import type { YoutubeProjectInsert, YoutubeProjectUpdate, VideoLang, VideoType } from '../types'

const store = useYoutubeStore()

const showModal = ref(false)
const editingId = ref<string | null>(null)
const submitError = ref('')

const filterLang = ref<VideoLang | null>(null)
const filterType = ref<VideoType | null>(null)

const typeLabels: Record<VideoType, string> = {
  solo: 'Сольный концерт',
  standup: 'Стендап',
  show: 'Шоу',
  interview: 'Подкасты',
}

const filteredProjects = computed(() => {
  return store.projects.filter(p => {
    if (filterLang.value && p.lang !== filterLang.value) return false
    if (filterType.value && p.type !== filterType.value) return false
    return true
  })
})

function toggleLang(lang: VideoLang) {
  filterLang.value = filterLang.value === lang ? null : lang
}

function toggleType(type: VideoType) {
  filterType.value = filterType.value === type ? null : type
}

const emptyForm = (): YoutubeProjectInsert => ({
  title: '',
  description: null,
  youtube_url: '',
  thumbnail_url: null,
  published_at: null,
  is_featured: false,
  lang: null,
  type: null,
})

const form = ref<YoutubeProjectInsert>(emptyForm())

function getYoutubeId(url: string): string | null {
  const match = url.match(/(?:youtu\.be\/|v=)([a-zA-Z0-9_-]{11})/)
  return match ? match[1] : null
}

function openCreate() {
  editingId.value = null
  form.value = emptyForm()
  submitError.value = ''
  showModal.value = true
}

function openEdit(id: string) {
  const project = store.projects.find(p => p.id === id)
  if (!project) return
  editingId.value = id
  form.value = {
    title: project.title,
    description: project.description,
    youtube_url: project.youtube_url,
    thumbnail_url: project.thumbnail_url,
    published_at: project.published_at ? project.published_at.slice(0, 10) : null,
    is_featured: project.is_featured,
    lang: project.lang,
    type: project.type,
  }
  submitError.value = ''
  showModal.value = true
}

async function handleSubmit() {
  submitError.value = ''
  const payload = {
    ...form.value,
    published_at: form.value.published_at || null,
  }
  try {
    if (editingId.value) {
      await store.updateProject(editingId.value, payload as YoutubeProjectUpdate)
    } else {
      await store.createProject(payload)
    }
    showModal.value = false
  } catch (e: unknown) {
    submitError.value = e instanceof Error ? e.message : 'Ошибка сохранения'
  }
}

async function handleDelete(id: string) {
  if (!confirm('Удалить проект?')) return
  await store.deleteProject(id)
}

onMounted(() => store.fetchProjects())
</script>

<template>
  <AdminLayout>
    <div class="youtube-page">
      <div class="page-header">
        <h1 class="page-title">YouTube проекты</h1>
        <button class="btn-primary" @click="openCreate">+ Добавить</button>
      </div>

      <div class="filters">
        <div class="filter-group">
          <button
            v-for="lang in (['kz', 'ru'] as const)"
            :key="lang"
            class="filter-btn"
            :class="{ active: filterLang === lang }"
            @click="toggleLang(lang)"
          >
            {{ lang.toUpperCase() }}
          </button>
        </div>
        <div class="filter-group">
          <button
            v-for="(label, type) in typeLabels"
            :key="type"
            class="filter-btn"
            :class="{ active: filterType === type }"
            @click="toggleType(type as VideoType)"
          >
            {{ label }}
          </button>
        </div>
      </div>

      <div v-if="store.loading" class="loading">Загрузка...</div>
      <div v-else-if="filteredProjects.length === 0" class="empty">
        {{ store.projects.length === 0 ? 'Проектов пока нет' : 'Нет видео по выбранным фильтрам' }}
      </div>
      <div v-else class="projects-grid">
        <div v-for="project in filteredProjects" :key="project.id" class="project-card">
          <div class="card-thumbnail">
            <img
              v-if="project.thumbnail_url || getYoutubeId(project.youtube_url)"
              :src="project.thumbnail_url || `https://img.youtube.com/vi/${getYoutubeId(project.youtube_url)}/mqdefault.jpg`"
              :alt="project.title"
            />
            <div v-else class="no-thumbnail">▶️</div>
          </div>
          <div class="card-body">
            <div class="card-header">
              <span class="card-title">{{ project.title }}</span>
              <span v-if="project.is_featured" class="featured-badge">⭐ Избранное</span>
            </div>
            <div class="card-tags">
              <span v-if="project.lang" class="tag tag-lang">{{ project.lang.toUpperCase() }}</span>
              <span v-if="project.type" class="tag tag-type">{{ typeLabels[project.type] }}</span>
            </div>
            <p v-if="project.description" class="card-desc">{{ project.description }}</p>
            <span v-if="project.published_at" class="card-date">
              {{ new Date(project.published_at).toLocaleDateString('ru-RU') }}
            </span>
            <div class="card-actions">
              <a :href="project.youtube_url" target="_blank" class="btn-link">Открыть ↗</a>
              <button class="btn-icon" @click="openEdit(project.id)">✏️</button>
              <button class="btn-icon btn-delete" @click="handleDelete(project.id)">🗑️</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <Teleport to="body">
      <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
        <div class="modal">
          <h2>{{ editingId ? 'Редактировать проект' : 'Новый YouTube проект' }}</h2>
          <form @submit.prevent="handleSubmit" class="modal-form">
            <div class="form-group">
              <label>Название *</label>
              <input v-model="form.title" required placeholder="Stand-up концерт 2024" />
            </div>
            <div class="form-group">
              <label>Ссылка на YouTube *</label>
              <input v-model="form.youtube_url" type="url" required placeholder="https://youtube.com/watch?v=..." />
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Язык</label>
                <select v-model="form.lang">
                  <option :value="null">— не указан —</option>
                  <option value="kz">KZ</option>
                  <option value="ru">RU</option>
                </select>
              </div>
              <div class="form-group">
                <label>Тип</label>
                <select v-model="form.type">
                  <option :value="null">— не указан —</option>
                  <option value="solo">Сольный концерт</option>
                  <option value="standup">Стендап</option>
                  <option value="show">Шоу</option>
                  <option value="interview">Подкасты</option>
                </select>
              </div>
            </div>
            <div class="form-group">
              <label>Описание</label>
              <textarea v-model="form.description" rows="3" placeholder="Описание видео..."></textarea>
            </div>
            <div class="form-group">
              <label>Кастомная обложка (URL)</label>
              <input v-model="form.thumbnail_url" type="url" placeholder="https://... (оставьте пустым для авто)" />
            </div>
            <div class="form-group">
              <label>Дата публикации</label>
              <input v-model="form.published_at" type="date" />
            </div>
            <div class="form-group form-check">
              <label>
                <input v-model="form.is_featured" type="checkbox" />
                Избранное (показывать на главной)
              </label>
            </div>
            <div v-if="submitError" class="error-msg">{{ submitError }}</div>
            <div class="modal-actions">
              <button type="button" class="btn-secondary" @click="showModal = false">Отмена</button>
              <button type="submit" class="btn-primary">{{ editingId ? 'Сохранить' : 'Создать' }}</button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>
  </AdminLayout>
</template>

<style scoped>
.youtube-page { max-width: 1000px; }

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  color: #fff;
  margin: 0;
}

.loading, .empty { color: #555; font-size: 14px; padding: 20px 0; }

.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 20px;
}

.filter-group {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.filter-btn {
  background: #1a1a1a;
  border: 1px solid #2a2a2a;
  border-radius: 20px;
  padding: 5px 14px;
  font-size: 12px;
  font-weight: 600;
  color: #888;
  cursor: pointer;
  letter-spacing: 0.5px;
  transition: background 0.15s, color 0.15s, border-color 0.15s;
}

.filter-btn:hover { background: #252525; color: #ccc; }

.filter-btn.active {
  background: #e0e0e0;
  color: #0f0f0f;
  border-color: #e0e0e0;
}

.card-tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.tag {
  font-size: 10px;
  font-weight: 600;
  padding: 2px 7px;
  border-radius: 4px;
  letter-spacing: 0.4px;
}

.tag-lang {
  background: rgba(74, 158, 255, 0.12);
  color: #4a9eff;
}

.tag-type {
  background: rgba(160, 160, 160, 0.1);
  color: #888;
}

.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.project-card {
  background: #1a1a1a;
  border: 1px solid #2a2a2a;
  border-radius: 10px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.card-thumbnail {
  width: 100%;
  aspect-ratio: 16/9;
  background: #252525;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.no-thumbnail { font-size: 32px; color: #444; }

.card-body {
  padding: 14px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
}

.card-title {
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  line-height: 1.3;
}

.featured-badge {
  font-size: 10px;
  font-weight: 500;
  color: #f39c12;
  background: rgba(243, 156, 18, 0.1);
  padding: 2px 6px;
  border-radius: 4px;
  white-space: nowrap;
}

.card-desc {
  font-size: 12px;
  color: #666;
  margin: 0;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.card-date { font-size: 11px; color: #555; }

.card-actions {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 4px;
}

.btn-link {
  font-size: 12px;
  color: #4a9eff;
  text-decoration: none;
  flex: 1;
}

.btn-link:hover { text-decoration: underline; }

.btn-icon {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  font-size: 14px;
  transition: background 0.1s;
}

.btn-icon:hover { background: #2a2a2a; }
.btn-delete:hover { background: rgba(192, 57, 43, 0.2); }

.btn-primary {
  background: #fff;
  color: #0f0f0f;
  border: none;
  border-radius: 8px;
  padding: 9px 18px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.15s;
}

.btn-primary:hover { opacity: 0.88; }

.btn-secondary {
  background: #2a2a2a;
  color: #e0e0e0;
  border: 1px solid #3a3a3a;
  border-radius: 8px;
  padding: 9px 18px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s;
}

.btn-secondary:hover { background: #333; }

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 20px;
}

.modal {
  background: #1a1a1a;
  border: 1px solid #2a2a2a;
  border-radius: 12px;
  padding: 32px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal h2 {
  color: #fff;
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 24px;
}

.modal-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-size: 12px;
  font-weight: 500;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 0.4px;
}

.form-group input,
.form-group textarea {
  background: #252525;
  border: 1px solid #333;
  border-radius: 8px;
  padding: 9px 13px;
  color: #e0e0e0;
  font-size: 14px;
  outline: none;
  transition: border-color 0.15s;
  font-family: inherit;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus { border-color: #555; }
.form-group textarea { resize: vertical; }
.form-group input::placeholder,
.form-group textarea::placeholder { color: #444; }

.form-group select {
  background: #252525;
  border: 1px solid #333;
  border-radius: 8px;
  padding: 9px 13px;
  color: #e0e0e0;
  font-size: 14px;
  outline: none;
  transition: border-color 0.15s;
  font-family: inherit;
  cursor: pointer;
}

.form-group select option { background: #1a1a1a; }

.form-check label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #d0d0d0;
  text-transform: none;
  letter-spacing: 0;
  cursor: pointer;
}

.error-msg {
  background: rgba(192, 57, 43, 0.15);
  border: 1px solid rgba(192, 57, 43, 0.4);
  border-radius: 6px;
  padding: 10px 14px;
  color: #e74c3c;
  font-size: 13px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 8px;
}

@media (max-width: 767px) {
  .youtube-page { max-width: 100%; }

  .page-title { font-size: 20px; }

  .projects-grid { grid-template-columns: 1fr; }

  .modal-overlay { align-items: flex-end; padding: 0; }

  .modal {
    border-radius: 16px 16px 0 0;
    max-height: 92vh;
    padding: 24px 16px;
    max-width: 100%;
  }

  .modal-actions { flex-direction: column-reverse; }

  .modal-actions .btn-primary,
  .modal-actions .btn-secondary { width: 100%; text-align: center; padding: 12px; }
}
</style>
