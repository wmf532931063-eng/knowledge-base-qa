'use client'

import { useState, useEffect } from 'react'
import { Key } from 'lucide-react'
import { saveApiKey, loadApiKey } from '@/lib/storage'

export default function ApiKeyInput({ onApiKeySet }: { onApiKeySet: (key: string) => void }) {
  const [apiKey, setApiKey] = useState('')
  const [showKey, setShowKey] = useState(false)

  useEffect(() => {
    const savedKey = loadApiKey()
    if (savedKey) {
      setApiKey(savedKey)
      onApiKeySet(savedKey)
    }
  }, [])

  const handleSave = () => {
    if (apiKey.trim()) {
      saveApiKey(apiKey.trim())
      onApiKeySet(apiKey.trim())
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Key className="w-5 h-5 text-primary-600" />
        <h2 className="text-lg font-semibold">OpenAI API密钥</h2>
      </div>
      <div className="flex gap-3">
        <input
          type={showKey ? 'text' : 'password'}
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="sk-..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        <button
          onClick={() => setShowKey(!showKey)}
          className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
        >
          {showKey ? '隐藏' : '显示'}
        </button>
        <button
          onClick={handleSave}
          className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
        >
          保存
        </button>
      </div>
      <p className="text-sm text-gray-500 mt-2">
        API密钥将存储在本地浏览器中，不会上传到服务器
      </p>
    </div>
  )
}
