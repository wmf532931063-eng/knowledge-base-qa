const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const pdf = require('pdf-parse');
const Tesseract = require('tesseract.js');

/**
 * 解析知识库目录中的所有文档
 */
async function parseKnowledgeBase(knowledgeDir) {
  const documents = [];

  if (!fs.existsSync(knowledgeDir)) {
    console.warn(`⚠️ 知识库目录不存在: ${knowledgeDir}`);
    return documents;
  }

  const files = fs.readdirSync(knowledgeDir);

  for (const file of files) {
    const filePath = path.join(knowledgeDir, file);
    const ext = path.extname(file).toLowerCase();

    try {
      if (ext === '.md') {
        const content = fs.readFileSync(filePath, 'utf-8');
        const parsed = matter(content);
        const chunks = chunkByHeading(parsed.content, file);

        chunks.forEach((chunk, index) => {
          documents.push({
            id: `${file}-${index}`,
            source: file,
            title: parsed.data.title || file,
            content: chunk,
            metadata: { ...parsed.data, file, chunkIndex: index }
          });
        });

        console.log(`✅ 解析 Markdown: ${file} (${chunks.length} 个片段)`);
      } else if (ext === '.txt') {
        const content = fs.readFileSync(filePath, 'utf-8');
        const chunks = chunkByParagraph(content);

        chunks.forEach((chunk, index) => {
          documents.push({
            id: `${file}-${index}`,
            source: file,
            title: file,
            content: chunk,
            metadata: { file, chunkIndex: index }
          });
        });

        console.log(`✅ 解析 TXT: ${file} (${chunks.length} 个片段)`);
      } else if (ext === '.pdf') {
        console.log(`🔄 解析 PDF: ${file}...`);
        const pdfChunks = await parsePDF(filePath, file);
        
        pdfChunks.forEach((chunk, index) => {
          documents.push({
            id: `${file}-${index}`,
            source: file,
            title: chunk.title || file,
            content: chunk.content,
            metadata: { file, chunkIndex: index, page: chunk.page }
          });
        });

        console.log(`✅ 解析 PDF: ${file} (${pdfChunks.length} 个片段)`);
      }
    } catch (error) {
      console.error(`❌ 解析文件失败 ${file}:`, error.message);
    }
  }

  return documents;
}

/**
 * 解析 PDF 文件（支持OCR）
 */
async function parsePDF(filePath, filename) {
  const dataBuffer = fs.readFileSync(filePath);
  const data = await pdf(dataBuffer);
  
  let content = data.text;
  const pageCount = data.numpages;
  
  console.log(`   PDF 共 ${pageCount} 页，提取文本长度: ${content.length}`);

  // 如果文本内容太少（<500字符），说明是扫描版，需要OCR
  if (content.trim().length < 500) {
    console.log(`   检测到扫描版PDF，使用OCR识别文字...`);
    content = await performOCR(filePath, pageCount);
    console.log(`   OCR完成，识别文本长度: ${content.length}`);
  }

  // 按页面分段
  const chunks = [];
  const lines = content.split('\n');
  
  let currentChunk = { title: `第1页`, content: '', page: 1 };
  let currentPage = 1;
  
  for (const line of lines) {
    const pageMatch = line.match(/^第\s*(\d+)\s*页$/);
    if (pageMatch) {
      const newPage = parseInt(pageMatch[1]);
      if (newPage !== currentPage && currentChunk.content.trim()) {
        chunks.push({
          title: currentChunk.title,
          content: currentChunk.content.trim(),
          page: currentPage
        });
        currentChunk = { title: `第${newPage}页`, content: '', page: newPage };
        currentPage = newPage;
      }
      continue;
    }
    
    // 检测章节标题
    if (/^[A-Z][A-Z\s]{5,50}$/.test(line.trim()) || /^第[一二三四五六七八九十\d]+章/.test(line)) {
      if (currentChunk.content.trim()) {
        chunks.push({
          title: currentChunk.title,
          content: currentChunk.content.trim(),
          page: currentPage
        });
      }
      currentChunk = { title: line.trim(), content: '', page: currentPage };
    } else {
      currentChunk.content += line + '\n';
    }
  }

  if (currentChunk.content.trim()) {
    chunks.push(currentChunk);
  }

  if (chunks.length < 3) {
    return chunkByParagraph(content, 800);
  }

  return chunks;
}

/**
 * 使用OCR识别PDF中的文字
 */
async function performOCR(filePath, pageCount) {
  const worker = await Tesseract.createWorker('chi_sim+eng');
  
  let fullText = '';
  
  try {
    // 逐页OCR识别
    for (let page = 1; page <= Math.min(pageCount, 10); page++) { // 限制最多10页
      console.log(`   OCR进度: ${page}/${Math.min(pageCount, 10)} 页`);
      const result = await worker.recognize(filePath, { page });
      fullText += result.data.text + '\n\n';
    }
    
    // 如果超过10页，继续处理剩余页面但不打印进度
    if (pageCount > 10) {
      console.log(`   继续处理剩余 ${pageCount - 10} 页...`);
      const result = await worker.recognize(filePath);
      fullText = result.data.text;
    }
  } finally {
    await worker.terminate();
  }
  
  return fullText;
}

/**
 * 按标题分割 Markdown 文档
 */
function chunkByHeading(content, filename) {
  const lines = content.split('\n');
  const chunks = [];
  let currentChunk = [];
  let currentHeading = filename.replace('.md', '');

  for (const line of lines) {
    if (/^#{1,6}\s+/.test(line)) {
      if (currentChunk.length > 0) {
        chunks.push(currentChunk.join('\n').trim());
        currentChunk = [];
      }
      currentHeading = line.replace(/^#{1,6}\s+/, '').trim();
    }
    currentChunk.push(line);
  }

  if (currentChunk.length > 0) {
    chunks.push(currentChunk.join('\n').trim());
  }

  if (chunks.length <= 1) {
    return chunkByParagraph(content);
  }

  return chunks;
}

/**
 * 按段落分割文本
 */
function chunkByParagraph(content, maxLength = 800) {
  // 清理OCR产生的特殊标记
  let cleaned = content.replace(/--- page\d+_img\d+ ---/g, '\n\n');
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
  
  const paragraphs = cleaned.split(/\n\n+/);
  const chunks = [];
  let currentChunk = '';

  for (const paragraph of paragraphs) {
    const trimmed = paragraph.trim();
    if (!trimmed || trimmed.length < 5) continue; // 跳过太短的段落

    if (currentChunk.length + trimmed.length > maxLength && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      currentChunk = trimmed;
    } else {
      currentChunk += (currentChunk ? '\n\n' : '') + trimmed;
    }
  }

  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}

/**
 * 获取知识库文件列表
 */
function getKnowledgeFiles(knowledgeDir) {
  if (!fs.existsSync(knowledgeDir)) {
    return [];
  }

  return fs.readdirSync(knowledgeDir)
    .filter(file => ['.md', '.txt', '.pdf'].includes(path.extname(file).toLowerCase()))
    .map(file => {
      const filePath = path.join(knowledgeDir, file);
      const stats = fs.statSync(filePath);
      return {
        name: file,
        path: filePath,
        size: stats.size,
        modified: stats.mtime
      };
    });
}

module.exports = {
  parseKnowledgeBase,
  getKnowledgeFiles,
  chunkByParagraph
};
