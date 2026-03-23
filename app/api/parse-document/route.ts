import { NextRequest, NextResponse } from 'next/server'
import { parseDocumentBuffer } from '@/lib/server-document-parser'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: '未提供文件' }, { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const result = await parseDocumentBuffer(buffer, file.name, file.type)

    return NextResponse.json(result)
  } catch (error) {
    console.error('文档解析失败:', error)
    return NextResponse.json(
      { error: '文档解析失败: ' + (error as Error).message },
      { status: 500 }
    )
  }
}
