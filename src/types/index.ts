export interface Event {
  id: string
  title: string
  date: string
  venue: string
  city: string
  description: string | null
  ticket_url: string | null
  poster_url: string | null
  is_published: boolean
  created_at: string
  updated_at: string
}

export type VideoLang = 'kz' | 'ru'
export type VideoType = 'solo' | 'standup' | 'show' | 'interview'

export interface YoutubeProject {
  id: string
  title: string
  description: string | null
  youtube_url: string
  thumbnail_url: string | null
  published_at: string | null
  is_featured: boolean
  lang: VideoLang | null
  type: VideoType | null
  created_at: string
}

export type EventInsert = Omit<Event, 'id' | 'created_at' | 'updated_at'>
export type EventUpdate = Partial<EventInsert>

export type YoutubeProjectInsert = Omit<YoutubeProject, 'id' | 'created_at'>
export type YoutubeProjectUpdate = Partial<YoutubeProjectInsert>
