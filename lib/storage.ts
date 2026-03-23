import { Document } from './types'
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter'
import { Document as LangchainDocument } from 'langchain/document'

const STORAGE_KEY = 'kb_qa_documents'

export function saveDocuments(documents: Document[]): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(documents))
  }
}

export function loadDocuments(): Document[] {
  if (typeof window === 'undefined') {
    return []
  }

  const stored = localStorage.getItem(STORAGE_KEY)
  if (!stored) {
    return []
  }

  try {
    const docs = JSON.parse(stored)
    return docs.map((doc: any) => ({
      ...doc,
      uploadedAt: new Date(doc.uploadedAt),
    }))
  } catch {
    return []
  }
}

export function addDocument(document: Document): void {
  const documents = loadDocuments()
  documents.push(document)
  saveDocuments(documents)
}

export function deleteDocument(id: string): void {
  const documents = loadDocuments()
  const filtered = documents.filter((doc) => doc.id !== id)
  saveDocuments(filtered)
}

export async function processDocumentForVectorStore(
  document: Document
): Promise<LangchainDocument[]> {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
    separators: ['\n\n', '\n', '。', '！', '？', '.', '!', '?', ' ', ''],
  })

  const docs = await splitter.splitText(document.content)

  return docs.map(
    (chunk) =>
      new LangchainDocument({
        pageContent: chunk,
        metadata: {
          source: document.id,
          title: document.title,
        },
      })
  )
}

export function saveApiKey(apiKey: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('kb_qa_api_key', apiKey)
  }
}

export function loadApiKey(): string | null {
  if (typeof window === 'undefined') {
    return null
  }

  return localStorage.getItem('kb_qa_api_key')
}
