'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Loader2, Bot, User, ScrollText, Sparkles, BookOpen, Trash2, PlusCircle, RotateCcw } from 'lucide-react'
import { Message } from '@/lib/types'
import { BackendConfig } from '@/lib/config'
import CustomConfirmDialog from './CustomConfirmDialog'
import { useConfirmDialog } from '@/lib/hooks/useConfirmDialog'

interface FortuneChatWithDialogProps {
  backendConfig: BackendConfig
  documents: any[]
}

export default function FortuneChatWithDialog({ backendConfig, documents }: FortuneChatWithDialogProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const {
    isOpen,
    options,
    showConfirm,
    closeDialog,
    handleConfirm,
    handleCancel
  } = useConfirmDialog()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!input.trim() || loading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      const response = await fetch('/api/qa', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-llm-base-url': backendConfig.llmBaseUrl,
          'x-llm-api-key': backendConfig.llmApiKey,
          'x-llm-model': backendConfig.llmModel,
        },
        body: JSON.stringify({
          question: userMessage.content,
          documents,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || '占卜失败')
      }

      const result = await response.json()

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: result.answer,
        timestamp: new Date(),
        sources: result.sources,
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error('占卜失败:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: error instanceof Error ? error.message : '占卜失败，请重试',
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  const handleQuickQuestion = (question: string) => {
    setInput(question)
    setTimeout(() => {
      const formEvent = new Event('submit', { bubbles: true, cancelable: true }) as any
      handleSubmit(formEvent)
    }, 100)
  }

  const handleNewChat = async () => {
    const confirmed = await showConfirm({
      title: '开始新对话',
      message: '您确定要开始新的对话吗？当前对话记录将被清除。',
      confirmText: '开始新对话',
      cancelText: '取消',
      type: 'info'
    })

    if (confirmed) {
      setMessages([])
      setInput('')
    }
  }

  const handleClearHistory = async () => {
    const confirmed = await showConfirm({
      title: '清空历史记录',
      message: '您确定要清空所有历史记录吗？此操作不可撤销。',
      confirmText: '清空记录',
      cancelText: '取消',
      type: 'danger'
    })

    if (confirmed) {
      // 这里可以添加清除本地存储的逻辑
      setMessages([])
      setInput('')
    }
  }

  const handleResetToDefault = async () => {
    const confirmed = await showConfirm({
      title: '重置为默认问题',
      message: '您确定要重置为默认问题吗？当前输入框的内容将被替换。',
      confirmText: '重置',
      cancelText: '取消',
      type: 'warning'
    })

    if (confirmed) {
      setInput('请为我求取一支签')
    }
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-purple-200 p-6">
      {/* 对话管理工具栏 */}
      {messages.length > 0 && (
        <div className="mb-4 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            当前对话：{messages.length} 条消息
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleResetToDefault}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              重置问题
            </button>
            <button
              onClick={handleNewChat}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              新建对话
            </button>
            <button
              onClick={handleClearHistory}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              清空历史
            </button>
          </div>
        </div>
      )}

      {/* 聊天区域 */}
      <div className="h-[500px] overflow-y-auto mb-4 pr-2 space-y-6">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full blur-xl opacity-20 animate-pulse" />
              <div className="relative w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center">
                <ScrollText className="w-12 h-12 text-purple-600 animate-glow" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">欢迎来到灵签占卜</h3>
            <p className="text-gray-600 mb-4">点击下方按钮或输入您的问题</p>
            <QuickQuestions onQuestion={handleQuickQuestion} />
          </div>
        ) : (
          <div className="space-y-6">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`flex items-start gap-3 max-w-[85%] ${
                    msg.role === 'user' ? 'flex-row-reverse' : ''
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-br from-purple-600 to-indigo-600 text-white'
                        : 'bg-gradient-to-br from-purple-100 to-pink-100 text-purple-600'
                    }`}
                  >
                    {msg.role === 'user' ? <User className="w-6 h-6" /> : <Bot className="w-6 h-6" />}
                  </div>
                  <div
                    className={`rounded-2xl p-5 ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-br from-purple-600 to-indigo-600 text-white'
                        : 'bg-gradient-to-br from-white to-purple-50 border-2 border-purple-200'
                    }`}
                  >
                    <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                    {msg.sources && msg.sources.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-purple-200">
                        <div className="flex items-center gap-2 text-xs font-medium text-purple-600 mb-2">
                          <BookOpen className="w-4 h-4" />
                          <span>参考来源:</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {msg.sources.map((source, i) => (
                            <span
                              key={i}
                              className="inline-flex items-center gap-1 px-3 py-1 text-xs bg-purple-100 text-purple-700 rounded-full"
                            >
                              <Sparkles className="w-3 h-3" />
                              {source}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br from-purple-100 to-pink-100">
                    <Loader2 className="w-6 h-6 text-purple-600 animate-spin" />
                  </div>
                  <div className="bg-gradient-to-br from-white to-purple-50 rounded-2xl p-5 border-2 border-purple-200">
                    <div className="flex items-center gap-2 text-purple-600">
                      <Sparkles className="w-4 h-4 animate-pulse" />
                      <span className="text-sm">正在为您占卜中...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* 输入区域 */}
      <form onSubmit={handleSubmit} className="flex gap-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="输入您想询问的问题..."
          disabled={loading}
          className="flex-1 px-5 py-3 border-2 border-purple-200 rounded-xl focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-200 disabled:bg-gray-100 transition-all"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all flex items-center gap-2 shadow-lg hover:shadow-xl"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
          <span>求签</span>
        </button>
      </form>

      {/* 自定义确认弹窗 */}
      <CustomConfirmDialog
        isOpen={isOpen}
        onClose={closeDialog}
        onConfirm={handleConfirm}
        title={options.title}
        message={options.message}
        confirmText={options.confirmText}
        cancelText={options.cancelText}
        type={options.type}
      />
    </div>
  )
}

function QuickQuestions({ onQuestion }: { onQuestion: (question: string) => void }) {
  const questions = [
    { icon: '📈', label: '事业运势', question: '我近期的事业运势如何？' },
    { icon: '❤️', label: '感情运势', question: '我的感情运势如何？' },
    { icon: '⭐', label: '今日运势', question: '请为我解读今日运势' },
    { icon: '💰', label: '财运分析', question: '我最近的财运如何？' },
    { icon: '🛡️', label: '健康提醒', question: '我的健康状况需要注意什么？' },
    { icon: '🎲', label: '随机一签', question: '请为我求取一支签' },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {questions.map((item, index) => (
        <button
          key={index}
          onClick={() => onQuestion(item.question)}
          className="flex flex-col items-center gap-2 p-4 bg-gradient-to-br from-white to-purple-50 rounded-xl border border-purple-200 hover:border-purple-400 hover:shadow-lg hover:shadow-purple-200/50 transition-all duration-300 group animate-float"
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <span className="text-2xl">{item.icon}</span>
          <span className="text-sm font-medium text-gray-700 group-hover:text-purple-700">
            {item.label}
          </span>
        </button>
      ))}
    </div>
  )
}