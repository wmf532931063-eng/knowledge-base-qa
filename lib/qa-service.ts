import { ChatOpenAI } from '@langchain/openai'
import { ChatPromptTemplate } from '@langchain/core/prompts'
import { RunnableSequence } from '@langchain/core/runnables'
import { StringOutputParser } from '@langchain/core/output_parsers'
import { Document as LangchainDocument } from 'langchain/document'
import { getVectorStore } from './vector-store'

export interface QAResponse {
  answer: string
  sources: string[]
  fortune?: 'great' | 'good' | 'neutral' | 'caution' | 'bad'
}

export async function answerQuestion(
  question: string,
  apiKey: string,
  context?: LangchainDocument[]
): Promise<QAResponse> {
  let relevantDocs = context

  if (!relevantDocs) {
    const vectorStore = getVectorStore(apiKey)
    relevantDocs = await vectorStore.similaritySearch(question, 4)
  }

  let contextText = ''
  if (relevantDocs.length > 0) {
    contextText = relevantDocs
      .map((doc, i) => `[典籍${i + 1}]: ${doc.pageContent}\n出处: ${doc.metadata.title}`)
      .join('\n\n')
  }

  const sources = relevantDocs.length > 0
    ? [...new Set(relevantDocs.map((doc) => doc.metadata.title as string))]
    : []

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
    new ChatOpenAI({ openAIApiKey: apiKey, temperature: 0.8 }),
    new StringOutputParser(),
  ])

  const answer = await chain.invoke({
    context: contextText,
    question,
  })

  // 判断吉凶等级
  let fortune: 'great' | 'good' | 'neutral' | 'caution' | 'bad' = 'neutral'
  if (answer.includes('大吉') || answer.includes('上上签')) {
    fortune = 'great'
  } else if (answer.includes('吉') && !answer.includes('需谨慎')) {
    fortune = 'good'
  } else if (answer.includes('凶') || answer.includes('下签')) {
    fortune = 'bad'
  } else if (answer.includes('需谨慎') || answer.includes('不利')) {
    fortune = 'caution'
  }

  return {
    answer,
    sources,
    fortune,
  }
}
