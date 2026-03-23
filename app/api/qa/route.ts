import { NextRequest, NextResponse } from 'next/server'
import { performFortuneTelling } from '@/lib/backend-service'
import { BackendConfig } from '@/lib/config'
import { loadDocuments } from '@/lib/storage'

export async function POST(request: NextRequest) {
  try {
    const { question, documents } = await request.json()

    if (!question) {
      return NextResponse.json({ error: '请提供问题' }, { status: 400 })
    }

    // 从请求头获取后端配置
    const config: BackendConfig = {
      llmBaseUrl: request.headers.get('x-llm-base-url') || '',
      llmApiKey: request.headers.get('x-llm-api-key') || '',
      llmModel: request.headers.get('x-llm-model') || 'gpt-3.5-turbo',
    }

    // 验证配置
    if (!config.llmBaseUrl || !config.llmApiKey) {
      return NextResponse.json(
        { error: '请先配置大模型API' },
        { status: 400 }
      )
    }

    // 如果没有提供文档，从本地存储加载
    let docsToUse = documents
    if (!docsToUse) {
      docsToUse = loadDocuments()
    }

    // 执行占卜
    const result = await performFortuneTelling(question, config, docsToUse)

    return NextResponse.json(result)
  } catch (error) {
    console.error('占卜失败:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '占卜失败，请重试' },
      { status: 500 }
    )
  }
}
