// 后端API配置
export interface BackendConfig {
  // 大模型API配置（用于生成占卜解读）
  llmBaseUrl: string
  llmApiKey: string
  llmModel: string
}

// 默认配置
export const defaultBackendConfig: BackendConfig = {
  llmBaseUrl: process.env.NEXT_PUBLIC_LLM_BASE_URL || '',
  llmApiKey: process.env.NEXT_PUBLIC_LLM_API_KEY || '',
  llmModel: process.env.NEXT_PUBLIC_LLM_MODEL || 'gpt-3.5-turbo',
}

// 从本地存储加载配置
export function loadBackendConfig(): BackendConfig {
  if (typeof window === 'undefined') {
    return defaultBackendConfig
  }

  const stored = localStorage.getItem('fortune_backend_config')
  if (!stored) {
    return defaultBackendConfig
  }

  try {
    return JSON.parse(stored)
  } catch {
    return defaultBackendConfig
  }
}

// 保存配置到本地存储
export function saveBackendConfig(config: BackendConfig): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('fortune_backend_config', JSON.stringify(config))
  }
}

// 检查配置是否完整
export function isConfigComplete(config: BackendConfig): boolean {
  return !!(
    config.llmBaseUrl &&
    config.llmApiKey &&
    config.llmModel
  )
}
