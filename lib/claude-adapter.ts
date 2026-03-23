/**
 * Claude API 适配器
 * 将 Claude API 格式转换为 OpenAI 兼容格式
 */

import { BackendConfig } from './config'

export async function callClaudeAPI(
  question: string,
  context: string,
  config: BackendConfig
): Promise<string> {
  const messages = [
    {
      role: 'system' as const,
      content: `你是一位精通周易、六爻、八字、塔罗、梅花易数等传统占卜术的智者。
请根据以下参考信息回答用户的问题：

参考信息：
${context}

回答要求：
1. 语言富有古韵但通俗易懂
2. 明确给出"大吉"、"吉"、"中平"、"需谨慎"、"凶"等判断
3. 解释判断的理由和依据
4. 给出实际可行的建议
5. 格式规范：
   【卦象/签文】：给出相关的卦象或签文
   【吉凶判断】：大吉/吉/中平/需谨慎/凶
   【解读分析】：详细分析运势
   【建议指引】：具体的行动建议

重要提醒：
- 占卜仅供娱乐和参考，不可过分迷信
- 鼓励用户积极面对生活，做出自己的选择
- 用积极正面的态度引导用户`
    },
    {
      role: 'user' as const,
      content: question
    }
  ]

  const response = await fetch(`${config.llmBaseUrl}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': config.llmApiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: config.llmModel,
      max_tokens: 2000,
      messages: messages
    })
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Claude API 错误: ${response.status} - ${errorText}`)
  }

  const data = await response.json()
  return data.content[0]?.text || '未能获取有效回答'
}

/**
 * 检查是否为 Claude API
 */
export function isClaudeAPI(baseUrl: string): boolean {
  return baseUrl.includes('anthropic.com') || baseUrl.includes('claude')
}

/**
 * 通用大模型调用函数
 * 根据 API 类型自动选择适配器
 */
export async function callGenericLLM(
  question: string,
  context: string,
  config: BackendConfig
): Promise<string> {
  // 检查是否为 Claude API
  if (isClaudeAPI(config.llmBaseUrl)) {
    return callClaudeAPI(question, context, config)
  }

  // 默认为 OpenAI 兼容格式
  const messages = [
    {
      role: 'system' as const,
      content: `你是一位精通周易、六爻、八字、塔罗、梅花易数等传统占卜术的智者。
请根据以下参考信息回答用户的问题：

参考信息：
${context}

回答要求：
1. 语言富有古韵但通俗易懂
2. 明确给出"大吉"、"吉"、"中平"、"需谨慎"、"凶"等判断
3. 解释判断的理由和依据
4. 给出实际可行的建议
5. 格式规范：
   【卦象/签文】：给出相关的卦象或签文
   【吉凶判断】：大吉/吉/中平/需谨慎/凶
   【解读分析】：详细分析运势
   【建议指引】：具体的行动建议

重要提醒：
- 占卜仅供娱乐和参考，不可过分迷信
- 鼓励用户积极面对生活，做出自己的选择
- 用积极正面的态度引导用户`
    },
    {
      role: 'user' as const,
      content: question
    }
  ]

  const response = await fetch(`${config.llmBaseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.llmApiKey}`
    },
    body: JSON.stringify({
      model: config.llmModel,
      max_tokens: 2000,
      temperature: 0.8,
      messages: messages
    })
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`LLM API 错误: ${response.status} - ${errorText}`)
  }

  const data = await response.json()
  return data.choices[0]?.message?.content || '未能获取有效回答'
}