const express = require('express');
const router = express.Router();
const { similaritySearch } = require('../services/vectorStore');
const { generateAnswer } = require('../services/llmService');
const { processBirthDateQuestion, containsBirthDate } = require('../services/lunarService');

/**
 * POST /api/qa/ask
 * 问答接口
 */
router.post('/ask', async (req, res) => {
  try {
    const { question, topK = 5 } = req.body;

    if (!question) {
      return res.status(400).json({ error: '请提供问题' });
    }

    console.log(`🔍 用户问题: ${question}`);

    // 0. 检查并处理出生日期问题
    let processedQuestion = question;
    let lunarInfo = null;
    
    if (containsBirthDate(question)) {
      console.log(`📅 检测到出生日期问题，进行农历转换`);
      const processed = processBirthDateQuestion(question);
      processedQuestion = processed.processedQuestion;
      lunarInfo = processed.lunarInfo;
      
      console.log(`🌙 处理后的提问: ${processedQuestion.substring(0, 100)}...`);
    }

    // 1. 检索相关文档
    const relevantDocs = await similaritySearch(processedQuestion, topK);

    if (relevantDocs.length === 0) {
      return res.json({
        answer: '抱歉，知识库中未找到相关信息。请尝试添加更多文档到知识库。',
        sources: []
      });
    }

    // 2. 生成答案
    const context = relevantDocs.map(doc => doc.content).join('\n\n');
    const answer = await generateAnswer(processedQuestion, context);

    // 3. 提取来源
    const sources = [...new Set(relevantDocs.map(doc => doc.metadata?.source || '未知'))];

    console.log(`✅ 回答生成完成，来源: ${sources.join(', ')}`);

    res.json({
      answer,
      sources,
      relevantDocs: relevantDocs.slice(0, 3)
    });
  } catch (error) {
    console.error('❌ 问答错误:', error);
    res.status(500).json({ error: '处理问题时发生错误，请稍后重试' });
  }
});

/**
 * GET /api/qa/health
 * 健康检查
 */
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

module.exports = router;
