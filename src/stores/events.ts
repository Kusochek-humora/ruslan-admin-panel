import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Event, EventInsert, EventUpdate } from '../types'
import { supabase } from '../lib/supabase'

export const useEventsStore = defineStore('events', () => {
  const events = ref<Event[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchEvents() {
    loading.value = true
    error.value = null
    try {
      const { data, error: err } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: false })
      if (err) throw err
      console.log('events:', data)
      events.value = data ?? []
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Ошибка загрузки'
    } finally {
      loading.value = false
    }
  }

  async function createEvent(payload: EventInsert) {
    const { data, error: err } = await supabase
      .from('events')
      .insert(payload)
      .select()
      .single()
    if (err) throw err
    events.value.unshift(data)
    return data
  }

  async function updateEvent(id: string, payload: EventUpdate) {
    const { data, error: err } = await supabase
      .from('events')
      .update({ ...payload, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    if (err) throw err
    const idx = events.value.findIndex(e => e.id === id)
    if (idx !== -1) events.value[idx] = data
    return data
  }

  async function deleteEvent(id: string) {
    const { error: err } = await supabase.from('events').delete().eq('id', id)
    if (err) throw err
    events.value = events.value.filter(e => e.id !== id)
  }

  async function uploadPoster(file: File): Promise<string> {
    const ext = file.name.split('.').pop()
    const path = `posters/${Date.now()}.${ext}`
    const { error: err } = await supabase.storage.from('events').upload(path, file)
    if (err) throw err
    const { data } = supabase.storage.from('events').getPublicUrl(path)
    return data.publicUrl
  }

  return { events, loading, error, fetchEvents, createEvent, updateEvent, deleteEvent, uploadPoster }
})
