const express = require('express');
const router = express.Router();
const { similaritySearch } = require('../services/vectorStore');
const enhancedLLMService = require('../services/enhancedLLMService');
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

    // 2. 生成答案（使用增强版服务）
    const context = relevantDocs.map(doc => doc.content).join('\n\n');
    const answer = await enhancedLLMService.generateAnswer(processedQuestion, context);

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
 * 增强版健康检查，包含系统状态
 */
router.get('/health', async (req, res) => {
  try {
    const healthData = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      server: {
        nodeVersion: process.version,
        platform: process.platform,
        uptime: process.uptime(),
        memoryUsage: {
          heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB',
          heapTotal: Math.round(process.memoryUsage().heapTotal / 4 / 1024) + 'MB'
        }
      },
      environment: {
        nodeEnv: process.env.NODE_ENV || 'development',
        port: process.env.PORT || 3001,
        apiKeyConfigured: !!(process.env.NEXT_PUBLIC_LLM_API_KEY && 
                            !process.env.NEXT_PUBLIC_LLM_API_KEY.includes('your_'))
      },
      stats: enhancedLLMService.getStats()
    };
    
    res.json(healthData);
  } catch (error) {
    console.error('❌ 健康检查失败:', error.message);
    res.status(500).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      message: '健康检查失败',
      error: error.message
    });
  }
});

/**
 * GET /api/qa/llm-status
 * 大模型连接状态检查
 */
router.get('/llm-status', async (req, res) => {
  try {
    console.log('🔍 检查大模型连接状态...');
    
    const testResults = await enhancedLLMService.testAllProviders();
    
    const overallStatus = testResults.some(result => result.status === 'connected') 
      ? 'healthy' 
      : testResults.some(result => result.status === 'failed') 
        ? 'degraded' 
        : 'unavailable';
    
    res.json({
      status: overallStatus,
      timestamp: new Date().toISOString(),
      providers: testResults,
      summary: {
        totalProviders: testResults.length,
        connectedProviders: testResults.filter(r => r.status === 'connected').length,
        failedProviders: testResults.filter(r => r.status === 'failed').length
      }
    });
  } catch (error) {
    console.error('❌ 大模型状态检查失败:', error.message);
    res.status(500).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      message: '大模型状态检查失败',
      error: error.message
    });
  }
});

module.exports = router;
