import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { YoutubeProject, YoutubeProjectInsert, YoutubeProjectUpdate } from '../types'
import { supabase } from '../lib/supabase'

export const useYoutubeStore = defineStore('youtube', () => {
  const projects = ref<YoutubeProject[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchProjects() {
    loading.value = true
    error.value = null
    try {
      const { data, error: err } = await supabase
        .from('youtube_projects')
        .select('*')
        .order('created_at', { ascending: false })
      if (err) throw err
      projects.value = data ?? []
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Ошибка загрузки'
    } finally {
      loading.value = false
    }
  }

  async function createProject(payload: YoutubeProjectInsert) {
    const { data, error: err } = await supabase
      .from('youtube_projects')
      .insert(payload)
      .select()
      .single()
    if (err) throw err
    projects.value.unshift(data)
    return data
  }

  async function updateProject(id: string, payload: YoutubeProjectUpdate) {
    const { data, error: err } = await supabase
      .from('youtube_projects')
      .update(payload)
      .eq('id', id)
      .select()
      .single()
    if (err) throw err
    const idx = projects.value.findIndex(p => p.id === id)
    if (idx !== -1) projects.value[idx] = data
    return data
  }

  async function deleteProject(id: string) {
    const { error: err } = await supabase.from('youtube_projects').delete().eq('id', id)
    if (err) throw err
    projects.value = projects.value.filter(p => p.id !== id)
  }

  return { projects, loading, error, fetchProjects, createProject, updateProject, deleteProject }
})
