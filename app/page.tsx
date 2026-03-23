'use client'

import { useState, useEffect } from 'react'
import FortuneHeader from '@/components/FortuneHeader'
import FortuneChat from '@/components/FortuneChat'
import LLMSettings from '@/components/LLMSettings'
import LocalKnowledgeUpload from '@/components/LocalKnowledgeUpload'
import { BackendConfig, loadBackendConfig, isConfigComplete } from '@/lib/config'
import { Document } from '@/lib/types'
import { loadDocuments } from '@/lib/storage'

export default function Home() {
  const [backendConfig, setBackendConfig] = useState<BackendConfig | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [isConfigured, setIsConfigured] = useState(false)
  const [documents, setDocuments] = useState<Document[]>([])
  const [vectorStoreUpdated, setVectorStoreUpdated] = useState(false)

  // 加载后端配置
  useEffect(() => {
    const config = loadBackendConfig()
    setBackendConfig(config)
    setIsConfigured(isConfigComplete(config))
  }, [])

  // 加载本地文档
  useEffect(() => {
    const docs = loadDocuments()
    setDocuments(docs)
  }, [])

  const handleConfigSave = (config: BackendConfig) => {
    setBackendConfig(config)
    setIsConfigured(isConfigComplete(config))
  }

  const handleVectorStoreUpdate = () => {
    setVectorStoreUpdated(true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      <FortuneHeader />

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左侧：知识库和配置 */}
          <div className="lg:col-span-1 space-y-6">
            <LLMSettings
              isOpen={showSettings}
              onClose={() => setShowSettings(false)}
              onConfigChange={handleConfigSave}
            />

            <LocalKnowledgeUpload
              documents={documents}
              onDocumentsChange={setDocuments}
              onVectorStoreUpdate={handleVectorStoreUpdate}
            />

            {/* 使用说明 */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-purple-200 p-6">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <span>📖</span>
                <span>使用说明</span>
              </h3>
              <ol className="text-sm text-gray-600 space-y-2 list-decimal list-inside">
                <li>配置大模型API（右上角设置）</li>
                <li>上传PDF、Word等知识库文档</li>
                <li>点击"加载到向量存储"</li>
                <li>在右侧聊天框中提问</li>
              </ol>
            </div>
          </div>

          {/* 右侧：聊天界面 */}
          <div className="lg:col-span-2">
            {!isConfigured ? (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-purple-200 p-12 text-center">
                <div className="relative mb-8">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full blur-2xl opacity-20 animate-pulse" />
                  <div className="relative w-32 h-32 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto">
                    <svg
                      className="w-16 h-16 text-purple-600 animate-glow"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-3">欢迎使用灵签</h2>
                <p className="text-gray-600 mb-6">基于传统易学与AI的智能占卜系统</p>
                <button
                  onClick={() => setShowSettings(true)}
                  className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full hover:from-purple-700 hover:to-indigo-700 transition shadow-lg hover:shadow-xl"
                >
                  <span>配置大模型</span>
                </button>
              </div>
            ) : (
              <FortuneChat backendConfig={backendConfig!} documents={documents} />
            )}
          </div>
        </div>
      </main>

      {/* 设置按钮 */}
      <button
        onClick={() => setShowSettings(true)}
        className="fixed top-4 right-4 z-40 p-3 bg-white rounded-full shadow-lg hover:shadow-xl transition-all border border-purple-200"
      >
        <svg
          className="w-6 h-6 text-purple-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
          />
        </svg>
      </button>

      {/* 页脚 */}
      <footer className="mt-12 text-center">
        <div className="flex items-center justify-center gap-2 text-sm text-purple-600">
          <span className="text-purple-400">✨</span>
          <span>灵签 - 基于传统易学与AI的智能占卜</span>
          <span className="text-purple-400">✨</span>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          仅供娱乐参考，请理性对待
        </p>
      </footer>
    </div>
  )
}
