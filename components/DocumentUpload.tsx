'use client'

import { useState, useCallback } from 'react'
import { Upload, FileText, Trash2, Loader2 } from 'lucide-react'
import { Document } from '@/lib/types'
import { addDocument, deleteDocument, resetVectorStore } from '@/lib/storage'
import { v4 as uuidv4 } from 'uuid'

interface DocumentUploadProps {
  documents: Document[]
  onDocumentsChange: (docs: Document[]) => void
}

export default function DocumentUpload({ documents, onDocumentsChange }: DocumentUploadProps) {
  const [uploading, setUploading] = useState(false)

  const handleFileUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return

      setUploading(true)

      try {
        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          throw new Error('上传失败')
        }

        const { document } = await response.json()

        const newDoc: Document = {
          ...document,
          id: uuidv4(),
          uploadedAt: new Date(document.uploadedAt),
        }

        addDocument(newDoc)
        resetVectorStore()

        onDocumentsChange([...documents, newDoc])
      } catch (error) {
        console.error('上传失败:', error)
        alert('上传失败，请重试')
      } finally {
        setUploading(false)
      }
    },
    [documents]
  )

  const handleDelete = useCallback(
    (id: string) => {
      deleteDocument(id)
      resetVectorStore()
      onDocumentsChange(documents.filter((doc) => doc.id !== id))
    },
    [documents]
  )

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-lg font-semibold mb-4">知识库文档</h2>

      <div className="mb-4">
        <label
          htmlFor="file-upload"
          className="flex items-center justify-center gap-2 px-4 py-6 border-2 border-dashed border-primary-300 rounded-lg cursor-pointer hover:border-primary-500 hover:bg-primary-50 transition"
        >
          {uploading ? (
            <Loader2 className="w-6 h-6 text-primary-600 animate-spin" />
          ) : (
            <Upload className="w-6 h-6 text-primary-600" />
          )}
          <span className="text-primary-600">
            {uploading ? '上传中...' : '点击上传文档'}
          </span>
        </label>
        <input
          id="file-upload"
          type="file"
          accept=".pdf,.docx,.xlsx,.txt,.md"
          onChange={handleFileUpload}
          className="hidden"
        />
        <p className="text-sm text-gray-500 mt-2">
          支持格式: PDF, DOCX, XLSX, TXT, MD
        </p>
      </div>

      {documents.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-700">已上传文档 ({documents.length})</h3>
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <FileText className="w-5 h-5 text-primary-600 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="font-medium truncate">{doc.title}</p>
                  <p className="text-sm text-gray-500">
                    {formatFileSize(doc.fileSize)} · {new Date(doc.uploadedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleDelete(doc.id)}
                className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
