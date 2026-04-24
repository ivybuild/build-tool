// TypeScript 类型定义
export interface Note {
  id: string
  user_id: string
  content: string
  images: string[]
  tags: string[]
  created_at: string
  updated_at: string
}

export interface CardSegment {
  type: 'text' | 'blank'
  content: string
}

export interface CardContent {
  segments: CardSegment[]
}

export interface Card {
  id: string
  user_id: string
  title: string
  content: CardContent
  study_count: number
  is_archived: boolean
  next_review_at: string
  last_studied_at: string | null
  created_at: string
  updated_at: string
}

export interface StudyLog {
  id: string
  card_id: string
  user_id: string
  studied_at: string
}

export interface Database {
  public: {
    Tables: {
      notes: {
        Row: Note
        Insert: Omit<Note, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Note, 'id' | 'user_id' | 'created_at'>>
      }
      cards: {
        Row: Card
        Insert: Omit<Card, 'id' | 'created_at' | 'updated_at' | 'study_count' | 'is_archived'>
        Update: Partial<Omit<Card, 'id' | 'user_id' | 'created_at'>>
      }
      study_logs: {
        Row: StudyLog
        Insert: Omit<StudyLog, 'id' | 'studied_at'>
        Update: never
      }
    }
  }
}
