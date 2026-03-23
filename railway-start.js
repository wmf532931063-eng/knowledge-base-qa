// Railway部署专用启动文件
// 这个文件专门处理Railway的部署需求

const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// 健康检查端点 - Railway需要这个
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// 根路径
app.get('/', (req, res) => {
  res.json({
    name: '知识库AI问答系统',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/health',
      qa: '/api/qa',
      knowledge: '/api/knowledge'
    }
  });
});

// 加载完整的API路由
try {
  const qaRoutes = require('./server/routes/qa');
  const knowledgeRoutes = require('./server/routes/knowledge');
  
  app.use('/api/qa', qaRoutes);
  app.use('/api/knowledge', knowledgeRoutes);
  console.log('✅ API路由加载成功');
} catch (error) {
  console.log('⚠️ 部分API路由加载失败:', error.message);
}

// 启动服务器 - 必须监听0.0.0.0
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log('🚀 服务器启动成功');
  console.log(`📡 监听地址: http://0.0.0.0:${PORT}`);
  console.log(`🔧 环境: ${process.env.NODE_ENV || 'development'}`);
  console.log(`⏰ 启动时间: ${new Date().toISOString()}`);
});

// 优雅关闭处理
process.on('SIGTERM', () => {
  console.log('收到SIGTERM信号，正在优雅关闭...');
  server.close(() => {
    console.log('服务器已关闭');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('收到SIGINT信号，正在关闭...');
  server.close(() => {
    process.exit(0);
  });
});

// 错误处理
process.on('uncaughtException', (error) => {
  console.error('未捕获的异常:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('未处理的Promise拒绝:', reason);
});
