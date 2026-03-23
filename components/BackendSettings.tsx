'use client'

import { useState, useEffect } from 'react'
import { Settings, Key, Database, Globe, Save, Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react'
import { BackendConfig, loadBackendConfig, saveBackendConfig, isConfigComplete } from '@/lib/config'

interface BackendSettingsProps {
  isOpen: boolean
  onClose: () => void
  onConfigChange: (config: BackendConfig) => void
}

export default function BackendSettings({ isOpen, onClose, onConfigChange }: BackendSettingsProps) {
  const [config, setConfig] = useState<BackendConfig>({
    llmBaseUrl: '',
    llmApiKey: '',
    llmModel: 'gpt-3.5-turbo',
    knowledgeBaseUrl: '',
    knowledgeApiKey: '',
  })
  const [showKeys, setShowKeys] = useState({
    llmApiKey: false,
    knowledgeApiKey: false,
  })
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)

  useEffect(() => {
    if (isOpen) {
      const saved = loadBackendConfig()
      setConfig(saved)
    }
  }, [isOpen])

  const handleChange = (field: keyof BackendConfig, value: string) => {
    setConfig((prev) => ({ ...prev, [field]: value }))
  }

  const handleToggleKey = (key: keyof typeof showKeys) => {
    setShowKeys((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const handleSave = () => {
    saveBackendConfig(config)
    onConfigChange(config)
    onClose()
  }

  const handleTest = async () => {
    setTesting(true)
    setTestResult(null)

    try {
      const response = await fetch('/api/health')
      const data = await response.json()

      if (data.status === 'ok') {
        setTestResult({ success: true, message: '连接成功！' })
      } else {
        setTestResult({ success: false, message: '连接失败' })
      }
    } catch (error) {
      setTestResult({
        success: false,
        message: error instanceof Error ? error.message : '连接测试失败',
      })
    } finally {
      setTesting(false)
    }
  }

  if (!isOpen) return null

  const isComplete = isConfigComplete(config)

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* 头部 */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Settings className="w-6 h-6" />
              <h2 className="text-xl font-semibold">后端服务配置</h2>
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
        <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {/* 大模型配置 */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-purple-700">
              <Globe className="w-5 h-5" />
              <h3 className="font-semibold">大模型API配置</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">API Base URL</label>
                <input
                  type="text"
                  value={config.llmBaseUrl}
                  onChange={(e) => handleChange('llmBaseUrl', e.target.value)}
                  placeholder="https://api.example.com/v1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">模型名称</label>
                <input
                  type="text"
                  value={config.llmModel}
                  onChange={(e) => handleChange('llmModel', e.target.value)}
                  placeholder="gpt-3.5-turbo"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">API Key</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type={showKeys.llmApiKey ? 'text' : 'password'}
                    value={config.llmApiKey}
                    onChange={(e) => handleChange('llmApiKey', e.target.value)}
                    placeholder="sk-..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <button
                  onClick={() => handleToggleKey('llmApiKey')}
                  className="px-3 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  {showKeys.llmApiKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>

          {/* 知识库配置 */}
          <div className="space-y-4 pt-4 border-t border-gray-200">
            <div className="flex items-center gap-2 text-purple-700">
              <Key className="w-5 h-5" />
              <h3 className="font-semibold">知识库配置</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Base URL</label>
                <input
                  type="text"
                  value={config.knowledgeBaseUrl}
                  onChange={(e) => handleChange('knowledgeBaseUrl', e.target.value)}
                  placeholder="https://knowledge.example.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">API Key</label>
                <input
                  type={showKeys.knowledgeApiKey ? 'text' : 'password'}
                  value={config.knowledgeApiKey}
                  onChange={(e) => handleChange('knowledgeApiKey', e.target.value)}
                  placeholder="knowledge-api-key"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          </div>

          {/* 测试连接 */}
          <div className="pt-4 border-t border-gray-200">
            <button
              onClick={handleTest}
              disabled={testing || !isComplete}
              className="w-full px-4 py-3 bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-700 rounded-lg hover:from-purple-200 hover:to-indigo-200 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {testing ? (
                <>
                  <div className="w-5 h-5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                  <span>测试中...</span>
                </>
              ) : (
                <>
                  <span>测试连接</span>
                </>
              )}
            </button>
            {testResult && (
              <div className={`mt-3 p-3 rounded-lg flex items-center gap-2 ${
                testResult.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
              }`}>
                {testResult.success ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                <span className="text-sm">{testResult.message}</span>
              </div>
            )}
          </div>
        </div>

        {/* 底部 */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition"
            >
              取消
            </button>
            <button
              onClick={handleSave}
              disabled={!isComplete}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition flex items-center justify-center gap-2 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed"
            >
              <Save className="w-5 h-5" />
              <span>保存配置</span>
            </button>
          </div>
          {!isComplete && (
            <p className="text-xs text-orange-600 mt-2 text-center">
              请完善大模型和知识库配置
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
