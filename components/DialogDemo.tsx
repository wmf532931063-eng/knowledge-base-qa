'use client'

import { useState } from 'react'
import CustomConfirmDialog from './CustomConfirmDialog'
import { useConfirmDialog } from '@/lib/hooks/useConfirmDialog'

export default function DialogDemo() {
  const {
    isOpen,
    options,
    showConfirm,
    closeDialog,
    handleConfirm,
    handleCancel
  } = useConfirmDialog()

  const [demoResult, setDemoResult] = useState<string>('')

  const handleNewChatDemo = async () => {
    const confirmed = await showConfirm({
      title: '开始新对话',
      message: '您确定要开始新的对话吗？当前对话记录将被清除。',
      confirmText: '开始新对话',
      cancelText: '取消',
      type: 'info'
    })

    setDemoResult(confirmed ? '用户确认了开始新对话' : '用户取消了操作')
  }

  const handleClearHistoryDemo = async () => {
    const confirmed = await showConfirm({
      title: '清空历史记录',
      message: '您确定要清空所有历史记录吗？此操作不可撤销。',
      confirmText: '清空记录',
      cancelText: '取消',
      type: 'danger'
    })

    setDemoResult(confirmed ? '用户确认了清空历史记录' : '用户取消了操作')
  }

  const handleWarningDemo = async () => {
    const confirmed = await showConfirm({
      title: '警告操作',
      message: '这是一个警告类型的弹窗示例，用于需要用户特别注意的操作。',
      confirmText: '继续',
      cancelText: '取消',
      type: 'warning'
    })

    setDemoResult(confirmed ? '用户确认了警告操作' : '用户取消了操作')
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-lg font-semibold mb-4">自定义弹窗演示</h2>
      
      <div className="mb-6">
        <p className="text-gray-600 mb-4">
          这个演示展示了自定义弹窗的功能，完全替换了浏览器默认的confirm弹窗。
          弹窗支持不同类型的操作（信息、警告、危险），并提供统一的用户体验。
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <button
            onClick={handleNewChatDemo}
            className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            新建对话（信息类型）
          </button>
          
          <button
            onClick={handleClearHistoryDemo}
            className="px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            清空历史（危险类型）
          </button>
          
          <button
            onClick={handleWarningDemo}
            className="px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            警告操作（警告类型）
          </button>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-medium mb-2">弹窗特性：</h3>
          <ul className="text-gray-600 space-y-1">
            <li>✅ 完全替换浏览器默认confirm弹窗</li>
            <li>✅ 支持ESC键关闭</li>
            <li>✅ 点击背景关闭</li>
            <li>✅ 阻止背景滚动</li>
            <li>✅ 动画效果</li>
            <li>✅ 响应式设计</li>
            <li>✅ 类型安全的状态管理</li>
          </ul>
        </div>
        
        {demoResult && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-700 font-medium">操作结果：</p>
            <p className="text-green-600">{demoResult}</p>
          </div>
        )}
      </div>

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