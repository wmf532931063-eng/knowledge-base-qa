require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const qaRoutes = require('./routes/qa');
const knowledgeRoutes = require('./routes/knowledge');
const { validateEnvironment } = require('./config/envValidator');

const app = express();
const PORT = process.env.PORT || 3001;

// 服务器初始化函数
async function initializeServer() {
  console.log('🚀 服务器初始化开始...');
  
  // 1. 验证环境变量
  if (!validateEnvironment()) {
    console.error('❌ 环境变量验证失败，服务器启动中止');
    process.exit(1);
  }
  
  // 2. 检查知识库状态
  const vectorStorePath = path.join(__dirname, '../vector-store');
  console.log('📚 检查知识库状态...');
  
  if (!fs.existsSync(vectorStorePath) || fs.readdirSync(vectorStorePath).length === 0) {
    console.log('⚠️ 检测到知识库为空或未初始化');
    console.log('💡 系统启动后，请访问 /api/knowledge/rebuild 重建知识库');
  } else {
    console.log('✅ 知识库已初始化');
  }
  
  // 3. 测试大模型连接（异步，不阻塞启动）
  testLLMConnection().catch(error => {
    console.warn('⚠️ 大模型连接测试失败:', error.message);
    console.log('💡 系统将继续启动，但大模型功能可能受限');
  });
  
  console.log('✅ 服务器初始化完成');
}

// 测试大模型连接
async function testLLMConnection() {
  console.log('🔗 测试大模型连接...');
  const apiKey = process.env.NEXT_PUBLIC_LLM_API_KEY;
  const baseUrl = process.env.NEXT_PUBLIC_LLM_BASE_URL;
  
  if (!apiKey || apiKey.includes('your_')) {
    throw new Error('API密钥未正确配置');
  }
  
  // 简单的连接测试
  const testResponse = await fetch(baseUrl + '/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: process.env.NEXT_PUBLIC_LLM_MODEL || 'qwen-turbo',
      messages: [{ role: 'user', content: '测试连接' }],
      max_tokens: 10
    })
  });
  
  if (!testResponse.ok) {
    throw new Error(`API连接失败: ${testResponse.status}`);
  }
  
  console.log('✅ 大模型连接测试成功');
}

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../client/dist')));

// Railway健康检查端点
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    message: 'Server is healthy'
  });
});

// API 路由
app.use('/api/qa', qaRoutes);
app.use('/api/knowledge', knowledgeRoutes);

// 前端路由 - 返回 index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

// 启动服务器
async function startServer() {
  try {
    // 执行初始化
    await initializeServer();
    
    // 修复Railway部署问题：监听所有网络接口
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 服务器运行在 http://0.0.0.0:${PORT}`);
      console.log(`📡 外部访问地址: http://localhost:${PORT}`);
      
      // 输出健康检查地址
      console.log(`🏥 健康检查地址: http://localhost:${PORT}/api/qa/health`);
      
      // 输出系统状态
      console.log('📊 系统状态:');
      console.log('   ✅ 环境变量验证通过');
      console.log('   ✅ 服务器启动成功');
      console.log('   🔗 大模型连接测试中...');
      console.log('   📚 知识库状态: 待检查');
    });
    
    // Railway健康检查信号
    process.on('SIGTERM', () => {
      console.log('收到SIGTERM信号，正在优雅关闭服务器...');
      server.close(() => {
        console.log('服务器已关闭');
        process.exit(0);
      });
    });
    
    return server;
  } catch (error) {
    console.error('❌ 服务器启动失败:', error.message);
    process.exit(1);
  }
}

// 启动服务器
startServer();

module.exports = app;
