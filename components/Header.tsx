'use client'

import { Brain } from 'lucide-react'

export default function Header() {
  return (
    <header className="bg-gradient-to-r from-primary-600 to-primary-800 text-white shadow-lg">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center gap-3">
          <Brain className="w-8 h-8" />
          <div>
            <h1 className="text-2xl font-bold">知识库问答AI</h1>
            <p className="text-primary-100 text-sm">基于语义搜索的智能问答系统</p>
          </div>
        </div>
      </div>
    </header>
  )
}
