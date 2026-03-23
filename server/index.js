require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const qaRoutes = require('./routes/qa');
const knowledgeRoutes = require('./routes/knowledge');

const app = express();
const PORT = process.env.PORT || 3001;

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

// 修复Railway部署问题：监听所有网络接口
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 服务器运行在 http://0.0.0.0:${PORT}`);
  console.log(`📡 外部访问地址: http://localhost:${PORT}`);
  
  // Railway健康检查信号
  process.on('SIGTERM', () => {
    console.log('收到SIGTERM信号，正在优雅关闭服务器...');
    server.close(() => {
      console.log('服务器已关闭');
      process.exit(0);
    });
  });
});

module.exports = app;
