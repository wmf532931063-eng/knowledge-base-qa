import { NextRequest, NextResponse } from 'next/server'
import { parseDocumentBuffer } from '@/lib/server-document-parser'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: '没有上传文件' }, { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const { title, content, type } = await parseDocumentBuffer(buffer, file.name, file.type)

    const document = {
      id: uuidv4(),
      title,
      content,
      uploadedAt: new Date().toISOString(),
      fileSize: file.size,
      type,
    }

    return NextResponse.json({ document })
  } catch (error) {
    console.error('上传文件失败:', error)
    return NextResponse.json(
      { error: '上传文件失败: ' + (error as Error).message },
      { status: 500 }
    )
  }
}
