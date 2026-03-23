export interface Document {
  id: string
  title: string
  content: string
  uploadedAt: Date
  fileSize: number
  type: string
}

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  sources?: string[]
}

export interface KnowledgeBase {
  id: string
  name: string
  documents: Document[]
  createdAt: Date
}
