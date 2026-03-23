'use client'

import { useState, useEffect } from 'react'
import { Settings, Key, Eye, EyeOff, Save } from 'lucide-react'
import { saveApiKey, loadApiKey } from '@/lib/storage'
import { Document } from '@/lib/types'
import { parseDocument } from '@/lib/document-parser'
import { v4 as uuidv4 } from 'uuid'

interface SettingsPanelProps {
  apiKey: string
  onApiKeySet: (key: string) => void
}

export default function SettingsPanel({ apiKey, onApiKeySet }: SettingsPanelProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [inputKey, setInputKey] = useState('')
  const [showKey, setShowKey] = useState(false)
  const [uploaded, setUploaded] = useState(false)

  useEffect(() => {
    const savedKey = loadApiKey()
    if (savedKey) {
      setInputKey(savedKey)
    }
  }, [])

  const handleSaveKey = () => {
    if (inputKey.trim()) {
      saveApiKey(inputKey.trim())
      onApiKeySet(inputKey.trim())
      setIsOpen(false)
    }
  }

  const handleLoadFortuneDocs = async () => {
    try {
      const response = await fetch('/fortunes.txt')
      const text = await response.text()

      const document: Document = {
        id: uuidv4(),
        title: '占卜典籍集成',
        content: text,
        uploadedAt: new Date(),
        fileSize: new Blob([text]).size,
        type: 'text/plain',
      }

      const formData = new FormData()
      const file = new File([text], 'fortunes.txt', { type: 'text/plain' })
      formData.append('file', file)

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (uploadResponse.ok) {
        setUploaded(true)
        // 存储到本地
        const docs = JSON.parse(localStorage.getItem('kb_qa_documents') || '[]')
        docs.push({
          ...document,
          uploadedAt: document.uploadedAt.toISOString(),
        })
        localStorage.setItem('kb_qa_documents', JSON.stringify(docs))

        alert('占卜典籍已加载到知识库！')
      }
    } catch (error) {
      console.error('加载失败:', error)
      alert('加载失败，请重试')
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-4 right-4 z-50 p-3 bg-white rounded-full shadow-lg hover:shadow-xl transition-all border border-purple-200"
      >
        <Settings className="w-6 h-6 text-purple-600" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-800">设置</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <Settings className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* API密钥设置 */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-gray-700">
                <Key className="w-5 h-5" />
                <span className="font-medium">OpenAI API密钥</span>
              </div>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type={showKey ? 'text' : 'password'}
                    value={inputKey}
                    onChange={(e) => setInputKey(e.target.value)}
                    placeholder="sk-..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <button
                  onClick={() => setShowKey(!showKey)}
                  className="px-3 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  {showKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <p className="text-xs text-gray-500">
                API密钥将存储在本地浏览器中，不会上传到服务器
              </p>
            </div>

            {/* 加载知识库 */}
            <div className="space-y-3 pt-4 border-t border-gray-200">
              <h3 className="font-medium text-gray-700">知识库管理</h3>
              <button
                onClick={handleLoadFortuneDocs}
                disabled={uploaded}
                className="w-full px-4 py-3 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 rounded-lg hover:from-purple-200 hover:to-pink-200 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-5 h-5" />
                <span>{uploaded ? '已加载占卜典籍' : '加载占卜典籍到知识库'}</span>
              </button>
              <p className="text-xs text-gray-500">
                点击加载传统占卜典籍，包括易经、塔罗、六爻等内容
              </p>
            </div>

            {/* 保存按钮 */}
            <button
              onClick={handleSaveKey}
              className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              <span>保存设置</span>
            </button>
          </div>
        </div>
      )}
    </>
  )
}
