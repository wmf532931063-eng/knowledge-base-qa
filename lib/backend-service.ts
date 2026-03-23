import { OpenAIEmbeddings } from '@langchain/openai'
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter'
import { Document as LangchainDocument } from 'langchain/document'
import { BackendConfig } from './config'
import { ChatOpenAI } from '@langchain/openai'
import { ChatPromptTemplate } from '@langchain/core/prompts'
import { RunnableSequence } from '@langchain/core/runnables'
import { StringOutputParser } from '@langchain/core/output_parsers'
import { v4 as uuidv4 } from 'uuid'
import { callGenericLLM } from './claude-adapter'

interface VectorDoc {
  id: string
  content: string
  metadata: {
    source: string
    title: string
  }
  embedding: number[]
}

// 内存向量存储（本地使用）
class LocalVectorStore {
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

// 全局向量存储实例
let vectorStore: LocalVectorStore | null = null

function getVectorStore(apiKey: string): LocalVectorStore {
  if (!vectorStore) {
    vectorStore = new LocalVectorStore(apiKey)
  }
  return vectorStore
}

function resetVectorStore(): void {
  vectorStore = null
}

// 从本地文档加载到向量存储
export async function loadDocumentsToVectorStore(
  documents: any[],
  apiKey: string
): Promise<void> {
  const store = getVectorStore(apiKey)

  // 如果已经有文档，先清空
  if (store.getDocumentCount() > 0) {
    store.clear()
  }

  // 将文档转换为Langchain文档并添加到向量存储
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
    separators: ['\n\n', '\n', '。', '！', '？', '.', '!', '?', ' ', ''],
  })

  for (const doc of documents) {
    const chunks = await splitter.splitText(doc.content)
    const langchainDocs = chunks.map(
      (chunk) =>
        new LangchainDocument({
          pageContent: chunk,
          metadata: {
            source: doc.id,
            title: doc.title,
          },
        })
    )

    await store.addDocuments(langchainDocs)
  }
}

// 本地向量搜索（不调用远程知识库API）
export async function searchLocalKnowledge(
  question: string,
  apiKey: string
): Promise<{ content: string; source: string }[]> {
  try {
    const store = getVectorStore(apiKey)

    if (store.getDocumentCount() === 0) {
      return []
    }

    const docs = await store.similaritySearch(question, 4)

    return docs.map((doc) => ({
      content: doc.pageContent,
      source: doc.metadata.title as string,
    }))
  } catch (error) {
    console.error('本地知识库搜索错误:', error)
    return []
  }
}

// 调用大模型API生成占卜结果
export async function generateFortuneReading(
  question: string,
  context: { content: string; source: string }[],
  config: BackendConfig
): Promise<string> {
  try {
    // 构建上下文文本
    const contextText = context.length > 0
      ? context
          .map((item, i) => `[典籍${i + 1}]: ${item.content}\n出处: ${item.source}`)
          .join('\n\n')
      : ''

    // 尝试使用通用LLM调用（支持更多模型）
    try {
      return await callGenericLLM(question, contextText, config)
    } catch (error) {
      console.warn('通用LLM调用失败，尝试使用Langchain:', error)
      
      // 降级到Langchain OpenAI调用
      const template = ChatPromptTemplate.fromMessages([
        [
          'system',
          `你是一位精通周易、六爻、八字、塔罗、梅花易数等传统占卜术的智者。你能够根据用户的问题，结合传统典籍和智慧，为他们解读吉凶、指引方向。

你的回答风格要求：
1. **神秘而亲切**：语言富有古韵，但要通俗易懂
2. **吉凶明确**：明确给出"大吉"、"吉"、"中平"、"需谨慎"、"凶"等判断
3. **理由充分**：解释判断的理由和依据
4. **建议具体**：给出实际可行的建议和行动指引
5. **格式规范**：每次回答都按以下格式输出：
   【卦象/签文】：给出相关的卦象或签文
   【吉凶判断】：大吉/吉/中平/需谨慎/凶
   【解读分析】：详细分析运势
   【建议指引】：具体的行动建议

${contextText ? `
请参考以下典籍内容，结合你的智慧进行解答：
${contextText}
` : `
如果没有相关典籍内容，请依据传统易学和占卜智慧进行解答。`}

重要提醒：
- 占卜仅供娱乐和参考，不可过分迷信
- 鼓励用户积极面对生活，做出自己的选择
- 用积极正面的态度引导用户`,
        ],
        ['human', '{question}'],
      ])

      const chain = RunnableSequence.from([
        template,
        new ChatOpenAI({
          openAIApiKey: config.llmApiKey,
          modelName: config.llmModel,
          temperature: 0.8,
          maxTokens: 2000,
          configuration: {
            baseURL: config.llmBaseUrl.replace(/\/v1$/, ''),
          },
        }),
        new StringOutputParser(),
      ])

      const answer = await chain.invoke({
        question,
      })

      return answer
    }
  } catch (error) {
    console.error('LLM请求错误:', error)
    throw error
  }
}

// 完整的占卜流程
export async function performFortuneTelling(
  question: string,
  config: BackendConfig,
  documents?: any[]
): Promise<{ answer: string; sources: string[] }> {
  // 1. 从本地知识库检索相关内容
  let knowledgeResults: { content: string; source: string }[] = []

  if (documents && documents.length > 0) {
    // 如果提供了新文档，先加载到向量存储
    await loadDocumentsToVectorStore(documents, config.llmApiKey)
  }

  knowledgeResults = await searchLocalKnowledge(question, config.llmApiKey)

  // 2. 提取来源列表
  const sources = knowledgeResults.map((item) => item.source)

  // 3. 使用LLM生成占卜结果
  const answer = await generateFortuneReading(question, knowledgeResults, config)

  return {
    answer,
    sources: [...new Set(sources)],
  }
}
