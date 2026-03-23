import mammoth from 'mammoth'
import xlsx from 'xlsx'
import pdf from 'pdf-parse'

export async function parseDocumentBuffer(buffer: Buffer, fileName: string, fileType: string) {
  let content = ''

  if (fileType === 'application/pdf') {
    const data = await pdf(buffer)
    content = data.text
  } else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    const result = await mammoth.extractRawText({ buffer })
    content = result.value
  } else if (fileType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
    const workbook = xlsx.read(buffer, { type: 'buffer' })
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
    content = xlsx.utils.sheet_to_csv(firstSheet)
  } else if (fileType === 'text/plain') {
    content = buffer.toString('utf-8')
  } else if (fileType === 'text/markdown') {
    content = buffer.toString('utf-8')
  } else {
    throw new Error('不支持的文件类型')
  }

  return {
    title: fileName,
    content,
    type: fileType,
  }
}
