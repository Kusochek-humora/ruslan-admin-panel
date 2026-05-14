<script setup lang="ts">
import { ref, onMounted } from 'vue'
import AdminLayout from '../layouts/AdminLayout.vue'
import { useEventsStore } from '../stores/events'
import type { EventInsert, EventUpdate } from '../types'

const store = useEventsStore()

const showModal = ref(false)
const editingId = ref<string | null>(null)
const submitError = ref('')
const posterFile = ref<File | null>(null)
const posterPreview = ref<string | null>(null)
const uploading = ref(false)

const emptyForm = (): EventInsert => ({
  title: '',
  date: '',
  venue: '',
  city: 'Алматы',
  description: null,
  ticket_url: null,
  poster_url: null,
  is_published: false,
})

const form = ref<EventInsert>(emptyForm())

function openCreate() {
  editingId.value = null
  form.value = emptyForm()
  posterFile.value = null
  posterPreview.value = null
  submitError.value = ''
  showModal.value = true
}

function openEdit(id: string) {
  const event = store.events.find(e => e.id === id)
  if (!event) return
  editingId.value = id
  form.value = {
    title: event.title,
    date: event.date.slice(0, 16),
    venue: event.venue,
    city: event.city,
    description: event.description,
    ticket_url: event.ticket_url,
    poster_url: event.poster_url,
    is_published: event.is_published,
  }
  posterFile.value = null
  posterPreview.value = event.poster_url
  submitError.value = ''
  showModal.value = true
}

function onPosterChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  posterFile.value = file
  posterPreview.value = URL.createObjectURL(file)
}

async function handleSubmit() {
  submitError.value = ''
  uploading.value = true
  try {
    if (posterFile.value) {
      form.value.poster_url = await store.uploadPoster(posterFile.value)
    }
    if (editingId.value) {
      await store.updateEvent(editingId.value, form.value as EventUpdate)
    } else {
      await store.createEvent(form.value)
    }
    showModal.value = false
  } catch (e: unknown) {
    submitError.value = e instanceof Error ? e.message : 'Ошибка сохранения'
  } finally {
    uploading.value = false
  }
}

async function handleDelete(id: string) {
  if (!confirm('Удалить концерт?')) return
  await store.deleteEvent(id)
}

onMounted(() => store.fetchEvents())
</script>

<template>
  <AdminLayout>
    <div class="events-page">
      <div class="page-header">
        <h1 class="page-title">Концерты</h1>
        <button class="btn-primary" @click="openCreate">+ Добавить</button>
      </div>

      <div v-if="store.loading" class="loading">Загрузка...</div>
      <div v-else-if="store.events.length === 0" class="empty">Концертов пока нет</div>
      <div v-else class="table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th></th>
              <th>Название</th>
              <th>Дата</th>
              <th>Место</th>
              <th>Город</th>
              <th>Статус</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="event in store.events" :key="event.id">
              <td class="td-poster">
                <img v-if="event.poster_url" :src="event.poster_url" class="poster-thumb" alt="" />
                <div v-else class="poster-empty"></div>
              </td>
              <td class="td-title">{{ event.title }}</td>
              <td>{{ new Date(event.date).toLocaleDateString('ru-RU') }}</td>
              <td>{{ event.venue }}</td>
              <td>{{ event.city }}</td>
              <td>
                <span :class="['badge', event.is_published ? 'published' : 'draft']">
                  {{ event.is_published ? 'Опубликован' : 'Черновик' }}
                </span>
              </td>
              <td class="td-actions">
                <button class="btn-icon" @click="openEdit(event.id)">✏️</button>
                <button class="btn-icon btn-delete" @click="handleDelete(event.id)">🗑️</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <Teleport to="body">
      <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
        <div class="modal">
          <h2>{{ editingId ? 'Редактировать концерт' : 'Новый концерт' }}</h2>
          <form @submit.prevent="handleSubmit" class="modal-form">
            <div class="form-row">
              <div class="form-group">
                <label>Название *</label>
                <input v-model="form.title" required placeholder="Stand-up вечер" />
              </div>
              <div class="form-group">
                <label>Дата *</label>
                <input v-model="form.date" type="datetime-local" required />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Площадка *</label>
                <input v-model="form.venue" required placeholder="Клуб 'Ёлки'" />
              </div>
              <div class="form-group">
                <label>Город *</label>
                <input v-model="form.city" required placeholder="Москва" />
              </div>
            </div>
            <div class="form-group">
              <label>Описание</label>
              <textarea v-model="form.description" rows="3" placeholder="Описание вечера..."></textarea>
            </div>
            <div class="form-group">
              <label>Ссылка на билеты</label>
              <input v-model="form.ticket_url" type="url" placeholder="https://..." />
            </div>
            <div class="form-group">
              <label>Постер</label>
              <div v-if="posterPreview" class="poster-preview">
                <img :src="posterPreview" alt="Постер" />
              </div>
              <input type="file" accept="image/*" @change="onPosterChange" class="file-input" />
            </div>
            <div class="form-group form-check">
              <label>
                <input v-model="form.is_published" type="checkbox" />
                Опубликован
              </label>
            </div>
            <div v-if="submitError" class="error-msg">{{ submitError }}</div>
            <div class="modal-actions">
              <button type="button" class="btn-secondary" @click="showModal = false">Отмена</button>
              <button type="submit" class="btn-primary" :disabled="uploading">
                {{ uploading ? 'Загрузка...' : editingId ? 'Сохранить' : 'Создать' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>
  </AdminLayout>
</template>

<style scoped>
.events-page { max-width: 1000px; }

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

.loading, .empty {
  color: #555;
  font-size: 14px;
  padding: 20px 0;
}

.table-wrapper {
  overflow-x: auto;
  border: 1px solid #2a2a2a;
  border-radius: 10px;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.data-table th {
  background: #1a1a1a;
  color: #666;
  font-weight: 500;
  text-align: left;
  padding: 12px 16px;
  border-bottom: 1px solid #2a2a2a;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.data-table td {
  padding: 12px 16px;
  border-bottom: 1px solid #1e1e1e;
  color: #d0d0d0;
  background: #141414;
}

.data-table tr:last-child td { border-bottom: none; }

.td-poster { width: 56px; padding-right: 0; }

.poster-thumb {
  width: 48px;
  height: 48px;
  object-fit: cover;
  border-radius: 6px;
  display: block;
}

.poster-empty {
  width: 48px;
  height: 48px;
  border-radius: 6px;
  background: #222;
}

.td-title { color: #fff; font-weight: 500; }

.badge {
  font-size: 11px;
  font-weight: 500;
  padding: 3px 8px;
  border-radius: 4px;
}

.badge.published { background: rgba(39, 174, 96, 0.15); color: #27ae60; }
.badge.draft { background: rgba(100, 100, 100, 0.15); color: #777; }

.td-actions { display: flex; gap: 4px; }

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
  max-width: 560px;
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

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
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
.form-group textarea,
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
}

.form-group input:focus,
.form-group textarea:focus { border-color: #555; }
.form-group textarea { resize: vertical; }
.form-group input::placeholder,
.form-group textarea::placeholder { color: #444; }

.file-input {
  padding: 6px 0;
  background: none;
  border: none;
  color: #aaa;
  font-size: 13px;
  cursor: pointer;
}

.poster-preview {
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
  background: #1e1e1e;
  margin-bottom: 8px;
}

.poster-preview img {
  width: 100%;
  max-height: 160px;
  object-fit: cover;
  display: block;
}

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
  .events-page { max-width: 100%; }

  .page-header { margin-bottom: 16px; }

  .page-title { font-size: 20px; }

  .table-wrapper { border-radius: 8px; }

  .data-table th,
  .data-table td { padding: 10px 12px; }

  .modal-overlay { align-items: flex-end; padding: 0; }

  .modal {
    border-radius: 16px 16px 0 0;
    max-height: 92vh;
    padding: 24px 16px;
    max-width: 100%;
  }

  .form-row { grid-template-columns: 1fr; }

  .modal-actions { flex-direction: column-reverse; }

  .modal-actions .btn-primary,
  .modal-actions .btn-secondary { width: 100%; text-align: center; padding: 12px; }
}
</style>
