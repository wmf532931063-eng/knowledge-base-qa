const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { parseKnowledgeBase, getKnowledgeFiles, chunkByParagraph } = require('../services/documentParser');
const { embedDocuments, clearKnowledgeBase, getStats, initializeVectorStore } = require('../services/vectorStore');

const KNOWLEDGE_DIR = path.join(__dirname, '../../knowledge-base');

/**
 * GET /api/knowledge/stats
 * 获取知识库统计信息
 */
router.get('/stats', async (req, res) => {
  try {
    await initializeVectorStore();
    const stats = await getStats();
    const files = getKnowledgeFiles(KNOWLEDGE_DIR);

    res.json({
      ...stats,
      files: files.map(f => ({
        name: f.name,
        size: f.size,
        modified: f.modified
      }))
    });
  } catch (error) {
    console.error('❌ 获取统计信息失败:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/knowledge/rebuild
 * 重建知识库索引
 */
router.post('/rebuild', async (req, res) => {
  try {
    console.log('🔄 开始重建知识库...');

    await clearKnowledgeBase();

    const documents = await parseKnowledgeBase(KNOWLEDGE_DIR);

    if (documents.length === 0) {
      return res.json({
        success: true,
        message: '知识库为空，请添加文档',
        documentCount: 0
      });
    }

    await embedDocuments(documents);

    console.log(`✅ 知识库重建完成，共 ${documents.length} 个文档片段`);

    res.json({
      success: true,
      message: `知识库重建成功，共索引 ${documents.length} 个文档片段`,
      documentCount: documents.length
    });
  } catch (error) {
    console.error('❌ 重建知识库失败:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/knowledge/text
 * 手动添加文本内容（适用于扫描版PDF）
 */
router.post('/text', async (req, res) => {
  try {
    const { title, content } = req.body;

    if (!content) {
      return res.status(400).json({ error: '请提供内容' });
    }

    console.log(`🔄 添加文本内容: ${title || '未命名'}`);

    // 将文本保存为Markdown文件
    const safeTitle = (title || 'manual-' + Date.now()).replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_');
    const fileName = `${safeTitle}.txt`;
    const filePath = path.join(KNOWLEDGE_DIR, fileName);

    fs.writeFileSync(filePath, content, 'utf-8');

    res.json({
      success: true,
      message: `文本已保存为 ${fileName}，请重建知识库`,
      fileName
    });
  } catch (error) {
    console.error('❌ 添加文本失败:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/knowledge/files
 * 获取知识库文件列表
 */
router.get('/files', (req, res) => {
  try {
    const files = getKnowledgeFiles(KNOWLEDGE_DIR);
    res.json(files);
  } catch (error) {
    console.error('❌ 获取文件列表失败:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/knowledge/file/:filename
 * 删除知识库文件
 */
router.delete('/file/:filename', (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(KNOWLEDGE_DIR, filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: '文件不存在' });
    }

    fs.unlinkSync(filePath);
    res.json({ success: true, message: `已删除 ${filename}` });
  } catch (error) {
    console.error('❌ 删除文件失败:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
