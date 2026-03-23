'use client'

import { Sparkles } from 'lucide-react'

export default function FortuneHeader() {
  return (
    <header className="bg-gradient-to-r from-purple-900 via-purple-700 to-indigo-900 text-white shadow-lg relative overflow-hidden">
      {/* 背景装饰 */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 bg-yellow-400 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-purple-400 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="flex items-center justify-center gap-4 mb-2">
          <Sparkles className="w-10 h-10 text-yellow-400 animate-glow" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-200 via-yellow-100 to-yellow-200 bg-clip-text text-transparent">
            灵签
          </h1>
          <Sparkles className="w-10 h-10 text-yellow-400 animate-glow" />
        </div>
        <p className="text-center text-purple-100 text-lg">
          基于传统易学与AI的智能占卜系统
        </p>
        <p className="text-center text-purple-200 text-sm mt-2">
          点击下方图标开始您的运势探索
        </p>
      </div>
    </header>
  )
}
