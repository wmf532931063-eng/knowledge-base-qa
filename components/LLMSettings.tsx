'use client'

import { useState, useEffect } from 'react'
import { Settings, Key, Globe, Save, Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react'
import { BackendConfig, loadBackendConfig, saveBackendConfig, isConfigComplete } from '@/lib/config'

interface LLMSettingsProps {
  isOpen: boolean
  onClose: () => void
  onConfigChange: (config: BackendConfig) => void
}

export default function LLMSettings({ isOpen, onClose, onConfigChange }: LLMSettingsProps) {
  const [config, setConfig] = useState<BackendConfig>({
    llmBaseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    llmApiKey: '',
    llmModel: 'qwen-turbo',
  })
  const [showKey, setShowKey] = useState(false)

  useEffect(() => {
    if (isOpen) {
      const saved = loadBackendConfig()
      setConfig(saved)
    }
  }, [isOpen])

  const handleChange = (field: keyof BackendConfig, value: string) => {
    setConfig((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = () => {
    saveBackendConfig(config)
    onConfigChange(config)
    onClose()
  }

  if (!isOpen) return null

  const isComplete = isConfigComplete(config)

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* 头部 */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-lg">🤖</span>
              </div>
              <div>
                <h2 className="text-xl font-semibold">通义千问配置</h2>
                <p className="text-sm text-blue-100">阿里云大模型服务</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 内容 */}
        <div className="p-6 space-y-4">
          {/* Base URL */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Globe className="w-4 h-4" />
              <span>API Base URL</span>
            </label>
            <input
              type="text"
              value={config.llmBaseUrl}
              onChange={(e) => handleChange('llmBaseUrl', e.target.value)}
              placeholder="https://dashscope.aliyuncs.com/compatible-mode/v1"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <p className="text-xs text-gray-500">
              通义千问API端点：https://dashscope.aliyuncs.com/compatible-mode/v1
            </p>
          </div>

          {/* Model */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <span>🤖</span>
              <span>通义千问模型</span>
            </label>
            <input
              type="text"
              value={config.llmModel}
              onChange={(e) => handleChange('llmModel', e.target.value)}
              placeholder="qwen-turbo"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <p className="text-xs text-gray-500">
              可选模型：qwen-turbo（快速）、qwen-plus（均衡）、qwen-max（最强）
            </p>
          </div>

          {/* API Key */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Key className="w-4 h-4" />
              <span>通义千问API密钥</span>
            </label>
            <div className="flex gap-2">
              <input
                type={showKey ? 'text' : 'password'}
                value={config.llmApiKey}
                onChange={(e) => handleChange('llmApiKey', e.target.value)}
                placeholder="sk-xxxxxxxxxxxxxxxx"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button
                onClick={() => setShowKey(!showKey)}
                className="px-3 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                {showKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <p className="text-xs text-gray-500">
              API密钥以"sk-"开头，将存储在本地浏览器中
            </p>
            <p className="text-xs text-blue-600">
              📢 提示：访问 <a href="https://dashscope.console.aliyun.com/" target="_blank" className="underline">阿里云百炼控制台</a> 获取API密钥
            </p>
          </div>
        </div>

        {/* 底部 */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={handleSave}
            disabled={!isComplete}
            className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition flex items-center justify-center gap-2 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed"
          >
            <Save className="w-5 h-5" />
            <span>保存配置</span>
          </button>
          {!isComplete && (
            <p className="text-xs text-orange-600 mt-2 text-center">
              请完善大模型配置
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
