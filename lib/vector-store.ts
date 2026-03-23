import { OpenAIEmbeddings } from '@langchain/openai'
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter'
import { Document as LangchainDocument } from 'langchain/document'
import { v4 as uuidv4 } from 'uuid'

export interface VectorDoc {
  id: string
  content: string
  metadata: {
    source: string
    title: string
  }
  embedding: number[]
}

class InMemoryVectorStore {
  private docs: Map<string, VectorDoc> = new Map()
  private embeddings: OpenAIEmbeddings

  constructor(apiKey: string) {
    this.embeddings = new OpenAIEmbeddings({ openAIApiKey: apiKey })
  }

  async addDocuments(documents: LangchainDocument[]): Promise<void> {
    const texts = documents.map((doc) => doc.pageContent)
    const embeddings = await this.embeddings.embedDocuments(texts)

    for (let i = 0; i < documents.length; i++) {
      const doc = documents[i]
      const id = uuidv4()
      const vectorDoc: VectorDoc = {
        id,
        content: doc.pageContent,
        metadata: doc.metadata as any,
        embedding: embeddings[i],
      }
      this.docs.set(id, vectorDoc)
    }
  }

  async similaritySearch(query: string, k: number = 4): Promise<LangchainDocument[]> {
    const queryEmbedding = await this.embeddings.embedQuery(query)
    const results = Array.from(this.docs.values())
      .map((doc) => ({
        doc,
        similarity: this.cosineSimilarity(queryEmbedding, doc.embedding),
      }))
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, k)

    return results.map((r) => new LangchainDocument({
      pageContent: r.doc.content,
      metadata: r.doc.metadata,
    }))
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    let dotProduct = 0
    let normA = 0
    let normB = 0

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i]
      normA += a[i] * a[i]
      normB += b[i] * b[i]
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
  }

  getDocumentCount(): number {
    return this.docs.size
  }

  clear(): void {
    this.docs.clear()
  }
}

let vectorStore: InMemoryVectorStore | null = null

export function getVectorStore(apiKey: string): InMemoryVectorStore {
  if (!vectorStore) {
    vectorStore = new InMemoryVectorStore(apiKey)
  }
  return vectorStore
}

export function resetVectorStore(): void {
  vectorStore = null
}
