'use client'

import { Sparkles, Heart, TrendingUp, Briefcase, Shield, Star } from 'lucide-react'

interface QuickQuestionsProps {
  onQuestion: (question: string) => void
}

const questions = [
  { icon: TrendingUp, label: '事业运势', question: '我近期的事业运势如何？' },
  { icon: Heart, label: '感情运势', question: '我的感情运势如何？' },
  { icon: Star, label: '今日运势', question: '请为我解读今日运势' },
  { icon: Briefcase, label: '财运分析', question: '我最近的财运如何？' },
  { icon: Shield, label: '健康提醒', question: '我的健康状况需要注意什么？' },
  { icon: Sparkles, label: '随机一签', question: '请为我求取一支签' },
]

export default function QuickQuestions({ onQuestion }: QuickQuestionsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
      {questions.map((item, index) => {
        const Icon = item.icon
        return (
          <button
            key={index}
            onClick={() => onQuestion(item.question)}
            className="flex flex-col items-center gap-2 p-4 bg-gradient-to-br from-white to-purple-50 rounded-xl border border-purple-200 hover:border-purple-400 hover:shadow-lg hover:shadow-purple-200/50 transition-all duration-300 group animate-float"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="p-3 rounded-full bg-purple-100 group-hover:bg-purple-200 transition-colors">
              <Icon className="w-6 h-6 text-purple-600" />
            </div>
            <span className="text-sm font-medium text-gray-700 group-hover:text-purple-700">
              {item.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}
