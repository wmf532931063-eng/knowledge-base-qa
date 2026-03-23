'use client'

import { useState, useCallback } from 'react'
import { Upload, FileText, Trash2, Loader2, CheckCircle2 } from 'lucide-react'
import { Document } from '@/lib/types'
import { addDocument, deleteDocument, loadDocuments } from '@/lib/storage'
import { v4 as uuidv4 } from 'uuid'

interface LocalKnowledgeUploadProps {
  documents: Document[]
  onDocumentsChange: (docs: Document[]) => void
  onVectorStoreUpdate: () => void
}

export default function LocalKnowledgeUpload({
  documents,
  onDocumentsChange,
  onVectorStoreUpdate,
}: LocalKnowledgeUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadedToVector, setUploadedToVector] = useState(false)

  const handleFileUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return

      // 检查文件类型
      const allowedTypes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain',
        'text/markdown',
      ]

      if (!allowedTypes.includes(file.type)) {
        alert('不支持的文件类型，请上传PDF、Word、Excel、TXT或Markdown文件')
        return
      }

      setUploading(true)

      try {
        // 通过 API 解析文件（在服务器端进行）
        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || '解析失败')
        }

        const { title, content, type } = await response.json()

        const newDoc: Document = {
          id: uuidv4(),
          title,
          content,
          uploadedAt: new Date(),
          fileSize: file.size,
          type,
        }

        // 保存到本地存储
        addDocument(newDoc)

        // 更新文档列表
        const allDocs = loadDocuments()
        onDocumentsChange(allDocs)

        // 重置向量存储标志
        setUploadedToVector(false)

        alert('文档上传成功！请点击"加载到向量存储"以使用')
      } catch (error) {
        console.error('上传失败:', error)
        alert('上传失败: ' + (error as Error).message)
      } finally {
        setUploading(false)
      }
    },
    [onDocumentsChange]
  )

  const handleDelete = useCallback(
    (id: string) => {
      deleteDocument(id)
      const allDocs = loadDocuments()
      onDocumentsChange(allDocs)
      setUploadedToVector(false)
    },
    [onDocumentsChange]
  )

  const handleLoadToVector = () => {
    // 向父组件发送更新向量存储的信号
    onVectorStoreUpdate()
    setUploadedToVector(true)
    alert('知识库已加载到向量存储，可以开始占卜了！')
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-purple-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <FileText className="w-6 h-6 text-purple-600" />
        <h2 className="text-lg font-semibold text-gray-800">本地知识库</h2>
      </div>

      <div className="mb-4">
        <label
          htmlFor="file-upload"
          className={`flex flex-col items-center justify-center gap-3 px-4 py-8 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
            uploading
              ? 'border-purple-300 bg-purple-50 cursor-not-allowed'
              : 'border-purple-300 hover:border-purple-500 hover:bg-purple-50'
          }`}
        >
          {uploading ? (
            <Loader2 className="w-10 h-10 text-purple-600 animate-spin" />
          ) : (
            <Upload className="w-10 h-10 text-purple-600" />
          )}
          <span className="text-purple-600 font-medium">
            {uploading ? '上传中...' : '点击上传知识库文档'}
          </span>
          <span className="text-sm text-gray-500">
            支持 PDF, Word, Excel, TXT, Markdown
          </span>
        </label>
        <input
          id="file-upload"
          type="file"
          accept=".pdf,.docx,.xlsx,.txt,.md"
          onChange={handleFileUpload}
          className="hidden"
          disabled={uploading}
        />
      </div>

      {documents.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-700">
              已上传文档 ({documents.length})
            </h3>
            <button
              onClick={handleLoadToVector}
              disabled={uploadedToVector}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed text-sm"
            >
              {uploadedToVector ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>已加载</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>加载到向量存储</span>
                </>
              )}
            </button>
          </div>

          {documents.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center justify-between p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl hover:shadow-md transition group"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 text-purple-600" />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-gray-800 truncate">{doc.title}</p>
                  <p className="text-sm text-gray-500">
                    {formatFileSize(doc.fileSize)} · {new Date(doc.uploadedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleDelete(doc.id)}
                className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition opacity-0 group-hover:opacity-100"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {documents.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-sm">还没有上传任何文档</p>
          <p className="text-xs mt-1">上传PDF、Word等文件作为占卜知识库</p>
        </div>
      )}
    </div>
  )
}
